<?php
/** Contenido genérico de páginas; sin formatos heredados del otro proyecto. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<article id="post-<?php the_ID(); ?>" <?php post_class( 'pagina-informativa' ); ?>>
    <h1><?php the_title(); ?></h1>
    <div class="pagina-informativa__contenido"><?php the_content(); ?></div>
</article>
