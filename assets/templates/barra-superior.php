<?php
/**
 * Barra de navegación contextual de Entre Versos (sin wp_nav_menu).
 * En una futura SPA, el equipo actualizará las migas al cambiar de vista.
 * @package EntreVersos
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

$poeta_id = 0;
$poeta_nombre = '';
$nombre_pantalla = '';

if ( is_singular( 'ant_poeta' ) ) {
    $poeta_id = get_queried_object_id();
    $poeta_nombre = get_the_title( $poeta_id );
    $nombre_pantalla = 'Biografía';
} elseif ( is_singular( 'ant_poema' ) ) {
    $poeta_id = absint( get_post_meta( get_queried_object_id(), 'poeta_relacionado', true ) );
    if ( 'ant_poeta' !== get_post_type( $poeta_id ) ) { $poeta_id = 0; }
    $poeta_nombre = $poeta_id ? get_the_title( $poeta_id ) : 'Poeta';
    $nombre_pantalla = get_the_title( get_queried_object_id() );
}
$es_inicio = is_front_page();
$informativos = array(
    array( 'slug' => 'sobre-el-proyecto', 'label' => 'Sobre el proyecto' ),
    array( 'slug' => 'nuestro-equipo', 'label' => 'Nuestro equipo' ),
    array( 'slug' => 'terminos-y-condiciones', 'label' => 'T&C' ),
);
?>
<header id="barra-superior" class="barra-superior">
    <div class="container-fluid p-0">
        <div class="row g-2 g-lg-3 align-items-center barra-superior__interior">
            <div class="col-auto">
                <a class="barra-superior__inicio boton-editorial boton-editorial--compacto" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home" aria-label="Volver al inicio de Entre Versos">
                    <i class="bi bi-arrow-left" aria-hidden="true"></i><span>Inicio</span>
                </a>
            </div>
            <div class="col">
                <?php if ( $nombre_pantalla ) : ?>
                    <nav id="navegacion-contextual" aria-label="Ruta de lectura">
                        <ol class="barra-superior__migas" id="migas-navegacion">
                            <li id="miga-poeta">
                                <?php if ( $poeta_id ) : ?>
                                    <a id="miga-poeta-enlace" href="<?php echo esc_url( get_permalink( $poeta_id ) ); ?>"><?php echo esc_html( $poeta_nombre ); ?></a>
                                <?php else : ?>
                                    <span id="miga-poeta-nombre"><?php echo esc_html( $poeta_nombre ); ?></span>
                                <?php endif; ?>
                            </li>
                            <li aria-hidden="true">/</li>
                            <li id="miga-contenido" aria-current="page"><?php echo esc_html( $nombre_pantalla ); ?></li>
                        </ol>
                    </nav>
                <?php else : ?>
                    <a class="barra-superior__marca d-inline-block" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">Entre Versos <span class="d-none d-lg-inline">/ Antología Latinoamericana</span></a>
                    <nav id="navegacion-contextual" aria-label="Ruta de lectura" hidden>
                        <ol class="barra-superior__migas" id="migas-navegacion">
                            <li id="miga-poeta"><span id="miga-poeta-nombre"></span></li>
                            <li aria-hidden="true">/</li>
                            <li id="miga-contenido" aria-current="page"></li>
                        </ol>
                    </nav>
                <?php endif; ?>
            </div>
            <?php if ( $es_inicio ) : ?>
                <div class="col-12 col-xl-auto">
                    <nav class="enlaces-informativos justify-content-end" aria-label="Información de la antología">
                        <?php foreach ( $informativos as $seccion ) :
                            $pagina = get_page_by_path( $seccion['slug'], OBJECT, 'page' );
                            $url = ( $pagina && 'publish' === $pagina->post_status ) ? get_permalink( $pagina->ID ) : '';
                            if ( $url ) : ?>
                                <a class="enlaces-informativos__enlace boton-editorial" href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $seccion['label'] ); ?></a>
                            <?php else : ?>
                                <span class="enlaces-informativos__enlace boton-editorial" aria-disabled="true"><?php echo esc_html( $seccion['label'] ); ?></span>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    </nav>
                </div>
            <?php endif; ?>
        </div>
    </div>
</header>
