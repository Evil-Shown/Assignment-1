import { test, expect } from '@playwright/test';

const URL = 'https://www.swifttranslator.com/';
const INPUT = 'textarea[placeholder*="Singlish"]';
const OUTPUT = 'textarea[placeholder*="Sinhala"]';

test.describe('UI Tests - Real-time Conversion', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(URL, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForSelector(INPUT, { state: 'visible', timeout: 10000 });
  });

  test('Pos_UI_0001: Real-time output updates as user types', async ({ page }) => {
    const input = page.locator(INPUT);
    await input.clear();
    const testInput = 'mama gedhara yanavaa';

    // Type the entire string
    await input.fill(testInput);
    
    // Wait for translation to appear
    await page.waitForFunction(
      () => {
        const output = document.querySelector('textarea[placeholder*="Sinhala"]');
        if (!output) return false;
        const value = output.value || '';
        return /[\u0D80-\u0DFF]/.test(value) && value.trim().length > 0;
      },
      { timeout: 5000 }
    );

    const finalOutput = await page.locator(OUTPUT).inputValue();
    
    // Verify output contains expected Sinhala words
    expect(finalOutput).toContain('මම');
    expect(finalOutput).toContain('ගෙදර');
    expect(finalOutput).toContain('යනවා');
  });
});