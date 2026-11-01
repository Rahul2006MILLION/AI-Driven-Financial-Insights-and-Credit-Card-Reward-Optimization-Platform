"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import {
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingDown,
  Loader2,
  Calendar,
  FileUp,
  Upload,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Check,
  CreditCard as CardIcon,
  HelpCircle,
  FileSpreadsheet
} from "lucide-react";

export default function TransactionsPage() {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New manual transaction form
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState<number>(1000);
  const [category, setCategory] = useState("dining");
  const [cardId, setCardId] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // CSV Import Workflow states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStage, setImportStage] = useState<"SELECT" | "PREVIEW" | "SUMMARY">("SELECT");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importCardId, setImportCardId] = useState("");
  const [bankFormat, setBankFormat] = useState("AUTO");
  const [parsing, setParsing] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [committing, setCommitting] = useState(false);
  const [importSummary, setImportSummary] = useState<any>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [txData, cardsData]: any = await Promise.all([
        apiFetch("/transactions?limit=100"),
        apiFetch("/cards"),
      ]);
      setTransactions(txData || []);
      setCards(cardsData || []);
      if (cardsData && cardsData.length > 0 && !cardId) {
        setCardId(cardsData[0].id);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch("/transactions", {
        method: "POST",
        body: JSON.stringify({
          merchant_name: merchant,
          amount,
          category_id: category,
          card_id: cardId || null,
          is_recurring: isRecurring,
        }),
      });
      setShowAddModal(false);
      setMerchant("");
      setAmount(1000);
      await fetchData();
    } catch (err) {
      alert("Failed to create transaction: " + err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.transactions.deletePrompt)) return;
    try {
      await apiFetch(`/transactions/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (err) {
      alert(t.transactions.deleteFailed + ": " + err);
    }
  };

  // --- CSV Import Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportError(null);
    }
  };

  const handlePreviewUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setImportError("Please select a CSV statement file first.");
      return;
    }

    setParsing(true);
    setImportError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (importCardId) {
      formData.append("card_id", importCardId);
    }
    formData.append("bank_format", bankFormat);

    try {
      const res: any = await apiFetch("/transactions/import/preview", {
        method: "POST",
        body: formData,
      });
      setPreviewData(res);
      setPreviewRows(res.rows || []);
      setImportStage("PREVIEW");
    } catch (err: any) {
      setImportError(err.message || "Failed to analyze CSV statement.");
    } finally {
      setParsing(false);
    }
  };

  const handleToggleRowSelection = (tempId: string) => {
    setPreviewRows((prev) =>
      prev.map((r) => (r.temp_id === tempId ? { ...r, selected_for_import: !r.selected_for_import } : r))
    );
  };

  const handleRowCategoryChange = (tempId: string, newCategory: string) => {
    setPreviewRows((prev) =>
      prev.map((r) =>
        r.temp_id === tempId
          ? { ...r, category_id: newCategory, requires_category_review: false, category_confidence: 1.0 }
          : r
      )
    );
  };

  const handleCommitImport = async () => {
    const selectedRows = previewRows.filter((r) => r.selected_for_import && r.is_valid && r.duplicate_status !== "EXCLUDED");
    if (selectedRows.length === 0) {
      alert("No rows selected for import.");
      return;
    }

    setCommitting(true);
    try {
      const payload = {
        card_id: importCardId || null,
        skip_duplicates: skipDuplicates,
        rows: selectedRows.map((r) => ({
          transaction_date: r.transaction_date,
          raw_description: r.raw_description,
          merchant_name: r.merchant_name,
          amount: r.amount,
          currency: r.currency || "INR",
          category_id: r.category_id,
          category_confidence: r.category_confidence,
          reference_number: r.reference_number,
          deduplication_hash: r.deduplication_hash,
        })),
      };

      const res: any = await apiFetch("/transactions/import/commit", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setImportSummary(res);
      setImportStage("SUMMARY");
      await fetchData();
    } catch (err: any) {
      alert("Failed to commit imported transactions: " + err.message);
    } finally {
      setCommitting(false);
    }
  };

  const resetImportFlow = () => {
    setShowImportModal(false);
    setImportStage("SELECT");
    setSelectedFile(null);
    setPreviewData(null);
    setPreviewRows([]);
    setImportSummary(null);
    setImportError(null);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#040707]">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-7xl mx-auto w-full space-y-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white glow-emerald">
              {t.transactions.title}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.transactions.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Import Statement (CSV) Button */}
            <button
              onClick={() => {
                setShowImportModal(true);
                setImportStage("SELECT");
                setImportError(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 font-semibold text-xs shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>{t.transactions.importCsvButton}</span>
            </button>

            {/* Manual Add Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] font-semibold text-xs shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.transactions.addNewTransaction}</span>
            </button>
          </div>
        </div>

        {/* --- CSV Import Workflow Modal --- */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            <div className="p-6 sm:p-7 rounded-3xl bg-[#06100C]/95 border border-white/10 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col space-y-4 overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">
                    {t.transactions.importModalTitle}
                  </h3>
                </div>
                <button
                  onClick={resetImportFlow}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Stage 1: File & Format Selection */}
              {importStage === "SELECT" && (
                <form onSubmit={handlePreviewUpload} className="space-y-4 py-2">
                  {importError && (
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{importError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">
                        {t.transactions.selectCardOptional}
                      </label>
                      <select
                        value={importCardId}
                        onChange={(e) => setImportCardId(e.target.value)}
                        className="w-full bg-[#06100C] border border-white/10 rounded-2xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">{t.cards.allBanks} (Auto / Unassigned)</option>
                        {cards.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.card_name} ({c.bank_name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">
                        Statement Bank Format
                      </label>
                      <select
                        value={bankFormat}
                        onChange={(e) => setBankFormat(e.target.value)}
                        className="w-full bg-[#06100C] border border-white/10 rounded-2xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="AUTO">Auto-Detect Statement Layout (Default)</option>
                        <option value="HDFC">HDFC Bank Credit Card Statement</option>
                        <option value="ICICI">ICICI Bank Credit Card Statement</option>
                        <option value="SBI">SBI Card Statement</option>
                        <option value="AXIS">Axis Bank Credit Card Statement</option>
                        <option value="AMEX">American Express (Amex) Statement</option>
                        <option value="GENERIC">Generic / CLIQ Standard CSV</option>
                      </select>
                    </div>
                  </div>

                  {/* Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-white/15 hover:border-emerald-500/50 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {selectedFile ? selectedFile.name : t.transactions.dropCsvPrompt}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Supported: CSV exports from HDFC, ICICI, SBI, Axis, Amex & custom CSV (Max 5MB)
                      </p>
                    </div>
                    {selectedFile && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                        {(selectedFile.size / 1024).toFixed(1)} KB Selected
                      </span>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={resetImportFlow}
                      className="px-4 py-2 rounded-full bg-white/[0.05] text-slate-300 hover:text-white text-xs font-semibold"
                    >
                      {t.cards.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedFile || parsing}
                      className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#040707] text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all"
                    >
                      {parsing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{t.transactions.parsingStatement}</span>
                        </>
                      ) : (
                        <>
                          <span>Parse & Preview Statement</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Stage 2: Preview & Reconciliation */}
              {importStage === "PREVIEW" && (
                <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                  {/* Summary Metric Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[10px] text-slate-500 font-semibold block">{t.transactions.detectedBankFormat}</span>
                      <span className="text-sm font-black text-white">{previewData?.detected_format}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[10px] text-emerald-400 font-semibold block">{t.transactions.validRowsCount}</span>
                      <span className="text-sm font-black text-emerald-300">{previewData?.valid_rows_count || 0}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[10px] text-amber-400 font-semibold block">{t.transactions.ambiguousRowsCount}</span>
                      <span className="text-sm font-black text-amber-300">{previewData?.ambiguous_rows_count || 0}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-500/10 border border-slate-500/20">
                      <span className="text-[10px] text-slate-400 font-semibold block">{t.transactions.duplicateRowsCount}</span>
                      <span className="text-sm font-black text-slate-300">{previewData?.duplicate_rows_count || 0}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[10px] text-slate-500 font-semibold block">Estimated Spend</span>
                      <span className="text-sm font-black text-emerald-400">₹{Number(previewData?.total_spend_amount || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="flex-1 overflow-y-auto rounded-2xl border border-white/[0.08] bg-black/40">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-white/[0.03] text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 backdrop-blur-md border-b border-white/[0.06] z-10">
                        <tr>
                          <th className="py-2.5 px-3 text-center">Import</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Statement Line & Normalized</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 text-right">Amount</th>
                          <th className="py-2.5 px-3 text-right">Est. Reward</th>
                          <th className="py-2.5 px-3 text-center">Reconciliation Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {previewRows.map((row) => (
                          <tr key={row.temp_id} className={`hover:bg-white/[0.02] transition-colors ${!row.is_valid || row.duplicate_status === 'EXCLUDED' ? 'opacity-50' : ''}`}>
                            <td className="py-2 px-3 text-center">
                              <input
                                type="checkbox"
                                disabled={!row.is_valid || row.duplicate_status === "EXCLUDED"}
                                checked={row.selected_for_import}
                                onChange={() => handleToggleRowSelection(row.temp_id)}
                                className="rounded bg-white/[0.05] border-white/20 text-emerald-500 focus:ring-0 cursor-pointer"
                              />
                            </td>

                            <td className="py-2 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                              {new Date(row.transaction_date).toLocaleDateString()}
                            </td>

                            <td className="py-2 px-3">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{row.merchant_name}</span>
                                {row.reference_number && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-400 font-mono">
                                    #{row.reference_number}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate max-w-xs" title={row.raw_description}>
                                {row.raw_description}
                              </div>
                            </td>

                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1">
                                <select
                                  value={row.category_id}
                                  onChange={(e) => handleRowCategoryChange(row.temp_id, e.target.value)}
                                  className={`bg-[#06100C] border ${row.requires_category_review ? 'border-amber-500/50 text-amber-300' : 'border-white/10 text-slate-300'} rounded-xl px-2 py-1 text-[11px] focus:outline-none focus:border-emerald-500`}
                                >
                                  <option value="dining">{t.categories.dining}</option>
                                  <option value="food_delivery">{t.categories.food_delivery}</option>
                                  <option value="shopping">{t.categories.shopping}</option>
                                  <option value="grocery">{t.categories.grocery}</option>
                                  <option value="utility">{t.categories.utility}</option>
                                  <option value="travel">{t.categories.travel}</option>
                                  <option value="fuel">{t.categories.fuel}</option>
                                  <option value="entertainment">{t.categories.entertainment}</option>
                                  <option value="health">{t.categories.health}</option>
                                  <option value="other">{t.categories.other}</option>
                                </select>
                                {row.requires_category_review && (
                                  <span title={t.transactions.categoryReviewNeeded} className="text-amber-400">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-2 px-3 text-right font-bold text-white whitespace-nowrap">
                              ₹{Number(row.amount).toFixed(2)}
                            </td>

                            <td className="py-2 px-3 text-right font-semibold text-emerald-400 whitespace-nowrap">
                              ₹{Number(row.predicted_reward || 0).toFixed(2)}
                            </td>

                            <td className="py-2 px-3 text-center whitespace-nowrap">
                              {row.duplicate_status === "NEW" && (
                                <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                  <Check className="w-3 h-3" />
                                  <span>{t.transactions.statusNew}</span>
                                </span>
                              )}
                              {row.duplicate_status === "AMBIGUOUS_DUPLICATE" && (
                                <span title={row.duplicate_reason || ""} className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold cursor-help">
                                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                                  <span>{t.transactions.statusAmbiguous}</span>
                                </span>
                              )}
                              {row.duplicate_status === "EXACT_DUPLICATE" && (
                                <span title={row.duplicate_reason || ""} className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-white/10 font-medium cursor-help">
                                  <XCircle className="w-3 h-3 text-rose-400" />
                                  <span>{t.transactions.statusExactDuplicate}</span>
                                </span>
                              )}
                              {row.duplicate_status === "EXCLUDED" && (
                                <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                                  <span>{t.transactions.statusExcluded}</span>
                                </span>
                              )}
                              {row.duplicate_status === "INVALID" && (
                                <span title={row.error_message || ""} className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium">
                                  <span>{t.transactions.statusInvalid}</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions & Skip Checkbox */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="skip_dups"
                        checked={skipDuplicates}
                        onChange={(e) => setSkipDuplicates(e.target.checked)}
                        className="rounded bg-white/[0.05] border-white/20 text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="skip_dups" className="text-xs text-slate-400 cursor-pointer">
                        {t.transactions.skipDuplicates}
                      </label>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setImportStage("SELECT")}
                        className="px-4 py-2 rounded-full bg-white/[0.05] text-slate-300 hover:text-white text-xs font-semibold"
                      >
                        {t.transactions.backToFileSelect}
                      </button>
                      <button
                        type="button"
                        onClick={handleCommitImport}
                        disabled={committing || previewRows.filter((r) => r.selected_for_import && r.is_valid).length === 0}
                        className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#040707] text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all"
                      >
                        {committing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{t.transactions.importing}</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>
                              {t.transactions.confirmAndImport} ({previewRows.filter((r) => r.selected_for_import && r.is_valid).length})
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 3: Summary */}
              {importStage === "SUMMARY" && importSummary && (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-white glow-emerald">
                      Statement Successfully Imported
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">
                      {t.transactions.importSuccessMessage}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg text-xs py-2">
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                      <span className="text-[10px] text-slate-500 font-medium block">Imported</span>
                      <span className="text-base font-black text-emerald-400">{importSummary.imported_count}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                      <span className="text-[10px] text-slate-500 font-medium block">Duplicates Skipped</span>
                      <span className="text-base font-black text-slate-300">{importSummary.skipped_duplicates_count}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                      <span className="text-[10px] text-slate-500 font-medium block">Total Spend</span>
                      <span className="text-base font-black text-white">₹{Number(importSummary.total_spend_imported).toFixed(2)}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                      <span className="text-[10px] text-slate-500 font-medium block">Rewards Yield</span>
                      <span className="text-base font-black text-emerald-400">₹{Number(importSummary.total_rewards_predicted).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={resetImportFlow}
                      className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all"
                    >
                      Done & View Transactions
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal for manual adding transaction */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="p-6 sm:p-7 rounded-3xl bg-[#06100C]/95 border border-white/10 shadow-2xl max-w-md w-full space-y-4">
              <h3 className="text-base font-bold text-white">{t.transactions.addModalTitle}</h3>

              <form onSubmit={handleAddTransaction} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {t.transactions.merchantLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swiggy, Amazon, HPCL"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {t.transactions.amountLabel} *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {t.transactions.categoryLabel}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#06100C] border border-white/10 rounded-2xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="dining">{t.categories.dining}</option>
                    <option value="food_delivery">{t.categories.food_delivery}</option>
                    <option value="shopping">{t.categories.shopping}</option>
                    <option value="grocery">{t.categories.grocery}</option>
                    <option value="utility">{t.categories.utility}</option>
                    <option value="travel">{t.categories.travel}</option>
                    <option value="fuel">{t.categories.fuel}</option>
                    <option value="entertainment">{t.categories.entertainment}</option>
                    <option value="health">{t.categories.health}</option>
                    <option value="other">{t.categories.other}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {t.transactions.cardLabel}
                  </label>
                  <select
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    className="w-full bg-[#06100C] border border-white/10 rounded-2xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">{t.cards.allBanks}</option>
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.card_name} ({c.bank_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rec_check"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded bg-white/[0.05] border-white/20 text-emerald-500 focus:ring-0"
                  />
                  <label htmlFor="rec_check" className="text-slate-400 cursor-pointer text-xs">
                    {t.transactions.recurringLabel}
                  </label>
                </div>

                <div className="pt-3 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-full bg-white/[0.05] text-slate-300 hover:text-white"
                  >
                    {t.cards.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t.transactions.recording}</span>
                      </div>
                    ) : (
                      t.transactions.recordTransactionButton
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transactions Table in Liquid Glass Container */}
        <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/[0.02] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">{t.transactions.tableMerchant}</th>
                  <th className="py-3.5 px-5 font-semibold">{t.transactions.tableCategory}</th>
                  <th className="py-3.5 px-5 font-semibold text-right">{t.transactions.tableAmount}</th>
                  <th className="py-3.5 px-5 font-semibold text-right">{t.transactions.tableReward}</th>
                  <th className="py-3.5 px-5 font-semibold text-right">{t.optimizer.intelligenceTitle}</th>
                  <th className="py-3.5 px-5 font-semibold text-center">{t.optimizer.breakdown}</th>
                  <th className="py-3.5 px-5 text-center">{t.transactions.tableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      {t.transactions.noTransactionsFound}
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const leakage =
                      Number(tx.potential_optimal_reward) - Number(tx.reward_earned_monetary);
                    const isOptimal = leakage <= 0.01;

                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{tx.merchant_name}</span>
                            {tx.reference_number && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-400 font-mono">
                                #{tx.reference_number}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(tx.transaction_date).toLocaleDateString()}</span>
                            {tx.is_recurring && (
                              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">
                                RECURRING
                              </span>
                            )}
                            {tx.import_batch_id && (
                              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-semibold">
                                CSV IMPORT
                              </span>
                            )}
                          </div>
                          {tx.raw_description && tx.raw_description !== tx.merchant_name && (
                            <div className="text-[9px] text-slate-600 truncate max-w-xs mt-0.5" title={tx.raw_description}>
                              Line: {tx.raw_description}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-5 font-medium text-slate-300">
                          {tx.category_id}
                        </td>

                        <td className="py-3.5 px-5 text-right font-bold text-white">
                          ₹{Number(tx.amount).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-5 text-right font-bold text-emerald-400">
                          ₹{Number(tx.reward_earned_monetary).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-5 text-right font-bold text-white">
                          ₹{Number(tx.potential_optimal_reward).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-5 text-center">
                          {isOptimal ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{t.dashboard.optimalRecommendation}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                              <TrendingDown className="w-3 h-3" />
                              <span>-₹{leakage.toFixed(2)} {t.analytics.leakage}</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-center">
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1 rounded-full text-slate-500 hover:text-rose-400 hover:bg-white/[0.05] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
