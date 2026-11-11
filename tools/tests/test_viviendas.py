"""Pruebas de la página de viviendas por idioma. Ejecutar: python3 tools/tests/test_viviendas.py"""
import json
import re
import sys
import unittest
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / "tools" / "i18n"))
import gen_viviendas as g  # noqa: E402

FICHAS = g.leer_fichas()
TEXTOS = json.loads((RAIZ / "tools" / "i18n" / "viviendas_i18n.json").read_text(encoding="utf-8"))


class Datos(unittest.TestCase):
    def test_cada_vivienda_traducida_existe_en_el_catálogo_con_precio_y_fotos(self):
        for ref in TEXTOS:
            ficha = FICHAS[ref]
            self.assertTrue(int(ficha["price"]) > 50000, ref)
            for n in g.FOTOS:
                self.assertTrue((RAIZ / "assets" / "img" / ficha["slug"] / f"{n}.webp").exists(), (ref, n))

    def test_cada_vivienda_tiene_los_cuatro_idiomas(self):
        for ref, por_idioma in TEXTOS.items():
            self.assertEqual(sorted(por_idioma), ["de", "fr", "it", "nl"], ref)

    def test_el_precio_se_escribe_con_puntos(self):
        self.assertEqual(g.precio("299000").replace("\xa0", " "), "299.000 €")

    def test_idealista_en_el_idioma_y_sin_enlace_si_no_hay_anuncio(self):
        self.assertEqual(g.idealista_en("https://www.idealista.com/pro/x/inmueble/111258127/", "de"),
                         "https://www.idealista.com/de/inmueble/111258127/")
        self.assertIsNone(g.idealista_en("https://villasproperties.es/x", "de"))
        self.assertIsNone(g.idealista_en(None, "de"))

    def test_los_párrafos_repetidos_en_todas_salen_una_sola_vez(self):
        limpio = g.sin_comunes(TEXTOS, "de")
        todos = [p for lista in limpio.values() for p in lista]
        self.assertEqual(len(todos), len(set(todos)))


class Pagina(unittest.TestCase):
    def test_cada_idioma_genera_las_cinco_viviendas_con_precio_del_catálogo(self):
        for lang in g.MIEMBROS:
            pagina = g.build(lang, FICHAS, TEXTOS)
            self.assertEqual(len(re.findall(r'<article class="property vl-item"', pagina)), len(TEXTOS), lang)
            for ref in TEXTOS:
                self.assertIn(g.precio(FICHAS[ref]["price"]), pagina)
            self.assertIn(f'<html lang="{lang}">', pagina)
            self.assertIn("vp-lead.js", pagina)
            self.assertEqual(pagina.count('rel="alternate" hreflang='), len(g.MIEMBROS))

    def test_el_whatsapp_lleva_el_mensaje_en_el_idioma_y_la_referencia(self):
        pagina = g.build("de", FICHAS, TEXTOS)
        enlaces = re.findall(r'href="(https://wa\.me/\d+\?text=[^"]+)"', pagina)
        self.assertEqual(len(enlaces), len(TEXTOS))
        self.assertIn("Hallo", enlaces[0])
        self.assertIn("14541", enlaces[0])

    def test_escapa_el_html_de_los_textos(self):
        textos = json.loads(json.dumps(TEXTOS))
        ref = next(iter(textos))
        textos[ref]["de"]["titulo"] = 'Wohnung <script>alert(1)</script> & "mehr"'
        self.assertNotIn("<script>alert(1)</script>", g.build("de", FICHAS, textos))

    def test_no_promete_alquiler_turístico(self):
        for lang in g.MIEMBROS:
            self.assertIn("6/2025", g.T[lang]["aviso"])

    def test_falla_claro_si_una_vivienda_ya_no_está_en_el_catálogo(self):
        with self.assertRaises(SystemExit):
            g.build("de", {}, TEXTOS)

    def test_lo_publicado_coincide_con_lo_generado(self):
        for lang, ruta in g.MIEMBROS.items():
            self.assertEqual((RAIZ / ruta).read_text(encoding="utf-8"), g.build(lang, FICHAS, TEXTOS), ruta)


if __name__ == "__main__":
    unittest.main()
