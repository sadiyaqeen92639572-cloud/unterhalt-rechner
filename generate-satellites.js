#!/usr/bin/env node
var core = require('./generate-pages.js');
var writePage = core.writePage;
var renderFaq = core.renderFaq;
var eeatSection = core.eeatSection;
var RDG = core.RDG_DISCLAIMER;

var DISCLAIMER_HTML = '<div class="disclaimer-banner"><strong>Hinweis:</strong> ' + RDG + '</div>';

// ---------------------------------------------------------------------------
// 1. Kindesunterhalt-Rechner (Detailrechner, bis zu 3 Kinder)
// ---------------------------------------------------------------------------
var kindFaq = [
  { q: 'Wie werden mehrere Kinder bei der Düsseldorfer Tabelle berücksichtigt?', a: 'Die Tabelle geht im Regelfall von zwei Unterhaltsberechtigten aus (Anmerkung I). Bei einer größeren oder geringeren Anzahl können Ab- oder Zuschläge durch Einstufung in eine niedrigere oder höhere Einkommensgruppe angemessen sein — dies liegt im gerichtlichen Ermessen und folgt keiner festen Formel. Bei 3 oder mehr unterhaltsberechtigten Personen empfehlen wir eine anwaltliche Einzelfallprüfung, da wir hier keine erfundene Herabstufungsregel anwenden.' },
  { q: 'Was bedeutet "unterhalt mehrere kinder"?', a: 'Je mehr unterhaltsberechtigte Kinder ein Elternteil hat, desto mehr wird das verfügbare Einkommen aufgeteilt. Reicht das Einkommen nicht für den Mindestbedarf aller Kinder, kommt es zur Mangelfallberechnung (siehe Anmerkung C der Düsseldorfer Tabelle) — hier haben Kinder laut § 1609 Nr. 1 BGB Vorrang vor anderen Unterhaltsberechtigten.' },
  { q: 'Zählt das Kindergeld für jedes Kind gleich?', a: 'Ja, das Kindergeld beträgt 2026 einheitlich 259 € je Kind, unabhängig von der Geburtenfolge. Bei minderjährigen Kindern wird die Hälfte (129,50 €) auf den Unterhalt angerechnet, bei volljährigen Kindern das volle Kindergeld.' },
  { q: 'Was ist beim Wechselmodell anders?', a: 'Die Düsseldorfer Tabelle gilt für das Residenzmodell (ein Elternteil betreut hauptsächlich). Beim echten Wechselmodell (annähernd hälftige Betreuung) gibt es keine feste gesetzliche Formel — siehe unseren <a href="/wechselmodell/">Wechselmodell-Rechner</a>.' },
];
var kindBody = '\n<div class="tool-wrapper container">\n  <div class="tool-card no-tabs">\n    ' + DISCLAIMER_HTML + '\n    <div class="form-grid">\n      <div class="form-group">\n        <label>Bereinigtes Nettoeinkommen (Pflichtiger)</label>\n        <input type="number" id="k2-einkommen" value="3200" min="0">\n      </div>\n      <div class="form-group">\n        <label>Anzahl unterhaltsberechtigter Kinder</label>\n        <select id="k2-anzahl" onchange="renderKidAgeInputs()">\n          <option value="1">1 Kind</option>\n          <option value="2" selected>2 Kinder</option>\n          <option value="3">3 Kinder</option>\n          <option value="4">4 Kinder</option>\n        </select>\n      </div>\n      <div class="form-group full" id="k2-ages"></div>\n    </div>\n    <button class="calc-btn" onclick="calcKindDetail()">Kindesunterhalt berechnen</button>\n    <div class="result" id="result-k2">\n      <div class="result-hero">\n        <div class="r-label">Gesamter Zahlbetrag / Monat</div>\n        <div class="r-amount" id="k2-out-total">–</div>\n      </div>\n      <div id="k2-per-child"></div>\n      <div class="result-note" id="k2-out-note"></div>\n    </div>\n  </div>\n</div>\n\n<div class="content container">\n  <h2 class="section-title">Kindesunterhalt berechnen — so funktioniert die Düsseldorfer Tabelle</h2>\n  <p>Der Kindesunterhalt richtet sich nach zwei Faktoren: dem bereinigten Nettoeinkommen des barunterhaltspflichtigen Elternteils (Einstufung in eine von 15 Einkommensgruppen) und dem Alter des Kindes (4 Altersstufen). Der resultierende Tabellenbetrag ist der Bedarf — davon wird das anteilige Kindergeld abgezogen, um den tatsächlichen Zahlbetrag zu erhalten.</p>\n  <div class="index-formula">Zahlbetrag = Tabellenbetrag(Einkommensgruppe, Altersstufe) − Kindergeldanteil</div>\n  <p>Bei mehreren Kindern wird jedes Kind einzeln nach seiner Altersstufe berechnet, aber die Einkommensgruppe basiert auf dem Regelfall von zwei Unterhaltsberechtigten. Bei abweichender Anzahl können Ab- oder Zuschläge angemessen sein — eine feste Formel dafür gibt es nicht, hier braucht es im Zweifel eine anwaltliche Einschätzung.</p>\n\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(kindFaq) + '\n</div>\n' + eeatSection(true) + '\n';

var kindExtraScript = '<script>\nfunction renderKidAgeInputs() {\n  var n = parseInt(document.getElementById(\'k2-anzahl\').value) || 1;\n  var wrap = document.getElementById(\'k2-ages\');\n  var html = \'<label>Alter der Kinder</label><div class="form-grid" style="margin-top:6px">\';\n  for (var i = 0; i < n; i++) {\n    html += \'<input type="number" class="k2-age-input" min="0" max="25" value="\' + (8 + i * 3) + \'" style="margin-bottom:6px">\';\n  }\n  html += \'</div>\';\n  wrap.innerHTML = html;\n}\nfunction calcKindDetail() {\n  var einkommen = parseFloat(document.getElementById(\'k2-einkommen\').value) || 0;\n  var ageInputs = document.querySelectorAll(\'.k2-age-input\');\n  var total = 0;\n  var rowsHtml = \'<div class="table-wrap"><table class="dt-table"><tr><th>Kind</th><th>Alter</th><th>Bedarf</th><th>Kindergeld</th><th>Zahlbetrag</th></tr>\';\n  var ueberTabelle = false;\n  ageInputs.forEach(function (inp, i) {\n    var alter = parseInt(inp.value) || 0;\n    var res = berechneKindesunterhalt(einkommen, alter);\n    if (res.ueberTabelle) { ueberTabelle = true; return; }\n    total += res.zahlbetrag;\n    rowsHtml += \'<tr><td>Kind \' + (i + 1) + \'</td><td>\' + alter + \' J.</td><td>\' + euro(res.bedarf) + \'</td><td>\' + euro(res.kindergeldAnteil) + \'</td><td><strong>\' + euro(res.zahlbetrag) + \'</strong></td></tr>\';\n  });\n  rowsHtml += \'</table></div>\';\n  document.getElementById(\'k2-per-child\').innerHTML = rowsHtml;\n  if (ueberTabelle) {\n    document.getElementById(\'k2-out-total\').textContent = \'über Tabelle\';\n    document.getElementById(\'k2-out-note\').textContent = \'Einkommen über 11.200 € — außerhalb der Tabelle, individuelle Berechnung nötig.\';\n    document.getElementById(\'k2-out-note\').classList.add(\'warn\');\n  } else {\n    document.getElementById(\'k2-out-total\').textContent = euro(total);\n    document.getElementById(\'k2-out-note\').textContent = ageInputs.length !== 2 ? \'Hinweis: Die Tabelle geht vom Regelfall zweier Unterhaltsberechtigter aus. Bei \' + ageInputs.length + \' Kindern kann eine Ab- oder Höherstufung angemessen sein — nicht automatisch berücksichtigt, bitte anwaltlich prüfen lassen.\' : \'${RDG}\';\n    document.getElementById(\'k2-out-note\').classList.toggle(\'warn\', ageInputs.length !== 2);\n  }\n  showResult(\'result-k2\');\n}\ndocument.addEventListener(\'DOMContentLoaded\', renderKidAgeInputs);\n</script>'.replace('${RDG}', RDG.replace(/'/g, "\\'"));

writePage({
  href: '/kindesunterhalt-rechner/',
  title: 'Kindesunterhalt berechnen 2026 — Rechner nach Düsseldorfer Tabelle',
  metaDescription: 'Kindesunterhalt berechnen für mehrere Kinder nach der Düsseldorfer Tabelle 2026, inkl. Kindergeldanrechnung. Kostenlos und unverbindlich.',
  h1: 'Kindesunterhalt-Rechner',
  tagline: 'Kindesunterhalt für 1-4 Kinder berechnen — Düsseldorfer Tabelle 2026',
  hasCalc: true,
  webApp: true,
  faq: kindFaq,
  body: kindBody,
  extraScript: kindExtraScript,
});

// ---------------------------------------------------------------------------
// 2. Ehegattenunterhalt-Rechner
// ---------------------------------------------------------------------------
var eheFaq = [
  { q: 'Was ist der Unterschied zwischen Trennungsunterhalt und nachehelichem Unterhalt?', a: 'Trennungsunterhalt (§ 1361 BGB) gilt für die Zeit zwischen Trennung und rechtskräftiger Scheidung. Nachehelicher Unterhalt (§§ 1569 ff. BGB) gilt danach und ist strenger an Voraussetzungen geknüpft (z. B. Betreuung gemeinsamer Kinder, Alter, Krankheit, Erwerbslosigkeit). Die Berechnungsformel (45%/50%-Differenzmethode) ist bei beiden identisch.' },
  { q: 'Was ist die 3/7-Methode?', a: 'Die 3/7-Methode ist eine in der Praxis verbreitete vereinfachte Faustformel (3/7 der Einkommensdifferenz), die bei reinem Erwerbseinkommen zu nahezu identischen Ergebnissen wie die amtliche 45%-Quote der Düsseldorfer Tabelle führt. Unser Rechner verwendet die amtliche 45%/50%-Methode.' },
  { q: 'Wie lange muss Ehegattenunterhalt gezahlt werden?', a: 'Es gibt keine feste gesetzliche Frist — die Dauer hängt von Ehedauer, Alter, Betreuung gemeinsamer Kinder und der Möglichkeit zur eigenen Erwerbstätigkeit ab. Das Gesetz sieht grundsätzlich Eigenverantwortung nach der Scheidung vor (§ 1569 BGB), mit Ausnahmen.' },
  { q: 'Wird mein Selbstbehalt berücksichtigt?', a: 'Ja. Der Selbstbehalt gegenüber dem getrennt lebenden oder geschiedenen Ehegatten beträgt 2026 1.600 € (erwerbstätig) bzw. 1.475 € (nicht erwerbstätig). Unser Rechner begrenzt den Unterhalt automatisch auf diesen Betrag.' },
];
var eheBody = '\n<div class="tool-wrapper container">\n  <div class="tool-card no-tabs">\n    ' + DISCLAIMER_HTML + '\n    <div class="form-grid">\n      <div class="form-group"><label>Nettoeinkommen Pflichtiger</label><input type="number" id="e2-pflichtig" value="3800" min="0"></div>\n      <div class="form-group"><label>Nettoeinkommen Berechtigter</label><input type="number" id="e2-berechtigt" value="900" min="0"></div>\n      <div class="form-group full">\n        <label>Pflichtiger ist</label>\n        <div class="radio-group">\n          <div class="radio-opt"><input type="radio" name="e2-erwerb" id="e2-erwerb-ja" checked><label for="e2-erwerb-ja">Erwerbstätig (45%)</label></div>\n          <div class="radio-opt"><input type="radio" name="e2-erwerb" id="e2-erwerb-nein"><label for="e2-erwerb-nein">Nicht erwerbstätig / Rentner (50%)</label></div>\n        </div>\n      </div>\n    </div>\n    <button class="calc-btn" onclick="calcEheDetail()">Ehegattenunterhalt berechnen</button>\n    <div class="result" id="result-e2">\n      <div class="result-hero"><div class="r-label">Monatlicher Unterhalt</div><div class="r-amount" id="e2-out-betrag">–</div></div>\n      <div class="result-grid">\n        <div class="r-stat"><div class="sv" id="e2-out-quote">–</div><div class="sl">Quote</div></div>\n        <div class="r-stat"><div class="sv" id="e2-out-diff">–</div><div class="sl">Einkommensdifferenz</div></div>\n        <div class="r-stat"><div class="sv" id="e2-out-selbst">–</div><div class="sl">Selbstbehalt</div></div>\n      </div>\n      <div class="result-note" id="e2-out-note"></div>\n    </div>\n  </div>\n</div>\n\n<div class="content container">\n  <h2 class="section-title">Ehegattenunterhalt / nachehelicher Unterhalt berechnen</h2>\n  <p>Die Düsseldorfer Tabelle regelt in Anmerkung B.I die amtliche Berechnungsmethode für Ehegattenunterhalt: Hat der Berechtigte kein eigenes Einkommen, erhält er 45% des anrechenbaren Erwerbseinkommens des Pflichtigen (50% bei einem nicht erwerbstätigen Pflichtigen, z. B. Rentner). Hat der Berechtigte ebenfalls Einkommen, wird die Quote auf die Differenz beider Einkommen angewendet.</p>\n  <div class="index-formula">Unterhalt = 45% × (Einkommen Pflichtiger − Einkommen Berechtigter)<br>(50% falls Pflichtiger nicht erwerbstätig)<br>begrenzt durch Selbstbehalt: 1.600 € (erwerbstätig) / 1.475 € (nicht erwerbstätig)</div>\n  <p>Diese Formel gilt sowohl für Trennungsunterhalt als auch für nachehelichen Unterhalt — die Berechnung ist identisch, nur die rechtlichen Voraussetzungen unterscheiden sich. Siehe auch unseren <a href="/trennungsunterhalt-rechner/">Trennungsunterhalt-Rechner</a>.</p>\n\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(eheFaq) + '\n</div>\n' + eeatSection(true) + '\n';

function eheScript(prefix, out) {
  return "<script>\nfunction calc" + out + "() {\n  var pflichtig = parseFloat(document.getElementById('" + prefix + "-pflichtig').value) || 0;\n  var berechtigt = parseFloat(document.getElementById('" + prefix + "-berechtigt').value) || 0;\n  var erwerbstaetig = document.getElementById('" + prefix + "-erwerb-ja').checked;\n  var res = berechneEhegattenunterhalt(pflichtig, berechtigt, erwerbstaetig);\n  document.getElementById('" + prefix + "-out-betrag').textContent = euro(res.unterhalt);\n  document.getElementById('" + prefix + "-out-quote').textContent = res.quote + '%';\n  document.getElementById('" + prefix + "-out-diff').textContent = euro(Math.max(0, pflichtig - berechtigt));\n  document.getElementById('" + prefix + "-out-selbst').textContent = euro(res.selbstbehalt);\n  var note = document.getElementById('" + prefix + "-out-note');\n  if (res.selbstbehaltUnterschritten) {\n    note.textContent = 'Der rechnerische Unterhalt wurde auf den Selbstbehalt des Pflichtigen begrenzt.';\n    note.classList.add('warn');\n  } else {\n    note.textContent = '" + RDG.replace(/'/g, "\\'") + "';\n    note.classList.remove('warn');\n  }\n  showResult('result-" + prefix + "');\n}\n</script>";
}

writePage({
  href: '/ehegattenunterhalt-rechner/',
  title: 'Ehegattenunterhalt berechnen 2026 — Rechner (45%/50%-Methode)',
  metaDescription: 'Ehegattenunterhalt und nachehelichen Unterhalt berechnen nach der amtlichen 45%/50%-Differenzmethode der Düsseldorfer Tabelle 2026. Kostenlos.',
  h1: 'Ehegattenunterhalt-Rechner',
  tagline: 'Nachehelicher Unterhalt nach der amtlichen 45%/50%-Methode berechnen',
  hasCalc: true,
  webApp: true,
  faq: eheFaq,
  body: eheBody,
  extraScript: eheScript('e2', 'EheDetail'),
});

// ---------------------------------------------------------------------------
// 3. Trennungsunterhalt-Rechner (gleiche Formel, andere Zielgruppe/Framing)
// ---------------------------------------------------------------------------
var trennFaq = [
  { q: 'Ab wann steht mir Trennungsunterhalt zu?', a: 'Ab dem Zeitpunkt der Trennung (§ 1361 BGB), unabhängig davon, ob bereits ein Scheidungsantrag gestellt wurde. Voraussetzung ist eine Bedürftigkeit des Berechtigten und Leistungsfähigkeit des Pflichtigen.' },
  { q: 'Muss ich während der Trennung arbeiten gehen?', a: 'Im ersten Trennungsjahr besteht in der Regel keine Erwerbsobliegenheit, danach kann abhängig von Kinderbetreuung, Alter und bisheriger Erwerbsbiografie eine (Teilzeit-)Erwerbstätigkeit erwartet werden.' },
  { q: 'Kann sich Trennungsunterhalt ändern, wenn ich mich scheiden lasse?', a: 'Ja — nach der Scheidung gilt der nacheheliche Unterhalt (§§ 1569 ff. BGB), der strengeren Voraussetzungen unterliegt als der Trennungsunterhalt. Die Berechnungsformel selbst bleibt identisch (45%/50%-Methode).' },
  { q: 'Wird Trennungsunterhalt miete abgezogen?', a: 'Wohnkosten können bei der Ermittlung des bereinigten Nettoeinkommens (Abzugsposten) eine Rolle spielen, insbesondere wenn ein Ehegatte die gemeinsame Wohnung allein weiter finanziert. Dies ist einzelfallabhängig und nicht pauschal in diesem Rechner abgebildet — anwaltliche Prüfung empfohlen.' },
];
var trennBody = '\n<div class="tool-wrapper container">\n  <div class="tool-card no-tabs">\n    ' + DISCLAIMER_HTML + '\n    <div class="form-grid">\n      <div class="form-group"><label>Nettoeinkommen (höher verdienender Ehegatte)</label><input type="number" id="t2-pflichtig" value="3500" min="0"></div>\n      <div class="form-group"><label>Nettoeinkommen (anderer Ehegatte)</label><input type="number" id="t2-berechtigt" value="1200" min="0"></div>\n      <div class="form-group full">\n        <label>Höher verdienender Ehegatte ist</label>\n        <div class="radio-group">\n          <div class="radio-opt"><input type="radio" name="t2-erwerb" id="t2-erwerb-ja" checked><label for="t2-erwerb-ja">Erwerbstätig (45%)</label></div>\n          <div class="radio-opt"><input type="radio" name="t2-erwerb" id="t2-erwerb-nein"><label for="t2-erwerb-nein">Nicht erwerbstätig (50%)</label></div>\n        </div>\n      </div>\n    </div>\n    <button class="calc-btn" onclick="calcTrennDetail()">Trennungsunterhalt berechnen</button>\n    <div class="result" id="result-t2">\n      <div class="result-hero"><div class="r-label">Monatlicher Trennungsunterhalt</div><div class="r-amount" id="t2-out-betrag">–</div></div>\n      <div class="result-grid">\n        <div class="r-stat"><div class="sv" id="t2-out-quote">–</div><div class="sl">Quote</div></div>\n        <div class="r-stat"><div class="sv" id="t2-out-diff">–</div><div class="sl">Einkommensdifferenz</div></div>\n        <div class="r-stat"><div class="sv" id="t2-out-selbst">–</div><div class="sl">Selbstbehalt</div></div>\n      </div>\n      <div class="result-note" id="t2-out-note"></div>\n    </div>\n  </div>\n</div>\n\n<div class="content container">\n  <h2 class="section-title">Trennungsunterhalt berechnen</h2>\n  <p>Trennungsunterhalt (§ 1361 BGB) steht dem bedürftigen Ehegatten ab dem Zeitpunkt der Trennung zu — unabhängig vom späteren Scheidungsverfahren. Die Berechnung folgt derselben amtlichen 45%/50%-Differenzmethode wie der nacheheliche Unterhalt.</p>\n  <div class="index-formula">Trennungsunterhalt = 45% × (Einkommen höher verdienender Ehegatte − Einkommen anderer Ehegatte)<br>(50% falls Pflichtiger nicht erwerbstätig)</div>\n  <p>Im Unterschied zum nachehelichen Unterhalt ist während der Trennungszeit die Erwerbsobliegenheit des bedürftigen Ehegatten in der Regel geringer — vor allem im ersten Trennungsjahr wird meist keine sofortige Vollzeittätigkeit erwartet.</p>\n\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(trennFaq) + '\n</div>\n' + eeatSection(true) + '\n';

writePage({
  href: '/trennungsunterhalt-rechner/',
  title: 'Trennungsunterhalt berechnen 2026 — Rechner nach § 1361 BGB',
  metaDescription: 'Trennungsunterhalt berechnen für die Zeit der Trennung nach § 1361 BGB. Amtliche 45%/50%-Methode, kostenlos und unverbindlich.',
  h1: 'Trennungsunterhalt-Rechner',
  tagline: 'Unterhalt während der Trennungszeit berechnen — § 1361 BGB',
  hasCalc: true,
  webApp: true,
  faq: trennFaq,
  body: trennBody,
  extraScript: eheScript('t2', 'TrennDetail'),
});

// ---------------------------------------------------------------------------
// 4. Unterhaltstabelle (volle Tabelle, kein Formular)
// ---------------------------------------------------------------------------
var DT = require('./assets/dt-data.js');
var DT_ARCHIV = {
  2026: { data: DT.DT_TABELLE, kontrolleZeile1: '1.200 / 1.450', quelle: 'https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2026/DT_2026.pdf' },
  2025: Object.assign({ quelle: 'https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2025/DT_2025_Neufassung-m-geaenderter-Fussnote.pdf' }, (function () { var d = require('./assets/dt-data-2025.js'); return { data: d.DT_TABELLE, kontrolleZeile1: d.kontrolleZeile1 }; })()),
  2024: Object.assign({ quelle: 'https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2024/2023_12_11_Duesseldorfer_Tabelle_-2024.pdf' }, (function () { var d = require('./assets/dt-data-2024.js'); return { data: d.DT_TABELLE, kontrolleZeile1: d.kontrolleZeile1 }; })()),
  2023: Object.assign({ quelle: 'https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2023/Duesseldorfer-Tabelle-2023.pdf' }, (function () { var d = require('./assets/dt-data-2023.js'); return { data: d.DT_TABELLE, kontrolleZeile1: d.kontrolleZeile1 }; })()),
};
var tabFaq = [
  { q: 'Wie oft ändert sich die Düsseldorfer Tabelle?', a: 'In der Regel jährlich zum 1. Januar, gelegentlich auch unterjährig bei gesetzlichen Änderungen des Mindestunterhalts. Die aktuelle Fassung gilt seit 01.01.2026 — die Vorjahre 2023-2025 finden Sie im Archiv unten.' },
  { q: 'Was ist die Düsseldorfer Tabelle Tabelle Zahlbeträge?', a: 'Ein Anhang zur Haupttabelle, der die Beträge nach Abzug des Kindergeldanteils zeigt — also die tatsächlich zu zahlenden Beträge, nicht nur den theoretischen Bedarf.' },
  { q: 'Was ist der Bedarfskontrollbetrag?', a: 'Ein Mindestbetrag, der dem Pflichtigen nach Zahlung des Unterhalts verbleiben soll, um eine ausgewogene Verteilung zwischen ihm und den Kindern sicherzustellen. Wird er unterschritten, kann der Tabellenbetrag der nächst niedrigeren Einkommensgruppe angesetzt werden.' },
  { q: 'Welche frühere Tabelle gilt für einen Unterhaltsanspruch aus 2024?', a: 'Für die Berechnung rückwirkender oder vergangener Ansprüche gilt die zum jeweiligen Zeitpunkt gültige Fassung — nutzen Sie dafür die Archiv-Tabelle des betreffenden Jahres unten, nicht die aktuelle 2026er-Tabelle.' },
];
function tableHtml(tabelle, kontrolleZeile1) {
  var rows = tabelle.map(function (r, i) {
    return '<tr><td>' + (i + 1) + '</td><td>' + (i === 0 ? 'bis' : (tabelle[i - 1].bis + 1).toLocaleString('de-DE') + ' –') + ' ' + r.bis.toLocaleString('de-DE') + ' €</td><td>' + r.a1 + ' €</td><td>' + r.a2 + ' €</td><td>' + r.a3 + ' €</td><td>' + r.a4 + ' €</td><td>' + r.pct + '%</td><td>' + (r.kontrolle ? r.kontrolle.toLocaleString('de-DE') + ' €' : kontrolleZeile1 + ' €') + '</td></tr>';
  }).join('');
  return '<div class="table-wrap"><table class="dt-table"><tr><th>Gr.</th><th>Nettoeinkommen</th><th>0-5 J.</th><th>6-11 J.</th><th>12-17 J.</th><th>ab 18 J.</th><th>%</th><th>Kontrollbetrag</th></tr>' + rows + '</table></div>';
}
var tabYears = [2026, 2025, 2024, 2023];
var tabYearTabsHtml = tabYears.map(function (y, i) {
  return '<button class="tab-btn' + (i === 0 ? ' active' : '') + '" onclick="switchTab(\'tab-year-' + y + '\', this)">' + y + '</button>';
}).join('');
var tabYearPanelsHtml = tabYears.map(function (y, i) {
  var t = DT_ARCHIV[y];
  return '<div id="tab-year-' + y + '" class="tab-panel' + (i === 0 ? ' active' : '') + '">' + tableHtml(t.data, t.kontrolleZeile1) + '<p style="font-size:0.85rem;color:var(--muted);margin-top:10px">Quelle: <a href="' + t.quelle + '" target="_blank" rel="noopener">OLG Düsseldorf, PDF, Stand 01.01.' + y + '</a>. Werte wörtlich übernommen.</p></div>';
}).join('');
var tabBody = '\n<div class="container-wide">\n  <div style="margin-top:-40px;position:relative;z-index:10;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.1);border:1px solid var(--border);padding:24px;">\n    ' + DISCLAIMER_HTML + '\n    <h2 style="font-size:1.1rem;margin-bottom:10px;">Düsseldorfer Tabelle — Archiv 2023-2026 (Bedarfssätze)</h2>\n    <div class="tab-nav" style="margin-bottom:16px;border-radius:8px;">' + tabYearTabsHtml + '</div>\n    ' + tabYearPanelsHtml + '\n  </div>\n</div>\n\n<div class="content container">\n  <h2 class="section-title">Was zeigt die Tabelle?</h2>\n  <p>Die Düsseldorfer Tabelle ordnet dem bereinigten monatlichen Nettoeinkommen des barunterhaltspflichtigen Elternteils eine von 15 Einkommensgruppen zu. Für jede Gruppe gibt es vier Bedarfssätze, gestaffelt nach dem Alter des Kindes. Die angegebenen Beträge sind Bedarfssätze (Tabellenbeträge) — der tatsächliche Zahlbetrag ergibt sich erst nach Abzug des anteiligen Kindergelds. Nutzen Sie dafür unseren <a href="/kindesunterhalt-rechner/">Kindesunterhalt-Rechner</a> (aktuelle Werte 2026).</p>\n  <p>Oben finden Sie zusätzlich das Archiv der Vorjahre 2023-2025 — nützlich für rückwirkende Ansprüche oder zum Vergleich der Entwicklung der Bedarfssätze über die Jahre.</p>\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(tabFaq) + '\n</div>\n' + eeatSection(true) + '\n';

writePage({
  href: '/unterhaltstabelle/',
  title: 'Düsseldorfer Tabelle 2026 (+ Archiv 2023-2025) — vollständige Unterhaltstabelle',
  metaDescription: 'Die vollständige Düsseldorfer Tabelle 2026 mit allen 15 Einkommensgruppen, 4 Altersstufen und Bedarfskontrollbeträgen — plus Archiv 2023-2025. Amtliche Werte.',
  h1: 'Düsseldorfer Tabelle 2026',
  tagline: 'Alle 15 Einkommensgruppen im Überblick — plus Archiv der Vorjahre 2023-2025',
  hasCalc: false,
  webApp: false,
  faq: tabFaq,
  body: tabBody,
});

// ---------------------------------------------------------------------------
// 5. Selbstbehalt-Rechner
// ---------------------------------------------------------------------------
var selbstFaq = [
  { q: 'Was ist der Unterschied zwischen notwendigem und angemessenem Selbstbehalt?', a: 'Der notwendige Selbstbehalt (1.200 € / 1.450 €) gilt gegenüber minderjährigen und privilegierten volljährigen Kindern (bis 21, im Haushalt eines Elternteils, in allgemeiner Schulausbildung). Der angemessene Selbstbehalt (1.750 €) gilt gegenüber sonstigen volljährigen Kindern.' },
  { q: 'Was ist der Bedarfskontrollbetrag?', a: 'Nicht identisch mit dem Selbstbehalt — er soll eine ausgewogene Verteilung des Einkommens zwischen Pflichtigem und Kindern sicherstellen. Wird er unterschritten, kann eine niedrigere Einkommensgruppe angesetzt werden.' },
  { q: 'Ändert sich der Selbstbehalt gegenüber dem Ehegatten?', a: 'Ja, gegenüber dem getrennt lebenden oder geschiedenen Ehegatten gilt ein eigener Selbstbehalt: 1.600 € (erwerbstätig) bzw. 1.475 € (nicht erwerbstätig), separat von dem gegenüber Kindern.' },
];
var selbstBody = '\n<div class="tool-wrapper container">\n  <div class="tool-card no-tabs">\n    ' + DISCLAIMER_HTML + '\n    <div class="form-grid">\n      <div class="form-group full">\n        <label>Gegenüber wem?</label>\n        <div class="radio-group">\n          <div class="radio-opt"><input type="radio" name="s-typ" id="s-typ-kind" checked><label for="s-typ-kind">Minderjähriges Kind</label></div>\n          <div class="radio-opt"><input type="radio" name="s-typ" id="s-typ-erw-kind"><label for="s-typ-erw-kind">Sonstiges volljähriges Kind</label></div>\n          <div class="radio-opt"><input type="radio" name="s-typ" id="s-typ-ehe"><label for="s-typ-ehe">Ehegatte (getrennt/geschieden)</label></div>\n        </div>\n      </div>\n      <div class="form-group full">\n        <label>Erwerbsstatus</label>\n        <div class="radio-group">\n          <div class="radio-opt"><input type="radio" name="s-erwerb" id="s-erwerb-ja" checked><label for="s-erwerb-ja">Erwerbstätig</label></div>\n          <div class="radio-opt"><input type="radio" name="s-erwerb" id="s-erwerb-nein"><label for="s-erwerb-nein">Nicht erwerbstätig</label></div>\n        </div>\n      </div>\n    </div>\n    <button class="calc-btn" onclick="calcSelbstbehalt()">Selbstbehalt anzeigen</button>\n    <div class="result" id="result-s">\n      <div class="result-hero"><div class="r-label">Selbstbehalt 2026</div><div class="r-amount" id="s-out-betrag">–</div><div class="r-sub" id="s-out-sub"></div></div>\n      <div class="result-note">' + RDG + '</div>\n    </div>\n  </div>\n</div>\n\n<div class="content container">\n  <h2 class="section-title">Selbstbehalt-Übersicht 2026</h2>\n  <div class="table-wrap"><table class="dt-table">\n    <tr><th>Gegenüber</th><th>Nicht erwerbstätig</th><th>Erwerbstätig</th></tr>\n    <tr><td>Minderjährige / privilegierte volljährige Kinder</td><td>1.200 €</td><td>1.450 €</td></tr>\n    <tr><td>Sonstige volljährige Kinder</td><td colspan="2">1.750 €</td></tr>\n    <tr><td>Getrennt lebender / geschiedener Ehegatte</td><td>1.475 €</td><td>1.600 €</td></tr>\n    <tr><td>Eltern (Elternunterhalt)</td><td colspan="2">2.650 € (zzgl. 70% des Mehreinkommens)</td></tr>\n  </table></div>\n  <p style="font-size:0.85rem;color:var(--muted)">Quelle: Düsseldorfer Tabelle, Anmerkungen VII &amp; B.II/D.I, Stand 01.01.2026.</p>\n\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(selbstFaq) + '\n</div>\n' + eeatSection(true) + '\n';

var selbstScript = "<script>\nfunction calcSelbstbehalt() {\n  var typ = document.getElementById('s-typ-ehe').checked ? 'ehe' : (document.getElementById('s-typ-erw-kind').checked ? 'erwkind' : 'kind');\n  var erwerb = document.getElementById('s-erwerb-ja').checked;\n  var betrag, sub;\n  if (typ === 'kind') { betrag = erwerb ? 1450 : 1200; sub = 'Minderjähriges / privilegiertes volljähriges Kind'; }\n  else if (typ === 'erwkind') { betrag = 1750; sub = 'Sonstiges volljähriges Kind (unabhängig vom Erwerbsstatus)'; }\n  else { betrag = erwerb ? 1600 : 1475; sub = 'Getrennt lebender / geschiedener Ehegatte'; }\n  document.getElementById('s-out-betrag').textContent = euro(betrag);\n  document.getElementById('s-out-sub').textContent = sub;\n  showResult('result-s');\n}\n</script>";

writePage({
  href: '/selbstbehalt/',
  title: 'Selbstbehalt beim Unterhalt 2026 — Rechner & Übersicht',
  metaDescription: 'Selbstbehalt 2026 gegenüber Kindern, Ehegatten und Eltern berechnen. Notwendiger und angemessener Selbstbehalt nach Düsseldorfer Tabelle.',
  h1: 'Selbstbehalt-Rechner',
  tagline: 'Eigenbedarf 2026 gegenüber Kindern, Ehegatten und Eltern',
  hasCalc: true,
  webApp: true,
  faq: selbstFaq,
  body: selbstBody,
  extraScript: selbstScript,
});

// ---------------------------------------------------------------------------
// 6. Wechselmodell-Rechner
// ---------------------------------------------------------------------------
var wechselFaq = [
  { q: 'Gibt es eine feste Formel für den Unterhalt beim Wechselmodell?', a: 'Nein. Die Düsseldorfer Tabelle gilt für das Residenzmodell. Beim echten Wechselmodell (annähernd hälftige Betreuung) gibt es keine gesetzlich fixierte Formel — der BGH verlangt eine Einzelfallbetrachtung, bei der Einkommensdifferenz und Mehrbedarf (z. B. doppelte Kinderzimmer) berücksichtigt werden.' },
  { q: 'Ab wann gilt ein Betreuungsmodell als Wechselmodell?', a: 'In der Rechtsprechung wird meist von einem Wechselmodell gesprochen, wenn die Betreuungsanteile bei etwa 40-60% bis 50-50% liegen. Bei deutlich überwiegender Betreuung durch einen Elternteil gilt weiterhin das Residenzmodell und die reguläre Düsseldorfer Tabelle.' },
  { q: 'Muss ich beim Wechselmodell trotzdem Kindesunterhalt zahlen?', a: 'Ja, wenn die Einkommen der Eltern unterschiedlich hoch sind. Der besser verdienende Elternteil gleicht die Differenz anteilig aus, da beide Elternteile gemeinsam für den Barbedarf des Kindes aufkommen.' },
];
var wechselBody = '\n<div class="tool-wrapper container">\n  <div class="tool-card no-tabs">\n    <div class="disclaimer-banner"><strong>Wichtiger Hinweis:</strong> Für das Wechselmodell gibt es <strong>keine gesetzlich fixierte Berechnungsformel</strong>. Der folgende Rechner zeigt nur eine stark vereinfachte Orientierung (hälftige Einkommensdifferenz) — kein Ersatz für eine anwaltliche Berechnung Ihres Einzelfalls. ' + RDG + '</div>\n    <div class="form-grid">\n      <div class="form-group"><label>Nettoeinkommen Elternteil A</label><input type="number" id="w-a" value="3000" min="0"></div>\n      <div class="form-group"><label>Nettoeinkommen Elternteil B</label><input type="number" id="w-b" value="2000" min="0"></div>\n    </div>\n    <button class="calc-btn" onclick="calcWechsel()">Orientierungswert berechnen</button>\n    <div class="result" id="result-w">\n      <div class="result-hero"><div class="r-label">Grober Ausgleichsbetrag / Monat</div><div class="r-amount" id="w-out-betrag">–</div><div class="r-sub">zu zahlen vom besser verdienenden Elternteil</div></div>\n      <div class="result-note warn">Dies ist eine stark vereinfachte Orientierung, keine rechtsverbindliche Berechnung. Beim Wechselmodell spielen zusätzlich Mehrbedarf (z. B. doppelte Ausstattung), Betreuungsanteile und weitere Faktoren eine Rolle — bitte lassen Sie sich anwaltlich beraten.</div>\n    </div>\n  </div>\n</div>\n\n<div class="content container">\n  <h2 class="section-title">Unterhalt beim Wechselmodell</h2>\n  <p>Beim echten Wechselmodell betreuen beide Elternteile das Kind annähernd zu gleichen Teilen. Da die Düsseldorfer Tabelle für das klassische Residenzmodell konzipiert ist, wenden Gerichte hier eine individuelle Einzelfallbetrachtung an: Beide Einkommen werden addiert, der Gesamtbedarf des Kindes (inkl. Mehrbedarf) ermittelt, und die Differenz zwischen den Elterneinkommen anteilig ausgeglichen.</p>\n  <p>Es gibt bewusst <strong>keine feste gesetzliche Formel</strong> — jede Berechnung, die eine exakte Formel vorgibt, wäre irreführend. Unser vereinfachter Rechner oben zeigt nur eine grobe erste Orientierung.</p>\n\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(wechselFaq) + '\n</div>\n' + eeatSection(true) + '\n';

var wechselScript = "<script>\nfunction calcWechsel() {\n  var a = parseFloat(document.getElementById('w-a').value) || 0;\n  var b = parseFloat(document.getElementById('w-b').value) || 0;\n  var ausgleich = berechneWechselmodellAusgleich(a, b);\n  document.getElementById('w-out-betrag').textContent = euro(ausgleich);\n  showResult('result-w');\n}\n</script>";

writePage({
  href: '/wechselmodell/',
  title: 'Unterhaltsrechner Wechselmodell 2026 — Orientierung & Erklärung',
  metaDescription: 'Unterhalt beim Wechselmodell: keine feste gesetzliche Formel, aber Orientierungswerte und Erklärung der gerichtlichen Praxis 2026.',
  h1: 'Wechselmodell-Rechner',
  tagline: 'Unterhalt bei paritätischer Doppelresidenz — Orientierung, keine feste Formel',
  hasCalc: true,
  webApp: true,
  faq: wechselFaq,
  body: wechselBody,
  extraScript: wechselScript,
});

// ---------------------------------------------------------------------------
// 7. Unterhalt ab 18
// ---------------------------------------------------------------------------
var ab18Faq = [
  { q: 'Ändert sich der Unterhalt automatisch mit 18?', a: 'Ja, das Kind wechselt in die 4. Altersstufe der Düsseldorfer Tabelle (höherer Bedarfssatz). Außerdem wird jetzt das volle Kindergeld angerechnet (statt der Hälfte bei Minderjährigen), und beide Elternteile sind anteilig nach ihrem Einkommen barunterhaltspflichtig (nicht mehr nur der nicht betreuende Elternteil).' },
  { q: 'Was gilt für Kinder in Ausbildung oder Studium?', a: 'Lebt das volljährige Kind noch bei einem Elternteil, gilt weiterhin die 4. Altersstufe der Tabelle. Zieht es für Ausbildung/Studium aus, gilt ein Pauschalbedarf von 990 €/Monat (davon bis 440 € Warmmiete), unabhängig vom Elterneinkommen.' },
  { q: 'Muss mein volljähriges Kind selbst etwas beitragen?', a: 'Ja, eigenes Einkommen (z. B. Ausbildungsvergütung abzüglich ausbildungsbedingter Mehrkosten und eines Freibetrags) wird auf den Unterhaltsbedarf angerechnet.' },
];
var ab18Body = '\n<div class="tool-wrapper container">\n  <div class="tool-card no-tabs">\n    ' + DISCLAIMER_HTML + '\n    <div class="form-grid">\n      <div class="form-group full">\n        <label>Situation des volljährigen Kindes</label>\n        <div class="radio-group">\n          <div class="radio-opt"><input type="radio" name="ab18-typ" id="ab18-zuhause" checked><label for="ab18-zuhause">Lebt bei einem Elternteil</label></div>\n          <div class="radio-opt"><input type="radio" name="ab18-typ" id="ab18-ausbildung"><label for="ab18-ausbildung">Eigener Haushalt / Studium auswärts</label></div>\n        </div>\n      </div>\n      <div class="form-group" id="ab18-einkommen-wrap"><label>Summe bereinigtes Nettoeinkommen beider Eltern</label><input type="number" id="ab18-einkommen" value="4200" min="0"></div>\n    </div>\n    <button class="calc-btn" onclick="calcAb18()">Bedarf berechnen</button>\n    <div class="result" id="result-ab18">\n      <div class="result-hero"><div class="r-label">Monatlicher Bedarf</div><div class="r-amount" id="ab18-out-betrag">–</div><div class="r-sub" id="ab18-out-sub"></div></div>\n      <div class="result-note">' + RDG + '</div>\n    </div>\n  </div>\n</div>\n\n<div class="content container">\n  <h2 class="section-title">Unterhalt für volljährige Kinder</h2>\n  <p>Mit Eintritt der Volljährigkeit ändert sich die Unterhaltsberechnung in mehreren Punkten: Beide Elternteile werden nach ihrem Einkommensanteil barunterhaltspflichtig, das volle Kindergeld wird angerechnet, und bei einem eigenen Haushalt (Studium/Ausbildung auswärts) gilt ein fester Pauschalbedarf von 990 €/Monat statt der einkommensabhängigen Tabelle.</p>\n  <div class="index-formula">Bedarf (bei eigenem Haushalt) = 990 € pauschal (davon bis 440 € Warmmiete)<br>Bedarf (bei Eltern wohnhaft) = Tabellenbetrag nach Altersstufe 4, Einkommensgruppe der Eltern</div>\n\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(ab18Faq) + '\n</div>\n' + eeatSection(true) + '\n';

var ab18Script = "<script>\nfunction calcAb18() {\n  var ausbildung = document.getElementById('ab18-ausbildung').checked;\n  if (ausbildung) {\n    document.getElementById('ab18-out-betrag').textContent = euro(990);\n    document.getElementById('ab18-out-sub').textContent = 'Pauschalbedarf, unabhängig vom Elterneinkommen (davon bis 440 € Warmmiete)';\n  } else {\n    var einkommen = parseFloat(document.getElementById('ab18-einkommen').value) || 0;\n    var res = berechneKindesunterhalt(einkommen, 18);\n    if (res.ueberTabelle) {\n      document.getElementById('ab18-out-betrag').textContent = 'über Tabelle';\n      document.getElementById('ab18-out-sub').textContent = 'Einkommen > 11.200 € — individuelle Berechnung nötig';\n    } else {\n      document.getElementById('ab18-out-betrag').textContent = euro(res.bedarf);\n      document.getElementById('ab18-out-sub').textContent = 'Tabellenbetrag Altersstufe 4 (ab 18), Einkommensgruppe ' + res.bracket;\n    }\n  }\n  showResult('result-ab18');\n}\n</script>";

writePage({
  href: '/unterhalt-ab-18/',
  title: 'Unterhalt ab 18 berechnen 2026 — volljährige Kinder',
  metaDescription: 'Unterhalt für volljährige Kinder ab 18 berechnen: Pauschalbedarf 990€ bei eigenem Haushalt oder Tabellenbetrag bei Eltern wohnhaft.',
  h1: 'Unterhalt ab 18',
  tagline: 'Kindesunterhalt für volljährige Kinder — Ausbildung, Studium, eigener Haushalt',
  hasCalc: true,
  webApp: true,
  faq: ab18Faq,
  body: ab18Body,
  extraScript: ab18Script,
});

// ---------------------------------------------------------------------------
// 8. Jugendamt-Berechnung (informational, no calc)
// ---------------------------------------------------------------------------
var jaFaq = [
  { q: 'Kann das Jugendamt den Unterhalt für mich berechnen?', a: 'Ja, über die Beistandschaft (§§ 1712 ff. BGB) berechnet und beurkundet das Jugendamt auf Antrag den Kindesunterhalt kostenlos und unterstützt bei der Durchsetzung — allerdings vertritt es nur das Kind, nicht den betreuenden Elternteil.' },
  { q: 'Ist die Berechnung durch das Jugendamt rechtsverbindlich?', a: 'Die Beurkundung einer Jugendamtsurkunde ist ein vollstreckbarer Titel, vergleichbar mit einem Gerichtsurteil — die zugrunde liegende Berechnung selbst folgt aber genauso der Düsseldorfer Tabelle wie bei einer anwaltlichen Berechnung.' },
  { q: 'Darf das Jobcenter Kindesunterhalt berechnen?', a: 'Das Jobcenter berechnet keinen Kindesunterhalt im familienrechtlichen Sinne, sondern rechnet erhaltenen Unterhalt beim Bürgergeld an. Für die eigentliche Unterhaltsberechnung ist das Jugendamt (Beistandschaft) oder ein Anwalt zuständig.' },
  { q: 'Was kostet die Hilfe des Jugendamts?', a: 'Die Beistandschaft und Beurkundung durch das Jugendamt sind kostenlos.' },
];
var jaBody = '\n<div class="content container" style="padding-top:52px">\n  <h2 class="section-title">Wie hilft das Jugendamt bei der Unterhaltsberechnung?</h2>\n  <p>Über die sogenannte <strong>Beistandschaft</strong> (§§ 1712 ff. BGB) kann der betreuende Elternteil kostenlose Unterstützung des Jugendamts beantragen. Das Jugendamt berechnet den Kindesunterhalt nach der Düsseldorfer Tabelle, beurkundet den Anspruch in einer vollstreckbaren Jugendamtsurkunde und unterstützt bei der Durchsetzung gegenüber dem anderen Elternteil.</p>\n  <div class="steps">\n    <div class="step"><div class="step-n">1</div><h4>Antrag stellen</h4><p>Formloser Antrag auf Beistandschaft beim zuständigen Jugendamt, meist am Wohnort des Kindes.</p></div>\n    <div class="step"><div class="step-n">2</div><h4>Einkommen offenlegen</h4><p>Der barunterhaltspflichtige Elternteil wird zur Auskunft über sein Einkommen aufgefordert.</p></div>\n    <div class="step"><div class="step-n">3</div><h4>Berechnung nach Tabelle</h4><p>Das Jugendamt ermittelt den Zahlbetrag nach der Düsseldorfer Tabelle — Sie können das Ergebnis vorab mit unserem <a href="/kindesunterhalt-rechner/">Kindesunterhalt-Rechner</a> nachvollziehen.</p></div>\n    <div class="step"><div class="step-n">4</div><h4>Beurkundung</h4><p>Der Unterhalt wird in einer Jugendamtsurkunde festgehalten — ein vollstreckbarer Titel wie ein Gerichtsurteil.</p></div>\n  </div>\n  <p><strong>Wichtig:</strong> Das Jugendamt vertritt ausschließlich die Interessen des Kindes, nicht des betreuenden Elternteils. Bei streitigen oder komplexen Fällen (z. B. Wechselmodell, Mangelfall, Auslandsbezug) kann zusätzlich anwaltliche Beratung sinnvoll sein.</p>\n\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(jaFaq) + '\n</div>\n' + eeatSection(true) + '\n';

writePage({
  href: '/jugendamt-berechnung/',
  title: 'Jugendamt Unterhalt berechnen 2026 — Beistandschaft erklärt',
  metaDescription: 'Wie das Jugendamt den Kindesunterhalt kostenlos berechnet und beurkundet: Beistandschaft, Ablauf, Jugendamtsurkunde erklärt.',
  h1: 'Jugendamt & Unterhalt',
  tagline: 'Beistandschaft, Berechnung und Beurkundung durch das Jugendamt',
  hasCalc: false,
  webApp: false,
  faq: jaFaq,
  body: jaBody,
});

// ---------------------------------------------------------------------------
// 9. Unterhalt berechnen lassen (CTA-heavy, lawyer referral)
// ---------------------------------------------------------------------------
var lassenFaq = [
  { q: 'Wann sollte ich den Unterhalt anwaltlich berechnen lassen?', a: 'Bei komplexen Einkommensverhältnissen (Selbstständigkeit, mehrere Einkunftsarten), Mangelfällen, Wechselmodell, Auslandsbezug oder wenn der andere Elternteil die Zahlung verweigert. Unser Rechner ist eine kostenlose Orientierung, ersetzt aber keine Einzelfallprüfung.' },
  { q: 'Was kostet eine anwaltliche Unterhaltsberechnung?', a: 'Die Kosten hängen vom Gegenstandswert (Höhe des Jahresunterhalts) ab. Viele Anwälte bieten eine kostenlose oder günstige Erstberatung an. Alternativ ist die Beistandschaft beim Jugendamt für Kindesunterhalt komplett kostenlos.' },
  { q: 'Kann ich den Unterhalt neu berechnen lassen, wenn sich mein Einkommen ändert?', a: 'Ja, bei einer wesentlichen Einkommensänderung (meist ab 10%) auf beiden Seiten kann eine Abänderung verlangt werden — außergerichtlich per Neuberechnung oder gerichtlich per Abänderungsklage.' },
  { q: 'Wie finde ich einen Fachanwalt für Familienrecht?', a: '"Fachanwalt für Familienrecht" ist ein geschützter Titel, der besondere Theorie- und Praxiserfahrung voraussetzt. Über Anwaltsvermittlungen (z. B. anwalt.de) oder die örtliche Rechtsanwaltskammer lässt sich gezielt nach diesem Titel filtern. Eine kostenlose oder pauschale Erstberatung hilft, Erfolgsaussichten und Kosten vorab einzuschätzen.' },
];
var lassenBody = '\n<div class="content container" style="padding-top:52px">\n  <h2 class="section-title">Unterhalt verbindlich berechnen lassen</h2>\n  <p>Unsere Rechner bieten eine kostenlose, unverbindliche Orientierung nach der Düsseldorfer Tabelle. Für eine rechtsverbindliche Berechnung — insbesondere bei komplexeren Fällen — empfehlen wir die Beistandschaft beim Jugendamt (kostenlos, nur für Kindesunterhalt) oder eine Fachanwältin/einen Fachanwalt für Familienrecht.</p>\n\n  <h2 class="section-title">Wie finde ich den richtigen Fachanwalt für Familienrecht?</h2>\n  <ul>\n    <li><strong>Fachanwaltstitel prüfen:</strong> "Fachanwalt für Familienrecht" ist ein geschützter Titel — nur wer die Zusatzqualifikation nach der Fachanwaltsordnung nachgewiesen hat, darf ihn führen. Ein normaler Rechtsanwalt darf Familienrecht auch bearbeiten, hat aber keinen Nachweis spezialisierter Erfahrung.</li>\n    <li><strong>Erstberatung nutzen:</strong> Viele Kanzleien bieten eine kostenlose oder pauschal abgerechnete Erstberatung (oft 190-250 €) an, um Erfolgsaussichten und Kosten vorab einzuschätzen.</li>\n    <li><strong>Unterlagen vorbereiten:</strong> Einkommensnachweise (letzte 12 Monate), ggf. Steuerbescheid, Angaben zu Kindern/Ehegatten und bereits erhaltenem Unterhalt beschleunigen die erste Einschätzung erheblich.</li>\n    <li><strong>Kosten vorab klären:</strong> Rechtsanwaltskosten richten sich nach dem Gegenstandswert (Jahresunterhalt × 12). Bei Rechtsschutzversicherung oder geringem Einkommen kann Verfahrenskostenhilfe/Beratungshilfe in Frage kommen.</li>\n    <li><strong>Regionale Zuständigkeit:</strong> Für die gerichtliche Durchsetzung ist meist das Familiengericht am Wohnort des Kindes zuständig — ein ortsansässiger Anwalt ist nicht zwingend nötig, kann aber praktisch sein.</li>\n  </ul>\n\n  <div class="cta-box">\n    <h2>Kostenlose Erstberatung finden</h2>\n    <p>Über unabhängige Anwaltsvermittlungen können Sie eine erste Einschätzung zu Ihrem Fall erhalten, oft kostenlos oder zu Festpreisen.</p>\n    <ul>\n      <li>Fachanwalt für Familienrecht in Ihrer Nähe finden</li>\n      <li>Erste Einschätzung zu Ihrem Unterhaltsanspruch</li>\n      <li>Unterstützung bei Durchsetzung oder Abwehr von Ansprüchen</li>\n    </ul>\n    <a class="cta-btn" href="https://www.anwalt.de/rechtsgebiete/familienrecht.php" target="_blank" rel="noopener nofollow">Anwalt für Familienrecht finden →</a>\n  </div>\n\n  <h2 class="section-title">Kostenlose Alternative: das Jugendamt</h2>\n  <p>Für den Kindesunterhalt bietet jedes Jugendamt eine kostenlose Beistandschaft an, die den Unterhalt berechnet, beurkundet und bei der Durchsetzung hilft. Mehr dazu auf unserer Seite <a href="/jugendamt-berechnung/">Jugendamt &amp; Unterhalt</a>.</p>\n\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(lassenFaq) + '\n</div>\n' + eeatSection(true) + '\n';

writePage({
  href: '/unterhalt-berechnen-lassen/',
  title: 'Unterhalt berechnen lassen 2026 — Anwalt oder Jugendamt',
  metaDescription: 'Unterhalt verbindlich berechnen lassen: kostenlose Beistandschaft beim Jugendamt oder Fachanwalt für Familienrecht finden.',
  h1: 'Unterhalt berechnen lassen',
  tagline: 'Verbindliche Berechnung: Jugendamt (kostenlos) oder Fachanwalt',
  hasCalc: false,
  webApp: false,
  faq: lassenFaq,
  body: lassenBody,
});

// ---------------------------------------------------------------------------
// 10. Unterhaltsvorschuss-Rechner
// ---------------------------------------------------------------------------
var uvFaq = [
  { q: 'Was ist der Unterhaltsvorschuss?', a: 'Eine staatliche Ersatzleistung für Kinder Alleinerziehender, wenn der barunterhaltspflichtige Elternteil keinen oder nicht regelmäßig Unterhalt zahlt. Beantragt wird er beim Jugendamt (Unterhaltsvorschussstelle).' },
  { q: 'Wie hoch ist der Unterhaltsvorschuss 2026?', a: 'Bis zu 227 € (0-5 Jahre), 299 € (6-11 Jahre) und 394 € (12-17 Jahre) monatlich — jeweils der Mindestunterhalt der Düsseldorfer Tabelle Stufe 1 abzüglich des vollen Kindergelds.' },
  { q: 'Gibt es eine zeitliche Höchstgrenze?', a: 'Nein. Seit der UVG-Reform 2020 gibt es keine Höchstbezugsdauer mehr — der Anspruch besteht grundsätzlich bis zur Volljährigkeit (18 Jahre).' },
  { q: 'Gelten für 12-17-Jährige besondere Bedingungen?', a: 'Ja: Der Anspruch besteht, wenn das Kind nicht auf Bürgergeld (SGB II) angewiesen ist, oder wenn der alleinerziehende Elternteil trotz Bürgergeld-Bezug mindestens 600 € brutto monatlich verdient.' },
  { q: 'Wird der Unterhaltsvorschuss gekürzt, wenn ich schon etwas Unterhalt bekomme?', a: 'Ja, tatsächlich gezahlter Kindesunterhalt vom anderen Elternteil wird vom Unterhaltsvorschuss abgezogen — der Staat zahlt nur die Differenz zum Höchstbetrag.' },
  { q: 'Muss ich den Unterhaltsvorschuss zurückzahlen?', a: 'Nein, nicht Sie als betreuender Elternteil. Der Staat versucht jedoch, den gezahlten Betrag beim unterhaltspflichtigen Elternteil zurückzufordern (Legalzession nach § 7 UVG).' },
];
var uvBody = '\n<div class="tool-wrapper container">\n  <div class="tool-card no-tabs">\n    ' + DISCLAIMER_HTML + '\n    <div class="form-grid">\n      <div class="form-group"><label>Alter des Kindes</label><input type="number" id="uv-alter" value="8" min="0" max="17"></div>\n      <div class="form-group"><label>Bereits gezahlter Unterhalt <span>vom anderen Elternteil, 0 falls keiner</span></label><input type="number" id="uv-gezahlt" value="0" min="0"></div>\n    </div>\n    <button class="calc-btn" onclick="calcUVG()">Unterhaltsvorschuss berechnen</button>\n    <div class="result" id="result-uv">\n      <div class="result-hero"><div class="r-label">Möglicher Unterhaltsvorschuss / Monat</div><div class="r-amount" id="uv-out-betrag">–</div><div class="r-sub" id="uv-out-sub"></div></div>\n      <div class="result-note" id="uv-out-note"></div>\n    </div>\n  </div>\n</div>\n\n<div class="content container">\n  <h2 class="section-title">Unterhaltsvorschuss — staatliche Ersatzleistung</h2>\n  <p>Zahlt der barunterhaltspflichtige Elternteil keinen oder nicht regelmäßig Kindesunterhalt, kann der betreuende Elternteil beim Jugendamt Unterhaltsvorschuss beantragen. Die Höhe entspricht dem Mindestunterhalt der Düsseldorfer Tabelle (Einkommensgruppe 1) abzüglich des vollen Kindergelds.</p>\n  <div class="index-formula">Unterhaltsvorschuss = Mindestunterhalt (Stufe 1, je nach Alter) − volles Kindergeld (259 €)<br>abzüglich bereits gezahltem Unterhalt des anderen Elternteils</div>\n  <p>Für Kinder ab 12 Jahren gilt eine zusätzliche Bedingung: Der Anspruch besteht nur, wenn das Kind nicht überwiegend auf Bürgergeld angewiesen ist, oder der alleinerziehende Elternteil trotz Bürgergeld-Bezug mindestens 600 € brutto monatlich verdient. Seit der Reform 2020 gibt es keine zeitliche Höchstbezugsdauer mehr — der Anspruch gilt grundsätzlich bis zur Volljährigkeit.</p>\n\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(uvFaq) + '\n</div>\n' + eeatSection(true) + '\n';

var uvScript = "<script>\nfunction calcUVG() {\n  var alter = parseInt(document.getElementById('uv-alter').value) || 0;\n  var gezahlt = parseFloat(document.getElementById('uv-gezahlt').value) || 0;\n  var res = berechneUnterhaltsvorschuss(alter, gezahlt);\n  var note = document.getElementById('uv-out-note');\n  if (!res.anspruchsberechtigt) {\n    document.getElementById('uv-out-betrag').textContent = '0 €';\n    document.getElementById('uv-out-sub').textContent = '';\n    note.textContent = res.grund;\n    note.classList.add('warn');\n    showResult('result-uv');\n    return;\n  }\n  document.getElementById('uv-out-betrag').textContent = euro(res.betrag);\n  document.getElementById('uv-out-sub').textContent = 'Höchstbetrag: ' + euro(res.maxBetrag);\n  if (res.bedingung1217) {\n    note.textContent = 'Für 12-17-Jährige gilt eine zusätzliche Bedingung: kein bzw. nur ergänzender Bürgergeld-Bezug (siehe FAQ). ' + \"" + RDG.replace(/'/g, "\\'") + "\";\n    note.classList.add('warn');\n  } else {\n    note.textContent = \"" + RDG.replace(/'/g, "\\'") + "\";\n    note.classList.remove('warn');\n  }\n  showResult('result-uv');\n}\n</script>";

writePage({
  href: '/unterhaltsvorschuss-rechner/',
  title: 'Unterhaltsvorschuss berechnen 2026 — Rechner & Bedingungen',
  metaDescription: 'Unterhaltsvorschuss 2026 berechnen: bis zu 394 € monatlich für Kinder Alleinerziehender. Bedingungen, Höhe und Beantragung beim Jugendamt erklärt.',
  h1: 'Unterhaltsvorschuss-Rechner',
  tagline: 'Staatliche Ersatzleistung, wenn der andere Elternteil nicht zahlt — 2026',
  hasCalc: true,
  webApp: true,
  faq: uvFaq,
  body: uvBody,
  extraScript: uvScript,
});

// ---------------------------------------------------------------------------
// 11. Elternunterhalt-Rechner
// ---------------------------------------------------------------------------
var elternDisclaimer = '<div class="disclaimer-banner"><strong>Besonders wichtiger Hinweis:</strong> Anders als beim Kindes- oder Ehegattenunterhalt gibt es <strong>keine feste gesetzliche Berechnungsformel</strong> für den Elternunterhalt. Das Ergebnis unten zeigt nur den rechnerischen Rahmen (Einkommen minus Selbstbehalt gemäß Anmerkung D.I der Düsseldorfer Tabelle) — die tatsächliche Zahlungspflicht hängt zusätzlich von Vermögen, Schonvermögen, weiteren Unterhaltspflichten und der Einzelfallprüfung durch das Sozialamt ab. Diese Schätzung ist besonders grob. ' + RDG + '</div>';
var elternFaq = [
  { q: 'Ab wann muss ich Elternunterhalt zahlen?', a: 'Erst wenn Ihr eigenes Bruttojahreseinkommen 100.000 € übersteigt (Angehörigen-Entlastungsgesetz seit 2020). Diese Grenze gilt pro Kind einzeln, auch bei mehreren pflegebedürftigen Elternteilen. Etwa 96-97% der Bevölkerung liegen darunter und sind damit von vornherein befreit.' },
  { q: 'Wie wird der Elternunterhalt berechnet, wenn ich über 100.000 € verdiene?', a: 'Es gibt keine feste Quote wie beim Ehegattenunterhalt. Anmerkung D.I der Düsseldorfer Tabelle definiert den Selbstbehalt gegenüber Eltern: mindestens 2.650 €/Monat zzgl. 70% des darüber hinausgehenden Nettoeinkommens. Der rechnerisch maximale Unterhalt ergibt sich aus Einkommen minus diesem Selbstbehalt (= 30% des Mehreinkommens) — aber Vermögen, Schonvermögen und weitere Faktoren fließen zusätzlich ein.' },
  { q: 'Was ist Schonvermögen beim Elternunterhalt?', a: 'Vermögen, das nicht für den Elternunterhalt eingesetzt werden muss — z. B. angemessene Altersvorsorge, selbstgenutztes Wohneigentum, ein angemessener Notgroschen. Die genaue Höhe ist einzelfallabhängig und nicht pauschal berechenbar.' },
  { q: 'Darf das Sozialamt einfach alle Kinder anschreiben?', a: 'Nein. Seit dem Angehörigen-Entlastungsgesetz darf das Sozialamt Kinder nur kontaktieren, wenn konkrete Anhaltspunkte für ein Bruttojahreseinkommen über 100.000 € vorliegen — ein pauschales Anschreiben ist unzulässig.' },
];
var elternBody = '\n<div class="tool-wrapper container">\n  <div class="tool-card no-tabs">\n    ' + elternDisclaimer + '\n    <div class="form-grid">\n      <div class="form-group"><label>Bruttojahreseinkommen</label><input type="number" id="el-brutto" value="60000" min="0"></div>\n      <div class="form-group"><label>Bereinigtes Nettoeinkommen <span>pro Monat</span></label><input type="number" id="el-netto" value="2800" min="0"></div>\n    </div>\n    <button class="calc-btn" onclick="calcEltern()">Rechnerischen Rahmen anzeigen</button>\n    <div class="result" id="result-el">\n      <div class="result-hero"><div class="r-label">Rechnerischer Rahmen / Monat</div><div class="r-amount" id="el-out-betrag">–</div><div class="r-sub" id="el-out-sub"></div></div>\n      <div class="result-note warn" id="el-out-note"></div>\n    </div>\n  </div>\n</div>\n\n<div class="content container">\n  <h2 class="section-title">Elternunterhalt — wann und wie viel?</h2>\n  <p>Pflegebedürftige Eltern können gegenüber ihren erwachsenen Kindern einen Unterhaltsanspruch haben (§ 1601 BGB), wenn die eigene Rente und Pflegeversicherung die Pflegekosten nicht decken und das Sozialamt in Vorleistung tritt. Seit dem Angehörigen-Entlastungsgesetz (2020) sind Kinder mit einem Bruttojahreseinkommen bis 100.000 € vollständig befreit.</p>\n  <div class="index-formula">Freigrenze: keine Zahlungspflicht bis 100.000 € Bruttojahreseinkommen<br>Darüber (rechnerischer Rahmen): Selbstbehalt = 2.650 € + 70% × (Nettoeinkommen − 2.650 €)<br>Unterhalt (Obergrenze) = Nettoeinkommen − Selbstbehalt = 30% × Mehreinkommen</div>\n  <p><strong>Wichtig:</strong> Anders als beim Kindes- oder Ehegattenunterhalt ist dies keine feste Zahlungsformel, sondern nur der rechnerische Höchstrahmen laut Anmerkung D.I der Düsseldorfer Tabelle. Vermögen, Schonvermögen, weitere Unterhaltspflichten und regionale Rechtsprechung beeinflussen das tatsächliche Ergebnis erheblich — eine anwaltliche oder sozialrechtliche Beratung ist hier besonders empfehlenswert.</p>\n\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(elternFaq) + '\n</div>\n' + eeatSection(true) + '\n';

var elternScript = "<script>\nfunction calcEltern() {\n  var brutto = parseFloat(document.getElementById('el-brutto').value) || 0;\n  var netto = parseFloat(document.getElementById('el-netto').value) || 0;\n  var res = berechneElternunterhalt(brutto, netto);\n  var note = document.getElementById('el-out-note');\n  if (!res.pflichtig) {\n    document.getElementById('el-out-betrag').textContent = '0 €';\n    document.getElementById('el-out-sub').textContent = 'Bruttojahreseinkommen unter 100.000 €';\n    note.textContent = 'Sie sind laut Angehörigen-Entlastungsgesetz vollständig von der Zahlungspflicht befreit, da Ihr Bruttojahreseinkommen die 100.000-€-Grenze nicht übersteigt.';\n  } else {\n    document.getElementById('el-out-betrag').textContent = euro(res.unterhaltMax);\n    document.getElementById('el-out-sub').textContent = 'Selbstbehalt: ' + euro(res.selbstbehalt);\n    note.textContent = 'Dies ist nur der rechnerische Höchstrahmen, keine feste Zahlungspflicht. " + RDG.replace(/'/g, "\\'") + "';\n  }\n  showResult('result-el');\n}\n</script>";

writePage({
  href: '/elternunterhalt-rechner/',
  title: 'Elternunterhalt berechnen 2026 — 100.000-€-Grenze & Selbstbehalt',
  metaDescription: 'Elternunterhalt 2026: ab wann Kinder zahlen müssen (100.000-€-Grenze), Selbstbehalt und rechnerischer Rahmen nach Düsseldorfer Tabelle Anmerkung D.',
  h1: 'Elternunterhalt-Rechner',
  tagline: '100.000-€-Freigrenze und rechnerischer Rahmen — keine feste Formel',
  hasCalc: true,
  webApp: true,
  faq: elternFaq,
  body: elternBody,
  extraScript: elternScript,
});

// ---------------------------------------------------------------------------
// 12. Mangelfallberechnung
// ---------------------------------------------------------------------------
var mfFaq = [
  { q: 'Was ist ein Mangelfall?', a: 'Reicht das Einkommen des Unterhaltspflichtigen nach Abzug seines Selbstbehalts nicht aus, um die Zahlbeträge aller gleichrangigen Kinder (§ 1609 Nr. 1 BGB) vollständig zu decken, spricht man von einem Mangelfall (Anmerkung C der Düsseldorfer Tabelle).' },
  { q: 'Wie wird die Verteilungsmasse berechnet?', a: 'Verteilungsmasse = bereinigtes Nettoeinkommen des Pflichtigen minus seinem notwendigen Selbstbehalt (1.450 € erwerbstätig / 1.200 € nicht erwerbstätig).' },
  { q: 'Wie wird die Verteilungsmasse auf mehrere Kinder aufgeteilt?', a: 'Proportional zu den Einsatzbeträgen jedes Kindes (= normaler Zahlbetrag nach Alter und Einkommensgruppe). Jedes Kind erhält: Einsatzbetrag × Verteilungsmasse ÷ Summe aller Einsatzbeträge.' },
  { q: 'Bekommen alle Kinder gleich viel im Mangelfall?', a: 'Nein — ältere Kinder haben einen höheren Einsatzbetrag (höherer Bedarfssatz laut Tabelle) und erhalten daher anteilig mehr als jüngere Geschwister, auch im Mangelfall.' },
];
var mfBody = '\n<div class="tool-wrapper container">\n  <div class="tool-card no-tabs">\n    ' + DISCLAIMER_HTML + '\n    <div class="form-grid">\n      <div class="form-group"><label>Bereinigtes Nettoeinkommen (Pflichtiger)</label><input type="number" id="mf-einkommen" value="1750" min="0"></div>\n      <div class="form-group"><label>Anzahl gleichrangiger Kinder</label><select id="mf-anzahl" onchange="renderMfAgeInputs()"><option value="1">1 Kind</option><option value="2">2 Kinder</option><option value="3" selected>3 Kinder</option><option value="4">4 Kinder</option></select></div>\n      <div class="form-group full">\n        <label>Pflichtiger ist</label>\n        <div class="radio-group">\n          <div class="radio-opt"><input type="radio" name="mf-erwerb" id="mf-erwerb-ja" checked><label for="mf-erwerb-ja">Erwerbstätig (1.450 € Selbstbehalt)</label></div>\n          <div class="radio-opt"><input type="radio" name="mf-erwerb" id="mf-erwerb-nein"><label for="mf-erwerb-nein">Nicht erwerbstätig (1.200 € Selbstbehalt)</label></div>\n        </div>\n      </div>\n      <div class="form-group full" id="mf-ages"></div>\n    </div>\n    <button class="calc-btn" onclick="calcMangelfall()">Berechnen</button>\n    <div class="result" id="result-mf">\n      <div class="result-hero"><div class="r-label">Status</div><div class="r-amount" id="mf-out-status" style="font-size:1.4rem">–</div><div class="r-sub" id="mf-out-sub"></div></div>\n      <div id="mf-per-child"></div>\n      <div class="result-note" id="mf-out-note"></div>\n    </div>\n  </div>\n</div>\n\n<div class="content container">\n  <h2 class="section-title">Mangelfallberechnung — wenn das Einkommen nicht reicht</h2>\n  <p>Reicht das Einkommen des Pflichtigen nach Abzug seines Selbstbehalts nicht aus, um den Bedarf aller gleichrangigen Kinder zu decken, wird die verbleibende <strong>Verteilungsmasse</strong> proportional zu den <strong>Einsatzbeträgen</strong> (den normalen Zahlbeträgen) jedes Kindes aufgeteilt.</p>\n  <div class="index-formula">Verteilungsmasse = Einkommen − Selbstbehalt (1.450 € / 1.200 €)<br>Einsatzbetrag(Kind) = normaler Zahlbetrag nach Alter &amp; Einkommensgruppe<br>Zahlbetrag(Kind) = Einsatzbetrag × Verteilungsmasse ÷ Summe aller Einsatzbeträge</div>\n  <p><strong>Amtliches Beispiel (Anmerkung C, Stand 2026):</strong> Einkommen 1.750 €, drei Kinder (18/7/5 Jahre) → Verteilungsmasse 300 €, Einsatzbeträge 439 €/428,50 €/356,50 € (Summe 1.224 €) → Zahlbeträge 107,60 €/105,02 €/87,38 €. Unser Rechner reproduziert dieses Beispiel exakt (Standardwerte oben).</p>\n\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(mfFaq) + '\n</div>\n' + eeatSection(true) + '\n';

var mfScript = '<script>\nfunction renderMfAgeInputs() {\n  var n = parseInt(document.getElementById(\'mf-anzahl\').value) || 1;\n  var wrap = document.getElementById(\'mf-ages\');\n  var defaults = [18, 7, 5, 10];\n  var html = \'<label>Alter der Kinder</label><div class="form-grid" style="margin-top:6px">\';\n  for (var i = 0; i < n; i++) {\n    html += \'<input type="number" class="mf-age-input" min="0" max="17" value="\' + (defaults[i] || 10) + \'" style="margin-bottom:6px">\';\n  }\n  html += \'</div>\';\n  wrap.innerHTML = html;\n}\nfunction calcMangelfall() {\n  var einkommen = parseFloat(document.getElementById(\'mf-einkommen\').value) || 0;\n  var erwerbstaetig = document.getElementById(\'mf-erwerb-ja\').checked;\n  var ages = Array.prototype.map.call(document.querySelectorAll(\'.mf-age-input\'), function (i) { return parseInt(i.value) || 0; });\n  var res = berechneMangelfall(einkommen, ages, erwerbstaetig);\n  document.getElementById(\'mf-out-status\').textContent = res.mangelfall ? \'Mangelfall\' : \'Kein Mangelfall\';\n  document.getElementById(\'mf-out-sub\').textContent = \'Verteilungsmasse: \' + euro(res.verteilungsmasse) + \' · Summe Einsatzbeträge: \' + euro(res.summeEinsatz);\n  var rows = \'<div class="table-wrap"><table class="dt-table"><tr><th>Kind</th><th>Alter</th><th>Einsatzbetrag</th><th>Zahlbetrag</th></tr>\';\n  res.kinder.forEach(function (k, i) {\n    rows += \'<tr><td>Kind \' + (i + 1) + \'</td><td>\' + k.alter + \' J.</td><td>\' + euro(k.einsatzbetrag) + \'</td><td><strong>\' + euro(k.zahlbetrag) + \'</strong></td></tr>\';\n  });\n  rows += \'</table></div>\';\n  document.getElementById(\'mf-per-child\').innerHTML = rows;\n  var note = document.getElementById(\'mf-out-note\');\n  if (res.mangelfall) {\n    note.textContent = \'Mangelfall: die Verteilungsmasse reicht nicht für die volle Deckung aller Kinder, daher anteilige Kürzung. ${RDG}\';\n    note.classList.add(\'warn\');\n  } else {\n    note.textContent = \'Kein Mangelfall: alle Kinder erhalten ihren vollen Zahlbetrag. ${RDG}\';\n    note.classList.remove(\'warn\');\n  }\n  showResult(\'result-mf\');\n}\ndocument.addEventListener(\'DOMContentLoaded\', renderMfAgeInputs);\n</script>'.replace(/\$\{RDG\}/g, RDG.replace(/'/g, "\\'"));

writePage({
  href: '/mangelfallberechnung/',
  title: 'Mangelfallberechnung 2026 — Unterhalt bei mehreren Kindern',
  metaDescription: 'Mangelfallberechnung nach Anmerkung C der Düsseldorfer Tabelle 2026: proportionale Verteilung bei nicht ausreichendem Einkommen. Mit amtlichem Beispiel.',
  h1: 'Mangelfallberechnung',
  tagline: 'Proportionale Verteilung bei mehreren Kindern und knappem Einkommen',
  hasCalc: true,
  webApp: true,
  faq: mfFaq,
  body: mfBody,
  extraScript: mfScript,
});

// ---------------------------------------------------------------------------
// 13. Ratgeber: Unterhalt bei Arbeitslosigkeit
// ---------------------------------------------------------------------------
var arbFaq = [
  { q: 'Muss ich trotz Arbeitslosigkeit Unterhalt zahlen?', a: 'Grundsätzlich ja, soweit Ihr Einkommen (inkl. Arbeitslosengeld/Bürgergeld) den Selbstbehalt übersteigt. Der Kindesunterhalt hat gegenüber minderjährigen Kindern Vorrang vor fast allen anderen Verbindlichkeiten (§ 1609 Nr. 1 BGB).' },
  { q: 'Was ist die Erwerbsobliegenheit?', a: 'Die Pflicht, sich aktiv und nachweislich um eine angemessene Arbeitsstelle zu bemühen, solange man unterhaltspflichtig ist. Wer diese Pflicht verletzt (z. B. keine Bewerbungen, selbstverschuldete Kündigung), riskiert die Zurechnung eines "fiktiven Einkommens".' },
  { q: 'Was bedeutet fiktives Einkommen?', a: 'Wird die Erwerbsobliegenheit verletzt, kann das Gericht den Unterhalt so berechnen, als hätte die pflichtige Person das erzielbare Einkommen einer angemessenen Stelle tatsächlich — unabhängig vom tatsächlich niedrigeren oder fehlenden Einkommen.' },
  { q: 'Schützt mich der Selbstbehalt bei Arbeitslosigkeit?', a: 'Ja. Auch bei Arbeitslosigkeit bleibt Ihnen der notwendige Selbstbehalt (1.200 € nicht erwerbstätig, Stand 2026) erhalten — der Unterhalt darf diesen nicht unterschreiten, außer im Mangelfall-Verteilungsverfahren.' },
];
var arbBody = '\n<div class="content container" style="padding-top:52px">\n  <h2 class="section-title">Unterhalt bei Arbeitslosigkeit</h2>\n  <p>Arbeitslosigkeit befreit nicht automatisch von der Unterhaltspflicht. Solange ein Einkommen vorhanden ist (Arbeitslosengeld I, Bürgergeld, Vermögen), wird der Unterhalt auf dieser Basis berechnet — begrenzt durch den Selbstbehalt. Entscheidend ist außerdem, ob die <strong>Erwerbsobliegenheit</strong> erfüllt wird.</p>\n  <h3 style="margin-top:24px;font-size:1.05rem;">Erwerbsobliegenheit — aktiv nach Arbeit suchen</h3>\n  <p>Unterhaltspflichtige müssen sich nachweislich um eine zumutbare Erwerbstätigkeit bemühen (regelmäßige, dokumentierte Bewerbungen). Wer arbeitsfähig ist, aber keine ausreichenden Bemühungen nachweisen kann, riskiert die Zurechnung eines fiktiven Einkommens — der Unterhalt wird dann so berechnet, als würde tatsächlich gearbeitet.</p>\n  <h3 style="margin-top:24px;font-size:1.05rem;">Selbstverschuldete Arbeitslosigkeit</h3>\n  <p>Wer selbst kündigt oder eine verhaltensbedingte Kündigung provoziert, ohne triftigen Grund, muss besonders damit rechnen, dass ein Gericht ein fiktives Einkommen zugrunde legt — die Unterhaltspflicht entfällt dadurch in der Regel nicht.</p>\n  <h3 style="margin-top:24px;font-size:1.05rem;">Was bleibt geschützt?</h3>\n  <p>Der notwendige Selbstbehalt (2026: 1.200 € gegenüber minderjährigen Kindern bei Nichterwerbstätigkeit) bleibt auch bei Arbeitslosigkeit erhalten. Reicht das Einkommen nicht für den Bedarf aller unterhaltsberechtigten Kinder, greift die <a href="/mangelfallberechnung/">Mangelfallberechnung</a>. Zahlt der andere Elternteil nicht oder nicht ausreichend, kann für die Kinder <a href="/unterhaltsvorschuss-rechner/">Unterhaltsvorschuss</a> beantragt werden.</p>\n\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(arbFaq) + '\n</div>\n' + eeatSection(true) + '\n';

writePage({
  href: '/unterhalt-bei-arbeitslosigkeit/',
  title: 'Unterhalt bei Arbeitslosigkeit 2026 — Erwerbsobliegenheit erklärt',
  metaDescription: 'Unterhalt trotz Arbeitslosigkeit: Erwerbsobliegenheit, fiktives Einkommen und Selbstbehalt erklärt. Was gilt, wenn Sie arbeitslos werden.',
  h1: 'Unterhalt bei Arbeitslosigkeit',
  tagline: 'Erwerbsobliegenheit, fiktives Einkommen und Selbstbehalt erklärt',
  hasCalc: false,
  webApp: false,
  faq: arbFaq,
  body: arbBody,
});

// ---------------------------------------------------------------------------
// 14. Ratgeber: Unterhalt für Selbstständige berechnen
// ---------------------------------------------------------------------------
var selbstStFaq = [
  { q: 'Wie wird das Einkommen bei Selbstständigen ermittelt?', a: 'In der Regel durch Durchschnittsbildung der letzten 3 Geschäftsjahre (Gewinnermittlungen/Steuerbescheide), um jährliche Schwankungen auszugleichen — anders als bei Angestellten reicht ein einzelner Monatsverdienst nicht aus.' },
  { q: 'Werden private Ausgaben über die Firma unterhaltsrechtlich berücksichtigt?', a: 'Nur betrieblich notwendige Ausgaben mindern das unterhaltsrelevante Einkommen. Privat mitgenutzte Positionen (z. B. Firmenwagen mit Privatnutzung) werden anteilig wieder hinzugerechnet.' },
  { q: 'Darf ich Rücklagen bilden, um weniger Unterhalt zu zahlen?', a: 'Nur in angemessenem, betriebswirtschaftlich nachvollziehbarem Umfang. Überhöhte oder unterhaltsrechtlich nicht anerkannte Rücklagenbildung wird dem Einkommen wieder hinzugerechnet.' },
  { q: 'Was, wenn mein Einkommen stark schwankt?', a: 'Gerade deshalb wird bei Selbstständigen meist ein Mehrjahresdurchschnitt gebildet. Bei wesentlichen, dauerhaften Änderungen (z. B. Geschäftsaufgabe) kann eine Neuberechnung bzw. Abänderung verlangt werden.' },
];
var selbstStBody = '\n<div class="content container" style="padding-top:52px">\n  <h2 class="section-title">Unterhalt für Selbstständige berechnen</h2>\n  <p>Bei Selbstständigen und Freiberuflern lässt sich der Unterhalt nicht einfach aus einer Gehaltsabrechnung ablesen — das unterhaltsrelevante Einkommen wird aus den Geschäftsergebnissen ermittelt, meist über mehrere Jahre gemittelt.</p>\n  <h3 style="margin-top:24px;font-size:1.05rem;">Durchschnittsbildung über mehrere Jahre</h3>\n  <p>Üblich ist die Betrachtung der letzten drei abgeschlossenen Geschäftsjahre (Gewinn- und Verlustrechnungen bzw. Steuerbescheide), um branchen- oder auftragsbedingte Schwankungen auszugleichen. Ein einzelnes schwaches oder starkes Jahr ist damit nicht allein entscheidend.</p>\n  <h3 style="margin-top:24px;font-size:1.05rem;">Korrekturen am Gewinn</h3>\n  <p>Nicht jede steuerlich anerkannte Ausgabe mindert automatisch das unterhaltsrelevante Einkommen. Privat mitgenutzte Positionen (Firmenwagen, Arbeitszimmer) werden anteilig zurückgerechnet, überhöhte Abschreibungen oder unterhaltsrechtlich nicht notwendige Rücklagen können dem Einkommen wieder hinzugerechnet werden.</p>\n  <h3 style="margin-top:24px;font-size:1.05rem;">Warum ein einfacher Online-Rechner hier an Grenzen stößt</h3>\n  <p>Unsere Rechner (<a href="/kindesunterhalt-rechner/">Kindesunterhalt</a>, <a href="/ehegattenunterhalt-rechner/">Ehegattenunterhalt</a>) benötigen als Eingabe das bereits bereinigte Nettoeinkommen. Bei Selbstständigen ist die Ermittlung dieses Ausgangswerts der komplexeste und streitanfälligste Schritt — hier ist eine anwaltliche oder steuerfachliche Prüfung der Geschäftsunterlagen meist unverzichtbar.</p>\n\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(selbstStFaq) + '\n</div>\n' + eeatSection(true) + '\n';

writePage({
  href: '/unterhalt-selbststaendige-berechnen/',
  title: 'Unterhalt für Selbstständige berechnen 2026 — Einkommensermittlung',
  metaDescription: 'Unterhalt für Selbstständige und Freiberufler: wie das unterhaltsrelevante Einkommen aus Geschäftsergebnissen ermittelt wird.',
  h1: 'Unterhalt für Selbstständige',
  tagline: 'Wie das unterhaltsrelevante Einkommen bei Selbstständigen ermittelt wird',
  hasCalc: false,
  webApp: false,
  faq: selbstStFaq,
  body: selbstStBody,
});

// ---------------------------------------------------------------------------
// 15. Ratgeber: Unterhalt verweigern — Folgen
// ---------------------------------------------------------------------------
var verwFaq = [
  { q: 'Was passiert, wenn ich keinen Unterhalt zahle?', a: 'Der Berechtigte kann den Unterhalt gerichtlich titulieren lassen (Jugendamtsurkunde, Beschluss, Vergleich) und anschließend zwangsvollstrecken — z. B. per Lohn- oder Kontopfändung.' },
  { q: 'Ist Unterhaltsverweigerung strafbar?', a: 'Unter bestimmten Voraussetzungen ja: § 170 StGB (Verletzung der Unterhaltspflicht) stellt es unter Strafe, wenn dadurch der Lebensbedarf des Berechtigten gefährdet wird oder gefährdet würde, obwohl die pflichtige Person leistungsfähig ist oder leistungsfähig sein könnte.' },
  { q: 'Was ist eine Jugendamtsurkunde und warum ist sie wichtig?', a: 'Ein vollstreckbarer Titel, den das Jugendamt im Rahmen der Beistandschaft kostenlos erstellt. Liegt ein solcher Titel vor, kann bei Nichtzahlung direkt die Zwangsvollstreckung eingeleitet werden, ohne vorher ein Gerichtsverfahren führen zu müssen.' },
  { q: 'Was, wenn der Unterhaltspflichtige wirklich kein Geld hat?', a: 'Echte Leistungsunfähigkeit (z. B. nachgewiesene Arbeitslosigkeit trotz aktiver Suche) schließt eine Strafbarkeit nach § 170 StGB regelmäßig aus — die zivilrechtliche Unterhaltspflicht kann aber je nach Einzelfall dennoch fortbestehen, ggf. auf Basis eines fiktiven Einkommens.' },
];
var verwBody = '\n<div class="content container" style="padding-top:52px">\n  <h2 class="section-title">Unterhalt verweigern — welche Folgen drohen?</h2>\n  <p>Wer geschuldeten Unterhalt nicht zahlt, riskiert sowohl zivilrechtliche Zwangsvollstreckung als auch — unter bestimmten Voraussetzungen — eine Strafbarkeit nach § 170 StGB.</p>\n  <h3 style="margin-top:24px;font-size:1.05rem;">Zivilrechtliche Durchsetzung</h3>\n  <p>Liegt ein vollstreckbarer Titel vor (Jugendamtsurkunde, gerichtlicher Beschluss, notarieller Vergleich), kann der Berechtigte bei Nichtzahlung direkt die Zwangsvollstreckung betreiben — etwa Lohnpfändung beim Arbeitgeber oder Kontopfändung. Ein vorheriges Gerichtsverfahren ist dann nicht mehr nötig.</p>\n  <h3 style="margin-top:24px;font-size:1.05rem;">Strafrechtliche Folgen (§ 170 StGB)</h3>\n  <p>Die vorsätzliche Verletzung einer gesetzlichen Unterhaltspflicht ist strafbar, wenn dadurch der Lebensbedarf des Berechtigten gefährdet wird (oder ohne Hilfe Dritter/Sozialleistungen gefährdet wäre) und die pflichtige Person leistungsfähig ist oder leistungsfähig sein könnte (siehe fiktives Einkommen).</p>\n  <h3 style="margin-top:24px;font-size:1.05rem;">Absicherung für das Kind</h3>\n  <p>Zahlt der barunterhaltspflichtige Elternteil nicht oder nicht regelmäßig, kann der betreuende Elternteil für minderjährige Kinder <a href="/unterhaltsvorschuss-rechner/">Unterhaltsvorschuss</a> beim Jugendamt beantragen — der Staat zahlt vor und fordert den Betrag anschließend vom Pflichtigen zurück.</p>\n\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(verwFaq) + '\n</div>\n' + eeatSection(true) + '\n';

writePage({
  href: '/unterhalt-verweigern-folgen/',
  title: 'Unterhalt verweigern — Folgen 2026 (Zwangsvollstreckung & § 170 StGB)',
  metaDescription: 'Was passiert, wenn Unterhalt nicht gezahlt wird: Zwangsvollstreckung, Jugendamtsurkunde und Strafbarkeit nach § 170 StGB erklärt.',
  h1: 'Unterhalt verweigern — Folgen',
  tagline: 'Zwangsvollstreckung, Jugendamtsurkunde und § 170 StGB erklärt',
  hasCalc: false,
  webApp: false,
  faq: verwFaq,
  body: verwBody,
});

// ---------------------------------------------------------------------------
// 16. Ratgeber: Unterhalt rückwirkend fordern
// ---------------------------------------------------------------------------
var rueckFaq = [
  { q: 'Kann ich Unterhalt für vergangene Monate rückwirkend fordern?', a: 'Nur eingeschränkt. Nach § 1613 BGB kann Unterhalt grundsätzlich erst ab dem Zeitpunkt verlangt werden, ab dem der Pflichtige zur Auskunft über sein Einkommen aufgefordert wurde, in Verzug gesetzt wurde oder der Unterhaltsanspruch rechtshängig gemacht wurde — nicht beliebig weit rückwirkend.' },
  { q: 'Was muss ich tun, um rückwirkenden Unterhalt zu sichern?', a: 'Möglichst früh schriftlich zur Auskunft über das Einkommen auffordern und/oder in Verzug setzen (z. B. per Mahnschreiben mit Fristsetzung). Ohne einen dieser Schritte verliert man rückwirkend Ansprüche für die Zeit davor in der Regel unwiederbringlich.' },
  { q: 'Gibt es Ausnahmen von dieser Regel?', a: 'Ja, etwa wenn der Berechtigte aus rechtlichen oder tatsächlichen Gründen unverschuldet an der Geltendmachung gehindert war. Dies ist einzelfallabhängig und sollte anwaltlich geprüft werden.' },
  { q: 'Gilt die gleiche Regel für Kindesunterhalt und Ehegattenunterhalt?', a: 'Das Grundprinzip aus § 1613 BGB gilt für beide, mit Detailunterschieden je nach Unterhaltsart. In beiden Fällen ist frühzeitiges, dokumentiertes Handeln (Auskunftsverlangen, Mahnung) entscheidend, um Ansprüche nicht zu verlieren.' },
];
var rueckBody = '\n<div class="content container" style="padding-top:52px">\n  <h2 class="section-title">Unterhalt rückwirkend fordern</h2>\n  <p>Viele Berechtigte gehen davon aus, Unterhalt beliebig weit rückwirkend einfordern zu können, sobald der Anspruch feststeht. Das deutsche Unterhaltsrecht schränkt dies jedoch bewusst ein.</p>\n  <h3 style="margin-top:24px;font-size:1.05rem;">Die Grundregel: § 1613 BGB</h3>\n  <p>Rückwirkender Unterhalt kann grundsätzlich erst ab dem Zeitpunkt verlangt werden, in dem der Pflichtige zur Auskunft über sein Einkommen aufgefordert, in Verzug gesetzt oder der Anspruch rechtshängig gemacht wurde. Für die Zeit davor besteht in der Regel kein Anspruch mehr — selbst wenn dem Grunde nach Unterhalt geschuldet gewesen wäre.</p>\n  <h3 style="margin-top:24px;font-size:1.05rem;">Was Sie frühzeitig tun sollten</h3>\n  <p>Um keine Ansprüche zu verlieren, empfiehlt sich ein schriftliches, dokumentiertes Auskunftsverlangen oder eine Mahnung mit Zahlungsaufforderung, sobald der Unterhaltsanspruch erkennbar wird — auch wenn die genaue Höhe noch nicht feststeht. Die Beistandschaft beim <a href="/jugendamt-berechnung/">Jugendamt</a> kann hierbei kostenlos unterstützen.</p>\n\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(rueckFaq) + '\n</div>\n' + eeatSection(true) + '\n';

writePage({
  href: '/unterhalt-rueckwirkend-fordern/',
  title: 'Unterhalt rückwirkend fordern 2026 — § 1613 BGB erklärt',
  metaDescription: 'Unterhalt rückwirkend fordern: warum § 1613 BGB die Rückwirkung einschränkt und was Sie frühzeitig tun sollten, um Ansprüche zu sichern.',
  h1: 'Unterhalt rückwirkend fordern',
  tagline: 'Warum § 1613 BGB die Rückwirkung einschränkt — und was jetzt zu tun ist',
  hasCalc: false,
  webApp: false,
  faq: rueckFaq,
  body: rueckBody,
});

console.log('Alle Satelliten-Seiten geschrieben.');
