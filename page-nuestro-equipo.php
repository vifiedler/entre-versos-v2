<?php
/**
 * Template Name: Nuestro equipo
 */
/** Plantilla de página informativa «nuestro-equipo»; contenido en template-parts/. */
get_header();
?>
<main id="contenido-principal" class="contenido-principal contenido-principal--informativa">
    <?php while ( have_posts() ) : the_post();
        get_template_part( 'template-parts/content-page', 'equipo' );
    endwhile; ?>
</main>
<?php get_footer(); ?>
