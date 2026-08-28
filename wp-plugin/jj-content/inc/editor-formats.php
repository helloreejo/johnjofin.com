<?php
/**
 * The design uses three distinct emphasis treatments in body copy:
 *
 *   .hl        blue highlight   — qualifications and titles
 *   .strong-t  bold ink         — disciplines and places
 *   .strong-g  faith accent     — the devotions
 *
 * Without help, an editor would have to hand-write <strong class="hl">.
 * These register a "Formats" dropdown in the WYSIWYG toolbar that applies the
 * right class, so the emphasis stays on-design without anyone touching HTML.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** A trimmed toolbar — no headings, alignment or lists in a one-paragraph field. */
add_filter(
	'acf/fields/wysiwyg/toolbars',
	function ( $toolbars ) {
		$toolbars['jj_inline'] = array(
			1 => array( 'styleselect', 'bold', 'italic', 'link', 'unlink', 'removeformat', 'undo', 'redo' ),
		);
		return $toolbars;
	}
);

add_filter(
	'tiny_mce_before_init',
	function ( $init ) {
		$styles = array(
			array(
				'title'    => 'Highlight (blue)',
				'inline'   => 'strong',
				'classes'  => 'hl',
				'wrapper'  => false,
			),
			array(
				'title'    => 'Emphasis (ink)',
				'inline'   => 'strong',
				'classes'  => 'strong-t',
				'wrapper'  => false,
			),
			array(
				'title'    => 'Faith accent',
				'inline'   => 'strong',
				'classes'  => 'strong-g',
				'wrapper'  => false,
			),
			array(
				'title'    => 'Accent text',
				'inline'   => 'span',
				'classes'  => 'text-lime-light',
				'wrapper'  => false,
			),
		);

		$init['style_formats']        = wp_json_encode( $styles );
		$init['style_formats_merge']  = false;
		/* keep the classes through a save — TinyMCE strips unknown ones otherwise */
		$init['extended_valid_elements'] = 'strong[class],span[class],em[class]';

		return $init;
	}
);
