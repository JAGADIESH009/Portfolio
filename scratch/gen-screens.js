const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1280, height: 800}});
  const outDir = path.join(__dirname, '..', 'assets', 'images');
  await page.goto('https://sridentalclinicdemo.vercel.app/', {waitUntil: 'networkidle'});
  await page.screenshot({path: path.join(outDir, 'sri-dental.jpg')});
  await page.goto('https://yamrealestatedemo.vercel.app/', {waitUntil: 'networkidle'});
  await page.screenshot({path: path.join(outDir, 'yam-real-estate.jpg')});
  await page.goto('https://smartcampusportal.vercel.app/', {waitUntil: 'networkidle'});
  await page.screenshot({path: path.join(outDir, 'smart-campus.jpg')});
  
  await page.setContent('<div style="width:1280px;height:800px;background:#182218;display:flex;align-items:center;justify-content:center;color:#EAE4D9;font-family:sans-serif;font-size:80px;font-weight:bold;">VANYA FARM AI</div>');
  await page.screenshot({path: path.join(outDir, 'vanya-farm.jpg')});
  await browser.close();
})();
