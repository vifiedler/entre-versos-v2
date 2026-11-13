<?php
/**
 * Reproductor ambiental en contenedor fuera de la vista, como Breakdown Music.
 * Se incluye solamente en la vista del poeta y en sus poemas.
 * La API crea el iframe desde la URL guardada en musica_url de SCF.
 * @package EntreVersos
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<div id="musica-youtube" class="musica-youtube musica-youtube--oculta" aria-hidden="true">
    <div id="youtube-reproductor"></div>
</div>
