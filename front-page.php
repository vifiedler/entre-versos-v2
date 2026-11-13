<?php
/** Portada: solo marco de página. El HTML del contenido está en template-parts/. */
get_header();
?>ESTO ES PARA VER SI FUNCIONA O NO aaaa
<main id="contenido-principal" class="contenido-principal contenido-principal--inicio">
    <?php get_template_part( 'template-parts/content-page', 'inicio' ); ?>
</main>
<?php get_footer(); ?>
