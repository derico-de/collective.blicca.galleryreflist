"""Module where all interfaces, events and exceptions live."""

from zope import schema
from zope.interface import Interface
from zope.publisher.interfaces.browser import IDefaultBrowserLayer


class ICollectiveBliccaGalleryreflistLayer(IDefaultBrowserLayer):
    """Marker interface that defines a browser layer."""


class IGalleryReflistSettings(Interface):
    """Site settings of the Gallery Reference List block."""

    styles = schema.List(
        title="Block styles",
        description=(
            "The (id, name) pairs the block offers. One list: registering it "
            "replaces every entry. None is always offered. A theme styles an id "
            "through the class has--blockStyle--<id>."
        ),
        value_type=schema.Tuple(value_type=schema.TextLine(), min_length=2, max_length=2),
        default=[("feature", "Feature"), ("compact", "Compact")],
        required=False,
    )
