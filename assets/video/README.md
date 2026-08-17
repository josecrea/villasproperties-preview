# Hero video assets

Coloca aquí el vídeo propio del hero (Tenerife, licenciado o grabado). Rutas que espera la web:

- `hero-desktop.mp4` / `hero-desktop.webm`  — 1600×900, ~15 s loop, sin audio, faststart
- `hero-mobile.mp4`  / `hero-mobile.webm`   — 720×1280 (recorte vertical propio)
- `hero-poster.webp` — primer frame como poster

Los binarios están en `.gitignore` (no se versionan). Si no hay vídeo, el hero usa
el fallback visual (film gradient + motion). Pipeline de referencia usado:

```
ffmpeg -ss 6 -t 15 -i FUENTE -an \
  -vf "fps=30,scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900" \
  -c:v libx264 -crf 27 -preset veryfast -pix_fmt yuv420p -movflags +faststart hero-desktop.mp4
```
