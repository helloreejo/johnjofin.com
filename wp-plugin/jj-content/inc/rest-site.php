<?php
/**
 * GET /wp-json/jj/v1/site
 *
 * One consolidated payload rather than raw ACF-in-REST: the field names stay an
 * implementation detail of WordPress, and the Next.js build makes a single
 * request. Public and cacheable — it is only ever read at build time.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** WYSIWYG returns "<p>text</p>\n"; the components supply their own <p class="…">. */
function jj_inline( ?string $html ): string {
	$html = trim( (string) $html );
	if ( '' === $html ) {
		return '';
	}
	/* only unwrap when the whole value is a single paragraph */
	if ( preg_match( '#^<p>(.*)</p>$#s', $html, $m ) && false === strpos( $m[1], '<p>' ) ) {
		$html = $m[1];
	}
	return trim( $html );
}

function jj_img( $field ): ?array {
	if ( ! is_array( $field ) ) {
		return null;
	}
	return array(
		'src'    => $field['url'] ?? null,
		'alt'    => $field['alt'] ?? '',
		'width'  => isset( $field['width'] ) ? (int) $field['width'] : null,
		'height' => isset( $field['height'] ) ? (int) $field['height'] : null,
	);
}

/** get_field on the options store, with a stable empty-array fallback. */
function jj_opt( string $name, $default = null ) {
	$v = get_field( $name, 'option' );
	return ( null === $v || false === $v || '' === $v ) ? $default : $v;
}

function jj_rows( string $name ): array {
	$v = jj_opt( $name );
	return is_array( $v ) ? $v : array();
}

/** Map repeater rows, keeping only the listed keys. */
function jj_map( string $name, callable $fn ): array {
	return array_values( array_map( $fn, jj_rows( $name ) ) );
}

function jj_site_payload(): array {
	$head = fn( string $p ) => array(
		'heading' => jj_opt( "{$p}_heading", '' ),
		'eyebrow' => jj_opt( "{$p}_eyebrow", '' ),
		'lead'    => jj_opt( "{$p}_lead", '' ),
	);

	return array(
		'seo' => array(
			'title'               => jj_opt( 'seo_title', '' ),
			'description'         => jj_opt( 'seo_description', '' ),
			'author'              => jj_opt( 'seo_author', '' ),
			'theme_color'         => jj_opt( 'seo_theme_color', '' ),
			'canonical'           => jj_opt( 'seo_canonical', '' ),
			'og_title'            => jj_opt( 'seo_og_title', '' ),
			'og_description'      => jj_opt( 'seo_og_description', '' ),
			'og_url'              => jj_opt( 'seo_og_url', '' ),
			'og_image'            => jj_img( jj_opt( 'seo_og_image' ) ),
			'og_locale'           => jj_opt( 'seo_og_locale', '' ),
			'og_site_name'        => jj_opt( 'seo_og_site_name', '' ),
			'twitter_title'       => jj_opt( 'seo_twitter_title', '' ),
			'twitter_description' => jj_opt( 'seo_twitter_description', '' ),
			'twitter_image'       => jj_img( jj_opt( 'seo_twitter_image' ) ),
			/* decoded here so a syntax error in the admin surfaces as a missing
			   block rather than invalid JSON-LD shipped to search engines */
			'jsonld'              => json_decode( (string) jj_opt( 'seo_jsonld', '' ), true ),
		),

		'header' => array(
			'skip_label' => jj_opt( 'header_skip_label', '' ),
			'brand'      => jj_opt( 'header_brand', '' ),
			'nav'        => jj_map( 'header_nav', fn( $r ) => array(
				'label'  => $r['label'] ?? '',
				'href'   => $r['href'] ?? '',
				'nav_id' => $r['nav_id'] ?? '',
			) ),
			'cta'        => array(
				'label' => jj_opt( 'header_cta_label', '' ),
				'href'  => jj_opt( 'header_cta_href', '' ),
			),
			'menu_links'    => jj_map( 'header_menu_links', fn( $r ) => array(
				'label' => $r['label'] ?? '',
				'href'  => $r['href'] ?? '',
			) ),
			'menu_external' => jj_map( 'header_menu_external', fn( $r ) => array(
				'label' => $r['label'] ?? '',
				'href'  => $r['href'] ?? '',
			) ),
		),

		'hero' => array(
			'greeting'  => jj_opt( 'hero_greeting', '' ),
			'name'      => jj_opt( 'hero_name', '' ),
			'tagline'   => jj_opt( 'hero_tagline', '' ),
			'intro'     => jj_opt( 'hero_intro', '' ),
			'cta'       => jj_map( 'hero_cta', fn( $r ) => array(
				'label' => $r['label'] ?? '',
				'href'  => $r['href'] ?? '',
				'style' => $r['style'] ?? 'primary',
			) ),
			'cue_label' => jj_opt( 'hero_cue_label', '' ),
			'cue_aria'  => jj_opt( 'hero_cue_aria', '' ),
			'image'     => jj_img( jj_opt( 'hero_image' ) ),
			'creds'     => jj_map( 'hero_creds', fn( $r ) => $r['label'] ?? '' ),
		),

		'stats' => jj_map( 'stats_items', fn( $r ) => array(
			'value' => $r['value'] ?? '',
			'label' => $r['label'] ?? '',
		) ),

		'about' => array_merge(
			$head( 'about' ),
			array(
				'body'  => jj_map( 'about_body', fn( $r ) => jj_inline( $r['text'] ?? '' ) ),
				'quote' => array(
					'text' => jj_opt( 'about_quote_text', '' ),
					'name' => jj_opt( 'about_quote_name', '' ),
					'role' => jj_opt( 'about_quote_role', '' ),
				),
				'creds' => jj_map( 'about_creds', fn( $r ) => array(
					'key'   => $r['key'] ?? '',
					'value' => $r['value'] ?? '',
				) ),
			)
		),

		'dimensions' => array_merge(
			$head( 'dimensions' ),
			array(
				'cards' => jj_map( 'dimensions_cards', fn( $r ) => array(
					'number' => $r['number'] ?? '',
					'icon'   => $r['icon'] ?? '',
					'title'  => $r['title'] ?? '',
					'body'   => $r['body'] ?? '',
				) ),
			)
		),

		'faith' => array_merge(
			$head( 'faith' ),
			array(
				'quote'       => jj_opt( 'faith_quote', '' ),
				'motto'       => jj_opt( 'faith_motto', '' ),
				'motto_note'  => jj_opt( 'faith_motto_note', '' ),
				'cards'       => jj_map( 'faith_cards', fn( $r ) => array(
					'icon'  => $r['icon'] ?? '',
					'title' => $r['title'] ?? '',
					'body'  => $r['body'] ?? '',
				) ),
			)
		),

		'spiritual' => array(
			'eyebrow'  => jj_opt( 'spiritual_eyebrow', '' ),
			'heading'  => jj_opt( 'spiritual_heading', '' ),
			'subtitle' => jj_opt( 'spiritual_subtitle', '' ),
			'quote'    => jj_opt( 'spiritual_quote', '' ),
			'cta'      => array(
				'label' => jj_opt( 'spiritual_cta_label', '' ),
				'href'  => jj_opt( 'spiritual_cta_href', '' ),
			),
			'image'    => jj_img( jj_opt( 'spiritual_image' ) ),
		),

		'journey' => array_merge(
			$head( 'journey' ),
			array(
				'summary' => jj_inline( jj_opt( 'journey_summary', '' ) ),
				'resume'  => array(
					'icon'      => jj_opt( 'journey_resume_icon', '' ),
					'title'     => jj_opt( 'journey_resume_title', '' ),
					'body'      => jj_opt( 'journey_resume_body', '' ),
					'cta_label' => jj_opt( 'journey_resume_cta_label', '' ),
					'file'      => ( is_array( jj_opt( 'journey_resume_file' ) ) ? jj_opt( 'journey_resume_file' )['url'] : '' ),
				),
				'items'   => jj_map( 'journey_items', fn( $r ) => array(
					'period'   => $r['period'] ?? '',
					'location' => $r['location'] ?? '',
					'icon'     => $r['icon'] ?? '',
					'role'     => $r['role'] ?? '',
					'org'      => $r['org'] ?? '',
					'two_col'  => (bool) ( $r['two_col'] ?? false ),
					'bullets'  => array_values(
						array_map(
							fn( $b ) => $b['text'] ?? '',
							is_array( $r['bullets'] ?? null ) ? $r['bullets'] : array()
						)
					),
				) ),
			)
		),

		'expertise' => array_merge(
			$head( 'expertise' ),
			array(
				'cards' => jj_map( 'expertise_cards', fn( $r ) => array(
					'icon'  => $r['icon'] ?? '',
					'title' => $r['title'] ?? '',
					'body'  => $r['body'] ?? '',
				) ),
			)
		),

		'credentials' => array_merge(
			$head( 'credentials' ),
			array(
				'meta'       => array(
					'count' => jj_opt( 'credentials_meta_count', '' ),
					'label' => jj_opt( 'credentials_meta_label', '' ),
					'range' => jj_opt( 'credentials_meta_range', '' ),
				),
				'items'      => jj_map( 'credentials_items', fn( $r ) => array(
					'year'        => $r['year'] ?? '',
					'title'       => $r['title'] ?? '',
					'institution' => $r['institution'] ?? '',
				) ),
				'feature'    => array(
					'icon'       => jj_opt( 'credentials_feature_icon', '' ),
					'title'      => jj_opt( 'credentials_feature_title', '' ),
					'body'       => jj_opt( 'credentials_feature_body', '' ),
					'link_label' => jj_opt( 'credentials_feature_link_label', '' ),
					'link_href'  => jj_opt( 'credentials_feature_link_href', '' ),
				),
				'distinctions' => jj_map( 'credentials_distinctions', fn( $r ) => array(
					'icon'  => $r['icon'] ?? '',
					'title' => $r['title'] ?? '',
					'body'  => $r['body'] ?? '',
				) ),
			)
		),

		'certifications' => array_merge(
			$head( 'certifications' ),
			array(
				'items' => jj_map( 'certifications_items', fn( $r ) => array(
					'icon'  => $r['icon'] ?? '',
					'title' => $r['title'] ?? '',
					'meta'  => $r['meta'] ?? '',
				) ),
			)
		),

		'references' => array_merge(
			$head( 'references' ),
			array(
				'items' => jj_map( 'references_items', fn( $r ) => array(
					'quote'           => $r['quote'] ?? '',
					'name'            => $r['name'] ?? '',
					'role'            => $r['role'] ?? '',
					'known'           => $r['known'] ?? '',
					'tab'             => $r['tab'] ?? ( $r['name'] ?? '' ),
					'avatar_image'    => jj_img( $r['avatar_image'] ?? null ),
					'avatar_initials' => $r['avatar_initials'] ?? '',
				) ),
			)
		),

		'beyond' => array_merge(
			$head( 'beyond' ),
			array(
				'cards' => jj_map( 'beyond_cards', fn( $r ) => array(
					'href'      => $r['href'] ?? '',
					'image'     => jj_img( $r['image'] ?? null ),
					'eyebrow'   => $r['eyebrow'] ?? '',
					'title'     => $r['title'] ?? '',
					'body'      => $r['body'] ?? '',
					'cta_label' => $r['cta_label'] ?? '',
				) ),
			)
		),

		'contact' => array(
			'heading'       => jj_opt( 'contact_heading', '' ),
			'lead'          => jj_opt( 'contact_lead', '' ),
			'required_note' => jj_opt( 'contact_required_note', '' ),
			'submit'        => jj_opt( 'contact_submit', '' ),
			'submit_note'   => jj_opt( 'contact_submit_note', '' ),
			'consent'       => array(
				'label' => jj_opt( 'contact_consent_label', '' ),
				'error' => jj_opt( 'contact_consent_error', '' ),
			),
			'fields'        => jj_map( 'contact_fields', fn( $r ) => array(
				'id'           => $r['id'] ?? '',
				'name'         => $r['name'] ?? '',
				'type'         => $r['type'] ?? 'text',
				'label'        => $r['label'] ?? '',
				'placeholder'  => $r['placeholder'] ?? '',
				'required'     => (bool) ( $r['required'] ?? false ),
				'autocomplete' => $r['autocomplete'] ?? '',
				'error'        => $r['error'] ?? '',
				'options'      => array_values(
					array_map(
						fn( $o ) => $o['label'] ?? '',
						is_array( $r['options'] ?? null ) ? $r['options'] : array()
					)
				),
			) ),
			'alt'           => array(
				'text'       => jj_opt( 'contact_alt_text', '' ),
				'link_label' => jj_opt( 'contact_alt_link_label', '' ),
				'link_href'  => jj_opt( 'contact_alt_link_href', '' ),
			),
			'endpoint'      => rest_url( 'jj/v1/contact' ),
		),

		'footer' => array(
			'brand'  => jj_opt( 'footer_brand', '' ),
			'nav'    => jj_map( 'footer_nav', fn( $r ) => array(
				'label'    => $r['label'] ?? '',
				'href'     => $r['href'] ?? '',
				'external' => (bool) ( $r['external'] ?? false ),
				'download' => (bool) ( $r['download'] ?? false ),
			) ),
			'social' => jj_map( 'footer_social', fn( $r ) => array(
				'label' => $r['label'] ?? '',
				'href'  => $r['href'] ?? '',
				'icon'  => $r['icon'] ?? '',
			) ),
			'base'   => jj_map( 'footer_base', fn( $r ) => $r['text'] ?? '' ),
		),
	);
}

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'jj/v1',
			'/site',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'permission_callback' => '__return_true',
				'callback'            => function () {
					if ( ! function_exists( 'get_field' ) ) {
						return new WP_Error( 'jj_no_acf', 'ACF Pro is not active.', array( 'status' => 503 ) );
					}

					/* ACF runs wysiwyg values through wptexturize, which rewrites
					   ' as &#8217; and " as curly quotes. The design's copy is
					   punctuated deliberately, so hand back exactly what was
					   stored. Removed only for this request — the admin preview
					   keeps WordPress's normal behaviour. */
					remove_filter( 'acf_the_content', 'wptexturize' );
					remove_filter( 'acf_the_content', 'convert_chars' );

					$payload = jj_site_payload();

					add_filter( 'acf_the_content', 'wptexturize' );
					add_filter( 'acf_the_content', 'convert_chars' );

					return rest_ensure_response( $payload );
				},
			)
		);
	}
);
