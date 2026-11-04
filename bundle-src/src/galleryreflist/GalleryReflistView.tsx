/** The public rendering in Aurora proper; Blicca renders it on the server. */
import config from '@plone/registry';

import {
  REFERENCELIST_BLOCK_TYPE,
  hasReferences,
  rootClass,
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
    <section className={rootClass(data)}>
      {headingText.trim() ? <h3>{headingText}</h3> : null}
      {bodyText.trim() ? <p>{bodyText}</p> : null}
      {showGallery && GalleryView ? <GalleryView data={gallery} /> : null}
    </section>
  );
}

export default GalleryReflistView;
