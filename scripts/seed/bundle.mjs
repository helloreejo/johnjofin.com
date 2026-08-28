/* Copy content.json and every file it references into the plugin, so the
   plugin is self-contained and can seed a fresh install with no repo, no SSH
   and no WP-CLI.

   node scripts/seed/bundle.mjs
*/
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  copyFileSync,
  existsSync,
} from "node:fs";
import { basename } from "node:path";

const OUT = "wp-plugin/jj-content/seed-content";
const content = JSON.parse(readFileSync("scripts/seed/content.json", "utf8"));

/* Every media path the content refers to, wherever it is nested.
   Matched on the VALUE, not the key: `src` and `file` are not the only names —
   seo.og_image and seo.twitter_image are bare strings under their own keys, and
   keying off the name silently left hero.jpg out of the bundle. */
const MEDIA = /\.(jpe?g|png|gif|webp|avif|svg|pdf)$/i;
const refs = new Set();
(function walk(o) {
  if (Array.isArray(o)) return o.forEach(walk);
  if (o && typeof o === "object") return Object.values(o).forEach(walk);
  if (typeof o === "string" && MEDIA.test(o)) refs.add(o);
})(content);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/media`, { recursive: true });
writeFileSync(`${OUT}/content.json`, JSON.stringify(content, null, 2));

let copied = 0;
let missing = 0;
for (const ref of [...refs].sort()) {
  /* seo fields carry absolute URLs; match them back to the images directory */
  const local = /^https?:\/\//.test(ref)
    ? `images/${basename(new URL(ref).pathname)}`
    : ref;
  if (!existsSync(local)) {
    console.warn(`  missing: ${local}`);
    missing++;
    continue;
  }
  copyFileSync(local, `${OUT}/media/${basename(local)}`);
  copied++;
}

console.log(`bundled content.json + ${copied} media file(s) into ${OUT}/`);
if (missing) {
  console.error(`${missing} referenced file(s) missing`);
  process.exit(1);
}
