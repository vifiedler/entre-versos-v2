<?php
/**
 * Lector editorial de poema. La transición siempre avanza estrofa por estrofa.
 * La imagen destacada nativa es la imagen de cierre/lectura completa.
 * @package EntreVersos
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$poeta_id = absint( get_post_meta( get_the_ID(), 'poeta_relacionado', true ) );
$poeta_nombre = ( $poeta_id && 'ant_poeta' === get_post_type( $poeta_id ) ) ? get_the_title( $poeta_id ) : 'Poeta relacionado';
?>
<article id="poema-<?php the_ID(); ?>" <?php post_class( 'vista-poema' ); ?>
    data-poema-id="<?php echo esc_attr( get_the_ID() ); ?>">
    <header class="vista-poema__encabezado">
        <div>
            <div class="vista-poema__metadatos mb-2">
                <span class="etiqueta-editorial">Lectura por estrofas</span>
                <span class="fuente-mono"><?php echo esc_html( $poeta_nombre ); ?></span>
            </div>
            <h1 id="titulo-poema" class="vista-poema__titulo"><?php echo esc_html( get_the_title() ); ?></h1>
        </div>
        <span class="etiqueta-editorial etiqueta-editorial--clara">Modo escénico</span>
    </header>

    <section class="lector-estrofas" id="lector-estrofas" aria-label="Lectura por estrofas">
        <div class="lector-estrofas__panel">
            <div class="lector-estrofas__cabecera">
                <div class="d-flex align-items-center gap-2 flex-wrap">
                    <span id="contador-estrofas" class="etiqueta-editorial" aria-live="polite">Estrofa — / —</span>
                    <span class="fuente-mono">Edición poética</span>
                </div>
                <button id="ver-lectura-continua" type="button" class="boton-editorial boton-editorial--compacto"
                    aria-controls="lectura-continua" aria-expanded="false"><i class="bi bi-text-paragraph"
                        aria-hidden="true"></i> Lectura continua</button>
            </div>
            <div class="lector-estrofas__disposicion">
                <div id="estrofa-versos" class="lector-estrofas__versos">
                    <span class="fuente-mono"><span class="texto-lima" aria-hidden="true">■</span> Estrofa /
                        Versos</span>
                    <ol id="lista-versos" class="lector-estrofas__versos-lista">
                        <!-- Todos los versos de una única estrofa se recibirán desde SCF/REST. -->
                        <li class="lector-estrofas__verso texto-secundario"><span
                                class="lector-estrofas__verso-numero">01</span><span>Contenido pendiente de la API
                                REST</span></li>
                    </ol>
                    <div class="border-top border-2 border-dark pt-3 mt-auto fuente-mono">Una palabra clave por verso /
                        Sólo resaltado visual</div>
                </div>
                <figure id="estrofa-recurso" class="lector-estrofas__visual">
                    <div id="imagen-estrofa" class="lector-estrofas__imagen"><i class="bi bi-image"
                            aria-hidden="true"></i></div>
                    <figcaption class="lector-estrofas__pie d-flex align-items-center justify-content-between gap-3">
                        <span>Imagen relacionada con la estrofa</span><span class="etiqueta-editorial">FIG. —</span>
                    </figcaption>
                </figure>
            </div>
        </div>
        <div class="lector-estrofas__navegacion">
            <button id="estrofa-anterior" type="button" class="boton-editorial" disabled><i class="bi bi-arrow-left"
                    aria-hidden="true"></i> Estrofa anterior</button>
            <span class="lector-estrofas__leyenda d-none d-md-inline">El avance es por estrofa completa</span>
            <button id="estrofa-siguiente" type="button" class="boton-editorial boton-editorial--primario"
                disabled>Estrofa siguiente <i class="bi bi-arrow-right" aria-hidden="true"></i></button>
        </div>
    </section>

    <section id="lectura-continua" class="lectura-continua tarjeta-editorial" aria-labelledby="titulo-lectura-continua"
        hidden>
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <span class="etiqueta-editorial">Modo / Lectura continua</span>
            <button id="volver-a-estrofas" type="button" class="boton-editorial boton-editorial--compacto"
                aria-controls="lector-estrofas"><i class="bi bi-arrow-left" aria-hidden="true"></i> Volver a
                estrofas</button>
        </div>
        <h2 id="titulo-lectura-continua" class="pantallas-poeta__subtitulo mt-3">
            <?php echo esc_html( get_the_title() ); ?></h2>
        <p class="fuente-mono"><?php echo esc_html( $poeta_nombre ); ?></p>
        <div id="lectura-continua-estrofas" class="lectura-continua__estrofas">
            <!-- Reunirá las mismas estrofas recibidas por REST. -->
        </div>
        <section id="poema-cierre" class="poema-cierre tarjeta-editorial" aria-labelledby="titulo-cierre-poema" hidden>
            <span class="etiqueta-editorial">Final del poema</span>
            <h2 id="titulo-cierre-poema" class="pantallas-poeta__subtitulo mt-3">
                <?php echo esc_html( get_the_title() ); ?></h2>
            <p class="fuente-mono"><?php echo esc_html( $poeta_nombre ); ?></p>
            <figure class="poema-cierre__imagen">
                <?php if ( has_post_thumbnail() ) : ?>
                <?php echo get_the_post_thumbnail( get_the_ID(), 'large', array( 'loading' => 'lazy' ) ); ?>
                <?php else : ?>
                <div class="lector-estrofas__imagen"><i class="bi bi-image" aria-hidden="true"></i></div>
                <?php endif; ?>
            </figure>
        </section>
    </section>
</article>