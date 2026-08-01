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
var tabFaq = [
  { q: 'Wie oft ändert sich die Düsseldorfer Tabelle?', a: 'In der Regel jährlich zum 1. Januar, gelegentlich auch unterjährig bei gesetzlichen Änderungen des Mindestunterhalts. Die aktuelle Fassung gilt seit 01.01.2026.' },
  { q: 'Was ist die Düsseldorfer Tabelle Tabelle Zahlbeträge?', a: 'Ein Anhang zur Haupttabelle, der die Beträge nach Abzug des Kindergeldanteils zeigt — also die tatsächlich zu zahlenden Beträge, nicht nur den theoretischen Bedarf.' },
  { q: 'Was ist der Bedarfskontrollbetrag?', a: 'Ein Mindestbetrag, der dem Pflichtigen nach Zahlung des Unterhalts verbleiben soll, um eine ausgewogene Verteilung zwischen ihm und den Kindern sicherzustellen. Wird er unterschritten, kann der Tabellenbetrag der nächst niedrigeren Einkommensgruppe angesetzt werden.' },
];
function tableHtml() {
  var rows = DT.DT_TABELLE.map(function (r, i) {
    return '<tr><td>' + (i + 1) + '</td><td>' + (i === 0 ? 'bis' : (DT.DT_TABELLE[i - 1].bis + 1).toLocaleString('de-DE') + ' –') + ' ' + r.bis.toLocaleString('de-DE') + ' €</td><td>' + r.a1 + ' €</td><td>' + r.a2 + ' €</td><td>' + r.a3 + ' €</td><td>' + r.a4 + ' €</td><td>' + r.pct + '%</td><td>' + (r.kontrolle ? r.kontrolle.toLocaleString('de-DE') + ' €' : '1.200 / 1.450 €') + '</td></tr>';
  }).join('');
  return '<div class="table-wrap"><table class="dt-table"><tr><th>Gr.</th><th>Nettoeinkommen</th><th>0-5 J.</th><th>6-11 J.</th><th>12-17 J.</th><th>ab 18 J.</th><th>%</th><th>Kontrollbetrag</th></tr>' + rows + '</table></div>';
}
var tabBody = '\n<div class="container-wide">\n  <div style="margin-top:-40px;position:relative;z-index:10;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.1);border:1px solid var(--border);padding:24px;">\n    ' + DISCLAIMER_HTML + '\n    <h2 style="font-size:1.1rem;margin-bottom:10px;">Düsseldorfer Tabelle — Stand 01.01.2026 (Bedarfssätze)</h2>\n    ' + tableHtml() + '\n    <p style="font-size:0.85rem;color:var(--muted)">Quelle: <a href="https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2026/DT_2026.pdf" target="_blank" rel="noopener">OLG Düsseldorf, PDF, Stand 01.01.2026</a>. Werte wörtlich übernommen.</p>\n  </div>\n</div>\n\n<div class="content container">\n  <h2 class="section-title">Was zeigt die Tabelle?</h2>\n  <p>Die Düsseldorfer Tabelle ordnet dem bereinigten monatlichen Nettoeinkommen des barunterhaltspflichtigen Elternteils eine von 15 Einkommensgruppen zu. Für jede Gruppe gibt es vier Bedarfssätze, gestaffelt nach dem Alter des Kindes. Die angegebenen Beträge sind Bedarfssätze (Tabellenbeträge) — der tatsächliche Zahlbetrag ergibt sich erst nach Abzug des anteiligen Kindergelds. Nutzen Sie dafür unseren <a href="/kindesunterhalt-rechner/">Kindesunterhalt-Rechner</a>.</p>\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(tabFaq) + '\n</div>\n' + eeatSection(true) + '\n';

writePage({
  href: '/unterhaltstabelle/',
  title: 'Düsseldorfer Tabelle 2026 — vollständige Unterhaltstabelle',
  metaDescription: 'Die vollständige Düsseldorfer Tabelle 2026 mit allen 15 Einkommensgruppen, 4 Altersstufen und Bedarfskontrollbeträgen. Amtliche Werte, Stand 01.01.2026.',
  h1: 'Düsseldorfer Tabelle 2026',
  tagline: 'Alle 15 Einkommensgruppen im Überblick — amtlicher Stand 01.01.2026',
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
];
var lassenBody = '\n<div class="content container" style="padding-top:52px">\n  <h2 class="section-title">Unterhalt verbindlich berechnen lassen</h2>\n  <p>Unsere Rechner bieten eine kostenlose, unverbindliche Orientierung nach der Düsseldorfer Tabelle. Für eine rechtsverbindliche Berechnung — insbesondere bei komplexeren Fällen — empfehlen wir die Beistandschaft beim Jugendamt (kostenlos, nur für Kindesunterhalt) oder eine Fachanwältin/einen Fachanwalt für Familienrecht.</p>\n\n  <div class="cta-box">\n    <h2>Kostenlose Erstberatung finden</h2>\n    <p>Über unabhängige Anwaltsvermittlungen können Sie eine erste Einschätzung zu Ihrem Fall erhalten, oft kostenlos oder zu Festpreisen.</p>\n    <ul>\n      <li>Fachanwalt für Familienrecht in Ihrer Nähe finden</li>\n      <li>Erste Einschätzung zu Ihrem Unterhaltsanspruch</li>\n      <li>Unterstützung bei Durchsetzung oder Abwehr von Ansprüchen</li>\n    </ul>\n    <a class="cta-btn" href="https://www.anwalt.de/rechtsgebiete/familienrecht.php" target="_blank" rel="noopener nofollow">Anwalt für Familienrecht finden →</a>\n  </div>\n\n  <h2 class="section-title">Kostenlose Alternative: das Jugendamt</h2>\n  <p>Für den Kindesunterhalt bietet jedes Jugendamt eine kostenlose Beistandschaft an, die den Unterhalt berechnet, beurkundet und bei der Durchsetzung hilft. Mehr dazu auf unserer Seite <a href="/jugendamt-berechnung/">Jugendamt &amp; Unterhalt</a>.</p>\n\n  <h2 class="section-title">Häufige Fragen</h2>\n  ' + renderFaq(lassenFaq) + '\n</div>\n' + eeatSection(true) + '\n';

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

console.log('Alle Satelliten-Seiten geschrieben.');
