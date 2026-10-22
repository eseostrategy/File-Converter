<?php
/**
 * Plugin Name: PBN Commander Post Manager
 * Plugin URI: https://github.com/pbn-commander
 * Description: Client plugin for PBN Commander central dashboard handling remote article publishing and post management only.
 * Version: 1.0.0
 * Author: PBN Commander Team
 * License: GPLv2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

define('PBN_COMMANDER_POST_VERSION', '1.0.0');
define('PBN_COMMANDER_POST_OPTION_KEY', 'pbn_commander_site_key');

class PBNCommanderPostManager {
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('wp_head', array($this, 'output_canonical_url'));
    }

    public function add_admin_menu() {
        add_menu_page(
            'PBN Post Manager',
            'PBN Post Manager',
            'manage_options',
            'pbn-commander-post',
            array($this, 'render_admin_page'),
            'dashicons-edit-page',
            100
        );
    }

    public function register_settings() {
        register_setting('pbn_commander_post_options', PBN_COMMANDER_POST_OPTION_KEY);
    }

    public function render_admin_page() {
        $site_key = get_option(PBN_COMMANDER_POST_OPTION_KEY, '');
        ?>
        <div class="wrap">
            <h1>PBN Commander Post Manager</h1>
            <p>Connect this WordPress website to your central PBN Commander Dashboard for remote article publishing.</p>
            <form method="post" action="options.php">
                <?php settings_fields('pbn_commander_post_options'); ?>
                <?php do_settings_sections('pbn_commander_post_options'); ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">Site API Key</th>
                        <td>
                            <input type="text" name="<?php echo PBN_COMMANDER_POST_OPTION_KEY; ?>" value="<?php echo esc_attr($site_key); ?>" class="regular-text" placeholder="pbn_..." />
                            <p class="description">Copy the unique Site API Key generated in your PBN Commander Dashboard and paste it here.</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button('Save Credentials'); ?>
            </form>
        </div>
        <?php
    }

    public function register_rest_routes() {
        register_rest_route('pbn-commander-post/v1', '/ping', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_ping'),
            'permission_callback' => array($this, 'verify_request_signature')
        ));

        register_rest_route('pbn-commander-post/v1', '/publish', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_publish'),
            'permission_callback' => array($this, 'verify_request_signature')
        ));
    }

    public function verify_request_signature($request) {
        $stored_key = get_option(PBN_COMMANDER_POST_OPTION_KEY, '');
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
            'plugin' => 'PBN Commander Post Manager',
            'version' => PBN_COMMANDER_POST_VERSION,
            'wp_version' => get_bloginfo('version'),
            'site_title' => get_bloginfo('name'),
            'timestamp' => time()
        ));
    }

    public function handle_publish($request) {
        $params = $request->get_json_params();

        $title = isset($params['title']) ? sanitize_text_field($params['title']) : '';
        $content = isset($params['content']) ? wp_kses_post($params['content']) : '';
        $post_status = isset($params['status']) ? sanitize_text_field($params['status']) : 'publish';

        if (empty($title) || empty($content)) {
            return new WP_Error('missing_data', 'Title and content are required', array('status' => 400));
        }

        // Process optional backlink insertion safely
        if (!empty($params['backlink_url']) && !empty($params['backlink_keyword'])) {
            $backlink_url = esc_url_raw($params['backlink_url']);
            $backlink_keyword = sanitize_text_field($params['backlink_keyword']);

            $scheme = parse_url($backlink_url, PHP_URL_SCHEME);
            if (in_array(strtolower($scheme), array('http', 'https')) && !empty($backlink_keyword)) {
                $link_html = '<p class="pbn-commander-backlink"><a href="' . esc_url($backlink_url) . '" target="_blank">' . esc_html($backlink_keyword) . '</a></p>';
                $content .= "\n\n" . wp_kses_post($link_html);
            }
        }

        $post_data = array(
            'post_title'   => $title,
            'post_content' => $content,
            'post_status'  => in_array($post_status, array('publish', 'draft')) ? $post_status : 'publish',
            'post_type'    => 'post'
        );

        $post_id = wp_insert_post($post_data);

        if (is_wp_error($post_id)) {
            return new WP_Error('publish_failed', $post_id->get_error_message(), array('status' => 500));
        }

        if (!empty($params['categories'])) {
            $cat_names = array_map('trim', explode(',', $params['categories']));
            $cat_ids = array();
            foreach ($cat_names as $cat_name) {
                if (empty($cat_name)) continue;
                $term = get_term_by('name', $cat_name, 'category');
                if ($term) {
                    $cat_ids[] = $term->term_id;
                } else {
                    $new_cat = wp_insert_term($cat_name, 'category');
                    if (!is_wp_error($new_cat)) {
                        $cat_ids[] = $new_cat['term_id'];
                    }
                }
            }
            if (!empty($cat_ids)) {
                wp_set_post_categories($post_id, $cat_ids);
            }
        }

        if (!empty($params['tags'])) {
            wp_set_post_tags($post_id, $params['tags']);
        }

        if (!empty($params['canonical_url'])) {
            update_post_meta($post_id, '_pbn_commander_canonical_url', esc_url_raw($params['canonical_url']));
        }

        if (!empty($params['featured_image'])) {
            update_post_meta($post_id, '_pbn_commander_featured_image_url', esc_url_raw($params['featured_image']));
        }

        return rest_ensure_response(array(
            'success' => true,
            'plugin' => 'PBN Commander Post Manager',
            'post_id' => $post_id,
            'post_url' => get_permalink($post_id)
        ));
    }

    public function output_canonical_url() {
        if (is_single()) {
            $post_id = get_the_ID();
            $canonical_url = get_post_meta($post_id, '_pbn_commander_canonical_url', true);
            if (!empty($canonical_url)) {
                echo '<link rel="canonical" href="' . esc_url($canonical_url) . '" />' . "\n";
            }
        }
    }
}

new PBNCommanderPostManager();
