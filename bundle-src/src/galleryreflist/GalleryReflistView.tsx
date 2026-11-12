/** The public rendering in Aurora proper; Blicca renders it on the server. */
import config from '@plone/registry';

import {
  REFERENCELIST_BLOCK_TYPE,
  hasReferences,
  textOf,
  type GalleryReflistData,
} from './data';

export function GalleryReflistView({ data = {} }: { data?: GalleryReflistData }) {
  const { heading, text, gallery } = data.blocks ?? {};
  const headingText = textOf(heading);
  const bodyText = textOf(text);
  const showGallery = hasReferences(gallery);
  if (!headingText.trim() && !bodyText.trim() && !showGallery) return null;
  const GalleryView = (config as any).blocks?.blocksConfig?.[REFERENCELIST_BLOCK_TYPE]?.view;
  return (
    <section className="galleryreflist">
      {headingText.trim() ? (
        <div className="block block-h3">
          <h3>{headingText}</h3>
        </div>
      ) : null}
      {bodyText.trim() ? (
        <div className="block block-p">
          <p>{bodyText}</p>
        </div>
      ) : null}
      {showGallery && GalleryView ? <GalleryView data={gallery} /> : null}
    </section>
  );
}

export default GalleryReflistView;
