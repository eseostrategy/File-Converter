<?php
/**
 * Plugin Name: WP Telegram Direct Chat
 * Description: specific plugin to link website chat with Telegram. Replies in Telegram appear on the website.
 * Version: 1.0
 * Author: Jules
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'WTC_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WTC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// 1. Database Creation
register_activation_hook( __FILE__, 'wtc_create_table' );

function wtc_create_table() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'wtc_messages';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        session_id varchar(255) NOT NULL,
        sender varchar(50) NOT NULL, -- 'user' or 'admin'
        message text NOT NULL,
        telegram_message_id bigint(20) DEFAULT NULL,
        created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
    dbDelta( $sql );
}

// 2. Admin Settings
add_action('admin_menu', 'wtc_add_admin_menu');
add_action('admin_init', 'wtc_settings_init');

function wtc_add_admin_menu() {
    add_options_page('WP Telegram Chat', 'WP Telegram Chat', 'manage_options', 'wp-telegram-chat', 'wtc_options_page');
}

function wtc_settings_init() {
    register_setting('wtcPlugin', 'wtc_settings');
    add_settings_section('wtc_plugin_main', 'Settings', 'wtc_settings_section_cb', 'wp-telegram-chat');
    add_settings_field('wtc_bot_token', 'Bot Token', 'wtc_bot_token_cb', 'wp-telegram-chat', 'wtc_plugin_main');
    add_settings_field('wtc_chat_id', 'Chat ID (User ID)', 'wtc_chat_id_cb', 'wp-telegram-chat', 'wtc_plugin_main');
    add_settings_field('wtc_webhook_url', 'Webhook URL', 'wtc_webhook_url_cb', 'wp-telegram-chat', 'wtc_plugin_main');
}

function wtc_settings_section_cb() {
    echo '<p>Configure your Telegram Bot. Create a bot via @BotFather and get the token.</p>';
}

function wtc_bot_token_cb() {
    $options = get_option('wtc_settings');
    echo '<input type="text" name="wtc_settings[wtc_bot_token]" value="' . esc_attr($options['wtc_bot_token'] ?? '') . '" class="regular-text">';
}

function wtc_chat_id_cb() {
    $options = get_option('wtc_settings');
    echo '<input type="text" name="wtc_settings[wtc_chat_id]" value="' . esc_attr($options['wtc_chat_id'] ?? '') . '" class="regular-text">';
    echo '<p class="description">Your Telegram numeric User ID. Send a message to your bot to find it (or use @userinfobot).</p>';
}

function wtc_webhook_url_cb() {
    $url = site_url('/wp-json/wtc/v1/webhook');
    echo '<input type="text" value="' . esc_attr($url) . '" class="regular-text" readonly>';
    echo '<p class="description">Set this as your Webhook URL for the bot: <code>https://api.telegram.org/bot&lt;TOKEN&gt;/setWebhook?url=' . $url . '</code></p>';
}

function wtc_options_page() {
    ?>
    <div class="wrap">
        <h2>WP Telegram Chat</h2>
        <form action="options.php" method="post">
            <?php
            settings_fields('wtcPlugin');
            do_settings_sections('wp-telegram-chat');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

// 3. Frontend Assets
add_action('wp_enqueue_scripts', 'wtc_enqueue_scripts');
function wtc_enqueue_scripts() {
    wp_enqueue_style('wtc-style', WTC_PLUGIN_URL . 'css/style.css');
    wp_enqueue_script('wtc-script', WTC_PLUGIN_URL . 'js/script.js', array('jquery'), '1.0', true);
    wp_localize_script('wtc-script', 'wtc_ajax', array(
        'rest_url' => esc_url_raw(rest_url('wtc/v1/')),
        'nonce' => wp_create_nonce('wp_rest')
    ));
}

// Add chat container to footer
add_action('wp_footer', 'wtc_add_chat_widget');
function wtc_add_chat_widget() {
    ?>
    <div id="wtc-chat-widget">
        <div id="wtc-chat-header">Chat with us</div>
        <div id="wtc-chat-messages"></div>
        <div id="wtc-chat-input-area">
            <input type="text" id="wtc-chat-input" placeholder="Type a message...">
            <button id="wtc-send-btn">Send</button>
        </div>
    </div>
    <div id="wtc-chat-toggle">💬</div>
    <?php
}

// 4. REST API
add_action('rest_api_init', function () {
    register_rest_route('wtc/v1', '/send', array(
        'methods' => 'POST',
        'callback' => 'wtc_handle_send_message',
        'permission_callback' => '__return_true'
    ));
    register_rest_route('wtc/v1', '/messages', array(
        'methods' => 'GET',
        'callback' => 'wtc_get_messages',
        'permission_callback' => '__return_true'
    ));
    register_rest_route('wtc/v1', '/webhook', array(
        'methods' => 'POST',
        'callback' => 'wtc_handle_webhook',
        'permission_callback' => '__return_true'
    ));
});

function wtc_handle_send_message($request) {
    global $wpdb;
    $params = $request->get_json_params();
    $message = sanitize_text_field($params['message']);
    $session_id = sanitize_text_field($params['session_id']);

    if (empty($message) || empty($session_id)) {
        return new WP_Error('invalid_data', 'Missing fields', array('status' => 400));
    }

    $options = get_option('wtc_settings');
    $bot_token = $options['wtc_bot_token'] ?? '';
    $chat_id = $options['wtc_chat_id'] ?? '';

    // Send to Telegram
    $telegram_message_id = null;
    if ($bot_token && $chat_id) {
        $text = "New message from website user ($session_id):\n\n" . $message;
        $url = "https://api.telegram.org/bot$bot_token/sendMessage";
        $response = wp_remote_post($url, array(
            'body' => array(
                'chat_id' => $chat_id,
                'text' => $text
            )
        ));

        if (!is_wp_error($response)) {
            $body = json_decode(wp_remote_retrieve_body($response), true);
            if (isset($body['result']['message_id'])) {
                $telegram_message_id = $body['result']['message_id'];
            }
        }
    }

    // Save to DB
    $table_name = $wpdb->prefix . 'wtc_messages';
    $wpdb->insert(
        $table_name,
        array(
            'session_id' => $session_id,
            'sender' => 'user',
            'message' => $message,
            'telegram_message_id' => $telegram_message_id,
            'created_at' => current_time('mysql')
        )
    );

    return array('success' => true);
}

function wtc_get_messages($request) {
    global $wpdb;
    $session_id = sanitize_text_field($request->get_param('session_id'));
    $last_id = intval($request->get_param('last_id'));

    $table_name = $wpdb->prefix . 'wtc_messages';
    $results = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM $table_name WHERE session_id = %s AND id > %d ORDER BY created_at ASC",
        $session_id, $last_id
    ));

    return $results;
}

function wtc_handle_webhook($request) {
    global $wpdb;
    $data = $request->get_json_params();

    // Check if it's a message
    if (!isset($data['message'])) {
        return array('status' => 'ok');
    }

    $msg = $data['message'];

    // Check if it's a reply to a message sent by the bot
    if (isset($msg['reply_to_message'])) {
        $reply_to_id = $msg['reply_to_message']['message_id'];
        $text = $msg['text'];

        // Find the original message in DB to get the session_id
        $table_name = $wpdb->prefix . 'wtc_messages';
        $original_msg = $wpdb->get_row($wpdb->prepare(
            "SELECT session_id FROM $table_name WHERE telegram_message_id = %d",
            $reply_to_id
        ));

        if ($original_msg) {
            $wpdb->insert(
                $table_name,
                array(
                    'session_id' => $original_msg->session_id,
                    'sender' => 'admin',
                    'message' => $text,
                    'created_at' => current_time('mysql')
                )
            );
        }
    }

    return array('status' => 'ok');
}
