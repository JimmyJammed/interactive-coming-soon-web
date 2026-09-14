# Architecture

`src/config/site.ts` supplies typed content, branding, contact and animation settings. Vite validates these settings and renders static HTML at build time. Avatar rendering loads separately; the performance controller owns gaze timing and suspension. Contact integration uses the selected configured provider; the default placeholder email requires no secret and sends no request during startup.
