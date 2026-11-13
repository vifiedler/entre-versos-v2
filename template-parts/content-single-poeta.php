<?php
/** Marco de la experiencia biográfica: el contenido se recuperará por REST. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<article id="poeta-<?php the_ID(); ?>" <?php post_class( 'vista-poeta' ); ?> data-poeta-id="<?php echo esc_attr( get_the_ID() ); ?>">
    <h1 class="vista-poeta__titulo"><?php echo esc_html( get_the_title() ); ?></h1>
    <section class="pantallas-poeta" id="pantallas-poeta" aria-label="Biografía y poemas del poeta">
        <div id="carrusel-poeta" class="pantallas-poeta__contenedor">
            <section class="pantallas-poeta__biografia" aria-label="Biografía">
                <h2>Biografía</h2>
                <div id="contenido-biografia"><!-- Se completará con los datos de SCF / REST. --></div>
            </section>
            <section class="pantallas-poeta__obras" aria-label="Poemas">
                <h2>Poemas</h2>
                <div id="contenido-obras"><!-- Tarjetas y pantallas se cargarán mediante REST. --></div>
            </section>
        </div>
    </section>
</article>
