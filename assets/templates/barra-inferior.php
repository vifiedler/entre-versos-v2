<?php
/**
 * Pie funcional persistente en todas las vistas: marca, bandeja vacía y controles.
 * Sin audio real ni eventos; el equipo aportará la interacción desde JS.
 * @package EntreVersos
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<aside class="barra-inferior" id="barra-inferior" aria-label="Panel inferior de la antología">
    <div class="barra-inferior__disposicion">
        <p class="barra-inferior__marca">Entre Versos</p>
        <div class="barra-inferior__lateral">
            <section class="bandeja-poeta" id="bandeja-poeta" aria-label="Poeta seleccionado">
                <div class="bandeja-poeta__contenido" id="bandeja-poeta-contenido" aria-live="polite">
                    <!-- Intencionadamente vacío. Al seleccionar/arrastrar una foto,
                         JS añadirá aquí la ficha y el botón «Explorar poeta». -->
                </div>
            </section>
            <section class="reproductor-volumen" id="reproductor-volumen" aria-label="Volumen de la música ambiental">
                <span class="reproductor-volumen__icono" aria-hidden="true">♪</span>
                <div class="reproductor-volumen__controles">
                    <button type="button" id="volumen-bajar" aria-label="Bajar volumen" disabled>−</button>
                    <button type="button" id="volumen-silenciar" aria-label="Silenciar música" disabled>Silenciar</button>
                    <button type="button" id="volumen-subir" aria-label="Subir volumen" disabled>+</button>
                </div>
            </section>
        </div>
    </div>
</aside>
