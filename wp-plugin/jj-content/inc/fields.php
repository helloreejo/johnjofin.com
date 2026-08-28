<?php
/**
 * The content model, defined in code so it lives in git and deploys with the
 * plugin — nothing has to be exported out of the database.
 *
 * All sub-pages share the same `options` store, so every field NAME is
 * section-prefixed to stay globally unique. Field KEYS are derived from the
 * name and must likewise be unique; nested repeater subfields get their parent
 * as the key prefix.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* ------------------------------------------------------------------ helpers */

function jj_f( string $type, string $name, string $label, array $extra = array(), string $prefix = 'jj' ): array {
	return array_merge(
		array(
			'key'   => "field_{$prefix}_{$name}",
			'label' => $label,
			'name'  => $name,
			'type'  => $type,
		),
		$extra
	);
}

function jj_text( string $name, string $label, array $extra = array(), string $prefix = 'jj' ): array {
	return jj_f( 'text', $name, $label, $extra, $prefix );
}

/**
 * Inline rich text — a heading or sentence that carries a <span> or <strong>.
 * new_lines '' keeps ACF from injecting <br>, so what is stored is what renders.
 */
function jj_rich( string $name, string $label, array $extra = array(), string $prefix = 'jj' ): array {
	return jj_f(
		'textarea',
		$name,
		$label,
		array_merge(
			array(
				'rows'         => 2,
				'new_lines'    => '',
				'instructions' => 'Inline HTML allowed, e.g. <span class="text-lime-light">highlighted</span>.',
			),
			$extra
		),
		$prefix
	);
}

/** Body copy with a real toolbar. The outer <p> is stripped on read. */
function jj_prose( string $name, string $label, array $extra = array(), string $prefix = 'jj' ): array {
	return jj_f(
		'wysiwyg',
		$name,
		$label,
		array_merge(
			array(
				'tabs'         => 'visual',
				'toolbar'      => 'jj_inline',
				'media_upload' => 0,
				'delay'        => 0,
			),
			$extra
		),
		$prefix
	);
}

function jj_url( string $name, string $label, array $extra = array(), string $prefix = 'jj' ): array {
	return jj_f( 'text', $name, $label, array_merge( array( 'placeholder' => 'https://…  or  #section' ), $extra ), $prefix );
}

function jj_image( string $name, string $label, array $extra = array(), string $prefix = 'jj' ): array {
	return jj_f( 'image', $name, $label, array_merge( array( 'return_format' => 'array', 'preview_size' => 'medium' ), $extra ), $prefix );
}

function jj_icon( string $name = 'icon', string $label = 'Icon', string $prefix = 'jj' ): array {
	return jj_f(
		'select',
		$name,
		$label,
		array(
			'choices'     => jj_icon_choices(),
			'allow_null'  => 1,
			'ui'          => 1,
			'return_format' => 'value',
		),
		$prefix
	);
}

function jj_repeater( string $name, string $label, array $subfields, array $extra = array() ): array {
	return jj_f(
		'repeater',
		$name,
		$label,
		array_merge(
			array(
				'layout'       => 'block',
				'button_label' => 'Add row',
				'sub_fields'   => $subfields,
			),
			$extra
		)
	);
}

/** Standard section header: h2 + eyebrow + optional lead. */
function jj_section_head( string $p, bool $lead = true ): array {
	$out = array(
		jj_rich( "{$p}_heading", 'Heading' ),
		jj_text( "{$p}_eyebrow", 'Eyebrow', array( 'instructions' => 'Small label beside the rule.' ) ),
	);
	if ( $lead ) {
		$out[] = jj_rich( "{$p}_lead", 'Intro line', array( 'rows' => 3 ) );
	}
	return $out;
}

function jj_group( string $slug, string $title, array $fields ): void {
	acf_add_local_field_group(
		array(
			'key'             => "group_jj_{$slug}",
			'title'           => $title,
			'fields'          => $fields,
			'location'        => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => "jj-{$slug}" ) ) ),
			'style'           => 'default',
			'label_placement' => 'top',
			'active'          => true,
		)
	);
}

/* ------------------------------------------------------------------- groups */

add_action(
	'acf/init',
	function () {
		if ( ! jj_content_has_acf() ) {
			return;
		}

		/* --- SEO & social --- */
		jj_group(
			'seo',
			'SEO & social sharing',
			array(
				jj_text( 'seo_title', 'Browser / search title' ),
				jj_f( 'textarea', 'seo_description', 'Meta description', array( 'rows' => 3 ) ),
				jj_text( 'seo_author', 'Author' ),
				jj_text( 'seo_theme_color', 'Theme colour', array( 'placeholder' => '#003D7A' ) ),
				jj_url( 'seo_canonical', 'Canonical URL' ),
				jj_text( 'seo_og_title', 'Share title' ),
				jj_f( 'textarea', 'seo_og_description', 'Share description', array( 'rows' => 3 ) ),
				jj_url( 'seo_og_url', 'Share URL' ),
				jj_image( 'seo_og_image', 'Share image', array( 'instructions' => '1200×630 or larger.' ) ),
				jj_text( 'seo_og_locale', 'Locale', array( 'placeholder' => 'en_CA' ) ),
				jj_text( 'seo_og_site_name', 'Site name' ),
				jj_text( 'seo_twitter_title', 'Twitter title' ),
				jj_f( 'textarea', 'seo_twitter_description', 'Twitter description', array( 'rows' => 3 ) ),
				jj_image( 'seo_twitter_image', 'Twitter image' ),
				jj_f(
					'textarea',
					'seo_jsonld',
					'Structured data (JSON-LD)',
					array(
						'rows'         => 14,
						'new_lines'    => '',
						'instructions' => 'schema.org Person record used by search engines. Must stay valid JSON — an invalid value is dropped from the page rather than published broken.',
					)
				),
			)
		);

		/* --- header & menu --- */
		jj_group(
			'header',
			'Header & menu',
			array(
				jj_text( 'header_skip_label', 'Skip-to-content label' ),
				jj_text( 'header_brand', 'Brand name' ),
				jj_repeater(
					'header_nav',
					'Desktop navigation',
					array(
						jj_text( 'label', 'Label', array(), 'header_nav' ),
						jj_url( 'href', 'Link', array(), 'header_nav' ),
						jj_text( 'nav_id', 'Scroll-spy id', array( 'instructions' => 'Section id this link highlights for, without the #.' ), 'header_nav' ),
					)
				),
				jj_text( 'header_cta_label', 'Button label' ),
				jj_url( 'header_cta_href', 'Button link' ),
				jj_repeater(
					'header_menu_links',
					'Mobile menu links',
					array(
						jj_text( 'label', 'Label', array(), 'header_menu_links' ),
						jj_url( 'href', 'Link', array(), 'header_menu_links' ),
					)
				),
				jj_repeater(
					'header_menu_external',
					'Mobile menu — external links',
					array(
						jj_text( 'label', 'Label', array(), 'header_menu_external' ),
						jj_url( 'href', 'Link', array(), 'header_menu_external' ),
					)
				),
			)
		);

		/* --- hero --- */
		jj_group(
			'hero',
			'Hero',
			array(
				jj_text( 'hero_greeting', 'Greeting', array( 'placeholder' => "I'm" ) ),
				jj_text( 'hero_name', 'Name' ),
				jj_rich( 'hero_tagline', 'Tagline' ),
				jj_rich( 'hero_intro', 'Intro line' ),
				jj_repeater(
					'hero_cta',
					'Buttons',
					array(
						jj_text( 'label', 'Label', array(), 'hero_cta' ),
						jj_url( 'href', 'Link', array(), 'hero_cta' ),
						jj_f( 'select', 'style', 'Style', array( 'choices' => array( 'primary' => 'Solid', 'transparent' => 'Outline' ) ), 'hero_cta' ),
					),
					array( 'max' => 2 )
				),
				jj_text( 'hero_cue_label', 'Scroll cue label' ),
				jj_text( 'hero_cue_aria', 'Scroll cue — screen-reader label' ),
				jj_image( 'hero_image', 'Portrait' ),
				jj_repeater( 'hero_creds', 'Credential strip', array( jj_text( 'label', 'Label', array(), 'hero_creds' ) ) ),
			)
		);

		/* --- stats --- */
		jj_group(
			'stats',
			'Stats band',
			array(
				jj_repeater(
					'stats_items',
					'Figures',
					array(
						jj_text( 'value', 'Figure', array( 'placeholder' => '15+' ), 'stats_items' ),
						jj_text( 'label', 'Caption', array(), 'stats_items' ),
					)
				),
			)
		);

		/* --- about --- */
		jj_group(
			'about',
			'About',
			array_merge(
				jj_section_head( 'about', false ),
				array(
					jj_repeater( 'about_body', 'Paragraphs', array( jj_prose( 'text', 'Paragraph', array(), 'about_body' ) ) ),
					jj_rich( 'about_quote_text', 'Pull quote', array( 'rows' => 3 ) ),
					jj_text( 'about_quote_name', 'Quote attribution — name' ),
					jj_text( 'about_quote_role', 'Quote attribution — role' ),
					jj_repeater(
						'about_creds',
						'Credential band',
						array(
							jj_text( 'key', 'Credential', array( 'placeholder' => 'CPA' ), 'about_creds' ),
							jj_text( 'value', 'Where', array( 'placeholder' => 'Canada' ), 'about_creds' ),
						)
					),
				)
			)
		);

		/* --- three roles --- */
		jj_group(
			'dimensions',
			'Three roles',
			array_merge(
				jj_section_head( 'dimensions' ),
				array(
					jj_repeater(
						'dimensions_cards',
						'Cards',
						array(
							jj_text( 'number', 'Number', array( 'placeholder' => '01' ), 'dimensions_cards' ),
							jj_icon( 'icon', 'Icon', 'dimensions_cards' ),
							jj_rich( 'title', 'Title', array(), 'dimensions_cards' ),
							jj_rich( 'body', 'Body', array( 'rows' => 4 ), 'dimensions_cards' ),
						)
					),
				)
			)
		);

		/* --- faith --- */
		jj_group(
			'faith',
			'Faith',
			array_merge(
				jj_section_head( 'faith', false ),
				array(
					jj_rich( 'faith_quote', 'Opening statement', array( 'rows' => 6 ) ),
					jj_text( 'faith_motto', 'Motto' ),
					jj_rich( 'faith_motto_note', 'Motto note', array( 'rows' => 3 ) ),
					jj_repeater(
						'faith_cards',
						'Devotion cards',
						array(
							jj_icon( 'icon', 'Icon', 'faith_cards' ),
							jj_rich( 'title', 'Title', array(), 'faith_cards' ),
							jj_rich( 'body', 'Body', array( 'rows' => 4 ), 'faith_cards' ),
						)
					),
				)
			)
		);

		/* --- spiritual blog --- */
		jj_group(
			'spiritual',
			'Spiritual blog',
			array(
				jj_text( 'spiritual_eyebrow', 'Eyebrow' ),
				jj_rich( 'spiritual_heading', 'Heading' ),
				jj_text( 'spiritual_subtitle', 'Subtitle' ),
				jj_f( 'textarea', 'spiritual_quote', 'Quote', array( 'rows' => 3, 'new_lines' => '' ) ),
				jj_text( 'spiritual_cta_label', 'Button label' ),
				jj_url( 'spiritual_cta_href', 'Button link' ),
				jj_image( 'spiritual_image', 'Background image' ),
			)
		);

		/* --- journey --- */
		jj_group(
			'journey',
			'Professional journey',
			array_merge(
				jj_section_head( 'journey' ),
				array(
					jj_prose( 'journey_summary', 'Summary card' ),
					jj_icon( 'journey_resume_icon', 'Resume card — icon' ),
					jj_text( 'journey_resume_title', 'Resume card — title' ),
					jj_f( 'textarea', 'journey_resume_body', 'Resume card — body', array( 'rows' => 3, 'new_lines' => '' ) ),
					jj_text( 'journey_resume_cta_label', 'Resume card — button' ),
					jj_f( 'file', 'journey_resume_file', 'Resume PDF', array( 'return_format' => 'array', 'mime_types' => 'pdf' ) ),
					jj_repeater(
						'journey_items',
						'Roles',
						array(
							jj_text( 'period', 'Dates', array( 'placeholder' => '02/2022 — Current' ), 'journey_items' ),
							jj_text( 'location', 'Location', array(), 'journey_items' ),
							jj_icon( 'icon', 'Icon', 'journey_items' ),
							jj_rich( 'role', 'Job title', array(), 'journey_items' ),
							jj_rich( 'org', 'Organisation', array(), 'journey_items' ),
							jj_f( 'true_false', 'two_col', 'Show achievements in two columns', array( 'ui' => 1, 'instructions' => 'For a summary entry listing several short roles.' ), 'journey_items' ),
							jj_repeater(
								'bullets',
								'Achievements',
								array( jj_rich( 'text', 'Line', array( 'rows' => 3 ), 'journey_items_bullets' ) ),
								array( 'key' => 'field_journey_items_bullets', 'name' => 'bullets' )
							),
						)
					),
				)
			)
		);

		/* --- expertise --- */
		jj_group(
			'expertise',
			'Areas of expertise',
			array_merge(
				jj_section_head( 'expertise' ),
				array(
					jj_repeater(
						'expertise_cards',
						'Cards',
						array(
							jj_icon( 'icon', 'Icon', 'expertise_cards' ),
							jj_rich( 'title', 'Title', array(), 'expertise_cards' ),
							jj_rich( 'body', 'Body', array( 'rows' => 3 ), 'expertise_cards' ),
						)
					),
				)
			)
		);

		/* --- education --- */
		jj_group(
			'credentials',
			'Academic background',
			array_merge(
				jj_section_head( 'credentials' ),
				array(
					jj_text( 'credentials_meta_count', 'Count line — number', array( 'placeholder' => '6', 'instructions' => 'Renders emphasised, e.g. the "6" in "6 qualifications · 2004 — 2019".' ) ),
					jj_text( 'credentials_meta_label', 'Count line — word', array( 'placeholder' => 'qualifications' ) ),
					jj_text( 'credentials_meta_range', 'Count line — years', array( 'placeholder' => '2004 — 2019' ) ),
					jj_repeater(
						'credentials_items',
						'Qualifications',
						array(
							jj_text( 'year', 'Year', array(), 'credentials_items' ),
							jj_rich( 'title', 'Qualification', array(), 'credentials_items' ),
							jj_rich( 'institution', 'Institution', array( 'rows' => 3 ), 'credentials_items' ),
						)
					),
					jj_f( 'message', 'credentials_distinctions_msg', 'Academic distinctions', array( 'message' => 'The featured card below the qualifications timeline, and the smaller cards beneath it.' ) ),
					jj_icon( 'credentials_feature_icon', 'Featured card — icon' ),
					jj_rich( 'credentials_feature_title', 'Featured card — title' ),
					jj_rich( 'credentials_feature_body', 'Featured card — body', array( 'rows' => 4 ) ),
					jj_text( 'credentials_feature_link_label', 'Featured card — link label' ),
					jj_url( 'credentials_feature_link_href', 'Featured card — link' ),
					jj_repeater(
						'credentials_distinctions',
						'Distinction cards',
						array(
							jj_icon( 'icon', 'Icon', 'credentials_distinctions' ),
							jj_rich( 'title', 'Title', array(), 'credentials_distinctions' ),
							jj_rich( 'body', 'Body', array( 'rows' => 3 ), 'credentials_distinctions' ),
						)
					),
				)
			)
		);

		/* --- certifications --- */
		jj_group(
			'certifications',
			'Certifications',
			array_merge(
				jj_section_head( 'certifications' ),
				array(
					jj_repeater(
						'certifications_items',
						'Certifications',
						array(
							jj_icon( 'icon', 'Icon', 'certifications_items' ),
							jj_rich( 'title', 'Title', array(), 'certifications_items' ),
							jj_text( 'meta', 'Place & year', array( 'placeholder' => 'Liverpool, UK · 2011' ), 'certifications_items' ),
						)
					),
				)
			)
		);

		/* --- references --- */
		jj_group(
			'references',
			'References',
			array_merge(
				jj_section_head( 'references' ),
				array(
					jj_repeater(
						'references_items',
						'References',
						array(
							jj_f( 'textarea', 'quote', 'Quote', array( 'rows' => 6, 'new_lines' => '' ), 'references_items' ),
							jj_text( 'name', 'Name', array(), 'references_items' ),
							jj_text( 'role', 'Role', array(), 'references_items' ),
							jj_text( 'known', 'Relationship', array( 'placeholder' => 'Known John 30+ years' ), 'references_items' ),
							jj_text( 'tab', 'Carousel tab label', array( 'instructions' => 'Short name for the tab strip under the quote.' ), 'references_items' ),
							jj_image( 'avatar_image', 'Photo', array( 'instructions' => 'Leave empty to show initials instead.' ), 'references_items' ),
							jj_text( 'avatar_initials', 'Initials', array( 'placeholder' => 'MP', 'maxlength' => 3 ), 'references_items' ),
						)
					),
				)
			)
		);

		/* --- beyond --- */
		jj_group(
			'beyond',
			'Beyond the resume',
			array_merge(
				jj_section_head( 'beyond' ),
				array(
					jj_repeater(
						'beyond_cards',
						'Cards',
						array(
							jj_url( 'href', 'Link', array(), 'beyond_cards' ),
							jj_image( 'image', 'Image', array(), 'beyond_cards' ),
							jj_text( 'eyebrow', 'Eyebrow', array(), 'beyond_cards' ),
							jj_rich( 'title', 'Title', array(), 'beyond_cards' ),
							jj_rich( 'body', 'Body', array( 'rows' => 3 ), 'beyond_cards' ),
							jj_text( 'cta_label', 'Link label', array(), 'beyond_cards' ),
						),
						array( 'max' => 2 )
					),
				)
			)
		);

		/* --- contact --- */
		jj_group(
			'contact',
			'Contact',
			array(
				jj_rich( 'contact_heading', 'Heading' ),
				jj_rich( 'contact_lead', 'Intro line', array( 'rows' => 3 ) ),
				jj_text( 'contact_required_note', 'Required-fields note' ),
				jj_text( 'contact_submit', 'Submit button label' ),
				jj_text( 'contact_submit_note', 'Note beside the button' ),
				jj_rich( 'contact_consent_label', 'Consent checkbox label', array( 'rows' => 3 ) ),
				jj_text( 'contact_consent_error', 'Consent error message' ),
				jj_repeater(
					'contact_fields',
					'Form fields',
					array(
						jj_text( 'id', 'HTML id', array( 'instructions' => 'Changing this breaks validation wiring — leave alone unless adding a field.' ), 'contact_fields' ),
						jj_text( 'name', 'Field name', array(), 'contact_fields' ),
						jj_f( 'select', 'type', 'Type', array( 'choices' => array( 'text' => 'Text', 'email' => 'Email', 'tel' => 'Phone', 'select' => 'Dropdown', 'textarea' => 'Long text' ) ), 'contact_fields' ),
						jj_rich( 'label', 'Label', array(), 'contact_fields' ),
						jj_text( 'placeholder', 'Placeholder', array(), 'contact_fields' ),
						jj_f( 'true_false', 'required', 'Required', array( 'ui' => 1 ), 'contact_fields' ),
						jj_text( 'autocomplete', 'Autocomplete token', array(), 'contact_fields' ),
						jj_text( 'error', 'Error message', array(), 'contact_fields' ),
						jj_repeater( 'options', 'Dropdown options', array( jj_text( 'label', 'Option', array(), 'contact_fields_options' ) ), array( 'key' => 'field_contact_fields_options', 'name' => 'options' ) ),
					)
				),
				jj_text( 'contact_alt_text', 'Alternative — lead-in' ),
				jj_text( 'contact_alt_link_label', 'Alternative — link label' ),
				jj_url( 'contact_alt_link_href', 'Alternative — link' ),
				jj_text( 'contact_recipient', 'Send enquiries to', array( 'instructions' => 'Defaults to the WordPress admin email when blank.' ) ),
			)
		);

		/* --- footer --- */
		jj_group(
			'footer',
			'Footer',
			array(
				jj_text( 'footer_brand', 'Brand name' ),
				jj_repeater(
					'footer_nav',
					'Links',
					array(
						jj_text( 'label', 'Label', array(), 'footer_nav' ),
						jj_url( 'href', 'Link', array(), 'footer_nav' ),
						jj_f( 'true_false', 'external', 'Opens in a new tab', array( 'ui' => 1 ), 'footer_nav' ),
						jj_f( 'true_false', 'download', 'Download', array( 'ui' => 1 ), 'footer_nav' ),
					)
				),
				jj_repeater(
					'footer_social',
					'Social links',
					array(
						jj_text( 'label', 'Accessible label', array(), 'footer_social' ),
						jj_url( 'href', 'Link', array(), 'footer_social' ),
						jj_icon( 'icon', 'Icon', 'footer_social' ),
					)
				),
				jj_repeater( 'footer_base', 'Bottom line', array( jj_text( 'text', 'Text', array(), 'footer_base' ) ) ),
			)
		);
	}
);
