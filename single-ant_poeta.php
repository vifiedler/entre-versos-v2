<?php
/**
 * WordPress busca single-{post_type}.php: el identificador del CPT es ant_poeta.
 * Separa plantilla de contenido, como en la referencia del equipo.
 */
get_header();
?>
<main id="contenido-principal" class="contenido-principal contenido-principal--poeta">
    <?php while ( have_posts() ) : the_post();
        get_template_part( 'template-parts/content-single', 'poeta' );
    endwhile; ?>
</main>
<?php get_footer(); ?>
