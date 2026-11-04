"""Testing setup for collective.blicca.galleryreflist."""
import os

import plone.app.theming
import plone.restapi
from plone.app.testing import FunctionalTesting
from plone.app.testing import IntegrationTesting
from plone.app.testing import PloneSandboxLayer
from plone.app.testing import SITE_OWNER_NAME
from plone.app.testing import SITE_OWNER_PASSWORD
from plone.testing.zope import WSGI_SERVER_FIXTURE

import collective.blicca.galleryreflist


class CollectiveBliccaGalleryreflistLayer(PloneSandboxLayer):
    """Custom testing layer for collective.blicca.galleryreflist."""

    def setUpZope(self, app, configurationContext):
        """Set up Zope."""
        # Compile .po -> .mo so add-on translations load during tests.
        os.environ.setdefault("zope_i18n_compile_mo_files", "true")
        self.loadZCML(package=plone.app.theming)
        self.loadZCML(package=plone.restapi)
        self.loadZCML(package=collective.blicca.galleryreflist)

    def setUpPloneSite(self, portal):
        """Set up Plone site."""
        self.applyProfile(portal, "collective.blicca.galleryreflist:default")


FIXTURE = CollectiveBliccaGalleryreflistLayer()

INTEGRATION_TESTING = IntegrationTesting(
    bases=(FIXTURE,),
    name="CollectiveBliccaGalleryreflistLayer:IntegrationTesting",
)

FUNCTIONAL_TESTING = FunctionalTesting(
    bases=(FIXTURE,),
    name="CollectiveBliccaGalleryreflistLayer:FunctionalTesting",
)

ACCEPTANCE_TESTING = FunctionalTesting(
    bases=(FIXTURE, WSGI_SERVER_FIXTURE),
    name="CollectiveBliccaGalleryreflistLayer:AcceptanceTesting",
)


# Test credentials
TEST_USER_ID = "testuser"
TEST_USER_NAME = "testuser"
SITE_OWNER_NAME = SITE_OWNER_NAME
SITE_OWNER_PASSWORD = SITE_OWNER_PASSWORD
