"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import {
  FileUp,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function DocumentProcessingPage() {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editable staged card state
  const [cardName, setCardName] = useState("");
  const [bankName, setBankName] = useState("");
  const [network, setNetwork] = useState("VISA");
  const [annualFee, setAnnualFee] = useState<number>(0);
  const [stagedRules, setStagedRules] = useState<any[]>([]);

  const fetchDocuments = async () => {
    try {
      const data: any = await apiFetch("/documents");
      setDocuments(data || []);
      if (data && data.length > 0 && !selectedDoc) {
        selectDocument(data[0]);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const selectDocument = (doc: any) => {
    setSelectedDoc(doc);
    if (doc.extracted_data) {
      setCardName(doc.extracted_data.extracted_card_name || "New Card");
      setBankName(doc.extracted_data.extracted_bank_name || "Bank");
      setNetwork(doc.extracted_data.extracted_network || "VISA");
      setAnnualFee(Number(doc.extracted_data.extracted_annual_fee || 0));
      setStagedRules(doc.extracted_data.rules || []);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF documents (.pdf) are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const newDoc: any = await apiFetch("/documents/upload", {
        method: "POST",
        body: formData,
      });

      setSuccessMsg(`Document '${file.name}' uploaded and intelligence rules extracted.`);
      await fetchDocuments();
      selectDocument(newDoc);
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedDoc) return;
    setVerifying(true);
    setError(null);

    try {
      await apiFetch(`/documents/${selectedDoc.id}/verify`, {
        method: "POST",
        body: JSON.stringify({
          card_name: cardName,
          bank_name: bankName,
          network,
          annual_fee: annualFee,
          rules: stagedRules,
          benefits: selectedDoc.extracted_data?.benefits || [],
        }),
      });

      setSuccessMsg(`Card '${cardName}' successfully verified and activated into your portfolio!`);
      await fetchDocuments();
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.documents.title}
          </h1>
          <p className="text-xs text-cliq-textSecondary mt-1">
            {t.documents.subtitle}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-cliq-danger/10 border border-cliq-danger/30 text-cliq-danger text-xs">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-cliq-emerald/10 border border-cliq-emerald/30 text-cliq-emerald text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Upload Dropzone */}
        <div className="glass-panel p-8 rounded-2xl border-dashed border-2 border-cliq-cyan/40 hover:border-cliq-cyan text-center transition-all">
          <FileUp className="w-10 h-10 text-cliq-cyan mx-auto mb-3 animate-pulse" />
          <h3 className="text-sm font-bold text-white">{t.documents.dragDrop}</h3>
          <p className="text-xs text-cliq-textSecondary mt-1">
            Supports Credit Card Statements, Schedule of Charges, and Terms & Conditions PDFs.
          </p>

          <label className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-xs shadow-neonCyan hover:opacity-95 cursor-pointer">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting Intelligence...</span>
              </>
            ) : (
              <>
                <span>{t.documents.uploadButton}</span>
              </>
            )}
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Uploaded Documents List */}
          <div className="glass-panel p-5 rounded-2xl border-cliq-border space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Uploaded Documents ({documents.length})
            </h3>

            <div className="space-y-2">
              {documents.length === 0 ? (
                <div className="text-xs text-cliq-textMuted py-4 text-center">
                  No documents uploaded yet.
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => selectDocument(doc)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedDoc?.id === doc.id
                        ? "bg-cliq-cyan/15 border-cliq-cyan text-white shadow-sm"
                        : "bg-cliq-surface border-cliq-border text-cliq-textSecondary hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate max-w-[160px]">{doc.filename}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          doc.processing_status === "VERIFIED"
                            ? "bg-cliq-emerald/20 text-cliq-emerald"
                            : "bg-cliq-cyan/20 text-cliq-cyan"
                        }`}
                      >
                        {doc.processing_status}
                      </span>
                    </div>
                    <div className="text-[10px] text-cliq-textMuted mt-1">
                      {(doc.file_size_bytes / 1024).toFixed(0)} KB •{" "}
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Staged Extracted Rules & Human Verification Gate */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-glow-cyan/50 space-y-5">
            <div className="flex items-center justify-between border-b border-cliq-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cliq-cyan" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Human-in-the-Loop Verification
                </h3>
              </div>
              {selectedDoc?.extracted_data?.is_verified && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cliq-emerald/15 text-cliq-emerald border border-cliq-emerald/30 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.documents.verified}</span>
                </span>
              )}
            </div>

            {selectedDoc ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-cliq-textSecondary font-semibold mb-1">
                      Detected Card Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-cliq-surface border border-cliq-border rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-cliq-textSecondary font-semibold mb-1">
                      Bank / Issuer
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-cliq-surface border border-cliq-border rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-cliq-textSecondary font-semibold mb-1">
                      Network
                    </label>
                    <select
                      value={network}
                      onChange={(e) => setNetwork(e.target.value)}
                      className="w-full bg-cliq-surface border border-cliq-border rounded-xl px-3 py-2 text-white"
                    >
                      <option value="VISA">VISA</option>
                      <option value="MASTERCARD">Mastercard</option>
                      <option value="AMEX">American Express</option>
                      <option value="RUPAY">RuPay</option>
                      <option value="DINERS">Diners Club</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-cliq-textSecondary font-semibold mb-1">
                      Annual Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={annualFee}
                      onChange={(e) => setAnnualFee(Number(e.target.value))}
                      className="w-full bg-cliq-surface border border-cliq-border rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                </div>

                {/* Staged Rules Table */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                    {t.documents.stagedRules}
                  </span>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {stagedRules.length === 0 ? (
                      <div className="text-xs text-cliq-textMuted py-4 text-center">
                        No rules extracted. Add custom rules or verify manually.
                      </div>
                    ) : (
                      stagedRules.map((r: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-cliq-surface border border-cliq-border flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white">
                              {r.category_id} {r.merchant_pattern ? `(${r.merchant_pattern})` : ""}
                            </span>
                            <div className="text-[10px] text-cliq-textMuted">
                              {r.is_excluded ? "EXCLUDED FROM EARNING" : `${r.reward_rate_percentage}% ${r.reward_type}`}
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                r.is_excluded
                                  ? "bg-cliq-danger/20 text-cliq-danger"
                                  : "bg-cliq-emerald/20 text-cliq-emerald"
                              }`}
                            >
                              {r.is_excluded ? "Exclusion" : `${r.reward_rate_percentage}%`}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Human Verification Action Button */}
                <div className="pt-4 border-t border-cliq-border flex items-center justify-between">
                  <span className="text-[11px] text-cliq-textSecondary">
                    AI confidence:{" "}
                    <strong className="text-cliq-cyan">
                      {((selectedDoc.extracted_data?.confidence_score || 0.85) * 100).toFixed(0)}%
                    </strong>
                  </span>

                  <button
                    onClick={handleVerify}
                    disabled={verifying || selectedDoc.extracted_data?.is_verified}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-xs shadow-neonCyan hover:opacity-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {verifying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t.documents.verifyButton}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-cliq-textMuted">
                Select an uploaded document on the left to review and verify extracted rules.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
