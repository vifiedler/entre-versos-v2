<?php
/**
 * Configuración principal de Entre Versos.
 * Los CPT viven en assets/modulos/; la interacción se implementará después.
 * @package EntreVersos
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function entre_versos_configurar_tema() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
}
add_action( 'after_setup_theme', 'entre_versos_configurar_tema' );

require_once get_theme_file_path( '/assets/assets.php' );
