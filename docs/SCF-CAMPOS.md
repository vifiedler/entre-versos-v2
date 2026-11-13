# SCF: campos para «Poetas» y «Poemas»

Los CPT ya están registrados mediante PHP. Los campos se crean desde la administración de **Secure Custom Fields**. En cada grupo, configurar **Show in REST API = Sí** y su regla de ubicación según el post type correspondiente.

## Grupo 1 — Datos del poeta

**Regla de ubicación:** Post Type = Poetas (`ant_poeta`).

| Nombre de campo | Tipo SCF | Uso |
|---|---|---|
| `pais_origen` | Text | País latinoamericano. |
| `lugar_nacimiento` | Text | Ciudad o región. |
| `fecha_nacimiento` | Date Picker | Usar formato de retorno consistente, por ejemplo `Y-m-d`. |
| `fecha_fallecimiento` | Date Picker | Opcional para poetas vivos. |
| `resumen_biografico` | Textarea | Texto breve para las tarjetas. |
| `biografia_completa` | WYSIWYG | Información de la pantalla de biografía. |
| `cita_destacada` | Textarea | Frase para la tarjeta de inicio, opcional. |
| `musica_url` | URL | Único campo musical: enlace externo a una pista o reproductor. No se subirán audios a WordPress. |

**Campos WordPress nativos:** Título = nombre del poeta; Imagen destacada = foto principal. Si se necesita una cronología con múltiples pantallas biográficas, se puede añadir un repeater `hitos_biograficos` (`fecha`, `titulo`, `descripcion`, `imagen`) en una segunda fase, sin modificar los CPT.

## Grupo 2 — Datos del poema

**Regla de ubicación:** Post Type = Poemas (`ant_poema`).

| Nombre de campo | Tipo SCF | Configuración |
|---|---|---|
| `poeta_relacionado` | **Post Object** | **Obligatorio**: permitir solo `ant_poeta`, una sola selección, formato de retorno **ID**. Este nombre debe coincidir exactamente con el filtro REST. |
| `anio_publicacion` | Number | Año de publicación, si se conoce. |
| `obra_origen` | Text | Libro u obra de procedencia. |
| `descripcion_poema` | Textarea | Contexto editorial opcional. |
| `estrofas` | **Repeater** | Una fila por estrofa, ordenable. |

### Dentro de `estrofas`

| Nombre de subcampo | Tipo SCF | Uso |
|---|---|---|
| `recurso_visual_url` | URL | Imagen/GIF o recurso externo asociado a toda la estrofa; reduce almacenamiento local. |
| `recurso_visual_alt` | Text | Texto alternativo de la imagen. |
| `versos` | **Repeater** | Una fila por verso, en orden de lectura. |

### Dentro de `versos`

| Nombre de subcampo | Tipo SCF | Uso |
|---|---|---|
| `texto_verso` | Textarea | Texto de **un solo verso**. |
| `palabras_clave` | **Repeater** | Cero o más palabras/frases por verso que serán destacadas visualmente. |

### Dentro de `palabras_clave`

| Nombre de subcampo | Tipo SCF | Uso |
|---|---|---|
| `expresion` | Text | Palabra o frase exacta que aparece en `texto_verso`. |

### Notas de implementación

1. SCF soporta repetidores anidados. Aquí hay tres niveles; comprobar la experiencia de edición y el JSON resultante con un poema real antes de cargar todo el catálogo.
2. Si la edición de tres niveles resulta incómoda, simplificar `palabras_clave` a un campo **Text** con expresiones delimitadas por `|`. El resto de la arquitectura no cambia.
3. Conservar siempre el texto original de cada verso y aplicar el resaltado al renderizar mediante JavaScript (crear `<span>` de forma segura). Las palabras destacadas **no reciben eventos de clic**.
4. Cada estrofa tiene un único recurso visual asociado al significado global de esa estrofa, **no** de cada verso.
5. El carrusel avanza **estrofa por estrofa**. La lectura continua reúne las mismas estrofas en orden.
6. La música solo requiere `musica_url`: sin campos adicionales de título, artista, plataforma o licencia en SCF. Elegir un proveedor que permita bajar/subir/silenciar el volumen mediante sus APIs; verificar sus condiciones de uso por separado, aunque la pista se anuncie como libre de derechos.
7. La estructura final del JSON depende de las opciones de formato de retorno de SCF; inspeccionar un registro real desde `/wp-json/wp/v2/poemas/{id}` antes de construir el renderizador JavaScript.

## Prueba de relación

Publicar primero un poeta y observar su ID, por ejemplo `123`. Crear un poema seleccionando ese poeta en `poeta_relacionado`. Consultar:

```
/wp-json/wp/v2/poemas?poeta_id=123
```

La respuesta debe mostrar solamente los poemas publicados asociados a ese poeta.
