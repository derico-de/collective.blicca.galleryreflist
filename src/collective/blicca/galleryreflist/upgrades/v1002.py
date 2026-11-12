"""Use the editor's block styles."""

import logging

from plone.registry.interfaces import IRegistry
from zope.component import getUtility


logger = logging.getLogger(__name__)

UPGRADE_PROFILE = "profile-collective.blicca.galleryreflist.upgrades:1002"
OLD_RECORD = "collective.blicca.galleryreflist.styles"
STYLES_RECORD = "plone.blicca.auroraeditor.block_styles"
DEFAULT_STYLES = [("feature", "Feature"), ("compact", "Compact")]


def upgrade(context):
    """Move this package's styles into the editor's ``block_styles`` record.

    Upgrade from profile version 1001 to 1002.
    """
    logger.info("Running upgrade step: Use the editor's block styles")
    registry = getUtility(IRegistry)
    old = registry.records.get(OLD_RECORD)
    styles = DEFAULT_STYLES if old is None else list(old.value or [])
    context.runImportStepFromProfile(UPGRADE_PROFILE, "plone.app.registry")
    current = list(registry[STYLES_RECORD] or [])
    known = {style_id for style_id, _name in current}
    registry[STYLES_RECORD] = current + [style for style in styles if style[0] not in known]
    if old is not None:
        del registry.records[OLD_RECORD]
