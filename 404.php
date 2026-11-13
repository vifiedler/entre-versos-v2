<?php
/** Pantalla única: no necesita template-part. */
get_header();
?>
<main id="contenido-principal" class="contenido-principal">
    <h1>Página no encontrada</h1>
    <p>El contenido solicitado no está disponible.</p>
    <p><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Volver al inicio</a></p>
</main>
<?php get_footer(); ?>
