/**
 * The canvas: the heading and the text typed in place, the gallery drawn by the
 * Reference List's own halves. Until references are picked it shows examples.
 * The `block-*` wrappers are the published anatomy: the host's sheet sets the
 * heading's type through them on both surfaces.
 */
import { useEffect, useRef } from 'react';
import config from '@plone/registry';

import {
  REFERENCELIST_BLOCK_TYPE,
  hasReferences,
  placeholderGallery,
  seededData,
  textOf,
  withText,
  type Blocks,
  type GalleryChild,
  type GalleryReflistData,
} from './data';
import InlineField from './InlineField';

export type GalleryReflistEditProps = {
  block?: string;
  data?: GalleryReflistData;
  onChangeBlock?: (block: string, data: GalleryReflistData) => void;
};

function Gallery({ gallery }: { gallery?: GalleryChild }) {
  const entry = (config as any).blocks?.blocksConfig?.[REFERENCELIST_BLOCK_TYPE];
  if (!entry) {
    return (
      <p className="referencelist-notice" contentEditable={false}>
        The Reference List block is not available.
      </p>
    );
  }
  if (hasReferences(gallery)) return <entry.edit data={gallery} />;
  return (
    <>
      <entry.view data={placeholderGallery(gallery)} isEditMode />
      <p className="referencelist-notice" contentEditable={false}>
        Example images. Pick references in the sidebar.
      </p>
    </>
  );
}

export function GalleryReflistEdit({ block, data = {}, onChangeBlock }: GalleryReflistEditProps) {
  // In an effect, not in render: seeding writes to the Plate document. The ref
  // stops a host that re-renders before the write lands from seeding twice.
  const seedWritten = useRef(false);
  useEffect(() => {
    if (seedWritten.current || !onChangeBlock || data.blocks) return;
    seedWritten.current = true;
    onChangeBlock(block ?? '', { ...data, ...seededData() });
  }, [block, data, onChangeBlock]);

  const blocks: Blocks = data.blocks ?? {};
  const setText = (key: 'heading' | 'text', type: string) => (text: string) =>
    onChangeBlock?.(block ?? '', {
      ...data,
      blocks: { ...blocks, [key]: withText(blocks[key], type, text) },
    });

  return (
    <section className="galleryreflist">
      <div className="block block-h3">
        <h3>
          <InlineField
            label="Heading"
            value={textOf(blocks.heading)}
            onChange={setText('heading', 'h3')}
          />
        </h3>
      </div>
      <div className="block block-p">
        <p>
          <InlineField label="Text" value={textOf(blocks.text)} onChange={setText('text', 'p')} />
        </p>
      </div>
      <Gallery gallery={blocks.gallery} />
    </section>
  );
}

export default GalleryReflistEdit;
