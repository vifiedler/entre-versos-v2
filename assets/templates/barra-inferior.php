<?php
/**
 * Barra inferior compacta de Entre Versos. La tolva vive solo en el inicio.
 * Los controles permanecen visibles. El audio solo se carga al entrar en poeta o poema.
 * @package EntreVersos
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$es_lectura = is_singular( array( 'ant_poeta', 'ant_poema' ) );
?>
<aside id="barra-inferior" class="barra-inferior" aria-label="Barra inferior de la antología">
    <div class="container-fluid p-0">
        <div class="row g-2 align-items-center barra-inferior__disposicion">
            <div class="col"><strong class="barra-inferior__marca d-inline-block">Entre Versos</strong></div>
            <div class="col-auto">
                <section id="reproductor-volumen" class="reproductor-volumen" aria-label="Volumen de la música ambiental">
                    <div class="reproductor-volumen__indicador">
                        <i class="bi bi-volume-up" aria-hidden="true"></i>
                        <span class="reproductor-volumen__barras" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
                        <span class="fuente-mono" id="volumen-valor"><?php echo $es_lectura ? '50%' : '—'; ?></span>
                    </div>
                    <div class="reproductor-volumen__controles">
                        <button class="boton-volumen" type="button" id="volumen-bajar" aria-label="Bajar volumen" disabled><i class="bi bi-dash" aria-hidden="true"></i></button>
                        <button class="boton-volumen" type="button" id="volumen-silenciar" aria-label="Silenciar música" disabled><i class="bi bi-volume-mute" aria-hidden="true"></i></button>
                        <button class="boton-volumen" type="button" id="volumen-subir" aria-label="Subir volumen" disabled><i class="bi bi-plus" aria-hidden="true"></i></button>
                    </div>
                    <span id="estado-musica" class="screen-reader-text" role="status" aria-live="polite"><?php echo $es_lectura ? 'Cargando música.' : 'La música ambiental está disponible al explorar un poeta.'; ?></span>
                </section>
            </div>
        </div>
    </div>
</aside>
