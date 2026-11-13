<?php
/**
 * Template Name: Términos y Condiciones
 */
/** Plantilla de página informativa «terminos-y-condiciones»; contenido en template-parts/. */
get_header();
?>
<main id="contenido-principal" class="contenido-principal contenido-principal--informativa">
    <?php while ( have_posts() ) : the_post();
        get_template_part( 'template-parts/content-page', 'terminos' );
    endwhile; ?>
</main>
<?php get_footer(); ?>
