# Verdex — Product Plan

_A green credit score for people and companies, built on peer‑reviewed evidence._

This document turns a raw idea — “compute a green credit score to classify
individuals and organisations by how green they are, and unlock benefits from it”
— into a concrete, staged plan. It is grounded in the research summarised in
[`RESEARCH.md`](RESEARCH.md); the working demonstrator in this repository is
**Phase 0**.

> **A note on timelines.** This plan is deliberately phrased in **phases and
> technical scope**, not calendar dates. Each phase lists the components that
> must change, the dependencies, and the signal that tells you it is done.

---

## 1. Executive summary

- **What:** A SaaS platform that computes a transparent “green credit score”
  (0–100 internally, shown on a familiar **300–850** scale with **A+ → D** bands)
  for both **individuals** and **organisations**, and connects that score to a
  layer of **benefits and eligibility**.
- **Why it can work:** Sustainability scores today are opaque and contradictory —
  the six largest ESG raters correlate only ~0.54 (Berg et al., 2022). Regulation
  (EU **CSRD** brings ~49,000 companies into mandatory reporting) and consumer
  interest are creating demand for **comparable, trustworthy** scores.
- **The wedge:** Radical transparency + a **dedicated digital/ICT‑carbon pillar**
  (the fastest‑growing, least‑measured footprint) + a **dual** people‑and‑companies
  model that most incumbents don’t offer.
- **Phase 0 (this repo):** a working, inspectable score with a documented,
  standards‑based methodology and unit tests.

---

## 2. The problem & why now

### The scoring problem

- **Divergence.** ESG ratings from major agencies correlate ~0.54 on average vs
  0.92 for credit ratings; **measurement** explains ~56% of the disagreement,
  **scope** ~38%, **weights** ~6% (Berg, Koelbel & Rigobon, 2022). A “rater
  effect” means an agency’s overall view of a firm bleeds into individual metrics.
- **Opacity & greenwashing.** Methodologies are black boxes, making scores hard to
  trust or contest. The EU is responding with the **Green Claims Directive** and a
  sustainable‑finance framework (**CSRD**, **SFDR**, **EU Taxonomy**).
- **Personal footprints are inconsistent too.** Online carbon calculators can give
  wildly different results for the same person because there is no standard and
  little documentation (Birnik, 2013).

### Why now

- **Regulatory pull:** CSRD/ESRS mandatory reporting (~49,000 companies), SFDR
  disclosure for financial products, EU Taxonomy alignment reporting.
- **Corporate pull:** SBTi target‑setting and Scope 3 accountability are now
  mainstream; buyers and investors demand comparable data.
- **Consumer pull:** Personal Carbon Trading and voluntary “inclusive carbon
  credit” schemes (notably in China) show appetite for rewarding low‑carbon
  behaviour (PLOS Sustainability & Transformation, 2023).
- **Evidence it moves the needle:** China’s Green Credit Guidelines cut emissions
  in treated firms by ~13–19% (difference‑in‑differences studies), i.e. tying
  **credit to green performance changes behaviour**.

---

## 3. Vision & product thesis

> **Make “how green are you?” a question with a single, honest, comparable answer —
> and make a good answer worth something.**

Three product bets:

1. **Transparency is the moat.** We expose scope, measurement and weight for every
   metric. Trust — not proprietary secrecy — is the durable advantage.
2. **One method, two subjects.** The same normalise‑weight‑aggregate spine scores
   both people and companies, which lets value chains connect (a consumer’s score
   can reflect the companies they buy from; a company’s Scope 3 reflects its
   customers).
3. **Score → consequence.** A score only matters if it unlocks something:
   benefits, eligibility, benchmarking, or capital.

---

## 4. Market & demand drivers

| Segment | Driver | What they buy |
| --- | --- | --- |
| Large enterprises | CSRD/ESRS, investor pressure, SBTi | Scored inventory, benchmarking, disclosure export |
| SMEs (in value chains) | Customer/supplier requirements | Low‑lift screening score + improvement plan |
| Financial institutions | SFDR, financed‑emissions risk | Portfolio/counterparty green scores via API |
| Consumers | Values, cost savings, rewards | Free personal score + rewards/perks |
| Program partners (retailers, insurers, employers, tourism, municipalities) | Engagement, differentiation, ESG goals | Score‑gated perks and cohort programs |

The initial commercial wedge is **B2B2C**: sell the company score + API to
enterprises and financial institutions, offer the personal score free to build a
consumer graph and partner network.

---

## 5. Users & personas

- **Priya — sustainability lead, mid‑size tech company.** Needs a defensible score
  and a clear list of what to fix, plus an export for CSRD.
- **Marco — procurement manager.** Needs to screen hundreds of suppliers quickly
  and consistently.
- **Dana — retail bank ESG analyst.** Needs counterparty scores via API with an
  audit trail.
- **Sam — climate‑curious consumer.** Wants to know their footprint, how they
  compare, and what to change — and to earn perks for improving.

---

## 6. Product scope

### 6.1 Personal green credit score (built in Phase 0)

- Consumption‑based footprint across **mobility, home energy, goods, digital**,
  using documented factors. **Diet is intentionally excluded** — a personal
  choice a green credit score should not moralise; benchmarks are taken net of
  food (~20%, Ivanova et al. 2016) so the comparison stays like‑for‑like.
- Scored against the **1.5 °C fair share** (net of food) via monotonic
  anchors pinned to real benchmarks.
- **Level (80%) + trajectory (20%)** composite; offsets capped so they can’t buy
  a top grade (mitigation hierarchy).
- Personalised **hotspots** and highest‑leverage actions with estimated savings.

### 6.2 Company green credit score (built in Phase 0)

- Five **sector‑weighted** pillars (carbon, digital/ICT, resources, targets,
  transparency), each built from normalised indicators.
- **Partly non‑compensatory** aggregation (weighted geometric mean across
  pillars).
- Full **indicator transparency** table: raw → normalised → weight → contribution.
- Priority actions ranked by their drag on the composite.

### 6.3 Benefits & eligibility layer (Phase 3+)

The original idea — “a higher score unlocks access/benefits” — becomes an **opt‑in
rewards and eligibility layer**:

- **Consumer:** partner perks (discounts, priority, recognition) tied to bands, in
  the spirit of voluntary Personal Carbon Trading / inclusive carbon credits.
- **Company:** eligibility signals for green procurement, preferential financing,
  and marketplace placement.

> **Ethics guardrail (important).** The raw idea included gating access to things
> like nature/trekking by score. Gating **public or essential goods** by an
> environmental score is regressive and risks punishing lower‑income people who
> already have small footprints. Verdex’s design principle: rewards are **opt‑in
> perks and incentives**, never gates on essential services or public goods, and
> the model must account for a **fair consumption space** (a social floor as well
> as an ecological ceiling; Hot or Cool, 2021). See §11.

---

## 7. Scoring methodology (summary)

Full, live documentation is at `/methodology`. In brief, following the OECD/JRC
composite‑indicator handbook (2008):

1. **Measure** — activity → emissions with documented factors; companies use GHG
   Protocol Scope 1/2/3.
2. **Normalise** — every indicator to 0–100 against real‑world anchors, with
   direction made explicit (a common source of ESG “scope” error).
3. **Weight** — by materiality (sector presets for companies; level‑vs‑trajectory
   for individuals).
4. **Aggregate** — linear within a pillar; **geometric** across pillars to limit
   compensability.
5. **Grade** — project to 300–850 with five bands.

Design principles: transparency over convenience; standards over invention;
honesty about uncertainty.

---

## 8. Data strategy

The single biggest quality lever (measurement drives ~56% of rating disagreement)
is **better data with less self‑reporting**:

1. **Self‑report (Phase 0–1):** sliders/selects; fast but coarse.
2. **Connected data (Phase 2):**
   - Individuals: bank/transaction import + **EEIOA** spend‑based estimation
     (Svalna‑style), utility/travel/smart‑meter connectors.
   - Companies: ingestion from **CDP/CSRD** filings, cloud‑provider carbon exports,
     and supplier questionnaires.
3. **Verification (Phase 4):** third‑party assurance workflow, audit trail, and a
   **data‑quality score** that rewards measured over estimated inputs.

---

## 9. Milestones / roadmap

Each phase lists **goal → key deliverables → dependencies → success signal**.
(Also rendered visually at `/roadmap`.)

### Phase 0 — Foundation & method ✅ (this repository)

- **Goal:** prove a transparent, research‑grounded dual score is buildable.
- **Deliverables:** dual scoring engine + tests; cited factors/weights; live
  calculators, methodology, research and roadmap pages.
- **Dependencies:** none.
- **Success signal:** a working, inspectable score with every input, weight and
  source shown.

### Phase 1 — Trustworthy MVP

- **Goal:** a product people return to and can share.
- **Deliverables:** accounts + saved profiles; year‑over‑year tracking; shareable
  score cards; **uncertainty ranges**; expanded country/grid factor coverage.
- **Components to change:** add auth + persistence (e.g. Postgres + an auth
  provider); introduce a results‑history model; extend `constants.ts` factor
  libraries; add OG image generation for shareable cards.
- **Dependencies:** Phase 0 engine.
- **Success signal:** repeat usage and measurable reductions among active users.

### Phase 2 — Real data, less self‑reporting

- **Goal:** cut input burden and error with primary data.
- **Deliverables:** bank/transaction import + EEIOA estimation; utility/travel
  connectors; company ingestion from CDP/CSRD and cloud carbon exports;
  data‑quality scoring.
- **Components to change:** connector/ETL service; an emission‑factor + EEIOA
  dataset service; mapping layer from transactions/filings to the engine inputs.
- **Dependencies:** Phase 1 accounts; provider API access & credentials.
- **Risks:** data‑access agreements, privacy (see §11); factor licensing.
- **Success signal:** majority of a typical footprint derived from verified data.

### Phase 3 — Benchmarking & incentives

- **Goal:** make the score valuable via peers and rewards.
- **Deliverables:** sector/cohort percentile benchmarking; rewards & access layer
  (partner perks by band); employer/community programs.
- **Components to change:** anonymised benchmarking datastore; partner console;
  entitlements/eligibility service.
- **Dependencies:** a population of scored users/companies (Phases 1–2).
- **Success signal:** partners issuing benefits against Verdex bands.

### Phase 4 — Assurance, API & compliance

- **Goal:** dependable enough for procurement, finance and reporting.
- **Deliverables:** assurance workflow + audit trail; public scoring **API** and
  embeddable widgets; **CSRD/ESRS** and **SFDR** export packs; **model
  governance** (versioned methodology, sensitivity analysis, change logs).
- **Components to change:** external API + auth/rate limiting; report generators;
  methodology versioning and reproducibility.
- **Dependencies:** stable methodology; verified data (Phase 2).
- **Success signal:** first assured scores used in supplier/lending decisions.

### Phase 5 — Scale & ecosystem

- **Goal:** shared infrastructure for green creditworthiness.
- **Deliverables:** multi‑region factor libraries + localisation; a marketplace
  for verified reductions/offsets (post‑reduction only); **open methodology
  governance** with external advisory review.
- **Success signal:** independent adoption of the taxonomy and score by partners.

---

## 10. Architecture & technical plan

**Current (Phase 0):** Next.js 16 App Router, React 19, TypeScript, Tailwind v4,
shadcn/ui; a pure, tested TypeScript scoring engine; SVG data‑viz; fully static,
browser‑side compute; no backend.

**Target (Phase 1+):**

- **Engine as a package** — publish `@verdex/scoring` for reuse in the app, API
  and batch jobs; keep it pure and versioned.
- **Persistence** — Postgres (profiles, results history, benchmarks); object
  storage for report exports.
- **Auth** — hosted auth provider; org/team accounts with RBAC.
- **API** — typed HTTP API around the engine; API keys, rate limits, audit log.
- **Data services** — factor/EEIOA dataset service; connector/ETL workers.
- **Model governance** — every score stamped with a methodology version; automated
  sensitivity/uncertainty analysis in CI; changelog.

---

## 11. Trust, ethics & governance

- **Fairness / anti‑regression.** Enforce a **fair consumption space**: don’t
  penalise people below a decent living standard, and never gate essential or
  public goods by score. Rewards are opt‑in perks, not gates.
- **Privacy.** Transaction/utility data is sensitive; require explicit consent,
  data minimisation, encryption, and easy deletion. Personal scores stay under
  user control.
- **Anti‑greenwashing.** Reward **measured** data and **assurance**; make offsets
  count only after reduction; publish weights so they can be challenged.
- **Methodology governance.** Versioned, documented, and eventually externally
  reviewed — the composite‑indicator literature’s core recommendation.
- **Equity of factors.** Regional grids/behaviour vary; expand localised factors
  to avoid systematically mis‑scoring the global South.

---

## 12. Business model

- **Free consumer tier** — personal score + rewards (drives the network and data).
- **Company self‑serve** — subscription for scoring, benchmarking, improvement
  plans and exports.
- **Enterprise & API** — usage‑based API for supplier/portfolio scoring; assurance
  and CSRD/SFDR packs as add‑ons.
- **Partner/marketplace** — revenue share on score‑linked perks and verified
  reductions (later phases).

## 13. Go‑to‑market

1. Land the **company score + API** with sustainability and procurement teams and
   ESG‑minded financial institutions (regulation is the forcing function).
2. Use the **free personal score** for reach, content and partner recruitment.
3. Expand into **benchmarking** and **rewards** once enough entities are scored.

---

## 14. Key risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Methodology disputed | Full transparency; versioning; external advisory board |
| Poor input data | Connected data + data‑quality scoring + uncertainty ranges |
| Greenwashing / gaming | Non‑compensatory aggregation; assurance; offset caps |
| Regressive/unfair gating | Fair consumption space; opt‑in perks only; localised factors |
| Privacy/regulatory | Consent, minimisation, encryption, deletion; legal review |
| Factor/data licensing | Use open datasets where possible; license where needed |
| Trust/brand | Independent positioning; cite everything; publish limitations |

---

## 15. Success metrics (by phase)

- **P0:** working, inspectable score; tests green; methodology fully documented.
- **P1:** activation, retention, and observed footprint reductions.
- **P2:** share of footprint from verified vs self‑reported data.
- **P3:** number of partners issuing benefits; benchmark coverage.
- **P4:** assured scores in real procurement/lending decisions; API adoption.
- **P5:** independent/third‑party adoption of the taxonomy.

---

## 16. Open questions

- Which region/factor library to prioritise first (EU‑first vs global)?
- Company data: filings‑first (breadth) or connectors‑first (depth)?
- Rewards layer: build the partner network directly, or integrate with existing
  loyalty/PCT platforms?
- How prescriptive should sector weights be vs user‑adjustable (with guardrails)?

---

## 17. References

See [`RESEARCH.md`](RESEARCH.md) for the annotated bibliography and the specific
findings each source contributes, and `/research` in the app for links.
