const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('pageerror', err => {
        console.error('REACT ERROR:', err.toString());
    });

    await page.goto('http://localhost:5173/');
    await page.evaluate(() => {
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('role', 'doctor');
        localStorage.setItem('name', 'Doctor');
    });

    await page.goto('http://localhost:5173/doctor', { waitUntil: 'networkidle0' });

    const navs = await page.$$('button');
    for (let b of navs) {
        let txt = await page.evaluate(el => el.textContent, b);
        if (txt && txt.toLowerCase().includes('upload')) {
            await b.click();
            await new Promise(r => setTimeout(r, 1000));
            break;
        }
    }

    // Now inject a fake uploadResult 
    await page.evaluate(() => {
        // We can't access React state directly, but we can intercept the upload API
        window.tempUploadTest = true;
    });

    console.log("No crash before upload.");

    await browser.close();
})();
