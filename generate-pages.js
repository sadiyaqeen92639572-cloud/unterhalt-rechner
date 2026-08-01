#!/usr/bin/env node
/*
 * unterhalt-rechner.com — generiert alle statischen HTML-Seiten aus den PAGES-Daten unten.
 * Kein Build-Tool nötig — reines Node, `node generate-pages.js` schreibt die Dateien direkt.
 */
const fs = require('fs');
const path = require('path');

const SITE = 'https://unterhalt-rechner.com';
const PUBLISHER_NAME = 'Gesmine-Invest Limited';
const LAST_MOD = '2026-08-01';

const NAV = [
  { href: '/', label: 'Unterhaltsrechner' },
  { href: '/kindesunterhalt-rechner/', label: 'Kindesunterhalt' },
  { href: '/ehegattenunterhalt-rechner/', label: 'Ehegattenunterhalt' },
  { href: '/trennungsunterhalt-rechner/', label: 'Trennungsunterhalt' },
  { href: '/unterhaltstabelle/', label: 'Tabelle' },
  { href: '/selbstbehalt/', label: 'Selbstbehalt' },
  { href: '/wechselmodell/', label: 'Wechselmodell' },
  { href: '/unterhalt-ab-18/', label: 'Ab 18' },
  { href: '/jugendamt-berechnung/', label: 'Jugendamt' },
];

const RDG_DISCLAIMER = 'Diese Berechnung ist eine unverbindliche Orientierungshilfe auf Basis der Düsseldorfer Tabelle 2026 und ersetzt keine individuelle Rechtsberatung. Für eine verbindliche Berechnung Ihres Einzelfalls wenden Sie sich an einen Fachanwalt für Familienrecht oder das zuständige Jugendamt.';

function renderNav(currentHref) {
  return `<nav class="site-nav">${NAV.map(function (n) {
    var cur = n.href === currentHref ? ' current' : '';
    return `<a href="${n.href}" class="${cur.trim()}">${n.label}</a>`;
  }).join('')}</nav>`;
}

function renderFaq(items) {
  return items.map(function (f, i) {
    return `<div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)">${f.q}</button><div class="faq-a"><p>${f.a}</p></div></div>`;
  }).join('\n');
}

function faqJsonLd(items) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(function (f) {
      return { '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') } };
    }),
  };
}

function breadcrumbJsonLd(name, href) {
  var items = [{ '@type': 'ListItem', position: 1, name: 'Unterhaltsrechner', item: SITE + '/' }];
  if (href !== '/') items.push({ '@type': 'ListItem', position: 2, name: name, item: SITE + href });
  return { '@type': 'BreadcrumbList', itemListElement: items };
}

function eeatSection(compact) {
  if (compact) {
    return `<div class="eeat-section">
      <p style="margin-bottom:0"><strong>Methodik &amp; Quellen:</strong> Alle Berechnungen basieren auf der amtlichen <a href="https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2026/DT_2026.pdf" target="_blank" rel="noopener">Düsseldorfer Tabelle, Stand 01.01.2026</a> (OLG Düsseldorf). Keine Rechtsberatung — siehe <a href="/about/">Über uns</a> und <a href="/impressum/">Impressum</a>.</p>
    </div>`;
  }
  return `<div class="eeat-section">
    <div class="eeat-title">Transparenz &amp; Methodik</div>
    <div class="eeat-grid">
      <div class="eeat-author-card">
        <div class="eeat-avatar">UR</div>
        <div class="eeat-author-info">
          <h3>Unterhalt-Rechner.com Redaktion</h3>
          <div class="eeat-author-subtitle">Herausgeber</div>
          <p>Diese Seite wird von ${PUBLISHER_NAME} betrieben und bietet kostenlose, werbefreie Unterhaltsrechner auf Basis öffentlich zugänglicher amtlicher Quellen. Kein anwaltlicher Dienst, keine individuelle Rechtsberatung.</p>
        </div>
      </div>
      <div class="eeat-compliance">
        <div class="eeat-compliance-item">
          <div class="eeat-compliance-text">
            <h4>Amtliche Quelle</h4>
            <p>Düsseldorfer Tabelle, Stand 01.01.2026 (<a href="https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2026/DT_2026.pdf" target="_blank" rel="noopener">OLG Düsseldorf PDF</a>), Werte wörtlich übernommen, nicht nachgerechnet.</p>
          </div>
        </div>
        <div class="eeat-compliance-item">
          <div class="eeat-compliance-text">
            <h4>Keine Rechtsberatung</h4>
            <p>Alle Ergebnisse sind unverbindliche Orientierungswerte (§ RDG). Für verbindliche Auskünfte: Fachanwalt für Familienrecht oder Jugendamt.</p>
          </div>
        </div>
        <div class="eeat-compliance-item">
          <div class="eeat-compliance-text">
            <h4>Datenschutz</h4>
            <p>Alle Eingaben bleiben lokal im Browser — keine Übertragung, keine Speicherung. Siehe <a href="/datenschutz/">Datenschutzerklärung</a>.</p>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function footer() {
  return `<footer>
    <p>&copy; 2026 unterhalt-rechner.com — ein Angebot von ${PUBLISHER_NAME}</p>
    <p style="margin-top:6px;font-size:0.85rem;">Alle Berechnungen sind unverbindlich und ersetzen keine Rechtsberatung.</p>
    <div class="foot-links">
      <a href="/about/">Über uns</a>·<a href="/impressum/">Impressum</a>·<a href="/datenschutz/">Datenschutz</a>
    </div>
  </footer>`;
}

function shell(page) {
  var canonical = SITE + page.href;
  var jsonLdGraph = [
    {
      '@type': 'Organization',
      name: 'unterhalt-rechner.com',
      url: SITE + '/',
      publisher: { '@type': 'Organization', name: PUBLISHER_NAME },
    },
  ];
  if (page.webApp) {
    jsonLdGraph.push({
      '@type': 'WebApplication',
      name: page.h1,
      url: canonical,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      areaServed: 'DE',
    });
  }
  if (page.faq && page.faq.length) jsonLdGraph.push(faqJsonLd(page.faq));
  jsonLdGraph.push(breadcrumbJsonLd(page.h1, page.href));
  if (page.howTo) jsonLdGraph.push(page.howTo);

  var jsonLd = { '@context': 'https://schema.org', '@graph': jsonLdGraph };

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${page.title}</title>
<meta name="description" content="${page.metaDescription}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${page.title}">
<meta property="og:description" content="${page.metaDescription}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="de_DE">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="google-site-verification" content="PX6VywkH65BJDdDkcX--EOCV-r5tICFVS4j0Sf5fzYY" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="stylesheet" href="/assets/style.css">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
<header class="${page.hasCalc ? '' : 'hub-header'}">
  <span class="flag">⚖️ 🇩🇪</span>
  <h1>${page.h1}</h1>
  <p class="tagline">${page.tagline}</p>
  ${renderNav(page.href)}
</header>
${page.body}
${footer()}
<script src="/assets/calc-engine.js"></script>
<script src="/assets/site.js"></script>
${page.extraScript || ''}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Homepage
// ---------------------------------------------------------------------------

var homeFaq = [
  { q: 'Wie wird der Kindesunterhalt in Deutschland berechnet?', a: 'Nach der Düsseldorfer Tabelle, gestaffelt nach dem bereinigten Nettoeinkommen des barunterhaltspflichtigen Elternteils und dem Alter des Kindes (4 Altersstufen: 0-5, 6-11, 12-17, ab 18). Vom Tabellenbetrag wird die Hälfte des Kindergelds (bei minderjährigen Kindern) bzw. das volle Kindergeld (bei volljährigen Kindern) abgezogen — der verbleibende Betrag ist der Zahlbetrag.' },
  { q: 'Ist dieser Rechner rechtsverbindlich?', a: 'Nein. Alle Ergebnisse sind unverbindliche Orientierungswerte auf Basis der amtlichen Düsseldorfer Tabelle 2026. Für eine rechtsverbindliche Berechnung Ihres Einzelfalls (z. B. bei Mangelfall, mehreren Unterhaltsberechtigten, Sonderbedarf) wenden Sie sich an einen Fachanwalt für Familienrecht oder das Jugendamt.' },
  { q: 'Was ist der Unterschied zwischen Bedarf und Zahlbetrag?', a: 'Der Bedarf (Tabellenbetrag) ist der theoretische Unterhaltsanspruch des Kindes laut Tabelle. Der Zahlbetrag ist der tatsächlich zu zahlende Betrag, nachdem das anteilige Kindergeld gemäß § 1612b BGB abgezogen wurde.' },
  { q: 'Wie wird Ehegattenunterhalt berechnet?', a: 'Nach der amtlichen 45%/50%-Differenzmethode der Düsseldorfer Tabelle: Bei einem erwerbstätigen Pflichtigen erhält der Berechtigte 45% der Einkommensdifferenz (bzw. 45% des Erwerbseinkommens, falls der Berechtigte kein eigenes Einkommen hat), begrenzt durch den Selbstbehalt des Pflichtigen (1.600€ erwerbstätig / 1.475€ nicht erwerbstätig).' },
  { q: 'Was passiert, wenn mein Einkommen über 11.200€ liegt?', a: 'Die Düsseldorfer Tabelle deckt Einkommen bis 11.200€ ab. Darüber hinaus gibt es keine tabellarischen Werte — der Unterhalt wird individuell nach den konkreten Lebensverhältnissen bemessen. Hier ist eine anwaltliche Beratung erforderlich.' },
  { q: 'Wird das Kindergeld automatisch berücksichtigt?', a: 'Ja. Unser Kindesunterhalt-Rechner zeigt sowohl den Tabellenbetrag (Bedarf) als auch den Zahlbetrag nach Kindergeldanrechnung (259€/Monat je Kind in 2026, hälftig bei minderjährigen und voll bei volljährigen Kindern).' },
];

var homeBody = `
<div class="tool-wrapper container">
  <div class="tab-nav">
    <button class="tab-btn active" onclick="switchTab('tab-kind', this)">Kindesunterhalt</button>
    <button class="tab-btn" onclick="switchTab('tab-ehe', this)">Ehegattenunterhalt</button>
  </div>
  <div class="tool-card">
    <div class="disclaimer-banner"><strong>Hinweis:</strong> ${RDG_DISCLAIMER}</div>

    <div id="tab-kind" class="tab-panel active">
      <div class="form-grid">
        <div class="form-group">
          <label>Bereinigtes Nettoeinkommen (Pflichtiger) <span>pro Monat</span></label>
          <input type="number" id="k-einkommen" value="3200" min="0">
        </div>
        <div class="form-group">
          <label>Alter des Kindes</label>
          <input type="number" id="k-alter" value="8" min="0" max="25">
        </div>
      </div>
      <button class="calc-btn" onclick="calcHomeKind()">Kindesunterhalt berechnen</button>
      <div class="result" id="result-kind">
        <div class="result-hero">
          <div class="r-label">Zahlbetrag (nach Kindergeld)</div>
          <div class="r-amount" id="k-out-zahl">–</div>
          <div class="r-sub" id="k-out-sub"></div>
        </div>
        <div class="result-grid">
          <div class="r-stat"><div class="sv" id="k-out-bedarf">–</div><div class="sl">Bedarf (Tabellenbetrag)</div></div>
          <div class="r-stat"><div class="sv" id="k-out-gruppe">–</div><div class="sl">Einkommensgruppe</div></div>
          <div class="r-stat"><div class="sv" id="k-out-kg">–</div><div class="sl">Kindergeldanteil</div></div>
        </div>
        <div class="result-note" id="k-out-note"></div>
      </div>
      <p style="margin-top:18px;font-size:0.88rem;"><a href="/kindesunterhalt-rechner/" class="cta-link" style="color:var(--brand)">→ Detailrechner mit mehreren Kindern &amp; Wechselmodell</a></p>
    </div>

    <div id="tab-ehe" class="tab-panel">
      <div class="form-grid">
        <div class="form-group">
          <label>Nettoeinkommen Pflichtiger</label>
          <input type="number" id="e-pflichtig" value="3500" min="0">
        </div>
        <div class="form-group">
          <label>Nettoeinkommen Berechtigter <span>0 falls kein Einkommen</span></label>
          <input type="number" id="e-berechtigt" value="0" min="0">
        </div>
        <div class="form-group full">
          <label>Pflichtiger ist</label>
          <div class="radio-group">
            <div class="radio-opt"><input type="radio" name="e-erwerb" id="e-erwerb-ja" checked><label for="e-erwerb-ja">Erwerbstätig (45%)</label></div>
            <div class="radio-opt"><input type="radio" name="e-erwerb" id="e-erwerb-nein"><label for="e-erwerb-nein">Nicht erwerbstätig (50%)</label></div>
          </div>
        </div>
      </div>
      <button class="calc-btn" onclick="calcHomeEhe()">Ehegattenunterhalt berechnen</button>
      <div class="result" id="result-ehe">
        <div class="result-hero">
          <div class="r-label">Monatlicher Unterhalt</div>
          <div class="r-amount" id="e-out-betrag">–</div>
          <div class="r-sub" id="e-out-sub"></div>
        </div>
        <div class="result-grid">
          <div class="r-stat"><div class="sv" id="e-out-quote">–</div><div class="sl">Anrechnungsquote</div></div>
          <div class="r-stat"><div class="sv" id="e-out-selbst">–</div><div class="sl">Selbstbehalt Pflichtiger</div></div>
        </div>
        <div class="result-note" id="e-out-note"></div>
      </div>
      <p style="margin-top:18px;font-size:0.88rem;"><a href="/ehegattenunterhalt-rechner/" class="cta-link" style="color:var(--brand)">→ Detailrechner mit sonstigen Einkünften</a></p>
    </div>
  </div>
</div>

<div class="content container">
  <h2 class="section-title">Alle Unterhaltsrechner im Überblick</h2>
  <div class="calc-grid">
    <a class="calc-card" href="/kindesunterhalt-rechner/"><h3>Kindesunterhalt-Rechner</h3><p>Nach Düsseldorfer Tabelle, mehrere Kinder, Kindergeldanrechnung</p></a>
    <a class="calc-card" href="/ehegattenunterhalt-rechner/"><h3>Ehegattenunterhalt-Rechner</h3><p>Nacheheliche 45%/50%-Differenzmethode inkl. sonstiger Einkünfte</p></a>
    <a class="calc-card" href="/trennungsunterhalt-rechner/"><h3>Trennungsunterhalt-Rechner</h3><p>Für die Zeit der Trennung, vor der Scheidung</p></a>
    <a class="calc-card" href="/unterhaltstabelle/"><h3>Düsseldorfer Tabelle 2026</h3><p>Vollständige Tabelle, alle 15 Einkommensgruppen</p></a>
    <a class="calc-card" href="/selbstbehalt/"><h3>Selbstbehalt-Rechner</h3><p>Eigenbedarf gegenüber Kindern, Ehegatten, Eltern</p></a>
    <a class="calc-card" href="/wechselmodell/"><h3>Wechselmodell-Rechner</h3><p>Unterhalt bei paritätischer Doppelresidenz</p></a>
    <a class="calc-card" href="/unterhalt-ab-18/"><h3>Unterhalt ab 18</h3><p>Volljährige Kinder, Ausbildung, Studium</p></a>
    <a class="calc-card" href="/jugendamt-berechnung/"><h3>Jugendamt-Berechnung</h3><p>Beistandschaft, Beurkundung, Ablauf</p></a>
  </div>

  <h2 class="section-title">Wie funktioniert die Düsseldorfer Tabelle?</h2>
  <p>Die Düsseldorfer Tabelle ist keine gesetzliche Vorschrift, sondern eine Richtlinie der Familiensenate der Oberlandesgerichte, die als bundesweiter Standard für die Bemessung des Kindesunterhalts dient. Sie ordnet dem bereinigten Nettoeinkommen des barunterhaltspflichtigen Elternteils eine von 15 Einkommensgruppen zu und weist für jede der vier Altersstufen des Kindes einen Bedarfssatz aus.</p>
  <div class="index-formula">Zahlbetrag = Tabellenbetrag(Einkommen, Alter) − Kindergeldanteil<br>Kindergeldanteil = Kindergeld ÷ 2 (minderjährig) oder Kindergeld (volljährig)<br>Kindergeld 2026 = 259 € je Kind</div>
  <p>Für Ehegattenunterhalt gilt eine andere Formel — die amtliche 45%/50%-Differenzmethode (Anmerkung B.I der Tabelle), begrenzt durch den Selbstbehalt des Pflichtigen. Sie wird oft vereinfacht als "3/7-Methode" bezeichnet, da beide Ansätze bei reinem Erwerbseinkommen zu nahezu identischen Ergebnissen führen.</p>

  <h2 class="section-title">Häufige Fragen</h2>
  ${renderFaq(homeFaq)}
</div>
${eeatSection(false)}
`;

var homeExtraScript = `<script>
function calcHomeKind() {
  var einkommen = parseFloat(document.getElementById('k-einkommen').value) || 0;
  var alter = parseInt(document.getElementById('k-alter').value) || 0;
  var res = berechneKindesunterhalt(einkommen, alter);
  if (res.ueberTabelle) {
    document.getElementById('k-out-zahl').textContent = 'über Tabelle';
    document.getElementById('k-out-sub').textContent = 'Einkommen > 11.200 €';
    document.getElementById('k-out-bedarf').textContent = '–';
    document.getElementById('k-out-gruppe').textContent = '–';
    document.getElementById('k-out-kg').textContent = '–';
    document.getElementById('k-out-note').textContent = 'Ihr Einkommen liegt über der höchsten Einkommensgruppe (11.200 €). Die Tabelle gibt hier keine Werte mehr vor — der Unterhalt wird individuell nach den konkreten Lebensverhältnissen bemessen. Anwaltliche Beratung empfohlen.';
    document.getElementById('k-out-note').classList.add('warn');
    showResult('result-kind');
    return;
  }
  document.getElementById('k-out-zahl').textContent = euro(res.zahlbetrag);
  document.getElementById('k-out-sub').textContent = 'Alter ' + alter + ' Jahre';
  document.getElementById('k-out-bedarf').textContent = euro(res.bedarf);
  document.getElementById('k-out-gruppe').textContent = res.bracket + ' / 15';
  document.getElementById('k-out-kg').textContent = euro(res.kindergeldAnteil);
  document.getElementById('k-out-note').textContent = 'Einkommensgruppe ' + res.bracket + ' (bis ' + euro(res.bis) + '), ' + res.pct + '% des Mindestbedarfs. ' + '${RDG_DISCLAIMER.replace(/'/g, "\\'")}';
  document.getElementById('k-out-note').classList.remove('warn');
  showResult('result-kind');
}
function calcHomeEhe() {
  var pflichtig = parseFloat(document.getElementById('e-pflichtig').value) || 0;
  var berechtigt = parseFloat(document.getElementById('e-berechtigt').value) || 0;
  var erwerbstaetig = document.getElementById('e-erwerb-ja').checked;
  var res = berechneEhegattenunterhalt(pflichtig, berechtigt, erwerbstaetig);
  document.getElementById('e-out-betrag').textContent = euro(res.unterhalt);
  document.getElementById('e-out-sub').textContent = erwerbstaetig ? '45%-Quote (erwerbstätig)' : '50%-Quote (nicht erwerbstätig)';
  document.getElementById('e-out-quote').textContent = res.quote + '%';
  document.getElementById('e-out-selbst').textContent = euro(res.selbstbehalt);
  if (res.selbstbehaltUnterschritten) {
    document.getElementById('e-out-note').textContent = 'Der rechnerische Unterhalt wurde auf den Selbstbehalt des Pflichtigen (' + euro(res.selbstbehalt) + ') begrenzt. ${RDG_DISCLAIMER.replace(/'/g, "\\'")}';
    document.getElementById('e-out-note').classList.add('warn');
  } else {
    document.getElementById('e-out-note').textContent = '${RDG_DISCLAIMER.replace(/'/g, "\\'")}';
    document.getElementById('e-out-note').classList.remove('warn');
  }
  showResult('result-ehe');
}
</script>`;

var homePage = {
  href: '/',
  title: 'Unterhaltsrechner 2026 — Kindesunterhalt & Ehegattenunterhalt kostenlos berechnen',
  metaDescription: 'Kostenloser Unterhaltsrechner 2026 nach der Düsseldorfer Tabelle: Kindesunterhalt und Ehegattenunterhalt schnell und unverbindlich berechnen. Keine Anmeldung, keine Kosten.',
  h1: 'Unterhaltsrechner 2026',
  tagline: 'Kindesunterhalt & Ehegattenunterhalt nach der Düsseldorfer Tabelle — kostenlos, ohne Anmeldung',
  hasCalc: true,
  webApp: true,
  faq: homeFaq,
  body: homeBody,
  extraScript: homeExtraScript,
};

// ---------------------------------------------------------------------------
// Write function
// ---------------------------------------------------------------------------

function writePage(page) {
  var dir = path.join(__dirname, page.href === '/' ? '.' : '.' + page.href);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), shell(page));
  console.log('wrote', page.href);
}

module.exports = { shell, writePage, renderNav, renderFaq, faqJsonLd, breadcrumbJsonLd, eeatSection, footer, RDG_DISCLAIMER, NAV, SITE, PUBLISHER_NAME };

if (require.main === module) {
  writePage(homePage);
  // Satellite pages are generated by generate-satellites.js (requires this module)
}
