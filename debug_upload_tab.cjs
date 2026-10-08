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
  await page.evaluate(() => {
    localStorage.setItem('token', 'fake-token-for-test');
    localStorage.setItem('role', 'doctor');
    localStorage.setItem('name', 'Dr. Meera Patel');
  });

  await page.goto('http://localhost:5173/doctor', { waitUntil: 'networkidle2' });
  
  // Click Document Upload
  const tabs = await page.$$('button');
  for (const tab of tabs) {
      const txt = await page.evaluate(el => el.textContent, tab);
      if (txt && txt.includes('Document Upload')) {
          console.log("Clicking Document Upload");
          await tab.click();
          break;
      }
  }
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
