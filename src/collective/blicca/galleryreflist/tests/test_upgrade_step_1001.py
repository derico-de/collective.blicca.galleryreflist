"""Tests for upgrade step 1000 -> 1001."""

import pytest
from plone.registry.interfaces import IRegistry
from zope.component import getUtility

from collective.blicca.galleryreflist.styles import RECORD


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

    def test_reaches_the_profile_version(self):
        self.setup.upgradeProfile(PROFILE)
        assert self.setup.getLastVersionForProfile(PROFILE) == ("1001",)

    def test_adds_the_missing_records(self):
        del self.registry.records[RECORD]
        del self.registry.records[BLOCK_RECORD]
        self.setup.upgradeProfile(PROFILE)
        assert self.registry[RECORD] == [("feature", "Feature"), ("compact", "Compact")]
        assert self.registry[BLOCK_RECORD].endswith("galleryreflist-block.js")

    @pytest.mark.parametrize("styles", [[("forest", "Forest")], []])
    def test_keeps_the_styles_a_site_registered(self, styles):
        self.registry[RECORD] = styles
        self.setup.upgradeProfile(PROFILE)
        assert self.registry[RECORD] == styles
