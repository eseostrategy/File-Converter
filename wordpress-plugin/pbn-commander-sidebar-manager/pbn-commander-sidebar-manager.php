<?php
/**
 * Plugin Name: PBN Commander Sidebar Manager
 * Plugin URI: https://github.com/pbn-commander
 * Description: Client plugin for PBN Commander central dashboard handling sidebar links and backlink deployments only.
 * Version: 1.0.0
 * Author: PBN Commander Team
 * License: GPLv2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

define('PBN_COMMANDER_SIDEBAR_VERSION', '1.0.0');
define('PBN_COMMANDER_SIDEBAR_OPTION_KEY', 'pbn_commander_site_key');

class PBNCommanderSidebarManager {
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('widgets_init', array($this, 'register_sidebar_widget'));
    }

    public function add_admin_menu() {
        add_menu_page(
            'PBN Sidebar Link',
            'PBN Sidebar Link',
            'manage_options',
            'pbn-commander-sidebar',
            array($this, 'render_admin_page'),
            'dashicons-admin-links',
            101
        );
    }

    public function register_settings() {
        register_setting('pbn_commander_sidebar_options', PBN_COMMANDER_SIDEBAR_OPTION_KEY);
    }

    public function render_admin_page() {
        $site_key = get_option(PBN_COMMANDER_SIDEBAR_OPTION_KEY, '');
        ?>
        <div class="wrap">
            <h1>PBN Commander Sidebar Manager</h1>
            <p>Connect this WordPress website to your central PBN Commander Dashboard for sidebar widget link management.</p>
            <form method="post" action="options.php">
                <?php settings_fields('pbn_commander_sidebar_options'); ?>
                <?php do_settings_sections('pbn_commander_sidebar_options'); ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">Site API Key</th>
                        <td>
                            <input type="text" name="<?php echo PBN_COMMANDER_SIDEBAR_OPTION_KEY; ?>" value="<?php echo esc_attr($site_key); ?>" class="regular-text" placeholder="pbn_..." />
                            <p class="description">Copy the unique Site API Key generated in your PBN Commander Dashboard and paste it here.</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button('Save Credentials'); ?>
            </form>

            <div class="card" style="max-width:800px; margin-top:20px; padding:15px; background:#fff; border:1px solid #ccc;">
                <h2>Sidebar Widget Placement Guide</h2>
                <p>To display deployed sidebar links on your website, a site administrator must add the <strong>PBN Commander Sidebar Link</strong> widget to a active widget area:</p>
                <ol>
                    <li>Go to <strong>Appearance &rarr; Widgets</strong> (or <strong>Appearance &rarr; Editor</strong> for block themes).</li>
                    <li>Add the <strong>PBN Commander Sidebar Link</strong> widget to your Sidebar, Footer, or Widget Area.</li>
                    <li>Save changes. Deployed links from PBN Commander will automatically render in this widget.</li>
                </ol>
            </div>
        </div>
        <?php
    }

    public function register_rest_routes() {
        register_rest_route('pbn-commander-sidebar/v1', '/ping', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_ping'),
            'permission_callback' => array($this, 'verify_request_signature')
        ));

        register_rest_route('pbn-commander-sidebar/v1', '/sidebar-links', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_sidebar_link'),
            'permission_callback' => array($this, 'verify_request_signature')
        ));
    }

    public function verify_request_signature($request) {
        $stored_key = get_option(PBN_COMMANDER_SIDEBAR_OPTION_KEY, '');
        if (empty($stored_key)) {
            return new WP_Error('no_site_key', 'Site API key is not configured on this WordPress website', array('status' => 401));
        }

        $timestamp = $request->get_header('X-PBN-Timestamp');
        $signature = $request->get_header('X-PBN-Signature');

        if (empty($timestamp) || empty($signature)) {
            return new WP_Error('missing_headers', 'Missing authorization headers', array('status' => 401));
        }

        if (abs(time() - intval($timestamp)) > 300) {
            return new WP_Error('timestamp_expired', 'Request timestamp is expired', array('status' => 401));
        }

        $body = $request->get_body();
        $expected_signature = hash_hmac('sha256', $timestamp . '.' . $body, $stored_key);

        if (!hash_equals($expected_signature, $signature)) {
            return new WP_Error('invalid_signature', 'Invalid HMAC signature', array('status' => 403));
        }

        return true;
    }

    public function handle_ping($request) {
        return rest_ensure_response(array(
            'success' => true,
            'plugin' => 'PBN Commander Sidebar Manager',
            'version' => PBN_COMMANDER_SIDEBAR_VERSION,
            'wp_version' => get_bloginfo('version'),
            'site_title' => get_bloginfo('name'),
            'timestamp' => time()
        ));
    }

    public function handle_sidebar_link($request) {
        $params = $request->get_json_params();

        $link_url = isset($params['url']) ? esc_url_raw($params['url']) : '';
        $anchor = isset($params['anchor_text']) ? sanitize_text_field($params['anchor_text']) : '';
        $rel = isset($params['rel']) ? sanitize_text_field($params['rel']) : 'dofollow';
        $target = isset($params['target']) ? sanitize_text_field($params['target']) : '_blank';
        $widget_title = isset($params['widget_title']) ? sanitize_text_field($params['widget_title']) : 'Sponsored Links';

        if (empty($link_url) || empty($anchor)) {
            return new WP_Error('missing_data', 'URL and anchor text required', array('status' => 400));
        }

        $widget_data = array(
            'url' => $link_url,
            'anchor' => $anchor,
            'rel' => $rel,
            'target' => $target,
            'title' => $widget_title
        );

        update_option('pbn_commander_widget_data', $widget_data);

        return rest_ensure_response(array(
            'success' => true,
            'plugin' => 'PBN Commander Sidebar Manager',
            'message' => 'Sidebar link widget updated successfully'
        ));
    }

    public function register_sidebar_widget() {
        register_widget('PBN_Commander_Sidebar_Widget');
    }
}

class PBN_Commander_Sidebar_Widget extends WP_Widget {
    public function __construct() {
        parent::__construct(
            'pbn_commander_sidebar_widget',
            'PBN Commander Sidebar Link',
            array('description' => 'Displays managed sidebar links from PBN Commander Sidebar Manager')
        );
    }

    public function widget($args, $instance) {
        $data = get_option('pbn_commander_widget_data', array());
        if (empty($data) || empty($data['url'])) return;

        echo $args['before_widget'];
        if (!empty($data['title'])) {
            echo $args['before_title'] . esc_html($data['title']) . $args['after_title'];
        }

        $rel_attr = !empty($data['rel']) && $data['rel'] !== 'dofollow' ? ' rel="' . esc_attr($data['rel']) . '"' : '';
        $target_attr = !empty($data['target']) ? ' target="' . esc_attr($data['target']) . '"' : '';

        echo '<div class="pbn-commander-link-box">';
        echo '<a href="' . esc_url($data['url']) . '"' . $rel_attr . $target_attr . '>' . esc_html($data['anchor']) . '</a>';
        echo '</div>';
        echo $args['after_widget'];
    }
}

new PBNCommanderSidebarManager();
