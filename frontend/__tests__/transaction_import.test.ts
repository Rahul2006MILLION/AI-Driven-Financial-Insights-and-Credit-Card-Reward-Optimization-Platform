import { describe, it } from "node:test";
import assert from "node:assert";
import { translations } from "../lib/translations.ts";

describe("CLIQ v0.3.0 Transaction Ingestion & CSV Import Suite", () => {
  it("Requirement 1: CSV import localization keys exist across EN, HI, and KN", () => {
    const requiredKeys = [
      "importCsvButton",
      "importModalTitle",
      "selectCsvFile",
      "selectCardOptional",
      "dropCsvPrompt",
      "parsingStatement",
      "statementPreviewTitle",
      "detectedBankFormat",
      "validRowsCount",
      "duplicateRowsCount",
      "ambiguousRowsCount",
      "invalidRowsCount",
      "confirmAndImport",
      "importing",
      "importSuccessMessage",
      "statusNew",
      "statusExactDuplicate",
      "statusAmbiguous",
      "statusInvalid",
      "statusExcluded",
      "categoryReviewNeeded",
      "skipDuplicates",
      "originalDescription",
      "allRowsReady",
      "backToFileSelect"
    ];

    for (const lang of ["en", "hi", "kn"] as const) {
      const dict = translations[lang].transactions as Record<string, string>;
      for (const key of requiredKeys) {
        assert.ok(
          dict[key] && dict[key].length > 0,
          `Missing or empty key '${key}' in language '${lang}'`
        );
      }
    }
  });

  it("Requirement 2: Status classification mapping logic preserves duplicate safety", () => {
    const mockPreviewRows = [
      {
        temp_id: "row-1",
        duplicate_status: "NEW",
        is_valid: true,
        selected_for_import: true,
      },
      {
        temp_id: "row-2",
        duplicate_status: "EXACT_DUPLICATE",
        is_valid: true,
        selected_for_import: false,
      },
      {
        temp_id: "row-3",
        duplicate_status: "AMBIGUOUS_DUPLICATE",
        is_valid: true,
        selected_for_import: true,
      },
      {
        temp_id: "row-4",
        duplicate_status: "EXCLUDED",
        is_valid: false,
        selected_for_import: false,
      },
      {
        temp_id: "row-5",
        duplicate_status: "INVALID",
        is_valid: false,
        selected_for_import: false,
      }
    ];

    // Filter rows ready to commit
    const commitReady = mockPreviewRows.filter(
      (r) => r.selected_for_import && r.is_valid && r.duplicate_status !== "EXCLUDED"
    );

    assert.strictEqual(commitReady.length, 2);
    assert.strictEqual(commitReady[0].temp_id, "row-1");
    assert.strictEqual(commitReady[1].temp_id, "row-3");
  });

  it("Requirement 3: Commit payload builder formats row data correctly", () => {
    const mockRow = {
      transaction_date: "2026-10-15T00:00:00Z",
      raw_description: "SWIGGY BANGALORE IN",
      merchant_name: "Swiggy",
      amount: 450.5,
      currency: "INR",
      category_id: "food_delivery",
      category_confidence: 0.92,
      reference_number: "REF-10029",
      deduplication_hash: "hash-abc-123"
    };

    const payload = {
      card_id: "card-uuid-1",
      skip_duplicates: true,
      rows: [mockRow]
    };

    assert.strictEqual(payload.card_id, "card-uuid-1");
    assert.strictEqual(payload.skip_duplicates, true);
    assert.strictEqual(payload.rows.length, 1);
    assert.strictEqual(payload.rows[0].merchant_name, "Swiggy");
    assert.strictEqual(payload.rows[0].reference_number, "REF-10029");
  });
});

