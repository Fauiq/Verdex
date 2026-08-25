/**
 * Research foundations. These are the peer-reviewed papers and standards the
 * scoring methodology is built on. Keys are referenced from constants and the
 * organization indicator definitions so every number is traceable.
 */

export interface Source {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  url: string;
  /** How Verdex uses this source. */
  usedFor: string;
  tag: "ESG methodology" | "Carbon accounting" | "Individual footprint" | "Digital / ICT" | "Policy & markets";
}

export const SOURCES: Source[] = [
  {
    id: "berg2022",
    title: "Aggregate Confusion: The Divergence of ESG Ratings",
    authors: "Berg, F., Koelbel, J. F., & Rigobon, R.",
    year: 2022,
    venue: "Review of Finance, 26(6)",
    url: "https://doi.org/10.1093/rof/rfac033",
    usedFor:
      "Motivates radical transparency. The study shows ESG ratings correlate only ~0.54 (vs 0.92 for credit ratings) and decomposes disagreement into measurement (56%), scope (38%) and weight (6%). Verdex therefore exposes scope, measurement and weight for every indicator.",
    tag: "ESG methodology",
  },
  {
    id: "oecd2008",
    title: "Handbook on Constructing Composite Indicators: Methodology and User Guide",
    authors: "OECD & JRC (European Commission)",
    year: 2008,
    venue: "OECD Publishing",
    url: "https://www.oecd.org/en/publications/handbook-on-constructing-composite-indicators-methodology-and-user-guide_9789264043466-en.html",
    usedFor:
      "The 10-step recipe for a defensible composite index: theoretical framework, normalization, weighting, and aggregation. Verdex normalizes each indicator to 0-100 and uses geometric aggregation across pillars to limit compensability.",
    tag: "ESG methodology",
  },
  {
    id: "hotorcool2021",
    title: "1.5-Degree Lifestyles: Towards A Fair Consumption Space for All",
    authors: "Hot or Cool Institute (Akenji, Lettenmeier, et al.)",
    year: 2021,
    venue: "Hot or Cool Institute / IGES",
    url: "https://hotorcool.org/1-5-degree-lifestyles-report/",
    usedFor:
      "Provides the per-capita fair-share targets (2.5 tCO2e by 2030, 1.4 by 2040, 0.7 by 2050) and national lifestyle-footprint averages used to calibrate the individual score curve and hotspots.",
    tag: "Individual footprint",
  },
  {
    id: "birnik2013",
    title: "An evidence-based assessment of online carbon calculators",
    authors: "Birnik, A.",
    year: 2013,
    venue: "International Journal of Greenhouse Gas Control, 17",
    url: "https://doi.org/10.1016/j.ijggc.2013.05.013",
    usedFor:
      "Derives 13 evidence-based principles for personal footprint calculators — comprehensive gas coverage, documented emission factors and transparency. Verdex follows these and publishes its factors openly.",
    tag: "Individual footprint",
  },
  {
    id: "ghgp_scope3",
    title: "Corporate Value Chain (Scope 3) Accounting and Reporting Standard",
    authors: "Greenhouse Gas Protocol (WRI & WBCSD)",
    year: 2011,
    venue: "GHG Protocol",
    url: "https://ghgprotocol.org/corporate-value-chain-scope-3-standard",
    usedFor:
      "The internationally accepted method for value-chain emissions across 15 categories. The company score separates Scope 1+2 from Scope 3 intensity and rewards inventory completeness.",
    tag: "Carbon accounting",
  },
  {
    id: "sbti2023",
    title: "Corporate Net-Zero Standard & Scope 3 target-setting",
    authors: "Science Based Targets initiative",
    year: 2023,
    venue: "SBTi",
    url: "https://sciencebasedtargets.org/net-zero",
    usedFor:
      "Defines credible target-setting: a full Scope 3 inventory, ≥67% Scope 3 coverage for near-term targets and 90% for net-zero. These thresholds anchor the Targets & Trajectory pillar.",
    tag: "Carbon accounting",
  },
  {
    id: "malmodin2023",
    title: "ICT Sector Electricity Consumption and Greenhouse Gas Emissions – 2020 Outcome",
    authors: "Malmodin, J., Lundén, D., Bergmark, P., et al.",
    year: 2023,
    venue: "SSRN Working Paper",
    url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4424264",
    usedFor:
      "Bottom-up estimate that ICT is ~4% of global electricity and ~1.4% of GHG emissions, split across devices, networks and data centres. Grounds the digital-footprint domain and device embodied factors.",
    tag: "Digital / ICT",
  },
  {
    id: "unctad2024",
    title: "Digital Economy Report 2024 — Environmental impacts of digitalization",
    authors: "UNCTAD",
    year: 2024,
    venue: "United Nations Conference on Trade and Development",
    url: "https://unctad.org/publication/digital-economy-report-2024",
    usedFor:
      "Context for data-centre energy/water and the wide divergence in ICT footprint estimates. Supports the ICT pillar's use of PUE and carbon-free-energy indicators for tech companies.",
    tag: "Digital / ICT",
  },
  {
    id: "greencredit2022",
    title: "Carbon Emission Reduction Effects of Green Credit Policies: Evidence From China",
    authors: "Multiple (Frontiers in Environmental Science)",
    year: 2022,
    venue: "Frontiers in Environmental Science, 10",
    url: "https://doi.org/10.3389/fenvs.2022.798072",
    usedFor:
      "Empirical evidence (difference-in-differences) that tying credit to green performance reduces emissions in high-pollution sectors — the core thesis behind a green credit score creating real-world leverage.",
    tag: "Policy & markets",
  },
  {
    id: "pct2023",
    title: "Low-carbon lifestyle revolution: China's progress toward a personal carbon market",
    authors: "PLOS Sustainability and Transformation",
    year: 2023,
    venue: "PLOS Sustainability and Transformation, 2(4)",
    url: "https://doi.org/10.1371/journal.pstr.0000079",
    usedFor:
      "Reviews Personal Carbon Trading and voluntary 'inclusive carbon credit' schemes where individuals earn rewards for low-carbon behaviour — the incentive layer a consumer green score can plug into.",
    tag: "Policy & markets",
  },
  {
    id: "eu2024",
    title: "An Overview of Corporate Sustainability Reporting Legislation in the EU (CSRD, SFDR, EU Taxonomy)",
    authors: "Various (Accounting in Europe)",
    year: 2024,
    venue: "Accounting in Europe",
    url: "https://doi.org/10.1080/17449480.2024.2312145",
    usedFor:
      "The regulatory demand driver: CSRD brings ~49,000 companies into mandatory ESRS reporting and SFDR/EU Taxonomy push comparable, greenwashing-resistant disclosure — the market Verdex serves.",
    tag: "Policy & markets",
  },
  {
    id: "ivanova2016",
    title: "Environmental Impact Assessment of Household Consumption",
    authors: "Ivanova, D., Stadler, K., Steen-Olsen, K., et al.",
    year: 2016,
    venue: "Journal of Industrial Ecology, 20(3)",
    url: "https://doi.org/10.1111/jiec.12371",
    usedFor:
      "Consumption-based (EEIOA) household footprint ranges used to bracket the goods & services domain. Also the basis for food being ~20% of a household's GHG footprint — the factor by which Verdex nets food out of its lifestyle benchmarks, since diet is intentionally excluded from the personal score.",
    tag: "Individual footprint",
  },
];

export const SOURCE_BY_ID: Record<string, Source> = Object.fromEntries(
  SOURCES.map((s) => [s.id, s]),
);
