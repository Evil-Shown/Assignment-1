import { test, expect } from '@playwright/test';

const URL = 'https://www.swifttranslator.com/';
const INPUT = 'textarea[placeholder*="Singlish"]';
const OUTPUT = 'textarea:nth-of-type(2)';

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

    await input.fill(testInput);
    
    // Wait for translation
    await page.waitForFunction(
      () => {
        const textareas = document.querySelectorAll('textarea');
        if (textareas.length < 2) return false;
        const output = textareas[1];
        const value = output.value || '';
        return /[\u0D80-\u0DFF]/.test(value) && value.trim().length > 0;
      },
      { timeout: 5000 }
    );

    const finalOutput = await page.locator(OUTPUT).inputValue();
    
    expect(finalOutput).toContain('මම');
    expect(finalOutput).toContain('ගෙදර');
    expect(finalOutput).toContain('යනවා');
  });
});