"""The public page: the nested children, rendered by the host and the Reference List."""

import pytest
from plone import api
from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from plone.blicca.auroraeditor import SOMERSAULT_BLOCK_ID
from plone.blicca.auroraeditor import SOMERSAULT_BLOCK_TYPE
from plone.dexterity.schema import SCHEMA_CACHE
from plone.restapi.behaviors import IBlocks
from plone.restapi.interfaces import IDeserializeFromJson
from plone.restapi.interfaces import ISerializeToJson
from zope.component import getMultiAdapter
from zope.interface import alsoProvides

from collective.blicca.galleryreflist.interfaces import ICollectiveBliccaGalleryreflistLayer
from collective.blicca.referencelist.interfaces import ICollectiveBliccaReferencelistLayer


BLOCK_TYPE = "plone-collective.galleryreflist"
REFERENCELIST = "plone-collective.referencelist"


def block_data(references=(), heading="A heading", text="Some text", **extra):
    return {
        "@type": BLOCK_TYPE,
        "blocks": {
            "heading": {"type": "h3", "children": [{"text": heading}]},
            "text": {"type": "p", "children": [{"text": text}]},
            "gallery": {
                "@type": REFERENCELIST,
                "variation": "grid",
                "headlineTag": "h3",
                "references": list(references),
            },
        },
        "blocks_layout": {"items": ["heading", "text", "gallery"]},
        **extra,
    }


class TestRendering:
    @pytest.fixture(autouse=True)
    def _setup(self, integration):
        self.portal = integration["portal"]
        self.request = integration["request"]
        alsoProvides(self.request, ICollectiveBliccaGalleryreflistLayer)
        alsoProvides(self.request, ICollectiveBliccaReferencelistLayer)
        setRoles(self.portal, TEST_USER_ID, ["Manager"])
        self.doc = api.content.create(container=self.portal, type="Document", id="doc", title="D")
        self.target = api.content.create(
            container=self.portal, type="Document", id="target", title="The target"
        )

    def render(self, data):
        view = getMultiAdapter((self.doc, self.request), name=f"aurora-block-{BLOCK_TYPE}")
        view.block_type = BLOCK_TYPE
        view.data = data
        return view()

    def reference(self):
        return {"@id": self.target.absolute_url(), "UID": self.target.UID(), "title": "The target"}

    def test_children_render_in_layout_order_inside_the_root(self):
        html = self.render(block_data(references=[self.reference()]))
        assert html.strip().startswith('<section class="galleryreflist">')
        assert html.index("A heading") < html.index("Some text") < html.index("The target")
        assert "<h3" in html
        assert "<p" in html
        assert "referencelist variation-grid" in html

    def test_no_placeholders_and_no_gallery_without_references(self):
        html = self.render(block_data())
        assert "cataas" not in html
        assert "referencelist" not in html
        assert "A heading" in html

    def test_a_cleared_field_leaves_no_empty_element(self):
        html = self.render(block_data(heading="", text="   "))
        assert html.strip() == ""

    def test_a_block_never_seeded_renders_nothing(self):
        assert self.render({"@type": BLOCK_TYPE}).strip() == ""

    def test_style_class_sits_on_the_root(self):
        html = self.render(block_data(blockStyle="feature"))
        assert '<section class="galleryreflist has--blockStyle--feature">' in html

    def test_dropped_style_gives_no_class(self):
        html = self.render(block_data(blockStyle="gone"))
        assert '<section class="galleryreflist">' in html

    def test_heading_text_is_escaped(self):
        html = self.render(block_data(heading="<script>x</script>"))
        assert "<script>x" not in html


class TestNestedTransforms:
    """The Reference List's transformers reach the nested gallery by themselves."""

    @pytest.fixture(autouse=True)
    def _setup(self, integration):
        self.portal = integration["portal"]
        self.request = integration["request"]
        alsoProvides(self.request, ICollectiveBliccaReferencelistLayer)
        setRoles(self.portal, TEST_USER_ID, ["Manager"])
        fti = self.portal.portal_types["Document"]
        if "volto.blocks" not in fti.behaviors:
            fti.behaviors = (*tuple(fti.behaviors), "volto.blocks")
            SCHEMA_CACHE.invalidate("Document")
        self.doc = api.content.create(container=self.portal, type="Document", id="doc", title="D")
        alsoProvides(self.doc, IBlocks)
        self.target = api.content.create(
            container=self.portal, type="Document", id="target", title="The target"
        )

    def save(self):
        reference = {"@id": self.target.absolute_url(), "UID": self.target.UID(), "title": "Stale"}
        block = {
            **block_data(references=[reference]),
            "type": "ploneBlock",
            "children": [{"text": ""}],
        }
        getMultiAdapter((self.doc, self.request), IDeserializeFromJson)(
            validate_all=False,
            data={
                "blocks": {SOMERSAULT_BLOCK_ID: {"@type": SOMERSAULT_BLOCK_TYPE, "value": [block]}},
                "blocks_layout": {"items": [SOMERSAULT_BLOCK_ID]},
            },
        )
        return self.doc.blocks[SOMERSAULT_BLOCK_ID]["value"][0]["blocks"]["gallery"]

    def test_save_stores_a_resolveuid_reference_and_nothing_derived(self):
        gallery = self.save()
        assert "resolveuid" in gallery["references"][0]["@id"]
        assert "items" not in gallery

    def test_serialization_derives_the_items(self):
        self.save()
        serialized = getMultiAdapter((self.doc, self.request), ISerializeToJson)()
        gallery = serialized["blocks"][SOMERSAULT_BLOCK_ID]["value"][0]["blocks"]["gallery"]
        assert [item["title"] for item in gallery["items"]] == ["The target"]
