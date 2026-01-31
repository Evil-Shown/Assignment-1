/**
 * Advanced Test Utilities for Swift Translator
 * Provides better wait strategies and helper functions
 */

const URL = 'https://www.swifttranslator.com/';
const INPUT = '#singlish-input';
const OUTPUT = '#sinhala-output';

/**
 * Wait for Sinhala output to be generated
 * More reliable than fixed timeout
 */
export async function waitForTranslation(page, minLength = 1) {
  await page.waitForFunction(
    ({ selector, minLen }) => {
      const output = document.querySelector(selector);
      if (!output) return false;
      
      const value = output.value || '';
      // Check if output contains Sinhala Unicode characters
      const hasSinhala = /[\u0D80-\u0DFF]/.test(value);
      const hasMinLength = value.trim().length >= minLen;
      
      return hasSinhala && hasMinLength;
    },
    { selector: OUTPUT, minLen: minLength },
    { timeout: 5000 }
  );
}

/**
 * Optimized clear and type function with smart waiting
 */
export async function clearAndType(page, text) {
  const input = page.locator(INPUT);
  
  // Wait for input to be visible and ready
  await input.waitFor({ state: 'visible', timeout: 30000 });
  
  // Clear existing content
  await input.clear();
  
  // Fill with new text
  await input.fill(text);
  
  // Wait for translation to complete
  try {
    await waitForTranslation(page, Math.min(text.length / 5, 1));
  } catch (error) {
    // Fallback to fixed timeout if dynamic wait fails
    await page.waitForTimeout(1000);
  }
}

/**
 * Initialize page for testing
 * Reusable setup function
 */
export async function initializePage(page) {
  await page.goto(URL, { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  await page.waitForSelector(INPUT, { 
    state: 'visible', 
    timeout: 30000 
  });
  
  // Clear any existing content
  await page.locator(INPUT).clear();
}

/**
 * Get translation output
 */
export async function getOutput(page) {
  const output = await page.locator(OUTPUT).inputValue();
  return output.trim();
}

/**
 * Verify translation contains expected text
 */
export async function verifyTranslation(page, expectedTexts) {
  const output = await getOutput(page);
  
  if (Array.isArray(expectedTexts)) {
    return expectedTexts.every(text => output.includes(text));
  }
  
  return output.includes(expectedTexts);
}

/**
 * Type text character by character (for real-time conversion tests)
 * Uses modern pressSequentially instead of deprecated type
 */
export async function typeCharByChar(page, text, delay = 50) {
  const input = page.locator(INPUT);
  await input.waitFor({ state: 'visible', timeout: 30000 });
  await input.clear();
  await input.pressSequentially(text, { delay });
}

/**
 * Take screenshot on error
 */
export async function captureError(page, testName, error) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `error-${testName}-${timestamp}.png`;
  
  try {
    await page.screenshot({ 
      path: `test-results/screenshots/${filename}`,
      fullPage: true 
    });
    console.error(`Screenshot saved: ${filename}`);
  } catch (screenshotError) {
    console.error('Failed to capture screenshot:', screenshotError.message);
  }
  
  console.error(`Test "${testName}" failed:`, error.message);
}

/**
 * Retry function for flaky operations
 */
export async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Check if page is responsive
 */
export async function isPageResponsive(page) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 5000 });
    const input = await page.locator(INPUT).isVisible();
    const output = await page.locator(OUTPUT).isVisible();
    return input && output;
  } catch {
    return false;
  }
}

// Export constants
export { URL, INPUT, OUTPUT };