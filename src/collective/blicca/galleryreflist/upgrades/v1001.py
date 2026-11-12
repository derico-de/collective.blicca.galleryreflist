"""Register the block."""

import logging


logger = logging.getLogger(__name__)

UPGRADE_PROFILE = "profile-collective.blicca.galleryreflist.upgrades:1001"


def upgrade(context):
    """Add the block add-on record.

    Upgrade from profile version 1000 to 1001.
    """
    logger.info("Running upgrade step: Register the block")
    context.runImportStepFromProfile(UPGRADE_PROFILE, "plone.app.registry")
