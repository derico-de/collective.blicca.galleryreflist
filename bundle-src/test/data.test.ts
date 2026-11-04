import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  hasReferences,
  placeholderGallery,
  rootClass,
  seededData,
  textOf,
  withText,
} from '../src/galleryreflist/data';
import { blockStyles, loadBlockStyles, setBlockStyles } from '../src/galleryreflist/styles';

afterEach(() => setBlockStyles([]));

describe('the seed', () => {
  it('holds the three children in order, with example words and no references', () => {
    const { blocks, blocks_layout } = seededData();
    expect(blocks_layout.items).toEqual(['heading', 'text', 'gallery']);
    expect(blocks.heading.type).toBe('h3');
    expect(textOf(blocks.heading)).toBeTruthy();
    expect(blocks.text.type).toBe('p');
    expect(textOf(blocks.text)).toBeTruthy();
    expect(blocks.gallery['@type']).toBe('plone-collective.referencelist');
    expect(blocks.gallery.references).toEqual([]);
  });

  it('never stores a placeholder', () => {
    expect(JSON.stringify(seededData())).not.toContain('cataas');
  });
});

describe('the text children', () => {
  it('replaces the text and keeps the node', () => {
    const node = withText({ type: 'h3', children: [{ text: 'old' }] }, 'h3', 'new');
    expect(node).toEqual({ type: 'h3', children: [{ text: 'new' }] });
  });

  it('builds the node a stored block lost', () => {
    expect(withText(undefined, 'p', 'new')).toEqual({ type: 'p', children: [{ text: 'new' }] });
  });
});

describe('the placeholder gallery', () => {
  it('drops the empty references, so the view reads the items', () => {
    expect('references' in placeholderGallery({ references: [] })).toBe(false);
  });

  it('keeps the gallery settings', () => {
    expect(placeholderGallery({ variation: 'summary' }).variation).toBe('summary');
  });

  it('counts as nothing picked only while the list is empty', () => {
    expect(hasReferences({ references: [] })).toBe(false);
    expect(hasReferences({})).toBe(false);
    expect(hasReferences({ references: [{ '@id': 'x' }] })).toBe(true);
  });
});

describe('the root class', () => {
  it('names a registered style', () => {
    setBlockStyles([['feature', 'Feature']]);
    expect(rootClass({ blockStyle: 'feature' })).toBe('galleryreflist has--blockStyle--feature');
  });

  it.each([{}, { blockStyle: 'none' }, { blockStyle: 'gone' }])('gives none for %j', (data) => {
    setBlockStyles([['feature', 'Feature']]);
    expect(rootClass(data)).toBe('galleryreflist');
  });
});

describe('loading the styles', () => {
  const response = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response;

  it('reads the vocabulary below the portal', async () => {
    const fetchImpl = vi.fn(async () =>
      response({ items: [{ token: 'feature', title: 'Feature' }] }),
    );
    const styles = await loadBlockStyles('http://site/Plone/', fetchImpl as any);
    expect(styles).toEqual([['feature', 'Feature']]);
    expect((fetchImpl.mock.calls as any)[0][0]).toBe(
      'http://site/Plone/@vocabularies/collective.blicca.galleryreflist.BlockStyles?b_size=-1',
    );
  });

  it('gives none on a refused request', async () => {
    expect(await loadBlockStyles('', (async () => response({}, false)) as any)).toEqual([]);
  });

  it('gives none on a failed request', async () => {
    const failing = async () => {
      throw new Error('offline');
    };
    expect(await loadBlockStyles('', failing as any)).toEqual([]);
    expect(blockStyles()).toEqual([]);
  });
});
