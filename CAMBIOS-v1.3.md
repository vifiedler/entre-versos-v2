# Cambios — Entre Versos 1.3

Comparación con la versión 1.2:

1. Se transformó el estilo estructural básico en una propuesta **neobrutalista y editorial** basada en las pantallas de Stitch y en `DESIGN.md`.
2. Se adoptó **Bootstrap 5.3.9**, **Bootstrap Icons 1.13.2** y las fuentes **Syne, Inter y JetBrains Mono** exclusivamente mediante Google Fonts.
3. Se creó `assets/includes/js-functions.php` para incluir mediante CDN **Slick, mark.js, GSAP, Draggable, Flip y Atropos**. No hay inicializaciones ni JavaScript del equipo.
4. Se conservó la **barra superior propia** con rutas contextuales y accesos informativos solo en portada; NO se usa el menú de Stitch ni `wp_nav_menu()`.
5. Se conservó la **barra inferior fija** con logotipo textual ENTRE VERSOS, bandeja de poeta **vacía** y solo tres botones de volumen (deshabilitados hasta implementar audio).
6. Se diagramó la portada con cinco **Polaroids de marcador**, no contenido real. Se dejó `plantilla-tarjeta-poeta` y `plantilla-ficha-poeta` para el trabajo posterior con REST.
7. Se ampliaron `content-single-poeta.php` y `content-single-poema.php` siguiendo las pantallas de biografía y lectura de Stitch. Los botones de futuras interacciones permanecen deshabilitados.
8. Se incluyeron contenedores ocultos de vistas en `front-page.php` para la SPA, sin implementar cambios de vista.
9. Se actualizó `docs/SCF-CAMPOS.md` con **una palabra clave por verso**, `imagen_estrofa` de la Biblioteca de medios y la imagen destacada nativa para el **cierre del poema**.
10. Los CPT `ant_poeta` y `ant_poema` y el filtro REST de poemas por ID de poeta se conservan sin modificar.
11. Se mantuvo la convención `page-*` / `content-page-*` y `single-*` / `content-single-*` y los encabezados `Template Name` en las páginas informativas.

**Pendiente del equipo:** conexión REST real, inicialización de librerías, drag & drop, Slick, resaltado mark.js, animaciones, modo lectura continua, navegación SPA, música y controles funcionales.
