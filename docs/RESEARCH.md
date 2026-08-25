# Research Foundations

The Verdex methodology is derived from public standards and peer‑reviewed
literature rather than invented. This document records the **key findings** each
source contributes and **how they shape the product**. In‑app links live at
`/research`; machine‑readable entries are in `src/lib/scoring/sources.ts`.

---

## 1. ESG scoring: divergence & why transparency matters

**Berg, F., Koelbel, J. F., & Rigobon, R. (2022). “Aggregate Confusion: The
Divergence of ESG Ratings.” _Review of Finance_, 26(6).**
<https://doi.org/10.1093/rof/rfac033>

- ESG ratings from six major agencies (KLD, Sustainalytics, Moody’s/Vigeo‑Eiris,
  S&P/RobecoSAM, Refinitiv/Asset4, MSCI) correlate on average **0.54** — vs
  **0.92** for Moody’s/S&P credit ratings.
- Decomposition into a common taxonomy of **64 categories** attributes divergence
  to **measurement (56%)**, **scope (38%)** and **weight (6%)**.
- A **“rater effect”** (halo): an agency’s overall view of a firm influences its
  category‑level scores.

**How Verdex uses it:** the whole product is a response — we expose **scope,
measurement and weight** for every indicator, and reward measurement quality
(data completeness, assurance).

---

## 2. Composite indicator construction

**OECD & JRC (2008). _Handbook on Constructing Composite Indicators: Methodology
and User Guide._**
<https://www.oecd.org/en/publications/handbook-on-constructing-composite-indicators-methodology-and-user-guide_9789264043466-en.html>

- Ten‑step process: theoretical framework → indicator selection → imputation →
  multivariate analysis → **normalisation** → **weighting** → **aggregation** →
  uncertainty/sensitivity → links → visualisation.
- **Normalisation** (min‑max, z‑score, ranking) is required to compare indicators.
- **Aggregation:** linear is **fully compensatory**; **geometric** is **partially
  non‑compensatory** (a deficit is harder to offset); non‑compensatory methods
  exist too. Weighting should follow the theoretical framework, and compensability
  must be a conscious choice.

**How Verdex uses it:** we normalise every indicator to 0–100, aggregate
**linearly within a pillar** and **geometrically across pillars**, and publish all
weights so they can be contested.

---

## 3. Individual / lifestyle carbon footprints & fair‑share targets

**Hot or Cool Institute / IGES (2021). _1.5‑Degree Lifestyles: Towards A Fair
Consumption Space for All._**
<https://hotorcool.org/1-5-degree-lifestyles-report/>

- Per‑capita **fair‑share targets**: **2.5 tCO₂e by 2030**, **1.4 by 2040**,
  **0.7 by 2050** (distributing the IPCC ~500 GtCO₂ remaining 1.5 °C budget).
- 2019 global average lifestyle footprint ≈ **4.6 tCO₂e**; national examples:
  Canada 13.6, UK 8.5, Japan 8.1, China 5.0, Brazil 3.2, India 3.0, Indonesia 2.2.
- Concept of a **fair consumption space**: a social floor _and_ an ecological
  ceiling — equity matters as much as the ceiling.

**How Verdex uses it:** these targets and averages **calibrate the personal score
curve**, the target‑comparison scale, and the ethics guardrail (don’t penalise
people below a decent living standard).

**Birnik, A. (2013). “An evidence‑based assessment of online carbon calculators.”
_Int. J. Greenhouse Gas Control_, 17.** <https://doi.org/10.1016/j.ijggc.2013.05.013>

- Derives **13 evidence‑based principles** for personal footprint calculators;
  finds real calculators lag best practice, especially on **documentation** (which
  gases, which factors, which GWPs).

**How Verdex uses it:** we publish factors openly and document assumptions.

**Ivanova, D., et al. (2016). “Environmental Impact Assessment of Household
Consumption.” _J. Industrial Ecology_, 20(3).** — consumption‑based (EEIOA)
household footprint ranges → bracket the **goods & services** domain, and the
basis for food being **~20%** of a household GHG footprint.

**How Verdex uses the food figure:** the personal score **deliberately excludes
diet** — what a person eats is a personal/cultural choice a green *credit* score
should not moralise, and it is one of the noisiest self‑reported categories.
Rather than drop food from the footprint while leaving the target untouched
(which would inflate every grade), Verdex expresses the fair‑share budget and
national averages **net of food** (× 0.8), so a non‑food footprint is compared
with a non‑food budget — like for like.

---

## 4. Corporate carbon accounting

**Greenhouse Gas Protocol (2011). _Corporate Value Chain (Scope 3) Accounting and
Reporting Standard_ (WRI & WBCSD).**
<https://ghgprotocol.org/corporate-value-chain-scope-3-standard>

- The internationally accepted method for value‑chain emissions across **15
  categories**; the only such standard, used by CDP and SBTi participants.

**Science Based Targets initiative (2023). _Corporate Net‑Zero Standard_ & Scope 3
guidance.** <https://sciencebasedtargets.org/net-zero>

- Requires a **full Scope 3 inventory**; near‑term targets must cover **≥67%** of
  Scope 3, net‑zero targets **90%**.

**How Verdex uses it:** the company score separates **Scope 1+2** from **Scope 3**
intensity, rewards inventory completeness, and anchors the **Targets & Trajectory**
pillar to the SBTi thresholds.

---

## 5. Digital / ICT carbon footprint

**Malmodin, J., Lundén, D., Bergmark, P., et al. (2023). “ICT Sector Electricity
Consumption and Greenhouse Gas Emissions – 2020 Outcome.” SSRN.**
<https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4424264>

- ICT ≈ **4%** of global electricity and ≈ **1.4%** of global GHG emissions (2020),
  split across **user devices, networks and data centres**; user devices are over
  half of ICT emissions.

**UNCTAD (2024). _Digital Economy Report 2024_, Ch. III.**
<https://unctad.org/publication/digital-economy-report-2024>

- Data centres ≈ **1–1.5%** of global electricity; **estimates diverge widely** due
  to differing methods; water and concentration effects matter. Data‑centre demand
  is growing fast (AI), with **PUE** a key efficiency metric.

**How Verdex uses it:** grounds a **dedicated digital/ICT pillar** for companies
(PUE, 24/7 carbon‑free energy, hardware circularity) and the **digital** domain for
individuals (devices, streaming, cloud/AI) — small today but the fastest‑growing.

---

## 6. Policy & markets: does a “green credit score” change behaviour?

**Green credit policy (China). e.g. “Carbon Emission Reduction Effects of Green
Credit Policies: Evidence From China.” _Frontiers in Environmental Science_ (2022);
and difference‑in‑differences studies on the 2012 Green Credit Guidelines.**
<https://doi.org/10.3389/fenvs.2022.798072>

- Tying credit to green performance **reduces emissions** in high‑pollution
  sectors; DiD estimates find treated firms cut emissions by **~13–19%** via
  financial constraints and green innovation.

**Personal carbon markets. “Low‑carbon lifestyle revolution: China’s progress
toward a personal carbon market.” _PLOS Sustainability and Transformation_ (2023).**
<https://doi.org/10.1371/journal.pstr.0000079>

- Reviews **Personal Carbon Trading** and voluntary **inclusive carbon credit**
  schemes where individuals earn rewards (coupons, goods) for low‑carbon behaviour.

**EU sustainable‑finance framework. “An Overview of Corporate Sustainability
Reporting Legislation in the EU.” _Accounting in Europe_ (2024).**
<https://doi.org/10.1080/17449480.2024.2312145>

- **CSRD** brings ~**49,000** companies into mandatory **ESRS** reporting; **SFDR**
  and the **EU Taxonomy** push comparable, greenwashing‑resistant disclosure with
  **double materiality**.

**How Verdex uses it:** validates the core thesis (score → consequence changes
behaviour), shapes the **rewards/eligibility** layer as an opt‑in incentive
(not a gate), and identifies the **regulatory demand** the company product serves.

---

## Notes on rigour & honesty

- Where a precise public emission factor was unavailable, Verdex uses a defensible
  **mid‑range** value and flags it as illustrative (per Birnik’s documentation
  principle).
- Indicator **anchors and weights encode value judgements**; they are published in
  `src/lib/scoring/constants.ts` and on `/methodology` so they can be challenged —
  a direct recommendation of the OECD/JRC handbook.
- These are **screening‑level** estimates, not audited inventories or investment
  advice.
