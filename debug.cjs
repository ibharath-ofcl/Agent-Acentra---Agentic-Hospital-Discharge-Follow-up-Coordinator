const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:5173/login');
    const inputs = await page.$$('input');
    await inputs[0].type('doctor@acentra.com');
    await inputs[1].type('password');
    const btns = await page.$$('button');
    await btns[0].click();
    await new Promise(r => setTimeout(r, 2000));

    // Nav to Upload tab
    const navs = await page.$$('button');
    for (let b of navs) {
        let txt = await page.evaluate(el => el.textContent, b);
        if (txt && txt.toLowerCase().includes('upload')) {
            await b.click();
            await new Promise(r => setTimeout(r, 500));
            break;
        }
    }

    const rootText = await page.evaluate(() => document.body.innerText);
    console.log("Does the page contain 'Drag and drop'?", rootText.includes('Drag and drop'));

    await browser.close();
})();

    console.log(await page.evaluate(() => document.body.innerText))