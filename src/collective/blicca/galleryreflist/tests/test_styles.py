"""The registered styles: what the sidebar offers and the class they give."""

import pytest
from plone.app.registry.exportimport.handler import RegistryImporter
from plone.registry.interfaces import IRegistry
from Products.GenericSetup.tests.common import DummyImportContext
from zope.component import getUtility
from zope.schema.interfaces import IVocabularyFactory

from collective.blicca.galleryreflist.styles import RECORD
from collective.blicca.galleryreflist.styles import style_class_of


# The form the README tells a theme to register its styles in.
THEME_REGISTRY_XML = """
<registry>
  <record name="collective.blicca.galleryreflist.styles">
    <value>
      <element>
        <element>feature</element>
        <element>Feature</element>
      </element>
      <element>
        <element>forest</element>
        <element>Forest</element>
      </element>
    </value>
  </record>
</registry>
"""


class TestStyles:
    @pytest.fixture(autouse=True)
    def _setup(self, integration):
        self.portal = integration["portal"]

    def test_a_theme_replaces_the_styles_in_its_registry_xml(self):
        registry = getUtility(IRegistry)
        environ = DummyImportContext(self.portal, purge=False)
        RegistryImporter(registry, environ).importDocument(THEME_REGISTRY_XML)
        assert registry[RECORD] == [("feature", "Feature"), ("forest", "Forest")]
        assert style_class_of({"blockStyle": "forest"}) == "has--blockStyle--forest"

    def test_vocabulary_lists_the_registered_styles(self):
        factory = getUtility(IVocabularyFactory, "collective.blicca.galleryreflist.BlockStyles")
        assert [(term.token, term.title) for term in factory(self.portal)] == [
            ("feature", "Feature"),
            ("compact", "Compact"),
        ]

    def test_registering_replaces_the_list(self):
        getUtility(IRegistry)[RECORD] = [("forest", "Forest")]
        assert style_class_of({"blockStyle": "forest"}) == "has--blockStyle--forest"
        assert style_class_of({"blockStyle": "feature"}) == ""

    @pytest.mark.parametrize("data", [{}, None, {"blockStyle": "none"}, {"blockStyle": "gone"}])
    def test_no_class_without_a_registered_style(self, data):
        assert style_class_of(data) == ""

    def test_registered_style_gives_its_class(self):
        assert style_class_of({"blockStyle": "feature"}) == "has--blockStyle--feature"
