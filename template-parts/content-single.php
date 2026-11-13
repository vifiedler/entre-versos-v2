<?php
/** Contenido para una entrada nativa de WordPress. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
    <h1><?php the_title(); ?></h1>
    <div><?php the_content(); ?></div>
</article>
