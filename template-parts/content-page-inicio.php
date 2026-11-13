<?php
/** Portada: galería editorial, accesos informativos y espacios REST. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$secciones = array(
    array( 'slug' => 'sobre-el-proyecto', 'texto' => 'Sobre el proyecto' ),
    array( 'slug' => 'nuestro-equipo', 'texto' => 'Nuestro equipo' ),
    array( 'slug' => 'terminos-y-condiciones', 'texto' => 'Términos y condiciones' ),
);
?>
<section id="seleccion-poetas" class="seleccion-poetas" aria-labelledby="titulo-inicio">
    <h1 class="screen-reader-text" id="titulo-inicio">Entre Versos — Antología de Poetas Latinoamericanos</h1>
    <div id="galeria-poetas" class="galeria-poetas" aria-label="Exploración de poetas">
        <!-- Tarjetas fotográficas tipo Polaroid: pendientes de REST API y JavaScript. -->
    </div>
</section>
<nav class="enlaces-informativos" aria-label="Información del proyecto">
    <?php foreach ( $secciones as $seccion ) :
        $pagina_info = get_page_by_path( $seccion['slug'], OBJECT, 'page' );
        $pagina_publicada = $pagina_info && 'publish' === $pagina_info->post_status;
        ?>
        <?php if ( $pagina_publicada ) : ?>
            <a class="enlaces-informativos__enlace" href="<?php echo esc_url( get_permalink( $pagina_info->ID ) ); ?>"><?php echo esc_html( $seccion['texto'] ); ?></a>
        <?php else : ?>
            <button class="enlaces-informativos__enlace" type="button" disabled><?php echo esc_html( $seccion['texto'] ); ?></button>
        <?php endif; ?>
    <?php endforeach; ?>
</nav>
