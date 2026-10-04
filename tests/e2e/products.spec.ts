import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const [slug, name] of [["riviera", "Embroidered, Riviera"], ["polo", "Cotton polo, cream"], ["navy-cap", "Stitched brim, navy"]]) {
  test(`boutique opens ${slug} and returns to the list`, async ({ page }) => {
    await page.goto("/#boutique");
    await page.locator(`a.fragment__zoom[href="/${slug}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/${slug}(?:\\.html)?$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(new RegExp(name.replace(", ", ",\\s*")));
    for (const image of await page.locator("main img").all()) {
      await expect(image).toBeVisible();
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBeTruthy();
    }
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.getByRole("link", { name: "PUT YOUR NAME DOWN", exact: true }).click();
    await expect(page).toHaveURL(/#la-liste$/);
    await expect(page.getByLabel("FIRST NAME", { exact: true })).toBeVisible();
  });
}

