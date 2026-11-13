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
            <div class="galeria-poetas fondo-cuadricula" id="galeria-poetas" aria-label="Galería de retratos de poetas">
                <p id="estado-carga-poetas" class="fuente-mono" role="status">Cargando poetas desde WordPress...</p>
            </div>
            <div class="seleccion-poetas__metadatos" aria-label="Datos de la edición">
                <span class="etiqueta-editorial etiqueta-editorial--oscura">Vol. 01 / Edición radical</span>
                <span id="cantidad-poetas" class="etiqueta-editorial">Archivo poético</span>
            </div>
            <h1 id="titulo-inicio" class="seleccion-poetas__titulo">Antología de poetas latinoamericanos</h1>
            <p class="seleccion-poetas__descripcion">Explora los retratos del archivo poético. La selección y el arrastre hacia <span class="seleccion-poetas__marca-accion">[DEJAR AQUÍ]</span> se incorporarán en la próxima etapa.</p>
            <p class="seleccion-poetas__estado"><span class="texto-lima" aria-hidden="true">■</span> <span id="estado-seleccion-poeta">Selección actual: ninguna</span></p>
        </div>
    </div>
</section>

<!-- Plantilla para los registros publicados que devuelve REST API. Sin eventos de interacción. -->
<template id="plantilla-tarjeta-poeta">
    <div class="posicion-polaroid" data-poeta-id="">
        <article class="atropos tarjeta-polaroid">
            <div class="atropos-scale"><div class="atropos-rotate"><div class="atropos-inner">
                <div class="tarjeta-polaroid__cabecera"><span class="tarjeta-polaroid__identificador"></span><span>Explorar</span></div>
                <div class="tarjeta-polaroid__foto"><img class="tarjeta-polaroid__imagen" alt="" loading="lazy"></div>
                <h2 class="tarjeta-polaroid__nombre"></h2>
                <p class="tarjeta-polaroid__detalle"></p>
                <p class="tarjeta-polaroid__cita"></p>
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
