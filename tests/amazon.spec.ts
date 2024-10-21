import { test, expect } from '@playwright/test';

test.describe('Amazon Search Automation', () => {
  
  test('Automate iPhone 13 search and product interaction', async ({ page }) => {

    // 1) Open Amazon India URL in Chrome Browser
    await page.goto('https://www.amazon.in/');
    
    // Verify if the page is loaded by checking for the search bar
    await expect(page.locator('#twotabsearchtextbox')).toBeVisible();

    // 2) Select "Electronics" from the dropdown menu
    await page.selectOption('#searchDropdownBox', { label: 'Electronics' });

    // 3) Type "iPhone 13" into the search bar
    await page.fill('#twotabsearchtextbox', 'iPhone 13');

    // Wait for suggestions to appear and capture them
    await page.waitForSelector('.s-suggestion');
    const suggestions = await page.$$eval('.s-suggestion', (elements) => 
      elements.map(el => el.textContent?.trim())
    );

    // Log the suggestions for debugging
    console.log('Suggestions:', suggestions);

    // Validate that suggestions contain "iPhone 13"
    suggestions.forEach(suggestion => {
      expect(suggestion?.toLowerCase()).toContain('iphone 13');
    });

    // 4) Type "iPhone 13 128GB" into the search bar and select the variant
    await page.fill('#twotabsearchtextbox', 'iPhone 13 128GB');
    await page.waitForSelector('.s-suggestion');

    // Select the first suggestion that matches "iPhone 13 128GB"
    const variantOption = await page.locator('.s-suggestion:has-text("128GB")').first();
    await variantOption.click();

    // 5) From the search results, click the first product and validate new tab opens
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('[data-index="0"] h2 a') // Click the first result
    ]);
    expect(newPage).toBeTruthy();

    // Switch to new page and ensure it has loaded
    await newPage.waitForLoadState();

    // 6) Click "Visit the Apple Store" link on the new page
    await newPage.click('a:has-text("Visit the Apple Store")');

    // 7) Select Apple Watch SE (GPS + Cellular)
    await newPage.click('#s-refinements [aria-label="Apple Watch"]');
    await newPage.click('text=Apple Watch SE (GPS + Cellular)');

    // 8) Hover over the watch image and verify Quick Look is displayed
    const watchImage = await newPage.waitForSelector('img[alt="Apple Watch SE (GPS + Cellular)"]');
    await watchImage.hover();
    const quickLook = await newPage.isVisible('text=Quick Look');
    expect(quickLook).toBeTruthy();

    // 9) Verify the modal relates to the same product
    const modalTitle = await newPage.locator('.quicklook-title').textContent();
    expect(modalTitle).toContain('Apple Watch SE');

  });

});
