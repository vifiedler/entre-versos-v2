<?php
/**
 * CPT Poetas: la biografía, metadatos y música se administran en SCF.
 * Identificador interno: ant_poeta
 * REST API: /wp-json/wp/v2/poetas
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function antologia_registrar_cpt_poetas() {
    $labels = array(
        'name'                  => 'Poetas',
        'singular_name'         => 'Poeta',
        'menu_name'             => 'Poetas',
        'name_admin_bar'        => 'Poeta',
        'add_new'               => 'Añadir nuevo',
        'add_new_item'          => 'Añadir nuevo poeta',
        'edit_item'             => 'Editar poeta',
        'new_item'              => 'Nuevo poeta',
        'view_item'             => 'Ver poeta',
        'view_items'            => 'Ver poetas',
        'all_items'             => 'Todos los poetas',
        'search_items'          => 'Buscar poetas',
        'not_found'             => 'No se encontraron poetas',
        'not_found_in_trash'    => 'No se encontraron poetas en la papelera',
        'featured_image'        => 'Fotografía del poeta',
        'set_featured_image'    => 'Asignar fotografía',
        'remove_featured_image' => 'Quitar fotografía',
        'use_featured_image'    => 'Usar como fotografía',
    );

    register_post_type(
        'ant_poeta',
        array(
            'labels'            => $labels,
            'description'       => 'Autores latinoamericanos de la antología.',
            'public'            => true,
            'hierarchical'      => false,
            'show_in_rest'      => true,
            'rest_base'         => 'poetas',
            'has_archive'       => false, // La experiencia de lectura se construye en JavaScript.
            'rewrite'           => array( 'slug' => 'poetas', 'with_front' => false ),
            'menu_icon'         => 'dashicons-admin-users',
            'menu_position'     => 20,
            'supports'          => array( 'title', 'editor', 'excerpt', 'thumbnail', 'author', 'revisions', 'page-attributes' ),
            'show_in_menu'      => true,
            'show_in_admin_bar' => true,
            'map_meta_cap'      => true,
        )
    );
}
add_action( 'init', 'antologia_registrar_cpt_poetas' );
