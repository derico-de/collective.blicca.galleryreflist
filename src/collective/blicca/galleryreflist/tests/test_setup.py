"""Install and uninstall: the editor finds the block per site through its record."""

import pytest
from plone import api
from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from plone.blicca.auroraeditor import blockaddons
from plone.blicca.auroraeditor.interfaces import IAuroraBlockAddon
from plone.browserlayer import utils
from plone.registry.interfaces import IRegistry
from zope.component import getUtility

from collective.blicca.galleryreflist.interfaces import ICollectiveBliccaGalleryreflistLayer
from collective.blicca.galleryreflist.styles import RECORD as STYLES_RECORD


RECORD_NAME = "collective.blicca.galleryreflist.galleryreflist"
RESOURCE = "++plone++collective.blicca.galleryreflist"


def block_addon_records():
    registry = getUtility(IRegistry)
    return registry.collectionOfInterface(
        IAuroraBlockAddon, prefix=blockaddons.BLOCKADDON_PREFIX, check=False
    )


class TestSetup:
    @pytest.fixture(autouse=True)
    def _setup(self, integration):
        self.portal = integration["portal"]

    def test_addon_installed(self):
        installer = api.addon.get_installer(self.portal)
        assert installer.is_product_installed("collective.blicca.galleryreflist")

    def test_reference_list_comes_along(self):
        installer = api.addon.get_installer(self.portal)
        assert installer.is_product_installed("collective.blicca.referencelist")

    def test_upgrade_profiles_are_hidden_from_addons(self):
        from Products.CMFPlone.controlpanel.browser.quickinstaller import ManageProductsView

        package = "collective.blicca.galleryreflist"
        profiles = self.portal.portal_setup.listProfileInfo()
        assert any(profile["id"].startswith(f"{package}.upgrades:") for profile in profiles)
        addons = ManageProductsView(self.portal, self.portal.REQUEST).marshall_addons()
        assert package in addons
        assert f"{package}.upgrades" not in addons

    def test_browserlayer(self):
        assert ICollectiveBliccaGalleryreflistLayer in utils.registered_layers()

    def test_blockaddon_record_installed(self):
        record = block_addon_records()[RECORD_NAME]
        assert record.bundle == f"{RESOURCE}/galleryreflist-block.js"
        assert record.css == f"{RESOURCE}/galleryreflist-block.css"
        assert record.types == ["plone-collective.galleryreflist"]
        assert record.enabled

    def test_loads_after_the_reference_list(self):
        records = block_addon_records()
        reference_list = records["collective.blicca.referencelist.referencelist"]
        assert records[RECORD_NAME].weight > reference_list.weight

    def test_addon_loadable_by_the_editor(self):
        statuses = {s.name: s for s in blockaddons.evaluate(self.portal)}
        status = statuses[RECORD_NAME]
        assert status.skip_reason is None
        assert status.loadable
        assert status.bundle_url
        assert status.css_url

    def test_styles_record_installed(self):
        assert getUtility(IRegistry)[STYLES_RECORD] == [
            ("feature", "Feature"),
            ("compact", "Compact"),
        ]

    def test_uninstall_profile_is_hidden(self):
        from plone.base.interfaces import INonInstallable
        from zope.component import getAllUtilitiesRegisteredFor

        hidden = [
            name
            for utility in getAllUtilitiesRegisteredFor(INonInstallable)
            for name in getattr(utility, "getNonInstallableProfiles", list)()
        ]
        assert "collective.blicca.galleryreflist:uninstall" in hidden


class TestUninstall:
    @pytest.fixture(autouse=True)
    def _setup(self, integration):
        self.portal = integration["portal"]
        setRoles(self.portal, TEST_USER_ID, ["Manager"])
        self.installer = api.addon.get_installer(self.portal)
        self.installer.uninstall_product("collective.blicca.galleryreflist")

    def test_addon_uninstalled(self):
        assert not self.installer.is_product_installed("collective.blicca.galleryreflist")

    def test_blockaddon_record_removed(self):
        assert RECORD_NAME not in block_addon_records()

    def test_styles_record_removed(self):
        assert STYLES_RECORD not in getUtility(IRegistry).records

    def test_browserlayer_removed(self):
        assert ICollectiveBliccaGalleryreflistLayer not in utils.registered_layers()
