"""Tests for upgrade step 1000 -> 1001."""

import pytest
from plone.registry.interfaces import IRegistry
from zope.component import getUtility


PROFILE = "collective.blicca.galleryreflist:default"
BLOCK_RECORD = (
    "plone.blicca.auroraeditor.blockaddons/"
    "collective.blicca.galleryreflist.galleryreflist.bundle"
)


class TestUpgrade1001:
    @pytest.fixture(autouse=True)
    def _setup(self, integration):
        self.registry = getUtility(IRegistry)
        self.setup = integration["portal"].portal_setup
        self.setup.setLastVersionForProfile(PROFILE, "1000")

    def test_adds_the_block_record(self):
        del self.registry.records[BLOCK_RECORD]
        self.setup.upgradeProfile(PROFILE, "1001")
        assert self.setup.getLastVersionForProfile(PROFILE) == ("1001",)
        assert self.registry[BLOCK_RECORD].endswith("galleryreflist-block.js")
