# Entre Versos v1.3.3 — HTML y música ambiental

- Parte de la versión 1.3.2. No se ha alterado el diseño de la portada ni los CPT.
- Se corrige el `aria-label` de `#galeria-poetas` y del contenedor de controles, añadiendo `role="group"`.
- Se añade a `functions.php` un filtro de salida para eliminar `/` antes del cierre de etiquetas vacías HTML5. Se omite el administrador, AJAX, REST, feeds, robots y trackbacks; se excluyen scripts, estilos y comentarios del filtro.
- El reproductor YouTube vuelve a un contenedor oculto fuera de la pantalla, siguiendo el patrón de `footer.php` del ZIP Breakdown Music, y mantiene los tres controles de volumen de Entre Versos.
- Se conserva el campo SCF `musica_url` (URL del vídeo): la API de YouTube crea el iframe automáticamente. No se incorpora HTML iframe en SCF.
- La música solo se carga en la vista individual del poeta y del poema; se fija volumen inicial 50 % e intenta autoplay.
- Si el navegador bloquea autoplay con audio, un clic en cualquiera de los controles de volumen reintenta la reproducción.

**Advertencia:** el iframe oculto (1 × 1) no cumple los requisitos de presentación de YouTube y puede tener bloqueos o fallos. Además, el autoplay con sonido no está garantizado por los navegadores.

**Validación:** ejecutar PHP lint/JS syntax y comprobar HTML renderizado en W3C. La implementación aún necesita una prueba funcional contra un vídeo real en el servidor.
