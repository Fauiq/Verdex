# Verdex — the transparent green credit score

Verdex turns peer‑reviewed carbon accounting into a single, legible **green credit
score** for **people** and **companies** — with every input, weight and source
shown in the open. It is a working demonstrator of a SaaS product idea:
_computing a green credit score to classify individuals and organisations by how
“green” they are, and connecting that score to real‑world benefits._

> **Why this exists.** The average correlation between the six largest ESG ratings
> is only ~0.54 (vs 0.92 for credit ratings), and most of that disagreement comes
> from _how the data is measured_, not honest differences of opinion
> (Berg, Koelbel & Rigobon, 2022). Verdex’s answer is radical transparency: a
> score you can audit, not just believe.

This repository contains:

- A **dual scoring engine** (individuals + organisations) written as pure,
  unit‑tested TypeScript, calibrated to public standards and academic literature.
- A **Next.js web app** with live calculators, a full methodology page, an
  annotated research bibliography, and a product roadmap.
- The **product plan** in [`docs/PLAN.md`](docs/PLAN.md) and the annotated
  **research foundations** in [`docs/RESEARCH.md`](docs/RESEARCH.md).
- The **challenge mitigation and delivery plan** in
  [`docs/CHALLENGES.md`](docs/CHALLENGES.md), covering evidence quality, model
  validation, fairness, uncertainty, security, and pilot release criteria.

---

## What it does

### Personal green credit score

Estimates a consumption‑based annual carbon footprint across four domains —
mobility, home energy, goods & services, and **digital** — and scores it
against the per‑capita **1.5 °C fair share** (net of food). It highlights
your hotspots and the highest‑leverage changes, and includes a forward‑looking
trajectory component (a credit‑score is about direction, not just level).

> **Diet is intentionally excluded from the score.** What a person eats is a
> personal/cultural choice, so a green *credit* score should not moralise it. To
> keep the comparison honest, the fair‑share budget and national averages are
> expressed net of food (~20% of a household footprint; Ivanova et al. 2016), so
> a non‑food footprint is compared with a non‑food budget.

### Company green credit score

Scores an organisation across five pillars, weighted by **sector materiality**:

1. **Carbon & Energy** — Scope 1/2/3 intensity, renewable share, emissions trend
2. **Digital & ICT footprint** — data‑centre PUE, 24/7 carbon‑free energy,
   hardware circularity (the fastest‑growing, least‑measured footprint)
3. **Resources & Circularity** — waste, recycled materials, water
4. **Targets & Trajectory** — science‑based targets, Scope 3 coverage, progress
5. **Transparency & Governance** — disclosure, assurance, board oversight, data quality

Indicators are normalised to 0–100 against real‑world anchors and aggregated with
a **partly non‑compensatory** weighted geometric mean, so a great website can’t
offset an absent climate strategy. Every indicator’s raw value, normalised score
and weight is shown.

Both scores are projected onto a familiar **300–850** scale with an **A+ → D**
band.

---

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Base UI primitives, lucide icons)
- **Vitest** for the scoring‑engine unit tests
- Bespoke **SVG** data‑viz (score gauge, pillar radar, footprint bars) — no chart
  dependency
- No database, no accounts, no tracking: scores compute in the browser

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000  (this repo runs it on :43117)
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm test           # run the scoring-engine unit tests (vitest)
```

## Project structure

```
src/
  app/
    page.tsx              # landing page
    individual/           # personal score calculator
    organization/         # company score calculator
    methodology/          # full, live methodology (tables from the engine)
    research/             # annotated bibliography
    roadmap/              # phased product plan
  components/
    calculators/          # interactive calculators + form controls
    viz/                  # score gauge, radar, footprint bars (SVG)
    ui/                   # shadcn/ui primitives
  lib/
    scoring/              # the engine (see below)
docs/
  PLAN.md                 # product plan & milestones
  RESEARCH.md             # research foundations (annotated)
```

### The scoring engine (`src/lib/scoring/`)

| File              | Purpose                                                        |
| ----------------- | ------------------------------------------------------------- |
| `types.ts`        | Shared input/result types                                     |
| `constants.ts`    | Emission factors, benchmarks, weights — **every number cited**|
| `sources.ts`      | Research/standard registry powering citations                 |
| `bands.ts`        | Normalization, interpolation, aggregation, band mapping       |
| `individual.ts`   | `computeIndividual()` — personal footprint → score            |
| `organization.ts` | `computeOrganization()` — pillar composite → score            |
| `scoring.test.ts` | Unit tests (calibration, monotonicity, non‑compensability)    |

The engine is framework‑free and deterministic, so it can be reused server‑side,
in an API, or in tests.

## Methodology, in one paragraph

Activity data → emissions via documented factors (GHG Protocol scopes for
companies) → normalise every indicator onto a common 0–100 scale against
real‑world benchmarks → weight by materiality → aggregate (linear within a
pillar, geometric across pillars) → project to a 300–850 grade. This follows the
OECD/JRC composite‑indicator handbook and is documented in full at `/methodology`
and in [`docs/PLAN.md`](docs/PLAN.md).

## Limitations & disclaimer

Verdex is an independent **research demonstrator**, not financial, investment or
compliance advice. Estimates are screening‑level and depend on coarse,
self‑reported inputs; emission factors are regional averages. Where a precise
public factor was unavailable, a defensible mid‑range value is used and flagged.
See `/methodology#limitations`.

## License

Provided for demonstration and evaluation. Cited authors and organisations are
not affiliated with or endorsers of this project.
