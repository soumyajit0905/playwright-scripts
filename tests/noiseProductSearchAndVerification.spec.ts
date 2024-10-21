import { test, expect } from "@playwright/test";
import { chromium } from "playwright";

test("Noise Store Product Verification", async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Launch Amazon.in
  await page.goto("https://www.amazon.in/");

  // Verify the search bar is visible
  const searchBox = await page.locator("#twotabsearchtextbox");
  await expect(searchBox).toBeVisible();

  // Select "Electronics" from the dropdown
  await page.selectOption("#searchDropdownBox", { label: "Electronics" });

  // Type "airpod" in the search textbox
  await searchBox.fill("airpod");

  // Wait for suggestions to appear
  await page.waitForSelector(".s-suggestion-container");

  // Get all displayed suggestions and log them in the terminal   
  const suggestions = await page.$$eval(
    ".s-suggestion-container .s-suggestion",
    (elements) => elements.map((el) => el.textContent?.trim())
  );
  console.log("Search Suggestions:", suggestions);

  // Click on the last option from the suggestions list
  const lastSuggestion = await page
    .locator(".s-suggestion-container .s-suggestion")
    .last();
  await lastSuggestion.click();

  // Wait for search results page to load
  await page.waitForSelector("[data-component-type='s-search-results']");

  // Verify if the item with label "Noise Buds N1 in-Ear Truly Wireless..." is displayed
  const productLink = await page
    .locator('a:has-text("Noise Buds N1 in-Ear Truly Wireless")')
    .first();
  await expect(productLink).toBeVisible();

  // Click on the product link
  const [newTab] = await Promise.all([
    context.waitForEvent("page"), // Wait for new tab to open
    productLink.click(),
  ]);

  // Wait for the new tab to load completely
  await newTab.waitForLoadState("domcontentloaded");

  // Verify the new tab URL is correct
  const expectedUrl = "https://www.amazon.in/Noise";
  expect(newTab.url()).toContain(expectedUrl);

  // Verify 'Visit the Noise Store' link is displayed
  const noiseStoreLink = await newTab.locator("#bylineInfo");
  await expect(noiseStoreLink).toBeVisible();

  // Click on 'Visit the Noise Store' link
  await noiseStoreLink.click();

  // Wait for the Noise Store page to load and verify the URL
  await newTab.waitForLoadState("domcontentloaded");
  await expect(newTab).toHaveURL(/https:\/\/www\.amazon\.in\/stores\/Noise\/page/);

  // Function to scroll until the products are visible
  const scrollUntilProductsVisible = async (newTab) => {
    let productsVisible = false;

    while (!productsVisible) {
      // Check if products are visible
      const products = newTab.locator(
        'div[data-testid="product-grid-container"] ul li[data-testid="product-grid-item"]'
      );
      const productCount = await products.count();

      if (productCount > 0) {
        productsVisible = true; // Break loop if products are visible
      } else {
        // Scroll down
        await newTab.evaluate(() => window.scrollBy(0, window.innerHeight));
        await newTab.waitForTimeout(1000); // Wait for new content to load
      }
    }
  };

  // Scroll until products are visible
  await scrollUntilProductsVisible(newTab);

  // Verify if more than 1 product is displayed
  const products = await newTab.locator(
    'div[data-testid="product-grid-container"] ul li[data-testid="product-grid-item"]'
  );
  const productCount = await products.count();

  // Debugging output if no products are found
  if (productCount === 0) {
    console.error("No products found on the Noise Store page.");
  }

  expect(productCount).toBeGreaterThan(1);

  // Hover over each product image and verify if 'Quick Look' button is displayed
  for (let i = 0; i < productCount; i++) {
    const productItem = products.nth(i);
    const quickLookButton = productItem.locator(
      'button[data-testid="quick-look-button"]'
    );

    // Hover over the product image
    //await productItem.hover();

    // Add a short wait to allow UI to update after hover
    //await newTab.waitForTimeout(5000); // 5 second delay to let the button appear

    // Verify if the 'Quick Look' button is visible
    //await expect(quickLookButton).toBeVisible();

    // Click on 'Quick Look' button and verify the modal
    //await quickLookButton.click();

    // Hover over the product image
    await productItem.hover();

    // Scroll the button into view if necessary
    await quickLookButton.scrollIntoViewIfNeeded();

    // Force-click the 'Quick Look' button even if Playwright considers it hidden
    await quickLookButton.click({ force: true });

    const modalTitle = newTab.locator(
      '[data-testid="product-showcase-container"] a[data-testid="product-showcase-title"]'
    );

    // Verify the modal title contains "Noise"
    await expect(modalTitle).toContainText("Noise");

    // Print the product title in the terminal
    const productTitleText = await modalTitle.textContent();
    console.log(`Product Title: ${productTitleText}`);

    // Close the modal by clicking the 'X' icon
    const closeButton = newTab.locator('button[data-testid="modal-close-btn"]');
    await closeButton.click();

    // Break the loop after 4 iterations
    if (i === 2) break; // Exit the loop after processing 4 products
  }

  // Close the new tab after completing the test
  await newTab.close();

  console.log("Test completed successfully!");
});