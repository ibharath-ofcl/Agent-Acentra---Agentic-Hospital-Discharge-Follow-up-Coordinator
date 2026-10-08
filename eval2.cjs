const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    const html = await page.evaluate(() => document.body.innerHTML);
    require('fs').writeFileSync('dom.html', html);
    await browser.close();
})();
