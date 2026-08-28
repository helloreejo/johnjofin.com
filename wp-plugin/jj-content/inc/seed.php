<?php
/**
 * Loads the site's starter content from the bundled seed-content/ directory.
 *
 * Lives in the plugin rather than in a WP-CLI script so it also runs from the
 * admin: shared hosting usually has no SSH, and migrating a local database
 * instead risks a WordPress-version mismatch. The plugin ships everything it
 * needs, so a fresh install can be populated by clicking a button.
 *
 * Idempotent — media is matched by its original path (stored as attachment
 * meta), so re-running updates values without duplicating the media library.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function jj_seed_dir(): string {
	return JJ_CONTENT_DIR . 'seed-content/';
}

/**
 * Import one bundled file into the media library, once.
 * Returns the attachment ID, or 0 if the source is missing.
 */
function jj_seed_media( ?string $rel, string $alt = '', ?callable $log = null ): int {
	static $cache = array();

	if ( ! $rel ) {
		return 0;
	}
	/* seo fields carry absolute URLs — fall back to matching on the file name */
	if ( preg_match( '#^https?://#', $rel ) ) {
		$rel = 'images/' . basename( wp_parse_url( $rel, PHP_URL_PATH ) );
	}
	if ( isset( $cache[ $rel ] ) ) {
		return $cache[ $rel ];
	}

	/* already imported on a previous run? */
	$found = get_posts(
		array(
			'post_type'   => 'attachment',
			'post_status' => 'inherit',
			'numberposts' => 1,
			'fields'      => 'ids',
			'meta_key'    => '_jj_seed_src',
			'meta_value'  => $rel,
		)
	);
	if ( $found ) {
		$cache[ $rel ] = (int) $found[0];
		return $cache[ $rel ];
	}

	/* the bundle flattens everything into seed-content/media/ */
	$path = jj_seed_dir() . 'media/' . basename( $rel );
	if ( ! file_exists( $path ) ) {
		if ( $log ) {
			$log( "missing bundled file: {$rel}" );
		}
		return 0;
	}

	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	/* copy to a temp file — media_handle_sideload moves what it is given */
	$tmp = wp_tempnam( basename( $path ) );
	copy( $path, $tmp );

	$id = media_handle_sideload(
		array( 'name' => basename( $path ), 'tmp_name' => $tmp ),
		0
	);

	if ( is_wp_error( $id ) ) {
		if ( file_exists( $tmp ) ) {
			wp_delete_file( $tmp );
		}
		if ( $log ) {
			$log( "import failed for {$rel}: " . $id->get_error_message() );
		}
		return 0;
	}

	update_post_meta( $id, '_jj_seed_src', $rel );
	if ( '' !== $alt ) {
		update_post_meta( $id, '_wp_attachment_image_alt', $alt );
	}

	$cache[ $rel ] = (int) $id;
	if ( $log ) {
		$log( "media: {$rel} → #{$id}" );
	}
	return (int) $id;
}

function jj_seed_img( ?array $img, ?callable $log = null ): int {
	return $img ? jj_seed_media( $img['src'] ?? null, $img['alt'] ?? '', $log ) : 0;
}

/** WYSIWYG fields want a paragraph; the bundle stores inline HTML. */
function jj_seed_prose( string $html ): string {
	$html = trim( $html );
	return '' === $html ? '' : "<p>{$html}</p>";
}

function jj_seed_set( string $name, $value ): void {
	update_field( $name, $value, 'option' );
}

/**
 * Run the import.
 *
 * @param callable|null $log  Receives progress lines.
 * @return array{ok:bool,message:string,lines:string[]}
 */
function jj_seed_run( ?callable $log = null ): array {
	$lines = array();
	$say   = function ( string $m ) use ( &$lines, $log ) {
		$lines[] = $m;
		if ( $log ) {
			$log( $m );
		}
	};

	if ( ! function_exists( 'update_field' ) ) {
		return array( 'ok' => false, 'message' => 'ACF Pro is not active.', 'lines' => $lines );
	}

	$json = jj_seed_dir() . 'content.json';
	if ( ! file_exists( $json ) ) {
		return array( 'ok' => false, 'message' => "content.json not found at {$json}", 'lines' => $lines );
	}

	$c = json_decode( file_get_contents( $json ), true );
	if ( ! is_array( $c ) ) {
		return array( 'ok' => false, 'message' => 'content.json is not valid JSON.', 'lines' => $lines );
	}

	$m = fn( $img ) => jj_seed_img( $img, $say );

	/* --- seo --- */
	$say( 'seo…' );
	$seo = $c['seo'];
	jj_seed_set( 'seo_title', $seo['title'] );
	jj_seed_set( 'seo_description', $seo['description'] );
	jj_seed_set( 'seo_author', $seo['author'] );
	jj_seed_set( 'seo_theme_color', $seo['theme_color'] );
	jj_seed_set( 'seo_canonical', $seo['canonical'] );
	jj_seed_set( 'seo_og_title', $seo['og_title'] );
	jj_seed_set( 'seo_og_description', $seo['og_description'] );
	jj_seed_set( 'seo_og_url', $seo['og_url'] );
	jj_seed_set( 'seo_og_image', jj_seed_media( $seo['og_image'], '', $say ) );
	jj_seed_set( 'seo_og_locale', $seo['og_locale'] );
	jj_seed_set( 'seo_og_site_name', $seo['og_site_name'] );
	jj_seed_set( 'seo_twitter_title', $seo['twitter_title'] );
	jj_seed_set( 'seo_twitter_description', $seo['twitter_description'] );
	jj_seed_set( 'seo_twitter_image', jj_seed_media( $seo['twitter_image'], '', $say ) );
	jj_seed_set( 'seo_jsonld', wp_json_encode( $seo['jsonld'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) );

	/* --- header --- */
	$say( 'header…' );
	$h = $c['header'];
	jj_seed_set( 'header_skip_label', $h['skip_label'] );
	jj_seed_set( 'header_brand', $h['brand'] );
	jj_seed_set( 'header_nav', array_map( fn( $n ) => array( 'label' => $n['label'], 'href' => $n['href'], 'nav_id' => $n['nav_id'] ?? '' ), $h['nav'] ) );
	jj_seed_set( 'header_cta_label', $h['cta']['label'] );
	jj_seed_set( 'header_cta_href', $h['cta']['href'] );
	jj_seed_set( 'header_menu_links', array_map( fn( $n ) => array( 'label' => $n['label'], 'href' => $n['href'] ), $h['menu_links'] ) );
	jj_seed_set( 'header_menu_external', array_map( fn( $n ) => array( 'label' => $n['label'], 'href' => $n['href'] ), $h['menu_external'] ) );

	/* --- hero --- */
	$say( 'hero…' );
	$hero = $c['hero'];
	jj_seed_set( 'hero_greeting', $hero['greeting'] );
	jj_seed_set( 'hero_name', $hero['name'] );
	jj_seed_set( 'hero_tagline', $hero['tagline'] );
	jj_seed_set( 'hero_intro', $hero['intro'] );
	jj_seed_set( 'hero_cta', array_map( fn( $b ) => array( 'label' => $b['label'], 'href' => $b['href'], 'style' => $b['style'] ), $hero['cta'] ) );
	jj_seed_set( 'hero_cue_label', $hero['cue_label'] );
	jj_seed_set( 'hero_cue_aria', $hero['cue_aria'] );
	jj_seed_set( 'hero_image', $m( $hero['image'] ) );
	jj_seed_set( 'hero_creds', array_map( fn( $x ) => array( 'label' => $x ), $hero['creds'] ) );

	/* --- stats --- */
	$say( 'stats…' );
	jj_seed_set( 'stats_items', array_map( fn( $s ) => array( 'value' => $s['value'], 'label' => $s['label'] ), $c['stats'] ) );

	/* --- about --- */
	$say( 'about…' );
	$a = $c['about'];
	jj_seed_set( 'about_heading', $a['heading'] );
	jj_seed_set( 'about_eyebrow', $a['eyebrow'] );
	jj_seed_set( 'about_body', array_map( fn( $p ) => array( 'text' => jj_seed_prose( $p ) ), $a['body'] ) );
	jj_seed_set( 'about_quote_text', $a['quote']['text'] );
	jj_seed_set( 'about_quote_name', $a['quote']['name'] );
	jj_seed_set( 'about_quote_role', $a['quote']['role'] );
	jj_seed_set( 'about_creds', array_map( fn( $x ) => array( 'key' => $x['key'], 'value' => $x['value'] ), $a['creds'] ) );

	/* --- three roles --- */
	$say( 'three roles…' );
	$d = $c['dimensions'];
	jj_seed_set( 'dimensions_heading', $d['heading'] );
	jj_seed_set( 'dimensions_eyebrow', $d['eyebrow'] );
	jj_seed_set( 'dimensions_lead', $d['lead'] );
	jj_seed_set( 'dimensions_cards', array_map( fn( $x ) => array( 'number' => $x['number'], 'icon' => $x['icon'], 'title' => $x['title'], 'body' => $x['body'] ), $d['cards'] ) );

	/* --- faith --- */
	$say( 'faith…' );
	$f = $c['faith'];
	jj_seed_set( 'faith_heading', $f['heading'] );
	jj_seed_set( 'faith_eyebrow', $f['eyebrow'] );
	jj_seed_set( 'faith_quote', $f['quote'] );
	jj_seed_set( 'faith_motto', $f['motto'] );
	jj_seed_set( 'faith_motto_note', $f['motto_note'] );
	jj_seed_set( 'faith_cards', array_map( fn( $x ) => array( 'icon' => $x['icon'], 'title' => $x['title'], 'body' => $x['body'] ), $f['cards'] ) );

	/* --- spiritual --- */
	$say( 'spiritual…' );
	$s = $c['spiritual'];
	jj_seed_set( 'spiritual_eyebrow', $s['eyebrow'] );
	jj_seed_set( 'spiritual_heading', $s['heading'] );
	jj_seed_set( 'spiritual_subtitle', $s['subtitle'] );
	jj_seed_set( 'spiritual_quote', $s['quote'] );
	jj_seed_set( 'spiritual_cta_label', $s['cta']['label'] );
	jj_seed_set( 'spiritual_cta_href', $s['cta']['href'] );
	jj_seed_set( 'spiritual_image', $m( $s['image'] ) );

	/* --- journey --- */
	$say( 'journey…' );
	$j = $c['journey'];
	jj_seed_set( 'journey_heading', $j['heading'] );
	jj_seed_set( 'journey_eyebrow', $j['eyebrow'] );
	jj_seed_set( 'journey_lead', $j['lead'] );
	jj_seed_set( 'journey_summary', jj_seed_prose( $j['summary'] ) );
	jj_seed_set( 'journey_resume_icon', $j['resume']['icon'] );
	jj_seed_set( 'journey_resume_title', $j['resume']['title'] );
	jj_seed_set( 'journey_resume_body', $j['resume']['body'] );
	jj_seed_set( 'journey_resume_cta_label', $j['resume']['cta_label'] );
	jj_seed_set( 'journey_resume_file', jj_seed_media( $j['resume']['file'], '', $say ) );
	jj_seed_set(
		'journey_items',
		array_map(
			fn( $it ) => array(
				'period'   => $it['period'],
				'location' => $it['location'],
				'icon'     => $it['icon'],
				'role'     => $it['role'],
				'org'      => $it['org'],
				'two_col'  => (bool) $it['two_col'],
				'bullets'  => array_map( fn( $b ) => array( 'text' => $b ), $it['bullets'] ),
			),
			$j['items']
		)
	);

	/* --- expertise --- */
	$say( 'expertise…' );
	$e = $c['expertise'];
	jj_seed_set( 'expertise_heading', $e['heading'] );
	jj_seed_set( 'expertise_eyebrow', $e['eyebrow'] );
	jj_seed_set( 'expertise_lead', $e['lead'] );
	jj_seed_set( 'expertise_cards', array_map( fn( $x ) => array( 'icon' => $x['icon'], 'title' => $x['title'], 'body' => $x['body'] ), $e['cards'] ) );

	/* --- education --- */
	$say( 'education…' );
	$cr = $c['credentials'];
	jj_seed_set( 'credentials_heading', $cr['heading'] );
	jj_seed_set( 'credentials_eyebrow', $cr['eyebrow'] );
	jj_seed_set( 'credentials_lead', $cr['lead'] );
	jj_seed_set( 'credentials_meta_count', $cr['meta']['count'] );
	jj_seed_set( 'credentials_meta_label', $cr['meta']['label'] );
	jj_seed_set( 'credentials_meta_range', $cr['meta']['range'] );
	jj_seed_set( 'credentials_items', array_map( fn( $x ) => array( 'year' => $x['year'], 'title' => $x['title'], 'institution' => $x['institution'] ), $cr['items'] ) );
	jj_seed_set( 'credentials_feature_icon', $cr['feature']['icon'] );
	jj_seed_set( 'credentials_feature_title', $cr['feature']['title'] );
	jj_seed_set( 'credentials_feature_body', $cr['feature']['body'] );
	jj_seed_set( 'credentials_feature_link_label', $cr['feature']['link_label'] );
	jj_seed_set( 'credentials_feature_link_href', $cr['feature']['link_href'] );
	jj_seed_set( 'credentials_distinctions', array_map( fn( $x ) => array( 'icon' => $x['icon'], 'title' => $x['title'], 'body' => $x['body'] ), $cr['distinctions'] ) );

	/* --- certifications --- */
	$say( 'certifications…' );
	$ce = $c['certifications'];
	jj_seed_set( 'certifications_heading', $ce['heading'] );
	jj_seed_set( 'certifications_eyebrow', $ce['eyebrow'] );
	jj_seed_set( 'certifications_lead', $ce['lead'] );
	jj_seed_set( 'certifications_items', array_map( fn( $x ) => array( 'icon' => $x['icon'], 'title' => $x['title'], 'meta' => $x['meta'] ), $ce['items'] ) );

	/* --- references --- */
	$say( 'references…' );
	$r    = $c['references'];
	$tabs = $r['tabs'] ?? array();
	jj_seed_set( 'references_heading', $r['heading'] );
	jj_seed_set( 'references_eyebrow', $r['eyebrow'] );
	jj_seed_set( 'references_lead', $r['lead'] );
	jj_seed_set(
		'references_items',
		array_map(
			fn( $x, $i ) => array(
				'quote'           => $x['quote'],
				'name'            => $x['name'],
				'role'            => $x['role'],
				'known'           => $x['known'],
				'tab'             => $tabs[ $i ] ?? $x['name'],
				'avatar_image'    => $m( $x['avatar_image'] ),
				'avatar_initials' => $x['avatar_initials'] ?? '',
			),
			$r['items'],
			array_keys( $r['items'] )
		)
	);

	/* --- beyond --- */
	$say( 'beyond…' );
	$b = $c['beyond'];
	jj_seed_set( 'beyond_heading', $b['heading'] );
	jj_seed_set( 'beyond_eyebrow', $b['eyebrow'] );
	jj_seed_set( 'beyond_lead', $b['lead'] );
	jj_seed_set(
		'beyond_cards',
		array_map(
			fn( $x ) => array(
				'href'      => $x['href'],
				'image'     => $m( $x['image'] ),
				'eyebrow'   => $x['eyebrow'],
				'title'     => $x['title'],
				'body'      => $x['body'],
				'cta_label' => $x['cta_label'],
			),
			$b['cards']
		)
	);

	/* --- contact --- */
	$say( 'contact…' );
	$ct = $c['contact'];
	jj_seed_set( 'contact_heading', $ct['heading'] );
	jj_seed_set( 'contact_lead', $ct['lead'] );
	jj_seed_set( 'contact_required_note', $ct['required_note'] );
	jj_seed_set( 'contact_submit', $ct['submit'] );
	jj_seed_set( 'contact_submit_note', $ct['submit_note'] );
	jj_seed_set( 'contact_consent_label', $ct['consent']['label'] );
	jj_seed_set( 'contact_consent_error', $ct['consent']['error'] );
	jj_seed_set(
		'contact_fields',
		array_map(
			fn( $fl ) => array(
				'id'           => $fl['id'],
				'name'         => $fl['name'],
				'type'         => $fl['type'],
				'label'        => $fl['label'],
				'placeholder'  => $fl['placeholder'] ?? '',
				'required'     => (bool) $fl['required'],
				'autocomplete' => $fl['autocomplete'] ?? '',
				'error'        => $fl['error'] ?? '',
				'options'      => array_map( fn( $o ) => array( 'label' => $o ), $fl['options'] ?? array() ),
			),
			$ct['fields']
		)
	);
	jj_seed_set( 'contact_alt_text', $ct['alt']['text'] );
	jj_seed_set( 'contact_alt_link_label', $ct['alt']['link_label'] );
	jj_seed_set( 'contact_alt_link_href', $ct['alt']['link_href'] );
	/* only set a recipient the first time — never clobber a chosen address */
	if ( ! get_field( 'contact_recipient', 'option' ) ) {
		jj_seed_set( 'contact_recipient', get_option( 'admin_email' ) );
	}

	/* --- footer --- */
	$say( 'footer…' );
	$ft = $c['footer'];
	jj_seed_set( 'footer_brand', $ft['brand'] );
	jj_seed_set( 'footer_nav', array_map( fn( $n ) => array( 'label' => $n['label'], 'href' => $n['href'], 'external' => (bool) $n['external'], 'download' => (bool) $n['download'] ), $ft['nav'] ) );
	jj_seed_set( 'footer_social', array_map( fn( $n ) => array( 'label' => $n['label'], 'href' => $n['href'], 'icon' => $n['icon'] ), $ft['social'] ) );
	jj_seed_set( 'footer_base', array_map( fn( $t ) => array( 'text' => $t ), $ft['base'] ) );

	return array( 'ok' => true, 'message' => 'Content imported.', 'lines' => $lines );
}
