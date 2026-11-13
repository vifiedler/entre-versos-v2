<?php
/**
 * Permite consultar los poemas de un poeta a través de su ID:
 * GET /wp-json/wp/v2/poemas?poeta_id=123
 *
 * SCF debe tener el campo Post Object `poeta_relacionado`:
 * - tipo de contenido: ant_poeta
 * - selección múltiple: desactivada
 * - puede tener retorno ID u objeto (SCF almacena siempre el ID en postmeta)
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/** Registra el parámetro en el esquema de la colección REST. */
function antologia_rest_parametro_poeta( $params ) {
    $params['poeta_id'] = array(
        'description' => 'ID del poeta al que pertenece el poema.',
        'type'        => 'integer',
        'minimum'     => 1,
        'required'    => false,
    );
    return $params;
}
add_filter( 'rest_ant_poema_collection_params', 'antologia_rest_parametro_poeta' );

/** Filtra por el identificador guardado como metadato por SCF. */
function antologia_rest_filtrar_poemas_por_poeta( $args, $request ) {
    $poeta_id = absint( $request->get_param( 'poeta_id' ) );
    if ( 0 === $poeta_id ) {
        return $args;
    }

    if ( ! isset( $args['meta_query'] ) || ! is_array( $args['meta_query'] ) ) {
        $args['meta_query'] = array();
    }
    $args['meta_query'][] = array(
        'key'     => 'poeta_relacionado',
        'value'   => $poeta_id,
        'type'    => 'NUMERIC',
        'compare' => '=',
    );
    return $args;
}
add_filter( 'rest_ant_poema_query', 'antologia_rest_filtrar_poemas_por_poeta', 10, 2 );
