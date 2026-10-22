const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://127.0.0.1:5173/';
const OUT = path.join(process.env.TEMP, 'opencode', 'forge-v2');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars'],
    defaultViewport: { width: 1440, height: 1000, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`PAGEERROR ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`CONSOLE ${m.text()}`);
  });

  async function session(id) {
    await page.goto(`${BASE}#/login`, { waitUntil: 'networkidle0' });
    await page.evaluate((s) => {
      localStorage.setItem('forge_session_v1', s);
      localStorage.setItem('forge_welcomed_v1', '1');
    }, id);
  }

  async function open(route, name, { width = 1440, height = 1000, fullPage = true } = {}) {
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(`${BASE}?v=${Date.now()}#${route}`, { waitUntil: 'networkidle0' });
    await sleep(500);
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage });
    console.log('SHOT', name);
  }

  await session('s1');
  await open('/app', 's-dashboard');
  await open('/app/mis-proyectos', 's-projects');
  await open('/app/ofertas', 's-offers');
  await open('/app/explorar', 's-explore');

  await open('/app/proyectos/p3', 's-cover-top', { fullPage: false });
  await page.evaluate(() => window.scrollTo({ top: 380, behavior: 'instant' }));
  await sleep(350);
  await page.screenshot({ path: path.join(OUT, 's-cover-scrolled.png'), fullPage: false });
  console.log('SHOT s-cover-scrolled');

  await open('/app/ofertas', 's-offers-messages', { fullPage: false });
  await page.evaluate(() => {
    const tab = [...document.querySelectorAll('.offers-tabs button')].find((b) =>
      b.textContent.includes('Mensajes'),
    );
    if (tab) tab.click();
  });
  await sleep(350);
  await page.screenshot({ path: path.join(OUT, 's-chat.png'), fullPage: false });
  console.log('SHOT s-chat');

  // Registration form updated fields
  await page.evaluate(() => localStorage.removeItem('forge_session_v1'));
  await open('/registro?rol=estudiante', 'register-student', { fullPage: true });
  await open('/registro?rol=empresa', 'register-company', { fullPage: false });

  await session('c1');
  await open('/app', 'c-dashboard');
  await open('/app/mis-proyectos', 'c-projects');
  await page.evaluate(() => {
    const toggle = [...document.querySelectorAll('.archive-toggle')][0];
    if (toggle) toggle.click();
  });
  await sleep(300);
  await page.evaluate(() => {
    const toggle = document.querySelector('.archive-toggle');
    if (toggle) toggle.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await sleep(200);
  await page.screenshot({ path: path.join(OUT, 'c-projects-archived.png'), fullPage: false });
  console.log('SHOT c-projects-archived');

  await open('/app/soluciones', 'c-solutions');
  await open('/app/ofertas', 'c-offers-chat', { fullPage: false });
  await open('/app/favoritos', 'c-favorites');

  // Project modal with visual controls
  await open('/app/mis-proyectos', 'c-modal-tmp', { fullPage: false });
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent.includes('Publicar proyecto'),
    );
    if (btn) btn.click();
  });
  await page.waitForSelector('.modal-card');
  await sleep(350);
  await page.evaluate(() => {
    const body = document.querySelector('.modal-body');
    if (body) {
      const target = [...document.querySelectorAll('.theme-options')][0];
      if (target) body.scrollTop = target.offsetTop - 40;
    }
  });
  await sleep(250);
  await page.screenshot({ path: path.join(OUT, 'c-project-modal-visuals.png'), fullPage: false });
  console.log('SHOT c-project-modal-visuals');

  // Company offer modal
  await page.evaluate(() => {
    const close = document.querySelector('.modal-head .icon-btn');
    if (close) close.click();
  });
  await sleep(200);
  await open('/app/ofertas', 'c-offers-modal-tmp', { fullPage: false });
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent.includes('Nueva oferta'),
    );
    if (btn) btn.click();
  });
  await sleep(400);
  await page.screenshot({ path: path.join(OUT, 'c-offer-modal.png'), fullPage: false });
  console.log('SHOT c-offer-modal');

  // Mobile
  await open('/app', 'mobile-student', { width: 390, height: 844, fullPage: true });
  await open('/app/ofertas', 'mobile-company-offers', { width: 390, height: 844, fullPage: true });

  const layout = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    navScrollWidth: document.querySelector('.mobile-nav')?.scrollWidth,
  }));
  console.log('LAYOUT', layout);
  console.log('ERRORS', errors);
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
