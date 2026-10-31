# CLIQ — PDF Circular Document Ingestion

## Overview

Indian banking institutions and merchant aggregators frequently publish promotional credit card benefits as **official PDF circulars**, partner notices, and festive campaign booklets.

The CLIQ **Circular Document Ingestion Subsystem** (`CircularParserService`) enables administrators and ingestion pipelines to upload and automatically extract structured financial terms, discount limits, eligible cards, and verbatim evidence snippets directly from digital PDF documents.

---

## 1. Security & Upload Validation

Every uploaded PDF is validated before parsing to prevent denial-of-service, remote code execution, or storage contamination:

1. **MIME Type Validation**: Strictly enforced as `application/pdf`. Files masquerading with a `.pdf` extension but containing HTML, executable binaries, or arbitrary scripts are rejected with `HTTP 400 Bad Request`.
2. **File Size Limit**: Capped at **10 MB** (10,485,760 bytes). Oversized documents are rejected before parsing.
3. **SHA-256 Checksum & Deduplication**:
   - The entire byte stream is hashed using `hashlib.sha256()`.
   - The hash is queried against the `admin_offer_documents` table.
   - If an identical file was already processed, upload is rejected with `HTTP 409 Conflict: Document with identical SHA-256 hash has already been uploaded.`

---

## 2. Extraction Pipeline (`CircularParserService`)

The parser uses `pypdf` (v6.21.4) to parse the document tree and extract digital text and metadata:

```
[Uploaded PDF Stream]
         │
         ▼
[Security Checks: MIME, 10MB limit, SHA-256 hash]
         │
         ▼
[pypdf PdfReader: Extract Text Across Pages]
         │
         ├──> [Extracted Text Length < 20 chars?] ──> [Reject: Image-only / Scanned PDF]
         │
         ▼
[Structured Term Extractor]
  ├── Bank & Issuer Identification (HDFC, ICICI, Axis, SBI, RuPay, etc.)
  ├── Merchant & Category Mapping (Swiggy, Amazon, Flipkart, Tata Cliq, etc.)
  ├── Discount Magnitude & Type (Percentage % vs Flat ₹)
  ├── Maximum Discount Cap (₹)
  ├── Minimum Spend Threshold (₹)
  ├── Promo / Coupon Code Extraction (Case-normalized regex)
  ├── Eligible Card Variants (Millennia, Regalia, Coral, Ace, SimplyCLICK, etc.)
  └── Verbatim Evidence Snippet Capture (First 280 characters of matching sentence)
         │
         ▼
[Staged into PENDING_REVIEW Queue]
```

### Verbatim Evidence Snippet Capture
For explainability and auditor traceability, the parser locates the exact sentence or paragraph where discount rules were detected. This snippet is preserved verbatim in `source_evidence`:

```text
[EVIDENCE SNIPPET] "HDFC Bank Festive Promo: Flat 10% instant discount up to Rs 1500 on Tata Cliq on min spend Rs 600 promo code CLIQ2026"
```

---

## 3. Explicit Architectural Statement: OCR is Unsupported

### Design Decision
CLIQ **explicitly rejects scanned, rasterized image-only PDFs** and does **not** perform Optical Character Recognition (OCR) on promotional circulars.

```python
if len(extracted_text.strip()) < 20:
    return CircularParsingResult(
        success=False,
        error="Document appears to be a scanned image or empty. OCR is explicitly unsupported for image-only circulars to prevent financial hallucination.",
        ocr_supported=False,
        ...
    )
```

### Rationale: Zero Tolerance for Financial Hallucination
In consumer fintech and credit card optimization:
- Misreading a single character (e.g., misinterpreting `₹1,500` as `₹15,000`, or `10%` as `1.0%`, or a zero `0` as an `8`) directly causes financial loss or incorrect card recommendations to users.
- OCR engines (Tesseract, EasyOCR, etc.) introduce character confusion on low-resolution flyers, stylized festival fonts, and skewed mobile camera photos.
- **Architectural Policy**: Only official vector/text-encoded digital PDF circulars containing native text layers are parsed automatically. If a merchant flyer is only available as an image photo, it must be verified and entered manually by an authorized administrator through the **Manual Offer Entry** channel.
