<?php
/**
 * The icon sprite is shipped inside the React app, not the media library —
 * these are the <symbol> ids it defines. Editors pick a name; the frontend
 * renders <svg><use href="#i-globe"/></svg>.
 *
 * Keep in sync with the sprite in web/components/IconSprite.tsx.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function jj_icon_choices(): array {
	return array(
		''                => '— none —',
		'i-arrow-right'   => 'Arrow — right',
		'i-arrow-up-right' => 'Arrow — up right',
		'i-calculator'    => 'Calculator',
		'i-globe'         => 'Globe',
		'i-church'        => 'Church',
		'i-sun'           => 'Sun',
		'i-rosary'        => 'Rosary',
		'i-flame'         => 'Flame',
		'i-briefcase'     => 'Briefcase',
		'i-trending'      => 'Trending up',
		'i-chart'         => 'Chart',
		'i-users'         => 'Users',
		'i-cap'           => 'Graduation cap',
		'i-award'         => 'Award',
		'i-pin'           => 'Map pin',
		'i-send'          => 'Send',
		'i-file'          => 'File',
		'i-download'      => 'Download',
		'i-target'        => 'Target',
		'i-compass'       => 'Compass',
		'i-medal'         => 'Medal',
		'i-linkedin'      => 'LinkedIn',
		'i-facebook'      => 'Facebook',
		'i-instagram'     => 'Instagram',
		'i-whatsapp'      => 'WhatsApp',
	);
}
