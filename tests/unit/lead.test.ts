import { describe, expect, it } from "vitest";
import {
  CONSENT_VERSION,
  checkEmail,
  checkFirstName,
  suggestEmail,
  validatePayload,
} from "../../supabase/functions/_shared/lead.ts";

const base = {
  firstName: "Ana",
  email: "ana@example.com",
  consent: true,
  consentVersion: CONSENT_VERSION,
  elapsedMs: 5000,
};

describe("checkFirstName", () => {
  it("accepts real names", () => {
    for (const name of ["Ana", "Anne-Marie", "O'Brien", "José", "Łukasz", "Zoë", "Mary Ann", "李"]) {
      expect(checkFirstName(name), name).toBeNull();
    }
  });
  it("rejects empty, too long and junk", () => {
    expect(checkFirstName("")).toBe("required");
    expect(checkFirstName("   ")).toBe("required");
    expect(checkFirstName(undefined)).toBe("required");
    expect(checkFirstName("a".repeat(81))).toBe("too_long");
    expect(checkFirstName("12345")).toBe("invalid");
    expect(checkFirstName("<script>")).toBe("invalid");
    expect(checkFirstName("visit https://spam")).toBe("invalid");
    expect(checkFirstName("cheap.com")).toBe("invalid");
  });
});

describe("checkEmail", () => {
  it("accepts valid addresses", () => {
    for (const email of ["a@b.co", "first.last+tag@sub.example.fr", "  Ana@Example.COM  "]) {
      expect(checkEmail(email), email).toBeNull();
    }
  });
  it("rejects invalid addresses", () => {
    expect(checkEmail("")).toBe("required");
    for (const email of ["ana", "ana@", "@x.com", "ana@x", "a..b@x.com", ".a@x.com", "a@-x.com", "a@x.c", "a b@x.com"]) {
      expect(checkEmail(email), email).not.toBeNull();
    }
    expect(checkEmail(`${"a".repeat(250)}@x.com`)).toBe("too_long");
  });
});

describe("suggestEmail", () => {
  it("fixes common domain typos", () => {
    expect(suggestEmail("ana@gmial.com")).toBe("ana@gmail.com");
    expect(suggestEmail("ana@gmail.co")).toBe("ana@gmail.com");
    expect(suggestEmail("ana@hotmial.fr")).toBe("ana@hotmail.fr");
  });
  it("leaves correct and unknown domains alone", () => {
    expect(suggestEmail("ana@gmail.com")).toBeNull();
    expect(suggestEmail("ana@gmx.com")).toBeNull();
    expect(suggestEmail("ana@capsoleilclub.com")).toBeNull();
    expect(suggestEmail("ana")).toBeNull();
  });
});

describe("validatePayload", () => {
  it("cleans a valid payload", () => {
    const result = validatePayload({
      ...base,
      firstName: "  Ana \u200b ",
      email: " ANA@Example.com ",
      country: "fr",
      locale: "pt-BR",
      utm: { source: "instagram", medium: "bio", evil: "x", campaign: "a".repeat(500) },
      referrer: "L.Instagram.com",
      path: "/?utm_source=instagram",
      device: "mobile",
      invite: "skdajadz",
      phase: "heure",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lead).toMatchObject({
      firstName: "Ana",
      email: "ana@example.com",
      country: "FR",
      locale: "pt-BR",
      referrerHost: "l.instagram.com",
      landingPath: "/?utm_source=instagram",
      device: "mobile",
      invite: "SKDAJADZ",
      phase: "heure",
    });
    expect(result.lead.utm).toEqual({ source: "instagram", medium: "bio", campaign: "a".repeat(120) });
    expect(result.honeypot).toBe(false);
  });

  it("drops bad optional data instead of failing", () => {
    const result = validatePayload({ ...base, locale: "<x>", referrer: "javascript:alert(1)", path: "http://x", device: "fridge", invite: "0OIL", phase: "x" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lead).toMatchObject({ locale: "en", referrerHost: null, landingPath: null, device: null, invite: null, phase: null, country: null });
  });

  it("reports every field error at once", () => {
    const result = validatePayload({ firstName: "", email: "nope", country: "XX", consent: false, consentVersion: CONSENT_VERSION });
    expect(result).toEqual({ ok: false, errors: { firstName: "required", email: "invalid", country: "invalid", consent: "required" } });
  });

  it("requires a known consent version", () => {
    const result = validatePayload({ ...base, consentVersion: "1999-01-01" });
    expect(result).toEqual({ ok: false, errors: { consent: "invalid" } });
  });

  it("rejects non-objects", () => {
    for (const value of [null, "x", 1, [], undefined]) {
      expect(validatePayload(value)).toMatchObject({ ok: false, reason: "shape" });
    }
  });

  it("flags the honeypot", () => {
    const result = validatePayload({ ...base, website: "http://spam" });
    expect(result.ok && result.honeypot).toBe(true);
  });
});
