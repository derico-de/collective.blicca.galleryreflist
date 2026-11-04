# `@plone-collective/aurora-galleryreflist-block`

The Gallery Reference List block's Aurora half, and the source of the bundle
committed into `../src/collective/blicca/galleryreflist/static/`.

## Commands

```bash
pnpm install
pnpm build      # -> ../src/collective/blicca/galleryreflist/static/galleryreflist-block.{js,css,js.map}
pnpm test       # reads the built bundle, so build first
pnpm typecheck
```

Build artifacts are committed and never built at install time. Rebuild here
and commit the result whenever `src/` changes.

## Layout

- `src/index.tsx`: the block entry; `install()` fetches the registered styles first.
- `src/galleryreflist/data.ts`: the stored block, its seed and the canvas placeholders.
- `src/galleryreflist/schema.ts`: the sidebar form; the gallery's fields are the
  Reference List's own, addressed by path into the nested child.
- `src/galleryreflist/styles.ts`: the registered styles, read from the site's vocabulary.
- `src/galleryreflist/GalleryReflistEdit.tsx`: the canvas.
- `src/galleryreflist/GalleryReflistView.tsx`: the public rendering in Aurora proper.
- `src/styles.css`: the one stylesheet, scope-wrapped by the build.
