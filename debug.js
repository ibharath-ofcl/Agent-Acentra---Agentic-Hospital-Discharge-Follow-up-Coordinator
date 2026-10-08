const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    page.on('pageerror', err => {
        console.error('REACT ERROR:', err.toString());
    });
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error('CONSOLE ERROR:', msg.text());
        }
    });

    await page.goto('http://localhost:5173/login');
    await page.type('input[type="email"]', 'doctor@acentra.com');
    await page.type('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Click tabs until we find 'Document Upload'
    const btns = await page.$$('button');
    for (let b of btns) {
        let txt = await page.evaluate(el => el.textContent, b);
        if (txt && txt.includes('Document Upload')) {
            console.log('Found upload button! Clicking...');
            await b.click();
            await new Promise(r => setTimeout(r, 1000));
            break;
        }
    }

    // Look for blank page symptoms by taking a screenshot or checking if #root is empty
    const rootHtml = await page.evaluate(() => document.getElementById('root').innerHTML);
    if (!rootHtml || rootHtml.includes('white') || rootHtml.length < 500) {
        console.log("Root is basically empty!");
    }

    console.log("Done debugging");
    await browser.close();
})();
