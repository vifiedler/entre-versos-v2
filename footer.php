<?php
/** Cierre de documento. Barra inferior persistente, sin footer visual. @package EntreVersos */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( is_singular( array( 'ant_poeta', 'ant_poema' ) ) ) {
    get_template_part( 'assets/templates/reproductor-youtube' );
}
get_template_part( 'assets/templates/barra-inferior' );
?>
</div><!-- #pagina -->
<?php wp_footer(); ?>
</body>
</html>
