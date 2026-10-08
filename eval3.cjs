const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    const overlaps = await page.evaluate(() => {
        const els = document.querySelectorAll('*');
        const over = [];
        for (let i = 0; i < els.length; i++) {
            if (["html", "body", "div", "section", "main", "header", "nav", "footer", "h1", "h2", "h3", "p", "a", "button"].includes(els[i].tagName.toLowerCase()) === false) continue;
            const r1 = els[i].getBoundingClientRect();
            if (r1.height === 0 || r1.width === 0) continue;

            for (let j = i + 1; j < els.length; j++) {
                if (["html", "body", "div", "section", "main", "header", "nav", "footer", "h1", "h2", "h3", "p", "a", "button"].includes(els[j].tagName.toLowerCase()) === false) continue;

                // Is j a descendant of i?
                if (els[i].contains(els[j])) continue;

                const r2 = els[j].getBoundingClientRect();
                if (r2.height === 0 || r2.width === 0) continue;

                const isOverlapping = !(r1.right <= r2.left ||
                    r1.left >= r2.right ||
                    r1.bottom <= r2.top ||
                    r1.top >= r2.bottom);

                if (isOverlapping) {
                    // If it's the fixed navbar, ignore
                    if (els[i].tagName.toLowerCase() === 'header' || els[j].tagName.toLowerCase() === 'header') continue;
                    // We consider it an overlap.
                    if (r1.width * r1.height > 10000 && r2.width * r2.height > 10000) {
                        over.push({
                            el1: els[i].className.substring(0, 30),
                            el2: els[j].className.substring(0, 30),
                            tagName1: els[i].tagName,
                            tagName2: els[j].tagName,
                            r1: { top: r1.top, left: r1.left, height: r1.height },
                            r2: { top: r2.top, left: r2.left, height: r2.height }
                        });
                    }
                }
            }
        }
        return over;
    });

    console.log(JSON.stringify(overlaps, null, 2));
    await browser.close();
})();
