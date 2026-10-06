const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  
  const viewports = [
    { width: 375, height: 812, name: 'mobile_375' },
    { width: 768, height: 1024, name: 'tablet_768' },
    { width: 1440, height: 900, name: 'desktop_1440' }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height }
    });
    
    // Page 1: Hero
    await page.goto('http://localhost:5500');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `C:\\Users\\jagad\\.gemini\\antigravity-ide\\brain\\54301b27-3034-4636-88ce-91c91f96bf1b\\scratch\\${vp.name}_hero.png` });
    
    // Check overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`Viewport ${vp.name}: width=${vp.width}, scrollWidth=${scrollWidth}`);

    // Page 2: About
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `C:\\Users\\jagad\\.gemini\\antigravity-ide\\brain\\54301b27-3034-4636-88ce-91c91f96bf1b\\scratch\\${vp.name}_about.png` });

    // Page 3: Skills
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `C:\\Users\\jagad\\.gemini\\antigravity-ide\\brain\\54301b27-3034-4636-88ce-91c91f96bf1b\\scratch\\${vp.name}_skills.png` });

    await page.close();
  }
  
  await browser.close();
})();
