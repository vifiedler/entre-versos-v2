/**
 * Entre Versos · Presentación del contenido
 * Rellena las plantillas HTML existentes con datos de WordPress/SCF.
 * No inicializa Slick, mark.js, GSAP, Atropos ni drag & drop.
 */
( function() {
    'use strict';

    var api = window.EntreVersosRest;

    if ( ! api ) {
        return;
    }

    function crearTexto( etiqueta, clase, contenido ) {
        var elemento = document.createElement( etiqueta );
        if ( clase ) {
            elemento.className = clase;
        }
        elemento.textContent = contenido == null ? '' : String( contenido );
        return elemento;
    }

    function textoPlano( html ) {
        var contenedor = document.createElement( 'div' );
        contenedor.innerHTML = String( html || '' );
        return ( contenedor.textContent || '' ).trim();
    }

    function tituloEntrada( entrada ) {
        return textoPlano( entrada && entrada.title && entrada.title.rendered );
    }

    function resumenEntrada( entrada ) {
        return textoPlano( entrada && entrada.excerpt && entrada.excerpt.rendered );
    }

    function metadatos( entrada ) {
        return entrada && entrada.acf && typeof entrada.acf === 'object' ? entrada.acf : {};
    }

    function anioDeFecha( fecha ) {
        var valor = String( fecha || '' ).trim();
        var encontrado;

        if ( /^\d{8}$/.test( valor ) ) {
            return valor.slice( 0, 4 );
        }
        encontrado = valor.match( /\b\d{4}\b/ );
        return encontrado ? encontrado[ 0 ] : '';
    }

    function detallePoeta( entrada ) {
        var campos = metadatos( entrada );
        var origen = String( campos.pais_origen || campos.lugar_nacimiento || '' ).trim();
        var nacido = anioDeFecha( campos.fecha_nacimiento );
        var fallecido = anioDeFecha( campos.fecha_fallecimiento );
        var fechas = nacido ? nacido + ( fallecido ? '–' + fallecido : '–' ) : '';

        return [ origen, fechas ].filter( Boolean ).join( ' · ' );
    }

    function urlImagen( medio ) {
        if ( ! medio ) {
            return '';
        }
        if ( typeof medio === 'string' ) {
            return /^https?:\/\//.test( medio ) ? medio : '';
        }
        if ( medio.media_details && medio.media_details.sizes ) {
            var tamanios = medio.media_details.sizes;
            if ( tamanios.large && tamanios.large.source_url ) {
                return tamanios.large.source_url;
            }
            if ( tamanios.medium_large && tamanios.medium_large.source_url ) {
                return tamanios.medium_large.source_url;
            }
            if ( tamanios.medium && tamanios.medium.source_url ) {
                return tamanios.medium.source_url;
            }
        }
        if ( medio.sizes ) {
            var tamanosScf = medio.sizes;
            if ( tamanosScf.large ) {
                return typeof tamanosScf.large === 'string' ? tamanosScf.large : tamanosScf.large.url || '';
            }
            if ( tamanosScf.medium_large ) {
                return typeof tamanosScf.medium_large === 'string' ? tamanosScf.medium_large : tamanosScf.medium_large.url || '';
            }
        }
        return medio.source_url || medio.url || '';
    }

    function recursoImagen( imagen ) {
        if ( ! imagen ) {
            return Promise.resolve( null );
        }
        if ( typeof imagen === 'object' ) {
            return Promise.resolve( imagen );
        }
        if ( typeof imagen === 'string' && /^https?:\/\//.test( imagen ) ) {
            return Promise.resolve( { url: imagen } );
        }
        return api.obtenerMedio( imagen );
    }

    function imagenDestacada( entrada ) {
        var incrustados = entrada && entrada._embedded && entrada._embedded[ 'wp:featuredmedia' ];

        if ( Array.isArray( incrustados ) && incrustados.length ) {
            return Promise.resolve( incrustados[ 0 ] );
        }
        return recursoImagen( entrada && entrada.featured_media );
    }

    function mostrarImagen( contenedor, recurso, alternativo, claseImagen ) {
        var imagen;
        var ruta = urlImagen( recurso );

        if ( ! contenedor || ! ruta ) {
            return;
        }
        imagen = document.createElement( 'img' );
        imagen.src = ruta;
        imagen.alt = ( recurso && ( recurso.alt_text || recurso.alt ) ) || alternativo || '';
        imagen.loading = 'lazy';
        if ( claseImagen ) {
            imagen.className = claseImagen;
        }
        contenedor.replaceChildren( imagen );
    }

    function cargarFotografia( entrada, contenedor, claseImagen ) {
        imagenDestacada( entrada ).then( function( imagen ) {
            mostrarImagen( contenedor, imagen, tituloEntrada( entrada ), claseImagen );
        } ).catch( function( error ) {
            console.warn( 'No se pudo cargar la fotografía del poeta:', error );
        } );
    }

    // Portada: sustituye únicamente las fotografías de ejemplo por registros reales.
    // Una Polaroid solo muestra la fotografía y el nombre del poeta.
    function crearTarjetaPoeta( entrada, indice, plantilla ) {
        var posiciones = [ 'primera', 'segunda', 'tercera', 'cuarta', 'quinta' ];
        var fragmento = plantilla.content.cloneNode( true );
        var marco = fragmento.querySelector( '.posicion-polaroid' );
        var imagen = fragmento.querySelector( '.tarjeta-polaroid__foto' );
        var nombre = fragmento.querySelector( '.tarjeta-polaroid__nombre' );
        var foto = fragmento.querySelector( '.tarjeta-polaroid__imagen' );

        marco.dataset.poetaId = String( entrada.id );
        marco.dataset.poetaUrl = entrada.link || '';
        marco.classList.add( 'tarjeta-polaroid--' + posiciones[ indice % posiciones.length ] );
        nombre.textContent = tituloEntrada( entrada );
        if ( foto ) { foto.remove(); }
        if ( imagen ) { imagen.appendChild( crearTexto( 'i', 'bi bi-person-bounding-box', '' ) ); }
        cargarFotografia( entrada, imagen );
        return fragmento;
    }

    function cargarGaleria() {
        var galeria = document.getElementById( 'galeria-poetas' );
        var plantilla = document.getElementById( 'plantilla-tarjeta-poeta' );
        var cantidad = document.getElementById( 'cantidad-poetas' );

        if ( ! galeria || ! plantilla ) {
            return;
        }
        api.obtenerPoetas().then( function( poetas ) {
            var total = Array.isArray( poetas ) ? poetas.length : 0;
            var fragmento = document.createDocumentFragment();

            if ( ! total ) {
                galeria.replaceChildren( crearTexto( 'p', 'fuente-mono', 'Todavía no hay poetas publicados.' ) );
                return;
            }
            poetas.forEach( function( poeta, indice ) {
                fragmento.appendChild( crearTarjetaPoeta( poeta, indice, plantilla ) );
            } );
            galeria.replaceChildren( fragmento );
            if ( cantidad ) {
                cantidad.textContent = String( total ).padStart( 2, '0' ) + ( total === 1 ? ' poeta en sala' : ' poetas en sala' );
            }
        } ).catch( function( error ) {
            console.error( 'Error al cargar poetas desde REST:', error );
            galeria.replaceChildren( crearTexto( 'p', 'fuente-mono', 'No fue posible cargar los poetas desde WordPress.' ) );
        } );
    }

    function actualizarTexto( selector, valor, raiz ) {
        var elemento = ( raiz || document ).querySelector( selector );
        if ( elemento && valor != null ) {
            elemento.textContent = String( valor );
        }
    }

    // Se muestra la biografía completa de Gutenberg desde la carga inicial.
    function actualizarPoeta( raiz, entrada ) {
        var nombre = tituloEntrada( entrada );
        var descripcion = resumenEntrada( entrada );
        var detalles = detallePoeta( entrada );
        var textoBiografia = raiz.querySelector( '#contenido-biografia' );

        actualizarTexto( '.vista-poeta__titulo', nombre, raiz );
        actualizarTexto( '.pantallas-poeta__contexto .pantallas-poeta__descripcion', descripcion, raiz );
        actualizarTexto( '.pantallas-poeta__origen', detalles, raiz );
        if ( textoBiografia && entrada.content && entrada.content.rendered ) {
            textoBiografia.innerHTML = entrada.content.rendered;
        }
        cargarFotografia( entrada, raiz.querySelector( '.pantallas-poeta__imagen' ) );
    }

    function crearPantallaPoema( poema, indice ) {
        var tarjeta = document.createElement( 'section' );
        var etiqueta = crearTexto( 'span', 'etiqueta-editorial', '0' + ( indice + 2 ) + ' / Poema' );
        var subtitulo = crearTexto( 'h2', 'pantallas-poeta__subtitulo', tituloEntrada( poema ) );
        var descripcion = crearTexto( 'p', 'pantallas-poeta__descripcion', resumenEntrada( poema ) );
        var campos = metadatos( poema );
        var datos = crearTexto( 'p', 'fuente-mono mt-auto', [ campos.obra_origen, campos.anio_publicacion ].filter( Boolean ).join( ' · ' ) );
        var enlace = document.createElement( 'a' );

        tarjeta.className = 'pantallas-poeta__tarjeta tarjeta-editorial pantallas-poeta__obra';
        tarjeta.dataset.poemaId = String( poema.id );
        enlace.className = 'boton-editorial boton-editorial--primario align-self-start mt-3';
        enlace.href = poema.link || '#';
        enlace.textContent = 'Leer poema →';
        tarjeta.appendChild( etiqueta );
        tarjeta.appendChild( subtitulo );
        if ( descripcion.textContent ) {
            tarjeta.appendChild( descripcion );
        }
        if ( datos.textContent ) {
            tarjeta.appendChild( datos );
        }
        tarjeta.appendChild( enlace );

        return tarjeta;
    }

    function mostrarObras( raiz, poemas ) {
        var listado = raiz.querySelector( '#contenido-obras' );
        var fragmento = document.createDocumentFragment();

        if ( ! listado ) {
            return;
        }
        if ( ! Array.isArray( poemas ) || ! poemas.length ) {
            listado.replaceChildren( crearTexto( 'span', 'fuente-mono', 'Aún no hay poemas publicados para este poeta.' ) );
            return;
        }
        poemas.forEach( function( poema, indice ) {
            var enlace = document.createElement( 'a' );
            enlace.className = 'boton-editorial boton-editorial--compacto';
            enlace.href = poema.link || '#';
            enlace.textContent = tituloEntrada( poema );
            fragmento.appendChild( enlace );
        } );
        listado.replaceChildren( fragmento );
        // La navegación a cada obra es mediante los botones del índice; Slick queda pendiente.
    }

    function cargarFichaPoeta() {
        var raiz = document.querySelector( '.vista-poeta[data-poeta-id]' );
        var id;

        if ( ! raiz ) {
            return;
        }
        id = Number( raiz.dataset.poetaId );
        Promise.all( [ api.obtenerPoeta( id ), api.obtenerPoemasDePoeta( id ) ] ).then( function( resultados ) {
            actualizarPoeta( raiz, resultados[ 0 ] );
            mostrarObras( raiz, resultados[ 1 ] );
        } ).catch( function( error ) {
            console.error( 'Error al cargar la ficha del poeta:', error );
            actualizarTexto( '#contenido-obras', 'No fue posible cargar las obras mediante REST.', raiz );
        } );
    }

    function extraerVersos( estrofa ) {
        var texto = String( estrofa.texto_estrofa || '' );
        var palabras = String( estrofa.palabras_clave || '' ).replace( /\r\n?/g, '\n' ).split( '\n' );
        var lineas = texto.replace( /\r\n?/g, '\n' ).split( '\n' );

        // Compatibilidad de lectura con las primeras entradas aún en el formato viejo.
        if ( ! texto.trim() && Array.isArray( estrofa.versos ) ) {
            return estrofa.versos.map( function( verso ) {
                return { texto: verso.texto_verso || '', clave: verso.palabra_clave || '' };
            } );
        }
        return lineas.map( function( linea, indice ) {
            return { texto: linea, clave: String( palabras[ indice ] || '' ).trim() };
        } );
    }

    function textoConResaltado( contenedor, verso ) {
        var texto = String( verso.texto || '' );
        var clave = String( verso.clave || '' ).trim();
        var posicion;
        var destacado;

        if ( ! clave || clave === '-' ) {
            contenedor.textContent = texto;
            return;
        }
        posicion = texto.toLocaleLowerCase( 'es' ).indexOf( clave.toLocaleLowerCase( 'es' ) );
        if ( posicion < 0 ) {
            contenedor.textContent = texto;
            return;
        }
        contenedor.appendChild( document.createTextNode( texto.slice( 0, posicion ) ) );
        destacado = document.createElement( 'mark' );
        destacado.textContent = texto.slice( posicion, posicion + clave.length );
        contenedor.appendChild( destacado );
        contenedor.appendChild( document.createTextNode( texto.slice( posicion + clave.length ) ) );
    }

    function cargarVersos( raiz, estrofa ) {
        var listado = raiz.querySelector( '#lista-versos' );
        var fragmento = document.createDocumentFragment();

        if ( ! listado ) {
            return;
        }
        extraerVersos( estrofa ).forEach( function( verso, indice ) {
            var li = document.createElement( 'li' );
            var numero = crearTexto( 'span', 'lector-estrofas__verso-numero', String( indice + 1 ).padStart( 2, '0' ) );
            var contenido = document.createElement( 'span' );
            li.className = 'lector-estrofas__verso';
            li.appendChild( numero );
            textoConResaltado( contenido, verso );
            li.appendChild( contenido );
            fragmento.appendChild( li );
        } );
        listado.replaceChildren( fragmento );
    }

    function cargarVisualEstrofa( raiz, estrofa ) {
        var contenedor = raiz.querySelector( '#imagen-estrofa' );
        var etiqueta = raiz.querySelector( '#estrofa-recurso figcaption' );
        if ( ! contenedor ) {
            return;
        }
        recursoImagen( estrofa.imagen_estrofa ).then( function( recurso ) {
            mostrarImagen( contenedor, recurso, 'Ilustración asociada a la primera estrofa' );
        } ).catch( function( error ) {
            console.warn( 'No se pudo recuperar la imagen de la estrofa:', error );
        } );
        if ( etiqueta ) {
            var figura = etiqueta.querySelector( '.etiqueta-editorial' );
            if ( figura ) {
                figura.textContent = 'FIG. 01';
            }
        }
    }

    function prepararLecturaCompleta( raiz, estrofas ) {
        var contenedor = raiz.querySelector( '#lectura-continua-estrofas' );
        var fragmento = document.createDocumentFragment();

        if ( ! contenedor ) {
            return;
        }
        estrofas.forEach( function( estrofa, indice ) {
            var seccion = document.createElement( 'section' );
            seccion.className = 'lectura-continua__estrofa';
            seccion.appendChild( crearTexto( 'p', 'fuente-mono', 'Estrofa ' + String( indice + 1 ).padStart( 2, '0' ) ) );
            extraerVersos( estrofa ).forEach( function( verso ) {
                var parrafo = document.createElement( 'p' );
                parrafo.className = 'mb-1';
                textoConResaltado( parrafo, verso );
                seccion.appendChild( parrafo );
            } );
            fragmento.appendChild( seccion );
        } );
        contenedor.replaceChildren( fragmento );
        // La vista sigue oculta: su apertura se implementará con la navegación.
    }

    function actualizarPoema( raiz, poema ) {
        var campos = metadatos( poema );
        var estrofas = Array.isArray( campos.estrofas ) ? campos.estrofas : [];
        var titulo = tituloEntrada( poema );
        var datoPublicacion = [ campos.obra_origen, campos.anio_publicacion ].filter( Boolean ).join( ' · ' );
        var destinoImagen = raiz.querySelector( '#poema-cierre .poema-cierre__imagen' );

        actualizarTexto( '#titulo-poema', titulo, raiz );
        actualizarTexto( '#titulo-lectura-continua', titulo, raiz );
        actualizarTexto( '#titulo-cierre-poema', titulo, raiz );
        if ( datoPublicacion ) {
            actualizarTexto( '.lector-estrofas__cabecera .fuente-mono', datoPublicacion, raiz );
        }
        if ( estrofas.length ) {
            actualizarTexto( '#contador-estrofas', 'Estrofa 01 / ' + String( estrofas.length ).padStart( 2, '0' ), raiz );
            cargarVersos( raiz, estrofas[ 0 ] );
            cargarVisualEstrofa( raiz, estrofas[ 0 ] );
            prepararLecturaCompleta( raiz, estrofas );
        } else {
            actualizarTexto( '#lista-versos', 'Aún no hay estrofas publicadas en SCF.', raiz );
        }
        imagenDestacada( poema ).then( function( medio ) {
            mostrarImagen( destinoImagen, medio, 'Imagen de cierre del poema ' + titulo );
        } ).catch( function( error ) {
            console.warn( 'No fue posible cargar la imagen final:', error );
        } );

        var idPoeta = campos.poeta_relacionado && typeof campos.poeta_relacionado === 'object' ?
            campos.poeta_relacionado.ID || campos.poeta_relacionado.id : campos.poeta_relacionado;
        if ( idPoeta ) {
            api.obtenerPoeta( idPoeta ).then( function( poeta ) {
                var nombre = tituloEntrada( poeta );
                actualizarTexto( '.vista-poema__metadatos .fuente-mono', nombre, raiz );
                actualizarTexto( '#lectura-continua > .fuente-mono', nombre, raiz );
                actualizarTexto( '#poema-cierre > .fuente-mono', nombre, raiz );
            } ).catch( function( error ) {
                console.warn( 'No fue posible actualizar el nombre del autor:', error );
            } );
        }
    }

    function cargarFichaPoema() {
        var raiz = document.querySelector( '.vista-poema[data-poema-id]' );
        if ( ! raiz ) {
            return;
        }
        api.obtenerPoema( Number( raiz.dataset.poemaId ) ).then( function( poema ) {
            actualizarPoema( raiz, poema );
        } ).catch( function( error ) {
            console.error( 'Error al cargar las estrofas desde REST:', error );
            actualizarTexto( '#lista-versos', 'No fue posible cargar el poema desde WordPress.', raiz );
        } );
    }

    function iniciarCarga() {
        cargarGaleria();
        cargarFichaPoeta();
        cargarFichaPoema();
    }

    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', iniciarCarga );
    } else {
        iniciarCarga();
    }
}() );
