#!/usr/bin/env bash
# WP-CLI against the "johnjofin" site in Local (by Flywheel).
#
# Local does not put php on PATH and serves MySQL over a per-site unix socket,
# so plain `wp` fails with "Error establishing a database connection".
# (~/bin/wp is a wrapper pinned to a *different* site's socket — don't use it.)
#
# Everything below is resolved at run time rather than hardcoded, because Local
# reassigns the php version and the socket directory across upgrades.
#
#   scripts/wp.sh option get siteurl
#   scripts/wp.sh eval-file scripts/seed/seed.php

set -euo pipefail

SITE_NAME="${JJ_LOCAL_SITE:-johnjofin}"
LOCAL_SUPPORT="$HOME/Library/Application Support/Local"
SITES_JSON="$LOCAL_SUPPORT/sites.json"

die() {
  echo "wp.sh: $*" >&2
  exit 1
}

[ -f "$SITES_JSON" ] || die "cannot find Local's sites.json at $SITES_JSON"

# site id + document root, straight out of Local's own registry
read -r SITE_ID SITE_PATH <<EOF
$(python3 - "$SITES_JSON" "$SITE_NAME" <<'PY'
import json, os, sys
sites = json.load(open(sys.argv[1]))
want = sys.argv[2]
for sid, s in sites.items():
    if s.get("name") == want:
        print(sid, os.path.expanduser(s["path"]))
        break
else:
    sys.exit("no Local site named %r" % want)
PY
)
EOF

WP_ROOT="$SITE_PATH/app/public"
[ -f "$WP_ROOT/wp-config.php" ] || die "no wp-config.php under $WP_ROOT"

SOCKET="$LOCAL_SUPPORT/run/$SITE_ID/mysql/mysqld.sock"
[ -S "$SOCKET" ] || die "mysql socket missing — is the '$SITE_NAME' site running in Local?"

# newest bundled php that actually has a darwin binary for this arch
PHP=""
for dir in "$LOCAL_SUPPORT"/lightning-services/php-*/bin/darwin-*/bin/php; do
  [ -x "$dir" ] && PHP="$dir"
done
[ -n "$PHP" ] || die "no bundled php found under $LOCAL_SUPPORT/lightning-services"

WP_CLI="${WP_CLI_PHAR:-$HOME/bin/wp-cli.phar}"
[ -f "$WP_CLI" ] || die "wp-cli.phar not found at $WP_CLI (set WP_CLI_PHAR)"

exec "$PHP" -d mysqli.default_socket="$SOCKET" "$WP_CLI" --path="$WP_ROOT" "$@"
