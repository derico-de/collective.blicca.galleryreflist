"""Remove what derico.blicca.gallerysection, this package's predecessor, left behind."""

import logging

from plone.browserlayer.interfaces import ILocalBrowserLayerType
from plone.registry.interfaces import IRegistry
from zope.component import getSiteManager
from zope.component import getUtility


logger = logging.getLogger(__name__)

OLD_NAME = "derico.blicca.gallerysection"
OLD_PROFILE = f"{OLD_NAME}:default"
OLD_RECORDS = f"plone.blicca.auroraeditor.blockaddons/{OLD_NAME}."


def upgrade(context):
    """Drop its browser layer, block add-on records and profile version.

    Upgrade from profile version 1002 to 1003.
    """
    logger.info("Running upgrade step: Remove the derico.blicca.gallerysection leftovers")
    site_manager = getSiteManager()
    layer = site_manager.queryUtility(ILocalBrowserLayerType, name=OLD_NAME)
    if layer is not None:
        site_manager.unregisterUtility(layer, ILocalBrowserLayerType, name=OLD_NAME)
    records = getUtility(IRegistry).records
    for name in [name for name in records.keys() if name.startswith(OLD_RECORDS)]:
        del records[name]
    if context.getLastVersionForProfile(OLD_PROFILE) != "unknown":
        context.unsetLastVersionForProfile(OLD_PROFILE)
