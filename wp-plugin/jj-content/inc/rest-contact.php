<?php
/**
 * POST /wp-json/jj/v1/contact
 *
 * The published site is a static export, so it has no server of its own — this
 * is the one runtime call it makes back to WordPress. Validation mirrors the
 * client-side rules in ContactForm.tsx; never trust the client to have run them.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Origins allowed to POST here. Add staging hosts as needed. */
function jj_contact_allowed_origins(): array {
	return apply_filters(
		'jj_contact_allowed_origins',
		array(
			'https://johnjofin.com',
			'https://www.johnjofin.com',
			'http://localhost:3000',
			'http://localhost:8777',
		)
	);
}

function jj_contact_cors( WP_REST_Response $response ): WP_REST_Response {
	$origin = get_http_origin();
	if ( $origin && in_array( $origin, jj_contact_allowed_origins(), true ) ) {
		$response->header( 'Access-Control-Allow-Origin', $origin );
		$response->header( 'Vary', 'Origin' );
	}
	return $response;
}

function jj_contact_handle( WP_REST_Request $req ) {
	/* honeypot: a bot fills every field it finds, a person never sees this one */
	if ( '' !== trim( (string) $req->get_param( 'website' ) ) ) {
		return jj_contact_cors( new WP_REST_Response( array( 'ok' => true ), 200 ) );
	}

	$ip  = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
	$key = 'jj_contact_' . md5( $ip );
	$hits = (int) get_transient( $key );
	if ( $hits >= 5 ) {
		return jj_contact_cors(
			new WP_REST_Response(
				array( 'ok' => false, 'message' => 'Too many messages from this address. Please try again later.' ),
				429
			)
		);
	}

	$name    = sanitize_text_field( (string) $req->get_param( 'name' ) );
	$email   = sanitize_email( (string) $req->get_param( 'email' ) );
	$phone   = sanitize_text_field( (string) $req->get_param( 'phone' ) );
	$subject = sanitize_text_field( (string) $req->get_param( 'subject' ) );
	$message = sanitize_textarea_field( (string) $req->get_param( 'message' ) );
	$consent = $req->get_param( 'consent' );

	$errors = array();
	if ( '' === trim( $name ) ) {
		$errors['name'] = 'Please enter your name.';
	}
	if ( ! is_email( $email ) ) {
		$errors['email'] = 'Please enter a valid email address.';
	}
	if ( mb_strlen( trim( $message ) ) < 5 ) {
		$errors['message'] = 'Please include a short message.';
	}
	if ( ! $consent || 'false' === $consent ) {
		$errors['consent'] = 'Please tick the box so I can reply to you.';
	}
	if ( $errors ) {
		return jj_contact_cors( new WP_REST_Response( array( 'ok' => false, 'errors' => $errors ), 422 ) );
	}

	set_transient( $key, $hits + 1, HOUR_IN_SECONDS );

	$to = get_field( 'contact_recipient', 'option' );
	if ( ! is_email( $to ) ) {
		$to = get_option( 'admin_email' );
	}

	$lines = array(
		'Name:    ' . $name,
		'Email:   ' . $email,
		'Phone:   ' . ( $phone ?: '—' ),
		'Subject: ' . ( $subject ?: '—' ),
		'',
		$message,
		'',
		'—',
		'Sent from the contact form on ' . home_url(),
	);

	$sent = wp_mail(
		$to,
		sprintf( '[johnjofin.com] %s', $subject ?: 'New enquiry' ),
		implode( "\n", $lines ),
		array(
			'Content-Type: text/plain; charset=UTF-8',
			sprintf( 'Reply-To: %s <%s>', $name, $email ),
		)
	);

	if ( ! $sent ) {
		return jj_contact_cors(
			new WP_REST_Response(
				array( 'ok' => false, 'message' => 'The message could not be sent.' ),
				500
			)
		);
	}

	return jj_contact_cors( new WP_REST_Response( array( 'ok' => true ), 200 ) );
}

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'jj/v1',
			'/contact',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'permission_callback' => '__return_true',
					'callback'            => 'jj_contact_handle',
				),
			)
		);
	}
);

/* preflight: WordPress answers OPTIONS itself, it just needs the headers */
add_action(
	'rest_api_init',
	function () {
		remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
		add_filter(
			'rest_pre_serve_request',
			function ( $value ) {
				$origin = get_http_origin();
				if ( $origin && in_array( $origin, jj_contact_allowed_origins(), true ) ) {
					header( 'Access-Control-Allow-Origin: ' . $origin );
					header( 'Access-Control-Allow-Methods: POST, GET, OPTIONS' );
					header( 'Access-Control-Allow-Headers: Content-Type' );
					header( 'Vary: Origin' );
				}
				return $value;
			}
		);
	},
	15
);
