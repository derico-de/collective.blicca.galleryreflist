# Changelog

## 1.0.0a2 (unreleased)

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
