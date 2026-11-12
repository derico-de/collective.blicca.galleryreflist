"""Upgrade step 1002 moves the styles into the editor's block_styles record."""

import pytest
from plone.registry import field
from plone.registry import Record
from plone.registry.interfaces import IRegistry
from zope.component import getUtility


PROFILE = "collective.blicca.galleryreflist:default"
OLD_RECORD = "collective.blicca.galleryreflist.styles"
STYLES_RECORD = "plone.blicca.auroraeditor.block_styles"


def pairs():
    return field.List(
        value_type=field.Tuple(value_type=field.TextLine(), min_length=2, max_length=2)
    )


class TestUpgrade1002:
    @pytest.fixture(autouse=True)
    def _setup(self, integration):
        self.registry = getUtility(IRegistry)
        self.setup = integration["portal"].portal_setup
        self.setup.setLastVersionForProfile(PROFILE, "1001")
        self.registry[STYLES_RECORD] = []

    def _old(self, styles):
        """What a 1001 site holds: this package's own record."""
        self.registry.records[OLD_RECORD] = Record(pairs(), styles)

    def test_reaches_the_profile_version(self):
        self.setup.upgradeProfile(PROFILE)
        assert self.setup.getLastVersionForProfile(PROFILE) == ("1002",)

    def test_moves_the_site_styles_and_drops_the_old_record(self):
        self._old([("forest", "Forest"), ("feature", "Feature")])
        self.setup.upgradeProfile(PROFILE)
        assert self.registry[STYLES_RECORD] == [("forest", "Forest"), ("feature", "Feature")]
        assert OLD_RECORD not in self.registry.records

    def test_keeps_the_editor_styles_first(self):
        self.registry[STYLES_RECORD] = [("quiet", "Quiet"), ("feature", "Hervorgehoben")]
        self._old([("feature", "Feature"), ("compact", "Compact")])
        self.setup.upgradeProfile(PROFILE)
        assert self.registry[STYLES_RECORD] == [
            ("quiet", "Quiet"),
            ("feature", "Hervorgehoben"),
            ("compact", "Compact"),
        ]

    def test_an_emptied_list_stays_empty(self):
        self._old([])
        self.setup.upgradeProfile(PROFILE)
        assert self.registry[STYLES_RECORD] == []

    def test_creates_the_editor_record_where_missing(self):
        del self.registry.records[STYLES_RECORD]
        self._old([("feature", "Feature")])
        self.setup.upgradeProfile(PROFILE)
        assert self.registry[STYLES_RECORD] == [("feature", "Feature")]
