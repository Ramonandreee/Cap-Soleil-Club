// Ato IV: o cartão que se compõe enquanto a pessoa digita e o envio da
// candidatura para a função `apply` (Supabase). As regras de validação são
// as mesmas do servidor (supabase/functions/_shared/lead.ts).

import {
  CONSENT_VERSION,
  checkCountry,
  checkEmail,
  checkFirstName,
  suggestEmail,
  type ApplyPayload,
  type DeviceClass,
  type Field,
  type FieldError,
  type UtmKey,
} from "../../supabase/functions/_shared/lead.ts";
import { APPLY_URL, TURNSTILE_SITE_KEY } from "../config.ts";
import { LIST } from "../content/site.ts";

const form = document.querySelector<HTMLFormElement>("[data-apply]");
const status = document.querySelector<HTMLElement>("[data-status]");
const card = document.querySelector<HTMLElement>("[data-card]");

const TIMEOUT_MS = 15_000;

interface Landing {
  utm: Partial<Record<UtmKey, string>>;
  referrer?: string;
  path: string;
  invite?: string;
}

/**
 * De onde a pessoa veio: lido do endereço desta página, na hora.
 * Nada é guardado no navegador (sem cookies e sem storage), como promete a Privacy.
 */
function landing(): Landing {
  const params = new URLSearchParams(location.search);
  const utm: Partial<Record<UtmKey, string>> = {};
  for (const key of ["source", "medium", "campaign", "content", "term"] as const) {
    const value = params.get(`utm_${key}`);
    if (value) utm[key] = value.slice(0, 120);
  }
  let referrer: string | undefined;
  try {
    const host = document.referrer ? new URL(document.referrer).hostname : "";
    if (host && host !== location.hostname) referrer = host;
  } catch {
    // referrer inválido
  }
  return {
    utm,
    referrer,
    path: (location.pathname + location.search).slice(0, 255),
    invite: params.get("invite") ?? undefined,
  };
}

function deviceClass(): DeviceClass {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (!coarse) return "desktop";
  return Math.min(screen.width, screen.height) >= 600 ? "tablet" : "mobile";
}

if (form && status && card) {
  const fields = {
    firstName: form.elements.namedItem("firstName") as HTMLInputElement,
    email: form.elements.namedItem("email") as HTMLInputElement,
    country: form.elements.namedItem("country") as HTMLSelectElement,
    consent: form.elements.namedItem("consent") as HTMLInputElement,
  } satisfies Record<Field, HTMLElement>;
  const honeypot = form.elements.namedItem("website") as HTMLInputElement;
  const submit = form.querySelector<HTMLButtonElement>("[data-submit]")!;
  const submitLabel = form.querySelector<HTMLElement>("[data-submit-label]")!;
  const suggestion = form.querySelector<HTMLElement>("#email-suggestion")!;
  const suggestButton = form.querySelector<HTMLButtonElement>("[data-suggestion]")!;
  const cardName = card.querySelector<HTMLElement>("[data-card-name]")!;
  const cardPlace = card.querySelector<HTMLElement>("[data-card-place]")!;
  const turnstileBox = form.querySelector<HTMLElement>("[data-turnstile]");

  const visit = landing();
  const readyAt = performance.now();
  const touched = new Set<Field>();
  let sending = false;

  const checks: Record<Field, () => FieldError | null> = {
    firstName: () => checkFirstName(fields.firstName.value),
    email: () => checkEmail(fields.email.value),
    country: () => checkCountry(fields.country.value),
    consent: () => (fields.consent.checked ? null : "required"),
  };

  function showError(field: Field, error: FieldError | null) {
    const input = fields[field];
    const message = form!.querySelector<HTMLElement>(`#${input.id}-error`);
    if (!message) return;
    if (error) {
      message.textContent = LIST.errors[field][error] || LIST.errors[field].invalid;
      message.hidden = false;
      input.setAttribute("aria-invalid", "true");
    } else {
      message.textContent = "";
      message.hidden = true;
      input.removeAttribute("aria-invalid");
    }
  }

  function validate(all: boolean): Field | null {
    let first: Field | null = null;
    for (const field of Object.keys(checks) as Field[]) {
      if (!all && !touched.has(field)) continue;
      const error = checks[field]();
      showError(field, error);
      if (error && !first) first = field;
    }
    return first;
  }

  // ---------- O cartão acompanha o que a pessoa digita ----------

  function paintCard() {
    const name = fields.firstName.value.trim().replace(/\s+/g, " ");
    cardName.textContent = name || LIST.card.namePlaceholder;
    cardName.classList.toggle("is-empty", !name);
    const option = fields.country.selectedOptions[0];
    cardPlace.textContent = fields.country.value && option ? option.text : cardPlace.dataset.default ?? "";
  }

  function updateSuggestion() {
    const proposal = suggestEmail(fields.email.value);
    suggestion.hidden = !proposal;
    suggestButton.textContent = proposal ?? "";
  }

  fields.firstName.addEventListener("input", () => {
    paintCard();
    if (touched.has("firstName")) showError("firstName", checks.firstName());
  });
  fields.country.addEventListener("change", () => {
    paintCard();
    touched.add("country");
    showError("country", checks.country());
  });
  fields.email.addEventListener("input", () => {
    if (touched.has("email")) showError("email", checks.email());
    if (!suggestion.hidden) updateSuggestion();
  });
  fields.email.addEventListener("blur", updateSuggestion);
  fields.consent.addEventListener("change", () => {
    touched.add("consent");
    showError("consent", checks.consent());
  });
  for (const field of ["firstName", "email"] as const) {
    fields[field].addEventListener("blur", () => {
      if (fields[field].value.trim()) touched.add(field);
      if (touched.has(field)) showError(field, checks[field]());
    });
  }
  suggestButton.addEventListener("click", () => {
    fields.email.value = suggestButton.textContent ?? fields.email.value;
    suggestion.hidden = true;
    touched.add("email");
    showError("email", checks.email());
    fields.email.focus();
  });

  // ---------- Turnstile (só se a chave pública estiver configurada) ----------

  let token = "";
  let widgetId: string | undefined;
  let turnstileLoading: Promise<void> | null = null;

  function loadTurnstile(): Promise<void> {
    if (!TURNSTILE_SITE_KEY || !turnstileBox) return Promise.resolve();
    turnstileLoading ??= new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("turnstile"));
      document.head.append(script);
    }).then(() => {
      turnstileBox.hidden = false;
      widgetId = window.turnstile?.render(turnstileBox, {
        sitekey: TURNSTILE_SITE_KEY,
        action: "apply",
        appearance: "interaction-only",
        theme: "light",
        size: "flexible",
        callback: (value: string) => (token = value),
        "expired-callback": () => (token = ""),
        "error-callback": () => (token = ""),
      });
    });
    return turnstileLoading;
  }

  async function turnstileToken(): Promise<string | undefined> {
    if (!TURNSTILE_SITE_KEY) return undefined;
    await loadTurnstile();
    const started = Date.now();
    while (!token && Date.now() - started < 10_000) await new Promise((r) => setTimeout(r, 150));
    return token || undefined;
  }

  form.addEventListener("focusin", () => void loadTurnstile().catch(() => undefined), { once: true });

  // ---------- Envio ----------

  function setSending(on: boolean) {
    sending = on;
    submit.disabled = on;
    form!.setAttribute("aria-busy", String(on));
    submitLabel.textContent = on ? LIST.sending : LIST.submit;
  }

  function say(kind: "error" | "success", title: string, body?: string) {
    status!.className = `list__status is-${kind}`;
    status!.replaceChildren();
    const first = document.createElement("p");
    first.textContent = title;
    if (kind === "success") first.className = "list__status-title";
    status!.append(first);
    if (body) {
      const second = document.createElement("p");
      second.textContent = body;
      status!.append(second);
    }
  }

  function succeed() {
    form!.hidden = true;
    card!.classList.add("is-sealed");
    say("success", LIST.success.title, LIST.success.body);
    status!.focus();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    status.className = "list__status";
    status.replaceChildren();

    for (const field of Object.keys(checks) as Field[]) touched.add(field);
    const invalid = validate(true);
    if (invalid) {
      fields[invalid].focus();
      return;
    }

    setSending(true);
    try {
      const payload: ApplyPayload = {
        firstName: fields.firstName.value,
        email: fields.email.value,
        country: fields.country.value || undefined,
        consent: true,
        consentVersion: CONSENT_VERSION,
        locale: navigator.language,
        utm: visit.utm,
        referrer: visit.referrer,
        path: visit.path,
        device: deviceClass(),
        invite: visit.invite,
        phase: document.documentElement.dataset.phase,
        elapsedMs: Math.round(performance.now() - readyAt),
        website: honeypot.value,
        turnstileToken: await turnstileToken(),
      };

      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
      let response: Response;
      try {
        response = await fetch(APPLY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "omit",
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timer);
      }

      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
        fields?: Partial<Record<Field, FieldError>>;
      };

      if (response.ok) {
        succeed();
        return;
      }
      if (response.status === 400 && body.error === "invalid" && body.fields && Object.keys(body.fields).length) {
        let first: Field | null = null;
        for (const [field, error] of Object.entries(body.fields) as [Field, FieldError][]) {
          showError(field, error);
          first ??= field;
        }
        if (first) fields[first].focus();
        return;
      }
      const message =
        response.status === 429
          ? LIST.errors.rateLimited
          : response.status === 403 && body.error === "challenge"
            ? LIST.errors.challenge
            : body.error === "too_fast"
              ? LIST.errors.tooFast
              : LIST.errors.server;
      say("error", message);
      status.focus();
    } catch {
      say("error", LIST.errors.network);
      status.focus();
    } finally {
      if (!form.hidden) setSending(false);
      if (widgetId !== undefined) {
        token = "";
        window.turnstile?.reset(widgetId);
      }
    }
  });

  paintCard();
  submit.disabled = false;
  form.querySelector<HTMLElement>("[data-nojs]")?.setAttribute("hidden", "");
}
