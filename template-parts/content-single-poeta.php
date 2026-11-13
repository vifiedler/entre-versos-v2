<?php
/**
 * Experiencia de poeta: estructura de pantallas para Slick y vista ampliada.
 * Archivo cargado desde single-ant_poeta.php según las convenciones del equipo.
 * @package EntreVersos
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$nombre = get_the_title();
$resumen = get_the_excerpt();
$retrato = has_post_thumbnail();
$pais = get_post_meta( get_the_ID(), 'pais_origen', true );
$lugar = get_post_meta( get_the_ID(), 'lugar_nacimiento', true );
?>
<article id="poeta-<?php the_ID(); ?>" <?php post_class( 'vista-poeta' ); ?> data-poeta-id="<?php echo esc_attr( get_the_ID() ); ?>">
    <div class="vista-poeta__metadatos">
        <span class="etiqueta-editorial etiqueta-editorial--oscura">Archivo vivo LATAM</span>
        <span class="etiqueta-editorial">Biografía y obras</span>
    </div>
    <h1 class="vista-poeta__titulo mt-3"><?php echo esc_html( $nombre ); ?></h1>

    <section class="pantallas-poeta" id="pantallas-poeta" aria-label="Pantallas de la vida y obra del poeta">
        <div class="pantallas-poeta__contenedor" id="carrusel-poeta">
            <section class="pantallas-poeta__tarjeta tarjeta-editorial pantallas-poeta__contexto" aria-label="Contexto del autor">
                <div class="d-flex justify-content-between align-items-center gap-2 border-bottom border-2 border-dark pb-2">
                    <span class="etiqueta-editorial etiqueta-editorial--clara">Antecedentes</span>
                    <span class="fuente-mono">00 / Contexto</span>
                </div>
                <h2 class="pantallas-poeta__subtitulo">Vida y contexto</h2>
                <p class="pantallas-poeta__descripcion"><?php echo $resumen ? esc_html( $resumen ) : 'Introducción biográfica disponible desde WordPress y la API REST.'; ?></p>
                <div class="mt-auto border-top border-2 border-dark pt-3 fuente-mono"><?php echo esc_html( trim( $lugar . ( $pais ? ', ' . $pais : '' ) ) ?: 'Archivo biográfico' ); ?></div>
            </section>

            <section class="pantallas-poeta__tarjeta tarjeta-editorial pantallas-poeta__biografia" aria-label="Ficha y biografía">
                <div class="d-flex justify-content-between align-items-center gap-2 mb-4">
                    <span class="fuente-mono"><span class="texto-lima" aria-hidden="true">■</span> Expediente monográfico</span>
                    <span class="etiqueta-editorial">01 / Biografía</span>
                </div>
                <div class="row g-4 pantallas-poeta__ficha">
                    <div class="col-12 col-md-5">
                        <div class="pantallas-poeta__imagen">
                            <?php if ( $retrato ) : ?>
                                <?php echo get_the_post_thumbnail( get_the_ID(), 'large', array( 'alt' => esc_attr( $nombre ), 'loading' => 'lazy' ) ); ?>
                            <?php else : ?>
                                <i class="bi bi-person-bounding-box" aria-hidden="true"></i>
                            <?php endif; ?>
                        </div>
                        <p class="text-center fuente-mono mt-2 mb-0">Figura 01 / Retrato</p>
                    </div>
                    <div class="col-12 col-md-7 d-flex flex-column">
                        <span class="fuente-mono">Autor seleccionado</span>
                        <h2 class="pantallas-poeta__subtitulo"><?php echo esc_html( $nombre ); ?></h2>
                        <?php if ( $lugar || $pais ) : ?><p class="fuente-mono border border-dark p-2"><i class="bi bi-geo-alt" aria-hidden="true"></i> <?php echo esc_html( trim( $lugar . ( $pais ? ', ' . $pais : '' ) ) ); ?></p><?php endif; ?>
                        <p class="pantallas-poeta__descripcion"><?php echo $resumen ? esc_html( $resumen ) : 'Aquí aparecerá el resumen biográfico recuperado mediante la API REST.'; ?></p>
                        <div class="mt-auto pt-3 border-top border-2 border-dark fuente-mono">Antología / Vida y obra</div>
                    </div>
                </div>
                <div class="pantallas-poeta__obras d-flex justify-content-between align-items-end gap-3 flex-wrap">
                    <span class="fuente-mono"><i class="bi bi-patch-check" aria-hidden="true"></i> Edición crítica anotada</span>
                    <button type="button" id="ampliar-biografia" class="boton-editorial boton-editorial--primario" disabled>Ampliar biografía <i class="bi bi-arrow-up-right" aria-hidden="true"></i></button>
                </div>
            </section>
        </div>
        <div class="pantallas-poeta__controles" role="group" aria-label="Navegación del carrusel de pantallas">
            <span class="fuente-mono align-self-center me-2">Deslizar pantallas:</span>
            <button id="pantalla-anterior" type="button" class="boton-editorial boton-editorial--compacto" aria-label="Pantalla anterior" disabled><i class="bi bi-arrow-left" aria-hidden="true"></i></button>
            <button id="pantalla-siguiente" type="button" class="boton-editorial boton-editorial--primario boton-editorial--compacto" aria-label="Pantalla siguiente" disabled><i class="bi bi-arrow-right" aria-hidden="true"></i></button>
        </div>
    </section>

    <section class="pantallas-poeta__indice tarjeta-editorial" aria-labelledby="titulo-obras-poeta">
        <div class="row g-4 align-items-center">
            <div class="col-12 col-lg-6">
                <span class="fuente-mono"><span class="texto-lima" aria-hidden="true">■</span> Archivo vivo LATAM</span>
                <h2 id="titulo-obras-poeta" class="pantallas-poeta__indice-nombre"><?php echo esc_html( $nombre ); ?></h2>
                <span class="fuente-mono">Obras disponibles en el archivo</span>
            </div>
            <div class="col-12 col-lg-6">
                <div class="d-flex gap-2 flex-wrap" id="contenido-obras" aria-live="polite">
                    <!-- El equipo cargará aquí las pantallas de poemas relacionadas mediante REST. -->
                    <span class="etiqueta-editorial etiqueta-editorial--clara">Obras pendientes de carga</span>
                </div>
            </div>
        </div>
    </section>

    <section id="biografia-ampliada" class="pagina-informativa" aria-labelledby="titulo-biografia-ampliada" hidden>
        <span class="etiqueta-editorial">Ficha documental</span>
        <h2 id="titulo-biografia-ampliada" class="pagina-informativa__titulo mt-3"><?php echo esc_html( $nombre ); ?> / Biografía</h2>
        <div id="contenido-biografia" class="pagina-informativa__contenido"><?php the_content(); ?></div>
    </section>
</article>
