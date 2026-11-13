/**
 * Entre Versos · Música del poeta mediante YouTube IFrame Player API.
 * Iframe de YouTube fuera de la vista, con controles propios de volumen.
 * El navegador puede bloquear el autoplay con sonido.
 */
( function() {
    'use strict';
    var configuracion = window.entreVersosAudioConfig || {};
    var api = window.EntreVersosRest;
    var reproductor = null;
    var volumen = 50;
    var silencio = false;
    var cargando = false;
    var listo = false;
    var caja = document.getElementById( 'musica-youtube' );
    var aviso = document.getElementById( 'estado-musica' );

    function informar( texto ) {
        if ( aviso ) { aviso.textContent = texto; }
    }
    function identificarVideo( url ) {
        try {
            var direccion = new URL( String( url || '' ).trim() );
            var host = direccion.hostname.toLowerCase().replace( /^www\./, '' );
            var partes = direccion.pathname.split( '/' ).filter( Boolean );
            var codigo = '';
            if ( host === 'youtu.be' ) { codigo = partes[ 0 ] || ''; }
            if ( host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com' ) {
                if ( partes[ 0 ] === 'watch' ) { codigo = direccion.searchParams.get( 'v' ) || ''; }
                if ( [ 'embed', 'shorts', 'live' ].includes( partes[ 0 ] ) ) { codigo = partes[ 1 ] || ''; }
            }
            return /^[a-zA-Z0-9_-]{11}$/.test( codigo ) ? codigo : '';
        } catch ( error ) { return ''; }
    }
    function actualizarVolumen() {
        var salida = document.getElementById( 'volumen-valor' );
        var silenciar = document.getElementById( 'volumen-silenciar' );
        if ( salida ) { salida.textContent = silencio ? 'Mute' : volumen + '%'; }
        if ( silenciar ) {
            silenciar.setAttribute( 'aria-label', silencio ? 'Activar sonido' : 'Silenciar música' );
            var icono = silenciar.querySelector( 'i' );
            if ( icono ) { icono.className = 'bi ' + ( silencio ? 'bi-volume-mute' : 'bi-volume-up' ); }
        }
    }
    function ajustar( valor ) {
        volumen = Math.max( 0, Math.min( 100, valor ) );
        silencio = false;
        if ( ! reproductor || ! listo ) { return; }
        reproductor.unMute();
        reproductor.setVolume( volumen );
        reproductor.playVideo();
        actualizarVolumen();
    }
    function activarControles() {
        [ 'volumen-bajar', 'volumen-silenciar', 'volumen-subir' ].forEach( function( id ) {
            var boton = document.getElementById( id );
            if ( boton ) { boton.disabled = false; }
        } );
        document.getElementById( 'volumen-bajar' )?.addEventListener( 'click', function() { ajustar( volumen - 10 ); } );
        document.getElementById( 'volumen-subir' )?.addEventListener( 'click', function() { ajustar( volumen + 10 ); } );
        document.getElementById( 'volumen-silenciar' )?.addEventListener( 'click', function() {
            silencio = ! silencio;
            if ( silencio ) { reproductor.mute(); } else { reproductor.unMute(); }
            reproductor.playVideo();
            actualizarVolumen();
        } );
        actualizarVolumen();
    }
    function crearReproductor( id ) {
        if ( ! window.YT || ! window.YT.Player || ! caja || cargando ) { return; }
        cargando = true;
        reproductor = new window.YT.Player( 'youtube-reproductor', {
            width: 1,
            height: 1,
            videoId: id,
            playerVars: {
                autoplay: 1,
                controls: 0,
                playsinline: 1,
                loop: 1,
                playlist: id,
                origin: window.location.origin
            },
            events: {
                onReady: function( evento ) {
                    listo = true;
                    evento.target.setVolume( 50 );
                    evento.target.unMute();
                    var iframe = evento.target.getIframe();
                    if ( iframe ) { iframe.setAttribute( 'tabindex', '-1' ); }
                    activarControles();
                    // Intentar reproducción automática después de fijar el volumen al 50%.
                    evento.target.playVideo();
                    informar( '' );
                },
                onAutoplayBlocked: function() {
                    informar( 'Tu navegador bloqueó el inicio automático. Usa los botones de volumen para intentar reproducir.' );
                },
                onError: function( evento ) {
                    informar( 'Este video no se puede reproducir aquí (código ' + evento.data + ').' );
                }
            }
        } );
    }
    window.onYouTubeIframeAPIReady = function() {
        if ( ! api || ! Number( configuracion.poetaId ) ) { return; }
        api.obtenerPoeta( Number( configuracion.poetaId ) ).then( function( poeta ) {
            var url = poeta && poeta.acf ? poeta.acf.musica_url : '';
            var videoId = identificarVideo( url );
            if ( videoId ) { crearReproductor( videoId ); }
            else { informar( url ? 'La URL no corresponde a un video de YouTube.' : 'Este poeta no tiene música asociada.' ); }
        } ).catch( function( error ) {
            console.warn( 'No se pudo cargar la música desde REST:', error );
            informar( 'No se pudo cargar la música del poeta.' );
        } );
    };
    // Al regresar al inicio, WordPress descarga la página y detiene el reproductor.
    window.addEventListener( 'pagehide', function() {
        if ( listo && reproductor && typeof reproductor.stopVideo === 'function' ) {
            reproductor.stopVideo();
        }
    } );
}() );
