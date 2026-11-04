"""GalleryReflistBlockView browser view.

Public renderer of the Gallery Reference List block
"""
from Products.Five.browser import BrowserView


class GalleryReflistBlockView(BrowserView):
    """Public renderer of the Gallery Reference List block"""

    # If you need to override the template registered in configure.zcml:
    # index = ViewPageTemplateFile("gallery_reflist_block_view.pt")

    def __call__(self):
        return self.index()
