<?php
/**
 * CPT Poemas: estrofas, versos y palabras clave se administran en SCF.
 * Identificador interno: ant_poema
 * REST API: /wp-json/wp/v2/poemas
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function antologia_registrar_cpt_poemas() {
    $labels = array(
        'name'               => 'Poemas',
        'singular_name'      => 'Poema',
        'menu_name'          => 'Poemas',
        'name_admin_bar'     => 'Poema',
        'add_new'            => 'Añadir nuevo',
        'add_new_item'       => 'Añadir nuevo poema',
        'edit_item'          => 'Editar poema',
        'new_item'           => 'Nuevo poema',
        'view_item'          => 'Ver poema',
        'view_items'         => 'Ver poemas',
        'all_items'          => 'Todos los poemas',
        'search_items'       => 'Buscar poemas',
        'not_found'          => 'No se encontraron poemas',
        'not_found_in_trash' => 'No se encontraron poemas en la papelera',
    );

    register_post_type(
        'ant_poema',
        array(
            'labels'            => $labels,
            'description'       => 'Poemas organizados en estrofas, versos y palabras destacadas.',
            'public'            => true,
            'hierarchical'      => false,
            'show_in_rest'      => true,
            'rest_base'         => 'poemas',
            'has_archive'       => false,
            'rewrite'           => array( 'slug' => 'poemas', 'with_front' => false ),
            'menu_icon'         => 'dashicons-edit-page',
            'menu_position'     => 21,
            'supports'          => array( 'title', 'editor', 'excerpt', 'thumbnail', 'author', 'revisions', 'page-attributes' ),
            'show_in_menu'      => true,
            'show_in_admin_bar' => true,
            'map_meta_cap'      => true,
        )
    );
}
add_action( 'init', 'antologia_registrar_cpt_poemas' );
