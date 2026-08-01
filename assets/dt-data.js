/*
 * Node-side copy of the Düsseldorfer Tabelle 2026 data, used only by generate-satellites.js
 * to render the static /unterhaltstabelle/ page at build time. Browser calc logic lives in
 * calc-engine.js (plain <script>, not a CommonJS module) — same numbers, source of truth is
 * research/DT_2026_official.pdf/.txt for both.
 */
const DT_TABELLE = [
  { bis: 2100,  a1: 486, a2: 558,  a3: 653,  a4: 698,  pct: 100, kontrolle: null },
  { bis: 2500,  a1: 511, a2: 586,  a3: 686,  a4: 733,  pct: 105, kontrolle: 1750 },
  { bis: 2900,  a1: 535, a2: 614,  a3: 719,  a4: 768,  pct: 110, kontrolle: 1850 },
  { bis: 3300,  a1: 559, a2: 642,  a3: 751,  a4: 803,  pct: 115, kontrolle: 1950 },
  { bis: 3700,  a1: 584, a2: 670,  a3: 784,  a4: 838,  pct: 120, kontrolle: 2050 },
  { bis: 4100,  a1: 623, a2: 715,  a3: 836,  a4: 894,  pct: 128, kontrolle: 2150 },
  { bis: 4500,  a1: 661, a2: 759,  a3: 889,  a4: 950,  pct: 136, kontrolle: 2250 },
  { bis: 4900,  a1: 700, a2: 804,  a3: 941,  a4: 1006, pct: 144, kontrolle: 2350 },
  { bis: 5300,  a1: 739, a2: 849,  a3: 993,  a4: 1061, pct: 152, kontrolle: 2450 },
  { bis: 5700,  a1: 778, a2: 893,  a3: 1045, a4: 1117, pct: 160, kontrolle: 2550 },
  { bis: 6400,  a1: 817, a2: 938,  a3: 1098, a4: 1173, pct: 168, kontrolle: 2850 },
  { bis: 7200,  a1: 856, a2: 983,  a3: 1150, a4: 1229, pct: 176, kontrolle: 3250 },
  { bis: 8200,  a1: 895, a2: 1027, a3: 1202, a4: 1285, pct: 184, kontrolle: 3750 },
  { bis: 9700,  a1: 934, a2: 1072, a3: 1254, a4: 1341, pct: 192, kontrolle: 4350 },
  { bis: 11200, a1: 972, a2: 1116, a3: 1306, a4: 1396, pct: 200, kontrolle: 5050 },
];

module.exports = { DT_TABELLE: DT_TABELLE };
