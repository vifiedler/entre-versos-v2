# Entre Versos — Tema estructural v1.1.0

Versión comparativa de la antología de poetas latinoamericanos. El nombre visible
del tema es **Entre Versos — Estructura 1.1**, y la carpeta del ZIP es distinta de
la original para poder conservar ambas instalaciones y compararlas.

## Qué se cambió frente a la base depurada 1.0

- Se respetó el patrón usado en el proyecto de referencia: los archivos
  `page-*` y `single-*` contienen el marco WordPress, mientras que sus
  `template-parts/content-page-*` y `content-single-*` contienen el marcado.
- Se añadieron plantillas exactas para los CPT registrados:
  `single-ant_poeta.php` y `single-ant_poema.php`.
- Se mantuvo `front-page.php`, que carga `content-page-inicio.php`.
- Se prepararon tres páginas informativas, sin contenido inventado, que se
  activan si se crean páginas WordPress con los slugs exactos indicados abajo.
- Se añadió una barra inferior compartida en **todas las pantallas**, con:
  nombre ENTRE VERSOS a la izquierda; contenedor derecho **vacío** para la
  ficha del poeta; debajo, solo tres controles de volumen deshabilitados.
- La cabecera superior muestra `Poeta / Biografía` y `Poeta / Poema` mediante
  PHP en las vistas individuales. La interfaz podrá actualizarse luego con REST.
- Se dejó la disposición estructural mínima para evitar que la barra fija
  tape el contenido. No hay paleta ni componentes visuales definitivos.
- No se copió código, medios, CSS ni JS de Breakdown Music (era solo una
  referencia de arquitectura).
- Se conservaron sin cambios funcionales los CPT y el filtro REST existente.

## Organización y carga

```text
functions.php
  └── assets/assets.php
      ├── assets/includes/css-functions.php
      └── assets/includes/modulos-functions.php
          ├── assets/modulos/cpt-poetas.php
          ├── assets/modulos/cpt-poemas.php
          └── assets/modulos/rest-relaciones.php
header.php → assets/templates/barra-superior.php
footer.php → assets/templates/barra-inferior.php + wp_footer()

front-page.php → template-parts/content-page-inicio.php
page.php → template-parts/content-page.php
page-sobre-el-proyecto.php → template-parts/content-page-sobre-proyecto.php
page-nuestro-equipo.php → template-parts/content-page-equipo.php
page-terminos-y-condiciones.php → template-parts/content-page-terminos.php
single-ant_poeta.php → template-parts/content-single-poeta.php
single-ant_poema.php → template-parts/content-single-poema.php
single.php → template-parts/content-single.php
index.php → template-parts/content.php
```

`404.php` es autocontenido. No se incluye barra de menú ni footer visual.
`wp_footer()` permanece en `footer.php` porque WordPress lo necesita.

## Páginas informativas (WordPress)

Crea páginas publicadas con estos slugs si quieres habilitar los enlaces de
la portada: `sobre-el-proyecto`, `nuestro-equipo`, `terminos-y-condiciones`.
Mientras no existan, sus botones aparecerán deshabilitados, sin enlaces rotos.
Las páginas usan el título y editor nativos de WordPress; no precisan SCF.
Si el equipo decide usar modales, podrá cambiar esos enlaces sin rehacer la
arquitectura editorial.

## CPT y REST

- CPT `ant_poeta`: `/wp-json/wp/v2/poetas`
- CPT `ant_poema`: `/wp-json/wp/v2/poemas`
- Filtro de relación: `/wp-json/wp/v2/poemas?poeta_id=123`

El campo `poeta_relacionado` debe ser un **Post Object**, selección única,
formato retorno ID. SCF debe exponer los grupos de campos en la API REST.
Ver `docs/SCF-CAMPOS.md`.

**No se cambiaron los identificadores** `ant_poeta`/`ant_poema` para preservar
compatibilidad con la base de datos y con sus rutas REST.

## Pendiente para el equipo

1. Completar las pantallas desde Figma y sus estilos definitivos.
2. Consumir REST con JavaScript/jQuery y montar las tarjetas tipo Polaroid.
3. Habilitar selección y arrastre de fotos hacia `#bandeja-poeta-contenido`,
   incluyendo la ficha y el botón «Explorar poeta» (vacío de inicio).
4. Crear el carrusel de biografía/poemas y la ampliación de pantallas.
5. Implementar la lectura **estrofa por estrofa** y una imagen/animación por
   estrofa, con palabras clave visualmente resaltadas, sin clic.
6. Implementar la música vía URL externa SCF `musica_url`, con bajar volumen,
   silenciar y subir volumen (sin MP3 local ni otros metadatos musicales).
7. Habilitar interacciones y accesibilidad del carrusel y controles.

## Instalación y comparación

El ZIP descomprime en `entre-versos-theme-v1-1/`, con el tema visible
`Entre Versos — Estructura 1.1`; puede coexistir con `entre-versos-theme/`.
Si ya hay CPT activos de otro tema/plugin, no habilitar ambos registros a la
vez. Una vez activo el nuevo tema, guardar enlaces permanentes una vez.

`style.css` solo contiene distribución estructural y accesibilidad; el equipo
reemplazará ese CSS al crear la propuesta final.
