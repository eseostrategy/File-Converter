<?php
function eseo_strategy_scripts() {
    // Enqueue Font Awesome
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', array(), '6.0.0');

    // Enqueue Google Fonts
    wp_enqueue_style('eseo-fonts', 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap', array(), null);

    // Enqueue Main Style
    wp_enqueue_style('eseo-style', get_stylesheet_uri(), array(), '1.1');

    // Enqueue Main Script
    wp_enqueue_script('eseo-script', get_template_directory_uri() . '/script.js', array(), '1.1', true);
}
add_action('wp_enqueue_scripts', 'eseo_strategy_scripts');

function eseo_strategy_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');

    // WooCommerce Theme Support
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');

    register_nav_menus(array(
        'primary'       => __('Primary Menu', 'eseo-strategy'),
        'services_menu' => __('Services Dropdown Menu', 'eseo-strategy'),
        'footer_menu'   => __('Footer Menu', 'eseo-strategy'),
    ));
}
add_action('after_setup_theme', 'eseo_strategy_setup');

/**
 * Custom Service Rewrite Rules
 */
function eseo_service_rewrite_rules() {
    add_rewrite_rule('^service/([^/]+)/?$', 'index.php?eseo_service=$matches[1]', 'top');
}
add_action('init', 'eseo_service_rewrite_rules');

function eseo_service_query_vars($vars) {
    $vars[] = 'eseo_service';
    return $vars;
}
add_filter('query_vars', 'eseo_service_query_vars');

function eseo_service_template_include($template) {
    $service_slug = get_query_var('eseo_service');
    if ($service_slug) {
        $custom_template = locate_template(array('page-service-detail.php'));
        if ($custom_template) {
            return $custom_template;
        }
    }
    return $template;
}
add_filter('template_include', 'eseo_service_template_include');

/**
 * Breadcrumb Helper Function
 */
function eseo_breadcrumbs() {
    if (is_front_page()) return;

    echo '<nav class="breadcrumbs" aria-label="Breadcrumb">';
    echo '<div class="container">';
    echo '<ol class="breadcrumb-list">';
    echo '<li class="breadcrumb-item"><a href="' . esc_url(home_url('/')) . '"><i class="fas fa-home"></i> Home</a></li>';

    $service_slug = get_query_var('eseo_service');
    if ($service_slug) {
        echo '<li class="breadcrumb-item"><a href="' . esc_url(home_url('/services')) . '">Services</a></li>';
        echo '<li class="breadcrumb-item active" aria-current="page">' . esc_html(ucwords(str_replace('-', ' ', $service_slug))) . '</li>';
    } elseif (function_exists('is_woocommerce') && is_woocommerce()) {
        if (is_product()) {
            echo '<li class="breadcrumb-item"><a href="' . esc_url(home_url('/services')) . '">Services & Products</a></li>';
            echo '<li class="breadcrumb-item active" aria-current="page">' . esc_html(get_the_title()) . '</li>';
        } elseif (is_shop() || is_product_category()) {
            echo '<li class="breadcrumb-item active" aria-current="page">Products Catalog</li>';
        }
    } elseif (is_page()) {
        global $post;
        if ($post && !empty($post->post_parent)) {
            $parent_id  = $post->post_parent;
            $breadcrumbs = array();
            while ($parent_id) {
                $page = get_page($parent_id);
                if ($page) {
                    $breadcrumbs[] = '<li class="breadcrumb-item"><a href="' . esc_url(get_permalink($page->ID)) . '">' . esc_html(get_the_title($page->ID)) . '</a></li>';
                    $parent_id  = $page->post_parent;
                } else {
                    break;
                }
            }
            $breadcrumbs = array_reverse($breadcrumbs);
            foreach ($breadcrumbs as $crumb) {
                echo $crumb;
            }
        }
        echo '<li class="breadcrumb-item active" aria-current="page">' . esc_html(get_the_title()) . '</li>';
    } elseif (is_single()) {
        echo '<li class="breadcrumb-item"><a href="' . esc_url(home_url('/blog')) . '">Blog</a></li>';
        echo '<li class="breadcrumb-item active" aria-current="page">' . esc_html(get_the_title()) . '</li>';
    } else {
        echo '<li class="breadcrumb-item active" aria-current="page">Page</li>';
    }

    echo '</ol>';
    echo '</div>';
    echo '</nav>';
}
