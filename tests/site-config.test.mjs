import test from "node:test";
import assert from "node:assert/strict";
import { siteConfig } from "../src/config/site.ts";
import { validateSiteConfig } from "../src/config/validate.ts";
import { buildHeadTags, buildThemeCss } from "../src/config/theme.ts";
import {
  buildContactMarkup,
  buildDialogMarkup,
  buildLaunchMarkup,
  buildSocialMarkup,
  buildSurfaceMarkup,
} from "../src/config/markup.ts";

/** A deep clone so each case can mutate freely. */
const clone = () => structuredClone(siteConfig);

test("the shipped default configuration is valid", () => {
  const result = validateSiteConfig(siteConfig);
  assert.ok(Array.isArray(result.warnings));
});

test("a broken colour, avatar path or launch date fails the build with a readable message", () => {
  const bad = clone();
  bad.theme.colors.accent = "not-a-colour!";
  bad.avatar.model = "avatar/model.glb";
  bad.launch.date = "next tuesday";
  assert.throws(
    () => validateSiteConfig(bad),
    (error) => {
      assert.match(error.message, /theme\.colors\.accent/);
      assert.match(error.message, /avatar\.model/);
      assert.match(error.message, /launch\.date/);
      assert.match(error.message, /CUSTOMIZATION\.md/);
      return true;
    },
  );
});

test("a delivery mode without its target is rejected", () => {
  const formspree = clone();
  formspree.contact.mode = "formspree";
  formspree.contact.formspreeId = "";
  assert.throws(() => validateSiteConfig(formspree), /formspreeId/);

  const endpoint = clone();
  endpoint.contact.mode = "endpoint";
  endpoint.contact.endpoint = "";
  assert.throws(() => validateSiteConfig(endpoint), /contact\.endpoint/);
});

test("placeholders warn but never block the build", () => {
  const fresh = clone();
  const { warnings } = validateSiteConfig(fresh);
  assert.ok(warnings.some((warning) => warning.includes("contact.email")));
  assert.ok(warnings.some((warning) => warning.includes("seo.canonicalUrl")));
});

test("out-of-range animation values are rejected", () => {
  const bad = clone();
  bad.animation.intensity = 9;
  bad.animation.speed = 0;
  bad.animation.maxFps.mobile = 2;
  assert.throws(() => validateSiteConfig(bad), /animation\.intensity/);
});

test("theme CSS exposes every colour as a --uc- custom property", () => {
  const css = buildThemeCss(siteConfig);
  for (const name of Object.keys(siteConfig.theme.colors)) {
    const token = `--uc-${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
    assert.ok(css.includes(`${token}:`), `missing ${token}`);
  }
  assert.ok(css.includes("@font-face"), "self-hosted fonts should emit @font-face rules");
});

test("a font with file: null emits no @font-face rule and no download", () => {
  const config = clone();
  config.theme.fonts.display.file = null;
  const css = buildThemeCss(config);
  assert.ok(!css.includes("black-ops-one"));
  assert.ok(css.includes('"Display", Impact'), "the fallback stack is still applied");
});

test("SEO tags reflect the configuration and omit empty optional fields", () => {
  const config = clone();
  config.seo.title = "Acme is coming";
  config.seo.canonicalUrl = "https://acme.test/";
  config.seo.ogImage = "https://acme.test/og.png";
  const head = buildHeadTags(config);
  assert.ok(head.includes("<title>Acme is coming</title>"));
  assert.ok(head.includes('<link rel="canonical" href="https://acme.test/" />'));
  assert.ok(head.includes('property="og:image" content="https://acme.test/og.png"'));

  const bare = clone();
  bare.seo.canonicalUrl = "";
  bare.seo.ogImage = "";
  const bareHead = buildHeadTags(bare);
  assert.ok(!bareHead.includes("canonical"));
  assert.ok(!bareHead.includes("og:image"));
});

test("content is HTML-escaped so config text cannot inject markup", () => {
  const config = clone();
  config.seo.title = '</title><script>alert(1)</script>';
  config.contact.buttonLabel = '"><img src=x onerror=alert(1)>';
  assert.ok(!buildHeadTags(config).includes("<script>"));
  assert.ok(!buildContactMarkup(config).includes("<img src=x"));
});

test("a javascript: social link is dropped rather than rendered", () => {
  const config = clone();
  config.social = [
    { label: "Bad", href: "javascript:alert(1)" },
    { label: "GitHub", href: "https://github.com/example", icon: "github" },
  ];
  const markup = buildSocialMarkup(config);
  assert.ok(!markup.includes("javascript:"));
  assert.ok(markup.includes("https://github.com/example"));
  assert.ok(markup.includes('rel="noopener noreferrer"'));
  assert.throws(
    () => validateSiteConfig({ ...config, social: [{ label: "Bad", href: "javascript:alert(1)" }] }),
    /social\[0\]\.href/,
  );
});

test("an empty social list renders nothing", () => {
  const config = clone();
  config.social = [];
  assert.equal(buildSocialMarkup(config), "");
});

test("mailto and none modes ship no dialog markup at all", () => {
  const mailto = clone();
  mailto.contact.mode = "mailto";
  assert.equal(buildDialogMarkup(mailto), "");
  assert.ok(buildContactMarkup(mailto).includes("mailto:"));

  const none = clone();
  none.contact.mode = "none";
  assert.equal(buildDialogMarkup(none), "");
  assert.equal(buildContactMarkup(none), "");
});

test("the dialog only reserves verification space when a site key is set", () => {
  const withKey = clone();
  withKey.contact.mode = "endpoint";
  withKey.contact.endpoint = "/api/contact";
  withKey.contact.turnstileSiteKey = "0x0000";
  assert.ok(buildDialogMarkup(withKey).includes("contact-turnstile"));

  const withoutKey = clone();
  withoutKey.contact.mode = "endpoint";
  withoutKey.contact.endpoint = "/api/contact";
  withoutKey.contact.turnstileSiteKey = "";
  assert.ok(!buildDialogMarkup(withoutKey).includes("contact-turnstile"));
});

test("decorative layers keep their responsive srcsets and can be switched off", () => {
  const markup = buildSurfaceMarkup(siteConfig);
  assert.ok(markup.includes("crack-left-512.webp 512w"));
  assert.ok(markup.includes("crack-left-1024.webp 1024w"));
  assert.ok(markup.includes('type="image/avif"'));
  assert.ok(markup.includes('alt=""'), "decorations must stay out of the accessibility tree");

  const off = clone();
  off.background.cracks.enabled = false;
  off.background.treads.enabled = false;
  assert.equal(buildSurfaceMarkup(off), "");
});

test("launch messaging is absent by default and emits a machine-readable date when set", () => {
  assert.equal(buildLaunchMarkup(siteConfig), "");
  const config = clone();
  config.launch.date = "2026-12-01T09:00:00Z";
  const markup = buildLaunchMarkup(config);
  assert.ok(markup.includes('data-launch="2026-12-01T09:00:00.000Z"'));
  assert.ok(markup.includes('datetime="2026-12-01T09:00:00.000Z"'));
  assert.ok(markup.includes('aria-live="polite"'));
});
