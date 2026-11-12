"""The public renderer (``@@aurora-block-plone-collective.galleryreflist``)."""

from plone.blicca.auroraeditor import SOMERSAULT_BLOCK_ID
from plone.blicca.auroraeditor import SOMERSAULT_BLOCK_TYPE
from plone.blicca.auroraeditor.rendering import BaseBlockView
from plone.blicca.auroraeditor.rendering import render_blocks


class GalleryReflistBlockView(BaseBlockView):
    """Render the nested heading, text and reference list through the host."""

    def nodes(self):
        """The children worth rendering, as nodes of a Plate tree, in layout order."""
        blocks = self.data.get("blocks") or {}
        layout = (self.data.get("blocks_layout") or {}).get("items") or []
        return [
            node
            for node in (node_of(blocks[key]) for key in layout if key in blocks)
            if node is not None
        ]

    def children(self):
        return render_blocks(
            self.context,
            self.request,
            {SOMERSAULT_BLOCK_ID: {"@type": SOMERSAULT_BLOCK_TYPE, "value": self.nodes()}},
        )

    def __call__(self):
        return self.index() if self.nodes() else ""


def node_of(child):
    """A child's Plate node; an empty child has no markup on the public page."""
    if child.get("@type"):
        if not child.get("references"):
            return None
        return {**child, "type": "ploneBlock", "children": [{"text": ""}]}
    has_text = any((leaf.get("text") or "").strip() for leaf in child.get("children") or [])
    return child if has_text else None
