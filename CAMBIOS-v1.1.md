# Comparación 1.0 → 1.1

| Área | Tema 1.0 depurado | Tema 1.1 estructural |
|---|---|---|
| Plantillas por tipo | Solo inicio/index | `single-ant_poeta`, `single-ant_poema`, páginas informativas |
| Separación de contenido | Marcado directamente en `front-page.php` | `template-parts/content-page-*` y `content-single-*` |
| Barra inferior | Sin módulo compartido | Siempre presente en todas las vistas |
| Bandeja de poeta | Sin módulo | Vacía por defecto; ficha + CTA futuros |
| Reproductor | Pendiente | Estructura de solo 3 controles, deshabilitados |
| Barra superior | Breadcrumb oculto hasta JS | Breadcrumb contextual inicial en vistas PHP |
| CSS | Reset mínimo | Distribución estructural (sin visual final) |
| JavaScript | Sin JS | Sin JS |
| CPT / REST | Poetas y Poemas | Mismos identificadores y endpoints |

**Importante:** el proyecto de Breakdown Music no fue modificado ni copiado:
se utilizó solo para aprender las convenciones de organización.
