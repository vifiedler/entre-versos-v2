<?php
/**
 * Pantalla completa de un poeta: biografía de Gutenberg visible y enlaces a sus poemas.
 * Sin modal de ampliación; la navegación de obras se recupera desde REST API.
 * @package EntreVersos
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$nombre = get_the_title();
$resumen = get_the_excerpt();
$pais = get_post_meta( get_the_ID(), 'pais_origen', true );
$lugar = get_post_meta( get_the_ID(), 'lugar_nacimiento', true );
?>
<article id="poeta-<?php the_ID(); ?>" <?php post_class( 'vista-poeta' ); ?> data-poeta-id="<?php echo esc_attr( get_the_ID() ); ?>">
    <div class="vista-poeta__metadatos">
        <span class="etiqueta-editorial">Biografía y obras</span>
    </div>
    <h1 class="vista-poeta__titulo"><?php echo esc_html( $nombre ); ?></h1>

    <div class="pantallas-poeta" id="pantallas-poeta">
        <div class="pantallas-poeta__contenedor" id="carrusel-poeta">
            <section class="pantallas-poeta__tarjeta tarjeta-editorial pantallas-poeta__contexto" aria-labelledby="titulo-contexto-poeta">
                <div class="d-flex justify-content-between align-items-center gap-2 border-bottom border-2 border-dark pb-2">
                    <span class="etiqueta-editorial etiqueta-editorial--clara">Antecedentes</span>
                    <span class="fuente-mono">Contexto</span>
                </div>
                <h2 id="titulo-contexto-poeta" class="pantallas-poeta__subtitulo">Vida y contexto</h2>
                <p class="pantallas-poeta__descripcion"><?php echo esc_html( $resumen ); ?></p>
                <p class="pantallas-poeta__origen fuente-mono mt-auto border-top border-2 border-dark pt-3 mb-0"><?php echo esc_html( trim( $lugar . ( $pais ? ', ' . $pais : '' ) ) ); ?></p>
            </section>

            <section class="pantallas-poeta__tarjeta tarjeta-editorial pantallas-poeta__biografia" aria-labelledby="titulo-biografia-poeta">
                <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
                    <span class="fuente-mono"><span class="texto-lima" aria-hidden="true">■</span> Expediente biográfico</span>
                    <span class="etiqueta-editorial">Biografía</span>
                </div>
                <div class="row g-3 g-lg-4 pantallas-poeta__ficha">
                    <div class="col-12 col-lg-4">
                        <figure class="mb-0">
                            <div class="pantallas-poeta__imagen">
                                <?php if ( has_post_thumbnail() ) : ?>
                                    <?php echo get_the_post_thumbnail( get_the_ID(), 'large', array( 'alt' => esc_attr( $nombre ), 'loading' => 'lazy' ) ); ?>
                                <?php else : ?>
                                    <i class="bi bi-person-bounding-box" aria-hidden="true"></i>
                                <?php endif; ?>
                            </div>
                            <figcaption class="text-center fuente-mono mt-2">Retrato del autor</figcaption>
                        </figure>
                        <?php if ( $lugar || $pais ) : ?>
                            <p class="fuente-mono border border-dark p-2 mt-3 mb-0"><i class="bi bi-geo-alt" aria-hidden="true"></i> <?php echo esc_html( trim( $lugar . ( $pais ? ', ' . $pais : '' ) ) ); ?></p>
                        <?php endif; ?>
                    </div>
                    <div class="col-12 col-lg-8">
                        <h2 id="titulo-biografia-poeta" class="pantallas-poeta__subtitulo mt-0">Biografía</h2>
                        <div id="contenido-biografia" class="pantallas-poeta__biografia-completa">
                            <?php the_content(); ?>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <nav class="pantallas-poeta__indice tarjeta-editorial" aria-label="Obras de <?php echo esc_attr( $nombre ); ?>">
        <div id="contenido-obras" class="d-flex gap-2 flex-wrap align-items-center" aria-live="polite">
            <span class="fuente-mono">Cargando poemas del autor…</span>
        </div>
    </nav>
</article>
