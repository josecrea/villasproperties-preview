#!/usr/bin/env node
/* build-figuras.js — Los fondos de las tarjetas de Insights.
 *
 * POR QUÉ SVG Y NO UNA FOTO
 * -------------------------
 * Estas imágenes van DETRÁS del gráfico de cada tarjeta (las barras, la línea,
 * los puntos). Una foto compite con ese gráfico y lo vuelve ilegible; y pesando
 * ~200 KB cada una, dieciocho tarjetas se llevarían por delante el presupuesto
 * de rendimiento de la página. Cada uno de estos fondos ocupa unos 2 KB, escala
 * sin pixelarse y usa exactamente los colores de site.css.
 *
 * El motivo es topográfico —curvas de nivel— porque es lo que dibuja el sur de
 * Tenerife y porque son líneas finas: dan profundidad sin robar atención.
 *
 * Deterministas: el mismo tema da siempre el mismo fondo. Sin Math.random(), que
 * generaría un dibujo distinto en cada build y ensuciaría el diff.
 *
 * Uso:  node tools/build-figuras.js   (regenera los SVG y las reglas de site.css)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'assets', 'fig');

const PALETA = {
  atlantic: { a: '#e6ece9', b: '#cddbd4', linea: '#5f8075', mancha: 'rgba(95,128,117,.20)' },
  sand:     { a: '#f3ece4', b: '#e3d3c2', linea: '#c9ad95', mancha: 'rgba(201,173,149,.26)' },
  ink:      { a: '#e9eaea', b: '#cfd3d2', linea: '#20242a', mancha: 'rgba(32,36,42,.12)' },
};

/* PRNG con semilla: mismo tema → mismo dibujo, build tras build. */
const rng = (semilla) => {
  let s = 0;
  for (const c of semilla) s = (s * 31 + c.charCodeAt(0)) >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
};

const W = 800, H = 500;

function curvas(r, n) {
  const salida = [];
  for (let i = 0; i < n; i++) {
    const base = H * (0.18 + (i / n) * 0.92);
    const amp = 26 + r() * 46;
    const fase = r() * Math.PI * 2;
    const ciclos = 1.1 + r() * 1.5;
    const pts = [];
    for (let x = -40; x <= W + 40; x += 20) {
      const t = (x / W) * Math.PI * 2 * ciclos + fase;
      const y = base + Math.sin(t) * amp + Math.sin(t * 2.3 + fase) * (amp * 0.28);
      pts.push(`${x.toFixed(0)},${y.toFixed(1)}`);
    }
    salida.push({ d: `M${pts.join(' L')}`, op: (0.30 - (i / n) * 0.19).toFixed(3) });
  }
  return salida;
}

function svg(tema, acento) {
  const p = PALETA[acento] || PALETA.atlantic;
  const r = rng(tema + acento);
  const lineas = curvas(r, 11);
  /* Dos manchas suaves que dan volumen sin dibujar nada reconocible. */
  const m1 = { cx: (0.16 + r() * 0.2) * W, cy: (0.62 + r() * 0.26) * H, rr: (0.30 + r() * 0.16) * W };
  const m2 = { cx: (0.72 + r() * 0.20) * W, cy: (0.10 + r() * 0.22) * H, rr: (0.24 + r() * 0.14) * W };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="presentation">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.a}"/><stop offset="1" stop-color="${p.b}"/></linearGradient>
<radialGradient id="m"><stop offset="0" stop-color="${p.mancha}"/><stop offset="1" stop-color="transparent"/></radialGradient>
<clipPath id="c"><rect width="${W}" height="${H}"/></clipPath>
</defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<g clip-path="url(#c)">
<circle cx="${m1.cx.toFixed(0)}" cy="${m1.cy.toFixed(0)}" r="${m1.rr.toFixed(0)}" fill="url(#m)"/>
<circle cx="${m2.cx.toFixed(0)}" cy="${m2.cy.toFixed(0)}" r="${m2.rr.toFixed(0)}" fill="url(#m)"/>
${lineas.map((l) => `<path d="${l.d}" fill="none" stroke="${p.linea}" stroke-width="1" opacity="${l.op}"/>`).join('\n')}
</g>
</svg>`;
}

/* Un fondo por tema editorial. El tema decide el dibujo; el acento, el color. */
const TEMAS = [
  ['mapa', 'atlantic'], ['suelo', 'sand'], ['brecha', 'ink'], ['liquidez', 'atlantic'],
  ['metodo', 'sand'], ['exposicion', 'ink'], ['ciclo', 'atlantic'], ['juridico', 'ink'],
  ['proceso', 'sand'], ['zonas', 'atlantic'],
];

fs.mkdirSync(OUT, { recursive: true });
let n = 0, bytes = 0;
for (const [tema, acento] of TEMAS) {
  const s = svg(tema, acento);
  const f = path.join(OUT, `${tema}.svg`);
  fs.writeFileSync(f, s, 'utf8');
  n += 1; bytes += Buffer.byteLength(s);
  console.log(`  ✓ assets/fig/${tema}.svg`.padEnd(34) + `${acento.padEnd(9)} ${(Buffer.byteLength(s) / 1024).toFixed(1)} KB`);
}
/* ---------- Reglas CSS según lo que HAY en la carpeta ----------
   Declarar un .webp que todavía no existe hace que cada visita pida diez
   ficheros que devuelven 404. Así que el CSS se escribe mirando el disco: el
   .webp solo se declara si está puesto. Al añadir una imagen, volver a ejecutar
   este script. */
const CSS = path.join(__dirname, '..', 'site.css');
const reglas = TEMAS.map(([tema]) => {
  const webp = fs.existsSync(path.join(OUT, `${tema}.webp`));
  const fuentes = (webp ? [`url(assets/fig/${tema}.webp)`] : []).concat(`url(assets/fig/${tema}.svg)`);
  return { tema, webp, linea: `.pcard-fig[data-bg="${tema}"]{--fig-bg:${fuentes.join(',')}}` };
});
let css = fs.readFileSync(CSS, 'utf8');
const ini = '/* fig:start — generado por tools/build-figuras.js, no editar a mano */';
const fin = '/* fig:end */';
const a = css.indexOf(ini), b = css.indexOf(fin);
if (a < 0 || b < 0) {
  console.error('\n[fig] ⚠ no encuentro los marcadores fig:start / fig:end en site.css');
  process.exit(1);
}
css = css.slice(0, a) + ini + '\n' + reglas.map((r) => r.linea).join('\n') + '\n' + css.slice(b);
fs.writeFileSync(CSS, css, 'utf8');
const conImagen = reglas.filter((r) => r.webp);
console.log(`\n[fig] ${n} fondos SVG · ${(bytes / 1024).toFixed(1)} KB`);
console.log(`[fig] site.css actualizado: ${conImagen.length}/${reglas.length} temas con imagen propia` +
  (conImagen.length ? ` (${conImagen.map((r) => r.tema).join(', ')})` : ' — todos con el SVG de serie'));
