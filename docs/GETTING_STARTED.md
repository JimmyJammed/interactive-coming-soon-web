# Getting started

From a fresh clone to your own customized page. About 15 minutes.

---

## 1. Check your Node version

```bash
node --version
```

You need **v22.18 or newer**. If that command fails or prints something older,
install the current LTS from [nodejs.org](https://nodejs.org) and try again.

## 2. Clone the repository

```bash
git clone https://github.com/JimmyJammed/interactive-coming-soon-web.git
cd interactive-coming-soon-web
```

You should see `package.json`, `index.html` and a `src/` folder.

## 3. Install dependencies

```bash
npm ci
```

This downloads three.js and the build tooling from npm. It takes a few seconds
and creates `node_modules/`. Nothing is sent anywhere and no account is needed.

## 4. Run it

```bash
npm run dev
```

Open the printed address — <http://127.0.0.1:5173> by default.

You should see the headline, the caution tape, and the 3D construction worker,
who will start looking around after a moment. Move your mouse over the page and
he will follow the cursor.

> The build prints a few yellow reminders about placeholder values. That is
> expected on a fresh copy — you are about to replace them.

## 5. Make your first change

Open `src/config/site.ts` and edit the `content` block:

```ts
content: {
  headline: "Coming Soon",
  subheadline: "Something good is on the way.",
  statusText: "Back shortly.",
  footerText: "",
},
```

Save. The browser updates immediately.

## 6. Set the things you should not ship without

Still in `src/config/site.ts`:

```ts
contact: {
  mode: "mailto",
  email: "you@yourdomain.com",   // ← yours
  // …
},

seo: {
  title: "Your Company — Coming Soon",
  description: "A one-line description for search results and link previews.",
  canonicalUrl: "https://yourdomain.com/",
  ogImage: "https://yourdomain.com/og-image.png",  // 1200 × 630
  // …
},
```

Those three yellow reminders should now be gone.

## 7. Make it yours

Change the colours, fonts, background and avatar — all in the same file. Every
field is commented, and your editor will suggest valid values as you type.

**[docs/CUSTOMIZATION.md](CUSTOMIZATION.md)** walks through each area with
worked examples.

A five-minute rebrand that changes a lot:

```ts
theme: {
  colors: {
    background: "#0f1115",       // dark
    backgroundWash: "#0f1115cc",
    text: "#e8e6e1",
    headline: "#ffffff",
    subheadline: "#d6d3cc",
    muted: "#9c988e",
    accent: "#4ade80",           // your brand colour
    accentHover: "#6ee7a0",
    accentContrast: "#06210f",
    // …the rest follow the same pattern
  },
},
```

## 8. Check it before you ship

```bash
npm run check
```

That lints, type-checks, runs the tests and builds. If it passes, you are good.

## 9. Build and preview the real thing

```bash
npm run build
npm run preview
```

`npm run preview` serves the exact files that will go live, from `dist/`. Click
through it once before deploying.

## 10. Deploy

**[docs/DEPLOYMENT.md](DEPLOYMENT.md)** covers Vercel, Netlify, Cloudflare
Pages, GitHub Pages and plain static hosting.

---

## Where things live

| File | Purpose |
| --- | --- |
| `src/config/site.ts` | **Everything you normally change.** |
| `src/config/types.ts` | What each field means and what values are valid. |
| `src/style.css` | Layout and structure. Colours come from the config. |
| `public/` | Files served as-is at your site root. |
| `index.html` | A shell. Its placeholders are filled from the config at build time — edit the config, not this. |

---

## A short checklist before launch

- [ ] `content` says what you want it to say
- [ ] `contact.email` is your address, and `contact.mode` is what you want
- [ ] `seo.title` and `seo.description` are yours
- [ ] `seo.canonicalUrl` is your live URL
- [ ] `seo.ogImage` points at a real 1200 × 630 image
- [ ] `seo.robots` is right — `"noindex, nofollow"` if you would rather stay out
      of search until launch
- [ ] Favicons replaced, if you have your own
- [ ] `avatar.alt` describes whatever model you ended up using
- [ ] `npm run check` passes
- [ ] You clicked through `npm run preview` on a phone-sized window

---

Stuck? **[docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md)**, then
[SUPPORT.md](../SUPPORT.md).
