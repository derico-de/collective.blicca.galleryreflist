"""The block styles a site registers, and the class a stored style gives."""

from plone.registry.interfaces import IRegistry
from zope.component import queryUtility

from collective.blicca.galleryreflist.interfaces import IGalleryReflistSettings


RECORD = "collective.blicca.galleryreflist.styles"


def block_styles():
    """The (id, name) pairs registered for this site."""
    default = IGalleryReflistSettings["styles"].default
    registry = queryUtility(IRegistry)
    if registry is None:
        return default
    return registry.get(RECORD, default) or []


def style_class_of(data):
    """The class of the block's style; a style the site dropped gives none."""
    style = (data or {}).get("blockStyle")
    if style in {style_id for style_id, _name in block_styles()}:
        return f"has--blockStyle--{style}"
    return ""
