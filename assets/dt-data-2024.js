/*
 * Node-side copy of the Düsseldorfer Tabelle, Stand 01.01.2024 (Bedarfssätze).
 * Source: https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2024/2023_12_11_Duesseldorfer_Tabelle_-2024.pdf
 * (research/DT_2024.pdf/.txt), Werte wörtlich übernommen, nicht nachgerechnet.
 */
const DT_TABELLE_2024 = [
  { bis: 2100,  a1: 480, a2: 551,  a3: 645,  a4: 689,  pct: 100, kontrolle: null },
  { bis: 2500,  a1: 504, a2: 579,  a3: 678,  a4: 724,  pct: 105, kontrolle: 1750 },
  { bis: 2900,  a1: 528, a2: 607,  a3: 710,  a4: 758,  pct: 110, kontrolle: 1850 },
  { bis: 3300,  a1: 552, a2: 634,  a3: 742,  a4: 793,  pct: 115, kontrolle: 1950 },
  { bis: 3700,  a1: 576, a2: 662,  a3: 774,  a4: 827,  pct: 120, kontrolle: 2050 },
  { bis: 4100,  a1: 615, a2: 706,  a3: 826,  a4: 882,  pct: 128, kontrolle: 2150 },
  { bis: 4500,  a1: 653, a2: 750,  a3: 878,  a4: 938,  pct: 136, kontrolle: 2250 },
  { bis: 4900,  a1: 692, a2: 794,  a3: 929,  a4: 993,  pct: 144, kontrolle: 2350 },
  { bis: 5300,  a1: 730, a2: 838,  a3: 981,  a4: 1048, pct: 152, kontrolle: 2450 },
  { bis: 5700,  a1: 768, a2: 882,  a3: 1032, a4: 1103, pct: 160, kontrolle: 2550 },
  { bis: 6400,  a1: 807, a2: 926,  a3: 1084, a4: 1158, pct: 168, kontrolle: 2850 },
  { bis: 7200,  a1: 845, a2: 970,  a3: 1136, a4: 1213, pct: 176, kontrolle: 3250 },
  { bis: 8200,  a1: 884, a2: 1014, a3: 1187, a4: 1268, pct: 184, kontrolle: 3750 },
  { bis: 9700,  a1: 922, a2: 1058, a3: 1239, a4: 1323, pct: 192, kontrolle: 4350 },
  { bis: 11200, a1: 960, a2: 1102, a3: 1290, a4: 1378, pct: 200, kontrolle: 5050 },
];

module.exports = { DT_TABELLE: DT_TABELLE_2024, kontrolleZeile1: '1.200 / 1.450' };
