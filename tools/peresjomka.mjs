// Пересъёмка иллюстраций портфолио с живых адресов после переделки страниц (07.10.2026).
// Запуск: node tools/peresjomka.mjs  (playwright берётся из ~/Progects/skuf-tur)
// Компьютер — окно 1440×900, телефон — 390×844, как у прежних снимков.
// PNG пишутся в tools/syroe/, сборка в JPEG и PNG — tools/sobrat.py.
import { chromium } from '/Users/dmitrijvolkov/Progects/skuf-tur/node_modules/playwright/index.mjs';
import { mkdir } from 'node:fs/promises';

const SYROE = new URL('./syroe/', import.meta.url).pathname;
await mkdir(SYROE, { recursive: true });
const PK = { width: 1440, height: 900 };
const TEL = { width: 390, height: 844 };

const browser = await chromium.launch();
async function stranica(razmer, adres, mobilnyj = false) {
  const ctx = await browser.newContext({ viewport: razmer, deviceScaleFactor: 2, isMobile: mobilnyj, hasTouch: mobilnyj });
  const page = await ctx.newPage();
  // уведомление клиники о хранилище в кадр не нужно
  await page.addInitScript(() => { try { localStorage.setItem('cookie-ok', '1'); } catch (e) {} });
  await page.goto(adres, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  return page;
}
const snimok = (page, imya, extra = {}) => page.screenshot({ path: SYROE + imya, ...extra });

// Скуф-тур
{
  const S = 'https://pyhphhddb8-eng.github.io/skuf-tur/';
  await snimok(await stranica(PK, S), 'skuf-desktop.png');
  await snimok(await stranica(TEL, S, true), 'skuf-mobile.png');
}

// Каталог аренды: фильтр в работе, пустая выдача, шторка фильтров на телефоне
{
  const K = 'https://pyhphhddb8-eng.github.io/katalog-arenda/';
  await snimok(await stranica(PK, K + '?t=compaction&p=petrol'), 'arenda-desktop.png');
  const pusto = await stranica(PK, K + '?t=height&p=petrol&w=light');
  await snimok(pusto, 'arenda-pusto.png');
  const tel = await stranica(TEL, K + '?t=compaction', true);
  await tel.getByRole('button', { name: /^Фильтры/ }).click();
  await tel.waitForTimeout(500);
  await snimok(tel, 'arenda-mobile.png');
}

// Отчёт о проверке: первый экран, находки, телефон
{
  const O = 'https://pyhphhddb8-eng.github.io/otchet-proverka/';
  await snimok(await stranica(PK, O), 'otchet-1-ekran.png');
  const n = await stranica(PK, O);
  await n.evaluate(() => { const h = [...document.querySelectorAll('h2')].find((x) => x.textContent.startsWith('Находки')); window.scrollTo(0, h.getBoundingClientRect().top + scrollY - 40); });
  await n.waitForTimeout(300);
  await snimok(n, 'otchet-2-nahodki.png');
  await snimok(await stranica(TEL, O, true), 'otchet-3-telefon.png');
}

// Клиника: запись, отказ без галочки, телефон, политика
{
  const C = 'https://pyhphhddb8-eng.github.io/klinika-152fz/';
  await snimok(await stranica(PK, C), 'klinika-1-zapis.png');
  const g = await stranica(PK, C);
  await g.fill('#imya', 'Иван Петров');
  await g.fill('#telefon', '+7 900 000-00-00');
  await g.selectOption('#usluga', { label: 'Приём терапевта' });
  await g.click('#otpravit');
  await g.waitForTimeout(300);
  await g.evaluate(() => { const t = document.querySelector('.talon'); window.scrollTo(0, t.getBoundingClientRect().top + scrollY - 30); });
  await g.waitForTimeout(200);
  await snimok(g, 'klinika-2-galochka.png');
  await snimok(await stranica(TEL, C, true), 'klinika-3-mobile.png');
  await snimok(await stranica(PK, C + 'privacy.html'), 'klinika-4-politika.png');
}

// Доставка «Прямиком»: витрина ссылок по разделам и телефон
{
  const D = 'https://pyhphhddb8-eng.github.io/dostavka-ikonki/showcase.html';
  const v = await stranica(PK, D);
  await v.waitForSelector('.chat-card');
  await v.waitForFunction(() => !document.querySelector('#checks').textContent.includes('Проверяю'));
  await v.waitForTimeout(800);
  const k_razdelu = async (selektor, imya) => {
    await v.evaluate((s) => { const e = document.querySelector(s); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 40); }, selektor);
    await v.waitForTimeout(300);
    await snimok(v, imya);
  };
  await snimok(v, 'dostavka-1-kartochki.png');
  await k_razdelu('#checks', 'dostavka-2-proverki.png');
  await k_razdelu('#sheet-light', 'dostavka-3-znachok.png');
  const t = await stranica(TEL, D, true);
  await t.waitForSelector('.chat-card');
  await t.waitForTimeout(800);
  await snimok(t, 'dostavka-4-mobile.png');
}

await browser.close();
console.log('Сырые снимки в tools/syroe/');
