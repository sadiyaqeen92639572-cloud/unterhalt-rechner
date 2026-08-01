/*
 * unterhalt-rechner.com — gemeinsame Berechnungslogik
 * Quelle: Düsseldorfer Tabelle, Stand 01.01.2026, OLG Düsseldorf
 * https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2026/DT_2026.pdf
 * Alle Zahlen wörtlich aus dem offiziellen PDF übernommen, nicht nachgerechnet.
 */

// Bedarfssätze (Tabellenbetrag, vor Kindergeldanrechnung) — [bis€, 0-5, 6-11, 12-17, ab18, %, kontrollbetrag]
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

// Zahlbeträge (nach Abzug Kindergeldanteil — hälftig bei minderjährigen, voll bei volljährigen Kindern)
// Kindergeld 2026 = 259 EUR/Kind einheitlich
const DT_KINDERGELD_2026 = 259;
const DT_ZAHLBETRAEGE = [
  { bis: 2100,  a1: 356.5, a2: 428.5, a3: 523.5,  a4: 439 },
  { bis: 2500,  a1: 381.5, a2: 456.5, a3: 556.5,  a4: 474 },
  { bis: 2900,  a1: 405.5, a2: 484.5, a3: 589.5,  a4: 509 },
  { bis: 3300,  a1: 429.5, a2: 512.5, a3: 621.5,  a4: 544 },
  { bis: 3700,  a1: 454.5, a2: 540.5, a3: 654.5,  a4: 579 },
  { bis: 4100,  a1: 493.5, a2: 585.5, a3: 706.5,  a4: 635 },
  { bis: 4500,  a1: 531.5, a2: 629.5, a3: 759.5,  a4: 691 },
  { bis: 4900,  a1: 570.5, a2: 674.5, a3: 811.5,  a4: 747 },
  { bis: 5300,  a1: 609.5, a2: 719.5, a3: 863.5,  a4: 802 },
  { bis: 5700,  a1: 648.5, a2: 763.5, a3: 915.5,  a4: 858 },
  { bis: 6400,  a1: 687.5, a2: 808.5, a3: 968.5,  a4: 914 },
  { bis: 7200,  a1: 726.5, a2: 853.5, a3: 1020.5, a4: 970 },
  { bis: 8200,  a1: 765.5, a2: 897.5, a3: 1072.5, a4: 1026 },
  { bis: 9700,  a1: 804.5, a2: 942.5, a3: 1124.5, a4: 1082 },
  { bis: 11200, a1: 842.5, a2: 986.5, a3: 1176.5, a4: 1137 },
];

const DT_SELBSTBEHALT_KIND = { nichtErwerb: 1200, erwerb: 1450, angemessen: 1750 };
const DT_SELBSTBEHALT_EHE = { nichtErwerb: 1475, erwerb: 1600 };
const DT_EXISTENZMINIMUM_EHE = { erwerb: 1450, nichtErwerb: 1200 };
const DT_STUDIERENDENBEDARF = 990; // § Anm. IV, Kind in eigenem Haushalt/Studium

function dtFindBracket(einkommen) {
  for (let i = 0; i < DT_TABELLE.length; i++) {
    if (einkommen <= DT_TABELLE[i].bis) return i;
  }
  return -1; // über Tabelle (>11.200€) — keine Tabellenwerte, individuelle Berechnung nötig
}

function ageStufe(alter) {
  if (alter <= 5) return 'a1';
  if (alter <= 11) return 'a2';
  if (alter <= 17) return 'a3';
  return 'a4';
}

/**
 * Kindesunterhalt nach Düsseldorfer Tabelle.
 * @param {number} einkommen bereinigtes Nettoeinkommen des Barunterhaltspflichtigen
 * @param {number} alter Alter des Kindes
 * @param {boolean} volljaehrigImHaushalt volljähriges Kind lebt noch bei einem Elternteil (→ Stufe 4 statt Studierendenbedarf)
 * @returns {object|null} { bedarf, zahlbetrag, bracket, kontrolle, ueberTabelle }
 */
function berechneKindesunterhalt(einkommen, alter) {
  const idx = dtFindBracket(einkommen);
  if (idx === -1) {
    return { ueberTabelle: true, bracket: null };
  }
  const stufe = ageStufe(alter);
  const row = DT_TABELLE[idx];
  const zrow = DT_ZAHLBETRAEGE[idx];
  return {
    ueberTabelle: false,
    bracket: idx + 1,
    bis: row.bis,
    pct: row.pct,
    bedarf: row[stufe],
    zahlbetrag: zrow[stufe],
    kindergeldAnteil: alter >= 18 ? DT_KINDERGELD_2026 : DT_KINDERGELD_2026 / 2,
    kontrolle: row.kontrolle,
  };
}

/**
 * Ehegattenunterhalt / Trennungsunterhalt nach der amtlichen 45%/50%-Differenzmethode
 * (Düsseldorfer Tabelle Anm. B.I — nicht die vereinfachte "3/7-Faustformel").
 * @param {number} einkommenPflichtig bereinigtes Nettoeinkommen des Pflichtigen
 * @param {number} einkommenBerechtigt bereinigtes Nettoeinkommen des Berechtigten (0 falls keins)
 * @param {boolean} pflichtigErwerbstaetig true=erwerbstätig (45%-Quote), false=Rentner o.ä. (50%-Quote)
 */
function berechneEhegattenunterhalt(einkommenPflichtig, einkommenBerechtigt, pflichtigErwerbstaetig) {
  const quote = pflichtigErwerbstaetig ? 0.45 : 0.50;
  const differenz = Math.max(0, einkommenPflichtig - einkommenBerechtigt);
  let unterhalt = differenz * quote;

  const selbstbehalt = pflichtigErwerbstaetig ? DT_SELBSTBEHALT_EHE.erwerb : DT_SELBSTBEHALT_EHE.nichtErwerb;
  const verbleibt = einkommenPflichtig - unterhalt;
  let selbstbehaltUnterschritten = false;
  if (verbleibt < selbstbehalt) {
    unterhalt = Math.max(0, einkommenPflichtig - selbstbehalt);
    selbstbehaltUnterschritten = true;
  }

  return {
    unterhalt: Math.round(unterhalt * 100) / 100,
    quote: quote * 100,
    selbstbehalt,
    selbstbehaltUnterschritten,
  };
}

/**
 * Wechselmodell — keine gesetzlich fixierte Formel in Deutschland.
 * Vereinfachter Ausgleichsbetrag: hälftige Differenz der bereinigten Nettoeinkommen,
 * NICHT die offizielle Düsseldorfer-Tabelle-Methode (die für Residenzmodell gilt).
 * Nur als grobe Orientierung, siehe Disclaimer.
 */
function berechneWechselmodellAusgleich(einkommenA, einkommenB) {
  const differenz = Math.abs(einkommenA - einkommenB);
  return Math.round((differenz / 2) * 100) / 100;
}

function euro(n) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
}
