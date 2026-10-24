<?php
/*
Plugin Name: ESEO Customizer
Plugin URI: https://eseostrategy.com
Description: Adds customizer settings for the ESEO Strategy theme (Colors, Contact Info, Social Links).
Version: 1.0
Author: Jules
Author URI: https://eseostrategy.com
License: GPLv2 or later
Text Domain: eseo-customizer
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register Customizer Settings
 */
function eseo_customize_register( $wp_customize ) {

    // --- Section: ESEO Colors ---
    $wp_customize->add_section( 'eseo_colors_section', array(
        'title'       => __( 'ESEO Theme Colors', 'eseo-customizer' ),
        'priority'    => 30,
        'description' => __( 'Customize the look and feel of your theme.', 'eseo-customizer' ),
    ) );

    // Primary Color
    $wp_customize->add_setting( 'eseo_primary_color', array(
        'default'           => '#3B82F6',
        'sanitize_callback' => 'sanitize_hex_color',
        'transport'         => 'refresh',
    ) );
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'eseo_primary_color', array(
        'label'    => __( 'Primary Color (Neon Blue)', 'eseo-customizer' ),
        'section'  => 'eseo_colors_section',
        'settings' => 'eseo_primary_color',
    ) ) );

    // Accent Color
    $wp_customize->add_setting( 'eseo_accent_color', array(
        'default'           => '#8B5CF6',
        'sanitize_callback' => 'sanitize_hex_color',
        'transport'         => 'refresh',
    ) );
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'eseo_accent_color', array(
        'label'    => __( 'Accent Color (Purple)', 'eseo-customizer' ),
        'section'  => 'eseo_colors_section',
        'settings' => 'eseo_accent_color',
    ) ) );

    // Background Color
    $wp_customize->add_setting( 'eseo_bg_color', array(
        'default'           => '#0B0F19',
        'sanitize_callback' => 'sanitize_hex_color',
        'transport'         => 'refresh',
    ) );
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'eseo_bg_color', array(
        'label'    => __( 'Background Color', 'eseo-customizer' ),
        'section'  => 'eseo_colors_section',
        'settings' => 'eseo_bg_color',
    ) ) );


    // --- Section: ESEO Contact Info ---
    $wp_customize->add_section( 'eseo_contact_section', array(
        'title'       => __( 'ESEO Contact Info', 'eseo-customizer' ),
        'priority'    => 31,
        'description' => __( 'Update contact details across the site.', 'eseo-customizer' ),
    ) );

    // Phone
    $wp_customize->add_setting( 'eseo_phone', array(
        'default'           => '+92 3113793342',
        'sanitize_callback' => 'sanitize_text_field',
    ) );
    $wp_customize->add_control( 'eseo_phone', array(
        'label'    => __( 'Phone Number', 'eseo-customizer' ),
        'section'  => 'eseo_contact_section',
        'type'     => 'text',
    ) );

    // Email
    $wp_customize->add_setting( 'eseo_email', array(
        'default'           => 'support@eseostrategy.com',
        'sanitize_callback' => 'sanitize_email',
    ) );
    $wp_customize->add_control( 'eseo_email', array(
        'label'    => __( 'Email Address', 'eseo-customizer' ),
        'section'  => 'eseo_contact_section',
        'type'     => 'email',
    ) );

    // Address
    $wp_customize->add_setting( 'eseo_address', array(
        'default'           => 'Office# 39, Reshmeen Center, Latifabad# 7, Hyderabad, Pakistan',
        'sanitize_callback' => 'sanitize_text_field',
    ) );
    $wp_customize->add_control( 'eseo_address', array(
        'label'    => __( 'Physical Address', 'eseo-customizer' ),
        'section'  => 'eseo_contact_section',
        'type'     => 'textarea',
    ) );


    // --- Section: ESEO Social Links ---
    $wp_customize->add_section( 'eseo_social_section', array(
        'title'       => __( 'ESEO Social Links', 'eseo-customizer' ),
        'priority'    => 32,
    ) );

    // Twitter
    $wp_customize->add_setting( 'eseo_social_twitter', array(
        'default'           => 'https://twitter.com/Mobeen_DMN',
        'sanitize_callback' => 'esc_url_raw',
    ) );
    $wp_customize->add_control( 'eseo_social_twitter', array(
        'label'    => __( 'Twitter URL', 'eseo-customizer' ),
        'section'  => 'eseo_social_section',
        'type'     => 'url',
    ) );

    // Facebook
    $wp_customize->add_setting( 'eseo_social_facebook', array(
        'default'           => 'https://www.facebook.com/eseostrategy/',
        'sanitize_callback' => 'esc_url_raw',
    ) );
    $wp_customize->add_control( 'eseo_social_facebook', array(
        'label'    => __( 'Facebook URL', 'eseo-customizer' ),
        'section'  => 'eseo_social_section',
        'type'     => 'url',
    ) );

    // Telegram
    $wp_customize->add_setting( 'eseo_social_telegram', array(
        'default'           => 'https://t.me/eseostrategy',
        'sanitize_callback' => 'esc_url_raw',
    ) );
    $wp_customize->add_control( 'eseo_social_telegram', array(
        'label'    => __( 'Telegram URL', 'eseo-customizer' ),
        'section'  => 'eseo_social_section',
        'type'     => 'url',
    ) );

    // Skype
    $wp_customize->add_setting( 'eseo_social_skype', array(
        'default'           => 'https://join.skype.com/invite/vnB22p2eSrCb',
        'sanitize_callback' => 'esc_url_raw',
    ) );
    $wp_customize->add_control( 'eseo_social_skype', array(
        'label'    => __( 'Skype URL', 'eseo-customizer' ),
        'section'  => 'eseo_social_section',
        'type'     => 'url',
    ) );
}
add_action( 'customize_register', 'eseo_customize_register' );


/**
 * Output Custom CSS
 */
function eseo_customize_css() {
    $primary = get_theme_mod( 'eseo_primary_color', '#3B82F6' );
    $accent  = get_theme_mod( 'eseo_accent_color', '#8B5CF6' );
    $bg      = get_theme_mod( 'eseo_bg_color', '#0B0F19' );

    $custom_css = "
        :root {
            --bg-dark: {$bg};
            --primary-blue: {$primary};
            --accent-purple: {$accent};
            /* Update gradient if colors change */
            --gradient-primary: linear-gradient(135deg, {$primary}, {$accent});
        }
    ";

    // Add inline style to the main theme stylesheet handle 'eseo-style'
    wp_add_inline_style( 'eseo-style', $custom_css );
}
add_action( 'wp_enqueue_scripts', 'eseo_customize_css', 20 );
?>
