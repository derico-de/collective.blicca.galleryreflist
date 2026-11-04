"""Testing setup for collective.blicca.galleryreflist."""
import os

import plone.app.theming
import plone.blicca.auroraeditor
import plone.restapi
import plone.volto
from plone.app.contenttypes.testing import PLONE_APP_CONTENTTYPES_FIXTURE
from plone.app.testing import FunctionalTesting
from plone.app.testing import IntegrationTesting
from plone.app.testing import PloneSandboxLayer
from plone.app.testing import SITE_OWNER_NAME
from plone.app.testing import SITE_OWNER_PASSWORD
from plone.testing.zope import WSGI_SERVER_FIXTURE

import collective.blicca.galleryreflist
import collective.blicca.referencelist


class CollectiveBliccaGalleryreflistLayer(PloneSandboxLayer):
    """Custom testing layer for collective.blicca.galleryreflist."""

    defaultBases = (PLONE_APP_CONTENTTYPES_FIXTURE,)

    def setUpZope(self, app, configurationContext):
        """Set up Zope."""
        # Compile .po -> .mo so add-on translations load during tests.
        os.environ.setdefault("zope_i18n_compile_mo_files", "true")
        self.loadZCML(package=plone.app.theming)
        self.loadZCML(package=plone.restapi)
        # The host editor: plone.volto's ZCML (never its profile) brings the
        # summary serializer's metadata the way z3c.autoinclude does in a site.
        self.loadZCML(package=plone.volto)
        self.loadZCML(package=plone.blicca.auroraeditor)
        self.loadZCML(package=collective.blicca.referencelist)
        self.loadZCML(package=collective.blicca.galleryreflist)

    def setUpPloneSite(self, portal):
        """Set up Plone site."""
        self.applyProfile(portal, "plone.restapi:default")
        self.applyProfile(portal, "plone.blicca.auroraeditor:default")
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
