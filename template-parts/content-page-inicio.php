<?php
/**
 * Portada editorial basada en la pantalla 01 de Stitch.
 * La galería se rellena desde REST con registros del CPT ant_poeta.
 * Sin selección, arrastre ni animaciones todavía.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<section id="seleccion-poetas" class="seleccion-poetas" aria-labelledby="titulo-inicio">
    <div class="container-fluid p-0">
        <div class="seleccion-poetas__marco">
            <div class="galeria-poetas fondo-cuadricula" id="galeria-poetas" role="group" aria-label="Galería de retratos de poetas">
                <p id="estado-carga-poetas" class="fuente-mono" role="status">Cargando poetas desde WordPress...</p>
            </div>
            <h1 id="titulo-inicio" class="screen-reader-text">Entre Versos, antología de poetas latinoamericanos</h1>
            <!-- La zona de selección se reserva en la portada; el arrastre se implementará después. -->
            <aside id="bandeja-poeta" class="bandeja-poeta bandeja-poeta--inicio" aria-label="Zona de selección de poeta">
                <div class="bandeja-poeta__etiqueta fuente-mono">
                    <span>Dejar aquí</span>
                    <span class="cuadro-lima" aria-hidden="true"></span>
                </div>
                <div id="bandeja-poeta-contenido" class="bandeja-poeta__contenido" aria-live="polite"></div>
            </aside>
        </div>
    </div>
</section>

<!-- Plantilla para los registros publicados que devuelve REST API. Sin eventos de interacción. -->
<template id="plantilla-tarjeta-poeta">
    <div class="posicion-polaroid" data-poeta-id="">
        <article class="atropos tarjeta-polaroid">
            <div class="atropos-scale"><div class="atropos-rotate"><div class="atropos-inner">
                <div class="tarjeta-polaroid__foto"><img class="tarjeta-polaroid__imagen" alt="" loading="lazy"></div>
                <h2 class="tarjeta-polaroid__nombre"></h2>
            </div></div></div>
        </article>
    </div>
</template>
<!-- La ficha de la bandeja queda disponible, pero no se inserta hasta implementar la selección. -->
<template id="plantilla-ficha-poeta">
    <div class="row g-2 align-items-center p-2 ficha-poeta">
        <div class="col-3"><img class="ficha-poeta__imagen" alt=""></div>
        <div class="col-9"><p class="ficha-poeta__nombre mb-1 fuente-titulos"></p><p class="ficha-poeta__descripcion mb-1 fuente-mono"></p></div>
        <div class="col-12"><button class="boton-editorial boton-editorial--primario w-100" type="button">Explorar poeta <i class="bi bi-arrow-right" aria-hidden="true"></i></button></div>
    </div>
</template>
