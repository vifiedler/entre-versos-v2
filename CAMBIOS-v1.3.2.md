# Entre Versos · Cambios v1.3.2

Basada en v1.3.1. No altera los CPT ni la estructura SCF.

- Se eliminó de la portada el bloque gigantesco de título, subtítulo, metadatos y mensaje de selección.
- La bandeja **Tolva / Dejar aquí** solo aparece en la portada, superpuesta en la esquina inferior derecha. Permanece vacía hasta desarrollar drag & drop.
- La barra inferior se redujo y conserva solo la marca. En pantallas de poeta y poema incorpora los tres controles de volumen; en Inicio no carga música.
- Las vistas individuales de poeta y poema se ajustan al viewport y evitan el scroll del documento. El panel de estrofas y la biografía admiten scroll interno.
- Se habilitó el botón **Lectura continua**, que muestra todas las estrofas y la imagen de cierre en un panel con scroll independiente, y el botón para volver a la estrofa.
- Se incorporó `entre-versos-audio.js` para una pista de YouTube por poeta desde `acf.musica_url`, con volumen inicial 50%, autoplay sujeto a permisos del navegador y controles de bajar/silenciar/subir. Solo se carga en `single-ant_poeta` y `single-ant_poema`.
- **YouTube exige reproductor audiovisual visible (mínimo 200 × 200 píxeles).** Se incluyó una tarjeta de video visible de 210 × 200 píxeles en las vistas de contenido; NO se oculta ni extrae audio.
- Se mantuvieron las llamadas REST, las plantillas, Bootstrap, diseño neobrutalista y bibliotecas ya configuradas. Sigue pendiente el carrusel Slick, navegación SPA y drag & drop.

## Consideraciones

- El audio se detiene al salir del poeta o del poema. La navegación actual entre páginas es tradicional; **no mantiene reproducción ininterrumpida en el cambio de documento** (esto requeriría la SPA).
- El autoplay con sonido puede ser bloqueado; el usuario dispone del botón de reproducción de YouTube en el video.
- El marco de video debe permanecer visible y poder mostrar controles de YouTube, conforme a sus políticas.
- Requiere comprobar en WordPress el comportamiento visual y la disponibilidad del video enlazado.
