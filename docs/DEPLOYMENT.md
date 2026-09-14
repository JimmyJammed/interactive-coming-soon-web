# Deployment

`npm run build` produces a folder of static files in `dist/` — HTML, CSS, JS,
images, fonts and the model. There is no server, no runtime and no database, so
this deploys almost anywhere.

**Before you deploy**, run `npm run check`. It lints, type-checks, tests and
builds in one command.

---

## What tested means here

| Platform | Status |
| --- | --- |
| Local production preview (`npm run preview`) | **Verified** for this release |
| Vercel | Configuration included and reviewed; **not deployed** as part of this release |
| Netlify | Configuration included and reviewed; **not deployed** as part of this release |
| Cloudflare Pages, GitHub Pages, S3/CloudFront, nginx, Apache | Standard static hosting; instructions provided, not exercised |

The output is an ordinary static bundle, so these should all be
straightforward — but we would rather tell you what was actually run than imply
certification we do not have.

---

## Vercel

`vercel.json` ships with the template, so there is nothing to configure.

**From the dashboard**

1. Push your project to GitHub, GitLab or Bitbucket.
2. In Vercel, **Add New → Project**, import the repository.
3. Vercel detects Vite. Confirm **Build Command** `npm run build` and
   **Output Directory** `dist`.
4. **Deploy.**

**From the CLI**

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production
```

**Custom domain:** Project → Settings → Domains → add it, then follow the DNS
records shown. Vercel provisions TLS automatically.

`vercel.json` also sets a one-year immutable cache on `/assets/*` (safe — those
filenames are content-hashed) and three security headers: `X-Content-Type-Options`,
`Referrer-Policy` and `X-Frame-Options: DENY`.

> If you use `contact.mode: "endpoint"` with a Vercel function, put it in an
> `api/` folder at the project root. It is deployed alongside the static site,
> and `/api/contact` resolves without extra configuration.

---

## Netlify

`netlify.toml` ships with the template.

**From the dashboard**

1. Push to a Git provider.
2. **Add new site → Import an existing project.**
3. Build command `npm run build`, publish directory `dist` — `netlify.toml`
   already declares both.
4. **Deploy.**

**From the CLI**

```bash
npm i -g netlify-cli
netlify deploy              # draft
netlify deploy --prod       # production
```

**Drag and drop:** run `npm run build` locally and drag the `dist` folder onto
[app.netlify.com/drop](https://app.netlify.com/drop). No repository needed.

**Custom domain:** Site configuration → Domain management. TLS is automatic.

`netlify.toml` pins Node 20 for the build. If you hit a Node-version error,
raise it to `"22"` — the template needs 22.18+ for its tests, though the build
itself is less strict.

---

## Cloudflare Pages

1. **Workers & Pages → Create → Pages → Connect to Git.**
2. Framework preset **Vite**, build command `npm run build`, output directory
   `dist`.
3. Add environment variable `NODE_VERSION` = `22`.
4. **Save and Deploy.**

Headers are not read from `vercel.json` or `netlify.toml`. To get the same
caching and security headers, add `public/_headers`:

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
```

Anything in `public/` is copied to the output root, so that file lands where
Cloudflare expects it.

---

## GitHub Pages

Works, with one wrinkle: if you deploy to `username.github.io/repo-name/`
rather than a custom domain, the site is served from a **subpath**, and the
template's absolute asset paths (`/avatar/…`, `/fonts/…`) will 404.

Set the base path in `vite.config.ts`:

```ts
export default defineConfig({
  base: "/repo-name/",   // ← add this
  plugins: [siteConfigPlugin()],
  // …
});
```

A custom domain, or a `username.github.io` repository, serves from the root and
needs no `base`.

Workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

Then set **Settings → Pages → Source** to **GitHub Actions**.

---

## Any other static host

```bash
npm run build
```

Upload the **contents** of `dist/` to your web root. That is the whole
procedure — S3 + CloudFront, Firebase Hosting, Render, Surge, Fastly, a VPS with
nginx, or shared hosting over FTP.

### Requirements

- Serve `index.html` at `/`.
- Serve the correct `Content-Type` for `.avif`, `.webp`, `.woff2` and `.glb`.
  Modern servers get all four right; older nginx and Apache installs sometimes
  do not. See below.
- **HTTPS.** Not optional — some browsers restrict features on plain HTTP, and
  visitors will not trust the page.

### nginx

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    root /var/www/under-construction;
    index index.html;

    # Content-hashed filenames: cache them forever.
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Never cache the entry document — it references the hashed filenames.
    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Frame-Options "DENY" always;

    # Older builds may not know these types.
    types {
        model/gltf-binary  glb;
        image/avif         avif;
        image/webp         webp;
        font/woff2         woff2;
    }

    gzip on;
    gzip_types text/css application/javascript image/svg+xml model/gltf-binary;
}
```

### Apache — `.htaccess`

```apache
AddType model/gltf-binary .glb
AddType image/avif .avif
AddType font/woff2 .woff2

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set X-Frame-Options "DENY"
  <FilesMatch "\.(js|css|woff2|glb|avif|webp)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "index\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
```

---

## Caching, in one rule

- **`/assets/*`** — filenames contain a content hash. Cache for a year,
  immutable. A rebuild produces new filenames, so stale files are impossible.
- **`index.html`** — **never** cache aggressively. It is the file that points at
  the hashed names; a cached copy will keep loading the old bundle after you
  deploy.
- **`public/` files** (`/avatar/…`, `/fonts/…`, `/images/…`) — these are *not*
  hashed. A medium cache (a day or a week) is a reasonable compromise: long
  enough to help, short enough that replacing the avatar takes effect.

---

## Post-deploy checklist

- [ ] The page loads over HTTPS at your real domain
- [ ] The 3D avatar appears and starts moving after a moment
- [ ] Moving the cursor over it makes it follow
- [ ] The pause button works and the choice survives a reload
- [ ] The contact button does what you configured
- [ ] A test message actually arrives (if you configured a form)
- [ ] `view-source:` shows your headline and description in the HTML
- [ ] Sharing the URL in Slack, iMessage or a DM shows your `ogImage`
- [ ] The favicon appears in the tab
- [ ] It looks right on a real phone, not just an emulated one
- [ ] DevTools console is clean — no errors
- [ ] `robots` meta is what you intended

Link preview not updating? Most platforms cache aggressively. Use the
[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or
[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) to force a
re-scrape.

---

## Getting it wrong in a recoverable way

The site is static and every deploy is atomic on the managed hosts above. If
something looks wrong after a deploy, roll back to the previous deployment in
your host's dashboard, then fix it locally and redeploy. There is no state to
migrate and nothing to corrupt.
