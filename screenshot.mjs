import puppeteer from './node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

// Home page - full
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
await page.screenshot({ path: './screenshot-home.png', fullPage: true });

// Free guide page - full
await page.goto('http://localhost:3000/free-guide', { waitUntil: 'networkidle2' });
await page.screenshot({ path: './screenshot-guide.png', fullPage: true });

await browser.close();
console.log('done');
