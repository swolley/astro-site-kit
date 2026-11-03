// Draws a 1200x630 share card: `node og-image.mjs <input.html> <output.png>`.
// The HTML is rendered as is, so it must carry its own styles. Set PW_CHROMIUM_PATH to use a Chromium other than the
// one Playwright installed.
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
    console.error('Usage: node og-image.mjs <input.html> <output.png>');
    process.exit(1);
}

const executablePath = process.env.PW_CHROMIUM_PATH;
const browser = await chromium.launch(executablePath ? { executablePath } : {});
try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.goto(pathToFileURL(resolve(input)).href);
    await page.screenshot({ path: output });
} finally {
    await browser.close();
}
