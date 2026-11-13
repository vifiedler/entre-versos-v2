# Secure Custom Fields · Entre Versos (datos reales, 13-11-2026)

Los CPT `ant_poeta` y `ant_poema` se mantienen en el tema sin cambios.
Los campos se gestionan desde WordPress: **no se recrean ni importan** desde
este tema. En los dos grupos «SCF Poetas» y «SCF Poemas» ya se encuentra
activado «Show in REST API» en el respaldo entregado.

## 1. Grupo «SCF Poetas»

| Nombre | Tipo | Configuración observada |
|---|---|---|
| `pais_origen` | Text | País del poeta. |
| `lugar_nacimiento` | Text | Localidad. |
| `fecha_nacimiento` | Date Picker | Formato de retorno actual: **`d/m/Y`**. |
| `fecha_fallecimiento` | Date Picker | Formato de retorno actual: **`d/m/Y`**. |
| `cita_destacada` | Textarea | Fragmento para la Polaroid. |
| `musica_url` | URL | Enlace YouTube del poeta (`watch?v=...` o `youtu.be/...`). No se sube audio; se muestra el reproductor de YouTube en la experiencia del poeta y de sus poemas. |

Campos nativos: título, extracto, contenido de Gutenberg e imagen destacada.
No se duplican en SCF.

## 2. Grupo «SCF Poemas»

| Nombre | Tipo | Configuración observada |
|---|---|---|
| `poeta_relacionado` | Post Object | Selección única; **retorno actual: objeto**, valor guardado en postmeta como ID. |
| `anio_publicacion` | Number | Año de publicación. |
| `obra_origen` | Text | Libro o publicación. |
| `estrofas` | Repeater | Una fila por estrofa, en orden. |

### Repetidor `estrofas` (estructura más reciente)

| Subcampo | Tipo | Configuración observada |
|---|---|---|
| `imagen_estrofa` | Image | Biblioteca de medios; **retorno actual: array**. |
| `texto_estrofa` | Textarea | Versos separados por saltos de línea. |
| `palabras_clave` | Textarea | Una expresión por verso, también separada por saltos de línea. |

La posición de cada palabra clave coincide con la posición del verso.
Si un verso no lleva destacado, colocar `-` en su línea correspondiente.
El código de lectura destaca las expresiones conservando intacto el texto.
La navegación futura será **estrofa por estrofa**.

Campo nativo **Imagen destacada**: recurso de cierre del poema.

**Observación del respaldo:** el registro de «Alba» conserva metadatos de
una estructura anterior con subcampos `versos`, `texto_verso` y `palabra_clave`.
No se eliminan. El código de lectura usa prioritariamente `texto_estrofa` y
`palabras_clave`, y contempla el formato antiguo solo como respaldo de lectura.
No borres las entradas antiguas durante la transición si no existe un respaldo.

## 3. Endpoints usados

- `GET /wp-json/wp/v2/poetas?per_page=100&_embed=1`
- `GET /wp-json/wp/v2/poetas/{id}?_embed=1`
- `GET /wp-json/wp/v2/poemas?poeta_id={id}&_embed=1`
- `GET /wp-json/wp/v2/poemas/{id}?_embed=1`
- `GET /wp-json/wp/v2/media/{id}` (solo si el campo Image devuelve un ID)

La URL base se obtiene en `js-functions.php` mediante `rest_url()`;
**no** se escribe el dominio ni la subcarpeta de WordPress en JavaScript.
No hay datos de ejemplo codificados en los scripts.
