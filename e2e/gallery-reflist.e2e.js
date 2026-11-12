/* E2E: one block, three children, from the slash menu's empty record to the
 * published page.
 *
 *  1. A fresh block seeds itself: example words, three example images.
 *  2. Typing stays in the field, at the caret, and lands in the nested child.
 *  3. The sidebar's fields reach the nested gallery, the style reaches the
 *     block: the editor stamps its class on the block wrapper.
 *  4. Saved without references: the words are public, the examples are not.
 *  5. Picking references replaces the examples with the real images.
 *  6. The published page renders them as one block, at the block's full width.
 *  7. With the site's styles emptied in the Aurora Editor control panel the
 *     sidebar has no Style control, and a save keeps the stored style.
 *     The styles are put back afterwards.
 *
 * Prerequisites: a running Plone site with collective.blicca.galleryreflist
 * installed, and the mockup bundle (pat-contentbrowser) reachable from the
 * edit page. Configure via environment:
 *   AURORA_E2E_BASE       folder to build the fixture in
 *                         (default http://127.0.0.1:8099/Plone15)
 *   AURORA_E2E_USER       login    (default admin)
 *   AURORA_E2E_PASSWORD   password (default admin)
 *   AURORA_E2E_CHROMIUM   chromium executable (default: playwright-core's)
 *   AURORA_E2E_PAGE_TYPE  fixture portal_type (default Document)
 *   AURORA_E2E_SHOTS      directory for screenshots of each stage (optional)
 *
 * Run: pnpm e2e   (after `pnpm install` in this directory)
 */
const path = require('node:path');
const { chromium } = require('playwright-core');
const { BASE, USER, PASSWORD, EXECUTABLE, PAGE_TYPE, PNG_B64, api, fail } = require('./support');

const FOLDER_ID = 'galleryreflist-e2e';
const PAGE_ID = 'page';
const BLOCK_ID = 'gallery-block';
const CATS = [480, 640, 800].map((width) => `https://cataas.com/cat?filter=mono&width=${width}`);
const CONTROLPANEL = '/@controlpanels/aurora-editor-controlpanel';
const IMAGES = [1, 2].map((n) => ({ id: `image-${n}`, title: `E2E image ${n}` }));
const BLOCK = `[data-slate-editor] [data-block-id="${BLOCK_ID}"]`;
const ROOT = `${BLOCK} section.galleryreflist`;
const STYLED = `${BLOCK}.has--blockStyle--feature`;
const SIDEBAR = '#sidebar';

async function cleanup() {
  await api('DELETE', `/${FOLDER_ID}/${PAGE_ID}`);
  await api('DELETE', `/${FOLDER_ID}`);
}

function expectEqual(actual, expected, what) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${what}: ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  } else {
    console.log(`ok: ${what}`);
  }
}

const shoot = (page, name) =>
  process.env.AURORA_E2E_SHOTS
    ? page.screenshot({ path: path.join(process.env.AURORA_E2E_SHOTS, `${name}.png`) })
    : undefined;

const type = (locator) =>
  locator.evaluate((element) => {
    const { fontSize, fontWeight, lineHeight } = getComputedStyle(element);
    return { fontSize, fontWeight, lineHeight };
  });

const sources = (locator) =>
  locator.evaluateAll((images) => images.map((image) => image.getAttribute('src')));

const save = async (page) => {
  await page.click('.aurora-save');
  await page.waitForTimeout(3000);
};

const storedBlock = async () => {
  const saved = await api('GET', `/${FOLDER_ID}/${PAGE_ID}`);
  return saved.blocks.__somersault__.value.find((node) => node.id === BLOCK_ID);
};

/** The Reference List's select widget is a plain <select>. */
// Focused first, as by a person: the host's form remounts on a write it takes
// for an external one, and it tells them apart by the focus.
const choose = async (page, label, option) => {
  const select = page.locator(SIDEBAR).getByLabel(label, { exact: true });
  await select.focus();
  await select.selectOption({ label: option });
};

/** The editor's Style control is the CMSUI Select: a button and a listbox. */
const pickStyle = async (page, option) => {
  await page.locator(SIDEBAR).getByLabel('Style', { exact: true }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
};
const shownStyle = (page) =>
  page.locator(SIDEBAR).getByLabel('Style', { exact: true }).evaluate((button) => button.textContent.trim());

(async () => {
  await cleanup();
  await api('POST', '/', { '@type': 'Folder', id: FOLDER_ID, title: 'Gallery reference list e2e' });
  const uids = {};
  for (const image of IMAGES) {
    const created = await api('POST', `/${FOLDER_ID}`, {
      '@type': 'Image',
      ...image,
      image: { data: PNG_B64, encoding: 'base64', filename: `${image.id}.png`, 'content-type': 'image/png' },
    });
    uids[image.title] = created.UID;
  }
  await api('POST', `/${FOLDER_ID}`, {
    '@type': PAGE_TYPE,
    id: PAGE_ID,
    title: 'Gallery reference list e2e page',
    blocks: {
      __somersault__: {
        '@type': '__somersault__',
        value: [
          { type: 'title', children: [{ text: 'Gallery reference list e2e page' }] },
          {
            type: 'ploneBlock',
            '@type': 'plone-collective.galleryreflist',
            id: BLOCK_ID,
            children: [{ text: '' }],
          },
        ],
      },
    },
    blocks_layout: { items: ['__somersault__'] },
  });

  const browser = await chromium.launch(EXECUTABLE ? { executablePath: EXECUTABLE } : {});
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });

  // The placeholder host stays out of the test: it answers with a pixel.
  const catRequests = [];
  await page.route('https://cataas.com/**', (route) => {
    catRequests.push(route.request().url());
    route.fulfill({ contentType: 'image/png', body: Buffer.from(PNG_B64, 'base64') });
  });

  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.stack || String(error)));
  page.on('dialog', (dialog) => dialog.accept());

  let siteStyles;
  try {
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="__ac_name"]', USER);
    await page.fill('input[name="__ac_password"]', PASSWORD);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.press('input[name="__ac_password"]', 'Enter'),
    ]);

    const edit = `${BASE}/${FOLDER_ID}/${PAGE_ID}/@@aurora-edit`;
    await page.goto(edit, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector(ROOT, { timeout: 90000 });
    await page.waitForTimeout(1500);

    // -- 1. the seed -----------------------------------------------------------
    const heading = page.locator(`${ROOT} > .block-h3 > h3 > textarea`);
    const text = page.locator(`${ROOT} > .block-p > p > textarea`);
    expectEqual(await heading.inputValue(), 'A heading for this gallery', 'seed: the heading');
    expectEqual(
      await text.inputValue(),
      'A few words that introduce the items below.',
      'seed: the text',
    );
    expectEqual(await sources(page.locator(`${ROOT} .referencelist img`)), CATS, 'seed: the examples');
    expectEqual(CATS.filter((url) => catRequests.includes(url)), CATS, 'seed: the browser asks for the exact placeholder URLs');
    const canvasType = await type(heading);
    const canvasTextType = await type(text);
    await shoot(page, '1-seed');

    // -- 2. typing -------------------------------------------------------------
    await heading.click();
    await heading.fill('');
    await page.keyboard.type('Our ends');
    for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowLeft');
    await page.keyboard.type('fri', { delay: 50 });
    expectEqual(await heading.inputValue(), 'Our friends', 'typing: every key lands in the field');
    expectEqual(await heading.evaluate((field) => field.selectionStart), 7, 'typing: the caret stays where the words go in');
    expectEqual(
      await heading.evaluate((field) => document.activeElement === field),
      true,
      'typing: the field keeps the focus',
    );
    await text.click();
    await text.fill('Picked by hand.');

    // -- 3. the sidebar --------------------------------------------------------
    await page.locator(SIDEBAR).getByLabel('Style', { exact: true }).waitFor({ timeout: 15000 });
    await pickStyle(page, 'Feature');
    await page.locator(`${STYLED} section.galleryreflist`).waitFor({ timeout: 5000 });
    console.log('ok: the style reaches the block');
    await choose(page, 'Variation', 'Summary');
    await page.locator(`${ROOT} .referencelist.variation-summary`).waitFor({ timeout: 5000 });
    console.log('ok: the variation reaches the nested gallery');
    await page.waitForTimeout(500);
    const field = (label) => page.locator(SIDEBAR).getByLabel(label, { exact: true }).inputValue();
    expectEqual([await shownStyle(page), await field('Variation')], ['Feature', 'summary'], 'the sidebar holds both choices');
    await page.locator(SIDEBAR).getByText('Link items', { exact: true }).click();
    await page.waitForTimeout(300);
    expectEqual(await page.locator(SIDEBAR).getByLabel('Link items', { exact: true }).isChecked(), false, 'the sidebar holds Link items off');
    await shoot(page, '2-style-and-variation');

    // -- 4. saved without references -------------------------------------------
    await save(page);
    let stored = await storedBlock();
    expectEqual(stored.blockStyle, 'feature', 'saved: the style');
    expectEqual(stored.blocks.gallery.linkItems, false, 'saved: Link items lands in the nested gallery');
    expectEqual(stored.blocks.gallery.variation, 'summary', 'saved: the variation in the child');
    expectEqual(stored.blocks.heading.children[0].text, 'Our friends', 'saved: the heading');
    expectEqual(JSON.stringify(stored).includes('cataas'), false, 'saved: no placeholder is stored');

    const asOwner = await page.context().storageState();
    const owner = await browser.newContext({ storageState: asOwner, viewport: { width: 1600, height: 1100 } });
    const view = await owner.newPage();
    await view.goto(`${BASE}/${FOLDER_ID}/${PAGE_ID}`, { waitUntil: 'domcontentloaded' });
    const published = view.locator('.has--blockStyle--feature > section.galleryreflist');
    expectEqual(await published.locator('h3').first().textContent(), 'Our friends', 'public: the heading');
    expectEqual(canvasType, await type(published.locator('h3').first()), 'the canvas heading has the public type');
    expectEqual(canvasTextType, await type(published.locator('p').first()), 'the canvas text has the public type');
    expectEqual(await published.locator('.referencelist').count(), 0, 'public: no gallery before references');
    expectEqual((await view.content()).includes('cataas'), false, 'public: no placeholder');

    // -- 5. picking references -------------------------------------------------
    await page.goto(edit, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector(ROOT, { timeout: 90000 });
    await page.waitForTimeout(1500);
    expectEqual(await heading.inputValue(), 'Our friends', 'reloaded: the typed heading, not the seed');
    expectEqual(await page.locator(STYLED).count(), 1, 'reloaded: the style');
    await heading.click();
    await page.locator(SIDEBAR).getByLabel('Variation', { exact: true }).waitFor({ timeout: 15000 });
    expectEqual(await field('Variation'), 'summary', 'reloaded: the sidebar reads the nested variation');
    expectEqual(await shownStyle(page), 'Feature', 'reloaded: the sidebar reads the style');
    const widget = `${SIDEBAR} .referencelist-references-widget`;
    await page.locator(`${widget} .content-browser-selected-items-wrapper`).waitFor({ timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.locator(`${widget} .content-browser-selected-items-wrapper > a.btn`).click();
    const item = (n) => page.locator(`.content-browser .contentItem[data-uuid="${uids[IMAGES[n - 1].title]}"]`);
    await item(1).waitFor({ timeout: 15000 });
    await item(1).click();
    await item(2).click({ modifiers: ['Shift'] });
    await page.locator('.content-browser .preview .levelToolbar button.btn-primary').click();
    await page.locator('.content-browser').waitFor({ state: 'detached', timeout: 10000 });
    await page
      .waitForFunction((root) => !document.querySelector(root).innerHTML.includes('cataas'), ROOT, { timeout: 15000 })
      .catch(() => {});
    expectEqual((await page.locator(ROOT).innerHTML()).includes('cataas'), false, 'picked: the examples are gone');
    expectEqual(await page.locator(`${ROOT} .referencelist-notice`).count(), 0, 'picked: the notice is gone');
    expectEqual(
      (await page.locator(`${ROOT} .referencelist article :is(h2, h3, h4)`).allTextContents()).map((t) => t.trim()),
      IMAGES.map((image) => image.title),
      'picked: the canvas shows the real items',
    );
    expectEqual(await heading.inputValue(), 'Our friends', 'picked: the heading is kept');
    await shoot(page, '3-picked');

    // -- 6. the published page -------------------------------------------------
    await save(page);
    stored = await storedBlock();
    expectEqual(
      stored.blocks.gallery.references.map((reference) => reference.UID),
      IMAGES.map((image) => uids[image.title]),
      'saved: the references in the child',
    );
    await view.goto(`${BASE}/${FOLDER_ID}/${PAGE_ID}`, { waitUntil: 'domcontentloaded' });
    expectEqual(
      (await published.locator('.referencelist article :is(h2, h3, h4)').allTextContents()).map((t) => t.trim()),
      IMAGES.map((image) => image.title),
      'public: the real items',
    );
    expectEqual(await published.locator('.referencelist article :is(h2, h3, h4) a').count(), 0, 'public: Link items off, no title links');
    expectEqual((await view.content()).includes('cataas'), false, 'public: still no placeholder');
    const widths = await published.evaluate((root) => {
      const { paddingLeft, paddingRight } = getComputedStyle(root);
      return {
        content: Math.round(root.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight)),
        gallery: Math.round(root.querySelector('.referencelist').getBoundingClientRect().width),
      };
    });
    expectEqual(widths.gallery, widths.content, 'public: the gallery fills the block');
    await shoot(view, '4-public');

    // -- 7. no styles registered -----------------------------------------------
    siteStyles = (await api('GET', CONTROLPANEL)).data.block_styles;
    await api('PATCH', CONTROLPANEL, { block_styles: [] });
    await page.goto(edit, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector(ROOT, { timeout: 90000 });
    await page.waitForTimeout(1500);
    await heading.click();
    await page.locator(SIDEBAR).getByLabel('Variation', { exact: true }).waitFor({ timeout: 15000 });
    expectEqual(await page.locator(SIDEBAR).getByLabel('Style', { exact: true }).count(), 0, 'no styles: no Style control');
    expectEqual(await page.locator(STYLED).count(), 0, 'no styles: no class on the canvas');
    await shoot(page, '5-no-styles');
    await heading.fill('Our friends again');
    await save(page);
    stored = await storedBlock();
    expectEqual(stored.blocks.heading.children[0].text, 'Our friends again', 'no styles: the save went through');
    expectEqual(stored.blockStyle, 'feature', 'no styles: the save keeps the stored style');

    if (pageErrors.length) fail(`uncaught page errors:\n${pageErrors.join('\n')}`);
    if (process.exitCode !== 1) console.log('PASS');
  } finally {
    if (siteStyles) await api('PATCH', CONTROLPANEL, { block_styles: siteStyles });
    await browser.close();
    await cleanup();
  }
})().catch((error) => {
  console.error('E2E crashed:', error);
  process.exit(1);
});
