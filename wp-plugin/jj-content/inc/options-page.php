<?php
/**
 * One "Site Content" menu with a sub-page per section, in the order the
 * sections appear on the page — so editing follows scrolling.
 *
 * Every sub-page writes to the same `options` store, which is why field names
 * in fields.php are section-prefixed.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'acf/init',
	function () {
		if ( ! jj_content_has_acf() ) {
			return;
		}

		acf_add_options_page(
			array(
				'page_title' => 'Site Content',
				'menu_title' => 'Site Content',
				'menu_slug'  => 'jj-content',
				'capability' => 'edit_posts',
				'redirect'   => true,
				'icon_url'   => 'dashicons-edit-page',
				'position'   => 3,
				'update_button' => 'Save changes',
				'updated_message' => 'Content saved. Rebuild the site to publish it.',
			)
		);

		$pages = array(
			'hero'           => 'Hero',
			'stats'          => 'Stats band',
			'about'          => 'About',
			'dimensions'     => 'Three roles',
			'faith'          => 'Faith',
			'spiritual'      => 'Spiritual blog',
			'journey'        => 'Journey',
			'expertise'      => 'Expertise',
			'credentials'    => 'Education',
			'certifications' => 'Certifications',
			'references'     => 'References',
			'beyond'         => 'Beyond the resume',
			'contact'        => 'Contact',
			'header'         => 'Header & menu',
			'footer'         => 'Footer',
			'seo'            => 'SEO & sharing',
		);

		foreach ( $pages as $slug => $title ) {
			acf_add_options_sub_page(
				array(
					'page_title'  => $title,
					'menu_title'  => $title,
					'menu_slug'   => "jj-{$slug}",
					'parent_slug' => 'jj-content',
					'capability'  => 'edit_posts',
					'update_button'   => 'Save changes',
					'updated_message' => 'Content saved. Rebuild the site to publish it.',
				)
			);
		}
	}
);
