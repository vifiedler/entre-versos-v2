/**
 * Entre Versos · Lectura continua.
 * Únicamente alterna entre lectura por estrofas y el poema completo.
 * No gestiona el avance de estrofas ni las animaciones pendientes del equipo.
 */
( function() {
    'use strict';
    function iniciar() {
        var raiz = document.querySelector( '.vista-poema' );
        if ( ! raiz ) { return; }
        var lector = raiz.querySelector( '#lector-estrofas' );
        var continua = raiz.querySelector( '#lectura-continua' );
        var cierre = raiz.querySelector( '#poema-cierre' );
        var abrir = raiz.querySelector( '#ver-lectura-continua' );
        var volver = raiz.querySelector( '#volver-a-estrofas' );
        if ( ! lector || ! continua || ! abrir || ! volver ) { return; }
        abrir.addEventListener( 'click', function() {
            lector.hidden = true;
            continua.hidden = false;
            if ( cierre ) { cierre.hidden = false; }
            abrir.setAttribute( 'aria-expanded', 'true' );
            continua.scrollTop = 0;
            volver.focus();
        } );
        volver.addEventListener( 'click', function() {
            continua.hidden = true;
            lector.hidden = false;
            if ( cierre ) { cierre.hidden = true; }
            abrir.setAttribute( 'aria-expanded', 'false' );
            abrir.focus();
        } );
    }
    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', iniciar );
    } else { iniciar(); }
}() );
