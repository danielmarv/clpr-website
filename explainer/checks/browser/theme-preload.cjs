// Why this exists: kse's browser gates (check-sims, shot, overflow) and the diagram text check only
// emulate prefers-color-scheme, and since D21 light is the default whatever the system says, so
// `DARK=1` no longer shows the dark theme. Preloaded with
//   THEME=dark NODE_OPTIONS=--require=./checks/browser/theme-preload.cjs <gate>
// it stores THEME in every page those gates open, as the header's switch would, prints the
// background the first page rendered, and fails the run if a page did not take the theme.
const { createRequire } = require('node:module');
const { join } = require('node:path');

const theme = process.env.THEME;
if (theme) {
  // The gates load playwright from this package (scripts/lib/playwright.mjs), so this is the same object.
  const { chromium } = createRequire(join(process.cwd(), 'package.json'))('playwright');
  const launch = chromium.launch.bind(chromium);
  let reported = false;
  chromium.launch = async (...args) => {
    const browser = await launch(...args);
    const newPage = browser.newPage.bind(browser);
    browser.newPage = async (...options) => {
      const page = await newPage(...options);
      await page.addInitScript((value) => { try { localStorage.setItem('theme', value); } catch {} }, theme);
      page.on('load', async () => {
        const seen = await page.evaluate(() => [document.documentElement.getAttribute('data-theme'), getComputedStyle(document.body).backgroundColor]).catch(() => null);
        if (!seen) return;
        if (seen[0] !== theme) throw new Error(`theme-preload: ${page.url()} has data-theme=${seen[0]}, not ${theme}`);
        if (!reported) console.log(`theme-preload: THEME=${theme}; ${page.url()} rendered on ${seen[1]}`);
        reported = true;
      });
      return page;
    };
    return browser;
  };
}
