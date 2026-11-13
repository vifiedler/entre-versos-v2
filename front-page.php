<?php
/** Portada: solo marco de página. El HTML del contenido está en template-parts/. */
get_header();
?>
<main id="contenido-principal" class="contenido-principal contenido-principal--inicio">
    <?php get_template_part( 'template-parts/content-page', 'inicio' ); ?>
    <!-- Contenedores SPA preparados: el equipo decidirá cómo llenarlos mediante REST. -->
    <section id="vista-poeta" class="vista-dinamica" aria-label="Contenido del poeta" hidden></section>
    <section id="vista-poema" class="vista-dinamica" aria-label="Lectura de poema" hidden></section>
    <section id="vista-informacion" class="vista-dinamica" aria-label="Información del proyecto" hidden></section>
</main>
<?php get_footer(); ?>
