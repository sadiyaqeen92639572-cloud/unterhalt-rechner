/*
 * Node-side copy of the Düsseldorfer Tabelle, Stand 01.01.2025 (Bedarfssätze).
 * Source: https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2025/DT_2025_Neufassung-m-geaenderter-Fussnote.pdf
 * (research/DT_2025.pdf/.txt), Werte wörtlich übernommen, nicht nachgerechnet.
 */
const DT_TABELLE_2025 = [
  { bis: 2100,  a1: 482, a2: 554,  a3: 649,  a4: 693,  pct: 100, kontrolle: null },
  { bis: 2500,  a1: 507, a2: 582,  a3: 682,  a4: 728,  pct: 105, kontrolle: 1750 },
  { bis: 2900,  a1: 531, a2: 610,  a3: 714,  a4: 763,  pct: 110, kontrolle: 1850 },
  { bis: 3300,  a1: 555, a2: 638,  a3: 747,  a4: 797,  pct: 115, kontrolle: 1950 },
  { bis: 3700,  a1: 579, a2: 665,  a3: 779,  a4: 832,  pct: 120, kontrolle: 2050 },
  { bis: 4100,  a1: 617, a2: 710,  a3: 831,  a4: 888,  pct: 128, kontrolle: 2150 },
  { bis: 4500,  a1: 656, a2: 754,  a3: 883,  a4: 943,  pct: 136, kontrolle: 2250 },
  { bis: 4900,  a1: 695, a2: 798,  a3: 935,  a4: 998,  pct: 144, kontrolle: 2350 },
  { bis: 5300,  a1: 733, a2: 843,  a3: 987,  a4: 1054, pct: 152, kontrolle: 2450 },
  { bis: 5700,  a1: 772, a2: 887,  a3: 1039, a4: 1109, pct: 160, kontrolle: 2550 },
  { bis: 6400,  a1: 810, a2: 931,  a3: 1091, a4: 1165, pct: 168, kontrolle: 2850 },
  { bis: 7200,  a1: 849, a2: 976,  a3: 1143, a4: 1220, pct: 176, kontrolle: 3250 },
  { bis: 8200,  a1: 887, a2: 1020, a3: 1195, a4: 1276, pct: 184, kontrolle: 3750 },
  { bis: 9700,  a1: 926, a2: 1064, a3: 1247, a4: 1331, pct: 192, kontrolle: 4350 },
  { bis: 11200, a1: 964, a2: 1108, a3: 1298, a4: 1386, pct: 200, kontrolle: 5050 },
];

module.exports = { DT_TABELLE: DT_TABELLE_2025, kontrolleZeile1: '1.200 / 1.450' };
