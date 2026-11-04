/**
 * The sidebar form. The gallery's fields are the Reference List's own schema
 * properties, keyed by dotted path: the form reads and writes them inside the
 * nested child, and the widgets never know.
 */
import config from '@plone/registry';

import { REFERENCELIST_BLOCK_TYPE, type GalleryReflistData } from './data';
import { blockStyles } from './styles';

const GALLERY_FIELDS = ['variation', 'linkItems', 'references'];
const STYLING_FIELDS = ['blockWidth', 'backgroundColor'];

const galleryPath = (name: string) => `blocks.gallery.${name}`;

function referenceListProperties(formData: GalleryReflistData) {
  const entry = (config as any).blocks?.blocksConfig?.[REFERENCELIST_BLOCK_TYPE];
  const schema = entry?.blockSchema?.({ formData: formData.blocks?.gallery ?? {} });
  return (schema?.properties ?? {}) as Record<string, unknown>;
}

/** A stored id the site dropped stays a choice, so a save doesn't lose it. */
function styleChoices(stored?: string) {
  const choices = blockStyles();
  if (stored && stored !== 'none' && !choices.some(([id]) => id === stored)) {
    return [...choices, [stored, stored]];
  }
  return choices;
}

export function GalleryReflistSchema({ formData = {} }: { formData?: GalleryReflistData } = {}) {
  const inherited = referenceListProperties(formData);
  const choices = styleChoices(formData.blockStyle);
  const gallery = GALLERY_FIELDS.filter((name) => name in inherited);
  const styling = STYLING_FIELDS.filter((name) => name in inherited);
  return {
    title: 'Gallery reference list',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: [...(choices.length ? ['blockStyle'] : []), ...gallery.map(galleryPath)],
      },
      { id: 'styling', title: 'Styling', fields: styling },
    ],
    properties: {
      ...(choices.length
        ? {
            blockStyle: {
              title: 'Style',
              widget: 'referencelist_select',
              choices: [['none', 'None'], ...choices],
              default: 'none',
            },
          }
        : {}),
      ...Object.fromEntries(gallery.map((name) => [galleryPath(name), inherited[name]])),
      ...Object.fromEntries(styling.map((name) => [name, inherited[name]])),
    },
    required: [],
  };
}

export default GalleryReflistSchema;
