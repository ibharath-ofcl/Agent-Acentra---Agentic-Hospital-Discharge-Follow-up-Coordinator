const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            console.log('BROWSER CONSOLE:', msg.text());
        }
    });
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });

    // Login programmatically
    await page.evaluate(() => {
        localStorage.setItem('token', 'fake-token-for-test');
        localStorage.setItem('role', 'patient');
        localStorage.setItem('name', 'Dr. Meera Patel');
    });

    console.log("Navigating to /patient");
    await page.goto('http://localhost:5173/patient', { waitUntil: 'domcontentloaded' });

    await browser.close();
})();
