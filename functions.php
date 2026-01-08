<?php
function eseo_strategy_scripts() {
    // Enqueue Font Awesome
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', array(), '6.0.0');

    // Enqueue Main Style
    wp_enqueue_style('eseo-style', get_stylesheet_uri(), array(), '1.0');

    // Enqueue Main Script
    wp_enqueue_script('eseo-script', get_template_directory_uri() . '/script.js', array(), '1.0', true);
}
add_action('wp_enqueue_scripts', 'eseo_strategy_scripts');

function eseo_strategy_setup() {
    add_theme_support('title-tag');
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'eseo-strategy'),
    ));
}
add_action('after_setup_theme', 'eseo_strategy_setup');
?>
