"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import NumericInput from "@/components/NumericInput";
import {
  FileUp,
  CheckCircle2,
  Loader2,
  ShieldCheck,
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
  const [annualFee, setAnnualFee] = useState<string | number>("");
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
      setAnnualFee(
        doc.extracted_data.extracted_annual_fee !== undefined
          ? String(doc.extracted_data.extracted_annual_fee)
          : ""
      );
      setStagedRules(doc.extracted_data.rules || []);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError(t.documents.pdfOnlyError);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(t.documents.fileSizeError);
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

      setSuccessMsg(`Document '${file.name}' processed successfully.`);
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
      const parsedAnnualFee = annualFee === "" ? 0 : Number(annualFee);
      await apiFetch(`/documents/${selectedDoc.id}/verify`, {
        method: "POST",
        body: JSON.stringify({
          card_name: cardName,
          bank_name: bankName,
          network,
          annual_fee: parsedAnnualFee,
          rules: stagedRules,
          benefits: selectedDoc.extracted_data?.benefits || [],
        }),
      });

      setSuccessMsg(`Card '${cardName}' verified and added to active portfolio.`);
      await fetchDocuments();
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#0E1013]">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-7xl mx-auto w-full space-y-7">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            {t.documents.title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.documents.subtitle}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Upload Dropzone */}
        <div className="p-8 rounded-3xl border-dashed border-2 border-emerald-500/30 hover:border-emerald-500/60 bg-white/[0.02] backdrop-blur-2xl text-center transition-all">
          <FileUp className="w-8 h-8 text-emerald-400 mx-auto mb-2.5 animate-pulse" />
          <h3 className="text-sm font-bold text-white">{t.documents.dragDrop}</h3>
          <p className="text-xs text-slate-400 mt-1">
            Max 10MB • Extracts reward tiers, caps, annual fees, and exclusions into staging
          </p>

          <label className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-lime-400 hover:bg-lime-300 text-[#0E1013] font-bold text-xs shadow-neonLime cursor-pointer transition-all">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.documents.uploading}</span>
              </>
            ) : (
              <span>{t.documents.uploadButton}</span>
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
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.documents.uploadedDocumentsList} ({documents.length})
            </h3>

            <div className="space-y-2">
              {documents.length === 0 ? (
                <div className="text-xs text-slate-500 py-6 text-center">
                  No documents in queue.
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => selectDocument(doc)}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                      selectedDoc?.id === doc.id
                        ? "bg-emerald-500/15 border-emerald-500/40 text-white shadow-sm"
                        : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate max-w-[150px]">{doc.filename}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          doc.processing_status === "VERIFIED"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {doc.processing_status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {(doc.file_size_bytes / 1024).toFixed(0)} KB •{" "}
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Staged Extracted Rules & Human Verification Gate */}
          <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {t.documents.extractedSpecTitle}
                </h3>
              </div>
              {selectedDoc?.extracted_data?.is_verified && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.documents.verified}</span>
                </span>
              )}
            </div>

            {selectedDoc ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {t.cardSelection.nicknameLabel}
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {t.cards.allBanks}
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {t.cardSelection.networkLabel}
                    </label>
                    <select
                      value={network}
                      onChange={(e) => setNetwork(e.target.value)}
                      className="w-full bg-[#17191E] border border-white/10 rounded-2xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="VISA">VISA</option>
                      <option value="MASTERCARD">Mastercard</option>
                      <option value="AMEX">American Express</option>
                      <option value="RUPAY">RuPay</option>
                      <option value="DINERS">Diners Club</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {t.cardSelection.annualFeeLabel} (₹)
                    </label>
                    <NumericInput
                      allowDecimal
                      value={annualFee}
                      onChange={(val) => setAnnualFee(val)}
                      placeholder="0"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
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
                      <div className="text-xs text-slate-500 py-4 text-center">
                        No rules extracted.
                      </div>
                    ) : (
                      stagedRules.map((r: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white">
                              {r.category_id} {r.merchant_pattern ? `(${r.merchant_pattern})` : ""}
                            </span>
                            <div className="text-[10px] text-slate-500">
                              {r.is_excluded ? "EXCLUDED" : `${r.reward_rate_percentage}% ${r.reward_type}`}
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                r.is_excluded
                                  ? "bg-rose-500/20 text-rose-300"
                                  : "bg-emerald-500/20 text-emerald-400"
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
                <div className="pt-4 border-t border-white/[0.07] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Confidence:{" "}
                    <strong className="text-emerald-400">
                      {((selectedDoc.extracted_data?.confidence_score || 0.85) * 100).toFixed(0)}%
                    </strong>
                  </span>

                  <button
                    onClick={handleVerify}
                    disabled={verifying || selectedDoc.extracted_data?.is_verified}
                    className="px-6 py-2.5 rounded-full bg-lime-400 hover:bg-lime-300 text-[#0E1013] font-bold text-xs shadow-neonLime transition-all disabled:opacity-40 flex items-center gap-2"
                  >
                    {verifying ? (
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t.documents.verifying}</span>
                      </div>
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
              <div className="text-center py-12 text-xs text-slate-500">
                Select a document to inspect staged rules.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
