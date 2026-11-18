/**
 * Entre Versos · Música ambiental de cada poeta.
 * YouTube IFrame API, URL obtenida desde SCF, volumen inicial 50 %.
 * En la portada no se reproduce música; el hub la activa sin recargar la página.
 */
( function() {
    'use strict';

    var configuracion = window.entreVersosAudioConfig || {};
    var api = window.EntreVersosRest;
    var reproductor = null;
    var listo = false;
    var apiLista = false;
    var idPendiente = '';
    var idActual = '';
    var volumen = 50;
    var silencio = false;
    var controlesRegistrados = false;
    var reproduciendo = false;

    function nodo( id ) { return document.getElementById( id ); }
    function informar( mensaje ) {
        var estado = nodo( 'estado-musica' );
        if ( estado ) { estado.textContent = mensaje; }
    }
    function identificarVideo( url ) {
        try {
            var direccion = new URL( String( url || '' ).trim() );
            var host = direccion.hostname.toLowerCase().replace( /^www\./, '' );
            var partes = direccion.pathname.split( '/' ).filter( Boolean );
            var codigo = '';
            if ( host === 'youtu.be' ) { codigo = partes[ 0 ] || ''; }
            if ( [ 'youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com' ].includes( host ) ) {
                if ( partes[ 0 ] === 'watch' ) { codigo = direccion.searchParams.get( 'v' ) || ''; }
                if ( [ 'embed', 'shorts', 'live' ].includes( partes[ 0 ] ) ) { codigo = partes[ 1 ] || ''; }
            }
            return /^[a-zA-Z0-9_-]{11}$/.test( codigo ) ? codigo : '';
        } catch ( error ) { return ''; }
    }
    function interfazVolumen() {
        var porcentaje = nodo( 'volumen-valor' );
        var botonSilencio = nodo( 'volumen-silenciar' );
        if ( porcentaje ) { porcentaje.textContent = idPendiente ? ( silencio ? 'Mute' : volumen + '%' ) : '—'; }
        if ( botonSilencio ) {
            botonSilencio.setAttribute( 'aria-label', silencio ? 'Activar sonido' : 'Silenciar música' );
            var icono = botonSilencio.querySelector( 'i' );
            if ( icono ) { icono.className = 'bi ' + ( silencio ? 'bi-volume-mute' : 'bi-volume-up' ); }
        }
        var botonReproduccion = nodo( 'musica-reproducir-pausar' );
        if ( botonReproduccion ) {
            botonReproduccion.disabled = !idPendiente || !listo;
            botonReproduccion.setAttribute( 'aria-label', reproduciendo ? 'Pausar música' : 'Reproducir música' );
            botonReproduccion.setAttribute( 'title', reproduciendo ? 'Pausar' : 'Reproducir' );
            var iconoReproduccion = botonReproduccion.querySelector( 'i' );
            if ( iconoReproduccion ) {
                iconoReproduccion.className = 'bi ' + ( reproduciendo ? 'bi-pause-fill' : 'bi-play-fill' );
            }
        }
        [ 'volumen-bajar', 'volumen-silenciar', 'volumen-subir' ].forEach( function( id ) {
            var boton = nodo( id );
            if ( boton ) { boton.disabled = !idPendiente || !listo; }
        } );
    }
    function bajarSubir( variacion ) {
        volumen = Math.max( 0, Math.min( 100, volumen + variacion ) );
        silencio = false;
        if ( listo && reproductor ) {
            reproductor.unMute();
            reproductor.setVolume( volumen );
        }
        interfazVolumen();
    }
    function registrarControles() {
        if ( controlesRegistrados ) { return; }
        controlesRegistrados = true;
        nodo( 'volumen-bajar' )?.addEventListener( 'click', function() { bajarSubir( -5 ); } );
        nodo( 'volumen-subir' )?.addEventListener( 'click', function() { bajarSubir( 5 ); } );
        nodo( 'volumen-silenciar' )?.addEventListener( 'click', function() {
            if ( ! listo || ! reproductor ) { return; }
            silencio = !silencio;
            if ( silencio ) { reproductor.mute(); }
            else { reproductor.unMute(); }
            interfazVolumen();
        } );
        nodo( 'musica-reproducir-pausar' )?.addEventListener( 'click', function() {
            if ( !listo || !reproductor || !idPendiente ) { return; }
            if ( reproduciendo ) {
                reproductor.pauseVideo();
            } else {
                reproductor.playVideo();
            }
            // onStateChange confirma el estado y actualiza el icono real.
        } );
        interfazVolumen();
    }
    function iniciarVideo() {
        if ( !apiLista || !idPendiente || !window.YT || !window.YT.Player || !nodo( 'musica-youtube' ) ) { return; }
        if ( reproductor && listo ) {
            reproductor.setVolume( volumen );
            if ( silencio ) { reproductor.mute(); } else { reproductor.unMute(); }
            if ( idActual === idPendiente ) { reproductor.playVideo(); }
            else {
                idActual = idPendiente;
                reproductor.loadPlaylist( [ idActual ] );
                reproductor.setLoop( true );
            }
            informar( '' );
            return;
        }
        if ( reproductor ) { return; } // Se está creando: onReady usa el último idPendiente.
        reproductor = new window.YT.Player( 'youtube-reproductor', {
            width: 1,
            height: 1,
            videoId: idPendiente,
            playerVars: {
                autoplay: 1,
                controls: 0,
                playsinline: 1,
                loop: 1,
                playlist: idPendiente,
                origin: window.location.origin
            },
            events: {
                onStateChange: function( evento ) {
                    var estados = window.YT && window.YT.PlayerState;
                    if ( !estados ) { return; }
                    if ( evento.data === estados.PLAYING ) { reproduciendo = Boolean( idPendiente ); }
                    if ( [ estados.PAUSED, estados.ENDED, estados.CUED ].includes( evento.data ) ) { reproduciendo = false; }
                    interfazVolumen();
                },
                onReady: function( evento ) {
                    listo = true;
                    evento.target.setVolume( volumen );
                    if ( silencio ) { evento.target.mute(); } else { evento.target.unMute(); }
                    var iframe = evento.target.getIframe();
                    if ( iframe ) { iframe.setAttribute( 'tabindex', '-1' ); }
                    if ( idPendiente ) {
                        // Puede cambiar el poeta mientras la API termina de cargarse.
                        idActual = idPendiente;
                        evento.target.loadPlaylist( [ idActual ] );
                        evento.target.setLoop( true );
                    }
                    registrarControles();
                    interfazVolumen();
                },
                onAutoplayBlocked: function() {
                    informar( 'El navegador bloqueó la reproducción automática. Usa los controles de volumen para reintentar.' );
                },
                onError: function( evento ) {
                    informar( 'Este vídeo de YouTube no se puede reproducir aquí (' + evento.data + ').' );
                }
            }
        } );
    }
    function activarPoeta( poeta ) {
        var url = poeta && poeta.acf ? poeta.acf.musica_url : '';
        idPendiente = identificarVideo( url );
        volumen = 50;
        silencio = false;
        reproduciendo = false;
        registrarControles();
        interfazVolumen();
        if ( idPendiente ) { iniciarVideo(); }
        else {
            detener();
            informar( url ? 'URL de YouTube no válida.' : 'Este poeta no tiene música asociada.' );
        }
    }
    function detener() {
        idPendiente = '';
        reproduciendo = false;
        if ( listo && reproductor && typeof reproductor.stopVideo === 'function' ) {
            reproductor.stopVideo();
        }
        interfazVolumen();
        informar( '' );
    }

    window.EntreVersosAudio = { activarPoeta: activarPoeta, detener: detener };
    window.onYouTubeIframeAPIReady = function() {
        apiLista = true;
        if ( idPendiente ) { iniciarVideo(); }
        var poetaId = Number( configuracion.poetaId );
        if ( poetaId && api ) {
            api.obtenerPoeta( poetaId ).then( activarPoeta ).catch( function( error ) {
                console.warn( 'Error al solicitar la música:', error );
                informar( 'No se pudo cargar la música del poeta.' );
            } );
        }
    };
    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', registrarControles );
    } else { registrarControles(); }
    window.addEventListener( 'pagehide', detener );
}() );
