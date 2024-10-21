import { test, expect } from "@playwright/test";
import { chromium } from "playwright";

test("assessment", async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1) Launch Amazon.in
  await page.goto("https://www.amazon.in/");

  // Verify the search bar is visible
  const searchBox = await page.locator("#twotabsearchtextbox");
  await expect(searchBox).toBeVisible();

  // 2) Select "Electronics" from the dropdown
  await page.selectOption("#searchDropdownBox", { label: "Electronics" });

  // 3) Type "airpod" in the search textbox
  await searchBox.fill("airpod");

  // Wait for suggestions to appear
  await page.waitForSelector(".s-suggestion-container");

  // 4) Get all displayed suggestions and log them in the terminal
  const suggestions = await page.$$eval(
    ".s-suggestion-container .s-suggestion",
    (elements) => elements.map((el) => el.textContent?.trim())
  );

  console.log("Search Suggestions:", suggestions);

  // 5) Click on "airpods bluetooth wireless" from the list
  const suggestion = await page.locator(
    '.s-suggestion:has-text("airpods bluetooth wireless")'
  );
  await suggestion.click();

  // Wait for search results page to load
  await page.waitForSelector("[data-component-type='s-search-results']");

  // 6) Verify if the item with label "Noise Buds N1 in-Ear Truly Wireless..." is displayed
  const productLink = await page.locator(
    'a:has-text("Noise Buds N1 in-Ear Truly Wireless")'
  ).first();
  await expect(productLink).toBeVisible();
  

  // Click on the product link
  const [newTab] = await Promise.all([
    context.waitForEvent("page"), // Wait for new tab to open
    productLink.click(),
  ]);

  // Wait for the new tab to load completely
  await newTab.waitForLoadState("domcontentloaded");

  // 7) Verify the new tab URL is correct
  const expectedUrl =
    "https://www.amazon.in/Noise-Launched-Wireless-Playtime-Instacharge/dp/B0CQJZD55X";
  expect(newTab.url()).toContain(expectedUrl);

  // 8) Verify 'Visit the Noise Store' link is displayed
  const noiseStoreLink = await newTab.locator("#bylineInfo");
  await expect(noiseStoreLink).toBeVisible();

  // Close the new tab
  await newTab.close();

  console.log("Test completed successfully!");
});

//test('get started link', async ({ page }) => {
//  await page.goto('https://playwright.dev/');

// Click the get started link.
//  await page.getByRole('link', { name: 'Get started' }).click();

// Expects page to have a heading with the name of Installation.
//  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
//});
