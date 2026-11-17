# Verdex — Challenges, Mitigations, and Delivery Gates

Date: 17 November 2026

This document turns the main product, methodology, and engineering challenges
into a delivery plan. It complements [PLAN.md](PLAN.md) and refines the company
data strategy in [INGESTION.md](INGESTION.md).

**Status:** these are proposed controls and acceptance criteria, not implemented
capabilities or validated scientific conclusions. The current application remains
a browser-based, self-reported research demonstrator. Completing this document
does not make its scores verified or suitable for consequential decisions.

## 1. Decisions guiding the next release

1. Start with company inventory uploads and a small technology/services pilot.
   Keep the personal calculator available as an educational demonstrator.
2. Publish environmental performance, evidence quality, and commitments separately,
   alongside the existing composite. Better documentation must not be presented
   as an emissions reduction.
3. Treat absent data as unknown, never as zero emissions or good performance.
4. Make every scored input traceable to a source, period, boundary, and mapping
   version before describing a result as evidence-backed.
5. Validate methodology with real inventories before enabling score-based rewards
   or procurement eligibility. Financial/compliance uses require separate review.
6. Prioritize structured first-party uploads before connectors, broad sector
   expansion, public APIs, or a rewards marketplace.

These choices narrow the next implementation milestone; they do not remove the
long-term dual individual/company vision.

## 2. Current-state evidence

| Observation | Repository evidence | Consequence |
| --- | --- | --- |
| Calculator inputs live in React state and feed pure scoring functions | `src/components/calculators/individual-calculator.tsx`, `organization-calculator.tsx` | No persisted evidence or score history |
| Assurance, completeness, targets, and offsets are supplied by the user | `src/lib/scoring/types.ts` | A declaration is not verification |
| Company sectors change pillar weights, but share intensity anchors | `src/lib/scoring/organization.ts` | Sector weighting alone does not establish fair peer comparison |
| Emissions intensity divides emissions by revenue | `src/lib/scoring/organization.ts` | Revenue changes can improve intensity without reducing emissions |
| Several personal factors are illustrative or broad averages | `src/lib/scoring/constants.ts` | Precision and coverage need explicit qualification |
| A boolean offset claim grants fixed credit and affects trajectory | `src/lib/scoring/individual.ts` | Amount, retirement, and quality are not checked |
| Company action priorities and uplift use heuristics | `src/lib/scoring/organization.ts` | Suggested uplift is not a recalculated intervention outcome |
| Grade descriptions are shared by both models | `src/lib/scoring/bands.ts` | A company composite does not demonstrate a personal fair-share threshold or independent verification |
| Tests cover selected arithmetic and scoring behaviours | `src/lib/scoring/scoring.test.ts` | Computational checks are distinct from empirical validation |

## 3. Challenge: trustworthy inputs and conflicting evidence

**Risk:** a precisely computed score can still be wrong because the inputs are
incomplete, stale, self-reported, or assigned to the wrong boundary.

**Mitigation design**

- Introduce canonical measurements carrying value, unit, period, entity/facility
  boundary, metric, GHG scope/category where applicable, source reference,
  collection method, assurance scope, and adapter version.
- Start with a versioned CSV inventory template plus an import preview. Include
  explicit `reported`, `estimated`, `unknown`, and `not_applicable` states.
- Validate units, finite numbers, nonnegative inventories, percentage bounds,
  reporting dates, currency/year for revenue, duplicate records, and required
  boundary metadata before scoring. Existing TypeScript types are not runtime
  validation.
- Separate supplied totals from component records. A cloud emissions subtotal
  may already be included in a company inventory; it must not be added again.
- Reconcile only like-for-like measurements. The candidate key must include
  entity/boundary, metric, scope/category, accounting basis, and reporting period,
  not merely field name and period.
- Rank eligible candidates using documented evidence and assurance rules. Keep
  alternatives and the selection reason. Unsupported assurance claims remain
  self-reported; an assurance letter applies only to the metrics and period it
  actually covers.
- Use a provisional conflict trigger of both >10% relative difference and a
  metric-specific absolute tolerance. Define the denominator and tolerances in
  configuration; zero/near-zero cases use the absolute tolerance. This is a pilot
  review rule, not a validated universal threshold.
- Hold materially conflicted required inputs for review. Do not silently publish
  a verified grade from unresolved evidence.

**Acceptance criteria**

- Every populated scored field opens its source row/document reference and
  transformation history; missing fields have an explicit status.
- Reimporting the same file is idempotent. Correcting a mapping creates a new
  versioned run rather than changing the previous result silently.
- Fixtures cover overlapping totals, conflicting periods, separate facilities,
  market/location accounting bases, and malformed uploads.
- Review decisions record the reviewer, timestamp, reason, and selected source.

**Accountability:** ingestion engineering, with methodology review for mappings.

## 4. Challenge: defensible methodology and honest claims

**Risk:** published weights and research citations can be mistaken for external
validation of Verdex's particular composite.

**Mitigation design**

- Publish a model card for each scoring version: intended uses, excluded uses,
  covered activities, factor sources/vintages, assumptions, weights, thresholds,
  known limitations, and validation results.
- Label the 300–850 number as an environmental composite. Do not imply default
  prediction, financial creditworthiness, certification, or regulatory approval.
- Separate grade descriptions by model. Do not infer “verified,” “regenerative,”
  or “1.5°C-aligned” solely from crossing a composite-score threshold.
- Store every run with input snapshot, factor-set version, engine version, and
  mapping versions so historical results remain reproducible.
- Compare model outputs against independently reviewed inventories. Validate
  footprint estimates separately from normative composite weights and grades.
- Run sensitivity analysis over plausible input ranges and weight alternatives.
  Report grade flips and rank reversals; do not select assumptions just because
  they improve agreement with desired rankings.
- Recompute proposed interventions through the engine. Until that exists, label
  action rankings and uplift as heuristics, not guaranteed score changes.
- Require external methodology review before promoting the product beyond
  screening. Record disputes and the response, including unresolved objections.

**Acceptance criteria**

- A frozen evaluation set and evaluation procedure exist before calibration.
  Training/calibration cases are distinguishable from held-out evaluation cases.
- The validation report publishes sample coverage, errors, unstable cases, and
  limitations. Numerical acceptance thresholds are agreed before evaluation;
  they are currently an open decision, not an achieved result.
- The same versioned inputs reproduce the same result. Model updates produce a
  documented comparison rather than an unexplained historical score change.

**Accountability:** methodology lead and independent reviewer.

## 5. Challenge: fair comparisons

**Risk:** structural differences between industries and people can be confused
with differences in effort or environmental responsibility.

**Mitigation design**

- Pilot within a narrow, explicitly defined company cohort. Do not market the
  present shared intensity anchors as validated cross-sector benchmarks.
- Show absolute emissions, intensity, and comparable-period change together.
  Decompose intensity changes into emissions and revenue effects where possible.
- Investigate sector-specific physical denominators and calibrated anchors.
  Record currency, reporting year, boundary changes, and acquisitions before
  comparing revenue-based intensities or trends.
- Treat `not_applicable` separately from unknown or zero. Publish any weight
  redistribution rule and validate its effect before comparing resulting scores.
- For individuals, disclose country/grid assumptions and contextual constraints.
  Evaluate housing, transport access, household composition, and geography before
  connecting the score to rewards. Collect only context needed for this purpose.
- Provide correction and appeal workflows. Keep rewards voluntary; do not use
  the score to gate essential services or public goods.

**Acceptance criteria**

- A revenue-only increase cannot be described as an absolute emissions cut.
- Peer comparisons disclose cohort definition, sample size, vintage, and
  coverage. Insufficient cohorts receive no percentile ranking.
- Pilot fairness review identifies affected groups, observed disparities,
  proposed mitigations, and unresolved limitations before rewards are enabled.

**Accountability:** methodology and product leads.

## 6. Challenge: uncertainty, coverage, and double counting

**Risk:** coarse activity categories produce a precise-looking headline number;
overlapping measurement boundaries can inflate estimated emissions.

**Mitigation design**

- Maintain a factor registry with units, geography, valid period, source,
  licensing, uncertainty assumptions, and measured/illustrative status.
- Display gross footprint, any offset adjustment, and covered domains separately.
  Keep the intentional food exclusion visible. The fixed food-share adjustment
  is an assumption to test, not a universal country-specific fact.
- Define mutually exclusive activity boundaries. In particular, establish whether
  electricity bills include electric heating and device use, and whether digital
  service factors include device electricity or embodied hardware already counted.
- Propagate scenario ranges for uncertain inputs and factors. Call them scenario
  ranges unless a statistical model supports confidence-interval terminology.
  Account for correlated factors instead of assuming all errors are independent.
- Show a grade range or a provisional result when plausible scenarios cross band
  thresholds. Do not fill missing emissions with zero to produce a complete grade.

**Acceptance criteria**

- Every factor is versioned and traceable; approximations are visibly labeled.
- Boundary fixtures demonstrate that heating, devices, cloud subtotals, and
  inventory totals are counted once within the chosen accounting boundary.
- A factor update preserves historical runs and explains score changes.
- No complete-footprint claim is made for the intentionally partial personal model.

**Accountability:** methodology lead and scoring engineering.

## 7. Challenge: gaming and confusing disclosure with reduction

**Risk:** users optimize declarations or documentation rather than actual impact.

**Mitigation design**

- Display three distinct views: environmental outcomes, evidence quality, and
  commitments/governance. Retain the composite only with its components visible.
- Derive evidence quality and completeness from source coverage. A manually
  selected assurance level must not confer a verified status.
- Define whether completeness is field coverage, emissions coverage, or both;
  never conflate them. A complete inventory is not necessarily accurate.
- Separate estimated gross emissions from offsets. Replace the boolean-only
  offset treatment in an evidence-backed product with documented amount,
  ownership/retirement evidence, period, and quality review. Unverified claims
  should receive no verified offset credit.
- Keep data-quality gains out of environmental-performance calculations. Explain
  when the composite rises because reporting improves while emissions remain flat.
- Test adversarial profiles: missing Scope 3, inflated revenue, unsupported
  assurance, selective facility coverage, and repeated offset evidence.

**Acceptance criteria**

- Each score change is attributable to activity, evidence, commitments, offsets,
  boundary changes, or methodology changes.
- Better evidence of high emissions cannot improve the emissions subscore merely
  because that evidence is higher quality.
- Rewards remain disabled until the required evidence and appeal controls pass.

**Accountability:** product, methodology, and assurance reviewers.

## 8. Challenge: secure and maintainable data infrastructure

**Risk:** connectors and uploads introduce sensitive information, unreliable feeds,
and operational complexity that the browser-only demo does not currently have.

**Mitigation design**

- Add authentication and organization isolation before accepting real inventories.
  Distinguish submitter, reviewer, and administrator permissions.
- Use scoped, revocable connector access; encrypt credentials and source data;
  keep secrets and sensitive payloads out of logs.
- Bound upload types and sizes, validate content, and isolate processing. Prefer
  structured templates before introducing arbitrary PDF extraction.
- Build idempotent ingestion jobs with retries, explicit failure states, freshness
  indicators, schema-drift checks, and a review queue. Never silently reuse stale
  data as if it were current.
- Reconcile append-only audit requirements with retention and deletion: raw
  evidence is immutable during its approved retention period, not retained
  forever. Separate identifying content from minimal audit metadata; document
  deletion propagation, backups, and any approved retention exceptions.
- Publish a retention schedule and consent/revocation behaviour before connecting
  accounts. Deletion and retention obligations require deployment-specific review.

**Acceptance criteria**

- Cross-organization access tests fail closed. Review permissions are enforced
  server-side, not just hidden in the UI.
- Revocation stops collection; deletion exercises cover source files, derived
  records, credentials, and documented backup expiry.
- A failed or stale import is visible and cannot silently replace the last valid
  result. Retried jobs do not duplicate measurements.

**Accountability:** platform engineering and designated security/privacy owner.

## 9. Challenge: adoption and commercial focus

**Risk:** the roadmap addresses too many buyers before proving a repeatable use
case; the rewards network depends on both trusted scores and engaged partners.

**Mitigation design**

- Recruit a proposed pilot of 5–10 technology/services companies with an existing
  inventory and a named sustainability or procurement owner. This is a discovery
  cohort, not a representative validation sample.
- Test one workflow: upload inventory → resolve issues → inspect score and
  evidence → choose an improvement → compare the next reporting period.
- Measure time to first usable result, manual review effort, evidence coverage,
  repeat usage, actionable findings, and willingness to pay. Track actual
  emissions changes separately from score improvements.
- Select the first cloud connector from pilot demand and confirmed data access,
  rather than assuming a named provider exposes every required metric.
- Defer marketplace, financial eligibility, and broad reporting exports until the
  core workflow is useful. Validate any jurisdiction-specific reporting claims
  against applicable requirements at implementation time.

**Acceptance criteria**

- Pilot users can explain their result and identify evidence supporting it.
- A pilot review records actual usage, integration/review cost, willingness to
  pay, and a go/no-go decision. Commercial targets are set before recruitment.
- Partner benefits launch only after evidence, fairness, privacy, and correction
  gates are met; no partner participation is assumed in current product claims.

**Accountability:** product/commercial lead.

## 10. Delivery order and release gates

| Milestone | Deliverable | Dependencies | Gate before proceeding |
| --- | --- | --- | --- |
| M0: claims and model specification | Model cards, precise labels, accounting boundaries, runtime input contract | Review of existing engine | Every displayed claim maps to a calculation or an explicitly pending control |
| M1: evidence-backed upload | Auth, tenant isolation, structured CSV intake, measurements, lineage, missing-data handling | M0; retention and access decisions | Source-linked score reproduced from a stored input snapshot; isolation and malformed-upload checks pass |
| M2: validation and review | Conflict queue, assurance scope, factor versions, uncertainty scenarios, frozen evaluation set | M1 and pilot inventories | Published validation findings; unresolved material conflicts block verified status |
| M3: focused pilot | Repeated inventory workflow, result comparison, correction/appeal, commercial evaluation | M2 | Explicit go/no-go against preset quality and commercial targets |
| M4: selected connector | One demand-led provider integration, freshness and overlap handling | M3 and confirmed provider access | Reconciliation against an independently supplied inventory; successful revocation and retry tests |
| M5: wider decision support | Broader cohorts, API or partner benefits selected by demand | Validated cohort coverage and preceding controls | External methodology review and use-specific readiness review |

Model implementation will change where validation identifies a defect. Keeping
the scoring engine pure remains useful; “unchanged engine” is not a requirement
that overrides measurement correctness or fairness.

## 11. Decisions still requiring evidence or ownership

| Decision | Proposed approach | Required before |
| --- | --- | --- |
| Named accountable owners | Assign one person to each role above | Implementation kickoff |
| Initial geography and cohort | Select from willing pilot companies and available factors | Factor calibration |
| Empirical error and stability thresholds | Pre-register with methodology reviewer after defining intended use | Evaluation |
| Missing/not-applicable weighting | Evaluate explicit partial results versus validated redistribution | Publishing comparable grades |
| Peer sample sufficiency | Set minimum coverage and disclosure rules by cohort | Percentiles |
| Factor licensing | Inventory permitted uses and refresh obligations | Production factor ingestion |
| Evidence-quality framework | Validate any PCAF-inspired adaptation for this non-financed-emissions use case; label it as an adaptation | Publishing quality scores |
| Retention, deletion, and deployment jurisdiction | Agree schedule and review obligations | Real-data collection |
| Pilot commercial thresholds | Define acceptable review cost, repeat use, and willingness to pay | Pilot recruitment |

## 12. Documentation reconciliation

- The original product plan mentions public filing ingestion. For the next build,
  follow the first-party strategy in `INGESTION.md`: structured company uploads,
  then authorized connectors. Broad third-party filing scraping is deferred.
- The ingestion blueprint's field-and-period reconciliation key must be expanded
  with the boundaries and accounting bases specified here.
- Its “nothing is overwritten” principle applies to reproducible records within
  an approved retention policy; it does not override deletion requirements.
- Its suggested quality/confidence mappings and connector capabilities are design
  assumptions to verify, not proof of accuracy or guaranteed API coverage.
- Roadmap references to regulation describe intended markets. They are not a
  maintained statement of current legal scope or product compliance.

Review this register at each milestone. Record evidence, remaining risks, and an
owner's release decision rather than closing challenges on implementation alone.
