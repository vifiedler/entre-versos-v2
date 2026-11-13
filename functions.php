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


/**
 * Normaliza la sintaxis HTML5 de las etiquetas vacías del front-end.
 * Evita reescribir código dentro de bloques <script>, <style> y comentarios.
 * Esta limpieza es de presentación: no modifica el contenido almacenado.
 */
function entre_versos_sin_barras_finales( $html ) {
    $partes = preg_split(
        '~(<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>|<!--.*?-->)~is',
        $html,
        -1,
        PREG_SPLIT_DELIM_CAPTURE
    );
    if ( ! is_array( $partes ) ) {
        return $html;
    }
    foreach ( $partes as $indice => $parte ) {
        if ( preg_match( '~^<(?:script|style)\b|^<!--~i', $parte ) ) {
            continue;
        }
        // Solamente elimina la barra que cierra una etiqueta vacía.
        $partes[ $indice ] = preg_replace(
            '~<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b((?:"[^"]*"|\x27[^\x27]*\x27|[^\x27">])*)\s*/>~i',
            '<$1$2>',
            $parte
        );
    }
    return implode( '', $partes );
}

/** Inicia el búfer únicamente para HTML público, no para APIs ni descargas. */
function entre_versos_iniciar_limpieza_html() {
    if ( is_admin() || wp_doing_ajax() || is_feed() || is_robots() || is_trackback() ) {
        return;
    }
    if ( ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ||
         ( function_exists( 'wp_is_json_request' ) && wp_is_json_request() ) ) {
        return;
    }
    ob_start( 'entre_versos_sin_barras_finales' );
}
add_action( 'template_redirect', 'entre_versos_iniciar_limpieza_html', 0 );
