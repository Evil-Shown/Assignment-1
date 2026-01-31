import { test, expect } from '@playwright/test';

const URL = 'https://www.swifttranslator.com/';
const INPUT = 'textarea[placeholder*="Singlish"]';
const OUTPUT = 'textarea[placeholder*="Sinhala"]';

async function clearAndType(page, text) {
  const input = page.locator(INPUT);
  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.clear();
  await input.fill(text);
  
  // Wait for translation to appear - check if output has Sinhala characters
  await page.waitForFunction(
    () => {
      const output = document.querySelector('textarea[placeholder*="Sinhala"]');
      if (!output) return false;
      const value = output.value || '';
      // Check if contains Sinhala Unicode characters (0D80-0DFF)
      return /[\u0D80-\u0DFF]/.test(value) && value.trim().length > 0;
    },
    { timeout: 5000 }
  ).catch(() => {
    // Fallback to fixed wait if dynamic wait fails
    return page.waitForTimeout(2000);
  });
}

test.describe('Positive Functional Tests - Singlish to Sinhala Conversion', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(URL, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForSelector(INPUT, { state: 'visible', timeout: 10000 });
  });

  const positiveTests = [
    { id: 'Pos_Fun_0001', input: 'mama gedhara yanavaa.', expected: 'මම ගෙදර යනවා.' },
    { id: 'Pos_Fun_0002', input: 'mama gedhara yanavaa,しかし vahina nisaa dhaenma yannee naee.', expected: 'මම ගෙදර යනවා, හැබැයි වහින නිසා දැන්ම යන්නේ නැ.' },
    { id: 'Pos_Fun_0003', input: 'oya enavaanam mama balan innavaa.', expected: 'ඔය එනවානම් මම බලන් ඉන්නවා.' },
    { id: 'Pos_Fun_0004', input: 'oyaata kohomadha?', expected: 'ඔයාට කොහොමද?' },
    { id: 'Pos_Fun_0005', input: 'vahaama enna.', expected: 'වහාම එන්න.' },
    { id: 'Pos_Fun_0006', input: 'mama iiyee gedhara giyaa.', expected: 'මම ඊයේ ගෙදර ගියා.' },
    { id: 'Pos_Fun_0007', input: 'mama heta enavaa.', expected: 'මම හෙට එනවා.' },
    { id: 'Pos_Fun_0008', input: 'mama dhannee naee.', expected: 'මම දන්නේ නැ.' },
    { id: 'Pos_Fun_0009', input: 'api yamu.', expected: 'අපි යමු.' },
    { id: 'Pos_Fun_0010', input: 'aayuboovan!', expected: 'ආයුබෝවන්!' },
    { id: 'Pos_Fun_0011', input: 'karuNaakaralaa mata podi udhavvak karanna puLuvandha?', expected: 'කරුණාකරලා මට පොඩි උදව්වක් කරන්න පුළුවන්ද?' },
    { id: 'Pos_Fun_0012', input: 'mata nidhimathayi.', expected: 'මට නිදිමතයි.' },
    { id: 'Pos_Fun_0013', input: 'poddak inna', expected: 'පොඩ්ඩක් ඉන්න' },
    { id: 'Pos_Fun_0014', input: 'hari hari', expected: 'හරි හරි' },
    { id: 'Pos_Fun_0015', input: 'Zoom meeting ekak thiyennee.', expected: 'Zoom meeting එකක් තියෙන්නේ.' },
    { id: 'Pos_Fun_0016', input: 'siiyaa Colombo yanna hadhannee.', expected: 'සීයා Colombo යන්න හදන්නේ.' },
    { id: 'Pos_Fun_0017', input: 'mata ID eka saha NIC eka evanna.', expected: 'මට ID එක සහ NIC එක එවන්න.' },
    { id: 'Pos_Fun_0018', input: 'oyaa enavadha?', expected: 'ඔයා එනවද?' },
    { id: 'Pos_Fun_0019', input: 'meeka Rs. 5343 yi.', expected: 'මේක Rs. 5343 යි.' },
    { id: 'Pos_Fun_0020', input: 'meeting eka 7.30 AM ta hadhanna.', expected: 'meeting එක 7.30 AM ට හදන්න.' },
    { id: 'Pos_Fun_0021', input: 'mama    gedhara    yanavaa.', expected: 'මම    ගෙදර    යනවා.' },
    { id: 'Pos_Fun_0022', input: 'mama gedhara yanavaa.\noyaa enavadha maath ekka yanna?', expected: 'මම ගෙදර යනවා.\nඔයා එනවද මාත් එක්ක යන්න?' },
    { id: 'Pos_Fun_0023', input: 'ela machan! supiri!!', expected: 'එල මචන්! සුපිරි!!' },
    { id: 'Pos_Fun_0024', input: 'dhitvaa suLi kuNaatuva samaGa aethi vuu gQQvathura saha naayayaeem heethuven maarga sQQvarDhana aDhikaariya sathu maarga kotas 430k vinaashayata pathva aethi athara, ehi samastha dhiga pramaaNaya kiloomiitar 300k pamaNa vana bava pravaahana, mahaamaarga saha naagarika sQQvarDhana amaathYaa bimal rathnaayaka saDHahan kaLeeya.', expected: 'දිට්වා සුළි කුණාටුව සමග ඇති වූ ගංවතුර සහ නායයෑම් හේතුවෙන් මාර්ග සංවර්ධන අධිකාරිය සතු මාර්ග කොටස් 430ක් විනාශයට පත්ව ඇති අතර, එහි සමස්ත දිග ප්‍රමාණය කිලෝමීටර් 300ක් පමණ වන බව ප්‍රවාහන, මහාමාර්ග සහ නාගරික සංවර්ධන අමාත්‍ය බිමල් රත්නායක සඳහන් කළේය.' }
  ];

  for (const t of positiveTests) {
    test(t.id, async ({ page }) => {
      await clearAndType(page, t.input);
      const actual = await page.locator(OUTPUT).inputValue();
      expect(actual.trim()).toBe(t.expected);
    });
  }
});