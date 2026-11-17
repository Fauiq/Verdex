# Company Data Ingestion — Architecture Blueprint

_How Verdex earns a company's green credit score from real data, not typed-in
sliders — with every value carrying where it came from and how much to trust it._

This document operationalises **Phase 2 of the [product plan](PLAN.md) — "Real
data, less self‑reporting"** for the **company** score. It is a design blueprint,
not code: it defines the ingestion layer that sits in front of the existing
scoring engine, the provenance model that makes the result auditable, and a
phased, reliability‑first build order.

> **Why this is the real product, not plumbing.** Berg, Koelbel & Rigobon (2022)
> show that **~56% of the disagreement** between the six largest ESG raters comes
> from _measurement_ — not honest differences of opinion, but differing data of
> differing quality (see [RESEARCH.md](RESEARCH.md)). Verdex's whole thesis is
> "audit, not believe." A calculator with sliders cannot deliver that: the number
> a user types has no lineage. The ingestion layer is where the thesis becomes
> true — it turns "we compute a score" into "we compute a score you can trace to a
> metered kilowatt‑hour."

---

## 1. The core idea: the engine already takes clean inputs — so wrap it, don't rebuild it

The scoring engine (`src/lib/scoring/organization.ts`) is a **pure function**:

```
computeOrganization(inputs: OrgInputs): OrgResult
```

It has no idea where `OrgInputs` came from. Today those 20 fields are filled by a
person dragging sliders. The ingestion layer changes **only the origin of those
fields** — the engine stays untouched and pure (which keeps it testable, reusable
server‑side, and versionable, exactly as [PLAN.md §10](PLAN.md) intends).

The one addition is a **provenance wrapper** around the same shape:

```ts
// Every engine field, but carrying its lineage and trust.
type ProvenancedOrgInputs = {
  [K in keyof OrgInputs]: Provenanced<OrgInputs[K]>;
};

// The pipeline produces ProvenancedOrgInputs; a thin collapse() step extracts
// the plain OrgInputs the engine expects, AND derives the data-quality inputs
// (dataCompletenessPct, assurance, disclosure) from the provenance itself.
function collapse(p: ProvenancedOrgInputs): { inputs: OrgInputs; quality: DataQualityReport };
```

> **The manual calculator does not go away — it is demoted.** Every hand‑entered
> field simply becomes the **lowest‑trust source tier** (`self_reported`). The
> moment a connector or a first‑party document supplies the same field at higher
> quality, it supersedes the typed value. Nothing you have built is thrown away;
> the slider UI becomes one connector among many — the fallback, not the default.

---

## 2. Design principles

1. **Reliability = provenance, not just accuracy.** A value is only as
   trustworthy as its traceability. Every field the engine scores must link back
   through a chain of custody to an immutable raw record. No orphan numbers.
2. **First‑party over third‑party.** Prefer data the company _authorises_ Verdex
   to read (its cloud account, its utility feed, its own inventory workbook,
   assured by its own auditor) over data _scraped about_ the company. This is why
   Verdex ingests uploaded disclosures but does **not** depend on scraping public
   filing databases (see §4).
3. **Measurement quality feeds the score.** The provenance layer is not passive
   metadata — it drives `dataCompletenessPct`, `assurance` and `disclosure`, which
   the engine already rewards in the **Transparency & Governance** pillar. Better
   data measurably raises the score, so reliability is _incentivised_, not merely
   hoped for (§8).
4. **Estimate openly, flag loudly.** Where only estimated data exists
   (spend‑based, sector averages), keep it — but label it at its true quality
   level and let the score reflect the discount. Never launder an estimate into
   an apparent measurement.
5. **Nothing is overwritten.** Raw payloads and superseded values are append‑only.
   Reprocessing a corrected mapping must be possible without losing history.

---

## 3. What the engine needs: the 20 company inputs

For reference, `OrgInputs` (`src/lib/scoring/types.ts`) groups into five pillars.
The ingestion layer must produce all of them:

| Group | Fields |
| --- | --- |
| Identity | `name`, `sector`, `revenueMillionsUsd` |
| Carbon & energy | `scope1and2Tco2e`, `scope3Tco2e`, `renewableElectricityPct`, `emissionsTrendPct` |
| Digital & ICT | `dataCenterPue`, `carbonFreeEnergyPct`, `hardwareCircularityPct` |
| Resources | `wasteDivertedPct`, `recycledMaterialPct`, `waterIntensity` |
| Targets | `sbtStatus`, `scope3TargetCoveragePct`, `onTrackVsTrajectory` |
| Transparency | `disclosure`, `assurance`, `climateGovernance`, `dataCompletenessPct` |

`emissionsTrendPct` and `onTrackVsTrajectory` are **time‑series derived** — they
require the same metric across ≥2 periods, which is why the canonical store is
period‑dated (§6). `disclosure`, `assurance` and `dataCompletenessPct` are
**computed by the pipeline itself** from what was ingested (§8).

---

## 4. Source strategy: five trust tiers

Sources are organised by trust, which maps directly onto the **PCAF data‑quality
score** (1 = best … 5 = worst; see §7). This ordering is the reconciliation
backbone in §9. The three tiers you prioritised — automated connectors,
first‑party document upload, and vendor enrichment — are A, B and C.

| Tier | Source class | Examples | Typical method | PCAF DQ |
| --- | --- | --- | --- | --- |
| **A** | **Automated first‑party connectors (API)** | Cloud carbon tools (AWS Sustainability API, Google Cloud Carbon Footprint → BigQuery, Azure Emissions Impact Dashboard); carbon‑accounting platforms (Watershed, Persefoni, Normative); utility/energy provider APIs; IT‑asset management | measured / calculated | **2–3** (1 if the feed is assured) |
| **B** | **First‑party document upload + parse** | Company's own **GHG inventory workbook** (structured template), sustainability report PDF, **assurance letter**, utility bills, waste/water statements | reported | **2** (structured) → **3**; assurance letter lifts to **1** |
| **C** | **Vendor enrichment** | ESG / financial data vendors for `revenueMillionsUsd`, sector classification (GICS/NAICS), peer benchmarks, gap‑fill | third‑party estimated | **4–5** |
| **D** | **Spend‑based estimation (EEIOA)** | ERP / procurement spend export → emission factors for `scope3Tco2e` gap‑fill | economic‑activity estimated | **4–5** |
| **E** | **Manual self‑report (existing calculator)** | The current slider/select UI | self‑reported | **5** |

> **Deferred by design: third‑party filings scraping.** Pulling numbers out of
> public CDP/CSRD filing databases is intentionally _not_ a tier. It is the
> noisiest, least‑consented path (unstructured PDFs, stale, about the company
> rather than from it) and it undercuts the first‑party trust argument. One narrow
> exception is worth keeping as a **lightweight reference lookup, not a scrape**:
> the **SBTi target registry** is a structured, authoritative list that can
> confirm `sbtStatus` and `scope3TargetCoveragePct` — a targets check, not an
> emissions source. Treat even that as optional and always superseded by a
> first‑party target document.

---

## 5. Source‑to‑input map

Every engine field, its prioritised sources (highest‑trust first), and the
quality you can typically expect. This is the contract the connector framework
must satisfy.

| Engine field | Primary source (Tier) | Secondary / fallback | Typical DQ |
| --- | --- | --- | --- |
| `name` | Onboarding (E) | Vendor registry (C) | n/a |
| `sector` | Onboarding + GICS/NAICS classifier (C) | Self‑select (E) | n/a |
| `revenueMillionsUsd` | Financial data vendor (C) | Company upload (B) / self (E) | 2–4 |
| `scope1and2Tco2e` | Carbon platform API (A); utility/fuel connectors (A) | GHG inventory upload (B); EEIOA (D) | 2–3 |
| `scope3Tco2e` | Carbon platform API (A) | Inventory upload (B); **EEIOA spend‑based (D)** | 3–5 |
| `renewableElectricityPct` | Utility/REC connector (A); cloud CFE report (A) | Inventory / bill upload (B) | 2–3 |
| `emissionsTrendPct` | **Derived** from ≥2 periods of scope1&2 (A/B) | — | inherits source |
| `dataCenterPue` | Cloud provider report (A); DCIM connector (A) | Facilities upload (B) | 2–3 |
| `carbonFreeEnergyPct` | Cloud 24/7 CFE report (A) — Google/Azure/AWS | REC‑matching upload (B) | 2–3 |
| `hardwareCircularityPct` | IT‑asset‑management connector (A) | Procurement / e‑waste upload (B) | 3 |
| `wasteDivertedPct` | Waste‑hauler connector (A) | Facilities report upload (B) | 3 |
| `recycledMaterialPct` | Procurement / BOM connector (A) | Supplier declaration upload (B) | 3–4 |
| `waterIntensity` | Water‑utility connector (A) | Bill / facilities upload (B) | 3 |
| `sbtStatus` | First‑party target doc (B) | SBTi registry lookup (reference) | 1–2 |
| `scope3TargetCoveragePct` | Target doc / inventory (B) | SBTi registry (reference) | 2–3 |
| `onTrackVsTrajectory` | **Derived** from target vs actuals series (A/B) | — | inherits source |
| `disclosure` | **Computed** from the connected source set | — | n/a |
| `assurance` | Assurance letter upload (B) | Assured connector flag (A) | 1 |
| `climateGovernance` | Governance questionnaire / policy upload (B) | Self (E) | 3–4 |
| `dataCompletenessPct` | **Computed** by the pipeline from provenance | — | n/a |

Reading the map top to bottom shows the natural build clusters: a **cloud
connector** lights up four ICT/energy fields at once (and the ICT pillar is
Verdex's differentiator); a **carbon‑platform connector** covers the whole carbon
pillar in one integration; and a single **structured inventory upload** can seed
almost everything at Tier B before any integration exists — which is why it is
the beachhead in §10.

---

## 6. Pipeline architecture

Seven stages, from a credential to a scored, auditable result. Everything
downstream of EXTRACT is reproducible from the immutable raw store, so a mapping
fix re‑runs without re‑fetching from the source.

```
        ┌─ immutable, content-hashed raw store — stages 3-7 re-run from here ─┐
        │                                                                     │
 CONNECT ─▶ EXTRACT ─▶ MAP/NORMALISE ─▶ RECONCILE ─▶ ASSEMBLE ─▶ SCORE ─▶ AUDIT

   1          2             3               4            5          6        7
 creds &    pull        raw payload →    dedupe +     Measurement  pure    lineage +
 upload     raw         Measurement[]    conflict     → Provenan-  engine  data-
 intake     payloads    (unit, GHG       policy       cedInputs    @verdex quality
                        scope, GWP,      (§9) +       + derived &  /scoring report +
                        period)          review flag  meta fields  (unchgd) methodology
                                                                            version
```

1. **Connect** — a credential vault (OAuth tokens, API keys, scoped and
   revocable) plus an upload intake for documents. A **connector registry** lists
   what each connector can supply.
2. **Extract** — pull raw payloads (API responses, files) and write them to an
   **immutable, content‑hashed raw store**. Everything downstream is reproducible
   from here; a mapping fix re‑runs from stage 3 without re‑fetching.
3. **Map / Normalise** — connector‑specific adapters transform raw → canonical
   `Measurement[]`: unit conversion, GHG Protocol **scope classification**, GWP
   normalisation, period stamping. Each adapter is versioned.
4. **Reconcile** — when several sources report the same metric for the same
   period, apply the trust policy (§9): pick the winner, retain the rest as
   alternates, and flag material divergence for human review.
5. **Assemble** — roll reconciled measurements up into `ProvenancedOrgInputs`,
   and compute the derived fields (`emissionsTrendPct`, `onTrackVsTrajectory`) and
   the meta fields (`disclosure`, `assurance`, `dataCompletenessPct`).
6. **Score** — call the unchanged `@verdex/scoring` engine on the collapsed
   `OrgInputs`; attach the `DataQualityReport`.
7. **Audit** — persist the full lineage graph (input → measurements → raw payload)
   and stamp the result with a **methodology version**. This is the "audit, not
   believe" promise made literal: any figure on the score card expands to its
   source.

---

## 7. Canonical data model & provenance

Everything between extraction and scoring speaks one intermediate language: the
**Measurement**. Connectors never write engine fields directly — they emit
Measurements, which decouples "how a source represents data" from "what the engine
needs."

```ts
interface Measurement {
  metric: MetricKey;          // canonical, e.g. 'scope2_market_tco2e', 'electricity_kwh'
  value: number | string | boolean;
  unit: string;               // canonical unit
  periodStart: string;        // ISO date — enables trend & on-track derivations
  periodEnd: string;
  scope?: 1 | 2 | 3;          // GHG Protocol
  scope3Category?: number;    // 1–15 (GHG Protocol Scope 3)
  boundary?: string;          // org | facility | site
  provenance: Provenance;     // see below
  rawRef: string;             // pointer into the immutable raw store
  mappingVersion: string;
}

interface Provenance {
  source: SourceRef;          // connector id / document id / vendor
  method: 'measured' | 'calculated' | 'estimated' | 'default' | 'self_reported';
  pcafQuality: 1 | 2 | 3 | 4 | 5;   // anchored to the PCAF DQ hierarchy
  assured: 'none' | 'limited' | 'reasonable';
  asOf: string;               // date the value refers to
  ingestedAt: string;
  confidence: number;         // 0–1, derived from the above
}

type Provenanced<T> = { value: T; provenance: Provenance; alternates?: Measurement[] };
```

### The data‑quality anchor: PCAF DQ 1–5

Rather than invent a quality scale, Verdex adopts the **PCAF (Partnership for
Carbon Accounting Financials) data‑quality score**, the recognised standard for
scoring how good an emissions figure is. It is a natural fit and keeps Verdex's
"standards over invention" discipline.

| PCAF DQ | Definition | Verdex `method` | Confidence band |
| --- | --- | --- | --- |
| **1** (best) | Reported emissions, **verified** by an independent third party | measured + assured | 0.95–1.0 |
| **2** | Reported emissions, **not** verified | measured / reported | 0.8–0.95 |
| **3** | Calculated from **primary physical activity** data (e.g. energy consumed) | calculated | 0.6–0.8 |
| **4** | Estimated from **production/revenue** using sector averages | estimated | 0.35–0.6 |
| **5** (worst) | Estimated from **economic activity alone** (turnover/assets + proxy) | estimated / self_reported | 0.1–0.35 |

This single scale does triple duty: it ranks sources for **reconciliation** (§9),
it computes the score's **data‑quality inputs** (§8), and it is the number Verdex
**publishes next to the grade** so the score is honest about its own foundations.

---

## 8. Data quality drives the score (the incentive loop)

The elegant part: provenance is not a side‑car. Three engine inputs are computed
_from_ it, so connecting better data **raises the score** through the
Transparency & Governance pillar the engine already has.

- **`dataCompletenessPct`** = coverage‑weighted share of the engine's carbon/ICT
  fields sourced at **PCAF ≤ 3** (measured/calculated) versus estimated or
  self‑reported. A company on sliders alone scores low here; one on connected,
  metered data scores high.
- **`assurance`** = set from assurance evidence — an uploaded auditor's letter
  (Tier B) or an assured connector flag lifts it to `limited`/`reasonable`.
- **`disclosure`** = inferred from the connected source set (a CSRD/ESRS‑grade
  inventory upload → `csrd_esrs`; a CDP export → `cdp`; nothing but sliders →
  `none`/`voluntary`).

> **Why this matters commercially.** It makes reliability self‑reinforcing. The
> company that plugs in its cloud account and uploads its assured inventory is
> rewarded with both a _more defensible_ score and, typically, a _higher_ one on
> the transparency pillar — the exact behaviour Verdex wants to pull out of the
> market. It also closes the loop with Berg et al.: Verdex doesn't just complain
> that measurement drives ESG divergence, it prices measurement quality into the
> grade.

A guardrail: data quality moves the **transparency** pillar and the published
confidence — it must **not** silently inflate the _carbon_ pillars. A high‑quality
measurement of high emissions is still a bad emissions score. Quality changes how
much you trust the number, not what the number says.

---

## 9. Reconciliation: the trust core

When two sources disagree — the cloud tool and the carbon platform both report IT
Scope 2, or an upload contradicts a connector — silently picking one is exactly
the opaque behaviour Verdex exists to reject. The policy:

1. **Group** measurements by `(canonical field, period)`.
2. **Rank** candidates by, in order: **assurance** (reasonable > limited > none) →
   **PCAF quality** (1 → 5) → **recency** (`asOf`) → **source priority**.
3. **Winner** supplies the value; losers are retained as `alternates` in lineage
   (never discarded).
4. **Divergence check** — if the top two comparably‑ranked candidates differ by
   more than a threshold (e.g. **10%**), do **not** auto‑resolve: mark the field
   `needs_review`, hold it at reduced confidence, and route it to the review
   queue.
5. **Everything is logged** — the chosen value, the alternates, the rule that
   fired, and the reviewer's decision if any.

This makes conflict a first‑class, visible event rather than a hidden coin‑flip —
which is the difference between a score a CFO will defend and one they won't.

---

## 10. Phased build order (reliability‑first)

Sequenced so each step ships trust on its own and de‑risks the next. This is the
concrete expansion of **PLAN.md Phase 2**.

**Step 1 — Provenance core + structured first‑party upload (the beachhead).**
Build the Measurement model, the provenance/PCAF layer, the assemble→score→lineage
path, and **one connector: a structured GHG‑inventory upload** (an XLSX/CSV
template the company fills from its own inventory). Requires zero partnerships,
works for any company on day one, and immediately beats sliders on trust. _Signal:
a score whose every field expands to a cited source row._

**Step 2 — Cloud carbon connectors.** AWS **Sustainability API** first (it now
includes Scope 3, ~1‑month lag), then Google Cloud Carbon Footprint (BigQuery
export) and Azure Emissions Impact Dashboard. Automated, high‑trust, and it lights
up the **digital/ICT pillar** — Verdex's differentiator — from real usage.
_Signal: the ICT pillar sourced entirely from metered cloud data._

**Step 3 — Carbon‑platform + utility connectors, and turn on reconciliation.**
Watershed / Persefoni / Normative for full inventories; utility/energy APIs for
electricity, renewable %, water. Now that sources overlap, the reconciliation
service (§9) and the review queue earn their place. _Signal: a majority of a
typical footprint sourced from verified feeds — PLAN.md's own Phase‑2 success
signal._

**Step 4 — Vendor enrichment + spend‑based estimation.** ESG/financial vendors for
`revenueMillionsUsd`, sector classification and peer benchmarks; EEIOA spend‑based
estimation to gap‑fill `scope3Tco2e` — always flagged Tier C/D. _Signal: no field
left empty, every estimate labelled._

**Step 5 — Assurance workflow + API/export.** Auditor sign‑off in the review
queue; expose the scored, provenanced result via the public API and CSRD/SFDR
export packs. This is the on‑ramp to **PLAN.md Phase 4**.

---

## 11. How it changes this repo

The blueprint respects the "engine as a package" target already in
[PLAN.md §10](PLAN.md):

- **Extract the engine** to `packages/scoring` and publish **`@verdex/scoring`** —
  unchanged, pure, versioned. The app and the pipeline both consume it.
- **New `packages/ingestion`** (or a service): the connector framework, canonical
  `Measurement` schema, mapping registry, reconciliation, and provenance service.
- **Persistence (Postgres)** — new tables: `raw_payloads` (immutable),
  `measurements`, `field_bindings` (measurement → engine field), `sources`,
  `review_items`, and `score_runs` (each stamped with `methodologyVersion`).
- **Connector/ETL workers** — queue‑driven, one worker per connector kind, exactly
  the "connector/ETL workers" named in PLAN.md §10.
- **The existing org calculator becomes the `manual` connector** (Tier E) — it
  emits `self_reported` Measurements like any other source. No UI is thrown away.
- **Optional, backward‑compatible engine touch:** let `computeOrganization` accept
  an optional confidence map and surface per‑indicator confidence in
  `IndicatorResult`, so the transparency table can show a quality dot next to each
  row. The engine stays pure; the field is additive.

```ts
// The pluggable connector contract every source implements.
interface Connector {
  id: string;
  kind: 'api' | 'upload' | 'vendor' | 'manual';
  supplies: MetricKey[];                       // for the registry & coverage map
  authenticate?(ctx: AuthContext): Promise<Credential>;
  extract(ctx: RunContext): Promise<RawPayload[]>;
  map(raw: RawPayload): Measurement[];         // raw → canonical, with provenance
}
```

---

## 12. Trust, privacy & governance

- **Immutable raw store** — the substrate of "audit, not believe," and what makes
  a corrected mapping reproducible.
- **Versioned mappings + methodology stamp** — every score records the engine
  version and the mapping versions that produced it (PLAN.md §10 model
  governance).
- **Consent & data minimisation** — first‑party connectors use scoped, revocable
  credentials; store only what a field needs; support deletion (PLAN.md §11).
- **Human‑in‑the‑loop** — low confidence, material divergence, and assurance
  sign‑off route to a review queue; people resolve edge cases, the system logs the
  decision.
- **Published data‑quality** — the PCAF score rides alongside the grade, so the
  score is transparent about its own reliability, not just the company's.

---

## 13. Open decisions

- **Cloud connector order** — AWS first (Scope 3 now included) vs. whichever cloud
  your first design‑partner actually uses.
- **Reconciliation threshold** — is 10% divergence the right review trigger, and
  should it vary by pillar (carbon tighter than resources)?
- **EEIOA factor set** — which spend‑based factor library (and its licence) backs
  Tier D estimation?
- **Vendor dependence** — how much Tier C enrichment is acceptable before it dents
  the transparency positioning? Suggest: enrichment for identity/benchmark fields
  only, never as the primary emissions source.
- **Assurance UX** — auditor letter upload vs. a formal assurer portal for Step 5.

---

## 14. References

Existing Verdex foundations (see [RESEARCH.md](RESEARCH.md)):

- Berg, F., Koelbel, J. F., & Rigobon, R. (2022). _Aggregate Confusion: The
  Divergence of ESG Ratings._ Review of Finance 26(6).
  <https://doi.org/10.1093/rof/rfac033>
- Greenhouse Gas Protocol (2011). _Corporate Value Chain (Scope 3) Standard._
  <https://ghgprotocol.org/corporate-value-chain-scope-3-standard>
- Science Based Targets initiative — target registry & Scope 3 thresholds.
  <https://sciencebasedtargets.org/>

New anchors introduced by this blueprint:

- Partnership for Carbon Accounting Financials (PCAF) — _data‑quality score
  (DQ 1–5)_, the standard for scoring emissions‑data quality.
  <https://carbonaccountingfinancials.com/en/standard>
- AWS — _Customer Carbon Footprint Tool_ (Sustainability API / Data Exports;
  Scope 3 included from Oct 2025).
  <https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/ccft-overview.html>
- Google Cloud — _Carbon Footprint_ (BigQuery export).
  <https://cloud.google.com/carbon-footprint>
- Microsoft — _Emissions Impact Dashboard for Azure_ (overview; also exposes a
  Sustainability Manager import connector).
  <https://learn.microsoft.com/en-us/industry/well-architected/sustainability/emissions-impact-dashboard-overview>
- Carbon‑accounting platforms with programmatic access: Watershed, Persefoni,
  Normative.

---

_This is an architecture blueprint for Phase 2 of Verdex. It changes where the
engine's inputs come from and how far you can trust them; it does not change the
methodology, which remains documented at `/methodology` and in
[PLAN.md](PLAN.md)._
