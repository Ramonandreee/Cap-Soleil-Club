import { describe, expect, it } from "vitest";
import { PHOTOS, PHOTO_WIDTHS, codeFromName, cropFor, type PhotoId } from "../../src/lib/photos.ts";

describe("photo manifest", () => {
  const entries = Object.entries(PHOTOS) as [PhotoId, (typeof PHOTOS)[PhotoId]][];

  it("describes every photo in English for screen readers", () => {
    for (const [id, slot] of entries) {
      expect(slot.alt.length, id).toBeGreaterThan(20);
      expect(slot.alt, id).toMatch(/^[A-Z][^]*\.$/);
      expect(slot.alt, id).not.toMatch(/\b(image|photo|picture) of\b/i);
    }
  });

  it("points every mobile version at a real slot", () => {
    for (const [id, slot] of entries) {
      if (slot.mobile) expect(PHOTOS[slot.mobile], `${id} → ${slot.mobile}`).toBeDefined();
    }
  });

  it("never mentions a founding date", () => {
    for (const [, slot] of entries) expect(slot.alt).not.toMatch(/\bEst\.?\s*\d{4}|Established|Founded in/i);
  });

  it("offers widths up to 4K for Retina screens", () => {
    expect([...PHOTO_WIDTHS]).toEqual([...PHOTO_WIDTHS].sort((a, b) => a - b));
    expect(PHOTO_WIDTHS.at(-1)).toBe(3840);
  });

  it("gives every photo the format of the shot list", () => {
    for (const [id, slot] of entries) {
      expect(slot.ideal, id).toBeGreaterThan(slot.min);
      if (slot.mobile) expect(PHOTOS[slot.mobile].ratio, id).toEqual([slot.ratio[1], slot.ratio[0]]);
    }
  });
});

describe("cropFor", () => {
  it("cuts a ChatGPT landscape to the hero's 16:9, keeping the middle", () => {
    expect(cropFor(1536, 1024, [16, 9])).toEqual({ left: 0, top: 80, width: 1536, height: 864 });
  });
  it("cuts a portrait to 9:16 and 4:5", () => {
    expect(cropFor(1024, 1536, [9, 16])).toEqual({ left: 80, top: 0, width: 864, height: 1536 });
    expect(cropFor(1024, 1536, [4, 5])).toEqual({ left: 0, top: 128, width: 1024, height: 1280 });
  });
  it("leans towards the subject", () => {
    expect(cropFor(1536, 1024, [16, 9], "top").top).toBe(40);
    expect(cropFor(1536, 1024, [16, 9], "bottom").top).toBe(120);
    expect(cropFor(2000, 1000, [1, 1], "left").left).toBe(300);
    expect(cropFor(2000, 1000, [1, 1], "right").left).toBe(700);
  });
  it("leaves a photo that already fits alone", () => {
    expect(cropFor(1536, 1024, [3, 2])).toEqual({ left: 0, top: 0, width: 1536, height: 1024 });
    expect(cropFor(1535, 1024, [3, 2])).toEqual({ left: 0, top: 0, width: 1535, height: 1024 });
  });
});

describe("codeFromName", () => {
  it("reads the code from the Drive naming and its variations", () => {
    expect(codeFromName("Foto - H1 - v01.png")).toBe("H1");
    expect(codeFromName("Foto - H1m - v02.png")).toBe("H1m");
    expect(codeFromName("foto-h3M-v1.jpg")).toBe("H3m");
    expect(codeFromName("B2.jpeg")).toBe("B2");
    expect(codeFromName("Cap Soleil i4 final.webp")).toBe("I4");
  });
  it("ignores names without a code", () => {
    expect(codeFromName("ChatGPT Image 3 Oct 2026.png")).toBeNull();
    expect(codeFromName("H12.png")).toBeNull();
    expect(codeFromName("BH1.png")).toBeNull();
  });
});
