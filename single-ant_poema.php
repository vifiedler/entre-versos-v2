<?php
/** WordPress busca single-ant_poema.php para el CPT ant_poema. */
get_header();
?>
<main id="contenido-principal" class="contenido-principal contenido-principal--poema">
    <?php while ( have_posts() ) : the_post();
        get_template_part( 'template-parts/content-single', 'poema' );
    endwhile; ?>
</main>
<?php get_footer(); ?>
