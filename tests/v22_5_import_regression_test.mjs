// V22.5 regression: previous-year XML import must not reference an undefined export context ID.
// The Infobahn 2024-25 instance has hundreds of contexts and non-empty facts; the observed V22.5
// failure occurred on the first fact because the importer referenced a variable that does not exist.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('..', import.meta.url);
const app = fs.readFileSync(new URL('app.js', root), 'utf8');
const bundle = fs.readFileSync(new URL('app-bundled.js', root), 'utf8');

assert.doesNotMatch(app, /\bexportCtxId\b/, 'app.js must not reference the removed undefined import context variable');
assert.doesNotMatch(bundle, /\bexportCtxId\b/, 'app-bundled.js must not reference the removed undefined import context variable');

for (const source of [app, bundle]) {
  assert.match(source, /const sourceFactContextId=c\?\.id\|\|'';/,
    'importer must derive the fact contextRef from the imported canonical context');
  assert.match(source, /contextRef:sourceFactContextId/,
    'canonical imported facts must retain the imported context reference');
  assert.match(source, /contextId:sourceFactContextId/,
    'prior fact occurrences must retain the imported context reference');
}

const fixture = `<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:xbrldi="http://xbrl.org/2006/xbrldi" xmlns:in-ci="http://www.mca.gov.in/CnI/2016-03-31" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<xbrli:context id="C1"><xbrli:entity><xbrli:identifier scheme="http://www.mca.gov.in/CIN">U72100MH2000PTC125382</xbrli:identifier></xbrli:entity><xbrli:period><xbrli:startDate>2024-04-01</xbrli:startDate><xbrli:endDate>2025-03-31</xbrli:endDate></xbrli:period></xbrli:context>
<in-ci:NameOfCompany contextRef="C1">INFOBAHN TECHNICAL SOLUTIONS (INDIA) PRIVATE LIMITED</in-ci:NameOfCompany>
</xbrli:xbrl>`;

assert.match(fixture, /contextRef="C1"/);
assert.equal('I_C1', `I_${'C1'}`);
console.log('PASS: V22.5 previous-year XML import context-reference regression.');
