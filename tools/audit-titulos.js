#!/usr/bin/env node
/* Auditoría de títulos, H1 y descripciones de las URL del sitemap.
   Uso: node tools/audit-titulos.js [--md]   (--md imprime la tabla; sin flag, resumen + exit 1 si hay fallos)
   Criterios: título ≤60, H1 presente y en el idioma de la página, H1 comparte palabra con el título,
   título único, descripción única y ≤155. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const BASE = 'https://villasproperties.es/';
const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/\s+/g, ' ').trim();
const STOP = new Set('de la el los las en y a un una con por para del al que su tu the in of and to for at your a an das die der und le les et en du des il di e la un una per con'.split(' '));
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const words = (s) => new Set(norm(s).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w)));
const LANG_HINT = {
  es: /\b(el|la|los|las|de|del|al|en|tu|tus|para|con|una?|casa|vender|comprar|que|y)\b/,
  en: /\b(the|your|and|for|with|buy|sell|house|property|of|in|to)\b/,
  nl: /\b(de|het|een|en|van|voor|je|huis|kopen|woning|zoek|met)\b/,
  fr: /\b(le|la|les|une?|des|pour|votre|maison|acheter|et|de|du|avec)\b/,
  it: /\b(il|lo|la|le|gli|una?|per|con|casa|comprare|di|del|e|tua)\b/,
  de: /\b(der|die|das|ein|eine|und|für|mit|haus|kaufen|ihr|von|im)\b/,
};
function pages() {
  const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  return [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(BASE, '') || 'index.html');
}
function fileOf(u) {
  if (fs.existsSync(path.join(ROOT, u))) return u;
  const d = path.join(u.replace(/\/$/, ''), 'index.html');
  return fs.existsSync(path.join(ROOT, d)) ? d : null;
}
function read(u) {
  const f = fileOf(u); if (!f) return { u, missing: true };
  const h = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const lang = ((h.match(/<html[^>]*\slang="([a-z]{2})/i) || [])[1] || (u.includes('/') ? u.split('/')[0] : 'es')).toLowerCase();
  const title = strip((h.match(/<title>([\s\S]*?)<\/title>/i) || [, ''])[1]);
  const h1s = [...h.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => strip(m[1]));
  const desc = ((h.match(/<meta name="description" content="([^"]*)"/i) || [, ''])[1]).replace(/&amp;/g, '&').replace(/&quot;/g, '"');
  return { u, f, lang: LANG_HINT[lang] ? lang : 'es', title, h1: h1s[0] || '', nh1: h1s.length, desc };
}
function analyze() {
const rows = pages().map(read).filter((r) => !r.missing);
const cnt = (k) => rows.reduce((m, r) => (m[r[k]] = (m[r[k]] || 0) + 1, m), {});
const dT = cnt('title'), dD = cnt('desc');
const score = (t, l) => { const m = (norm(t).match(LANG_HINT[l]) || []).length; return m; };
const fails = [];
rows.forEach((r) => {
  r.p = [];
  if (r.title.length > 60) r.p.push('título>60');
  if (dT[r.title] > 1) r.p.push('título repetido');
  if (!r.h1) r.p.push('sin H1');
  else {
    const tw = words(r.title), hw = words(r.h1);
    if (![...hw].some((w) => tw.has(w))) r.p.push('H1≠título');
    const other = Object.keys(LANG_HINT).filter((l) => l !== r.lang);
    const own = (norm(r.h1).match(new RegExp(LANG_HINT[r.lang].source, 'g')) || []).length;
    const best = Math.max(...other.map((l) => (norm(r.h1).match(new RegExp(LANG_HINT[l].source, 'g')) || []).length));
    if (best > own) r.p.push('H1 otro idioma');
  }
  if (r.nh1 > 1) r.p.push('varios H1');
  if (!r.desc) r.p.push('sin descripción');
  else { if (dD[r.desc] > 1) r.p.push('desc repetida'); if (r.desc.length > 155) r.p.push('desc>155'); }
  if (r.p.length) fails.push(r);
});
return { rows, fails };
}
module.exports = { analyze, strip, words, norm, LANG_HINT };
if (require.main === module) {
const { rows, fails } = analyze();
if (process.argv.includes('--md')) {
  console.log('| URL | idioma | título | H1 | descripción | problemas |\n|---|---|---|---|---|---|');
  rows.forEach((r) => console.log(`| ${r.u} | ${r.lang} | ${r.title} (${r.title.length}) | ${r.h1 || '—'} | ${r.desc ? r.desc.length + ' car.' : '—'} | ${r.p.join(', ') || 'OK'} |`));
}
const tally = {}; fails.forEach((r) => r.p.forEach((p) => (tally[p] = (tally[p] || 0) + 1)));
console.error(`[audit] ${rows.length} páginas · con problemas: ${fails.length}`, tally);
if (!process.argv.includes('--md')) fails.forEach((r) => console.error(' ', r.u, '→', r.p.join(', '), '|', r.title, '|', r.h1));
process.exit(fails.length ? 1 : 0);
}
