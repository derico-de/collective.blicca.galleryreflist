/** The block against Aurora's own registry, and the committed artifact's hygiene. */
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterAll, describe, expect, it, vi } from 'vitest';
import config from '@plone/registry';

import install, { GalleryReflistBlockInfo } from '../src/index';
import { UPSTREAM_BLOCKS, installUpstreamRegistry } from './upstream-registry';

const bundlePath = path.resolve(
  import.meta.dirname,
  '../../src/collective/blicca/galleryreflist/static/galleryreflist-block.js',
);

describe('install', () => {
  it('adds one well-formed block beside Aurora’s, and returns the config', async () => {
    const aurora = installUpstreamRegistry(config as any);
    vi.stubGlobal('fetch', async () => ({ ok: false }));
    expect(await install(aurora)).toBe(aurora);
    vi.unstubAllGlobals();
    const blocks = (aurora as any).blocks.blocksConfig;
    for (const id of UPSTREAM_BLOCKS) expect(blocks[id]).toBeDefined();
    expect(blocks['plone-collective.galleryreflist']).toBe(GalleryReflistBlockInfo);
    expect(typeof GalleryReflistBlockInfo.title).toBe('string');
    expect(typeof GalleryReflistBlockInfo.description).toBe('string');
    expect(typeof GalleryReflistBlockInfo.icon).toBe('function');
  });
});

describe('bundle hygiene', () => {
  const source = readFileSync(bundlePath, 'utf8');
  const PROBE_PATH = path.resolve(import.meta.dirname, '.artifact-probe.mjs');
  afterAll(() => rmSync(PROBE_PATH, { force: true }));

  it('imports only promised modules', () => {
    const imported = [
      ...new Set(
        [...source.matchAll(/(?:^|\n)\s*import[^'"\n]*["']([^"']+)["']/g)].map((m) => m[1]),
      ),
    ].sort();
    expect(imported).toEqual(['@plone/registry', 'react', 'react/jsx-runtime']);
  });

  it('ships its stylesheet scope-wrapped to the three roots', () => {
    const css = readFileSync(bundlePath.replace(/\.js$/, '.css'), 'utf8');
    expect(css.trimStart().startsWith('@scope (.aurora-editor, .aurora-editor-portal, .aurora-blocks')).toBe(true);
    expect(css).toContain('.has--blockStyle--feature');
  });

  it('is importable as a plain ESM module whose default export installs', async () => {
    writeFileSync(PROBE_PATH, source.replace(/\/\/# sourceMappingURL=.*/g, ''));
    const specifier = './.artifact-probe.mjs';
    const built: any = await import(/* @vite-ignore */ specifier);
    const probe: any = { blocks: { blocksConfig: {} } };
    vi.stubGlobal('fetch', async () => ({ ok: false }));
    expect(await built.default(probe)).toBe(probe);
    vi.unstubAllGlobals();
    expect(probe.blocks.blocksConfig['plone-collective.galleryreflist']?.id).toBe(
      'plone-collective.galleryreflist',
    );
  });
});
