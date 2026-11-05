"""Tests for BlockStyles vocabulary."""
import pytest
from zope.component import getUtility
from zope.schema.interfaces import IVocabularyFactory
from zope.schema.interfaces import IVocabularyTokenized

from collective.blicca.galleryreflist.testing import INTEGRATION_TESTING


class TestVocabularyBlockStyles:
    """Test BlockStyles vocabulary."""

    layer = INTEGRATION_TESTING

    @pytest.fixture(autouse=True)
    def _setup(self, integration):
        self.portal = integration["portal"]

    def test_vocabulary_registered(self):
        """Test vocabulary factory is registered."""
        vocab_name = "collective.blicca.galleryreflist.BlockStyles"
        factory = getUtility(IVocabularyFactory, vocab_name)
        assert IVocabularyFactory.providedBy(factory)

    def test_vocabulary_tokenized(self):
        """Test vocabulary implements IVocabularyTokenized."""
        vocab_name = "collective.blicca.galleryreflist.BlockStyles"
        factory = getUtility(IVocabularyFactory, vocab_name)
        vocabulary = factory(self.portal)
        assert IVocabularyTokenized.providedBy(vocabulary)
