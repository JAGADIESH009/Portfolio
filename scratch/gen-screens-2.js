const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1280, height: 800}});
  const outDir = path.join(__dirname, '..', 'assets', 'images');
  await page.goto('https://demodentalclinicweb.vercel.app/', {waitUntil: 'networkidle'});
  await page.screenshot({path: path.join(outDir, 'sri-dental.jpg')});
  
  await page.goto('https://demorealestateweb.vercel.app/', {waitUntil: 'networkidle'});
  await page.screenshot({path: path.join(outDir, 'yam-real-estate.jpg')});
  
  await page.goto('https://vanya-farm-ai.vercel.app/', {waitUntil: 'networkidle'});
  await page.screenshot({path: path.join(outDir, 'vanya-farm.jpg')});
  
  await browser.close();
})();
