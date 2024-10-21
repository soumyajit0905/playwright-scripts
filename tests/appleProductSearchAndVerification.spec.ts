import { test, expect } from "@playwright/test";
import { chromium } from "playwright";

test("Amazon Search For Apple AirPod", async () => {
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

  // 5) Click on the last option from the suggestions list
  const lastSuggestion = await page.locator(".s-suggestion-container .s-suggestion").last();
  await lastSuggestion.click();

  // Wait for search results page to load
  await page.waitForSelector("[data-component-type='s-search-results']");

  // 6) Verify if the item with label "Apple AirPods 4 Wireless Earbuds..." is displayed
  const productLink = await page.locator(
    'a:has-text("Apple AirPods 4 Wireless Earbuds")'
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
    "https://www.amazon.in/Apple";
  expect(newTab.url()).toContain(expectedUrl);

  // 8) Verify 'Visit the Apple Store' link is displayed
  const storeLink = await newTab.locator("#bylineInfo");
  await expect(storeLink).toBeVisible();

  // 10) Click on 'Visit the Apple Store' link
  await storeLink.click();

  // 11) Wait for the Noise Store page to load and verify the URL
  await newTab.waitForLoadState("domcontentloaded");
  await expect(newTab).toHaveURL(/https:\/\/www\.amazon\.in\/stores\/Apple\/page/);

  // Close the new tab after completing the test
  await newTab.close();

  console.log("Test completed successfully!");
});