<?php
/** Estructura estática de lectura: avance por estrofas completas. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<article id="poema-<?php the_ID(); ?>" <?php post_class( 'vista-poema' ); ?> data-poema-id="<?php echo esc_attr( get_the_ID() ); ?>">
    <header class="vista-poema__encabezado">
        <h1 id="titulo-poema"><?php echo esc_html( get_the_title() ); ?></h1>
        <p id="contador-estrofas" aria-live="polite"><!-- Número actual / total (REST + JS). --></p>
    </header>
    <section class="lector-estrofas" id="lector-estrofas" aria-label="Lectura por estrofas">
        <div class="lector-estrofas__disposicion">
            <div class="lector-estrofas__versos" id="estrofa-versos">
                <!-- Todos los versos de UNA estrofa; palabras clave solo resaltadas. -->
            </div>
            <figure class="lector-estrofas__visual" id="estrofa-recurso">
                <!-- Una imagen o animación asociada al significado de la estrofa. -->
            </figure>
        </div>
        <div class="lector-estrofas__navegacion" aria-label="Cambio de estrofa">
            <button id="estrofa-anterior" type="button" disabled>Estrofa anterior</button>
            <button id="estrofa-siguiente" type="button" disabled>Estrofa siguiente</button>
        </div>
    </section>
    <section id="lectura-continua" class="lectura-continua" aria-label="Lectura continua" hidden>
        <!-- El equipo podrá reutilizar aquí las estrofas obtenidas por REST. -->
    </section>
</article>
