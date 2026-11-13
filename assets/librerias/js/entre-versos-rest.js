/**
 * Entre Versos · Cliente REST
 * Única responsabilidad: solicitar JSON a la API REST de WordPress.
 * Inspirado en la separación de cliente/diseño utilizada en Sinapsis.
 * No implementa navegación, eventos de clic ni animaciones.
 */
( function() {
    'use strict';

    var config = window.entreVersosRestConfig || {};
    var medios = {};

    function solicitarJson( url, parametros ) {
        var consulta = new URLSearchParams( parametros || {} );
        var destino = url + ( consulta.toString() ? ( url.indexOf( '?' ) === -1 ? '?' : '&' ) + consulta.toString() : '' );

        return window.fetch( destino, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            credentials: 'same-origin'
        } ).then( function( respuesta ) {
            var tipo = respuesta.headers.get( 'content-type' ) || '';

            if ( ! respuesta.ok ) {
                throw new Error( 'La API REST respondió con HTTP ' + respuesta.status + '.' );
            }
            if ( tipo.indexOf( 'json' ) === -1 ) {
                throw new Error( 'La respuesta de WordPress no contiene JSON.' );
            }

            return respuesta.json();
        } );
    }

    function obtenerPoetas() {
        return solicitarJson( config.poetasUrl, {
            per_page: 100,
            _embed: 1,
            orderby: 'title',
            order: 'asc'
        } );
    }

    function obtenerPoeta( id ) {
        return solicitarJson( config.poetasUrl + '/' + encodeURIComponent( id ), { _embed: 1 } );
    }

    function obtenerPoemasDePoeta( id ) {
        return solicitarJson( config.poemasUrl, {
            poeta_id: id,
            per_page: 100,
            _embed: 1,
            orderby: 'date',
            order: 'asc'
        } );
    }

    function obtenerPoema( id ) {
        return solicitarJson( config.poemasUrl + '/' + encodeURIComponent( id ), { _embed: 1 } );
    }

    function obtenerMedio( id ) {
        var identificador = Number( id );

        if ( ! identificador || ! config.mediosUrl ) {
            return Promise.resolve( null );
        }
        if ( ! medios[ identificador ] ) {
            medios[ identificador ] = solicitarJson(
                config.mediosUrl + '/' + identificador
            ).catch( function( error ) {
                // Permite reintentar la carga si falla temporalmente el recurso.
                delete medios[ identificador ];
                throw error;
            } );
        }

        return medios[ identificador ];
    }

    window.EntreVersosRest = {
        obtenerPoetas: obtenerPoetas,
        obtenerPoeta: obtenerPoeta,
        obtenerPoemasDePoeta: obtenerPoemasDePoeta,
        obtenerPoema: obtenerPoema,
        obtenerMedio: obtenerMedio
    };
}() );
