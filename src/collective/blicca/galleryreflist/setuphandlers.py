"""Setup handlers for collective.blicca.galleryreflist."""
from plone.base.interfaces import INonInstallable
from zope.interface import implementer


@implementer(INonInstallable)
class HiddenProfiles:
    """Hidden profiles from the Plone add-ons control panel."""

    def getNonInstallableProducts(self):
        """Keep upgrade profiles out of the add-ons control panel."""
        return ["collective.blicca.galleryreflist.upgrades"]

    def getNonInstallableProfiles(self):
        """Return list of profiles that should not be available for install."""
        return [
            "collective.blicca.galleryreflist:uninstall",
        ]


def uninstall(context):
    """Uninstall script."""
    # Do something on uninstall if needed
    pass
