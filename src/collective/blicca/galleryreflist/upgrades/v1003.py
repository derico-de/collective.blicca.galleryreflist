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


def drop_layer(site_manager):
    # The layer loads as a broken class, a separate copy per persistent
    # record, so match it by name, not by identity.
    site_manager.unregisterUtility(provided=ILocalBrowserLayerType, name=OLD_NAME)
    utilities = site_manager.utilities
    for layer in utilities.subscriptions((), ILocalBrowserLayerType):
        if layer.__module__.startswith(f"{OLD_NAME}."):
            utilities.unsubscribe((), ILocalBrowserLayerType, layer)


def upgrade(context):
    """Drop its browser layer, block add-on records and profile version.

    Upgrade from profile version 1002 to 1003.
    """
    logger.info("Running upgrade step: Remove the derico.blicca.gallerysection leftovers")
    drop_layer(getSiteManager())
    records = getUtility(IRegistry).records
    for name in [name for name in records.keys() if name.startswith(OLD_RECORDS)]:
        del records[name]
    if context.getLastVersionForProfile(OLD_PROFILE) != "unknown":
        context.unsetLastVersionForProfile(OLD_PROFILE)
