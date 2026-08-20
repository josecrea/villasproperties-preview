# Pasar villasproperties.es a GitHub Pages

> Todo lo que aquí se afirma está comprobado contra el dominio y el repositorio
> reales el 20-08-2026. El VPS no se toca en ningún paso.

## Lo que hay hoy

| | |
|---|---|
| `villasproperties.es` apunta a | **185.172.57.99** (el VPS, sirviendo la web Odoo) |
| DNS gestionado por | **IONOS** (`ns1108.ui-dns.com` y compañía) |
| Correo | **IONOS** (`mx00.ionos.es`, `mx01.ionos.es`) — **independiente de la web** |
| URLs indexadas | **53**, todas respondiendo 200 |

El correo cuelga de los registros **MX**, y la web de los **A**. Cambiar los A
no toca el correo: `info@villasproperties.es` sigue funcionando durante y
después de la migración.

---

## El orden importa: así no hay ni un minuto de caída

La tentación es cambiar el DNS primero. **No.** Si el DNS apunta a GitHub antes
de que GitHub sepa qué repositorio servir para ese dominio, responde 404 hasta
que se configure. Al revés no pasa nada: mientras el DNS siga apuntando al VPS,
la web actual sigue sirviendo con normalidad.

### Paso 1 — Decirle a GitHub que acepte el dominio *(yo)*

Añadir el fichero `CNAME` al repositorio y dar de alta el dominio en
**Settings → Pages → Custom domain**.

Efecto inmediato: `josecrea.github.io/villasproperties-preview` deja de servir
directamente y pasa a redirigir a `villasproperties.es`, que todavía es la web
vieja. **Los visitantes no notan nada.** La preview deja de ser accesible por su
URL antigua, que es lo esperado.

### Paso 2 — Cambiar los registros A en IONOS *(tú)*

En el panel de IONOS, en la zona DNS de `villasproperties.es`:

**Borrar** el registro A que apunta a `185.172.57.99`.

**Crear cuatro registros A**, todos con nombre `@` (o vacío, según lo llame el
panel), y TTL lo más bajo que permita:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**Para `www`:** borrar su registro A y crear un **CNAME** con valor
`josecrea.github.io`.

**No tocar nada más.** En particular:

| Registro | Qué pasa si se toca |
|---|---|
| **MX** (`mx00.ionos.es`, `mx01.ionos.es`) | se cae el correo del dominio |
| **TXT** `google-site-verification=V4VhUmM…` | se pierde la verificación de Search Console |
| **TXT** `openai-domain-verification=dv-2XpG1…` | se pierde la verificación ante OpenAI |
| Registros SPF / DKIM / DMARC si los hay | el correo empieza a caer en spam |

### Paso 3 — Esperar a que propague

Suele tardar entre unos minutos y un par de horas. Comprobarlo con:

```bash
dig +short A villasproperties.es
```

Está listo cuando devuelve las cuatro IPs de GitHub y no `185.172.57.99`.

### Paso 4 — Certificado HTTPS *(tú, un clic)*

En **Settings → Pages**, marcar **Enforce HTTPS**. GitHub emite el certificado
solo, pero la casilla no se puede marcar hasta que el DNS ya apunta a ellos.
Puede tardar unos minutos en habilitarse.

### Paso 5 — Abrir la indexación *(yo)*

```bash
node tools/abrir-indexacion.cjs --dominio=https://villasproperties.es --aplicar
./tools/sellar.sh
```

Quita los `noindex` de las 32 páginas, reescribe las 288 URLs del preview al
dominio definitivo y deja `robots.txt` en Allow con el sitemap declarado.

**Este paso va el último a propósito.** Hacerlo antes invitaría a Google a
indexar `josecrea.github.io`, que es exactamente lo que no queremos.

### Paso 6 — Search Console y Bing *(tú)*

Dar de alta el dominio y **enviar el sitemap**
(`https://villasproperties.es/sitemap.xml`). La verificación TXT de Google ya
está puesta, así que debería reconocerlo sin más.

---

## Las 53 URLs viejas

Ya están resueltas. GitHub Pages **no permite redirecciones de servidor**, así
que cada URL indexada tiene publicado en su ruta un fichero que lleva a la
nueva. Cada uno hace tres cosas y las tres hacen falta:

- **`canonical`** — es lo que traslada el posicionamiento. Sin esto, la
  redirección no sirve para SEO.
- **`meta refresh` a 0** — funciona sin JavaScript, que es como navegan los
  rastreadores de las IA.
- **`location.replace`** — instantáneo en un navegador real. Con `replace` y no
  `href`, para que el botón "atrás" no devuelva a la redirección y atrape al
  usuario en un bucle.

**32 rutas** conservadas, entre ellas los 8 artículos de blog (con su slug
exacto) y las 6 landings municipales. Verificado que los 32 destinos existen y
que las redirecciones llegan donde deben.

Las otras **21** son fontanería de Odoo que nunca debió estar en el sitemap
—`/forum`, `/events`, `/profile/users`, `/shop`, `/blog/1..3`— y caen en
`404.html`. En un servidor propio se responderían con 410; en Pages no es
posible y tampoco compensa: son URLs sin valor.

El detalle completo, en [REDIRECCIONES.md](REDIRECCIONES.md).

---

## Lo que se pierde por servir desde Pages

Conviene saberlo, aunque ninguna sea bloqueante:

| | |
|---|---|
| **Cabeceras de seguridad** | Pages solo manda HSTS. No hay CSP, `X-Frame-Options`, `X-Content-Type-Options` ni `Referrer-Policy`. Riesgo real pero bajo en un sitio estático **sin cookies y con una sola dependencia externa** (`wa.me`) |
| **301 de verdad** | las redirecciones son por `canonical` + meta refresh. Google las respeta y traslada el posicionamiento, pero tarda algo más que una 301 |
| **410** | no existe; las URLs muertas dan 404 |
| **Logs de servidor** | no hay. Sin analítica instalada, no se sabrá qué páginas funcionan |

Si algún día compensa, todo esto se recupera sirviendo desde el VPS con Traefik,
y `redirecciones.map` ya está generado para ese caso.

---

## Después del cambio

**El primer día**
- Comprobar que `https://villasproperties.es` carga con candado
- Probar cinco URLs viejas a mano (`/catalogo`, `/vender-casa-adeje`,
  `/blog/4/como-vender-una-casa-5`, `/financiacion`, `/valoracion-gratis-tenerife`)
- Enviar un correo de prueba a `info@villasproperties.es` y ver que llega
- Enviar el sitemap en Search Console

**La primera semana**
- Vigilar 404 en Search Console
- Comprobar que entran leads en Odoo (equipo 11)

**Al mes**
- Preguntar a ChatGPT, Perplexity y Google AI Overviews por "vender casa en
  Tenerife Sur" y anotar si aparece Villa's. Sin medirlo, el GEO es fe

---

## Si algo sale mal

La vuelta atrás es el mismo camino en sentido contrario y **no depende de mí**:
en IONOS, devolver el registro A a `185.172.57.99`. La web Odoo del VPS sigue
intacta —no se toca en ningún paso de esta migración— y vuelve a servir en
cuanto propague el DNS.
