import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useRef, useLayoutEffect, useEffect } from "react";
import config from "@plone/registry";
const VOCABULARY = "collective.blicca.galleryreflist.BlockStyles";
let definitions = [];
function setBlockStyles(next) {
  definitions = next;
}
const blockStyles = () => definitions;
const blockStyleIds = () => definitions.map(([id]) => id);
async function loadBlockStyles(apiPath = "", fetchImpl = fetch) {
  const base = apiPath.replace(/\/+$/, "");
  try {
    const response = await fetchImpl(`${base}/@vocabularies/${VOCABULARY}?b_size=-1`, {
      headers: { Accept: "application/json" },
      credentials: "same-origin"
    });
    if (!response.ok) return [];
    const { items } = await response.json();
    return items.map(({ token, title }) => [token, title]);
  } catch {
    return [];
  }
}
const GALLERYREFLIST_BLOCK_TYPE = "plone-collective.galleryreflist";
const REFERENCELIST_BLOCK_TYPE = "plone-collective.referencelist";
function seededData() {
  return {
    blocks: {
      heading: { type: "h3", children: [{ text: "A heading for this gallery" }] },
      text: { type: "p", children: [{ text: "A few words that introduce the items below." }] },
      gallery: {
        "@type": REFERENCELIST_BLOCK_TYPE,
        variation: "grid",
        headlineTag: "h3",
        references: []
      }
    },
    blocks_layout: { items: ["heading", "text", "gallery"] }
  };
}
const textOf = (node) => (node?.children ?? []).map((leaf) => leaf.text ?? "").join("");
const withText = (node, type, text) => ({
  ...node ?? { type },
  children: [{ text }]
});
const hasReferences = (gallery) => Array.isArray(gallery?.references) && gallery.references.length > 0;
function rootClass(data = {}) {
  const style = data.blockStyle;
  return style && blockStyleIds().includes(style) ? `galleryreflist has--blockStyle--${style}` : "galleryreflist";
}
const PLACEHOLDER_HOST = "https://cataas.com";
const PLACEHOLDER_WIDTHS = [480, 640, 800];
function placeholderGallery(gallery = {}) {
  const { references: _references, ...rest } = gallery;
  return {
    ...rest,
    linkItems: false,
    items: PLACEHOLDER_WIDTHS.map((width, index) => ({
      "@id": `${PLACEHOLDER_HOST}/#${index + 1}`,
      title: `Example item ${index + 1}`,
      description: "Shown until references are picked.",
      image_scales: {
        image: [
          {
            base_path: PLACEHOLDER_HOST,
            scales: { preview: { download: `cat?filter=mono&width=${width}` } }
          }
        ]
      }
    }))
  };
}
const stop = (event) => event.stopPropagation();
function InlineField({ value, onChange, label }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      ref,
      className: "galleryreflist-input",
      rows: 1,
      value,
      placeholder: label,
      "aria-label": label,
      onChange: (event) => onChange(event.target.value.replace(/[\r\n]+/g, " ")),
      onKeyDown: (event) => {
        event.stopPropagation();
        if (event.key === "Enter") event.preventDefault();
      },
      onKeyUp: stop,
      onBeforeInput: stop,
      onPaste: stop,
      onCopy: stop,
      onCut: stop,
      onDrop: stop
    }
  );
}
function Gallery({ gallery }) {
  const entry = config.blocks?.blocksConfig?.[REFERENCELIST_BLOCK_TYPE];
  if (!entry) {
    return /* @__PURE__ */ jsx("p", { className: "referencelist-notice", contentEditable: false, children: "The Reference List block is not available." });
  }
  if (hasReferences(gallery)) return /* @__PURE__ */ jsx(entry.edit, { data: gallery });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(entry.view, { data: placeholderGallery(gallery), isEditMode: true }),
    /* @__PURE__ */ jsx("p", { className: "referencelist-notice", contentEditable: false, children: "Example images. Pick references in the sidebar." })
  ] });
}
function GalleryReflistEdit({ block, data = {}, onChangeBlock }) {
  const seedWritten = useRef(false);
  useEffect(() => {
    if (seedWritten.current || !onChangeBlock || data.blocks) return;
    seedWritten.current = true;
    onChangeBlock(block ?? "", { ...data, ...seededData() });
  }, [block, data, onChangeBlock]);
  const blocks = data.blocks ?? {};
  const setText = (key, type) => (text) => onChangeBlock?.(block ?? "", {
    ...data,
    blocks: { ...blocks, [key]: withText(blocks[key], type, text) }
  });
  return /* @__PURE__ */ jsxs("section", { className: rootClass(data), children: [
    /* @__PURE__ */ jsx("div", { className: "block block-h3", children: /* @__PURE__ */ jsx("h3", { children: /* @__PURE__ */ jsx(
      InlineField,
      {
        label: "Heading",
        value: textOf(blocks.heading),
        onChange: setText("heading", "h3")
      }
    ) }) }),
    /* @__PURE__ */ jsx("div", { className: "block block-p", children: /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx(InlineField, { label: "Text", value: textOf(blocks.text), onChange: setText("text", "p") }) }) }),
    /* @__PURE__ */ jsx(Gallery, { gallery: blocks.gallery })
  ] });
}
function GalleryReflistIcon(props) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      focusable: "false",
      ...props,
      children: [
        /* @__PURE__ */ jsx("path", { d: "M4 5h9M4 9h16" }),
        /* @__PURE__ */ jsx("rect", { x: "3.5", y: "13", width: "5", height: "6.5", rx: "1" }),
        /* @__PURE__ */ jsx("rect", { x: "9.5", y: "13", width: "5", height: "6.5", rx: "1" }),
        /* @__PURE__ */ jsx("rect", { x: "15.5", y: "13", width: "5", height: "6.5", rx: "1" })
      ]
    }
  );
}
const GALLERY_FIELDS = ["variation", "linkItems", "references"];
const STYLING_FIELDS = ["blockWidth", "backgroundColor"];
const galleryPath = (name) => `blocks.gallery.${name}`;
function referenceListProperties(formData) {
  const entry = config.blocks?.blocksConfig?.[REFERENCELIST_BLOCK_TYPE];
  const schema = entry?.blockSchema?.({ formData: formData.blocks?.gallery ?? {} });
  return schema?.properties ?? {};
}
function styleChoices(stored) {
  const choices = blockStyles();
  if (choices.length && stored && stored !== "none" && !choices.some(([id]) => id === stored)) {
    return [...choices, [stored, stored]];
  }
  return choices;
}
function GalleryReflistSchema({ formData = {} } = {}) {
  const inherited = referenceListProperties(formData);
  const choices = styleChoices(formData.blockStyle);
  const gallery = GALLERY_FIELDS.filter((name) => name in inherited);
  const styling = STYLING_FIELDS.filter((name) => name in inherited);
  return {
    title: "Gallery reference list",
    fieldsets: [
      {
        id: "default",
        title: "Default",
        fields: [...choices.length ? ["blockStyle"] : [], ...gallery.map(galleryPath)]
      },
      { id: "styling", title: "Styling", fields: styling }
    ],
    properties: {
      ...choices.length ? {
        blockStyle: {
          title: "Style",
          widget: "referencelist_select",
          choices: [["none", "None"], ...choices],
          default: "none"
        }
      } : {},
      ...Object.fromEntries(gallery.map((name) => [galleryPath(name), inherited[name]])),
      ...Object.fromEntries(styling.map((name) => [name, inherited[name]]))
    },
    required: []
  };
}
function GalleryReflistView({ data = {} }) {
  const { heading, text, gallery } = data.blocks ?? {};
  const headingText = textOf(heading);
  const bodyText = textOf(text);
  const showGallery = hasReferences(gallery);
  if (!headingText.trim() && !bodyText.trim() && !showGallery) return null;
  const GalleryView = config.blocks?.blocksConfig?.[REFERENCELIST_BLOCK_TYPE]?.view;
  return /* @__PURE__ */ jsxs("section", { className: rootClass(data), children: [
    headingText.trim() ? /* @__PURE__ */ jsx("div", { className: "block block-h3", children: /* @__PURE__ */ jsx("h3", { children: headingText }) }) : null,
    bodyText.trim() ? /* @__PURE__ */ jsx("div", { className: "block block-p", children: /* @__PURE__ */ jsx("p", { children: bodyText }) }) : null,
    showGallery && GalleryView ? /* @__PURE__ */ jsx(GalleryView, { data: gallery }) : null
  ] });
}
const GalleryReflistBlockInfo = {
  id: GALLERYREFLIST_BLOCK_TYPE,
  title: "Gallery reference list",
  description: "A heading, a text and a reference list as one block",
  edit: GalleryReflistEdit,
  view: GalleryReflistView,
  blockSchema: GalleryReflistSchema,
  icon: GalleryReflistIcon,
  category: "referencelist"
};
async function install(config2) {
  setBlockStyles(await loadBlockStyles(config2.settings?.apiPath));
  config2.blocks.blocksConfig[GALLERYREFLIST_BLOCK_TYPE] = GalleryReflistBlockInfo;
  return config2;
}
export {
  GALLERYREFLIST_BLOCK_TYPE,
  GalleryReflistBlockInfo,
  GalleryReflistEdit,
  GalleryReflistIcon,
  GalleryReflistSchema,
  GalleryReflistView,
  install as default
};
//# sourceMappingURL=galleryreflist-block.js.map
