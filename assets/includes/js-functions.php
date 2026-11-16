<?php
/**
 * Librerías JavaScript CDN del proyecto.
 * Librerías CDN y carga mínima de registros desde REST.
 * No inicializa interacciones, animaciones ni carruseles.
 * @package EntreVersos
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function entre_versos_cargar_scripts() {
    // WordPress incluye jQuery. La versión usada debe comprobarse en la instalación:
    // si no es 3.7.1, actualizar el core o definir una estrategia de versión en equipo.
    // No sustituimos a ciegas el objeto global de jQuery para evitar duplicados.
    wp_enqueue_script( 'jquery' );

    // Componentes Bootstrap, compatibles con la futura lógica en jQuery.
    wp_enqueue_script( 'entre-versos-bootstrap', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.9/dist/js/bootstrap.bundle.min.js', array(), '5.3.9', true );

    // Carruseles y palabras destacadas.
    wp_enqueue_script( 'entre-versos-slick', 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js', array( 'jquery' ), '1.8.1', true );
    wp_enqueue_script( 'entre-versos-mark', 'https://cdn.jsdelivr.net/npm/mark.js@8.11.1/dist/jquery.mark.min.js', array( 'jquery' ), '8.11.1', true );

    // Distribución adaptativa de Polaroids (solo portada).
    if ( is_front_page() ) {
        wp_enqueue_script(
            'entre-versos-muuri',
            'https://cdn.jsdelivr.net/npm/muuri@0.9.5/dist/muuri.min.js',
            array(),
            '0.9.5',
            true
        );
        wp_enqueue_script(
            'entre-versos-galeria',
            get_theme_file_uri( '/assets/librerias/js/entre-versos-galeria.js' ),
            array( 'entre-versos-muuri' ),
            filemtime( get_theme_file_path( '/assets/librerias/js/entre-versos-galeria.js' ) ),
            true
        );
    }

    // Animación, arrastre, transiciones de layout y efecto 3D.
    wp_enqueue_script( 'entre-versos-gsap', 'https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/gsap.min.js', array(), '3.15.1', true );
    wp_enqueue_script( 'entre-versos-gsap-draggable', 'https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/Draggable.min.js', array( 'entre-versos-gsap' ), '3.15.1', true );
    wp_enqueue_script( 'entre-versos-gsap-flip', 'https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/Flip.min.js', array( 'entre-versos-gsap' ), '3.15.1', true );
    wp_enqueue_script( 'entre-versos-atropos', 'https://cdn.jsdelivr.net/npm/atropos@2.0.2/atropos.min.js', array(), '2.0.2', true );

    // Carga de contenido REST, organizada como en Sinapsis: cliente + presentación.
    // Las pantallas REST se cargan aquí; lectura continua y audio tienen sus controladores propios.
    if ( is_front_page() || is_singular( 'ant_poeta' ) || is_singular( 'ant_poema' ) ) {
        $version_tema = wp_get_theme()->get( 'Version' );

        wp_enqueue_script(
            'entre-versos-rest',
            get_theme_file_uri( '/assets/librerias/js/entre-versos-rest.js' ),
            array(),
            $version_tema,
            true
        );

        wp_localize_script(
            'entre-versos-rest',
            'entreVersosRestConfig',
            array(
                'poetasUrl' => esc_url_raw( rest_url( 'wp/v2/poetas' ) ),
                'poemasUrl' => esc_url_raw( rest_url( 'wp/v2/poemas' ) ),
                'mediosUrl' => esc_url_raw( rest_url( 'wp/v2/media' ) ),
            )
        );

        wp_enqueue_script(
            'entre-versos-contenido',
            get_theme_file_uri( '/assets/librerias/js/entre-versos-contenido.js' ),
            is_front_page() ? array( 'entre-versos-rest', 'entre-versos-galeria' ) : array( 'entre-versos-rest' ),
            filemtime( get_theme_file_path( '/assets/librerias/js/entre-versos-contenido.js' ) ),
            true
        );

        // El hub se activa exclusivamente en la portada: Slick + modal Bootstrap.
        if ( is_front_page() ) {
            wp_enqueue_script(
                'entre-versos-hub',
                get_theme_file_uri( '/assets/librerias/js/entre-versos-hub.js' ),
                array( 'entre-versos-contenido', 'entre-versos-slick', 'entre-versos-mark', 'entre-versos-bootstrap' ),
                filemtime( get_theme_file_path( '/assets/librerias/js/entre-versos-hub.js' ) ),
                true
            );
        }
    }

    // En el poema, alternar entre la estrofa visible y la lectura continua.
    if ( is_singular( 'ant_poema' ) ) {
        wp_enqueue_script(
            'entre-versos-lectura',
            get_theme_file_uri( '/assets/librerias/js/entre-versos-lectura.js' ),
            array( 'entre-versos-contenido' ),
            wp_get_theme()->get( 'Version' ),
            true
        );
    }

    // YouTube exclusivamente en poeta y poemas relacionados; nunca en la portada.
    if ( is_front_page() || is_singular( array( 'ant_poeta', 'ant_poema' ) ) ) {
        $poeta_id = is_singular( 'ant_poeta' )
            ? get_queried_object_id()
            : ( is_singular( 'ant_poema' ) ? absint( get_post_meta( get_queried_object_id(), 'poeta_relacionado', true ) ) : 0 );

        wp_enqueue_script(
            'entre-versos-audio',
            get_theme_file_uri( '/assets/librerias/js/entre-versos-audio.js' ),
            array( 'entre-versos-rest' ),
            filemtime( get_theme_file_path( '/assets/librerias/js/entre-versos-audio.js' ) ),
            true
        );
        wp_localize_script( 'entre-versos-audio', 'entreVersosAudioConfig', array( 'poetaId' => $poeta_id ) );
        // Cargar la API después del controlador: su callback ya estará definido.
        wp_enqueue_script(
            'entre-versos-youtube-api',
            'https://www.youtube.com/iframe_api',
            array( 'entre-versos-audio' ),
            null,
            true
        );
    }
}
add_action( 'wp_enqueue_scripts', 'entre_versos_cargar_scripts' );
