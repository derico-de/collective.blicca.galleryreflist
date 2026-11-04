"""BlockStyles vocabulary.

The block styles registered for this site
"""
from zope.interface import implementer
from zope.schema.interfaces import IVocabularyFactory
from zope.schema.vocabulary import SimpleTerm
from zope.schema.vocabulary import SimpleVocabulary

from collective.blicca.galleryreflist.i18n import _


class VocabItem:
    """Lightweight holder for a (token, value) pair."""

    def __init__(self, token, value):
        self.token = token
        self.value = value


@implementer(IVocabularyFactory)
class BlockStyles:
    """Factory for the ``collective.blicca.galleryreflist.BlockStyles`` vocabulary.

    Replace the hardcoded ``items`` list with whatever source your vocabulary
    needs (portal catalog query, external service, registry, etc.).
    """

    def __call__(self, context):
        items = [
            VocabItem("example-token", _("Example value")),
        ]
        terms = [
            SimpleTerm(value=item.token, token=item.token, title=item.value)
            for item in items
        ]
        return SimpleVocabulary(terms)


BlockStylesFactory = BlockStyles()
