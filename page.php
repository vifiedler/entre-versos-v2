<?php
/** Plantilla genérica para páginas WordPress. */
get_header();
?>
ESTO ES PARA VER SI FUNCIONA O NO aaaa
<main id="contenido-principal" class="contenido-principal contenido-principal--pagina">
    <?php while ( have_posts() ) : the_post();
        get_template_part( 'template-parts/content', 'page' );
    endwhile; ?>
</main>
<?php get_footer(); ?>
