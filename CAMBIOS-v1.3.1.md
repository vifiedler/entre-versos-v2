# Entre Versos · Cambios de la versión 1.3.1

## Lo que cambia

- Se conserva el CSS, los componentes Bootstrap, las tipografías y las barras
  superior/inferior de la v1.3 original, sin rediseñarlos.
- La portada consulta `/wp-json/wp/v2/poetas` y sustituye las tarjetas de
  demostración por poetas publicados, incluyendo imagen destacada, nombre,
  extracto, cita, país y fechas cuando existan.
- Las fichas individuales de poetas consultan su información y los poemas
  relacionados mediante `?poeta_id=...`. Se muestran tarjetas y enlaces HTML
  convencionales de lectura, sin eventos de navegación JavaScript.
- La ficha de un poema consulta sus estrofas en SCF, dibuja los versos de la
  primera estrofa, destaca visualmente una palabra por verso y carga la imagen
  relacionada desde Medios. También prepara las demás estrofas en la sección
  de lectura continua que permanece oculta.
- Dos scripts, según la organización modular de Sinapsis:
  `entre-versos-rest.js` (peticiones), `entre-versos-contenido.js` (DOM).
- `js-functions.php` define rutas REST mediante `wp_localize_script` y solo
  carga los scripts propios en portada, ficha de poeta o ficha de poema.
- Documentación SCF armonizada con el respaldo de contenido real.

## Lo que NO cambia

- Ningún CPT, tabla de base de datos, grupo o campo SCF se modifica.
- No se incorporan archivos XML o SQL al tema.
- No se habilitan los botones de carrusel, selección, cambio de estrofa,
  navegación SPA o audio.
- No se inicializa Slick, mark.js, GSAP, Draggable, Flip ni Atropos.
- El recuadro inferior de selección sigue vacío al iniciar el sitio.
- La hoja de estilos principal de la v1.3 se conserva idéntica.

## Limitación deliberada

Hasta implementar la navegación por estrofas, la vista escénica presenta solo
la **primera**. Los datos completos se consultan y preparan para lectura
continua, pero esa pantalla permanece oculta, como en la maqueta 1.3.
