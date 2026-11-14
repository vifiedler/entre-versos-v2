<?php
/**
 * Hub de exploración del poeta: vista SPA dentro de front-page.php.
 * Los datos y las tarjetas se construyen desde la API REST mediante Slick.
 * No es necesario crear una página por poeta en el administrador de WordPress.
 * @package EntreVersos
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<section id="vista-hub-poeta" class="hub-poeta fondo-cuadricula" aria-labelledby="titulo-hub-poeta" hidden>
    <div class="container-fluid h-100 p-0 d-flex flex-column">
        <div class="hub-poeta__encabezado d-flex flex-wrap justify-content-between align-items-end gap-2">
            <div>
                <span class="etiqueta-editorial">Archivo / Autor seleccionado</span>
                <h1 id="titulo-hub-poeta" class="hub-poeta__titulo">Poeta</h1>
                <p id="datos-hub-poeta" class="fuente-mono mb-0"></p>
            </div>
            <button id="hub-volver-inicio" type="button" class="boton-editorial boton-editorial--compacto">
                <i class="bi bi-arrow-left" aria-hidden="true"></i> Volver al inicio
            </button>
        </div>
        <div class="hub-poeta__escenario flex-grow-1 d-flex flex-column justify-content-center">
            <p id="estado-hub-poeta" class="fuente-mono text-center" role="status" aria-live="polite">Selecciona un poeta para explorar su archivo.</p>
            <div id="carrusel-hub-poeta" class="hub-poeta__carrusel" role="region" aria-label="Carrusel de biografía y poemas"></div>
        </div>
        <div class="hub-poeta__navegacion d-flex align-items-center justify-content-between gap-2">
            <button id="hub-anterior" type="button" class="boton-editorial boton-editorial--compacto" aria-label="Pantalla anterior" disabled>
                <i class="bi bi-arrow-left" aria-hidden="true"></i>
            </button>
            <span id="hub-indicador" class="fuente-mono text-center">00 / 00</span>
            <button id="hub-siguiente" type="button" class="boton-editorial boton-editorial--compacto" aria-label="Pantalla siguiente" disabled>
                <i class="bi bi-arrow-right" aria-hidden="true"></i>
            </button>
        </div>
    </div>
</section>

<!-- Bootstrap administra el foco y la capa oscurecida. El contenido se desplaza dentro del modal. -->
<div id="modal-hub-contenido" class="modal fade modal-hub" tabindex="-1" aria-labelledby="modal-hub-titulo" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
        <div class="modal-content tarjeta-editorial">
            <div class="modal-header modal-hub__cabecera">
                <div class="min-width-0">
                    <span id="modal-hub-categoria" class="etiqueta-editorial">Archivo</span>
                    <h2 id="modal-hub-titulo" class="modal-hub__titulo mb-0"></h2>
                </div>
                <div class="modal-hub__acciones">
                    <button id="modal-hub-alternar-lectura" type="button" class="boton-editorial boton-editorial--compacto" aria-pressed="false" hidden>Lectura continua</button>
                    <button type="button" class="boton-editorial boton-editorial--compacto" data-bs-dismiss="modal" aria-label="Volver al hub">
                        <i class="bi bi-x-lg" aria-hidden="true"></i><span class="d-none d-sm-inline"> Volver al poeta</span>
                    </button>
                </div>
            </div>
            <div class="modal-body modal-hub__cuerpo">
                <div id="modal-hub-biografia" class="modal-hub__biografia" hidden>
                    <div class="modal-hub__bio-paneles">
                        <section class="modal-hub__bio-contexto tarjeta-editorial" aria-labelledby="modal-hub-vida-titulo">
                            <span class="etiqueta-editorial">Antecedentes</span>
                            <h3 id="modal-hub-vida-titulo">Vida y contexto</h3>
                            <p id="modal-hub-resumen-biografia" class="modal-hub__texto"></p>
                            <p id="modal-hub-detalle-biografia" class="fuente-mono mt-auto"></p>
                        </section>
                        <section class="modal-hub__bio-expediente tarjeta-editorial" aria-labelledby="modal-hub-expediente-titulo">
                            <span id="modal-hub-expediente-titulo" class="etiqueta-editorial">Expediente biográfico</span>
                            <div class="modal-hub__bio-expediente-cuerpo">
                                <figure class="modal-hub__retrato mb-0">
                                    <div id="modal-hub-foto-biografia" class="modal-hub__imagen"></div>
                                    <figcaption id="modal-hub-pie-biografia" class="fuente-mono mt-2"></figcaption>
                                </figure>
                                <div>
                                    <p id="modal-hub-datos-biografia" class="fuente-mono"></p>
                                    <div id="modal-hub-texto-biografia" class="modal-hub__texto"></div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
                <div id="modal-hub-poema" class="modal-hub__poema" hidden>
                    <div id="modal-hub-lectura-estrofa" class="row g-3 g-lg-4 align-items-start">
                        <div class="col-12 col-lg-6">
                            <div id="modal-hub-versos" class="modal-hub__versos"></div>
                        </div>
                        <div class="col-12 col-lg-6">
                            <figure class="mb-0">
                                <div id="modal-hub-imagen-estrofa" class="modal-hub__imagen modal-hub__imagen--estrofa"></div>
                                <figcaption class="fuente-mono mt-2">Imagen asociada a la estrofa</figcaption>
                            </figure>
                        </div>
                    </div>
                    <div id="modal-hub-lectura-continua" class="modal-hub__continua" hidden>
                        <div id="modal-hub-estrofas-completas"></div>
                        <figure class="modal-hub__cierre mb-0">
                            <p class="etiqueta-editorial">Final del poema</p>
                            <h3 id="modal-hub-cierre-titulo"></h3>
                            <p id="modal-hub-cierre-autor" class="fuente-mono"></p>
                            <div id="modal-hub-imagen-cierre" class="modal-hub__imagen modal-hub__imagen--cierre"></div>
                        </figure>
                    </div>
                </div>
            </div>
            <!-- Las flechas originales del hub se reutilizan cuando la pantalla está ampliada. -->
        </div>
    </div>
</div>
