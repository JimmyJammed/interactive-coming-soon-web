/**
 * Connects the contact dialog to whichever delivery mode is configured in
 * src/config/site.ts. Nothing in this file talks to a specific vendor account:
 * you supply your own Formspree id or your own endpoint URL.
 *
 *   "none"      → no contact affordance at all
 *   "mailto"    → the button is a plain mail link; this module does nothing
 *   "formspree" → POST to https://formspree.io/f/<your-id>
 *   "endpoint"  → POST JSON to your own URL
 *
 * Cloudflare Turnstile is optional and off unless `contact.turnstileSiteKey`
 * is set. Verifying the token is your server's job — see docs/CUSTOMIZATION.md.
 *
 * Copyright (c) 2026 Falcon Forged Ventures LLC. All rights reserved.
 * Licensed, not sold. See LICENSE.md.
 */

import { initContactForm, type ContactMessage } from "./contact-form.ts";
import { siteConfig } from "./config/site.ts";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string | undefined;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileReady?: () => void;
  }
}

const TURNSTILE_SCRIPT =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileReady&render=explicit";
const REQUEST_TIMEOUT_MS = 20_000;

type ContactResponse = { ok?: boolean; error?: string; errors?: { message?: string }[] };

/** Builds the `send` function for the configured mode, or null for mailto/none. */
function createSender(): ((message: ContactMessage) => Promise<void>) | null {
  const { contact } = siteConfig;

  const post = async (url: string, body: unknown) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      let payload: ContactResponse = {};
      try {
        payload = (await response.json()) as ContactResponse;
      } catch {
        // A 2xx with an empty or non-JSON body is treated as success below.
      }
      if (!response.ok) {
        const detail = payload.error ?? payload.errors?.[0]?.message ?? `HTTP ${response.status}`;
        throw new Error(`Contact request failed: ${detail}`);
      }
      if (payload.ok === false) throw new Error(payload.error ?? "The contact endpoint rejected the message.");
    } finally {
      clearTimeout(timeout);
    }
  };

  if (contact.mode === "formspree") {
    const id = contact.formspreeId?.trim();
    if (!id) return null;
    return ({ name, email, message, verificationToken }) =>
      post(`https://formspree.io/f/${encodeURIComponent(id)}`, {
        name,
        email,
        message,
        // Formspree uses `_replyto` to set the reply address on the notification.
        _replyto: email,
        ...(verificationToken ? { "cf-turnstile-response": verificationToken } : {}),
      });
  }

  if (contact.mode === "endpoint") {
    const url = contact.endpoint?.trim();
    if (!url) return null;
    return ({ name, email, message, verificationToken }) =>
      post(url, {
        name,
        email,
        message,
        verificationToken,
        submissionId: crypto.randomUUID(),
      });
  }

  return null;
}

export function connectContactForm() {
  const { contact } = siteConfig;
  // "none" ships no markup, and "mailto" needs no JavaScript at all.
  if (contact.mode === "none" || contact.mode === "mailto") return;
  if (!document.querySelector("#contact-dialog")) return;

  const send = createSender();
  if (!send) {
    console.warn(
      `[under-construction] contact.mode is "${contact.mode}" but its target is not configured. ` +
        "The dialog will open but cannot send. See docs/CUSTOMIZATION.md § Contact.",
    );
  }

  const siteKey = contact.turnstileSiteKey?.trim();
  if (!siteKey) {
    initContactForm({ send: send ?? undefined, successMessage: contact.successMessage });
    return;
  }

  const mount = document.querySelector<HTMLElement>("#contact-turnstile");
  const placeholder = document.querySelector<HTMLElement>("#contact-verification-placeholder");
  const dialog = document.querySelector<HTMLDialogElement>("#contact-dialog")!;
  if (!mount) {
    initContactForm({ send: send ?? undefined, successMessage: contact.successMessage });
    return;
  }

  let widgetId: string | undefined;
  let widgetSize: "normal" | "compact" | undefined;
  let scriptState: "idle" | "loading" | "ready" | "failed" = "idle";
  let resizeTimer: number | undefined;

  const form = initContactForm({
    send: send ?? undefined,
    onOpen,
    resetVerification,
    requireVerification: true,
    successMessage: contact.successMessage,
  });

  const chooseSize = (): "normal" | "compact" => {
    const width = mount.getBoundingClientRect().width || mount.clientWidth;
    return width && width < 300 ? "compact" : "normal";
  };

  function removeWidget() {
    if (widgetId && window.turnstile) {
      try {
        window.turnstile.remove(widgetId);
      } catch {
        // The widget may already be gone; nothing to clean up.
      }
    }
    widgetId = undefined;
    widgetSize = undefined;
  }

  function renderWidget() {
    if (!window.turnstile || !dialog.open) return;
    const size = chooseSize();
    if (widgetId && widgetSize === size) {
      window.turnstile.reset(widgetId);
      form.clearVerification();
      return;
    }
    removeWidget();
    placeholder?.remove();
    widgetSize = size;
    widgetId = window.turnstile.render(mount!, {
      sitekey: siteKey,
      action: "contact",
      size,
      "response-field": false,
      callback: (token: string) => form.setVerificationToken(token),
      "expired-callback": () => form.clearVerification(),
      "timeout-callback": () => form.clearVerification(),
      "error-callback": () => {
        form.setVerificationError();
        return true;
      },
    });
    if (!widgetId) form.setVerificationError();
  }

  function loadScript() {
    if (scriptState !== "idle") return;
    scriptState = "loading";
    window.onTurnstileReady = () => {
      scriptState = "ready";
      renderWidget();
    };
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      scriptState = "failed";
      form.setVerificationError();
    };
    document.head.append(script);
  }

  function onOpen() {
    if (scriptState === "ready") renderWidget();
    else if (scriptState === "failed") form.setVerificationError();
    else loadScript();
  }

  function resetVerification() {
    if (widgetId && window.turnstile) window.turnstile.reset(widgetId);
  }

  dialog.addEventListener("close", removeWidget);
  window.addEventListener("resize", () => {
    if (!dialog.open || !widgetId) return;
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (dialog.open && widgetId && chooseSize() !== widgetSize) {
        renderWidget();
        form.clearVerification();
      }
    }, 150);
  });
}
