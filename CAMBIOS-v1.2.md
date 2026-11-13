# Cambios v1.2 — Editor estándar de WordPress

Base: Entre Versos — Estructura 1.1. Las rutas, CPT, consulta por poeta, HTML estructural y convenciones del tema se mantienen.

1. Restaurado el editor estándar de WordPress para Poetas y Poemas: `editor`, `excerpt`, `thumbnail`, `author`, `revisions` y `page-attributes`. Los títulos y los grupos SCF siguen disponibles.
2. Añadidos los encabezados `Template Name` para seleccionar manualmente Sobre el proyecto, Nuestro equipo y Términos y Condiciones desde el administrador. `front-page.php` conserva su comportamiento automático.
3. Actualizada `docs/SCF-CAMPOS.md` con los nombres exactos de los campos y aclaraciones para no duplicar contenido entre Gutenberg y SCF.
4. Sin JavaScript ni interacciones nuevas. Los CPT siguen disponibles en `/wp-json/wp/v2/poetas` y `/wp-json/wp/v2/poemas`; el filtro `/wp-json/wp/v2/poemas?poeta_id=123` permanece igual.

**Validación:** lint de todos los archivos PHP y prueba de integridad del ZIP. No equivale a una prueba en WordPress con SCF activado.
