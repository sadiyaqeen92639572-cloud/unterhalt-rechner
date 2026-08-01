#!/usr/bin/env node
var core = require('./generate-pages.js');
var writePage = core.writePage;
var eeatSection = core.eeatSection;

var PUBLISHER_ADDRESS = 'Hardy House, 269 Poynders Gardens, London, SW4 8PQ, United Kingdom';
var COMPANY_NUMBER = '14120136';
var CONTACT_EMAIL = 'contact@unterhalt-rechner.com';

// ---------------------------------------------------------------------------
// about/
// ---------------------------------------------------------------------------
var aboutBody = '\n<div class="content container" style="padding-top:52px">\n  <h2 class="section-title">Wer betreibt diese Seite</h2>\n  <p><strong>unterhalt-rechner.com</strong> ist ein Angebot der <strong>Gesmine-Invest Limited</strong>, eingetragen im Vereinigten Königreich unter der Nummer ' + COMPANY_NUMBER + ', Geschäftssitz: ' + PUBLISHER_ADDRESS + '. Vollständige Pflichtangaben siehe <a href="/impressum/">Impressum</a>.</p>\n\n  <h2 class="section-title">Wie wir die Zahlen verifizieren</h2>\n  <p>Alle Bedarfssätze, Selbstbehalte und Formeln auf dieser Seite stammen wörtlich aus der amtlichen <a href="https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2026/DT_2026.pdf" target="_blank" rel="noopener">Düsseldorfer Tabelle, Stand 01.01.2026</a> (Oberlandesgericht Düsseldorf) — keine Werte werden selbst nachgerechnet oder aus Drittquellen ohne Prüfung übernommen. Der Ehegattenunterhalt-Rechner verwendet die in Anmerkung B.I der Tabelle dokumentierte amtliche 45%/50%-Differenzmethode, nicht eine ungeprüfte Faustformel.</p>\n  <p>Unsere Redaktion ist kein Familienrechts-Fachanwalt und dieser Rechner stellt keine individuelle Rechtsberatung dar (Rechtsdienstleistungsgesetz). Für eine verbindliche Berechnung Ihres konkreten Falls wenden Sie sich an einen Fachanwalt für Familienrecht oder die Beistandschaft Ihres Jugendamts.</p>\n\n  <h2 class="section-title">Wie der Rechner funktioniert</h2>\n  <p>Alle Berechnungen laufen ausschließlich in Ihrem Browser (JavaScript). Ihre eingegebenen Einkommens- und Altersdaten werden zu keinem Zeitpunkt an unsere Server übertragen oder gespeichert — mehr dazu in unserer <a href="/datenschutz/">Datenschutzerklärung</a>.</p>\n\n  <h2 class="section-title">Kontakt</h2>\n  <p>Fragen, Korrekturen oder veraltete Zahlen entdeckt? Schreiben Sie an <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a>.</p>\n</div>\n' + eeatSection(false) + '\n';

writePage({
  href: '/about/',
  title: 'Über uns — unterhalt-rechner.com',
  metaDescription: 'Wer unterhalt-rechner.com betreibt, wie wir die Düsseldorfer Tabelle verifizieren, und wie Sie uns erreichen.',
  h1: 'Über uns',
  tagline: 'Wer wir sind und wie wir unsere Zahlen verifizieren',
  hasCalc: false,
  webApp: false,
  body: aboutBody,
});

// ---------------------------------------------------------------------------
// impressum/  — Pflichtangaben § 5 TMG (Deutschland, nicht optional)
// ---------------------------------------------------------------------------
var impressumBody = '\n<div class="content container" style="padding-top:52px">\n  <h2 class="section-title">Angaben gemäß § 5 TMG</h2>\n  <p><strong>Gesmine-Invest Limited</strong><br>' + PUBLISHER_ADDRESS + '<br>Registriert im Vereinigten Königreich unter der Company Number ' + COMPANY_NUMBER + ' (Companies House)</p>\n\n  <h2 class="section-title">Kontakt</h2>\n  <p>E-Mail: <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a></p>\n\n  <h2 class="section-title">Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)</h2>\n  <p>Gesmine-Invest Limited, Anschrift wie oben.</p>\n\n  <h2 class="section-title">Haftung für Inhalte</h2>\n  <p>Die Inhalte dieser Seite wurden mit größtmöglicher Sorgfalt erstellt. Alle Berechnungsergebnisse sind unverbindliche Orientierungswerte auf Basis der Düsseldorfer Tabelle 2026 und stellen keine individuelle Rechtsberatung im Sinne des Rechtsdienstleistungsgesetzes (RDG) dar. Für eine verbindliche Berechnung Ihres Einzelfalls wenden Sie sich an einen Fachanwalt für Familienrecht oder das zuständige Jugendamt.</p>\n\n  <h2 class="section-title">Haftung für Links</h2>\n  <p>Diese Seite enthält Links zu externen Webseiten Dritter (z. B. Anwaltsvermittlung, Jugendamt-Informationsseiten), auf deren Inhalte wir keinen Einfluss haben. Für diese Inhalte ist stets der jeweilige Anbieter verantwortlich.</p>\n\n  <h2 class="section-title">Urheberrecht</h2>\n  <p>Die durch die Seitenbetreiber erstellten Inhalte unterliegen dem deutschen Urheberrecht. Die Bedarfssätze und Formeln der Düsseldorfer Tabelle sind amtliche Werke des Oberlandesgerichts Düsseldorf und werden als solche zitiert.</p>\n\n  <h2 class="section-title">Online-Streitbeilegung</h2>\n  <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener">ec.europa.eu/consumers/odr</a>. Da dieses Angebot kostenlos und werbefrei ist und keine Verträge mit Verbrauchern abgeschlossen werden, ist diese Plattform hier nicht einschlägig — wird der Vollständigkeit halber genannt.</p>\n</div>\n';

writePage({
  href: '/impressum/',
  title: 'Impressum — unterhalt-rechner.com',
  metaDescription: 'Impressum gemäß § 5 TMG für unterhalt-rechner.com.',
  h1: 'Impressum',
  tagline: 'Pflichtangaben gemäß § 5 TMG',
  hasCalc: false,
  webApp: false,
  body: impressumBody,
});

// ---------------------------------------------------------------------------
// datenschutz/
// ---------------------------------------------------------------------------
var datenschutzBody = '\n<div class="content container" style="padding-top:52px">\n  <h2 class="section-title">Verantwortlicher</h2>\n  <p>Gesmine-Invest Limited, ' + PUBLISHER_ADDRESS + '. Kontakt: <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a>.</p>\n\n  <h2 class="section-title">Keine Datenerhebung durch die Rechner</h2>\n  <p>Alle Unterhaltsrechner auf dieser Seite laufen vollständig client-seitig in Ihrem Browser (JavaScript). Eingegebene Einkommens-, Alters- oder sonstige Daten werden <strong>zu keinem Zeitpunkt an unsere Server übertragen, gespeichert oder an Dritte weitergegeben</strong>. Es findet keine Speicherung in Cookies, LocalStorage oder einer Datenbank statt.</p>\n\n  <h2 class="section-title">Kein Tracking, keine Analytics, keine Werbung</h2>\n  <p>Diese Seite verwendet aktuell keine Analyse-Tools (z. B. Google Analytics), keine Werbe-Cookies und keine Drittanbieter-Tracking-Skripte. Sollte sich dies zukünftig ändern, wird diese Datenschutzerklärung entsprechend aktualisiert und — soweit erforderlich — eine Einwilligung eingeholt.</p>\n\n  <h2 class="section-title">Server-Logfiles (Hosting)</h2>\n  <p>Beim Aufruf dieser Seite verarbeitet unser Hosting-Anbieter (GitHub Pages, Betreiber: GitHub Inc./Microsoft) automatisch technische Zugriffsdaten (IP-Adresse, Zeitpunkt, aufgerufene Seite, Referrer), wie bei jedem Webserver-Zugriff üblich, zur Gewährleistung des sicheren Betriebs (Art. 6 Abs. 1 lit. f DSGVO). Diese Daten werden von uns nicht ausgewertet. Details zur Verarbeitung durch GitHub: <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener">GitHub Privacy Statement</a>.</p>\n\n  <h2 class="section-title">Vertreter nach Art. 27 DSGVO</h2>\n  <p>Da diese Seite keine personenbezogenen Daten von Nutzerinnen und Nutzern erhebt, speichert oder verarbeitet (siehe oben), gehen wir davon aus, dass keine über die Hosting-Logfiles hinausgehende Datenverarbeitung im Sinne der DSGVO stattfindet, die eine Benennung eines EU-Vertreters nach Art. 27 DSGVO zwingend erforderlich macht. Sollten Sie diese Einschätzung anders beurteilen oder Fragen dazu haben, kontaktieren Sie uns gerne direkt.</p>\n\n  <h2 class="section-title">Ihre Rechte</h2>\n  <p>Sie haben nach der DSGVO grundsätzlich das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21) bezüglich Ihrer personenbezogenen Daten. Da wir keine Nutzerdaten speichern, laufen diese Rechte in der Praxis meist leer — kontaktieren Sie uns bei Fragen dennoch gerne unter ' + CONTACT_EMAIL + '. Sie haben zudem das Recht auf Beschwerde bei einer Datenschutzaufsichtsbehörde.</p>\n</div>\n';

writePage({
  href: '/datenschutz/',
  title: 'Datenschutzerklärung — unterhalt-rechner.com',
  metaDescription: 'Datenschutzerklärung: Alle Berechnungen laufen lokal im Browser, keine Datenerhebung, kein Tracking.',
  h1: 'Datenschutzerklärung',
  tagline: 'Keine Datenerhebung — alle Berechnungen laufen lokal in Ihrem Browser',
  hasCalc: false,
  webApp: false,
  body: datenschutzBody,
});

console.log('Legal-Seiten geschrieben.');
