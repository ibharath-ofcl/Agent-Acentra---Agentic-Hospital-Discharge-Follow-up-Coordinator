const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    const rects = await page.evaluate(() => {
        const els = document.querySelectorAll('section');
        return Array.from(els).map(e => ({
            id: e.id || e.className.split(' ')[0],
            top: e.getBoundingClientRect().top,
            height: e.getBoundingClientRect().height,
            className: e.className
        }));
    });

    console.log(JSON.stringify(rects, null, 2));

    // also get the main element size
    const main = await page.evaluate(() => {
        const m = document.querySelector('main');
        return { top: m.getBoundingClientRect().top, height: m.getBoundingClientRect().height, className: m.className };
    });
    console.log("Main:", main);

    await browser.close();
})();
