# Changelog

## 1.0.0a4 (unreleased)


- Nothing changed yet.


## 1.0.0a3 (2026-11-13)

- Take the block's styles from the Aurora editor's block styles, edited in the
  Aurora Editor control panel. The editor now puts the style class on the
  block's wrapper instead of `section.galleryreflist`, so a rule reads
  `.has--blockStyle--<id> .galleryreflist`. The upgrade moves a site's styles
  to the editor's list and removes the `collective.blicca.galleryreflist.styles`
  record.
- The upgrade to 1003 removes what `derico.blicca.gallerysection`, this
  block's predecessor, left on a site: its browser layer, its block add-on
  records and its profile version. Without it every profile import logged a
  skipped add-on and failed the Aurora block add-on diagnostics.


## 1.0.0a2 (2026-11-10)

- Keep the caret in place when typing in the middle of the heading or the
  text; it jumped to the end after the first key.


## 1.0.0a1 (2026-11-09)

- Hide upgrade profiles from the add-ons control panel while keeping them
  available to GenericSetup migrations.

- Initial release: the Gallery Reference List block, a heading, a text and a
  Reference List composed into one block, with registrable styles. An empty
  styles record hides the Style control, also on a block that stored a style.
- Restore the plonecli scaffold files: `upgrades/base.py`,
  `upgrades/1001/.gitkeep` and the view and vocabulary tests.
