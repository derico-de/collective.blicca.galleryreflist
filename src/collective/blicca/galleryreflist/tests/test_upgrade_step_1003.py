"""Upgrade step 1003 removes what derico.blicca.gallerysection left behind."""

import pytest
from plone.browserlayer.utils import register_layer
from plone.browserlayer.utils import registered_layers
from plone.registry import field
from plone.registry import Record
from plone.registry.interfaces import IRegistry
from plone.browserlayer.interfaces import ILocalBrowserLayerType
from ZODB.broken import Broken
from zope.component import getSiteManager
from zope.component import getUtility


PROFILE = "collective.blicca.galleryreflist:default"
OLD_PROFILE = "derico.blicca.gallerysection:default"
OLD_LAYER = "derico.blicca.gallerysection"
OLD_RECORD = "plone.blicca.auroraeditor.blockaddons/derico.blicca.gallerysection.gallerysection.bundle"
OWN_RECORD = "plone.blicca.auroraeditor.blockaddons/collective.blicca.galleryreflist.galleryreflist.bundle"


def broken_layer():
    """A layer class of the removed package, as the ZODB loads it."""
    return type("IDericoBliccaGallerysectionLayer", (Broken,), {"__module__": f"{OLD_LAYER}.interfaces"})


class TestUpgrade1003:
    @pytest.fixture(autouse=True)
    def _setup(self, integration):
        self.registry = getUtility(IRegistry)
        self.setup = integration["portal"].portal_setup
        self.setup.setLastVersionForProfile(PROFILE, "1002")

    def _leftovers(self):
        """What a site holds once the removed package's code is gone."""
        # Each persistent record that refers to the missing class loads its
        # own broken copy: the registration and the subscription differ.
        registered, subscribed = (broken_layer() for _copy in range(2))
        register_layer(registered, OLD_LAYER)
        utilities = getSiteManager().utilities
        utilities.unsubscribe((), ILocalBrowserLayerType, registered)
        utilities.subscribe((), ILocalBrowserLayerType, subscribed)
        self.registry.records[OLD_RECORD] = Record(field.TextLine(), "gallerysection-block.js")
        self.setup.setLastVersionForProfile(OLD_PROFILE, "1000")

    def test_reaches_the_profile_version(self):
        self.setup.upgradeProfile(PROFILE)
        assert self.setup.getLastVersionForProfile(PROFILE) == ("1003",)

    def test_removes_the_old_layer_records_and_profile_version(self):
        self._leftovers()
        self.setup.upgradeProfile(PROFILE)
        assert "derico.blicca.gallerysection" not in repr(list(registered_layers()))
        assert getSiteManager().queryUtility(ILocalBrowserLayerType, name=OLD_LAYER) is None
        assert OLD_RECORD not in self.registry.records
        assert self.setup.getLastVersionForProfile(OLD_PROFILE) == "unknown"

    def test_keeps_this_packages_records(self):
        self._leftovers()
        self.setup.upgradeProfile(PROFILE)
        assert OWN_RECORD in self.registry.records
