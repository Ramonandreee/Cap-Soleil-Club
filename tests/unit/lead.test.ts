import { describe, expect, it } from "vitest";
import {
  CONSENT_VERSION,
  COUNTRY_CODES,
  DIAL_CODES,
  checkEmail,
  checkFirstName,
  checkLastName,
  checkPhone,
  normalisePhone,
  suggestEmail,
  validatePayload,
} from "../../supabase/functions/_shared/lead.ts";

const base = {
  firstName: "Ana",
  lastName: "Martin",
  email: "ana@example.com",
  country: "FR",
  phone: "06 12 34 56 78",
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

describe("checkLastName", () => {
  it("follows the same rules as the first name", () => {
    for (const name of ["Martin", "de la Croix", "O'Neill", "Müller-Lüdenscheidt", "Gonçalves"]) {
      expect(checkLastName(name), name).toBeNull();
    }
    expect(checkLastName("")).toBe("required");
    expect(checkLastName("a".repeat(81))).toBe("too_long");
    expect(checkLastName("www.spam.com")).toBe("invalid");
  });
});

describe("normalisePhone", () => {
  it("has a dial code for every country in the list", () => {
    for (const code of COUNTRY_CODES) expect(DIAL_CODES[code], code).toMatch(/^[1-9]\d{0,3}$/);
  });
  it("completes a local number with the country chosen", () => {
    expect(normalisePhone("06 12 34 56 78", "FR")).toBe("+33612345678");
    expect(normalisePhone("(11) 91234-5678", "BR")).toBe("+5511912345678");
    expect(normalisePhone("011 91234-5678", "br")).toBe("+5511912345678");
    expect(normalisePhone("07700 900123", "GB")).toBe("+447700900123");
    expect(normalisePhone("(415) 555-0123", "US")).toBe("+14155550123");
    expect(normalisePhone("1 415 555 0123", "US")).toBe("+14155550123");
    expect(normalisePhone("8 912 345-67-89", "RU")).toBe("+79123456789");
    expect(normalisePhone("06 1234 5678", "IT")).toBe("+390612345678");
  });
  it("keeps a number that brings its own code", () => {
    expect(normalisePhone("+33 6 12 34 56 78", "BR")).toBe("+33612345678");
    expect(normalisePhone("0033 6 12 34 56 78")).toBe("+33612345678");
    expect(normalisePhone("+55 11 91234-5678")).toBe("+5511912345678");
  });
  it("refuses what is not a phone number", () => {
    expect(normalisePhone("06 12 34 56 78")).toBeNull(); // sem país e sem +
    expect(normalisePhone("06 12 34 56 78", "XX")).toBeNull();
    expect(normalisePhone("12345", "FR")).toBeNull();
    expect(normalisePhone("+0 612345678")).toBeNull();
    expect(normalisePhone("+33 6 12 34 56 78 90 12 34")).toBeNull();
    expect(normalisePhone("call me", "FR")).toBeNull();
    expect(normalisePhone("06+12345678", "FR")).toBeNull();
    expect(normalisePhone(612345678, "FR")).toBeNull();
  });
  it("tells required from invalid", () => {
    expect(checkPhone("", "FR")).toBe("required");
    expect(checkPhone("  ", "FR")).toBe("required");
    expect(checkPhone("0612", "FR")).toBe("invalid");
    expect(checkPhone("6".repeat(40), "FR")).toBe("too_long");
    expect(checkPhone("06 12 34 56 78", "FR")).toBeNull();
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
      lastName: " de  la Croix ",
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
      lastName: "de la Croix",
      email: "ana@example.com",
      country: "FR",
      phone: "+33612345678",
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
    const result = validatePayload({ ...base, country: undefined, phone: "+33 6 12 34 56 78", locale: "<x>", referrer: "javascript:alert(1)", path: "http://x", device: "fridge", invite: "0OIL", phase: "x" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lead).toMatchObject({ locale: "en", referrerHost: null, landingPath: null, device: null, invite: null, phase: null, country: null, phone: "+33612345678" });
  });

  it("reports every field error at once", () => {
    const result = validatePayload({ firstName: "", email: "nope", country: "XX", phone: "06 12 34 56 78", consent: false, consentVersion: CONSENT_VERSION });
    expect(result).toEqual({
      ok: false,
      errors: { firstName: "required", lastName: "required", email: "invalid", country: "invalid", phone: "invalid", consent: "required" },
    });
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
