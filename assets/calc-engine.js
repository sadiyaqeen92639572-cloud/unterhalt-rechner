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

/**
 * Unterhaltsvorschuss (UVG) — staatliche Ersatzleistung, wenn der barunterhaltspflichtige
 * Elternteil nicht oder nicht regelmäßig zahlt. Betrag = Mindestunterhalt Stufe 1 minus
 * volles Kindergeld, für Kinder bis 17 Jahre (kein Höchstbezugsdauer-Limit seit Reform 2020).
 * Quelle: familienportal.de / bmbfsfj.de (Stand 2026), Beträge deckungsgleich mit
 * DT_TABELLE Stufe 1 minus DT_KINDERGELD_2026.
 * @param {number} alter Alter des Kindes (0-17)
 * @param {number} bereitsGezahlterUnterhalt tatsächlich vom anderen Elternteil gezahlter Betrag (wird abgezogen)
 */
function berechneUnterhaltsvorschuss(alter, bereitsGezahlterUnterhalt) {
  if (alter >= 18) {
    return { anspruchsberechtigt: false, grund: 'Unterhaltsvorschuss wird nur bis zur Volljährigkeit (18) gezahlt.' };
  }
  var stufe = ageStufe(alter);
  var row = DT_TABELLE[0];
  var maxBetrag = row[stufe] - DT_KINDERGELD_2026;
  var gezahlt = Math.max(0, bereitsGezahlterUnterhalt || 0);
  var betrag = Math.max(0, maxBetrag - gezahlt);
  return {
    anspruchsberechtigt: true,
    maxBetrag: Math.round(maxBetrag * 100) / 100,
    betrag: Math.round(betrag * 100) / 100,
    bedingung1217: alter >= 12,
  };
}

/**
 * Elternunterhalt (Verwandtenunterhalt gegenüber Eltern, § 1601 BGB / Anmerkung D.I).
 * Zwei getrennte Regeln, beide amtlich, aber unterschiedlicher Natur:
 * 1. Freigrenze 100.000 €/Jahr Bruttoeinkommen (Angehörigen-Entlastungsgesetz 2020) —
 *    fester gesetzlicher Schwellenwert, unterhalb dessen keine Zahlungspflicht besteht.
 * 2. Oberhalb der Freigrenze: Anmerkung D.I definiert den Selbstbehalt (nicht direkt
 *    den Unterhalt) als 2.650 € + 70% des darüber hinausgehenden Nettoeinkommens.
 *    Der maximal denkbare Unterhalt ergibt sich rechnerisch aus Einkommen − Selbstbehalt
 *    (= 30% des Mehreinkommens) — dies ist KEINE feste Unterhaltsformel wie bei Kindes-
 *    oder Ehegattenunterhalt, sondern nur der rechnerische Rahmen; das tatsächlich
 *    geschuldete Ergebnis hängt zusätzlich von Vermögen, weiteren Verpflichtungen und
 *    der Einzelfallprüfung durch das Sozialamt/Gericht ab.
 * @param {number} einkommenBruttoJahr Bruttojahreseinkommen des unterhaltspflichtigen Kindes
 * @param {number} einkommenNettoMonat bereinigtes monatliches Nettoeinkommen
 */
function berechneElternunterhalt(einkommenBruttoJahr, einkommenNettoMonat) {
  if (einkommenBruttoJahr <= 100000) {
    return { pflichtig: false };
  }
  var selbstbehalt = 2650 + 0.7 * Math.max(0, einkommenNettoMonat - 2650);
  var unterhaltMax = Math.max(0, einkommenNettoMonat - selbstbehalt);
  return {
    pflichtig: true,
    selbstbehalt: Math.round(selbstbehalt * 100) / 100,
    unterhaltMax: Math.round(unterhaltMax * 100) / 100,
  };
}

/**
 * Mangelfallberechnung nach Anmerkung C: reicht das Einkommen des Pflichtigen nach
 * Abzug des Selbstbehalts nicht für die Summe der Zahlbeträge aller gleichrangigen
 * Kinder (§ 1609 Nr. 1 BGB), wird die verbleibende Verteilungsmasse proportional
 * zu den Einsatzbeträgen (= normale Zahlbeträge) aufgeteilt.
 * Validiert gegen das amtliche Beispiel der Tabelle 2026 (1.750€, Kinder 18/7/5 →
 * 107,60/105,02/87,38€).
 * @param {number} einkommen bereinigtes Nettoeinkommen des Pflichtigen
 * @param {number[]} kinderAlter Alter jedes Kindes
 * @param {boolean} erwerbstaetig für den Selbstbehalt (1.450€ erwerbstätig / 1.200€ nicht)
 */
function berechneMangelfall(einkommen, kinderAlter, erwerbstaetig) {
  var selbstbehalt = erwerbstaetig ? DT_SELBSTBEHALT_KIND.erwerb : DT_SELBSTBEHALT_KIND.nichtErwerb;
  var verteilungsmasse = Math.max(0, einkommen - selbstbehalt);
  var einsatzbetraege = kinderAlter.map(function (alter) {
    var r = berechneKindesunterhalt(einkommen, alter);
    return r.ueberTabelle ? 0 : r.zahlbetrag;
  });
  var summeEinsatz = einsatzbetraege.reduce(function (a, b) { return a + b; }, 0);
  var mangelfall = verteilungsmasse < summeEinsatz;
  var kinder = kinderAlter.map(function (alter, i) {
    var einsatz = einsatzbetraege[i];
    var betrag = mangelfall ? (summeEinsatz > 0 ? (einsatz * verteilungsmasse) / summeEinsatz : 0) : einsatz;
    return { alter: alter, einsatzbetrag: Math.round(einsatz * 100) / 100, zahlbetrag: Math.round(betrag * 100) / 100 };
  });
  return {
    mangelfall: mangelfall,
    selbstbehalt: selbstbehalt,
    verteilungsmasse: Math.round(verteilungsmasse * 100) / 100,
    summeEinsatz: Math.round(summeEinsatz * 100) / 100,
    kinder: kinder,
  };
}

function euro(n) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
}
