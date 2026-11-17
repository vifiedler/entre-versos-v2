<?php
/**
 * Ficha individual del poeta: obras y cita destacadas junto a su biografía.
 * El excerpt sigue disponible para las tarjetas, pero no se imprime en esta vista.
 * @package EntreVersos
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

$id_poeta = get_the_ID();
$nombre = get_the_title();

// Los campos SCF/ACF también se guardan como post meta. Esta lectura es compatible
// con ambos mecanismos, sin modificar su registro ni sus datos.
$campo_poeta = static function ( $clave ) use ( $id_poeta ) {
    $valor = function_exists( 'get_field' ) ? get_field( $clave, $id_poeta ) : null;
    if ( ! is_string( $valor ) ) {
        $valor = get_post_meta( $id_poeta, $clave, true );
    }
    return is_string( $valor ) ? trim( $valor ) : '';
};

$obras_texto   = $campo_poeta( 'obras_destacadas' );
$cita          = $campo_poeta( 'cita_destacada' );
$pais          = $campo_poeta( 'pais_origen' );
$lugar         = $campo_poeta( 'lugar_nacimiento' );
$nacimiento    = $campo_poeta( 'fecha_nacimiento' );
$fallecimiento = $campo_poeta( 'fecha_fallecimiento' );

// SCF guarda una obra por línea: «Título (1922)»; el año es opcional.
// Admitimos también «Título — 1922» y «1922 — Título» para futuras altas.
$obras = array();
foreach ( preg_split( '/\r\n|\r|\n/u', $obras_texto ) as $linea ) {
    $linea = trim( $linea );
    if ( '' === $linea ) { continue; }
    $titulo_obra = $linea;
    $anio_obra = '';
    if ( preg_match( '/^(.+?)\s*\((\d{4})\)$/u', $linea, $coincidencias ) ||
         preg_match( '/^(.+?)\s*[—–-]\s*(\d{4})$/u', $linea, $coincidencias ) ) {
        $titulo_obra = trim( $coincidencias[1] );
        $anio_obra   = $coincidencias[2];
    } elseif ( preg_match( '/^(\d{4})\s*[—–-]\s*(.+)$/u', $linea, $coincidencias ) ) {
        $titulo_obra = trim( $coincidencias[2] );
        $anio_obra   = $coincidencias[1];
    }
    $obras[] = array( 'titulo' => $titulo_obra, 'anio' => $anio_obra );
}

$origen = implode( ', ', array_filter( array( $lugar, $pais ) ) );
?>
<article id="poeta-<?php the_ID(); ?>" <?php post_class( 'vista-poeta' ); ?> data-poeta-id="<?php echo esc_attr( $id_poeta ); ?>">
    <div class="vista-poeta__metadatos">
        <span class="etiqueta-editorial">Biografía y obras</span>
    </div>
    <h1 class="vista-poeta__titulo"><?php echo esc_html( $nombre ); ?></h1>

    <div class="pantallas-poeta" id="pantallas-poeta">
        <div class="pantallas-poeta__contenedor" id="carrusel-poeta">
            <section class="pantallas-poeta__tarjeta tarjeta-editorial pantallas-poeta__contexto" aria-labelledby="titulo-contexto-poeta">
                <div class="d-flex justify-content-between align-items-center gap-2 border-bottom border-2 border-dark pb-2">
                    <span class="etiqueta-editorial etiqueta-editorial--clara">Trayectoria literaria</span>
                    <span class="fuente-mono">Obras</span>
                </div>
                <h2 id="titulo-contexto-poeta" class="pantallas-poeta__subtitulo">Vida y obra</h2>
                <?php if ( $obras ) : ?>
                    <ol class="obras-poeta" aria-label="Obras destacadas de <?php echo esc_attr( $nombre ); ?>">
                        <?php foreach ( $obras as $obra ) : ?>
                            <li class="obras-poeta__item">
                                <span class="obras-poeta__titulo"><?php echo esc_html( $obra['titulo'] ); ?></span>
                                <?php if ( $obra['anio'] ) : ?>
                                    <span class="obras-poeta__anio fuente-mono"><?php echo esc_html( $obra['anio'] ); ?></span>
                                <?php endif; ?>
                            </li>
                        <?php endforeach; ?>
                    </ol>
                <?php else : ?>
                    <p class="obras-poeta__vacio fuente-mono">Obras destacadas por incorporar.</p>
                <?php endif; ?>
                <?php if ( $cita ) : ?>
                    <aside class="cita-poeta" aria-label="Cita destacada del poeta">
                        <span class="etiqueta-editorial">Cita destacada</span>
                        <blockquote class="cita-poeta__texto">
                            <p><?php echo nl2br( esc_html( $cita ) ); ?></p>
                        </blockquote>
                    </aside>
                <?php endif; ?>
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
                                    <?php echo get_the_post_thumbnail( $id_poeta, 'large', array( 'alt' => esc_attr( $nombre ), 'loading' => 'lazy' ) ); ?>
                                <?php else : ?>
                                    <i class="bi bi-person-bounding-box" aria-hidden="true"></i>
                                <?php endif; ?>
                            </div>
                            <figcaption class="text-center fuente-mono mt-2">Retrato del autor</figcaption>
                        </figure>
                    </div>
                    <div class="col-12 col-lg-8">
                        <h2 id="titulo-biografia-poeta" class="pantallas-poeta__subtitulo mt-0">Biografía</h2>
                        <?php if ( $origen || $nacimiento || $fallecimiento ) : ?>
                            <dl class="datos-biograficos fuente-mono" aria-label="Datos biográficos">
                                <?php if ( $origen ) : ?>
                                    <dt>Origen</dt><dd><?php echo esc_html( $origen ); ?></dd>
                                <?php endif; ?>
                                <?php if ( $nacimiento ) : ?>
                                    <dt>Nacimiento</dt><dd><?php echo esc_html( $nacimiento ); ?></dd>
                                <?php endif; ?>
                                <?php if ( $fallecimiento ) : ?>
                                    <dt>Fallecimiento</dt><dd><?php echo esc_html( $fallecimiento ); ?></dd>
                                <?php endif; ?>
                            </dl>
                        <?php endif; ?>
                        <div id="contenido-biografia" class="pantallas-poeta__biografia-completa">
                            <?php if ( trim( get_the_content() ) ) : ?>
                                <?php the_content(); ?>
                            <?php else : ?>
                                <p>Biografía pendiente de publicación.</p>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <nav class="pantallas-poeta__indice tarjeta-editorial" aria-label="Poemas de <?php echo esc_attr( $nombre ); ?>">
        <div id="contenido-obras" class="d-flex gap-2 flex-wrap align-items-center" aria-live="polite">
            <span class="fuente-mono">Cargando poemas del autor…</span>
        </div>
    </nav>
</article>
