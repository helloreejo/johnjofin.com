<?php
/**
 * Plugin Name:  John Jofin — Site Content
 * Description:  Content model and read API for johnjofin.com. Defines every editable
 *               field as code, and exposes the whole page as one JSON payload the
 *               Next.js build consumes.
 * Version:      1.0.0
 * Requires PHP: 8.0
 * Author:       johnjofin.com
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'JJ_CONTENT_VERSION', '1.0.0' );
define( 'JJ_CONTENT_DIR', plugin_dir_path( __FILE__ ) );

/**
 * Everything here needs ACF Pro — options pages and repeaters are Pro-only.
 * Fail loudly in the admin rather than silently serving an empty payload.
 */
function jj_content_has_acf(): bool {
	return function_exists( 'acf_add_local_field_group' ) && function_exists( 'acf_add_options_page' );
}

add_action(
	'admin_notices',
	function () {
		if ( jj_content_has_acf() ) {
			return;
		}
		echo '<div class="notice notice-error"><p><strong>John Jofin — Site Content</strong> needs Advanced Custom Fields <em>Pro</em> (options pages and repeaters are Pro features). The content model is not registered.</p></div>';
	}
);

require_once JJ_CONTENT_DIR . 'inc/icons.php';
require_once JJ_CONTENT_DIR . 'inc/fields.php';
require_once JJ_CONTENT_DIR . 'inc/options-page.php';
require_once JJ_CONTENT_DIR . 'inc/editor-formats.php';
require_once JJ_CONTENT_DIR . 'inc/rest-site.php';
require_once JJ_CONTENT_DIR . 'inc/rest-contact.php';
require_once JJ_CONTENT_DIR . 'inc/seed.php';
require_once JJ_CONTENT_DIR . 'inc/seed-admin.php';
