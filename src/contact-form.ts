/**
 * The accessible contact dialog: validation, character counting, focus
 * management, and submission state. It knows nothing about how a message is
 * actually delivered — see src/contact-integration.ts for that.
 *
 * Copyright (c) 2026 Falcon Forged Ventures LLC. All rights reserved.
 * Licensed, not sold. See LICENSE.md.
 */

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  /** Empty string when human verification is not configured. */
  verificationToken: string;
}

export interface ContactFormOptions {
  /** Resolve only after the server confirms delivery; reject on any failure. */
  send?: (message: ContactMessage) => Promise<void>;
  /** Called the first time the dialog opens, so a captcha can load lazily. */
  onOpen?: () => void;
  /** A submitted token is single-use, including when the request fails. */
  resetVerification?: () => void;
  /** Block sending until a verification token has been supplied. */
  requireVerification?: boolean;
  /** Copy shown after a successful send. */
  successMessage?: string;
}

export function initContactForm(options: ContactFormOptions = {}) {
  const dialog = document.querySelector<HTMLDialogElement>("#contact-dialog")!;
  const opener = document.querySelector<HTMLAnchorElement>("#contact-open")!;
  const close = document.querySelector<HTMLButtonElement>("#contact-close")!;
  const title = document.querySelector<HTMLElement>("#contact-title")!;
  const form = document.querySelector<HTMLFormElement>("#contact-form")!;
  const fields = document.querySelector<HTMLFieldSetElement>("#contact-fields")!;
  const footer = document.querySelector<HTMLElement>("#contact-footer")!;
  const name = document.querySelector<HTMLInputElement>("#contact-name")!;
  const email = document.querySelector<HTMLInputElement>("#contact-email")!;
  const message = document.querySelector<HTMLTextAreaElement>("#contact-message")!;
  const counter = document.querySelector<HTMLElement>("#contact-message-count")!;
  const button = document.querySelector<HTMLButtonElement>("#contact-send")!;
  const buttonLabel = document.querySelector<HTMLElement>("#contact-send-label")!;
  const status = document.querySelector<HTMLElement>("#contact-status")!;
  const requireVerification = options.requireVerification === true;
  const successMessage =
    options.successMessage?.trim() || "Message sent. Thanks for reaching out — we’ll be in touch soon!";
  let token = "";
  let sending = false;
  let completed = false;
  let backdropStart = false;

  function showStatus(text: string, kind: "error" | "success" | "pending") {
    status.textContent = text;
    status.dataset.kind = kind;
  }

  function syncButton() {
    button.disabled = !options.send || (requireVerification && !token) || sending || completed;
    buttonLabel.textContent = sending ? "Sending…" : "Send message";
  }

  function validate(field: HTMLInputElement | HTMLTextAreaElement) {
    const error = document.querySelector<HTMLElement>(`#${field.id}-error`)!;
    const empty = !field.value.trim();
    let text = "";
    if (field === name && empty) text = "Add your name.";
    if (field === email && (empty || email.validity.typeMismatch)) {
      text = "Enter a valid email address.";
    }
    if (field === message && empty) text = "Add a brief message.";
    field.setAttribute("aria-invalid", String(Boolean(text)));
    error.textContent = text;
    error.hidden = !text;
    return !text;
  }

  for (const field of [name, email, message]) {
    field.addEventListener("blur", () => validate(field));
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validate(field);
    });
  }
  message.addEventListener("input", () => {
    counter.textContent = `${message.value.length.toLocaleString()} / 1,500`;
  });

  opener.addEventListener("click", (event) => {
    // The ordinary email link remains a no-JavaScript fallback.
    if (typeof dialog.showModal !== "function") return;
    event.preventDefault();
    if (completed) {
      completed = false;
      fields.hidden = false;
      footer.hidden = false;
      showStatus("", "pending");
      syncButton();
    }
    dialog.showModal();
    title.focus({ preventScroll: true });
    options.onOpen?.();
  });
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => opener.focus({ preventScroll: true }));
  const outside = (event: PointerEvent | MouseEvent) => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom;
  };
  dialog.addEventListener("pointerdown", (event) => {
    backdropStart = event.target === dialog && outside(event);
  });
  dialog.addEventListener("click", (event) => {
    if (backdropStart && event.target === dialog && outside(event)) dialog.close();
    backdropStart = false;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending || completed) return;
    const invalid = [name, email, message].filter((field) => !validate(field));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }
    if (!options.send) {
      showStatus("This form is not connected to a delivery service yet.", "error");
      return;
    }
    if (requireVerification && !token) {
      showStatus("Please complete human verification before sending.", "pending");
      return;
    }
    const payload = {
      name: name.value.trim(),
      email: email.value.trim(),
      message: message.value.trim(),
      verificationToken: token,
    };
    sending = true;
    fields.disabled = true;
    form.setAttribute("aria-busy", "true");
    showStatus("Sending your message…", "pending");
    syncButton();
    try {
      await options.send(payload);
      completed = true;
      form.reset();
      counter.textContent = "0 / 1,500";
      fields.hidden = true;
      footer.hidden = true;
      showStatus(successMessage, "success");
    } catch {
      showStatus("That didn’t go through. Your message is still here. Please verify again and retry.", "error");
    } finally {
      sending = false;
      token = "";
      fields.disabled = false;
      form.removeAttribute("aria-busy");
      syncButton();
      options.resetVerification?.();
    }
  });

  syncButton();
  return {
    setVerificationToken(value: string) {
      token = value;
      if (!sending && !completed && status.dataset.kind === "pending") {
        showStatus("", "pending");
      }
      syncButton();
    },
    clearVerification() {
      token = "";
      syncButton();
      if (requireVerification && !sending && !completed) {
        showStatus("Please complete human verification before sending.", "pending");
      }
    },
    setVerificationError() {
      token = "";
      syncButton();
      if (!sending && !completed) showStatus("Verification couldn’t load. Please try again in a moment.", "error");
    },
  };
}
