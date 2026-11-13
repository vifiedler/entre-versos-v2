<?php
/**
 * Recursos CSS del tema: CDN primero, CSS propio al final.
 * Bootstrap organiza; las clases propias aplican la identidad de Stitch.
 * @package EntreVersos
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function entre_versos_cargar_estilos() {
    $version = wp_get_theme()->get( 'Version' );

    // Framework, iconografía y tipografías disponibles en Google Fonts.
    wp_enqueue_style( 'entre-versos-bootstrap', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.9/dist/css/bootstrap.min.css', array(), '5.3.9' );
    wp_enqueue_style( 'entre-versos-iconos', 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.2/font/bootstrap-icons.min.css', array( 'entre-versos-bootstrap' ), '1.13.2' );
    wp_enqueue_style( 'entre-versos-fuentes', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@500;600;700;800&display=swap', array(), null );

    // Estilos necesarios para Slick y Atropos (sin inicializarlos todavía).
    wp_enqueue_style( 'entre-versos-slick', 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css', array(), '1.8.1' );
    wp_enqueue_style( 'entre-versos-atropos', 'https://cdn.jsdelivr.net/npm/atropos@2.0.2/atropos.min.css', array(), '2.0.2' );

    // Primero el archivo obligatorio de tema, después los estilos visuales propios.
    wp_enqueue_style( 'entre-versos-theme', get_stylesheet_uri(), array( 'entre-versos-bootstrap' ), $version );
    wp_enqueue_style(
        'entre-versos-estilos',
        get_theme_file_uri( '/assets/librerias/css/estilo-entre-versos.css' ),
        array( 'entre-versos-theme', 'entre-versos-iconos', 'entre-versos-fuentes', 'entre-versos-slick', 'entre-versos-atropos' ),
        $version
    );
}
add_action( 'wp_enqueue_scripts', 'entre_versos_cargar_estilos' );
