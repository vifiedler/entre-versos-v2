<?php
/** Fallback de WordPress, separado de su parte de contenido. */
get_header();
?>
<main id="contenido-principal" class="contenido-principal">
    <?php if ( have_posts() ) :
        while ( have_posts() ) : the_post();
            get_template_part( 'template-parts/content' );
        endwhile;
    else : ?>
        <p>No hay contenido publicado todavía.</p>
    <?php endif; ?>
</main>
<?php get_footer(); ?>
