/** The stored block: three children under `blocks`, in `blocks_layout` order. */
export const GALLERYREFLIST_BLOCK_TYPE = 'plone-collective.galleryreflist';
export const REFERENCELIST_BLOCK_TYPE = 'plone-collective.referencelist';

export type TextNode = { type: string; children: Array<{ text?: string }> };
export type GalleryChild = Record<string, unknown> & { references?: unknown[] };
export type Blocks = { heading?: TextNode; text?: TextNode; gallery?: GalleryChild };
export type GalleryReflistData = Record<string, unknown> & {
  blocks?: Blocks;
};

export function seededData() {
  return {
    blocks: {
      heading: { type: 'h3', children: [{ text: 'A heading for this gallery' }] },
      text: { type: 'p', children: [{ text: 'A few words that introduce the items below.' }] },
      gallery: {
        '@type': REFERENCELIST_BLOCK_TYPE,
        variation: 'grid',
        headlineTag: 'h3',
        references: [],
      },
    },
    blocks_layout: { items: ['heading', 'text', 'gallery'] },
  };
}

export const textOf = (node?: TextNode) =>
  (node?.children ?? []).map((leaf) => leaf.text ?? '').join('');

export const withText = (node: TextNode | undefined, type: string, text: string): TextNode => ({
  ...(node ?? { type }),
  children: [{ text }],
});

export const hasReferences = (gallery?: GalleryChild) =>
  Array.isArray(gallery?.references) && gallery.references.length > 0;

const PLACEHOLDER_HOST = 'https://cataas.com';
// One URL per image, or the browser shows the one cached cat three times.
const PLACEHOLDER_WIDTHS = [480, 640, 800];

/**
 * Items the Reference List's own view draws until references are picked. Canvas
 * only, and never stored. Without `references` it reads `items` as the list,
 * and its `previewImage()` joins `base_path` and `download` into the image's URL.
 */
export function placeholderGallery(gallery: GalleryChild = {}): GalleryChild {
  const { references: _references, ...rest } = gallery;
  return {
    ...rest,
    linkItems: false,
    items: PLACEHOLDER_WIDTHS.map((width, index) => ({
      '@id': `${PLACEHOLDER_HOST}/#${index + 1}`,
      title: `Example item ${index + 1}`,
      description: 'Shown until references are picked.',
      image_scales: {
        image: [
          {
            base_path: PLACEHOLDER_HOST,
            scales: { preview: { download: `cat?filter=mono&width=${width}` } },
          },
        ],
      },
    })),
  };
}
