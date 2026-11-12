import { describe, expect, it } from 'vitest';

import {
  hasReferences,
  placeholderGallery,
  seededData,
  textOf,
  withText,
} from '../src/galleryreflist/data';

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
