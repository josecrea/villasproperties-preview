/* tenerife-mapa.js — Silueta de Tenerife para el mapita de ubicación.
 *
 * Contorno REAL de la isla: relación de OpenStreetMap 2108882 (Nominatim,
 * 22-sep-2026), anillo exterior de 22.735 puntos simplificado con
 * Douglas-Peucker (eps 0,003°) a 156. Suficiente para un mapa de 200 px y
 * reconocible: no es una forma dibujada a ojo.
 *
 * Proyección equirectangular con la longitud corregida por el coseno de la
 * latitud media de la isla (28.29°), que es lo que evita que Tenerife salga
 * estirada a lo ancho. `punto(lat, lon)` devuelve las coordenadas dentro del
 * mismo viewBox, así que la chincheta y el contorno siempre casan.
 *
 * 🔑 El anillo es CERRADO (primer punto = último). Douglas-Peucker sobre un
 * anillo cerrado colapsa a 2 puntos, porque la recta entre extremos mide cero:
 * hay que partirlo por el punto más lejano y simplificar cada mitad.
 */
'use strict';

const K = 0.8805600841;        // cos(lat media) — corrección de la longitud
const MINX = -14.904295, MAXX = -14.194560;
const MINY = 27.998075, MAXY = 28.589070;

const W = 100;                 // ancho del viewBox
const H = 83.27;              // alto proporcional a la isla real

/* Devuelve [x, y] dentro del viewBox para unas coordenadas geográficas. */
function punto(lat, lon) {
  const x = ((lon * K) - MINX) / (MAXX - MINX) * W;
  const y = (MAXY - lat) / (MAXY - MINY) * H;
  return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
}

const SILUETA = 'M0.00,34.83 1.25,34.76 3.62,36.22 3.92,37.52 5.64,38.98 5.69,40.32 6.85,40.80 7.97,42.43 8.27,44.28 10.55,45.77 10.86,47.41 9.87,49.29 11.13,52.37 10.98,53.77 12.15,54.84 13.18,57.53 14.77,58.41 15.09,60.77 18.17,66.06 23.34,70.80 23.99,73.81 23.42,75.25 26.63,76.37 27.53,82.18 30.66,83.27 32.45,81.79 35.03,82.47 36.61,81.62 37.27,80.38 39.08,79.89 38.80,80.34 40.99,78.88 45.70,78.59 47.08,79.49 47.94,78.34 47.72,77.06 49.71,75.93 52.34,72.33 52.95,72.06 53.53,73.16 53.20,72.17 54.47,72.08 53.70,73.85 54.55,72.13 53.91,71.49 54.09,70.29 57.31,67.29 57.43,66.01 59.20,64.77 59.18,64.03 60.07,63.97 60.35,62.90 61.12,63.12 62.06,61.96 60.98,60.90 62.15,59.29 61.49,58.52 62.65,55.03 62.19,54.18 66.83,45.72 67.29,42.86 70.01,40.10 70.30,37.99 69.03,33.07 70.16,29.54 73.48,26.55 75.14,26.64 77.57,24.62 81.41,19.98 83.99,18.96 84.50,17.11 84.23,18.79 85.65,15.50 84.68,16.91 84.33,16.63 85.49,14.58 87.62,14.04 86.94,14.84 89.73,12.68 88.70,13.57 90.60,13.04 91.72,11.39 94.16,9.97 95.49,9.33 97.12,9.54 98.09,7.78 99.30,8.02 98.82,7.37 100.00,4.19 99.16,3.57 98.97,2.31 98.24,2.13 98.47,1.10 95.27,0.00 93.53,0.45 90.90,2.37 87.13,3.33 84.71,2.44 82.99,2.78 81.04,1.55 80.51,2.50 79.51,1.77 78.11,2.81 76.78,2.06 75.73,2.53 75.41,1.48 74.74,1.39 73.43,2.44 73.44,4.43 70.98,5.02 69.52,6.18 66.99,6.02 63.89,8.72 62.57,10.06 61.68,14.07 59.76,15.34 59.63,16.17 58.83,15.76 58.33,18.17 56.13,18.90 56.57,19.79 55.70,20.87 53.20,21.20 52.46,23.09 51.34,23.85 46.05,23.99 43.82,26.04 41.94,26.88 40.77,26.59 39.91,27.46 35.79,27.46 34.95,26.83 33.89,27.23 33.23,26.42 31.23,26.36 30.42,27.96 28.77,27.22 28.70,28.43 27.87,28.93 25.64,28.37 24.95,29.90 23.78,29.12 21.61,30.76 21.20,30.16 19.98,30.08 19.55,30.75 15.08,29.58 14.59,30.00 12.48,28.44 12.43,27.75 11.54,27.62 4.83,31.59 1.01,32.15 0.27,33.23 0.65,34.69 0.00,34.82Z';

module.exports = { W, H, SILUETA, punto };
