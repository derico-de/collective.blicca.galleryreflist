/**
 * The Gallery Reference List block's Aurora half: one record, one bundle,
 * one `install()`. `blockStyle: true` gives it the editor's Style control
 * (block add-on contract §1.12).
 */
import { GALLERYREFLIST_BLOCK_TYPE } from './galleryreflist/data';
import GalleryReflistEdit from './galleryreflist/GalleryReflistEdit';
import GalleryReflistIcon from './galleryreflist/GalleryReflistIcon';
import GalleryReflistSchema from './galleryreflist/schema';
import GalleryReflistView from './galleryreflist/GalleryReflistView';
import './styles.css';

export const GalleryReflistBlockInfo = {
  id: GALLERYREFLIST_BLOCK_TYPE,
  title: 'Gallery reference list',
  description: 'A heading, a text and a reference list as one block',
  edit: GalleryReflistEdit,
  view: GalleryReflistView,
  blockSchema: GalleryReflistSchema,
  icon: GalleryReflistIcon,
  category: 'referencelist',
  blockStyle: true,
};

export default function install(config: any) {
  config.blocks.blocksConfig[GALLERYREFLIST_BLOCK_TYPE] = GalleryReflistBlockInfo;
  return config;
}

export {
  GALLERYREFLIST_BLOCK_TYPE,
  GalleryReflistEdit,
  GalleryReflistIcon,
  GalleryReflistSchema,
  GalleryReflistView,
};
