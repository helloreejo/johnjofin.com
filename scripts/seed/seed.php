<?php
/**
 * WP-CLI entry point for the importer that lives in the plugin
 * (wp-plugin/jj-content/inc/seed.php), so CLI and the admin button run
 * identical code against the identical bundle.
 *
 *   scripts/wp.sh eval-file scripts/seed/seed.php
 *
 * Refresh the bundle from the repo first with: npm run seed:bundle
 */

if ( ! function_exists( 'jj_seed_run' ) ) {
	WP_CLI::error( 'The jj-content plugin is not active.' );
}

$result = jj_seed_run( fn( $line ) => WP_CLI::log( $line ) );

if ( ! $result['ok'] ) {
	WP_CLI::error( $result['message'] );
}
WP_CLI::success( $result['message'] );
