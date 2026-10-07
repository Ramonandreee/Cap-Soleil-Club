import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type Route } from "@playwright/test";

// A função de verdade nunca é chamada nos testes: toda requisição para o
// Supabase é interceptada. Assim nenhum teste grava no banco real.
const APPLY = "**/functions/v1/apply";

function trackProblems(page: Page) {
  const problems: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && !msg.text().includes("404 (Not Found)")) problems.push(msg.text());
  });
  page.on("pageerror", (error) => problems.push(error.message));
  return problems;
}

async function answer(route: Route, status: number, body: unknown) {
  await route.fulfill({
    status,
    contentType: "application/json",
    headers: { "access-control-allow-origin": "*" },
    body: JSON.stringify(body),
  });
}

async function fillForm(
  page: Page,
  { name = "Ana", lastName = "Martin", email = "ana@example.com", country = "FR", phone = "06 12 34 56 78", consent = true } = {},
) {
  await page.locator("#la-liste").scrollIntoViewIfNeeded();
  await page.fill("#first-name", name);
  await page.fill("#last-name", lastName);
  await page.fill("#email", email);
  if (country) await page.selectOption("#country", country);
  await page.fill("#phone", phone);
  if (consent) await page.check("#consent");
  // O servidor recusa envios feitos em menos de 1,2 s (anti-robô).
  await page.waitForTimeout(1300);
}

test.describe("pages", () => {
  for (const [path, title] of [
    ["/", "Cap Soleil Lawn Tennis Club"],
    ["/privacy", "Privacy · Cap Soleil Lawn Tennis Club"],
    ["/legal", "Legal notice · Cap Soleil Lawn Tennis Club"],
  ] as const) {
    test(`${path} loads under the strict CSP without errors`, async ({ page }) => {
      const problems = trackProblems(page);
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      expect(response?.headers()["content-security-policy"]).toContain("script-src 'self'");
      await expect(page).toHaveTitle(title);
      await page.waitForLoadState("networkidle");
      expect(problems).toEqual([]);
    });
  }

  test("canonical and share links use clean addresses", async ({ page }) => {
    for (const [path, clean] of [["/", "/"], ["/privacy", "/privacy"], ["/legal", "/legal"]] as const) {
      await page.goto(path);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
      expect(new URL(canonical!).pathname).toBe(clean);
      expect(ogUrl).toBe(canonical);
    }
  });

  test("unknown pages answer 404 with the club page", async ({ page }) => {
    const response = await page.goto("/nowhere");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "The ball landed long." })).toBeVisible();
  });

  test("never shows a founding date", async ({ page }) => {
    for (const path of ["/", "/privacy", "/legal"]) {
      await page.goto(path);
      const text = await page.locator("body").innerText();
      expect(text).not.toMatch(/\bEst\.?\s*(1[89]|20)\d{2}\b|\bEstablished\b|\bFounded in\b/i);
    }
  });

  test("has no horizontal scroll", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("passes axe (WCAG 2.1 AA)", async ({ page }) => {
    for (const path of ["/?phase=heure", "/?phase=midi", "/?phase=nuit", "/privacy", "/legal"]) {
      await page.goto(path);
      await page.waitForTimeout(1800); // transição das cores do céu
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(results.violations.map((v) => `${path}: ${v.id} (${v.nodes.length})`)).toEqual([]);
    }
  });
});

test.describe("the sun clock", () => {
  test("follows the real hour on the Côte d'Azur", async ({ page }) => {
    await page.goto("/");
    const phase = await page.locator("[data-sky]").getAttribute("data-phase");
    expect(["aube", "matin", "midi", "heure", "crepuscule", "nuit"]).toContain(phase);
    await expect(page.locator("[data-clock]")).toBeVisible();
    await expect(page.locator("[data-clock-time]")).toHaveText(/^\d{2}:\d{2}$/);
  });

  test("shows the night line at night and the golden hour line at L'Heure", async ({ page }) => {
    await page.goto("/?phase=nuit");
    await expect(page.locator("[data-sky]")).toHaveAttribute("data-phase", "nuit");
    await expect(page.locator("[data-phase-line]")).toHaveText("The club is closed for the night. The list remains open.");
    await expect(page.locator("[data-clock-phase]")).toHaveText("Nuit");

    await page.goto("/?phase=heure");
    await expect(page.locator("[data-phase-line]")).toHaveText("The courts close at sunset. The list does not.");

    await page.goto("/?phase=midi");
    await expect(page.locator("[data-sky]")).toHaveAttribute("data-ink", "light");
    await expect(page.locator("[data-phase-line]")).toBeHidden();
  });

  test("ignores unknown phases", async ({ page }) => {
    await page.goto("/?phase=constructor");
    const phase = await page.locator("[data-sky]").getAttribute("data-phase");
    expect(["aube", "matin", "midi", "heure", "crepuscule", "nuit"]).toContain(phase);
  });
});

test.describe("the acts", () => {
  test("scrolling through L'Heure takes the light to night", async ({ page }) => {
    await page.goto("/?phase=heure");
    const hour = page.locator("[data-hour]");
    await hour.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>("[data-hour]")!;
      window.scrollTo({ top: el.offsetTop + el.offsetHeight - window.innerHeight - 2, behavior: "instant" });
    });
    await expect
      .poll(async () => Number(await hour.evaluate((el) => el.style.getPropertyValue("--stars"))))
      .toBeGreaterThan(0.95);
    await expect(page.locator(".hour__line").last()).toHaveClass(/is-current/);
  });

  test("the rules and the Pro Shop fragments appear", async ({ page }) => {
    await page.goto("/");
    for (const text of ["Whites are worn on court.", "Nothing to prove.", "The Pro Shop opens to the list first."]) {
      const item = page.getByText(text);
      await item.scrollIntoViewIfNeeded();
      await expect(item).toBeVisible();
      await expect(item).toHaveCSS("opacity", "1");
    }
  });

  test("the masthead appears after the threshold", async ({ page }) => {
    await page.goto("/");
    const bar = page.locator("[data-masthead]");
    await expect(bar).toBeHidden();
    await page.locator("#regles").scrollIntoViewIfNeeded();
    await expect(bar).toBeVisible();
    await bar.getByRole("link", { name: "La Liste" }).click();
    // Leva ao começo do ato IV; no celular o cartão vem antes do formulário.
    await expect(page.locator("#list-title")).toBeInViewport();
  });
});

test.describe("the list", () => {
  test("the card follows what is typed", async ({ page }) => {
    await page.goto("/");
    await page.fill("#first-name", "Anne-Sophie");
    await expect(page.locator("[data-card-name]")).toHaveText("Anne-Sophie");
    await page.fill("#last-name", "de la Croix");
    await expect(page.locator("[data-card-name]")).toHaveText("Anne-Sophie de la Croix");
    await page.selectOption("#country", "IT");
    await expect(page.locator("[data-card-place]")).toHaveText("Italy");
    await page.fill("#first-name", "");
    await page.fill("#last-name", "");
    await expect(page.locator("[data-card-name]")).toHaveText("Your name");
  });

  test("puts the country code before the WhatsApp number", async ({ page }) => {
    await page.goto("/");
    const code = page.locator("[data-dial]");
    await expect(code).toBeHidden();
    await page.selectOption("#country", "BR");
    await expect(code).toHaveText("+55");
    await page.fill("#phone", "+33 6 12 34 56 78");
    await expect(code).toBeHidden();
    await page.fill("#phone", "11 91234-5678");
    await expect(code).toHaveText("+55");
    await page.selectOption("#country", "");
    await page.locator("#phone").blur();
    await expect(page.locator("#phone-error")).toHaveText(
      "Please check the number. Choose your country above, or start with + and the country code.",
    );
    await page.selectOption("#country", "BR");
    await expect(page.locator("#phone-error")).toBeHidden();
  });

  test("explains every missing field and focuses the first", async ({ page }) => {
    let calls = 0;
    await page.route(APPLY, (route) => {
      calls++;
      return answer(route, 200, { ok: true });
    });
    await page.goto("/");
    await page.locator("#la-liste").scrollIntoViewIfNeeded();
    await page.click("[data-submit]");
    await expect(page.locator("#first-name-error")).toHaveText("Please write your first name.");
    await expect(page.locator("#last-name-error")).toHaveText("Please write your last name.");
    await expect(page.locator("#email-error")).toHaveText("Please write your email address.");
    await expect(page.locator("#phone-error")).toHaveText("Please write your WhatsApp number.");
    await expect(page.locator("#consent-error")).toHaveText("Please tick the box to receive the letters.");
    await expect(page.locator("#first-name")).toBeFocused();
    await expect(page.locator("#first-name")).toHaveAttribute("aria-invalid", "true");
    expect(calls).toBe(0);
  });

  test("suggests a fix for a mistyped email domain", async ({ page }) => {
    await page.goto("/");
    await page.fill("#email", "ana@gmial.com");
    await page.locator("#email").blur();
    await page.getByRole("button", { name: "ana@gmail.com" }).click();
    await expect(page.locator("#email")).toHaveValue("ana@gmail.com");
  });

  test("puts the name down and seals the card", async ({ page }) => {
    let sent: Record<string, unknown> | null = null;
    await page.route(APPLY, async (route) => {
      sent = route.request().postDataJSON();
      await answer(route, 200, { ok: true });
    });
    await page.goto("/?utm_source=instagram&utm_medium=bio&phase=heure");
    await fillForm(page, { name: "  Ana  " });
    await page.click("[data-submit]");

    await expect(page.locator("[data-status]")).toContainText("Your name is down.");
    await expect(page.locator("[data-status]")).toBeFocused();
    await expect(page.locator("[data-card]")).toHaveClass(/is-sealed/);
    await expect(page.locator("[data-apply]")).toBeHidden();

    expect(sent).toMatchObject({
      firstName: "  Ana  ",
      lastName: "Martin",
      email: "ana@example.com",
      country: "FR",
      phone: "06 12 34 56 78",
      consent: true,
      consentVersion: "2026-10-03.2",
      utm: { source: "instagram", medium: "bio" },
      path: "/?utm_source=instagram&utm_medium=bio&phase=heure",
      phase: "heure",
      website: "",
    });
    expect(sent!.elapsedMs).toBeGreaterThanOrEqual(1200);
    expect(["mobile", "tablet", "desktop"]).toContain(sent!.device);
  });

  test("shows the server's field errors", async ({ page }) => {
    await page.route(APPLY, (route) => answer(route, 400, { error: "invalid", fields: { email: "invalid" } }));
    await page.goto("/");
    await fillForm(page);
    await page.click("[data-submit]");
    await expect(page.locator("#email-error")).toHaveText("Please check your email address.");
    await expect(page.locator("#email")).toBeFocused();
  });

  for (const [label, status, body, message] of [
    ["rate limit", 429, { error: "rate_limited" }, "Too many attempts. Please try again later."],
    ["server error", 500, { error: "server" }, "Something went wrong on our side. Please try again in a moment."],
    ["challenge", 403, { error: "challenge" }, "We could not confirm this request. Please try again."],
  ] as const) {
    test(`answers a ${label} calmly and keeps the details`, async ({ page }) => {
      await page.route(APPLY, (route) => answer(route, status, body));
      await page.goto("/");
      await fillForm(page);
      await page.click("[data-submit]");
      await expect(page.locator("[data-status]")).toHaveText(message);
      await expect(page.locator("[data-submit]")).toBeEnabled();
      await expect(page.locator("#email")).toHaveValue("ana@example.com");
    });
  }

  test("survives a network failure", async ({ page }) => {
    await page.route(APPLY, (route) => route.abort("internetdisconnected"));
    await page.goto("/");
    await fillForm(page);
    await page.click("[data-submit]");
    await expect(page.locator("[data-status]")).toContainText("The line to the club seems to be down.");
    await expect(page.locator("[data-submit]")).toBeEnabled();
  });

  test("sends once, even if the button is pressed twice", async ({ page }) => {
    let calls = 0;
    await page.route(APPLY, async (route) => {
      calls++;
      await new Promise((r) => setTimeout(r, 400));
      await answer(route, 200, { ok: true });
    });
    await page.goto("/");
    await fillForm(page);
    await page.locator("[data-submit]").click();
    await page.locator("[data-submit]").click({ force: true }).catch(() => undefined);
    await expect(page.locator("[data-status]")).toContainText("Your name is down.");
    expect(calls).toBe(1);
  });

  test("the trap field is invisible and out of the tab order", async ({ page }) => {
    await page.goto("/");
    const trap = page.locator("#website");
    await expect(trap).toHaveAttribute("tabindex", "-1");
    const box = await trap.boundingBox();
    expect(box === null || box.x < 0).toBe(true);
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the page still reads well and the form says why it is closed", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Cap Soleil");
    await expect(page.getByText("Every summer afternoon on the Côte d’Azur has its hour.")).toBeVisible();
    await expect(page.locator("[data-submit]")).toBeDisabled();
    await expect(page.getByText("The list needs JavaScript to work.")).toBeVisible();
  });
});

test.describe("with reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("everything is visible at once", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).not.toHaveClass(/motion/);
    await expect(page.getByText("Tea is poured at five.")).toHaveCSS("opacity", "1");
  });
});
