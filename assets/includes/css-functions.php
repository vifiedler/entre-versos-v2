<?php
/** Encolado de los estilos estructurales. @package EntreVersos */
if ( ! defined( 'ABSPATH' ) ) { exit; }
function entre_versos_cargar_estilos() {
    wp_enqueue_style( 'entre-versos-theme', get_stylesheet_uri(), array(), wp_get_theme()->get( 'Version' ) );
}
add_action( 'wp_enqueue_scripts', 'entre_versos_cargar_estilos' );
