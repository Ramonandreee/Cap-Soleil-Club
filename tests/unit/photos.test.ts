import { describe, expect, it } from "vitest";
import { PHOTOS, PHOTO_WIDTHS, type PhotoId } from "../../src/lib/photos.ts";

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
});
