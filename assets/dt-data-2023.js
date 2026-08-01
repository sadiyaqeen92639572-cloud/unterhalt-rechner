/*
 * Node-side copy of the Düsseldorfer Tabelle, Stand 01.01.2023 (Bedarfssätze).
 * Source: https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2023/Duesseldorfer-Tabelle-2023.pdf
 * (research/DT_2023.pdf/.txt), Werte wörtlich übernommen, nicht nachgerechnet.
 */
const DT_TABELLE_2023 = [
  { bis: 1900,  a1: 437, a2: 502,  a3: 588,  a4: 628,  pct: 100, kontrolle: null },
  { bis: 2300,  a1: 459, a2: 528,  a3: 618,  a4: 660,  pct: 105, kontrolle: 1650 },
  { bis: 2700,  a1: 481, a2: 553,  a3: 647,  a4: 691,  pct: 110, kontrolle: 1750 },
  { bis: 3100,  a1: 503, a2: 578,  a3: 677,  a4: 723,  pct: 115, kontrolle: 1850 },
  { bis: 3500,  a1: 525, a2: 603,  a3: 706,  a4: 754,  pct: 120, kontrolle: 1950 },
  { bis: 3900,  a1: 560, a2: 643,  a3: 753,  a4: 804,  pct: 128, kontrolle: 2050 },
  { bis: 4300,  a1: 595, a2: 683,  a3: 800,  a4: 855,  pct: 136, kontrolle: 2150 },
  { bis: 4700,  a1: 630, a2: 723,  a3: 847,  a4: 905,  pct: 144, kontrolle: 2250 },
  { bis: 5100,  a1: 665, a2: 764,  a3: 894,  a4: 955,  pct: 152, kontrolle: 2350 },
  { bis: 5500,  a1: 700, a2: 804,  a3: 941,  a4: 1005, pct: 160, kontrolle: 2450 },
  { bis: 6200,  a1: 735, a2: 844,  a3: 988,  a4: 1056, pct: 168, kontrolle: 2750 },
  { bis: 7000,  a1: 770, a2: 884,  a3: 1035, a4: 1106, pct: 176, kontrolle: 3150 },
  { bis: 8000,  a1: 805, a2: 924,  a3: 1082, a4: 1156, pct: 184, kontrolle: 3650 },
  { bis: 9500,  a1: 840, a2: 964,  a3: 1129, a4: 1206, pct: 192, kontrolle: 4250 },
  { bis: 11000, a1: 874, a2: 1004, a3: 1176, a4: 1256, pct: 200, kontrolle: 4950 },
];

module.exports = { DT_TABELLE: DT_TABELLE_2023, kontrolleZeile1: '1.120 / 1.370' };
