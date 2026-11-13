# Entre Versos — Diseño 1.3.2 · Lectura continua y música

Tema clásico de WordPress para una **Antología Interactiva de Poetas Latinoamericanos**. Esta versión integra **HTML/PHP y CSS responsivo** a partir del diseño visual de Stitch, utilizando Bootstrap 5.3 y Bootstrap Icons, incorporando la carga REST, el modo de lectura continua y un reproductor visible de YouTube en las pantallas de autor y poema. La navegación SPA, el carrusel y el drag & drop siguen pendientes.

## Qué incluye

- **Bootstrap 5.3.9** (CSS y bundle JS) y **Bootstrap Icons 1.13.2**, desde CDN.
- Tipografías **Syne, Inter y JetBrains Mono** desde Google Fonts.
- **jQuery** del propio WordPress y dependencias CDN registradas para Slick 1.8.1, mark.js 8.11.1, GSAP 3.15.1 (core, Draggable, Flip), Atropos 2.0.2.
- Paleta neobrutalista y estilos **propios** en `assets/librerias/css/estilo-entre-versos.css`, separados de Bootstrap.
- Barra superior contextual y barra inferior compacta, conservando la identidad de **Entre Versos**.
- Zona «Tolva // Dejar aquí» **vacía**, situada exclusivamente dentro de la portada. Se completará después al programar selección/arrastre.
- Plantillas para portada, páginas de información, biografía, poemas, lectura continua y pantalla de cierre.
- CPT `ant_poeta` y `ant_poema` con editor Gutenberg familiar y filtros REST de relación por ID.
- Guía SCF actualizada en `docs/SCF-CAMPOS.md`.

## Qué NO incluye todavía

Se han agregado dos scripts propios, `entre-versos-rest.js` (peticiones) y `entre-versos-contenido.js` (renderizado).
La portada se rellena con poetas publicados. La página del poeta incorpora sus
obras y la del poema rellena la **primera estrofa** y prepara los datos de
lectura continua, que ya puede abrirse con su botón. La música se carga
desde YouTube exclusivamente en el poeta y sus poemas, con reproductor visible
y volumen inicial al 50%. No hay Slick, mark.js inicializado, Atropos,
drag & drop, selección ni navegación SPA. La bandeja de selección permanece
vacía. Los enlaces normales a los poemas son provisionales y
recargan la página hasta construir la SPA.


## Organización

```text
functions.php
assets/
  assets.php
  includes/
    css-functions.php
    js-functions.php
    modulos-functions.php
  modulos/
    cpt-poetas.php
    cpt-poemas.php
    rest-relaciones.php
  templates/
    barra-superior.php
    barra-inferior.php
    reproductor-youtube.php
  librerias/
    css/estilo-entre-versos.css
    js/entre-versos-rest.js
    js/entre-versos-contenido.js
    js/entre-versos-lectura.js
    js/entre-versos-audio.js
front-page.php
page-*.php
single-ant_poeta.php
single-ant_poema.php
template-parts/content-*.php
docs/SCF-CAMPOS.md
```

**Convenciones:** `front-page.php` contiene la vista inicial y contenedores para la futura SPA; `single-ant_poeta.php` carga `content-single-poeta.php`; `single-ant_poema.php` carga `content-single-poema.php`; las páginas `page-*` cargan sus `content-page-*` y tienen `Template Name` para seleccionarlas desde WordPress.

## Instalación

1. Descomprimir el ZIP directamente dentro de `wp-content/themes/`, o instalarlo desde **Apariencia > Temas > Añadir tema > Subir tema**.
2. Activar el tema *Entre Versos — v1.3.2 · Lectura y audio*. Se puede mantener la versión anterior como referencia.
3. **Ajustes > Lectura:** elegir una página estática como portada. WordPress utilizará `front-page.php`.
4. **Ajustes > Enlaces permanentes:** guardar una vez para refrescar reglas de CPT.
5. Instalar SCF y crear los grupos descritos en `docs/SCF-CAMPOS.md`; activar su exposición REST.
6. Crear páginas informativas y seleccionar sus plantillas desde el administrador.
7. Comprobar la carga de los recursos CDN en un navegador conectado a Internet.

## Criterios y limitaciones

- **Bootstrap 5.3** aporta `.container-fluid`, `.row`, `.col-*`, `d-flex`, espaciados, etc. Clases propias descriptivas en español se reservan para componentes de identidad y efectos.
- No se incluyó Tailwind, Material Symbols ni ninguna fuente local de Stitch.
- No se han copiado fotografías ni música del proyecto de referencia: las imágenes se administrarán desde la Biblioteca de medios y la música desde el campo `musica_url`.
- WordPress ya suele incluir **jQuery 3.7.1** en versiones actuales; se usa el identificador `jquery` del core para evitar una segunda copia de jQuery. **Comprobar la versión efectiva** con la instalación antes de desarrollar; si difiere de 3.7.1, resolverlo explícitamente.
- La navegación por estrofas, el carrusel y las Polaroid interactivas siguen deshabilitados hasta implementarlos con el equipo.
- La vista SPA completa requerirá programar cambios de estado, navegación e historial, además de accesibilidad y animaciones. Las plantillas `single-*` también sirven de respaldo WordPress.
- Las páginas de información son enlaces WordPress convencionales **por ahora**; su navegación sin recarga se construirá posteriormente.

## Datos incluidos en los respaldos recibidos

Los archivos XML y SQL proporcionados para el desarrollo identifican un poeta
publicado («Federico García Lorca») y un poema publicado («Alba»), con seis
estrofas y seis recursos visuales de la Biblioteca de medios. **No se incluye
el SQL, el XML ni ninguna copia de datos personales en este tema.**

Los archivos de medios deben continuar disponibles en la instalación de
WordPress: el XML y el SQL **no** transportan por sí solos los binarios de
las fotografías originales.

## Cómo comprobar esta versión

1. Con SCF activo, abrir `/wp-json/wp/v2/poetas` y comprobar que devuelve un array.
2. Comprobar que el registro tiene `acf`, `excerpt` y `featured_media`.
3. En la portada, observar Polaroids reales en lugar de marcadores ficticios.
4. Abrir la URL nativa de un poeta: deben aparecer sus obras asociadas.
5. Abrir la URL nativa de un poema: aparecerá la **primera estrofa** completa,
   su imagen y el total de estrofas. La navegación entre ellas se programará después.
6. Ante errores revisar Consola del navegador y Red > peticiones REST.

## Lectura continua y música (1.3.2)

- El sitio no desplaza el documento en pantallas de poeta y poema; los textos largos se desplazan dentro del panel de lectura.
- «Lectura continua» muestra todas las estrofas con desplazamiento interno y al final la imagen destacada del poema. «Volver a estrofas» restaura el visor.
- `musica_url` debe tener una URL de video de YouTube (`youtube.com/watch?v=...` o `youtu.be/...`). El tema no almacena el audio ni descarga archivos.
- El reproductor audiovisual de YouTube permanece visible con dimensiones mínimas de 200 × 200 px; ocultarlo para reproducir exclusivamente audio infringiría sus políticas.
- El audio intenta comenzar al 50% cuando se carga una ficha de poeta o un poema, **nunca en Inicio**. Los navegadores pueden bloquear el autoplay con sonido: el video conserva el botón nativo para iniciarlo manualmente.
- Cambiar de página PHP recarga el documento y reinicia la pista; la reproducción verdaderamente continua entre vistas llegará cuando se implemente la SPA.

Consulta `CAMBIOS-v1.3.2.md` para el detalle técnico.


## Cambios v1.3.3

Consultar `CAMBIOS-v1.3.3.md` para las correcciones de W3C y el comportamiento de YouTube.


## Ajustes v1.3.4

- Barra contextual: botón «Inicio», sin «Registro».
- Vista del poeta: titulares, tarjetas y bloque de obras reajustados para permanecer dentro de la altura disponible del viewport.
- La barra inferior se mantiene visible; el texto largo se desplaza dentro de las tarjetas, no en la página general.
- Hasta activar Slick, las nuevas pantallas de poema se consultan desde los enlaces del índice de obras, evitando que generen filas adicionales fuera de pantalla.
- Responsive: en tablet y móvil los paneles se pueden recorrer horizontalmente dentro de su contenedor.
- No se modifican CPT, SCF, REST, música ni scripts existentes.
