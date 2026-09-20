import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/saints",
  "/scriptures",
  "/temples",
  "/audio-library",
  "/community",
  "/daily-devotion",
  "/spiritual-calendar",
];

const protectedRoutes = [
  "/dashboard",
  "/palm-reading",
  "/horoscope",
  "/kundali-match",
  "/numerology",
];

test.describe("public platform surfaces", () => {
  for (const route of publicRoutes) {
    test(`${route} loads without horizontal overflow`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("body")).toBeVisible();
      const layout = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasNavigation: Boolean(document.querySelector("nav")),
      }));
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 2);
      expect(layout.hasNavigation || route === "/").toBeTruthy();
    });
  }
});

test("audio library exposes playback and offline controls", async ({ page }) => {
  await page.goto("/audio-library", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: /audio library/i })).toBeVisible();
  await expect(page.getByText(/offline|download/i).first()).toBeVisible();
});

test("protected astrology and palm routes redirect signed-out visitors safely", async ({ page }) => {
  for (const route of protectedRoutes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/auth(?:\?|$)/);
  }
});

test("print engine renders a stable PDF surface and loads report print rules", async ({ page }, testInfo) => {
  await page.goto("/audio-library", { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });

  const printRules = await page.evaluate(() => {
    const rules: string[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules ?? [])) rules.push(rule.cssText);
      } catch {
        // Cross-origin stylesheets are not required for the local print contract.
      }
    }
    return rules.join("\n");
  });
  expect(printRules).toContain("@media print");
  expect(printRules).toContain("data-print-root");

  const pdfPath = testInfo.outputPath("audio-library-print.pdf");
  await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
  await expect(page.locator("body")).toBeVisible();
});

test.describe("authenticated report workflows", () => {
  test.skip(
    !process.env.QA_STORAGE_STATE,
    "Set QA_STORAGE_STATE to a non-privileged test session to exercise saved Kundali and palm reports.",
  );

  test.use({ storageState: process.env.QA_STORAGE_STATE });

  test("Kundali and palm report routes render without layout overflow", async ({ page }) => {
    for (const route of ["/kundali-match", "/palm-reading"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await expect(page.locator("h1").first()).toBeVisible();
      const width = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(width.scrollWidth).toBeLessThanOrEqual(width.clientWidth + 2);
    }
  });
});