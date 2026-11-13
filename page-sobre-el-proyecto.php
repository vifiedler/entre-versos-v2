<?php
/**
 * Template Name: Sobre el proyecto
 */
/** Plantilla de página informativa «sobre-el-proyecto»; contenido en template-parts/. */
get_header();
?>
<main id="contenido-principal" class="contenido-principal contenido-principal--informativa">
    <?php while ( have_posts() ) : the_post();
        get_template_part( 'template-parts/content-page', 'sobre-proyecto' );
    endwhile; ?>
</main>
<?php get_footer(); ?>
