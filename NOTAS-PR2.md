# Revisión del PR #2: blog fiscal (ES + NL/FR/DE)

- **PR:** https://github.com/josecrea/villasproperties-preview/pull/2
- **Rama revisada:** `feature/blog-fiscal-canarias` en `44c4c3f` (los números de línea se refieren a ese commit)
- **Fecha:** 10-oct-2026
- **Páginas revisadas:** `post-impuestos-comprar-vivienda-canarias.html`, `post-comprar-vivienda-tenerife-desde-la-ue.html`, `post-segunda-residencia-costa-adeje.html` y sus traducciones `tweede-verblijf-costa-adeje-nl.html`, `residence-secondaire-costa-adeje-fr.html` y `zweitwohnsitz-costa-adeje-de.html`, más los cambios de `tools/build-seo.js` y `sitemap.xml`.
- **Cómo se ha revisado:** un revisor por página saca cada cifra fiscal y comprueba la norma; uno revisa el RDL 29/2026; otro ejecuta `build-seo.js` en una copia. Después, cada hallazgo grave pasa por revisores escépticos que intentan tumbarlo. Ninguno de los 14 hallazgos graves que revisaron así se cayó. Las 8 afirmaciones legales nuevas que salieron de la revisión pasaron por dos revisores independientes cada una.
- **Límite importante:** desde este entorno **no se puede abrir boe.es ni el BOC** (el proxy los bloquea). La normativa de 2026 se ha comprobado con resúmenes de fuentes secundarias fiables (Garrigues, Iberley, Legálitas, Noticias Jurídicas, AEAT, consulados, Pérez-Llorca, etc.), no con el texto oficial. Cuando un dato depende de la redacción literal, se indica.
- Este fichero no se publica: `_config.yml` excluye `*.md` de Pages.

## Veredicto

**No está listo para mergear.** El contenido es serio y la base fiscal es correcta en lo esencial, pero hay errores que un lector puede tomar como consejo:

1. **Las tres traducciones dicen lo contrario que el original sobre la obra nueva** (NL/FR/DE, línea 149).
2. **El post fiscal invierte quién paga el 19 % del IRNR** (línea 90).
3. **El plazo del ITP está mal en 4 páginas**: 30 días hábiles (regla estatal) en lugar de un mes (Canarias).
4. **El alquiler temporal y el de larga duración se han quedado cortos tras el RDL 29/2026**, en el cuerpo y en las FAQ que salen en Google.
5. **NL y FR remiten a bloques de país que no existen** en la página.
6. **Un enlace oficial apunta a un servidor de pruebas belga** (`5398.d8.pr.belgium.be`) en las 6 páginas.
7. **El siguiente `build-seo.js` borra las FAQ y el hreflang** de las 6 páginas y les cambia la fecha del sitemap.

Lo que está bien: **ningún post promete rentabilidad por alquiler turístico** y todos avisan de que la licencia VV se extingue con la venta. El **AJD está bien en el post fiscal**. La **tasa del NIE (9,84 €)** y el **método de imputación del convenio con Alemania** se han comprobado y son correctos.

---

## 1. Cifras fiscales: tipos, porcentajes y plazos

En las 6 páginas hay **197 cifras fiscales o legales**. **134 no llevan el artículo o la norma junto a la cifra**. El detalle, línea a línea, está en el anexo.

| Página | Cifras | Sin norma junto a la cifra | Incorrectas | Dudosas | No verificadas |
|---|---|---|---|---|---|
| post-impuestos-comprar-vivienda-canarias.html | 48 | 31 | 0 | 4 | 7 |
| post-comprar-vivienda-tenerife-desde-la-ue.html | 24 | 19 | 0 | 3 | 4 |
| post-segunda-residencia-costa-adeje.html | 41 | 30 | 1 | 0 | 11 |
| tweede-verblijf-costa-adeje-nl.html | 31 | 19 | 1 | 1 | 6 |
| residence-secondaire-costa-adeje-fr.html | 26 | 18 | 2 | 2 | 6 |
| zweitwohnsitz-costa-adeje-de.html | 27 | 17 | 1 | 4 | 8 |

**Dónde faltan sobre todo las citas:**

- **Resúmenes TL;DR y FAQ, incluido el JSON-LD.** Es el texto que Google muestra suelto y no lleva ninguna norma. En el post fiscal, la FAQ (línea 30 y líneas 122-128) da ITP 6,5 %, IGIC 7 %, AJD 1 %, IRNR 1,1 %/2 % × 19 %/24 % y retención del 3 % sin citar artículos. El dek del post promete «el artículo de ley detrás de cada cifra» (líneas 8, 14, 22, 27 y 45), y la promesa no se cumple.
- **IRNR:** 19 %/24 % y renta imputada 1,1 %/2 % sin los arts. 24.5, 24.6 y 25.1.a TRLIRNR ni el art. 85 LIRPF. Pasa en el post fiscal (líneas 86 y 90), en el de segunda residencia (líneas 149 y 160) y en las traducciones (169 y 183).
- **Reducción del 50 % por alquiler de vivienda** (post fiscal, línea 90): falta el art. 23.2 LIRPF.
- **IGIC 7 % en el post de segunda residencia** (línea 122) y en las traducciones (línea 142): falta el art. 32 del DL 1/2025. El post fiscal sí lo cita.
- **Plazo belga de 4 meses**: no cita norma en ninguna página. El dato es correcto según SPF Finances.
- **Notaría, registro y gestoría**: aparecen como «arancel» sin norma. Son el RD 1426/1989 y el RD 1427/1989, y las horquillas son de mercado.
- **Arras «10 %» y «45 días»**: son práctica habitual, no norma. Hay que decirlo así.

**Cifras incorrectas o dudosas (confirmadas por los revisores escépticos):**

| Página:línea | Qué dice | Problema | Propuesta |
|---|---|---|---|
| post-segunda-residencia:138, NL/FR/DE:158 | Plazo del ITP: «treinta días hábiles» (art. 102 RD 828/1995) | Es la regla estatal. En Canarias el modelo 600 se presenta en **un mes** desde el acto (trámite 4026 de la sede del Gobierno de Canarias, DL 1/2009). Contradice al propio PR: el post UE (línea 88) dice «en el plazo de un mes desde la firma». Quien se fíe del texto puede presentar tarde y pagar recargo. | «En Canarias, el plazo para presentar la autoliquidación del ITP (modelo 600) es de un mes desde que se firma» y citar la norma canaria. Falta confirmar el número de artículo exacto del DL 1/2009. Cambiar también el enlace de fuentes (ES línea 176). |
| post-impuestos:56 | ITP del 5 % «si se cumplen requisitos de renta y de patrimonio» | El requisito determinante en 2026 es que la base no supere **200.000 €** (antes 150.000 €; Ley 9/2025 de presupuestos canarios) y que no se tenga otra vivienda. Tampoco se cita el artículo (art. 31 DL 1/2009) ni se menciona la bonificación para menores de 40 años. | Reescribir con el límite de 200.000 € y la cita. |
| post-impuestos:70 | IGIC del 3 % para vivienda habitual de menores de 40 | Omite el precio máximo de 200.000 € y la renta máxima de 46.455 € (Ley 9/2025). No se ha podido confirmar que el artículo sea el 38 del DL 1/2025. | Añadir los dos límites y verificar el artículo. |
| post-impuestos:70 | IGIC 0 % para protección oficial | Sin cita y sin alcance (qué régimen de VPO). | Citar el artículo o quitar la cifra. |
| post-UE:96, 51, 97, 30, 135 | Gastos «≈ 8 % ≈ 24.000 €» y ahorro de 114.000 a 144.000 € | No coincide con la línea 104 del mismo post: segunda mano 20.800-22.100 €, obra nueva 25.300-26.600 €. Además, el ahorro necesario no incluye tasación ni abogado. | Usar las dos horquillas de la línea 104 y recalcular el ahorro. |
| post-impuestos:30, 86 y 125; segunda residencia:149; traducciones:169 | Renta imputada: «1,1 % (2 % si no está revisado en diez años)» | **Para 2026, el RDL 29/2026 aplica el 1,1 % a los municipios con revisión catastral desde el 1-1-2012** (Iberley, fiscal-impuestos). La regla de «diez años» ya no es exacta. **Desde 2027** el mismo RDL cambia el art. 85 LIRPF a una escala progresiva (1,1 / 1,5 / 2 / 3 % según la suma de valores catastrales). No está confirmado cómo afecta al IRNR. Adeje tiene ponencia nueva desde 2025, así que el 1,1 % del ejemplo es correcto. | Poner «regla de 2026», corregir la frase de los diez años y añadir la salvedad para 2027 (pendiente de convalidación). |
| post-UE:30 y 136 (FAQ) | «45 días… la señal se pierde (artículo 1454 del Código Civil)» | El art. 1454 CC no fija plazos y solo se aplica a arras **penitenciales pactadas expresamente**. Sin ese pacto se presumen confirmatorias. El cuerpo (línea 82) sí lo matiza; la FAQ no. | «Si las arras se pactan como penitenciales (art. 1454 CC)…» y presentar los 45 días como orientación práctica. Lo mismo en segunda residencia:134 y traducciones:154. |

**Comprobado y correcto** (para no tocarlo): ITP 6,5 % (art. 31 DL 1/2009); IGIC 7 % (art. 32 DL 1/2025); AJD 0,75 %/1 % en el post fiscal (art. 36 DL 1/2009); retención del 3 % (art. 25.2 TRLIRNR); IRNR 19 % UE/EEE y 24 % resto; tasa del NIE 9,84 € (modelo 790-012; no ha cambiado en 2026, se confirmó dos veces); apostilla belga 25 €; código 1106 belga; art. 22.2.b.vii del convenio con Alemania (imputación/Anrechnung para inmuebles); aritmética de los ejemplos sobre 300.000 € y 395.000 €.

## 2. Alquiler de temporada y RDL 29/2026

**Lo que dice la norma** (según fuentes secundarias coincidentes; el BOE no se ha podido abrir):

- **Real Decreto-ley 29/2026, de 6 de octubre** (BOE-A-2026-20823), «medidas urgentes para la protección de la función social de la vivienda y la ampliación de la oferta de vivienda asequible». **Se publicó en el BOE del 7 de octubre y está en vigor desde el 8 de octubre.** Los posts dicen «desde el 8 de octubre», que es correcto. No conviene escribir «BOE del 8 de octubre».
- Sustituye al **RDL 26/2026**, que el Congreso no convalidó el 2-oct-2026 y quedó derogado. Con las Cortes disueltas (elecciones el 29-nov-2026), la convalidación corresponde a la **Diputación Permanente del Congreso**. **Si no se convalida, decae.**
- El antiguo «arrendamiento de temporada» (art. 3 LAU, uso distinto de vivienda) pasa a ser **«arrendamiento de vivienda temporal»** dentro del régimen de vivienda (art. 2.3). Hace falta una **causa real y acreditable**, cuya prueba corresponde al arrendador (art. 7.2). Debe durar **más de 31 días** y, como regla, **no más de 12 meses salvo que la causa persista** (art. 9 bis).
- **Consecuencia:** si falta la causa, si se pasan los 12 meses sin justificarlo o si se encadenan **más de dos contratos** entre las mismas partes, el contrato **se rige como vivienda habitual**: prórroga obligatoria hasta **5 años, o 7 si el arrendador es persona jurídica** (art. 9 LAU). Si es por encadenamiento, desde el primer contrato. Dos revisores independientes lo han confirmado.
- Los contratos de temporada firmados antes del 8-oct terminan con el régimen anterior, sin prórroga.
- Además, el **RDL 29/2026** incluye una **prórroga extraordinaria de hasta 2 años** para contratos de vivienda habitual que venzan antes del 31-dic-2028 y un **tope supletorio del 2 % a la actualización anual** hasta el 31-dic-2027 (DF 5.ª y 6.ª según las fuentes). También permite un **recargo de hasta el 50 % en el IBI** de las viviendas de uso turístico en zonas tensionadas (art. 8, que modifica el art. 72 TRLRHL; requiere ordenanza municipal). El **RDL 28/2026** (BOE-A-2026-20822) cambia las prórrogas del art. 10 LAU desde el 15-nov-2026, si se convalida (su convalidación es más dudosa).

**Cómo quedan los posts:**

| Página:línea | Texto actual | Estado | Qué cambiar |
|---|---|---|---|
| post-segunda-residencia:160, NL/FR/DE:184 | «Alquiler temporal… desde el 8 de octubre de 2026 el RDL 29/2026 exige que el contrato declare la causa…» | **Incompleto.** Lo que dice es correcto (causa, carga de la prueba, más de 31 días, máximo 12 meses, convalidación pendiente), pero **falta la consecuencia**: que se convierte en vivienda habitual de 5/7 años. Es el riesgo clave para quien quiere usar la casa en invierno. | Añadir: «Si falta la causa, si se superan los doce meses sin que la causa siga existiendo o si se encadenan más de dos contratos temporales con el mismo inquilino, el contrato pasa a regirse como alquiler de vivienda habitual: el inquilino podrá quedarse hasta cinco años (siete si el arrendador es una sociedad), según el artículo 9 de la LAU». Añadir también la salvedad de que el RDL decae si no se convalida. |
| post-segunda-residencia:160, NL/FR/DE:183 | «Alquiler de larga duración: sí, sin restricciones especiales» | **Engañoso.** El art. 9 LAU da al inquilino 5 años (7 si el arrendador es empresa); mientras tanto la casa no se puede usar. Además, se aplica el tope del 2 % hasta 2027. Probablemente se quería decir «no necesita licencia», que sí es correcto. | «Alquiler de larga duración: sí, sin licencia, pero el inquilino tiene derecho a cinco años (siete si el arrendador es una empresa, art. 9 LAU) y durante ese tiempo usted no puede usar la vivienda. Hasta finales de 2027 la actualización anual de la renta tiene un tope del 2 % (RDL 29/2026)». Citar los arts. 24.6 y 25.1.a TRLIRNR junto al 19 %. |
| post-segunda-residencia:200 y JSON-LD:35; NL/FR/DE:256-258 y JSON-LD:34 | FAQ: «Un alquiler temporal… exige desde octubre de 2026 una causa justificada… El alquiler de larga duración sí es sencillo» | **Desactualizado y engañoso**, y es el texto que sale en Google. No nombra el RDL, no dice que está pendiente de convalidación, omite la conversión y llama «sencillo» a un compromiso de 5 años. | Reescribir con las dos frases de arriba, en el cuerpo visible y en el JSON-LD a la vez. |
| post-segunda-residencia:176, NL:217, FR/DE:215 (fuentes) | Solo enlaza la LAU consolidada | Falta la norma que hace el cambio. Si el RDL decae, el consolidado cambiará. | Añadir el enlace a BOE-A-2026-20823 («de 6 de octubre; BOE del 7; en vigor el 8; pendiente de convalidación») y el art. 9 LAU. |
| FR:184 y 256 | «Location de courte durée» | **Mal traducido.** En francés (Francia y Bélgica, y en la versión francesa del Reglamento UE 2024/1028) significa alquiler turístico tipo Airbnb, justo lo contrario de lo que describe el apartado. Lo han confirmado dos revisores. | «Location temporaire» o «location de moyenne durée». Se puede añadir «proche du bail mobilité français, mais soumise au droit espagnol». En la línea 184, «ratification» debe ser «validation». |
| post-impuestos:51 y 89-93 | «Al alquilar: la larga duración es sencilla»; la sección solo distingue larga duración y vacacional | **Incompleto.** No menciona el alquiler temporal, que es justo lo que cambió el 8-oct, y repite lo de «sencilla». | Título «Al alquilar: larga duración, temporal o vacacional»; un párrafo sobre el temporal que remita al post de segunda residencia; corregir «sencilla» en la línea 51. |
| post-impuestos:86 (IBI) | Sin mención al recargo | **Falta una novedad.** | Frase en condicional: «Desde el RDL 29/2026, los ayuntamientos de zonas tensionadas pueden aprobar un recargo de hasta el 50 % del IBI en viviendas de uso turístico (art. 72 TRLRHL), pendiente de convalidación». |
| post-impuestos:90 | «Reducción general del 50 %» | **Puede quedarse corta.** Según las fuentes, el RDL 29/2026 cambia la reducción del art. 23.2 LIRPF para los contratos nuevos a partir de diciembre de 2026. | Citar el art. 23.2 y añadir «para contratos firmados hasta noviembre de 2026; los nuevos, según el RDL 29/2026». Comprobar contra el BOE antes de concretar porcentajes. |
| post-UE:106 | «El alquiler de larga duración sí es sencillo» | Igual que arriba. | «Es posible, con cinco años de duración mínima para el inquilino (art. 9 LAU)». |

**No añadir:** algunas fuentes dicen que el RDL reescribe el art. 5.e LAU y que la vivienda turística solo queda fuera de la LAU hasta 31 días. **No se ha podido verificar** (los dos revisores lo dejaron como «no verificable»). No hay que meterlo en ningún post hasta leer el BOE.

**Registro Único** (post-impuestos:92): la STS 620/2026 lo anuló, efectivamente. Para ser exactos, la estimación fue parcial (falta de competencia estatal) y la ventanilla única digital se mantiene. El RDL 29/2026 no lo reintroduce.

## 3. AJD (0,75 % / 1 % con IGIC, art. 36 DL 1/2009)

| Página | ¿0,75 % y 1 % con IGIC? | ¿Cita el art. 36 DL 1/2009? | Comentario |
|---|---|---|---|
| post-impuestos | **Sí** en el cuerpo (línea 71), la tabla (76) y las fuentes (102) | **Sí** | Correcto. Pero el resumen (línea 51) y la FAQ del JSON-LD (línea 30) solo dan «1 %», sin el 0,75 % ni el artículo. |
| post-UE | No: solo «actos jurídicos documentados del 1 %» en obra nueva (línea 104) | **No** (remite al post fiscal) | Añadir «0,75 % en general y 1 % cuando la operación está sujeta a IGIC (art. 36 DL 1/2009)». |
| post-segunda-residencia | No: solo el AJD del préstamo, que paga el banco (línea 125), y «sin obra nueva, no hay IGIC ni AJD» (129) | **No** | Para un piso de segunda mano es defendible (tributa por ITP), pero no cumple el criterio. Añadir una frase con los tipos y el artículo en la nota de la línea 129. |
| NL/FR/DE | No | **No** | Además, **la nota de la línea 149 está traducida al revés** (ver abajo). |

**Error grave de traducción (NL, FR y DE, línea 149).** El original dice: «Sin obra nueva, no hay IGIC ni AJD en la compraventa», es decir, como el piso es de segunda mano, solo paga ITP. Las traducciones dicen lo contrario:

- NL: «Bij nieuwbouw geen IGIC of AJD op de koopakte zelf.»
- FR: «En VEFA (neuf), pas d'IGIC ni d'AJD sur l'acte de vente lui-même.»
- DE: «Bei Neubau keine IGIC und keine AJD auf den Kaufvertrag selbst.»

Le dicen al lector que la obra nueva **no** paga IGIC ni AJD. Es falso (IGIC 7 % + AJD 1 %) y contradice el post fiscal del mismo PR. Propuesta:

- NL: «Omdat het geen nieuwbouw is, valt er op de koopakte geen IGIC of AJD: alleen ITP. (Bij nieuwbouw is het omgekeerd: geen ITP, maar 7 % IGIC plus 1 % AJD, art. 36 DL 1/2009.)»
- FR: «Pour un bien ancien, pas d'IGIC ni d'AJD sur l'acte de vente : seuls les droits de mutation (ITP). En VEFA (neuf), c'est l'inverse : pas d'ITP, mais 7 % d'IGIC et 1 % d'AJD (art. 36 DL 1/2009).»
- DE: «Da es kein Neubau ist, fallen auf den Kaufvertrag weder IGIC noch AJD an, nur die ITP. (Bei Neubau umgekehrt: keine ITP, sondern 7 % IGIC und 1 % AJD, Art. 36 DL 1/2009.)»

## 4. Promesas de rentabilidad por alquiler turístico

**Ninguna de las 6 páginas promete rentabilidad.** Todas las que hablan de vivienda vacacional dicen que la licencia **se extingue con la venta** (Ley 6/2025, DT 1.ª.11) y algunas lo dicen expresamente: «Nosotros no la prometemos» (post-impuestos:93), «uso, no rentabilidad» (segunda residencia:58-60), «No prometemos rentabilidad vacacional a nadie» (segunda residencia:160). Las traducciones mantienen el aviso.

**Una cosa que revisar:** según varias fuentes secundarias, la **Ley canaria 7/2026, de 31 de julio** (BOC n.º 163, de 14-ago-2026, en vigor desde el 15-ago) **modificó el apartado 11 de la DT 1.ª de la Ley 6/2025** por su disposición final undécima, y añadió un apartado 13. Los posts citan **entre comillas** la redacción original («la transmisión de la propiedad de la vivienda por cualquier título»: post-impuestos:92, 126 y JSON-LD:30; segunda residencia:160; traducciones:185) y no mencionan la Ley 7/2026. Lo más probable es que **la venta siga extinguiendo el uso consolidado**, así que el aviso sigue siendo válido, pero la cita literal puede estar desfasada. Hay que contrastarla con el BOC 163/2026 y citar «en la redacción dada por la Ley 7/2026». No se ha podido leer el BOC desde aquí.

Otro matiz: la mayoría de **tres quintos** viene del art. 17.12 LPH, no de la Ley 6/2025 (FAQ del post-UE:30 y 138). Lo nuevo desde el 3-abr-2025 (LO 1/2025) es la **aprobación previa** del art. 7.3 LPH (DE:123 mezcla ambas cosas; NL:185 simplifica el doble requisito de 3/5).

## 5. Otros problemas (no fiscales, pero hay que arreglarlos)

**Contenido:**

- **post-impuestos:90, redacción invertida del IRNR** (aviso de Codex, confirmado): «Si no eres residente de la Unión Europea, tributas al 19 %…; fuera de la Unión, al 24 %». Leído al pie de la letra, aplica el 19 % a quien no vive en la UE. Debe decir: «Si no resides en España pero sí en otro país de la UE o del EEE (Islandia, Noruega o Liechtenstein), tributas en el IRNR al 19 % sobre el rendimiento neto, con gastos deducibles (arts. 24.6 y 25.1.a TRLIRNR); si vives fuera de la UE y del EEE, al 24 % sobre los ingresos íntegros (arts. 24.1 y 25.1.a). En los dos casos, modelo 210». Es el único sitio del PR con este error.
- **Bloques de país perdidos en las traducciones:** NL:208 dice «Zie het Duitse blok hieronder voor de details», y FR:203 y FR:206 dicen «Voir le bloc néerlandais / allemand ci-dessous», pero **esos bloques no existen**. Cada traducción tiene un solo bloque detallado. Se ha perdido contenido del ES (líneas 168-174): NIE en Ámsterdam y en Fráncfort (EX-15, cita los martes, 9,84 €, mínimo 4 meses), apostilla, box 3 a 1 de enero y aviso de que la deducción no siempre cubre el 100 %. O se traducen los bloques, o se quita la remisión y se enlaza al ES.
- **DE:61 y DE:201, «anteilige Anrechnung» para Países Bajos:** está mal (confirmado dos veces). El convenio ES-NL de 1971 (art. 25) aplica **exención proporcional con progresividad** (evenredige vrijstelling), no imputación. Con «Anrechnung», el lector alemán lo confunde con el método que sí aplica Alemania. Mejor «anteilige Steuerermäßigung (Freistellung mit Progressionsvorbehalt)».
- **DE:206, «(kein fiktiver Nutzungswert)»:** el traductor lo ha añadido y no está en el ES. Afirma cómo trata Alemania la vivienda no alquilada justo en la frase que dice que eso no está comprobado. Quitarlo.
- **FR:71:** atribuye la Estadística Registral al «Collège des notaires et registraires»; es el Colegio de Registradores.
- **post-UE, retención del 3 %:** falta. Si el vendedor es no residente (muy frecuente en Tenerife Sur), el comprador debe retener el 3 % e ingresarlo con el modelo 211 en un mes (art. 25.2 TRLIRNR); si no, el inmueble responde. En una guía para comprar desde la UE debería estar.
- **post-UE:108, «modelo 210 cada año… o por el alquiler»:** mezcla la renta imputada con los rendimientos del alquiler, que tienen otro plazo.
- **Enlace oficial a un servidor de pruebas:** las 6 páginas enlazan a `https://5398.d8.pr.belgium.be/fr/particuliers/habitation/revenus-immobiliers/etranger` (post-UE:113, post-impuestos:102, segunda residencia:176, FR:222, NL:224, DE:222). No es el dominio oficial: usar `https://fin.belgium.be/...`.
- **Estilo:** el post fiscal mezcla tú y usted (líneas 88 y 104). La versión DE ofrece atención «auf Niederländisch, Französisch und Englisch», sin alemán (línea 194). NL usa «SPF» en vez de «FOD» y traduce mal la Administración de Documentación Patrimonial (líneas 199-225).

**SEO y build (los tres avisos de Codex son reales; se comprobaron ejecutando el build en una copia):**

- **`build-seo.js` borra las FAQ:** al ejecutar el comando de producción (`node tools/build-seo.js --index --si-publicar`), el FAQPage de las 6 páginas pasa de 8 preguntas a 0 (**se pierden 48 preguntas**). También se pierden el hreflang y, en FR/NL/DE, el Article, la descripción en su idioma y el `og:locale`. El motivo es que están dentro de `<!-- seo:start -->…<!-- seo:end -->`, que el build reescribe entero. El comentario que añade el PR en `PAGES` («el FAQPage ya va en el post») es incorrecto. **Arreglo:** sacar el FAQPage, el hreflang y, en las traducciones, el Article fuera del bloque seo (como en las landings de main); dar de alta FR, NL y DE en `PAGES` con su `published`; comprobar que un build no deja diferencias en los 6 HTML.
- **Sitemap:** `build-seo.js:308` pone `TODAY = '2026-08-18'` a todas las URL e ignora `published`. Al regenerar, las 6 páginas nuevas quedan con fecha anterior a su publicación (9-oct). Arreglo: `<lastmod>${(PAGES[f]||{}).published || TODAY}</lastmod>`.
- **Autoría:** el Article de los posts nuevos apunta a `contact.html#valeria-villa`, pero ese nodo Person no está definido en ninguna página; los posts antiguos sí lo incluyen completo. NL y FR quitan la firma «Valeria Villa, CEO» del texto y DE pone «Villa's Properties», mientras el JSON-LD sigue diciendo Valeria. El BreadcrumbList de las traducciones dice «Inicio» y le falta el nivel Insights.

## 6. Qué no se ha podido verificar

- El **texto literal del RDL 29/2026** (arts. 2.3, 5.e, 7.2 y 9 bis LAU, DT, DF 5.ª y 6.ª, art. 8) y del **RDL 28/2026**: solo resúmenes. Hay que contrastarlo con BOE-A-2026-20823 y BOE-A-2026-20822 antes de publicar frases con cifras.
- Si la **escala del art. 85 LIRPF desde 2027** se aplica al IRNR (es lógico por la remisión del art. 24.5 TRLIRNR, pero ninguna fuente lo dice) y los umbrales de la escala.
- La **nueva redacción de la DT 1.ª.11 de la Ley 6/2025** tras la Ley 7/2026 (BOC 163/2026).
- El **artículo exacto del DL 1/2009** que fija el plazo de un mes del ITP en Canarias, y el del IGIC 0 % para VPO.
- La **apostilla en Alemania** (el propio PR lo deja abierto: depende del Land).
- La **fecha de la votación de convalidación** de los RDL 28 y 29/2026.

---

## Anexo: todas las cifras, página por página

«¿Cita norma?» se refiere a si hay artículo o norma **junto a la cifra** (en la misma frase, celda o fila). **NO** = no la hay, aunque la página la cite en otro sitio. «Estado» es el resultado de comprobarla: *correcta*, *dudosa*, *incorrecta* o *no verificada* (sin fuente suficiente desde aquí). Las notas largas están recortadas.

### `post-impuestos-comprar-vivienda-canarias.html` (48 cifras, 31 sin norma junto a la cifra)

| Línea | Cifra | ¿Cita norma? | Norma citada | Estado | Nota |
|---|---|---|---|---|---|
| 30 | ITP 6,5 %; IGIC 7 %; AJD 1 %; 7-9 % total | **NO** | — | correcta | FAQ en JSON-LD, que es lo que sale en resultados enriquecidos. Las cifras coinciden con el cuerpo, pero aquí no se cita ninguna norma (art. 31 DL 1/2009, art. … |
| 30 | IGIC 7 % / 3 % / 0 %; AJD 1 % | **NO** | — | correcta | FAQ en JSON-LD sin cita. El 7 % y el 3 % están verificados: según KPMG y PwC, con la Ley 9/2025 de presupuestos de 2026 el 3 % exige 40 años o menos, precio má… |
| 30 | 1,1 % / 2 % / diez años / 19 % / 24 % / anual | **NO** | — | correcta | FAQ en JSON-LD sin cita (art. 85 LIRPF y arts. 24.5 y 25.1.a TRLIRNR). Dice 'Unión Europea' a secas, sin el EEE (Islandia, Noruega, Liechtenstein) que sí apare… |
| 30 | tres quintos (3/5) | **NO** | Ley 6/2025 DT 1.ª apdo. 11 (extinción); sin cita … | correcta | La extinción con la venta cita la DT 1.ª.11. La mayoría de tres quintos no cita el art. 17.12 LPH ni la LO 1/2025. Hay que volver a comprobar la DT 1.ª.11 tras… |
| 30 | retención 3 % | **NO** | — | correcta | FAQ en JSON-LD sin cita. Es el art. 25.2 TRLIRNR, que sí se cita en el cuerpo (línea 96). |
| 30 | 4 meses | **NO** | — | correcta | Plazo belga sin norma citada. Lo confirma un comunicado del SPF Finances de 2021: declaración espontánea en los 4 meses siguientes a la adquisición. No he enco… |
| 51 | ITP 6,5 %; 20.800-22.100 €; ~7 % | **NO** | — | correcta | Resumen sin cita; la cita está más abajo (línea 56/61). La aritmética es correcta (6,93 %-7,37 %). |
| 51 | IGIC 7 %; AJD 1 %; 25.300-26.600 €; ~8,5 % | **NO** | — | correcta | Resumen sin cita. Aritmética correcta (8,43 %-8,87 %). |
| 51 | 19 %; retención 3 % | **NO** | — | correcta | Resumen sin cita. Es el art. 25.1 y 25.2 TRLIRNR, citado en la línea 96. |
| 56 | ITP 6,5 % | sí | art. 31 DL 1/2009 (Canarias) | correcta | Según el índice del texto refundido publicado por el Ministerio de Hacienda, el art. 31 es el tipo general de TPO. Coincide con las guías de 2026. |
| 56 | ITP 5 % vivienda habitual | **NO** | — | dudosa | No cita artículo. El 5 % existe, pero las fuentes secundarias de 2026 dan como requisito principal un valor de la vivienda de hasta 200.000 € (antes 150.000 €,… |
| 56 | tipos reducidos (sin cifra; 1 % según fuentes) | **NO** | — | correcta | No da cifra ni artículo. Según el índice de Hacienda, son los arts. 32 (familia numerosa) y 33 (discapacidad) del DL 1/2009. Hipotecas.me da un 1 % con límites… |
| 61 | 6,5 % / 19.500 € | sí | DL 1/2009, art. 31 | correcta | La regla de base 'mayor de precio y valor de referencia' no cita el art. 10.2 TRLITPAJD (redacción de la Ley 11/2021). |
| 62 | 600-1.200 €; 400-800 €; 300-600 € | **NO** | 'arancel' (genérico) | no verificada | Son honorarios, no impuestos. 'Arancel' no es una norma concreta: los aranceles notarial y registral son el RD 1426/1989 y el RD 1427/1989. Las horquillas son … |
| 65 | 20.800-22.100 € (7-7,4 %) | **NO** | — | correcta | Cifra derivada; la aritmética cuadra. |
| 68 | ≈1 % + IGIC; 3.200 € | **NO** | — | no verificada | Honorario de mercado, no normativo. La aritmética es coherente: 3.000 € + IGIC al 7 % = 3.210 €. |
| 70 | IGIC 7 % | sí | art. 32 DL 1/2025 (Canarias, TR IGIC) | correcta | El DL 1/2025, de 13 de octubre (BOC 20-10-2025, BOC-j-2025-90249), existe y su art. 32 fija el tipo general del 7 %. |
| 70 | IGIC 3 %; 40 años | sí | art. 38 DL 1/2025 | correcta | Según KPMG, desde el 1-1-2026 (Ley 9/2025) la edad máxima es 40 años. El texto no menciona el precio máximo de 200.000 € ni la renta máxima de 46.455 € (Gestor… |
| 70 | IGIC 0 % | **NO** | — | no verificada | Sin cita. No he podido confirmar el alcance exacto del tipo cero (qué regímenes de VPO y con qué requisitos) ni su artículo en el DL 1/2025. |
| 71 | AJD 0,75 % / 1 % | sí | art. 36 DL 1/2009 | correcta | Iberley reproduce el art. 36 (redacción de la DF 3.ª de la ley de presupuestos de 2013): 0,75 % en documentos notariales y 1 % en documentos de operaciones suj… |
| 75 | 7 % / 21.000 € | sí | DL 1/2025, art. 32 | correcta |  |
| 76 | 1 % / 3.000 € | sí | DL 1/2009, art. 36 | correcta |  |
| 80 | 25.300-26.600 € (8,4-8,9 %) | **NO** | — | correcta | Cifra derivada; la aritmética cuadra. |
| 84 | desde 2018 | **NO** | — | correcta | Sin cita: es el RDL 17/2018, que modificó el art. 29 TRLITPAJD. Las cifras '1.300 y 2.600 €' y '1 % más IGIC' de la misma línea son honorarios, no normativa. |
| 86 | 1,1 % / 2 % / diez años | sí | art. 85 Ley 35/2006 (IRPF) | correcta |  |
| 86 | IRNR 19 % / 24 %; anual | **NO** | — | correcta | No cita artículo en esta línea: son los arts. 24.5 y 25.1.a TRLIRNR. El art. 25 solo aparece en la línea 96 y en Fuentes. |
| 86 | 700.000 € | sí | art. 29 DL 1/2009; art. 28 Ley 19/1991 | correcta | Varias guías de 2026 dan 700.000 € y sin bonificación general en Canarias, y una sitúa el mínimo en los arts. 29 y 30.2. No he leído el texto del art. 29. El a… |
| 87 | 1.320 € / 250,80 € | **NO** | — | correcta | Cálculo correcto (120.000 × 1,1 % × 19 %). Sin cita en el ejemplo. |
| 90 | reducción 50 % | **NO** | — | dudosa | Sin cita (art. 23.2 LIRPF, tras la Ley 12/2023). Es correcto para los contratos actuales, pero el RDL 29/2026 (en vigor desde el 8-10-2026 y pendiente de conva… |
| 90 | IRNR 19 % neto / 24 % bruto | **NO** | — | dudosa | Las cifras son correctas (arts. 24.6 y 25.1.a TRLIRNR), pero la redacción está invertida: leída al pie de la letra, 'si no eres residente de la UE' te da el 19… |
| 92 | 13-12-2025 | sí | Ley 6/2025 (Canarias) | correcta | Canarias7 confirma la entrada en vigor el 13-12-2025 (BOC 12-12-2025). |
| 92 | 90 % | sí | art. 4 Ley 6/2025 | no verificada | Las guías comerciales coinciden en la regla 90/10, pero no he podido confirmar el texto ni el número de artículo en el BOC. |
| 92 | 10 años | sí | art. 5 Ley 6/2025 | no verificada | Una guía secundaria dice 10 años desde la construcción y 5 en las islas verdes y en municipios con reto demográfico; el texto no menciona esa excepción. No he … |
| 92 | 5 años | sí | art. 10 Ley 6/2025 | no verificada | Las fuentes secundarias hablan de una vigencia de 5 años prorrogable. No he confirmado el número de artículo. |
| 92 | DT 1.ª apdo. 11 | sí | Ley 6/2025, DT 1.ª.11 | dudosa | La Ley 7/2026, de 31 de julio (BOC 14-8-2026, en vigor desde el 15-8-2026), modificó el apartado 11 de la DT 1.ª, según una guía jurídica sobre la Ley 6/2025 t… |
| 92 | 3-4-2025; 3/5 | sí | art. 17.12 LPH; LO 1/2025 | correcta | Matiz: el requisito de aprobación previa está en el nuevo art. 7.3 LPH; la mayoría de 3/5 está en el 17.12. |
| 92 | mayo 2026; STS 620/2026 | sí | STS 620/2026 | correcta | La STS 620/2026, de 19-5-2026, anula el registro único del RD 1312/2024 y mantiene la ventanilla única digital (nota de prensa del CGPJ y Andersen). |
| 96 | 19 %-30 % | **NO** | — | correcta | Sin cita (arts. 66 y 76 LIRPF). El tramo del 30 % por encima de 300.000 € existe desde 2025 (Ley 7/2024). |
| 96 | 65 años | **NO** | — | correcta | Sin cita: son los arts. 33.4.b y 38.1 LIRPF. |
| 96 | 19 %; retención 3 % | sí | art. 25 y 25.2 TRLIRNR | correcta | No menciona el plazo del modelo 211 (un mes desde la transmisión). La responsabilidad del comprador como sustituto en la plusvalía (art. 106.2.b TRLRHL) tampoc… |
| 98 | 60-70 % | **NO** | — | no verificada | Dato de mercado, no normativo. |
| 100 | 4 meses; código 1106 | **NO** | — | correcta | El SPF Finances confirma el código 1106 del cuadro III y la exención con reserva de progresividad. El plazo de 4 meses sale de un comunicado de 2021 y no cita … |
| 122 | 6,5 % / 7 % / 1 % | **NO** | — | correcta | FAQ visible (duplica el JSON-LD) sin citas. El AJD solo como 1 %. |
| 123 | 7 % / 3 % / 0 % / 1 % | **NO** | — | correcta | FAQ visible sin citas. El 0 % no está verificado. |
| 125 | 1,1 % / 2 % / 19 % / 24 % | **NO** | — | correcta | FAQ visible sin citas; omite el EEE. |
| 126 | 3/5 | **NO** | Ley 6/2025 DT 1.ª.11 | correcta | Los 3/5 van sin cita del art. 17.12 LPH. Hay que revisar la DT 1.ª.11 tras la Ley 7/2026. |
| 127 | 3 % | **NO** | — | correcta | FAQ visible sin cita del art. 25.2 TRLIRNR. |
| 128 | 4 meses | **NO** | — | correcta | FAQ visible; plazo belga sin norma citada. |

### `post-comprar-vivienda-tenerife-desde-la-ue.html` (24 cifras, 19 sin norma junto a la cifra)

| Línea | Cifra | ¿Cita norma? | Norma citada | Estado | Nota |
|---|---|---|---|---|---|
| 51 | 114.000–144.000 € de ahorro propio | **NO** | — | dudosa | La suma (90.000/120.000 € + 24.000 €) está bien, pero arrastra el ≈8 % de gastos de la línea 96, que no encaja con la línea 104. Se repite en las líneas 97, 30… |
| 51 | Préstamo de 180.000–210.000 € sobre 300.000 € | **NO** | — | correcta | Es la aritmética del 60–70 % sobre 300.000 €. Se repite en las líneas 94, 30 y 135. La premisa del 60–70 % no está verificada. |
| 65 | Convenio de La Haya de 1961 (apostilla) | sí | Convenio de La Haya de 5-10-1961 | correcta | Es la convención de 5 de octubre de 1961. También es correcto que en Bélgica emite la apostilla el SPF Asuntos Exteriores y en Países Bajos los tribunales. |
| 71 | NIE en 2 a 4 semanas | **NO** | — | no verificada | Es un plazo administrativo práctico, no legal. Se repite en las líneas 58, 30 y 132. |
| 72 | Plazos orientativos de la tabla (1–3 y 3–5 semanas) | **NO** | — | no verificada | La línea 80 los declara «según la experiencia de la casa». No son cifras legales. |
| 73 | Arras ≈ 10 % del precio | **NO** | — | correcta | Describe el uso habitual del mercado; ninguna norma fija la cuantía y el Código Civil no la establece. Se repite en la línea 82 («normalmente el 10 % del preci… |
| 77 | Liquidación de impuestos en 1 mes | **NO** | — | correcta | Según la sede electrónica del Gobierno de Canarias (trámite 4026, modelo 600), el plazo de la autoliquidación de ITP-AJD es de un mes desde el acto o contrato.… |
| 82 | Devolución de las arras duplicadas | sí | art. 1454 Código Civil | correcta | El art. 1454 CC dice literalmente: «allanándose el comprador a perderlas, o el vendedor a devolverlas duplicadas». El texto lo limita bien a las arras penitenc… |
| 83 | 45 días o más entre arras y escritura con hipoteca | **NO** | — | no verificada | Es un plazo práctico recomendado, no legal. Se repite en las líneas 51, 76 y 102, y en el FAQ (líneas 30 y 136). |
| 86 | Certificado de deudas de la comunidad en 7 días | sí | art. 9.1.e Ley de Propiedad Horizontal | correcta | El art. 9.1.e LPH dice «plazo máximo de siete días naturales desde su solicitud». También es correcto que el notario no puede autorizar la escritura sin el cer… |
| 88 | Un mes desde la firma | **NO** | — | correcta | Igual que en la línea 77: el modelo 600 en Canarias tiene un mes desde el devengo (sede del Gobierno de Canarias). No cita norma. |
| 90 | Financiación a no residentes del 60–70 % | **NO** | — | no verificada | Es práctica bancaria, no una norma, y es plausible. Ninguna ley fija un LTV máximo para no residentes. Se repite en las líneas 30 (JSON-LD) y 135 (FAQ). |
| 96 | ≈ 8 % / 24.000 € de gastos | **NO** | — | dudosa | No encaja con la línea 104 del mismo post: segunda mano 20.800–22.100 € (≈7 %) y obra nueva 25.300–26.600 € (≈8,4–8,9 %). Para obra nueva se queda corto en 1.3… |
| 104 | ITP 6,5 % | **NO** | — | correcta | Es el tipo general de TPO en Canarias para inmuebles, y las fuentes secundarias consultadas (guiafiscal.es, taxdown.es, infoitp.es) coinciden. Este post no cit… |
| 104 | 20.800–22.100 € de gastos en segunda mano sobre 300.000 € | **NO** | — | correcta | Las cuentas cuadran: 19.500 € de ITP más 1.300–2.600 € de notaría, registro y gestoría, igual que en post-impuestos-comprar-vivienda-canarias.html (línea 65). … |
| 104 | IGIC 7 % | **NO** | — | correcta | Es el tipo general del IGIC para la entrega de vivienda nueva. No cita artículo; el post enlazado cita el art. 32 del DL 1/2025. Omite que hay tipos reducidos … |
| 104 | AJD 1 % | **NO** | — | correcta | Encaja con el criterio (1 % en operaciones sujetas a IGIC). Pero no cita el art. 36 del DL 1/2009 y no menciona el 0,75 % general. Las fuentes secundarias no s… |
| 104 | 25.300–26.600 € de gastos en obra nueva sobre 300.000 € | **NO** | — | correcta | Las cuentas cuadran: 21.000 € de IGIC, 3.000 € de AJD y 1.300–2.600 € de gastos. Coincide con el post fiscal (línea 80). Aquí no cita norma. |
| 106 | DT 1.ª, apartado 11, de la Ley 6/2025 | sí | Ley 6/2025 de Canarias, DT 1.ª ap. 11 | correcta | Coincide con el criterio del usuario. La Ley 6/2025 se publicó en el BOC el 12-12-2025 y está en vigor desde el 13-12-2025. No he podido leer el texto literal … |
| 106 | Mayoría de 3/5 de la comunidad desde abril de 2025 | sí | art. 17.12 LPH | correcta | La LO 1/2025 entró en vigor el 3-4-2025. Se exigen 3/5 del total de propietarios y también de cuotas; el texto lo simplifica. No menciona la LO 1/2025 como nor… |
| 108 | Modelo 210 anual | **NO** | — | correcta | Para la renta imputada es correcto: se declara una vez al año, en el año natural siguiente al devengo del 31-12. Para el alquiler, las fuentes no coinciden: ré… |
| 108 | 4 meses para declarar el inmueble en Bélgica | **NO** | — | correcta | Los comunicados del SPF Finances (news.belgium.be) lo confirman para bienes adquiridos desde el 1-1-2021, con multa de 250 a 3.000 € si no se declara. No cita … |
| 136 | 45 días (FAQ visible, también en el JSON-LD de la línea 30) | **NO** | art. 1454 Código Civil | dudosa | El art. 1454 CC no fija ningún plazo; solo regula el efecto del desistimiento con arras. Además, el FAQ omite el matiz del cuerpo («Si son arras penitenciales»… |
| 138 | 3/5 de la comunidad (FAQ visible, también en el JSON-LD de … | **NO** | Ley 6/2025 de Canarias (no LPH) | correcta | La cifra es correcta, pero en el FAQ queda pegada a la Ley 6/2025, cuando su norma es el art. 17.12 LPH, que aquí no se cita. Puede inducir a error. |

### `post-segunda-residencia-costa-adeje.html` (41 cifras, 30 sin norma junto a la cifra)

| Línea | Cifra | ¿Cita norma? | Norma citada | Estado | Nota |
|---|---|---|---|---|---|
| 35 | 1.700 a 2.900 € | **NO** | — | correcta | FAQ en el JSON-LD; es la misma cifra que la línea 153. |
| 109 | 3-abr-2025; tres quintos | sí | art. 17.12 LPH | correcta | Es la redacción de la LO 1/2025, en vigor desde el 3-abr-2025, que el post no menciona como norma modificadora. «No tendrán efectos retroactivos» está en el pr… |
| 117 | 6,5 % | sí | art. 31 DL 1/2009 | correcta | Es el tipo general de ITP para inmuebles en Canarias (art. 31 DL 1/2009, el mismo que cita el post hermano). La base, el mayor entre precio y valor de referenc… |
| 117 | 25.675 € | sí | art. 31 DL 1/2009 | correcta | 395.000 × 6,5 % = 25.675 €. El cálculo es correcto. |
| 118 | 600 a 1.200 € | **NO** | — | no verificada | Es un honorario sujeto a arancel (RD 1426/1989, que el post no cita) y el texto lo presenta como rango de mercado. No es una cifra fiscal. |
| 119 | 400 a 800 € | **NO** | — | no verificada | Arancel registral (RD 1427/1989, no citado), presentado como rango de mercado. |
| 120 | 300 a 600 € | **NO** | — | no verificada | Es un honorario libre y no necesita norma. |
| 121 | ≈ 6,8 % a 7,2 % / ≈ 27.000 a 28.300 € | **NO** | — | correcta | Cálculo comprobado: 25.675 + 1.300 = 26.975 € (6,83 %) y 25.675 + 2.600 = 28.275 € (7,16 %). |
| 122 | 7 % de IGIC | **NO** | — | correcta | El 7 % es el tipo general del IGIC, que se aplica a los servicios profesionales. No cita norma; el post hermano lo atribuye al art. 32 del DL 1/2025 (texto ref… |
| 122 | ≈ 1 % (honorarios de abogado) | **NO** | — | no verificada | Es una práctica de mercado, no una norma. No es una cifra fiscal. |
| 123 | ≈ 7,9 % a 8,2 % / ≈ 31.200 a 32.500 € | **NO** | — | correcta | Cálculo comprobado: 26.975 + 4.227 = 31.202 € (7,90 %) y 28.275 + 4.227 = 32.502 € (8,23 %). El resumen de la línea 58 («entre 27.000 y 32.500 €») es coherente. |
| 124 | 300 a 600 € | **NO** | — | no verificada | Honorario de mercado. |
| 125 | 0 € de AJD del préstamo para el comprador | sí | art. 29 TRLITPAJD; RDL 17/2018 | correcta | La cita literal del art. 29 TRLITPAJD es correcta (párrafo añadido por el RDL 17/2018). Falta el tipo: en Canarias es el 0,75 % (art. 36 DL 1/2009), a cargo de… |
| 129 | sin IGIC ni AJD en segunda mano | **NO** | — | correcta | Es correcto en general: la TPO y la cuota gradual de AJD son incompatibles (art. 31.2 TRLITPAJD, no citado). Matiz: si el vendedor es empresario y renuncia a l… |
| 133 | 60 % o 70 % | **NO** | — | no verificada | Es práctica bancaria, no norma. El cálculo es correcto: 237.000–276.500 € de préstamo y 150.100–189.600 € propios con un 8 % de gastos. |
| 133 | 8 % de gastos | **NO** | — | correcta | Es coherente con el 7,9–8,2 % de la tabla A. |
| 134 | 10 % del precio | **NO** | — | no verificada | Es una costumbre; el Código Civil no fija la cuantía. El art. 1454 CC se cita para las consecuencias, no para el 10 %. |
| 134 | 45 días o más | **NO** | — | no verificada | Es una práctica, no un plazo legal. El plazo legal relacionado es la entrega de la FEIN con al menos 10 días naturales de antelación (art. 14.1 Ley 5/2019), qu… |
| 135 | siete días | sí | art. 9.1.e LPH | correcta | El art. 9.1.e LPH dice «plazo máximo de siete días naturales desde su solicitud». Conviene precisar «naturales». El comprador puede exonerar al vendedor de apo… |
| 138 | treinta días hábiles | sí | art. 102 RD 828/1995 | incorrecta | Es la regla estatal, pero en Canarias se aplica la autonómica: «un mes a contar desde el momento en que se cause el acto o contrato». Fuentes: Sede electrónica… |
| 140 | modelo 210 al año siguiente; Bélgica: cuatro meses | **NO** | — | correcta | La renta imputada se declara en el año natural siguiente al devengo. Bélgica obliga a declarar los inmuebles en el extranjero adquiridos desde el 1-ene-2021 en… |
| 149 | 1,1 % | **NO** | — | correcta | Renta imputada (art. 24.5 TRLIRNR, que remite al art. 85 LIRPF), no citada. Adeje tiene una ponencia de valores nueva en vigor desde el 1-ene-2025 (impuestalia… |
| 149 | 2 % / diez años | **NO** | — | correcta | El 2 % se aplica si la revisión colectiva no entró en vigor en el periodo o en los diez anteriores (AEAT, cálculo de la renta imputada). Sin cita de norma. |
| 149 | 19 % (IRNR) | **NO** | — | correcta | Es el tipo para residentes en la UE o el EEE con intercambio de información (art. 25.1.a TRLIRNR, no citado). Encaja con compradores belgas, neerlandeses y ale… |
| 149 | 250,80 € | **NO** | — | correcta | 120.000 × 1,1 % = 1.320 € y 1.320 × 19 % = 250,80 €. |
| 153 | ≈ 1.700 a 2.900 € | **NO** | — | correcta | La suma exacta con el 1,1 % es 1.732,80–2.832,80 €; el máximo está redondeado al alza (2.900 en vez de 2.800). Es una estimación con «≈». Se repite en las líne… |
| 157 | 456 € | **NO** | — | correcta | 120.000 × 2 % × 19 % = 456 €. |
| 160 | 19 % sobre el neto | **NO** | — | correcta | Arts. 25.1.a y 24.6 TRLIRNR (deducción de gastos para residentes en la UE o el EEE), no citados. Conviene decir «UE/EEE». |
| 160 | 8 de octubre de 2026 | sí | RDL 29/2026 | correcta | Según fuentes secundarias (AEAT, noticia del 7-oct-2026; vLex; Iberley) es el RDL 29/2026 de 6 de octubre, publicado en el BOE el 7-oct-2026 (BOE-A-2026-20823)… |
| 160 | más de 31 días | sí | arts. 2.3 y 9 bis LAU (RDL 29/2026) | correcta | Lo confirman resúmenes de despachos y prensa (más de 31 días; 12 meses salvo que la causa persista). No contrastado con el texto del BOE. |
| 160 | doce meses | sí | arts. 2.3 y 9 bis LAU (RDL 29/2026) | correcta | Lo confirman fuentes secundarias. No contrastado con el BOE. |
| 160 | diez años | sí | art. 5.1.a Ley 6/2025 de Canarias | correcta | Las fuentes coinciden: 10 años, y 5 en El Hierro, La Gomera, La Palma o municipios de reto demográfico. Adeje está en el caso de 10 años. No he podido leer la … |
| 160 | tres quintos | sí | art. 17.12 LPH | correcta | Arts. 7.3 y 17.12 LPH, en la redacción de la LO 1/2025. |
| 164 | 9,84 € | **NO** | modelo 790 código 012 (formulario, no norma) | correcta | Las hojas informativas de los consulados de Stuttgart y Fráncfort (exteriores.gob.es) dan 9,84 € por la asignación de NIE. No he comprobado la cifra concreta d… |
| 164 | unas dos semanas | **NO** | — | no verificada | Es un dato administrativo del consulado de Bruselas, no una norma. No lo he podido comprobar. |
| 165 | 25 € | **NO** | — | correcta | El SPF Affaires étrangères (diplomatie.belgium.be) anuncia que pasa de 20 a 25 € desde el 1-ago-2026. Algunas páginas del mismo sitio siguen diciendo 20 €. |
| 166 | cuatro meses; código 1106 | **NO** | — | correcta | Lo confirman el SPF Finances (fin.belgium.be) y Wikifin: cuatro meses para compras desde 2021 y código 1106 del cuadro III para una segunda residencia no alqui… |
| 168 | inferior a tres meses | **NO** | — | no verificada | Es un criterio del consulado de Ámsterdam; se repite en la línea 195 y en el JSON-LD (línea 35). No lo he podido comprobar. |
| 170 | 1 de enero (box 3) | **NO** | art. 25 Convenio España-Países Bajos 1971 (para e… | correcta | La fecha de referencia del box 3 es el 1 de enero (peildatum). La ley neerlandesa no se cita; el convenio se cita para el mecanismo, no para la fecha. |
| 172 | 9,84 €; cuatro meses | **NO** | — | no verificada | Los 9,84 € los confirma la hoja informativa del consulado de Fráncfort. No he podido comprobar los cuatro meses ni el horario. |
| 200 | desde octubre de 2026 | **NO** | — | correcta | Se repite en el JSON-LD (línea 35). No nombra el RDL 29/2026 ni avisa de que está pendiente de convalidación, cuando el cuerpo del post sí lo hace. |

### `tweede-verblijf-costa-adeje-nl.html` (31 cifras, 19 sin norma junto a la cifra)

| Línea | Cifra | ¿Cita norma? | Norma citada | Estado | Nota |
|---|---|---|---|---|---|
| 123 | 3/5 de propietarios y cuotas desde el 3-4-2025 | sí | art. 17.12 LPH | correcta | La LO 1/2025 entró en vigor el 3-4-2025. El art. 17.12 exige 3/5 de propietarios que a su vez representen 3/5 de las cuotas, y sus acuerdos no tienen efectos r… |
| 137 | ITP 6,5 % | sí | art. 31 DL 1/2009 | correcta | Tipo general del ITP en Canarias para inmuebles: 6,5 %. Las fuentes secundarias (guiafiscal, taxdown) lo confirman; no he podido leer el BOC/BOE porque el prox… |
| 137 | 25.675 € (ITP del ejemplo) | sí | art. 31 DL 1/2009 | correcta | 395.000 × 6,5 % = 25.675 €. Coincide con ES. |
| 138 | Notaría 600-1.200 €, Registro 400-800 €, gestoría 300-600 € | **NO** | — | no verificada | Habla de 'wettelijk tarief' (arancel) pero no cita la norma (aranceles notarial y registral de 1989). Son rangos de mercado, no verificables con una norma. Coi… |
| 141 | 6,8-7,2 % / 27.000-28.300 € | **NO** | — | correcta | La aritmética cuadra: de 26.975 a 28.275 €, es decir, del 6,83 % al 7,16 %. Coincide con ES. |
| 142 | IGIC 7 % sobre honorarios de abogado (1 %) | **NO** | — | correcta | El tipo general del IGIC es el 7 % (art. 32 del DL 1/2025 de Canarias, según el post hermano de impuestos; las fuentes secundarias lo confirman). El NL no cita… |
| 143 | 7,9-8,2 % / 31.200-32.500 € | **NO** | — | correcta | Aritmética correcta: de 31.202 a 32.502 €. Coincide con ES. |
| 145 | AJD del préstamo hipotecario: 0 € para el comprador | sí | art. 29 TRLITPAJD; RDL 17/2018 | correcta | Desde el RDL 17/2018, el sujeto pasivo del AJD en escrituras de préstamo hipotecario es el prestamista. La cita traduce bien el original ES. No da el tipo del … |
| 149 | Obra nueva: sin IGIC ni AJD | **NO** | — | incorrecta | ERROR DE TRADUCCIÓN QUE INVIERTE EL SENTIDO. El ES (l.129) dice 'Sin obra nueva, no hay IGIC ni AJD en la compraventa', es decir: como es de segunda mano, no h… |
| 153 | Financiación 60-70 %; gastos 8 % | **NO** | — | no verificada | Es práctica bancaria, no norma. La aritmética cuadra: 60 % y 70 % de 395.000; fondos propios de unos 150.100 a 189.600 €. Coincide con ES. |
| 154 | Arras 10 % | sí | art. 1454 Código Civil | no verificada | El art. 1454 CC regula bien los efectos de las arras penitenciales (el comprador pierde la señal y el vendedor la devuelve duplicada). El 10 % es costumbre de … |
| 154 | 45 días hasta escritura | **NO** | — | no verificada | Es práctica, no plazo legal. Coincide con ES. |
| 155 | 7 días para el certificado de deudas de la comunidad | sí | art. 9.1.e LPH | correcta | El art. 9.1.e LPH fija un plazo máximo de siete días naturales. El NL dice 'zeven dagen' (el ES tampoco precisa 'naturales'). Coincide con ES. |
| 158 | 30 días hábiles para autoliquidar el ITP | sí | art. 102 RD 828/1995 | dudosa | La cita del reglamento estatal es literal, pero no es el plazo que aplica en Canarias. La sede electrónica del Gobierno de Canarias (trámite 4026, modelo 600) … |
| 160 | Bélgica: 4 meses | **NO** | — | correcta | Según el SPF Finances, un inmueble en el extranjero adquirido desde el 1-1-2021 se declara en los cuatro meses siguientes a la compra. No cita norma belga. Coi… |
| 169 | IRNR renta imputada 1,1 % / 2 % × 19 % | **NO** | — | correcta | Según la AEAT: 1,1 % si el valor catastral se revisó y entró en vigor en el periodo o en los diez anteriores, 2 % en otro caso; tipo del 19 % para residentes e… |
| 169 | 250,80 € | **NO** | — | correcta | 120.000 × 1,1 % = 1.320; × 19 % = 250,80 €. Coincide con ES. |
| 173 | 1.700-2.900 €/año sin IBI | **NO** | — | correcta | La suma va de 1.732,80 a 2.832,80 €. Son estimaciones. Se repite en l.60, l.257 y en el JSON-LD (l.34). Coincide con ES. |
| 177 | 456 € | **NO** | — | correcta | 120.000 × 2 % × 19 % = 456 €. Coincide con ES. |
| 183 | IRNR alquiler 19 % sobre neto (residente UE) | **NO** | — | correcta | El tipo es correcto: art. 25.1.a TRLIRNR, con deducción de gastos para residentes UE/EEE por el art. 24.6. No cita norma. Matiz: aplica también al EEE con inte… |
| 184 | Vigencia desde el 8-10-2026 | sí | RDL 29/2026; art. 2.3 y 9 bis LAU | correcta | Según fuentes secundarias (Iberley, derecholocal, merca2, apivirtual), el RDL 29/2026, de 6 de octubre, salió en el BOE 249/2026 del 7-10-2026 y está vigente d… |
| 184 | > 31 días y ≤ 12 meses | sí | art. 2.3 y art. 9 bis LAU (RDL 29/2026) | correcta | Las fuentes secundarias coinciden: más de 31 días y, como regla, no más de 12 meses, con causa real y acreditable y la carga de la prueba en el arrendador. No … |
| 185 | Antigüedad mínima de 10 años (VV) | sí | Ley 6/2025 de Canarias, art. 5.1.a | correcta | Un extracto del art. 5 de la Ley 6/2025, de 10 de diciembre (noticias.juridicas), confirma la antigüedad mínima de diez años; son cinco en El Hierro, La Gomera… |
| 185 | 3/5 de la comunidad | sí | art. 17.12 LPH | correcta | Matiz: son 3/5 de propietarios que representen 3/5 de cuotas, no '3/5 de los votos'. La l.123 lo dice bien. La aprobación previa expresa viene del art. 7.3 LPH… |
| 198 | Tasa NIE 9,84 € | **NO** | modelo 790 código 012 | correcta | La página oficial one.gob.es da 9,84 € para la 'Asignación de NIE a instancia del interesado'. Una guía privada habla de unos 12 € en 2026, pero no se ha confi… |
| 198 | NIE en Bruselas: unas 2 semanas | **NO** | — | no verificada | Es un dato del consulado, no una norma, y no he podido comprobarlo. Coincide con ES. |
| 199 | Apostilla belga 25 € | **NO** | — | correcta | La FOD Buitenlandse Zaken anuncia que desde el 1-8-2026 la apostilla o legalización pasa de 20 a 25 €. Coincide con ES. |
| 200 | 4 meses; código 1106 | **NO** | — | correcta | El plazo de 4 meses (compras desde 2021) y el código 1106 (vak III.A.2, renta catastral de un inmueble en el extranjero) los confirma la información del SPF Fi… |
| 203 | Estancia < 3 meses | **NO** | — | no verificada | Es criterio consular. Es coherente con el umbral de 3 meses para registrarse como ciudadano UE, pero no lo he verificado. Coincide con ES. |
| 205 | Box 3 a 1 de enero | sí | art. 25 Convenio ES-NL 1971 (para el método, no p… | correcta | La fecha de referencia del box 3 es el 1 de enero. El art. 25 del convenio de 1971 se cita para el método de deducción proporcional. Coincide con ES. |
| 258 | Desde octubre de 2026 | **NO** | — | correcta | La FAQ visible y la del JSON-LD (l.34) no citan el RDL 29/2026, aunque el cuerpo (l.184) sí. Coincide con ES. |

### `residence-secondaire-costa-adeje-fr.html` (26 cifras, 18 sin norma junto a la cifra)

| Línea | Cifra | ¿Cita norma? | Norma citada | Estado | Nota |
|---|---|---|---|---|---|
| 123 | 3/5 de propietarios y cuotas desde el 3-4-2025 | sí | art. 17.12 LPH | correcta | La LO 1/2025 reformó los arts. 7.3 y 17.12 LPH con entrada en vigor el 3-4-2025, y los acuerdos no son retroactivos. No cita la LO 1/2025 como norma modificado… |
| 137 | ITP 6,5 % (25 675 €) | sí | art. 31 DL 1/2009 | correcta | Igual que el ES (l.117). Tipo general del ITP en Canarias del 6,5 % en el art. 31.1.a DL 1/2009 según fuentes secundarias (guiafiscal.es, ITP-AJD Canarias 2026… |
| 138 | Notaría 600-1.200 €, Registro 400-800 €, gestoría 300-600 € | **NO** | «barème légal» sin norma | no verificada | Son rangos de mercado. Dice «barème légal» pero no cita los aranceles (RD 1426/1989 notarial y RD 1427/1989 registral). Coincide con el ES (l.118-120). |
| 141 | 6,8 %-7,2 % / 27.000-28.300 € | **NO** | — | correcta | Cifra derivada: 25.675 + 1.300 = 26.975 (6,83 %) y 25.675 + 2.600 = 28.275 (7,16 %). La aritmética cuadra. Coincide con el ES (l.121). Mismo rango en el resume… |
| 142 | IGIC 7 % sobre honorarios del 1 % (4.227 €) | **NO** | — | correcta | El 7 % es el tipo general del IGIC (Ley 4/2012 de Canarias), pero el texto no cita ninguna norma. 3.950 × 1,07 = 4.226,5 €. Coincide con el ES (l.122). |
| 143 | 7,9 %-8,2 % / 31.200-32.500 € | **NO** | — | correcta | Derivada: 26.975 + 4.227 = 31.202 y 28.275 + 4.227 = 32.502. Correcto. Coincide con el ES (l.123). |
| 145 | AJD del préstamo hipotecario: 0 € para el comprador | sí | art. 29 TRLITPAJD; RDL 17/2018 | correcta | El RDL 17/2018 añadió al art. 29 TRLITPAJD que el sujeto pasivo en las escrituras de préstamo hipotecario es el prestamista. Traducción fiel del ES (l.125). |
| 149 | Obra nueva: «sin IGIC ni AJD» | **NO** | — | incorrecta | ERROR DE TRADUCCIÓN QUE INVIERTE EL SENTIDO. El ES (l.129) dice «Sin obra nueva, no hay IGIC ni AJD en la compraventa», es decir, en segunda mano. El FR afirma… |
| 153 | Financiación del 60-70 %; gastos del 8 % | **NO** | — | no verificada | Es práctica bancaria, no norma. La aritmética cuadra: 395.000 × 0,6/0,7 = 237.000/276.500, y 118.500 o 158.000 + 31.600 dan unos 150.100 y 189.600. Coincide co… |
| 154 | Arras del 10 % | sí | art. 1454 CC (para el efecto de las arras, no par… | correcta | El 10 % es práctica de mercado. El art. 1454 CC describe bien el efecto de las arras penitenciales, pero solo se aplica si se pactan expresamente como penitenc… |
| 154 | 45 días o más hasta la escritura | **NO** | — | no verificada | Plazo práctico, no legal. Coincide con el ES (l.134). |
| 155 | 7 días para el certificado de deudas | sí | art. 9.1.e LPH | correcta | El art. 9.1.e LPH fija un máximo de siete días naturales. Ni el FR ni el ES (l.135) dicen «naturels/naturales». |
| 158 | 30 días hábiles para autoliquidar el ITP | sí | art. 102 RD 828/1995 | incorrecta | Para Canarias el plazo es otro. La sede del Gobierno de Canarias (trámite 4026, modelo 600) dice: «El plazo para la presentación de las autoliquidaciones relat… |
| 160 | Modelo 210 al año siguiente; Bélgica: 4 meses | **NO** | — | correcta | La renta imputada se declara en el modelo 210 durante el año natural siguiente al devengo. Bélgica: las adquisiciones posteriores al 1-1-2021 se declaran en lo… |
| 169 | Imputación de rentas: 1,1 % / 2 % del valor catastral | **NO** | — | dudosa | Correcto para 2026: art. 24.5 TRLIRNR, que remite al art. 85 LIRPF. Pero no cita norma. Además, el RDL 29/2026 (BOE 7-10-2026) sustituye desde el 1-1-2027 los … |
| 169 | IRNR al 19 % (250,80 €) | **NO** | — | correcta | El 19 % es el tipo para residentes en la UE/EEE (art. 25.1.a TRLIRNR), pero el texto no lo cita. 120.000 × 1,1 % × 19 % = 250,80 €. Coincide con el ES. |
| 173 | Coste anual de 1.700-2.900 € (también en la l.255 y en el F… | **NO** | — | correcta | Con el supuesto del 1,1 % suma entre 1.732,80 y 2.832,80 €. Con el 2 % el máximo sería unos 3.038 €, por encima del rango anunciado. Desde 2027 puede variar po… |
| 177 | 456 € (variante al 2 %) | **NO** | — | correcta | 120.000 × 2 % × 19 % = 456 €. Coincide con el ES (l.157). |
| 183 | IRNR al 19 % sobre el neto del alquiler | **NO** | — | correcta | Tipo del 19 % y deducción de gastos para residentes UE/EEE: arts. 24.6 y 25.1.a TRLIRNR. No cita norma y omite el EEE. Coincide con el ES (l.160). |
| 184 | Desde el 8-10-2026; más de 31 días; máximo 12 meses | sí | RDL 29/2026; arts. 2.3 y 9 bis LAU | no verificada | Iberley confirma que el RDL 29/2026, de 6 de octubre, se publicó en el BOE núm. 249 de 7-10-2026 y entró en vigor el 8-10-2026. Ojo: el brief del usuario dice … |
| 185 | Antigüedad mínima de 10 años para la VV; 3/5 de la comunidad | sí | Ley canaria 6/2025, art. 5.1.a; art. 17.12 LPH | correcta | Derecholocal confirma 10 años de antigüedad (5 en islas verdes y municipios en reto demográfico; Tenerife no entra en esa excepción). No he podido verificar el… |
| 198 | Tasa del NIE de 9,84 €; unas 2 semanas | **NO** | modelo 790 código 012 (formulario, no norma) | dudosa | 9,84 € era el importe de años anteriores. Alguna guía de 2026 habla de unos 12 €, sin confirmación oficial. No he podido verificar el importe vigente ni el pla… |
| 199 | Apostilla belga a 25 € | **NO** | — | correcta | El SPF Affaires étrangères anuncia que desde el 1-8-2026 la tarifa pasa de 20 a 25 € por legalización o apostille (diplomatie.belgium.be), aunque la misma web … |
| 200 | 4 meses; código 1106 | **NO** | convenio Bélgica-España (sin artículo) | no verificada | Los 4 meses son correctos (ver l.160). No he verificado el código 1106. La exención con progresividad corresponde al art. 23 del Convenio Bélgica-España, que e… |
| 203 | Estancia de menos de 3 meses (NIE consular) | **NO** | — | no verificada | Es un requisito consular, no fiscal. El FR omite la aclaración del ES (l.168): si va a residir más tiempo, el NIE lo asigna la Oficina de Extranjería en España… |
| 256 | Desde octubre de 2026 (FAQ visible y JSON-LD, l.34) | **NO** | — | correcta | La fecha es correcta (en vigor el 8-10-2026), pero el FAQ no cita el RDL 29/2026 ni avisa de que está pendiente de convalidación. Este FAQ se publica como rich… |

### `zweitwohnsitz-costa-adeje-de.html` (27 cifras, 17 sin norma junto a la cifra)

| Línea | Cifra | ¿Cita norma? | Norma citada | Estado | Nota |
|---|---|---|---|---|---|
| 34 | seit Oktober 2026 (alquiler temporal con causa) | **NO** | — | correcta | FAQ del JSON-LD (se repite visible en L256). Fiel al original ES (L35/L200), pero ni la FAQ ES ni la DE citan el RDL 29/2026 ni el art. 9 bis LAU. Sí lo cita e… |
| 34 | menos de 3 meses (NIE en el consulado de Ámsterdam) | **NO** | — | no verificada | Es un criterio administrativo del consulado, no una cifra fiscal. Coincide con el ES (L35, L168) y se repite en L201 y L251. La fuente es la web del consulado … |
| 60 | 27.000-32.500 € (compra); 1.700-2.900 €/año (mantenimiento) | **NO** | — | correcta | Resumen de las tablas A y B. La aritmética cuadra con ellas. Es un agregado de ITP y honorarios de mercado, por eso no cita norma. Coincide con el ES (L58). |
| 61 | Box 3, 'anteilige Anrechnung' | **NO** | — | dudosa | Cambia el matiz legal respecto al ES (L58: 'box 3 con deducción proporcional'). En la terminología fiscal alemana, 'Anrechnung' es el método de imputación (cré… |
| 123 | 3/5 de propietarios y cuotas; desde 3-abr-2025 | sí | art. 17.12 LPH | correcta | Coincide con el ES (L109). Un matiz: la mayoría de 3/5 para limitar o prohibir existe desde el RDL 7/2019. Lo nuevo desde el 3-abr-2025 (LO 1/2025) es la aprob… |
| 137 | ITP 6,5 % = 25.675 € | sí | art. 31 DL 1/2009 (Canarias) | correcta | El tipo general del ITP en Canarias es el 6,5 % (art. 31 DL 1/2009, que también cita el post fiscal del PR). 395.000 × 6,5 % = 25.675 €. Coincide con el ES (L1… |
| 141 | 6,8-7,2 %; 27.000-28.300 € | **NO** | — | correcta | 25.675 + 1.300 = 26.975 € y 25.675 + 2.600 = 28.275 €, es decir, un 6,83 % y un 7,16 %. Notaría (L138), Registro (L139) y gestoría (L140) se presentan como ran… |
| 142 | IGIC 7 % sobre honorarios del 1 % | **NO** | — | correcta | El 7 % es el tipo general del IGIC, pero el post no cita norma. 3.950 × 1,07 = 4.226,50 €. Coincide con el ES (L122). |
| 143 | 7,9-8,2 %; 31.200-32.500 € | **NO** | — | correcta | 26.975 + 4.227 = 31.202 € y 28.275 + 4.227 = 32.502 €, es decir, un 7,90 % y un 8,23 %. Coincide con el ES. |
| 145 | AJD del préstamo hipotecario: 0 € para el comprador | sí | art. 29 TRLITPAJD; RDL 17/2018 | correcta | El RDL 17/2018 añadió al art. 29 TRLITPAJD que en las escrituras de préstamo con garantía hipotecaria el sujeto pasivo es el prestamista. Coincide con el ES (L… |
| 149 | obra nueva: 'sin IGIC ni AJD' | **NO** | — | incorrecta | ERROR DE TRADUCCIÓN QUE INVIERTE EL SENTIDO. El ES (L129) dice 'Sin obra nueva, no hay IGIC ni AJD en la compraventa', es decir, en segunda mano no hay IGIC ni… |
| 153 | LTV 60-70 %; gastos 8 % | **NO** | — | no verificada | Es práctica bancaria, no una norma. La aritmética es coherente: 237.000 € es el 60 % y 276.500 € el 70 % de 395.000 €; con el 8 % de gastos (31.600 €), salen e… |
| 154 | arras del 10 % | sí | art. 1454 CC (para la consecuencia, no para el 10… | no verificada | El 10 % es práctica de mercado. El art. 1454 CC está bien citado, pero solo rige si se pactan expresamente arras penitenciales: la jurisprudencia presume las a… |
| 154 | 45 días o más | **NO** | — | no verificada | Es una recomendación práctica, no un plazo legal. Coincide con el ES. |
| 155 | 7 días (certificado de deudas de la comunidad) | sí | art. 9.1.e LPH | correcta | El art. 9.1.e LPH fija un plazo máximo de siete días naturales desde la solicitud. Coincide con el ES (L135). |
| 158 | 30 días hábiles para autoliquidar el ITP | sí | art. 102 RD 828/1995 | dudosa | Los 30 días hábiles son la regla estatal. Canarias tiene el impuesto cedido, y la sede electrónica del Gobierno de Canarias (procedimiento 4026, modelo 600) in… |
| 160 | 4 meses (declaración en Bélgica) | **NO** | — | no verificada | No cita norma belga. Las búsquedas confirman la declaración vía MyMinfin y el código 1106 en fin.belgium.be, pero no el plazo de 4 meses. Se repite en L198 y c… |
| 169 | renta imputada 1,1 % / 2 %; IRNR 19 %; 250,80 € | **NO** | — | dudosa | No cita norma. Debería citar el art. 85 LIRPF por remisión del art. 24.5 TRLIRNR, y el 19 % del art. 25.1.a TRLIRNR. Es correcto para 2026 y aplicable a reside… |
| 177 | 456 € | **NO** | — | correcta | 120.000 × 2 % × 19 % = 456 €. Coincide con el ES (L157). |
| 183 | IRNR 19 % sobre el neto (residentes UE) | **NO** | — | correcta | No cita norma. Las bases serían el art. 25.1.a TRLIRNR (19 % UE/EEE) y el art. 24.6 TRLIRNR (deducción de gastos solo para residentes UE/EEE con intercambio de… |
| 184 | >31 días, ≤12 meses; desde 8-oct-2026 | sí | RDL 29/2026; arts. 2.3 y 9 bis LAU | correcta | Lo respalda el texto del BOE-A-2026-20823 según el resumen de búsqueda: art. 9 bis, duración superior a 31 días y como regla no superior a 12 meses, carga de l… |
| 185 | antigüedad mínima de 10 años para VV | sí | Ley 6/2025 de Canarias, art. 5.1.a | correcta | Según fuentes secundarias (Derecho Local, Noticias Jurídicas, Vega Asesores), el art. 5.1.a exige diez años de antigüedad, cinco en El Hierro, La Gomera, La Pa… |
| 198 | tasa NIE 9,84 €; unas 2 semanas; apostilla 25 € | **NO** | — | no verificada | Se pierde una cita respecto al ES (L164): el original dice 'tasa del modelo 790 código 12 (9,84 €)' y el DE omite el modelo 790-012. No he podido confirmar el … |
| 198 | 4 meses; exención con progresividad | **NO** | Convenio Bélgica-España (sin artículo) | no verificada | Cita el convenio sin artículo. Respecto al ES (L166) se pierden MyMinfin/Documentación Patrimonial, la asignación de un revenu cadastral belga, el 'cuadro III … |
| 201 | art. 25 CDI ES-NL; 'anteilige Anrechnung' | sí | art. 25 CDI España-Países Bajos 1971 | dudosa | Discrepancia con el ES (L170). El original describe la inclusión en la base y la deducción proporcional, que es el mecanismo de la 'aftrek ter voorkoming van d… |
| 204 | 9,84 €; mínimo 4 meses | **NO** | — | no verificada | Son datos del consulado de Fráncfort (fuente en L230) que no he podido contrastar. Coinciden con el ES (L172). |
| 206 | CDI ES-DE 2011 arts. 6, 22.2.a y 22.2.b.vii | sí | CDI España-Alemania 2011, arts. 6 y 22 | correcta | Haufe y Linda confirman que el art. 22(2)(b)(vii) del DBA Spanien 2011 aplica la imputación (Anrechnung) a las rentas inmobiliarias. Discrepancia: el DE añade … |
