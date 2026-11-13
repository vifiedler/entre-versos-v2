<?php
/** Ruta contextual. Títulos iniciales desde WP; los componentes se completarán con REST/JS. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

$tipo_vista = '';
$poeta_id = 0;
$titulo_contenido = '';
if ( is_singular( 'ant_poeta' ) ) {
    $tipo_vista = 'biografia';
    $poeta_id = get_queried_object_id();
    $titulo_contenido = 'Biografía';
} elseif ( is_singular( 'ant_poema' ) ) {
    $tipo_vista = 'poema';
    $poeta_posible = absint( get_post_meta( get_queried_object_id(), 'poeta_relacionado', true ) );
    if ( $poeta_posible && 'ant_poeta' === get_post_type( $poeta_posible ) ) {
        $poeta_id = $poeta_posible;
    }
    $titulo_contenido = get_the_title( get_queried_object_id() );
}
?>
<header id="barra-superior" class="barra-superior">
    <a class="barra-superior__inicio" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">Inicio</a>
    <span class="barra-superior__marca">Entre Versos</span>

    <?php if ( $tipo_vista ) : ?>
    <nav class="barra-superior__contexto" id="navegacion-contextual" aria-label="Ruta de lectura">
        <ol class="barra-superior__migas">
            <li class="barra-superior__miga" id="miga-poeta">
                <?php if ( $poeta_id ) : ?>
                <a id="miga-poeta-enlace" href="<?php echo esc_url( get_permalink( $poeta_id ) ); ?>"><?php echo esc_html( get_the_title( $poeta_id ) ); ?></a>
                <?php else : ?>
                <span id="miga-poeta-nombre">Poeta</span>
                <?php endif; ?>
            </li>
            <li class="barra-superior__separador" aria-hidden="true">/</li>
            <li class="barra-superior__miga" id="miga-contenido" aria-current="page"><?php echo esc_html( $titulo_contenido ); ?></li>
        </ol>
    </nav>
    <?php endif; ?>
</header>
