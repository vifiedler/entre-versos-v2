/**
 * Entre Versos · Hub del poeta
 * Carrusel Slick + vistas ampliadas Bootstrap, alimentadas por WordPress REST API.
 * La portada se conserva en el DOM: la experiencia no recarga el documento.
 */
( function() {
    'use strict';

    var api = window.EntreVersosRest;
    var $ = window.jQuery;
    var hub = document.getElementById( 'vista-hub-poeta' );
    var inicio = document.getElementById( 'seleccion-poetas' );
    var carrusel = document.getElementById( 'carrusel-hub-poeta' );
    var modalElemento = document.getElementById( 'modal-hub-contenido' );
    var modal = null;
    var ultimoControl = null;
    var scrollEstrofasPendiente = false;
    var navegacionHub = hub && hub.querySelector( '.hub-poeta__navegacion' );
    // Reserva el lugar original para alinear las flechas incluso dentro del modal.
    var posicionNavegacion = navegacionHub ? document.createElement( 'div' ) : null;
    var animacionCarrusel = 0;
    var ultimoIndiceEnCentro = -1;
    var pausaManual = false;
    var indiceVisible = 0;
    var transicionManual = false;
    var DURACION_AUTOMATICA = 10000;
    var DURACION_MANUAL = 3000;

    if ( navegacionHub ) {
        posicionNavegacion.className = 'hub-poeta__reserva-navegacion';
        posicionNavegacion.hidden = true;
        posicionNavegacion.setAttribute( 'aria-hidden', 'true' );
        navegacionHub.parentNode.insertBefore( posicionNavegacion, navegacionHub );
    }
    var estado = { poeta: null, poemas: [], pantallas: [], pantallaActual: 0, poema: null, estrofas: [], estrofa: 0, continua: false, solicitud: 0, visual: 0 };

    if ( ! api || ! hub || ! inicio || ! carrusel || ! modalElemento ) { return; }

    // Normalizar índices para que las flechas puedan volver del último al primero.
    function normalizarIndice( indice, total ) {
        return total ? ( ( indice % total ) + total ) % total : 0;
    }
    function reducirMovimiento() {
        return !!( window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches );
    }
    function buscar( selector ) { return document.querySelector( selector ); }
    function escribir( selector, texto ) {
        var nodo = buscar( selector );
        if ( nodo ) { nodo.textContent = texto == null ? '' : String( texto ); }
    }
    function textoPlano( html ) {
        var contenedor = document.createElement( 'div' );
        contenedor.innerHTML = String( html || '' );
        return ( contenedor.textContent || '' ).trim();
    }
    function titulo( entrada ) { return textoPlano( entrada && entrada.title && entrada.title.rendered ); }
    function resumen( entrada ) { return textoPlano( entrada && entrada.excerpt && entrada.excerpt.rendered ); }
    function campos( entrada ) { return entrada && entrada.acf && typeof entrada.acf === 'object' ? entrada.acf : {}; }
    function elementoTexto( etiqueta, clase, texto ) {
        var elemento = document.createElement( etiqueta );
        if ( clase ) { elemento.className = clase; }
        elemento.textContent = texto == null ? '' : String( texto );
        return elemento;
    }
    function anio( fecha ) {
        var texto = String( fecha || '' );
        var hallado = texto.match( /\d{4}/ );
        return hallado ? hallado[ 0 ] : '';
    }
    function detalle( poeta ) {
        var datos = campos( poeta );
        var nacimiento = anio( datos.fecha_nacimiento );
        var fallecimiento = anio( datos.fecha_fallecimiento );
        return [ datos.pais_origen, nacimiento ? nacimiento + ( fallecimiento ? '–' + fallecimiento : '–' ) : '' ].filter( Boolean ).join( ' · ' );
    }
    function fuenteImagen( medio ) {
        if ( ! medio ) { return ''; }
        if ( typeof medio === 'string' ) { return /^https?:\/\//.test( medio ) ? medio : ''; }
        var tamanios = medio.media_details && medio.media_details.sizes;
        if ( tamanios ) {
            for ( var nombre of [ 'large', 'medium_large', 'medium' ] ) {
                if ( tamanios[ nombre ] && tamanios[ nombre ].source_url ) { return tamanios[ nombre ].source_url; }
            }
        }
        if ( medio.sizes ) {
            for ( var clave of [ 'large', 'medium_large', 'medium' ] ) {
                if ( medio.sizes[ clave ] ) {
                    return typeof medio.sizes[ clave ] === 'string' ? medio.sizes[ clave ] : medio.sizes[ clave ].url || '';
                }
            }
        }
        return medio.source_url || medio.url || '';
    }
    function buscarImagen( referencia ) {
        if ( ! referencia ) { return Promise.resolve( null ); }
        if ( typeof referencia === 'object' ) { return Promise.resolve( referencia ); }
        if ( typeof referencia === 'string' && /^https?:\/\//.test( referencia ) ) { return Promise.resolve( { url: referencia } ); }
        return api.obtenerMedio( referencia ).catch( function() { return null; } );
    }
    function imagenEntrada( entrada ) {
        var adjuntos = entrada && entrada._embedded && entrada._embedded[ 'wp:featuredmedia' ];
        return Array.isArray( adjuntos ) && adjuntos.length ? Promise.resolve( adjuntos[ 0 ] ) : buscarImagen( entrada && entrada.featured_media );
    }
    function colocarImagen( contenedor, medio, textoAlternativo ) {
        if ( ! contenedor ) { return; }
        var src = fuenteImagen( medio );
        contenedor.replaceChildren();
        if ( ! src ) {
            contenedor.appendChild( elementoTexto( 'i', 'bi bi-image', '' ) );
            return;
        }
        var img = document.createElement( 'img' );
        img.src = src;
        img.alt = medio && ( medio.alt_text || medio.alt ) || textoAlternativo || '';
        img.loading = 'lazy';
        contenedor.appendChild( img );
    }

    function ponerRuta( contenido ) {
        var nombrePoeta = document.getElementById( 'miga-poeta-nombre' );
        var nombreContenido = document.getElementById( 'miga-contenido' );
        if ( nombrePoeta ) { nombrePoeta.textContent = estado.poeta ? titulo( estado.poeta ) : ''; }
        if ( nombreContenido ) { nombreContenido.textContent = contenido || 'Obras'; }
    }
    function mostrarHub() {
        inicio.hidden = true;
        hub.hidden = false;
        document.body.classList.add( 'modo-hub' );
        var navegacion = document.getElementById( 'navegacion-contextual' );
        if ( navegacion ) { navegacion.hidden = false; }
        ponerRuta( 'Obras' );
    }
    function limpiarCarrusel() {
        detenerSeguimientoCarrusel();
        transicionManual = false;
        if ( $ && $.fn.slick && $( carrusel ).hasClass( 'slick-initialized' ) ) {
            $( carrusel ).off( '.hub' ).slick( 'unslick' );
        }
        carrusel.replaceChildren();
    }
    function detenerMusica() {
        if ( window.EntreVersosAudio && typeof window.EntreVersosAudio.detener === 'function' ) {
            window.EntreVersosAudio.detener();
        }
    }
    function volverInicio( actualizarHistorial ) {
        estado.solicitud++;
        estado.poeta = null;
        estado.poemas = [];
        limpiarCarrusel();
        if ( modal && modalElemento.classList.contains( 'show' ) ) { modal.hide(); }
        hub.hidden = true;
        inicio.hidden = false;
        document.body.classList.remove( 'modo-hub' );
        var navegacion = document.getElementById( 'navegacion-contextual' );
        if ( navegacion ) { navegacion.hidden = true; }
        detenerMusica();
        if ( actualizarHistorial ) {
            try { window.history.pushState( { entreVersos: 'inicio' }, '', window.location.pathname + window.location.search ); }
            catch ( error ) { console.warn( 'Historial no disponible en esta vista previa.', error ); }
        }
    }
    // Cada slide contiene una previsualización completa del documento, no una tarjeta-resumen.
    // Su superficie es seleccionable, pero los controles de lectura solo se activan al ampliarlo.
    function construirVistaBiografia( poeta, medio ) {
        var vista = elementoTexto( 'div', 'hub-poeta__vista hub-poeta__vista--bio', '' );
        var cabecera = elementoTexto( 'header', 'hub-poeta__vista-encabezado', '' );
        cabecera.appendChild( elementoTexto( 'span', 'etiqueta-editorial', 'Biografía y obras' ) );
        cabecera.appendChild( elementoTexto( 'h2', 'hub-poeta__vista-titulo', titulo( poeta ) ) );

        var columnas = elementoTexto( 'div', 'hub-poeta__bio-columnas', '' );
        var contexto = elementoTexto( 'section', 'hub-poeta__bio-contexto', '' );
        contexto.appendChild( elementoTexto( 'span', 'etiqueta-editorial', 'Vida y contexto' ) );
        contexto.appendChild( elementoTexto( 'p', 'hub-poeta__bio-extracto', resumen( poeta ) ) );
        contexto.appendChild( elementoTexto( 'small', 'fuente-mono', detalle( poeta ) ) );

        var dossier = elementoTexto( 'section', 'hub-poeta__bio-dossier', '' );
        dossier.appendChild( elementoTexto( 'span', 'etiqueta-editorial', 'Expediente biográfico' ) );
        var cuerpo = elementoTexto( 'div', 'hub-poeta__bio-detalle', '' );
        var retrato = elementoTexto( 'figure', 'hub-poeta__bio-retrato', '' );
        var foto = elementoTexto( 'div', 'hub-poeta__bio-foto', '' );
        colocarImagen( foto, medio, 'Retrato de ' + titulo( poeta ) );
        retrato.appendChild( foto );
        retrato.appendChild( elementoTexto( 'figcaption', 'fuente-mono', 'Retrato del poeta' ) );

        var textoBiografico = elementoTexto( 'div', 'hub-poeta__bio-texto', '' );
        // Contenido editorial de Gutenberg obtenido mediante WordPress REST API.
        textoBiografico.innerHTML = poeta.content && poeta.content.rendered || '';
        if ( ! textoBiografico.textContent.trim() ) {
            textoBiografico.textContent = resumen( poeta ) || 'Biografía pendiente de publicación.';
        }
        cuerpo.append( retrato, textoBiografico );
        dossier.appendChild( cuerpo );
        columnas.append( contexto, dossier );
        vista.append( cabecera, columnas );
        return vista;
    }

    function construirVistaPoema( poema ) {
        var vista = elementoTexto( 'div', 'hub-poeta__vista hub-poeta__vista--poema', '' );
        var cabecera = elementoTexto( 'header', 'hub-poeta__vista-encabezado', '' );
        cabecera.appendChild( elementoTexto( 'span', 'etiqueta-editorial', 'Lectura por estrofas' ) );
        cabecera.appendChild( elementoTexto( 'h2', 'hub-poeta__vista-titulo', titulo( poema ) ) );
        vista.appendChild( cabecera );

        var estrofas = Array.isArray( campos( poema ).estrofas ) ? campos( poema ).estrofas : [];
        var envoltura = elementoTexto( 'div', 'hub-poeta__poema-documento', '' );
        var encabezado = elementoTexto( 'div', 'hub-poeta__poema-cinta fuente-mono', '' );
        encabezado.appendChild( elementoTexto( 'span', 'etiqueta-editorial', 'Estrofas ' + String( estrofas.length ).padStart( 2, '0' ) ) );
        encabezado.appendChild( elementoTexto( 'span', '', campos( poema ).obra_origen || '' ) );
        envoltura.appendChild( encabezado );

        var secuencia = elementoTexto( 'div', 'hub-poeta__poema-secuencia', '' );
        estrofas.forEach( function( estrofa, indice ) {
            var fila = elementoTexto( 'section', 'hub-poeta__poema-estrofa', '' );
            var texto = elementoTexto( 'div', 'hub-poeta__poema-versos', '' );
            texto.appendChild( elementoTexto( 'span', 'etiqueta-editorial', 'Estrofa ' + String( indice + 1 ).padStart( 2, '0' ) ) );
            var versos = elementoTexto( 'div', 'hub-poeta__poema-versos-contenido', '' );
            versosEn( versos, estrofa, true );
            texto.appendChild( versos );
            var imagen = elementoTexto( 'div', 'hub-poeta__poema-imagen', '' );
            colocarImagen( imagen, null, 'Imagen de la estrofa ' + ( indice + 1 ) );
            // En la segunda estrofa, se invierte la posición del recurso visual.
            if ( indice % 2 ) { fila.classList.add( 'hub-poeta__poema-estrofa--invertida' ); }
            fila.append( texto, imagen );
            secuencia.appendChild( fila );
            buscarImagen( estrofa.imagen_estrofa ).then( function( medio ) {
                if ( imagen.isConnected ) {
                    colocarImagen( imagen, medio, 'Imagen de la estrofa ' + ( indice + 1 ) );
                }
            } );
        } );
        if ( ! estrofas.length ) {
            secuencia.appendChild( elementoTexto( 'p', 'p-3', 'El poema todavía no tiene estrofas.' ) );
        }
        envoltura.appendChild( secuencia );
        vista.appendChild( envoltura );
        return vista;
    }

    function crearTarjeta( tipo, entrada, indice, medio ) {
        var exterior = elementoTexto( 'div', 'hub-poeta__pantalla', '' );
        var tarjeta = elementoTexto( 'article', 'hub-poeta__tarjeta tarjeta-editorial', '' );
        var documento = tipo === 'bio'
            ? construirVistaBiografia( entrada, medio )
            : construirVistaPoema( entrada );
        documento.setAttribute( 'aria-hidden', 'true' );
        documento.inert = true;

        var abrir = elementoTexto( 'button', 'hub-poeta__abrir-pantalla', '' );
        abrir.type = 'button';
        abrir.dataset.tipo = tipo;
        abrir.dataset.id = String( entrada.id );
        abrir.dataset.indice = String( indice );
        abrir.setAttribute( 'aria-label', 'Ampliar ' + ( tipo === 'bio' ? 'biografía de ' : 'poema ' ) + titulo( entrada ) );
        abrir.appendChild( elementoTexto( 'span', 'hub-poeta__abrir fuente-mono', 'Abrir pantalla ↗' ) );

        tarjeta.append( documento, abrir );
        exterior.appendChild( tarjeta );
        return exterior;
    }

    function actualizarIndicador( indice ) {
        indiceVisible = normalizarIndice( indice, estado.pantallas.length );
        var total = estado.pantallas.length;
        escribir( '#hub-indicador', String( indice + 1 ).padStart( 2, '0' ) + ' / ' + String( total ).padStart( 2, '0' ) );
        document.getElementById( 'hub-anterior' ).disabled = total <= 1;
        document.getElementById( 'hub-siguiente' ).disabled = total <= 1;
    }
    // La activación NO depende de .slick-center: Slick asigna esa clase
    // antes de terminar la animación, cuando la tarjeta aún está lejos.
    // Calculamos escala e inclinación usando la posición visible real.
    function detenerSeguimientoCarrusel() {
        if ( animacionCarrusel ) {
            window.cancelAnimationFrame( animacionCarrusel );
            animacionCarrusel = 0;
        }
        ultimoIndiceEnCentro = -1;
    }

    function seguimientoCarrusel() {
        if ( hub.hidden || !$ || !$.fn.slick || !$( carrusel ).hasClass( 'slick-initialized' ) ) {
            animacionCarrusel = 0;
            return;
        }

        var ancho = carrusel.getBoundingClientRect();
        var centro = ancho.left + ancho.width / 2;
        var slides = carrusel.querySelectorAll( '.slick-slide' );
        var candidato = null;
        var distanciaCandidata = Infinity;
        var indiceCandidato = -1;

        slides.forEach( function( slide ) {
            var rect = slide.getBoundingClientRect();
            if ( ! rect.width || rect.right < ancho.left || rect.left > ancho.right ) { return; }

            // Zona central de un slide. La transición visual avanza entre
            // el 25 % y el 75 % del área de coincidencia.
            var mitad = rect.width / 2;
            var zonaIzquierda = centro - mitad;
            var zonaDerecha = centro + mitad;
            var solapamiento = Math.max( 0,
                Math.min( rect.right, zonaDerecha ) - Math.max( rect.left, zonaIzquierda )
            );
            var distancia = Math.abs( ( rect.left + rect.right ) / 2 - centro );

            var porcentaje = solapamiento / rect.width;
            var progreso = Math.max( 0, Math.min( 1, ( porcentaje - 0.25 ) / 0.50 ) );
            var factor = ( rect.left + rect.right ) / 2 < centro ? -1 : 1;
            var tarjeta = slide.querySelector( '.hub-poeta__tarjeta' );
            if ( tarjeta ) {
                // Al acercarse al centro, la tarjeta crece y se endereza.
                // Al alejarse, se achica y se inclina hacia el lado contrario.
                tarjeta.style.setProperty( '--hub-escala', ( .77 + .23 * progreso ).toFixed( 4 ) );
                tarjeta.style.setProperty( '--hub-giro', ( factor * ( 1 - progreso ) * 11 ).toFixed( 3 ) + 'deg' );
                tarjeta.style.setProperty( '--hub-rotacion', ( factor * ( 1 - progreso ) * 2.5 ).toFixed( 3 ) + 'deg' );
                tarjeta.style.setProperty( '--hub-opacidad', ( .48 + .52 * progreso ).toFixed( 3 ) );
            }

            slide.classList.remove( 'es-central' );
            if ( solapamiento >= rect.width * 0.25 && distancia < distanciaCandidata ) {
                candidato = slide;
                distanciaCandidata = distancia;
                indiceCandidato = Number( slide.getAttribute( 'data-slick-index' ) );
            }
        } );

        if ( candidato ) {
            candidato.classList.add( 'es-central' );
            var total = estado.pantallas.length;
            if ( total && Number.isFinite( indiceCandidato ) ) {
                var indiceReal = ( ( indiceCandidato % total ) + total ) % total;
                if ( indiceReal !== ultimoIndiceEnCentro ) {
                    ultimoIndiceEnCentro = indiceReal;
                    actualizarIndicador( indiceReal );
                }
            }
        }

        animacionCarrusel = window.requestAnimationFrame( seguimientoCarrusel );
    }

    function iniciarSeguimientoCarrusel() {
        detenerSeguimientoCarrusel();
        if ( $ && $.fn.slick && $( carrusel ).hasClass( 'slick-initialized' ) ) {
            animacionCarrusel = window.requestAnimationFrame( seguimientoCarrusel );
        }
    }

    // El autoplay es deliberadamente lento. Los saltos manuales usan
    // otra ruta para no depender de transiciones de 10 segundos.
    function opcionesCarrusel( total, inicial, reproducir, animacionManual ) {
        var mostrarTres = total > 3;
        return {
            centerMode: true,
            centerPadding: mostrarTres ? '40px' : '23%',
            slidesToShow: mostrarTres ? 3 : 1,
            slidesToScroll: 1,
            infinite: true,
            initialSlide: inicial || 0,
            arrows: false, // Las flechas del hub tienen sus propios eventos.
            dots: false,
            accessibility: true,
            focusOnSelect: false,
            speed: animacionManual ? ( reducirMovimiento() ? 0 : DURACION_MANUAL ) : DURACION_AUTOMATICA,
            cssEase: animacionManual ? 'ease-in' : 'linear',
            autoplay: !!reproducir,
            autoplaySpeed: 0,
            pauseOnHover: false,
            pauseOnFocus: true,
            swipe: true,
            responsive: [
                { breakpoint: 1024, settings: { slidesToShow: 1, centerPadding: '18%' } },
                { breakpoint: 768, settings: { slidesToShow: 1, centerPadding: '13%' } },
                { breakpoint: 480, settings: { slidesToShow: 1, centerPadding: '8%' } }
            ]
        };
    }

    function actualizarBotonPausa() {
        var boton = document.getElementById( 'hub-pausa' );
        if ( !boton ) { return; }
        var modalAbierto = modalElemento.classList.contains( 'show' );
        boton.hidden = modalAbierto;
        boton.disabled = estado.pantallas.length <= 1;
        boton.setAttribute( 'aria-pressed', String( pausaManual ) );
        boton.setAttribute( 'aria-label', pausaManual ? 'Reanudar carrusel' : 'Pausar carrusel' );
        var icono = boton.querySelector( 'i' );
        if ( icono ) { icono.className = pausaManual ? 'bi bi-play-fill' : 'bi bi-pause-fill'; }
    }

    function montarCarrusel( poeta, poemas, medios ) {
        var entradas = [ { tipo: 'bio', entrada: poeta } ].concat( poemas.map( function( poema ) {
            return { tipo: 'poema', entrada: poema };
        } ) );
        var fragmento = document.createDocumentFragment();
        estado.pantallas = entradas;
        limpiarCarrusel();
        entradas.forEach( function( item, indice ) {
            fragmento.appendChild( crearTarjeta( item.tipo, item.entrada, indice, medios[ indice ] ) );
        } );
        carrusel.appendChild( fragmento );
        indiceVisible = 0;
        ultimoIndiceEnCentro = -1;
        pausaManual = reducirMovimiento() || entradas.length < 2;
        actualizarIndicador( 0 );
        actualizarBotonPausa();
        escribir( '#estado-hub-poeta', '' );

        if ( $ && $.fn.slick && entradas.length > 1 ) {
            $( carrusel ).on( 'afterChange.hub', function( evento, slick, indice ) {
                // El seguimiento del centro tiene prioridad durante el autoplay.
                if ( !animacionCarrusel ) { actualizarIndicador( indice ); }
            } );
            $( carrusel ).slick( opcionesCarrusel( entradas.length, 0, !pausaManual ) );
            iniciarSeguimientoCarrusel();
        }
    }
    function abrirPoeta( id, historial ) {
        var numero = Number( id );
        if ( ! Number.isInteger( numero ) || numero < 1 ) { return; }
        var token = ++estado.solicitud;
        mostrarHub();
        limpiarCarrusel();
        escribir( '#estado-hub-poeta', 'Cargando el archivo del poeta…' );
        if ( historial ) {
            try { window.history.pushState( { entreVersos: 'poeta', poetaId: numero }, '', '#poeta-' + numero ); }
            catch ( error ) { console.warn( 'Historial no disponible en esta vista previa.', error ); }
        }
        Promise.all( [ api.obtenerPoeta( numero ), api.obtenerPoemasDePoeta( numero ) ] ).then( function( datos ) {
            if ( token !== estado.solicitud ) { return; }
            var poeta = datos[ 0 ];
            var poemas = Array.isArray( datos[ 1 ] ) ? datos[ 1 ] : [];
            estado.poeta = poeta;
            estado.poemas = poemas;
            escribir( '#titulo-hub-poeta', titulo( poeta ) );
            escribir( '#datos-hub-poeta', detalle( poeta ) );
            ponerRuta( 'Obras' );
            if ( window.EntreVersosAudio && typeof window.EntreVersosAudio.activarPoeta === 'function' ) {
                window.EntreVersosAudio.activarPoeta( poeta );
            }
            return Promise.all( [ poeta ].concat( poemas ).map( imagenEntrada ) ).then( function( medios ) {
                if ( token !== estado.solicitud ) { return; }
                montarCarrusel( poeta, poemas, medios );
            } );
        } ).catch( function( error ) {
            if ( token !== estado.solicitud ) { return; }
            console.error( 'No se pudo cargar el hub del poeta:', error );
            escribir( '#estado-hub-poeta', 'No se pudo cargar el archivo. Puedes volver al inicio e intentarlo de nuevo.' );
        } );
    }

    // Mantiene las flechas y el contador en las mismas coordenadas que en el hub.
    // La reserva conserva la altura del carrusel mientras el modal está abierto.
    function actualizarPosicionNavegacionModal() {
        if ( !navegacionHub || !posicionNavegacion || posicionNavegacion.hidden ) { return; }
        if ( navegacionHub.parentNode !== modalElemento ) { return; }

        // Mientras el modal aún está oculto, su navegación mide 0 px.
        // En ese caso conservar la altura capturada antes de mover las flechas.
        var alturaVisible = navegacionHub.getBoundingClientRect().height;
        if ( alturaVisible > 0 ) {
            posicionNavegacion.style.height = alturaVisible + 'px';
        }
        var posicion = posicionNavegacion.getBoundingClientRect();
        navegacionHub.style.setProperty( '--hub-nav-modal-top', posicion.top + 'px' );
        navegacionHub.style.setProperty( '--hub-nav-modal-left', posicion.left + 'px' );
        navegacionHub.style.setProperty( '--hub-nav-modal-width', posicion.width + 'px' );
    }

    function moverFlechasAlModal() {
        if ( !navegacionHub || !posicionNavegacion ) { return; }
        if ( navegacionHub.parentNode === modalElemento ) {
            actualizarPosicionNavegacionModal();
            return;
        }

        // Medir antes de mover para evitar un salto en la composición original.
        posicionNavegacion.style.height = navegacionHub.getBoundingClientRect().height + 'px';
        posicionNavegacion.hidden = false;
        navegacionHub.classList.add( 'hub-poeta__navegacion--modal' );
        modalElemento.appendChild( navegacionHub );
        actualizarPosicionNavegacionModal();
    }

    function devolverFlechasAlHub() {
        if ( !navegacionHub || !posicionNavegacion || !posicionNavegacion.parentNode ) { return; }
        navegacionHub.classList.remove( 'hub-poeta__navegacion--modal' );
        posicionNavegacion.parentNode.insertBefore( navegacionHub, posicionNavegacion.nextSibling );
        posicionNavegacion.hidden = true;
        posicionNavegacion.style.height = '';
        [ '--hub-nav-modal-top', '--hub-nav-modal-left', '--hub-nav-modal-width' ].forEach( function( propiedad ) {
            navegacionHub.style.removeProperty( propiedad );
        } );
    }

    function mostrarModal( tipo, entrada ) {
        if ( ! window.bootstrap || ! window.bootstrap.Modal ) { return; }
        if ( ! modal ) { modal = window.bootstrap.Modal.getOrCreateInstance( modalElemento ); }
        if ( tipo === 'bio' ) {
            // Al volver desde un poema, devolver el scroll al cuerpo de la biografía.
            modalElemento.classList.remove( 'modal-hub--estrofas-scroll' );
            estado.continua = false;
        }
        buscar( '#modal-hub-biografia' ).hidden = tipo !== 'bio';
        buscar( '#modal-hub-poema' ).hidden = tipo !== 'poema';
        buscar( '#modal-hub-alternar-lectura' ).hidden = tipo !== 'poema';
        escribir( '#modal-hub-titulo', tipo === 'bio' ? titulo( estado.poeta ) : titulo( entrada ) );
        escribir( '#modal-hub-categoria', tipo === 'bio' ? 'Biografía' : 'Lectura poética' );
        ponerRuta( tipo === 'bio' ? 'Biografía' : titulo( entrada ) );
        // Detener el movimiento mientras se lee un contenido ampliado.
        controlarAutoplay( true );
        moverFlechasAlModal();
        modal.show();
        actualizarBotonPausa();
        buscar( '.modal-hub__cuerpo' ).scrollTop = 0;
    }
    function abrirBiografia() {
        var poeta = estado.poeta;
        if ( ! poeta ) { return; }
        escribir( '#modal-hub-resumen-biografia', resumen( poeta ) );
        escribir( '#modal-hub-detalle-biografia', detalle( poeta ) );
        escribir( '#modal-hub-datos-biografia', detalle( poeta ) );
        escribir( '#modal-hub-pie-biografia', 'Retrato de ' + titulo( poeta ) );
        var texto = buscar( '#modal-hub-texto-biografia' );
        // El HTML proviene del contenido Gutenberg filtrado por WordPress en REST API.
        texto.innerHTML = poeta.content && poeta.content.rendered || '';
        if ( ! texto.textContent.trim() ) { texto.textContent = resumen( poeta ) || 'Biografía pendiente de publicación.'; }
        mostrarModal( 'bio', poeta );
        imagenEntrada( poeta ).then( function( medio ) {
            if ( estado.poeta && estado.poeta.id === poeta.id ) {
                colocarImagen( buscar( '#modal-hub-foto-biografia' ), medio, titulo( poeta ) );
            }
        } );
    }
    function extraerVersos( estrofa ) {
        var texto = String( estrofa.texto_estrofa || '' );
        if ( ! texto.trim() && Array.isArray( estrofa.versos ) ) {
            return estrofa.versos.map( function( verso ) { return { texto: String( verso.texto_verso || '' ), clave: String( verso.palabra_clave || '' ) }; } );
        }
        var lineas = texto.replace( /\r\n?/g, '\n' ).split( '\n' );
        var claves = String( estrofa.palabras_clave || '' ).replace( /\r\n?/g, '\n' ).split( '\n' );
        return lineas.map( function( linea, indice ) { return { texto: linea, clave: String( claves[ indice ] || '' ).trim() }; } );
    }
    function resaltar( nodo, verso ) {
        nodo.textContent = verso.texto;
        if ( ! verso.clave || verso.clave === '-' ) { return; }
        if ( $ && $.fn.mark ) {
            $( nodo ).mark( verso.clave, { separateWordSearch: false, accuracy: 'exactly' } );
        } else {
            var posicion = verso.texto.toLocaleLowerCase( 'es' ).indexOf( verso.clave.toLocaleLowerCase( 'es' ) );
            if ( posicion === -1 ) { return; }
            nodo.replaceChildren(
                document.createTextNode( verso.texto.slice( 0, posicion ) ),
                elementoTexto( 'mark', '', verso.texto.slice( posicion, posicion + verso.clave.length ) ),
                document.createTextNode( verso.texto.slice( posicion + verso.clave.length ) )
            );
        }
    }
    function versosEn( destino, estrofa, numerados ) {
        var fragmento = document.createDocumentFragment();
        extraerVersos( estrofa ).forEach( function( verso, indice ) {
            var fila = document.createElement( 'p' );
            fila.className = 'modal-hub__verso';
            if ( numerados ) { fila.appendChild( elementoTexto( 'span', 'fuente-mono modal-hub__numero-verso', String( indice + 1 ).padStart( 2, '0' ) ) ); }
            var contenido = document.createElement( 'span' );
            resaltar( contenido, verso );
            fila.appendChild( contenido );
            fragmento.appendChild( fila );
        } );
        destino.replaceChildren( fragmento );
    }
    // Prepara el espacio vertical para recorrer las estrofas sin abandonar el modal.
    // Reutiliza los controles existentes de la plantilla PHP.
    function prepararDesplazamientoEstrofas() {
        var contenedor = buscar( '#modal-hub-lectura-estrofa' );
        var secuencia = buscar( '#modal-hub-secuencia-estrofas' );
        if ( secuencia ) { return secuencia; }
        if ( ! contenedor ) { return null; }

        // El diseño inicial mostraba una única estrofa. Sus dos columnas
        // se reemplazan por secciones creadas a partir de SCF/REST.
        Array.from( contenedor.children ).forEach( function( hijo ) {
            if ( hijo.querySelector( '#modal-hub-versos, #modal-hub-imagen-estrofa' ) ) {
                hijo.remove();
            }
        } );

        contenedor.classList.remove( 'row', 'g-3', 'g-lg-4', 'align-items-start' );
        contenedor.classList.add( 'modal-hub__lectura-por-estrofas' );

        secuencia = document.createElement( 'div' );
        secuencia.id = 'modal-hub-secuencia-estrofas';
        secuencia.className = 'modal-hub__secuencia-estrofas';
        secuencia.tabIndex = 0;
        secuencia.setAttribute( 'role', 'region' );
        secuencia.setAttribute( 'aria-label', 'Estrofas del poema. Desplázate verticalmente para leerlas.' );
        contenedor.prepend( secuencia );

        secuencia.addEventListener( 'scroll', function() {
            if ( scrollEstrofasPendiente || estado.continua ) { return; }
            scrollEstrofasPendiente = true;
            window.requestAnimationFrame( function() {
                scrollEstrofasPendiente = false;
                actualizarEstrofaPorDesplazamiento();
            } );
        }, { passive: true } );
        return secuencia;
    }


    // La estrofa visible se obtiene del desplazamiento natural, no de un
    // contador independiente. Así funcionan la rueda, el touch y las flechas.
    function actualizarEstrofaPorDesplazamiento() {
        var secuencia = buscar( '#modal-hub-secuencia-estrofas' );
        if ( ! secuencia ) { return; }
        var rect = secuencia.getBoundingClientRect();
        var secciones = secuencia.querySelectorAll( '.modal-hub__seccion-estrofa' );
        var indiceCercano = 0;
        var distancia = Infinity;
        secciones.forEach( function( seccion, indice ) {
            var diferencia = Math.abs( seccion.getBoundingClientRect().top - rect.top );
            if ( diferencia < distancia ) {
                distancia = diferencia;
                indiceCercano = indice;
            }
        } );
        if ( secciones.length ) {
            estado.estrofa = indiceCercano;
        }
    }

    function construirEstrofasDesplazables( poema ) {
        var secuencia = prepararDesplazamientoEstrofas();
        if ( ! secuencia ) { return; }
        var fragmento = document.createDocumentFragment();
        var token = ++estado.visual;

        if ( ! estado.estrofas.length ) {
            fragmento.appendChild( elementoTexto( 'p', 'p-3', 'Todavía no hay estrofas publicadas.' ) );
        }

        estado.estrofas.forEach( function( estrofa, indice ) {
            var seccion = document.createElement( 'section' );
            seccion.className = 'modal-hub__seccion-estrofa';
            seccion.dataset.estrofa = String( indice );
            seccion.setAttribute( 'aria-label', 'Estrofa ' + ( indice + 1 ) + ' de ' + estado.estrofas.length );

            var texto = document.createElement( 'div' );
            texto.className = 'modal-hub__columna-texto';
            var visual = document.createElement( 'div' );
            visual.className = 'modal-hub__columna-imagen';

            // Estrofas pares: versos a la izquierda; impares: imagen a la izquierda.
            // En móvil se mantiene el mismo orden de lectura alternado.
            if ( indice % 2 === 1 ) {
                texto.classList.add( 'order-2', 'order-lg-2' );
                visual.classList.add( 'order-1', 'order-lg-1' );
            } else {
                texto.classList.add( 'order-1', 'order-lg-1' );
                visual.classList.add( 'order-2', 'order-lg-2' );
            }

            var versos = document.createElement( 'div' );
            versos.className = 'modal-hub__versos';
            versosEn( versos, estrofa, true );
            texto.appendChild( versos );

            var figura = document.createElement( 'figure' );
            figura.className = 'mb-0';
            var imagen = document.createElement( 'div' );
            imagen.className = 'modal-hub__imagen modal-hub__imagen--estrofa';
            imagen.appendChild( elementoTexto( 'span', 'fuente-mono', 'Cargando imagen…' ) );
            figura.appendChild( imagen );
            visual.appendChild( figura );
            seccion.append( texto, visual );
            fragmento.appendChild( seccion );

            buscarImagen( estrofa.imagen_estrofa ).then( function( medio ) {
                if ( token !== estado.visual || ! estado.poema || estado.poema.id !== poema.id ) { return; }
                colocarImagen( imagen, medio, 'Imagen relacionada con la estrofa ' + ( indice + 1 ) );
            } );
        } );

        secuencia.replaceChildren( fragmento );
        secuencia.scrollTop = 0;
        estado.estrofa = 0;
    }

    function construirLecturaCompleta( poema ) {
        var destino = buscar( '#modal-hub-estrofas-completas' );
        var fragmento = document.createDocumentFragment();
        estado.estrofas.forEach( function( estrofa, indice ) {
            var seccion = document.createElement( 'section' );
            seccion.className = 'modal-hub__estrofa-completa';
            versosEn( seccion, estrofa, false );
            seccion.prepend( elementoTexto( 'span', 'etiqueta-editorial', 'Estrofa ' + String( indice + 1 ).padStart( 2, '0' ) ) );
            fragmento.appendChild( seccion );
        } );
        destino.replaceChildren( fragmento );
        escribir( '#modal-hub-cierre-titulo', titulo( poema ) );
        escribir( '#modal-hub-cierre-autor', titulo( estado.poeta ) );
        imagenEntrada( poema ).then( function( medio ) {
            if ( estado.poema && estado.poema.id === poema.id ) {
                colocarImagen( buscar( '#modal-hub-imagen-cierre' ), medio, 'Imagen de cierre de ' + titulo( poema ) );
            }
        } );
    }
    function alternarContinua( activa ) {
        estado.continua = activa;
        buscar( '#modal-hub-lectura-estrofa' ).hidden = activa;
        buscar( '#modal-hub-lectura-continua' ).hidden = ! activa;
        modalElemento.classList.toggle( 'modal-hub--estrofas-scroll', ! activa );
        var control = buscar( '#modal-hub-alternar-lectura' );
        control.setAttribute( 'aria-pressed', activa ? 'true' : 'false' );
        control.textContent = activa ? 'Volver a estrofas' : 'Lectura continua';
        buscar( '.modal-hub__cuerpo' ).scrollTop = 0;
    }
    function abrirPoema( poemaDeColeccion ) {
        var solicitud = ++estado.solicitud;
        api.obtenerPoema( poemaDeColeccion.id ).then( function( poema ) {
            if ( solicitud !== estado.solicitud || !estado.poeta ) { return; }
            estado.poema = poema;
            estado.estrofas = Array.isArray( campos( poema ).estrofas ) ? campos( poema ).estrofas : [];
            estado.estrofa = 0;
            estado.visual++;
            mostrarModal( 'poema', poema );
            alternarContinua( false );
            construirEstrofasDesplazables( poema );
            construirLecturaCompleta( poema );
        } ).catch( function( error ) {
            console.error( 'Error al abrir poema:', error );
            escribir( '#estado-hub-poeta', 'No se pudo recuperar el poema. Inténtalo de nuevo.' );
        } );
    }
    // Abre un CPT concreto dentro del mismo modal, sin cambiar de página.
    function seleccionarPantalla( indice, origen ) {
        if ( ! estado.poeta || ! estado.pantallas.length ) { return; }
        var total = estado.pantallas.length;
        var seleccionado = ( indice + total ) % total;
        var pantalla = estado.pantallas[ seleccionado ];
        estado.pantallaActual = seleccionado;
        if ( origen ) { ultimoControl = origen; }
        if ( pantalla.tipo === 'bio' ) {
            // Si había una petición de poema pendiente, debe quedar invalidada.
            estado.solicitud++;
            estado.visual++;
            estado.poema = null;
            abrirBiografia();
        } else {
            abrirPoema( pantalla.entrada );
        }
    }

    function abrirPantalla( boton ) {
        if ( ! estado.poeta ) { return; }
        seleccionarPantalla( Number( boton.dataset.indice ) || 0, boton );
    }

    // Mantener separados los estados: pausa del usuario y pausa del modal.
    function controlarAutoplay( pausar ) {
        if ( !$ || !$.fn.slick || !$( carrusel ).hasClass( 'slick-initialized' ) ) { return; }
        var slider = $( carrusel );
        if ( pausar || pausaManual ) {
            slider.slick( 'slickPause' );
            if ( pausar ) { detenerSeguimientoCarrusel(); }
            return;
        }
        // La animación de las flechas termina antes de reactivar el autoplay.
        if ( transicionManual ) { return; }
        slider.slick( 'slickPlay' );
        iniciarSeguimientoCarrusel();
    }

    // Congela el carrusel de inmediato en un bloque concreto.
    // Se utiliza al pulsar Pausa, al salir del modal o al cambiar de CPT.
    function fijarCarrusel( indice ) {
        if ( !$ || !$.fn.slick || !$( carrusel ).hasClass( 'slick-initialized' ) ) { return; }
        var total = estado.pantallas.length;
        if ( !total ) { return; }
        var destino = normalizarIndice( indice, total );
        var slider = $( carrusel );
        transicionManual = false;
        slider.off( 'afterChange.hubManual' );
        detenerSeguimientoCarrusel();
        slider.slick( 'unslick' );
        slider.slick( opcionesCarrusel( total, destino, false, false ) );
        slider.slick( 'slickPause' );
        actualizarIndicador( destino );
        ultimoIndiceEnCentro = destino;
        if ( !modalElemento.classList.contains( 'show' ) ) {
            iniciarSeguimientoCarrusel();
        }
    }

    // En las flechas: cancelar el avance lineal vigente y ejecutar una
    // transición propia de 3 s con ease-in, tanto en pausa como en autoplay.
    // Reconstruir primero evita que waitForAnimate bloquee el clic cuando
    // Slick ya lleva varios segundos desplazándose automáticamente.
    function desplazarConFlecha( direccion ) {
        if ( !$ || !$.fn.slick || !$( carrusel ).hasClass( 'slick-initialized' ) ) { return; }
        var total = estado.pantallas.length;
        if ( total <= 1 ) { return; }

        var origen = normalizarIndice( indiceVisible, total );
        var destino = normalizarIndice( origen + direccion, total );
        var slider = $( carrusel );

        transicionManual = false;
        slider.off( 'afterChange.hubManual' );
        detenerSeguimientoCarrusel();
        slider.slick( 'slickPause' );
        slider.slick( 'unslick' );
        slider.slick( opcionesCarrusel( total, origen, false, true ) );
        slider.slick( 'slickPause' );

        estado.pantallaActual = destino;
        transicionManual = !reducirMovimiento();

        // El contador y la escala siguen la posición visual durante la transición.
        iniciarSeguimientoCarrusel();

        slider.one( 'afterChange.hubManual', function( evento, slick, indice ) {
            transicionManual = false;
            slider.slick( 'slickSetOption', 'speed', DURACION_AUTOMATICA, false );
            slider.slick( 'slickSetOption', 'cssEase', 'linear', false );
            ultimoIndiceEnCentro = normalizarIndice( indice, total );
            actualizarIndicador( ultimoIndiceEnCentro );

            if ( !pausaManual && !modalElemento.classList.contains( 'show' ) ) {
                controlarAutoplay( false );
            }
        } );

        // No usar dontAnimate=true: necesitamos recorrer el siguiente
        // bloque con la transición ease-in configurada arriba.
        slider.slick( direccion > 0 ? 'slickNext' : 'slickPrev' );

        // Fallback para usuarios con movimiento reducido: no se esperan 3 s.
        if ( reducirMovimiento() ) {
            slider.off( 'afterChange.hubManual' );
            transicionManual = false;
            slider.slick( 'slickSetOption', 'speed', DURACION_AUTOMATICA, false );
            slider.slick( 'slickSetOption', 'cssEase', 'linear', false );
            actualizarIndicador( destino );
        }
    }

    function alternarPausaCarrusel() {
        if ( modalElemento.classList.contains( 'show' ) || estado.pantallas.length <= 1 ) { return; }
        pausaManual = !pausaManual;
        if ( pausaManual ) {
            // Congelar en el bloque que ocupa el centro, sin esperar
            // a que termine el movimiento automático.
            fijarCarrusel( indiceVisible );
        } else {
            controlarAutoplay( false );
        }
        actualizarBotonPausa();
    }

    function navegarCarrusel( direccion ) {
        var total = estado.pantallas.length;
        if ( total <= 1 ) { return; }

        if ( modalElemento.classList.contains( 'show' ) ) {
            // Las mismas flechas cambian biografía/poemas dentro del modal.
            var destinoModal = normalizarIndice( estado.pantallaActual + direccion, total );
            seleccionarPantalla( destinoModal );
            fijarCarrusel( destinoModal );
            return;
        }

        if ( $ && $.fn.slick && $( carrusel ).hasClass( 'slick-initialized' ) ) {
            pausaManual = true;
            desplazarConFlecha( direccion );
            actualizarBotonPausa();
        } else {
            // Respaldo cuando Slick no está disponible.
            var activos = Array.from( carrusel.querySelectorAll( '.hub-poeta__pantalla' ) );
            if ( !activos.length ) { return; }
            var indice = normalizarIndice( indiceVisible + direccion, activos.length );
            activos[ indice ].scrollIntoView( { block: 'nearest', inline: 'center', behavior: 'smooth' } );
            actualizarIndicador( indice );
        }
    }
    function iniciar() {
        window.addEventListener( 'resize', actualizarPosicionNavegacionModal, { passive: true } );
        var botonPausa = document.getElementById( 'hub-pausa' );
        if ( botonPausa ) { botonPausa.addEventListener( 'click', alternarPausaCarrusel ); }
        document.addEventListener( 'click', function( evento ) {
            var explorar = evento.target.closest( '#bandeja-poeta-contenido a' );
            if ( ! explorar ) { return; }
            var seleccionado = document.querySelector( '#galeria-poetas .posicion-polaroid.esta-seleccionado' );
            var id = Number( explorar.dataset.poetaId || seleccionado && seleccionado.dataset.poetaId );
            if ( ! id ) { return; } // El enlace WordPress sigue siendo el respaldo.
            evento.preventDefault();
            abrirPoeta( id, true );
        } );
        carrusel.addEventListener( 'click', function( evento ) {
            var boton = evento.target.closest( '.hub-poeta__abrir-pantalla' );
            if ( !boton ) { return; }
            var slide = boton.closest( '.slick-slide' );
            // No abrimos la tarjeta entrante antes de alcanzar el centro.
            // En modo reducido o sin Slick se permite la selección normal.
            if ( slide && animacionCarrusel && !slide.classList.contains( 'es-central' ) ) { return; }
            abrirPantalla( boton );
        } );
        document.getElementById( 'hub-volver-inicio' ).addEventListener( 'click', function() { volverInicio( true ); } );
        document.getElementById( 'hub-anterior' ).addEventListener( 'click', function() { navegarCarrusel( -1 ); } );
        document.getElementById( 'hub-siguiente' ).addEventListener( 'click', function() { navegarCarrusel( 1 ); } );
        document.getElementById( 'modal-hub-alternar-lectura' ).addEventListener( 'click', function() { alternarContinua( !estado.continua ); } );
        modalElemento.addEventListener( 'hidden.bs.modal', function() {
            devolverFlechasAlHub();
            ponerRuta( 'Obras' );
            estado.visual++;
            modalElemento.classList.remove( 'modal-hub--estrofas-scroll' );
            if ( !hub.hidden && $ && $.fn.slick && $( carrusel ).hasClass( 'slick-initialized' ) ) {
                fijarCarrusel( estado.pantallaActual );
                controlarAutoplay( false );
            }
            actualizarBotonPausa();
            if ( ultimoControl && ultimoControl.isConnected && !hub.hidden ) { ultimoControl.focus(); }
        } );
        var volver = document.querySelector( '.barra-superior__inicio' );
        if ( volver ) {
            volver.addEventListener( 'click', function( evento ) {
                if ( document.body.classList.contains( 'modo-hub' ) ) {
                    evento.preventDefault();
                    volverInicio( true );
                }
            } );
        }
        window.addEventListener( 'popstate', function() {
            var coincidencia = window.location.hash.match( /^#poeta-(\d+)$/ );
            if ( coincidencia ) { abrirPoeta( Number( coincidencia[ 1 ] ), false ); }
            else { volverInicio( false ); }
        } );
        var inicial = window.location.hash.match( /^#poeta-(\d+)$/ );
        if ( inicial ) { abrirPoeta( Number( inicial[ 1 ] ), false ); }
    }
    if ( document.readyState === 'loading' ) { document.addEventListener( 'DOMContentLoaded', iniciar ); }
    else { iniciar(); }
}() );
