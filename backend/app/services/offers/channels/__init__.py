from app.services.offers.channels.base import BaseIngestionChannel, IngestionResult
from app.services.offers.channels.html_channel import HtmlIngestionChannel
from app.services.offers.channels.pdf_channel import PdfCircularIngestionChannel
from app.services.offers.channels.partner_channel import PartnerFeedIngestionChannel
from app.services.offers.channels.document_channel import AdminDocumentIngestionChannel
from app.services.offers.channels.manual_channel import AdminManualIngestionChannel

__all__ = [
    "BaseIngestionChannel",
    "IngestionResult",
    "HtmlIngestionChannel",
    "PdfCircularIngestionChannel",
    "PartnerFeedIngestionChannel",
    "AdminDocumentIngestionChannel",
    "AdminManualIngestionChannel"
]
