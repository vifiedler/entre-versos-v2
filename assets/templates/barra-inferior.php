<?php
/**
 * Barra inferior persistente. La bandeja se entrega VACÍA deliberadamente.
 * El equipo añadirá selección de poeta y lógica de volumen mediante JS/REST.
 * @package EntreVersos
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<aside id="barra-inferior" class="barra-inferior" aria-label="Panel inferior de la antología">
    <div class="container-fluid p-0">
        <div class="row g-2 g-lg-4 barra-inferior__disposicion">
            <div class="col-6 col-sm-7 col-xl-9">
                <p class="barra-inferior__marca">Entre Versos</p>
            </div>
            <div class="col-6 col-sm-5 col-xl-3">
                <div class="barra-inferior__lateral">
                    <section id="bandeja-poeta" class="bandeja-poeta" aria-label="Zona de selección de poeta">
                        <div class="bandeja-poeta__etiqueta fuente-mono">
                            <span>Tolva // Dejar aquí</span>
                            <span class="cuadro-lima" aria-hidden="true"></span>
                        </div>
                        <div id="bandeja-poeta-contenido" class="bandeja-poeta__contenido" aria-live="polite"></div>
                    </section>
                    <section id="reproductor-volumen" class="reproductor-volumen" aria-label="Controles de volumen de la música ambiental">
                        <div class="reproductor-volumen__indicador">
                            <i class="bi bi-volume-up" aria-hidden="true"></i>
                            <span class="reproductor-volumen__barras" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
                            <span class="fuente-mono" id="volumen-valor">100%</span>
                        </div>
                        <div class="reproductor-volumen__controles">
                            <button class="boton-volumen" type="button" id="volumen-bajar" aria-label="Bajar volumen" disabled><i class="bi bi-dash" aria-hidden="true"></i></button>
                            <button class="boton-volumen" type="button" id="volumen-silenciar" aria-label="Silenciar música" disabled><i class="bi bi-volume-mute" aria-hidden="true"></i></button>
                            <button class="boton-volumen" type="button" id="volumen-subir" aria-label="Subir volumen" disabled><i class="bi bi-plus" aria-hidden="true"></i></button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
</aside>
