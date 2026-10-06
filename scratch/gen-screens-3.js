const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1280, height: 800}});
  const outDir = path.join(__dirname, '..', 'assets', 'images');
  
  try {
    await page.goto('https://demodentalclinicweb.vercel.app/', {waitUntil: 'load', timeout: 60000});
    await page.waitForTimeout(2000); // Give animations a moment
    await page.screenshot({path: path.join(outDir, 'sri-dental.jpg')});
  } catch (e) { console.error('Failed dental:', e.message); }
  
  try {
    await page.goto('https://demorealestateweb.vercel.app/', {waitUntil: 'load', timeout: 60000});
    await page.waitForTimeout(2000);
    await page.screenshot({path: path.join(outDir, 'yam-real-estate.jpg')});
  } catch (e) { console.error('Failed real estate:', e.message); }
  
  try {
    await page.goto('https://vanya-farm-ai.vercel.app/', {waitUntil: 'load', timeout: 60000});
    await page.waitForTimeout(2000);
    await page.screenshot({path: path.join(outDir, 'vanya-farm.jpg')});
  } catch (e) { console.error('Failed vanya farm:', e.message); }
  
  await browser.close();
})();
