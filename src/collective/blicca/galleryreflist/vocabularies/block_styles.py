"""The block styles registered for this site, read by the editor's sidebar."""

from zope.interface import implementer
from zope.schema.interfaces import IVocabularyFactory
from zope.schema.vocabulary import SimpleTerm
from zope.schema.vocabulary import SimpleVocabulary

from collective.blicca.galleryreflist.styles import block_styles


@implementer(IVocabularyFactory)
class BlockStyles:
    def __call__(self, context):
        return SimpleVocabulary([
            SimpleTerm(value=style_id, token=style_id, title=name)
            for style_id, name in block_styles()
        ])


BlockStylesFactory = BlockStyles()
