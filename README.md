# johnjofin.com

A React frontend rendered from WordPress content.

WordPress is the **admin only** — it is read once at build time and never sits in
a visitor's request path. The published site is plain HTML, CSS and JS that
Apache serves directly, so cPanel needs no Node runtime.

```
Editor → WordPress admin → REST → next build → static files → Apache
```

## Layout

| Path                    | What it is                                                            |
| ----------------------- | --------------------------------------------------------------------- |
| `web/`                  | Next.js 15 app. `output: "export"` — builds to `web/out/`.            |
| `wp-plugin/jj-content/` | WordPress plugin: the content model, the read API, the contact route. |
| `scripts/seed/`         | Extracts content from the original page and loads it into WordPress.  |
| `scripts/verify/`       | Parity harness — payload, text, pixels, behaviour.                    |
| `index.html`, `css/`, `js/` | The original static site. Kept as the reference the parity tests compare against. |

## Local development

WordPress runs in [Local](https://localfwp.com) as the site **johnjofin**
(`http://johnjofin.local`). `scripts/wp.sh` wraps WP-CLI for it — Local does not
put `php` on `PATH` and serves MySQL over a per-site socket, so plain `wp` fails
with "Error establishing a database connection".

```bash
scripts/wp.sh plugin list          # WP-CLI, correctly wired up
```

Required plugins: **ACF Pro** (options pages and repeaters are Pro features) and
**jj-content**, symlinked in:

```bash
ln -s "$PWD/wp-plugin/jj-content" \
      ~/"Local Sites/johnjofin/app/public/wp-content/plugins/jj-content"
scripts/wp.sh plugin activate jj-content
```

Then run the frontend:

```bash
cd web && npm install && WP_URL=http://johnjofin.local npm run dev
```

## Editing content

**WP Admin → Site Content**, one sub-page per section, in the order they appear
on the page. The field definitions live in
[`wp-plugin/jj-content/inc/fields.php`](wp-plugin/jj-content/inc/fields.php) as
code, so they are versioned and deploy with the plugin — nothing has to be
exported from the database.

Body copy uses a trimmed WYSIWYG whose **Formats** dropdown carries the design's
three emphasis styles (blue highlight, ink emphasis, faith accent), so an editor
never has to type `<strong class="hl">`.

**Saving does not publish.** The site is static; content goes live on the next
build.

## Seeding

`scripts/seed/content.json` is the content extracted verbatim from the original
`index.html`. `npm run seed:bundle` copies it and every file it references into
`wp-plugin/jj-content/seed-content/`, which is what makes the plugin
self-contained.

Two ways to load it — both run the same code in
[`inc/seed.php`](wp-plugin/jj-content/inc/seed.php) against the same bundle:

| Where              | How                                              |
| ------------------ | ------------------------------------------------ |
| WP admin           | **Site Content → Import content** (no SSH needed) |
| Local, with WP-CLI | `npm run seed`                                    |

Both are idempotent: media is matched by its original path, so re-running
refreshes the fields without duplicating the library. Re-importing **does**
overwrite anything edited in Site Content — the contact recipient address is the
one exception, and is never clobbered.

To re-extract from the static page after editing it, serve the repo on :8777,
then `npm run seed:extract && npm run seed:bundle`.

## Building

```bash
cd web
WP_URL=https://cms.johnjofin.com npm run build   # → web/out/
```

`npm run build` clears `.next/cache` first. The content fetch uses
`force-cache` because an uncached fetch would make the route dynamic, which
static export cannot render — clearing the cache is what keeps a build from
publishing yesterday's content.

The build **fails loudly** if WordPress is unreachable, rather than publishing a
page with sections missing.

## Deploying to cPanel

Two document roots on the one server:

johnjofin.com is an **addon domain** on a cPanel account whose *primary* domain
is santomission.com. That decides the paths — `public_html` belongs to the
primary domain, not to us:

| Host                       | Doc root                     | Contents               |
| -------------------------- | ---------------------------- | ---------------------- |
| santomission.com (primary) | `~/public_html`              | — not ours             |
| `johnjofin.com`            | `~/public_html/johnjofin.com` | contents of `web/out/` |
| `cms.johnjofin.com`        | `~/cms` — **outside** `public_html` | WordPress       |

### 1. Create the subdomain

**cPanel → Domains → Create A New Domain** (older themes: **Subdomains**).

- Domain: `cms.johnjofin.com`
- **Untick "Share document root with johnjofin.com"**
- Document root: `cms` (the field is relative to home → `/home/<user>/cms`)

> cPanel will offer a document root inside `public_html`. **Do not accept it.**
> Two things go wrong:
>
> - `public_html/johnjofin.com` is johnjofin.com's own root. WordPress installed
>   there would drop `wp-config.php`, `wp-admin/` and a rewriting `.htaccess`
>   into the folder holding the static export, and the two would fight over
>   `index.html` vs `index.php`.
> - Anything under `public_html` is also served by the **primary** domain, so
>   `public_html/cms` would expose the admin at `santomission.com/cms/wp-admin`.
>
> Keep `cms` a sibling of `public_html`. Create the folder in File Manager first
> if cPanel refuses a root that does not exist yet.

Then **SSL/TLS Status → Run AutoSSL** so the certificate covers the new host.
The frontend fetches `https://cms.…` at build time and the contact form posts to
it from the browser, so both need a valid certificate.

**DNS:** if the nameservers point at this cPanel server, the record is created
automatically. If DNS lives elsewhere (Cloudflare, the registrar), add an **A
record** for `cms` pointing at the same IP as `johnjofin.com` — cPanel shows it
under **Server Information → Shared IP Address**. On Cloudflare set that record
to **DNS only** (grey cloud) during setup.

### 2. Install and seed

1. Install WordPress into `~/cms` (WP Toolkit / Softaculous, or manually).
2. Upload `wp-plugin/jj-content` to `wp-content/plugins/`, install ACF Pro,
   activate both.
3. **Site Content → Import content → Import content.** The plugin bundles the
   starter content and its media in `seed-content/`, so a fresh install
   populates itself — no SSH, no WP-CLI, and no local database to migrate
   (which would risk a WordPress-version mismatch).
4. Build locally with `WP_URL=https://cms.johnjofin.com`, upload the contents of
   `web/out/` into `public_html/johnjofin.com/`.

Build on your own machine, not on the server — shared hosting typically has no
Node, an old one, or a memory cap that kills `next build`. Zip the output rather
than uploading ~1.7MB of small files one by one:

```bash
cd web && WP_URL=https://cms.johnjofin.com npm run build
cd out && zip -r ../site.zip .     # upload + extract via File Manager
```

On a redeploy, clear the target directory first (keeping any `.htaccess` you
added). Next emits content-hashed filenames under `_next/static/`, so uploading
over the top leaves every previous build's chunks behind for ever.

Contact-form mail goes out through PHP's `mail()` on shared hosting, which Gmail
and Outlook often reject. If test messages do not arrive, install WP Mail SMTP
and point it at a real sender — the endpoint itself is fine; this is purely
deliverability.

Images are served from the WordPress media library at `cms.johnjofin.com`, so the
uploads directory must stay public.

Add the production origin to the contact form's CORS allow-list in
[`inc/rest-contact.php`](wp-plugin/jj-content/inc/rest-contact.php) — it names
`https://johnjofin.com` already; the `jj_contact_allowed_origins` filter can add
more without editing the plugin.

Because a content edit only appears after a rebuild, a natural follow-up is a
`save_post` webhook that triggers a build and uploads the result.

## Verifying

The port is held to the original page, not to judgement. Serve both, then run
the four checks:

```bash
python3 -m http.server 8777 &            # the original, at repo root
(cd web/out && python3 -m http.server 8778 &)

npm run verify:payload     # every string survives the WordPress round trip
npm run verify:text        # every string reaches the rendered page
npm run verify:visual      # section-by-section pixel diff at 1440 and 390
npm run verify:behaviour   # carousel, anchors, header hysteresis, menu
```

`verify:visual` writes failures to `scripts/verify/diff/` as original / next /
diff triplets.
