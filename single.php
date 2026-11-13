<?php
/** Respaldo de entradas individuales; los CPT tienen plantillas propias. */
get_header();
?>
<main id="contenido-principal" class="contenido-principal">
    <?php while ( have_posts() ) : the_post();
        get_template_part( 'template-parts/content', 'single' );
    endwhile; ?>
</main>
<?php get_footer(); ?>
