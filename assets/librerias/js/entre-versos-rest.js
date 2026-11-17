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

    // Devuelve contenido y metadatos de paginación sin perder el parseo JSON.
    function solicitarPagina( url, parametros ) {
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

            return respuesta.json().then( function( contenido ) {
                return {
                    contenido: contenido,
                    paginas: Math.max( 1, Number( respuesta.headers.get( 'X-WP-TotalPages' ) ) || 1 )
                };
            } );
        } );
    }

    function solicitarJson( url, parametros ) {
        return solicitarPagina( url, parametros ).then( function( resultado ) {
            return resultado.contenido;
        } );
    }

    // WordPress limita per_page a 100. Recuperamos todas las páginas
    // tanto de poetas como de poemas relacionados, sin hacer consultas SQL.
    function obtenerColeccionCompleta( url, parametros ) {
        var opciones = Object.assign( {}, parametros, { per_page: 100 } );
        return solicitarPagina( url, Object.assign( {}, opciones, { page: 1 } ) )
            .then( function( primera ) {
                if ( !Array.isArray( primera.contenido ) ) { return []; }
                if ( primera.paginas <= 1 ) { return primera.contenido; }
                var siguientes = [];
                for ( var pagina = 2; pagina <= primera.paginas; pagina++ ) {
                    siguientes.push( solicitarJson( url,
                        Object.assign( {}, opciones, { page: pagina } ) ) );
                }
                return Promise.all( siguientes ).then( function( resultados ) {
                    return primera.contenido.concat.apply( primera.contenido, resultados );
                } );
            } );
    }

    function obtenerPoetas() {
        return obtenerColeccionCompleta( config.poetasUrl, {
            _embed: 1, orderby: 'title', order: 'asc'
        } );
    }

    function obtenerPoeta( id ) {
        return solicitarJson( config.poetasUrl + '/' + encodeURIComponent( id ), { _embed: 1 } );
    }

    function obtenerPoemasDePoeta( id ) {
        return obtenerColeccionCompleta( config.poemasUrl, {
            poeta_id: id, _embed: 1, orderby: 'date', order: 'asc'
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
