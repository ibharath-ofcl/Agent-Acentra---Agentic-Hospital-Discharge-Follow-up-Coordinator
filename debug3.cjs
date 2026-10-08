const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    fs.writeFileSync('TEST_MOCK_VALID.docx', 'MRN-9281C TEST_MOCK_VALID');

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

    // Upload file
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
        await fileInput.uploadFile('TEST_MOCK_VALID.docx');
        await new Promise(r => setTimeout(r, 3000)); // wait for API calls

        const rootHtml = await page.evaluate(() => document.body.innerText);
        console.log("Success rendered? ", rootHtml.includes('Document Intelligence Extraction'));
        console.log("Patient mapped? ", rootHtml.includes('Arun Kumar'));
    }

    await browser.close();
})();
