import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import config from '@plone/registry';

import referenceListInstall from '../../../collective.blicca.referencelist/bundle-src/src/index';
import GalleryReflistSchema from '../src/galleryreflist/schema';
import { setBlockStyles } from '../src/galleryreflist/styles';
import { installUpstreamRegistry, resolveWidget } from './upstream-registry';

const aurora = installUpstreamRegistry(config as any);
beforeAll(() => {
  referenceListInstall(aurora);
});
afterEach(() => setBlockStyles([]));

const properties = (formData = {}) =>
  GalleryReflistSchema({ formData }).properties as Record<string, any>;

describe('the style field', () => {
  it('offers None and the registered styles', () => {
    setBlockStyles([['feature', 'Feature']]);
    const { blockStyle } = properties();
    expect(blockStyle.choices).toEqual([
      ['none', 'None'],
      ['feature', 'Feature'],
    ]);
    expect(blockStyle.default).toBe('none');
  });

  it('is absent where nothing is registered', () => {
    const schema = GalleryReflistSchema();
    expect(schema.fieldsets[0].fields).not.toContain('blockStyle');
    expect(schema.properties).not.toHaveProperty('blockStyle');
  });

  it('keeps a stored style the site dropped', () => {
    expect(properties({ blockStyle: 'gone' }).blockStyle.choices).toContainEqual(['gone', 'gone']);
  });
});

describe('the gallery fields', () => {
  const PATHS = ['blocks.gallery.variation', 'blocks.gallery.linkItems', 'blocks.gallery.references'];

  it('are the Reference List’s own, addressed into the child', () => {
    const inherited = (aurora as any).blocks.blocksConfig['plone-collective.referencelist']
      .blockSchema({ formData: {} }).properties;
    const schema = GalleryReflistSchema();
    expect(schema.fieldsets[0].fields).toEqual(PATHS);
    expect((schema.properties as any)['blocks.gallery.variation']).toEqual(inherited.variation);
  });

  it('resolve to the widgets the Reference List designed them for', () => {
    const schema = properties();
    expect(resolveWidget(aurora, PATHS[0], schema[PATHS[0]])).toBe(aurora.getWidget('referencelist_select'));
    expect(resolveWidget(aurora, PATHS[1], schema[PATHS[1]])).toBeTruthy();
    expect(resolveWidget(aurora, PATHS[2], schema[PATHS[2]])).toBe(aurora.getWidget('referencelist_references'));
  });

  it('are absent, and nothing breaks, without the Reference List', () => {
    const blocksConfig = (aurora as any).blocks.blocksConfig;
    const entry = blocksConfig['plone-collective.referencelist'];
    delete blocksConfig['plone-collective.referencelist'];
    try {
      expect(GalleryReflistSchema().fieldsets[0].fields).toEqual([]);
    } finally {
      blocksConfig['plone-collective.referencelist'] = entry;
    }
  });
});

describe('the styling fields', () => {
  it('reuse the width as a style field', () => {
    expect(properties().blockWidth).toMatchObject({ widget: 'width', styleField: true });
  });
});
