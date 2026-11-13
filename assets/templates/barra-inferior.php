<?php
/**
 * Barra inferior compacta de Entre Versos. La tolva vive solo en el inicio.
 * El volumen se muestra exclusivamente en vistas individuales del poeta o poema.
 * @package EntreVersos
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$es_lectura = is_singular( array( 'ant_poeta', 'ant_poema' ) );
?>
<aside id="barra-inferior" class="barra-inferior" aria-label="Barra inferior de la antología">
    <div class="container-fluid p-0">
        <div class="row g-2 align-items-center barra-inferior__disposicion">
            <div class="col"><p class="barra-inferior__marca">Entre Versos</p></div>
            <?php if ( $es_lectura ) : ?>
            <div class="col-auto">
                <section id="reproductor-volumen" class="reproductor-volumen" aria-label="Volumen de la música ambiental">
                    <div class="reproductor-volumen__indicador">
                        <i class="bi bi-volume-up" aria-hidden="true"></i>
                        <span class="reproductor-volumen__barras" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
                        <span class="fuente-mono" id="volumen-valor">50%</span>
                    </div>
                    <div class="reproductor-volumen__controles">
                        <button class="boton-volumen" type="button" id="volumen-bajar" aria-label="Bajar volumen" disabled><i class="bi bi-dash" aria-hidden="true"></i></button>
                        <button class="boton-volumen" type="button" id="volumen-silenciar" aria-label="Silenciar música" disabled><i class="bi bi-volume-mute" aria-hidden="true"></i></button>
                        <button class="boton-volumen" type="button" id="volumen-subir" aria-label="Subir volumen" disabled><i class="bi bi-plus" aria-hidden="true"></i></button>
                    </div>
                    <span id="estado-musica" class="screen-reader-text" role="status" aria-live="polite">Cargando música.</span>
                </section>
            </div>
            <?php endif; ?>
        </div>
    </div>
</aside>
