<?php
/**
 * "Import starter content" screen — Site Content → Import content.
 *
 * The point of this page is a fresh install on shared hosting: no SSH, so no
 * WP-CLI, and importing a local database instead would drag along a possibly
 * different WordPress version. Everything needed ships inside the plugin.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Where "Site Content" actually lives in the menu.
 *
 * ACF's `redirect => true` rewrites the parent's menu_slug to the FIRST child's
 * slug and re-parents every sub-page under it, so 'jj-content' is not a menu
 * parent by the time we run — attaching to it silently drops the item. Read the
 * real parent back out of WordPress rather than hardcoding ACF's rewrite.
 */
function jj_seed_parent_slug(): string {
	global $submenu;
	if ( is_array( $submenu ) ) {
		foreach ( $submenu as $parent => $items ) {
			foreach ( $items as $item ) {
				if ( isset( $item[2] ) && str_starts_with( (string) $item[2], 'jj-' ) ) {
					return (string) $parent;
				}
			}
		}
	}
	return 'jj-content';
}

add_action(
	'admin_menu',
	function () {
		if ( ! jj_content_has_acf() ) {
			return;
		}
		add_submenu_page(
			jj_seed_parent_slug(),
			'Import content',
			'Import content',
			'manage_options',
			'jj-import',
			'jj_seed_admin_page'
		);
	},
	/* after 99: ACF registers its options pages at that priority, and adding a
	   sub-page before the parent exists silently drops it from the menu */
	100
);

function jj_seed_admin_page(): void {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'You do not have permission to import content.' );
	}

	$result = null;
	if (
		isset( $_POST['jj_seed_go'] )
		&& check_admin_referer( 'jj_seed', 'jj_seed_nonce' )
	) {
		@set_time_limit( 300 );
		$result = jj_seed_run();
	}

	$json  = jj_seed_dir() . 'content.json';
	$ready = file_exists( $json );
	$count = $ready ? count( glob( jj_seed_dir() . 'media/*' ) ?: array() ) : 0;
	$seeded = (bool) get_field( 'hero_name', 'option' );

	echo '<div class="wrap">';
	echo '<h1>Import content</h1>';

	if ( $result ) {
		printf(
			'<div class="notice notice-%s"><p>%s</p></div>',
			$result['ok'] ? 'success' : 'error',
			esc_html( $result['message'] )
		);
		if ( $result['lines'] ) {
			echo '<details><summary>Details</summary><pre style="background:#fff;border:1px solid #ccd0d4;padding:12px;max-height:320px;overflow:auto">';
			echo esc_html( implode( "\n", $result['lines'] ) );
			echo '</pre></details>';
		}
	}

	if ( ! $ready ) {
		echo '<div class="notice notice-error"><p>No bundled content found. This plugin copy is missing its <code>seed-content/</code> directory.</p></div></div>';
		return;
	}

	echo '<p>Loads the site\'s starter content — every section, plus ' . (int) $count . ' media files — into <strong>Site Content</strong>.</p>';

	echo '<p>Running this again is safe: it refreshes the fields from the bundle and re-uses media already imported rather than duplicating it. ';
	echo '<strong>It will overwrite anything you have edited in Site Content.</strong> The recipient address for the contact form is left alone.</p>';

	if ( $seeded ) {
		echo '<div class="notice notice-warning inline"><p>Content is already present. Importing will replace it with the bundled version.</p></div>';
	}

	echo '<form method="post">';
	wp_nonce_field( 'jj_seed', 'jj_seed_nonce' );
	submit_button(
		$seeded ? 'Re-import and overwrite' : 'Import content',
		'primary',
		'jj_seed_go',
		true,
		$seeded ? array( 'onclick' => "return confirm('Overwrite the current Site Content with the bundled version?')" ) : array()
	);
	echo '</form>';
	echo '</div>';
}
