# collective.blicca.galleryreflist

A **Gallery Reference List** block for the Aurora editor in [Plone](https://plone.org) Blicca.
Blicca is the former Plone Classic UI. One block holds a heading, a text and a
list of hand-picked content items, so an author inserts a whole gallery section
in one step instead of building it from three blocks. It offers the editor's
block styles, and brings two of its own.

Typical uses:

- a "Our partners" or "Case studies" section with an introduction;
- a picture gallery with a heading and a few words above it;
- the same section in several looks across a site, through its styles.

The block needs [plone.blicca.auroraeditor](https://github.com/derico-de/plone.blicca.auroraeditor)
and [collective.blicca.referencelist](https://github.com/collective/collective.blicca.referencelist),
whose list and content picker it nests. The block's `@type` is
`plone-collective.galleryreflist`.

## Features

- **Ready on insert.** A new block starts with an example heading, an example
  text and three example images, so the author sees the finished section at
  once.
- **Examples that stay out of the page.** The example images exist on the
  editor canvas only and are never saved. They disappear as soon as references
  are picked. The heading and text are ordinary saved content, so an author
  replaces them.
- **The real Reference List.** Variation, Link items and the content picker
  are the Reference List's own fields, its templates apply, and its item
  lookup keeps the list current.
- **Block styles.** The block offers the editor's Style control. Installing
  adds two styles its stylesheet dresses to the site's list.
- **Block width and background** come from the editor's regular block styling
  controls.

## Requirements

- Plone 6.0 or later
- `plone.blicca.auroraeditor`
- `collective.blicca.referencelist`

The JavaScript bundle is committed to the package. No Node is needed at install
time.

## Installation

Add the package to your project's dependencies:

```toml
# pyproject.toml
dependencies = [
    "collective.blicca.galleryreflist",
]
```

Then install **Collective Blicca Galleryreflist** from Plone's Add-ons control
panel, or apply the `collective.blicca.galleryreflist:default` profile. It
installs the Reference List along with it. Uninstalling removes the block
registration again. Its two styles stay in the site's list: remove them in the
Aurora Editor control panel if no other block uses them.

## Using the block

Insert the **Gallery reference list** block in the Aurora editor. Type the
heading and the text right on the canvas, and fill in the rest in the sidebar.

| Field | What it does |
|---|---|
| Style | `None` or one of the site's block styles. Hidden when the site has none |
| Variation | `Default`, `Summary` or `Grid` |
| Link items | On by default: each card links to its item |
| References | The picked items, in order |
| Block width | The editor's width control |
| Background | A background colour, if the site offers a palette |

Rules worth knowing:

- Heading and text are plain text fields, with no bold or links.
- Visitors see no gallery until references are picked. An empty heading or text
  is left out of the page.
- Item titles without a list headline are `h3`, the same level as the block's
  heading.

## Styles

The Style control lists the site's block styles: the Aurora editor's
`plone.blicca.auroraeditor.block_styles` record, shared by every block that
offers the control. Edit them as `id|Name` lines in the Aurora Editor control
panel. Installing this add-on adds `feature|Feature` and `compact|Compact`,
two examples its stylesheet dresses, and keeps the styles a site already has.

An add-on adds its own styles in its `registry.xml`. `purge="false"` adds them
to the list instead of replacing it:

```xml
<!-- profiles/default/registry.xml of your theme or add-on -->
<registry>
  <record name="plone.blicca.auroraeditor.block_styles">
    <value purge="false">
      <element>
        <element>forest</element>
        <element>Forest</element>
      </element>
    </value>
  </record>
</registry>
```

`None` is always offered and `none` is not available as an id. An empty list
hides the Style control.

A block that stored a dropped id keeps the value but renders without a style
class on both surfaces, until the id is registered again. While other styles
are registered, its Style control lists the id, until the author picks another.

The record holds no CSS. The editor puts the class `has--blockStyle--<id>` on
the block's wrapper, on the public page and on the canvas alike. Style the
block inside it:

```css
.has--blockStyle--forest .galleryreflist {
  background: #e7f0e4;
}
```

## Rendered markup

```html
<div class="block block-plone-collective-galleryreflist … has--blockStyle--forest">
  <section class="galleryreflist">
    <div class="block block-h3 …"><h3 id="…">Heading</h3></div>   <!-- only with a heading -->
    <div class="block block-p …"><p>Text</p></div>                <!-- only with a text -->
    <div class="block block-plone-collective-referencelist …">    <!-- only with references -->
      <div class="referencelist variation-summary">…</div>
    </div>
  </section>
</div>
```

The wrapper is the editor's, with its width, background and style classes. The
nested blocks use the regular block classes, so the site's heading and text
styles apply. The list inside is the Reference List's own markup. The canvas
wraps the heading and text the same way, with an input in place of the words.

## How it works

The block stores its children the way a container block does:

```json
{
  "@type": "plone-collective.galleryreflist",
  "blockStyle": "forest",
  "blocks": {
    "heading": { "type": "h3", "children": [{ "text": "…" }] },
    "text": { "type": "p", "children": [{ "text": "…" }] },
    "gallery": {
      "@type": "plone-collective.referencelist",
      "variation": "grid",
      "references": []
    }
  },
  "blocks_layout": { "items": ["heading", "text", "gallery"] }
}
```

The Reference List's transformers follow the nested `blocks`, so references are
resolved and stripped as they are on a standalone list. The sidebar reaches the
nested list's fields by dotted path, `blocks.gallery.variation`.

## Development

The JavaScript build output is committed into
`src/collective/blicca/galleryreflist/static/`. Rebuild and commit it whenever
`bundle-src/src/` changes.

```bash
cd bundle-src
pnpm install
pnpm build        # writes ../src/collective/blicca/galleryreflist/static/galleryreflist-block.{js,css,js.map}
pnpm test         # reads the built bundle, so build first; needs the Reference List checkout beside this one
pnpm typecheck
```

```bash
uv run --extra test pytest
```

`e2e/` drives the block in a running site with playwright-core, from inserting
it to the published page. The script builds its fixture in the folder
`AURORA_E2E_BASE` names and removes it again; the add-on must be installed
there. The header of `e2e/gallery-reflist.e2e.js` lists the other settings.

```bash
cd e2e
pnpm install
AURORA_E2E_BASE=http://localhost:8080/Plone pnpm e2e
```

Every change to a GenericSetup profile XML file needs an upgrade step, even in
an alpha release. Scaffold it with `plonecli add upgrade_step`.

## License

GPL-2.0-or-later

## Author

Maik Derstappen, [derico.de](https://derico.de), <md@derico.de>
