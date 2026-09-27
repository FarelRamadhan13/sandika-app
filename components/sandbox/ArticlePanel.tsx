"use client";

import { useState, useCallback, useEffect } from "react";
import type { Article, FallacyAnnotation } from "@/lib/types";
import { FALLACY_TYPES } from "@/lib/fallacies";
import { Newspaper, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface ArticlePanelProps {
  article: Article;
  onTextSelect: (text: string, paragraphId: string) => void;
  highlights: {
    paragraphId: string;
    text: string;
    classifiedAs: string;
    isCorrect: boolean | null;
  }[];
}

export default function ArticlePanel({
  article,
  onTextSelect,
  highlights,
}: ArticlePanelProps) {
  const [selectedText, setSelectedText] = useState("");
  const [showFallacyPicker, setShowFallacyPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });
  const [activeParagraphId, setActiveParagraphId] = useState("");

  // Lock body scroll when fallacy picker popup is open
  useEffect(() => {
    if (showFallacyPicker) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showFallacyPicker]);

  const handleSelection = useCallback(
    (paragraphId: string) => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 5) {
        setSelectedText(text);
        setActiveParagraphId(paragraphId);

        // Get position for desktop popup
        try {
          const range = selection?.getRangeAt(0);
          if (range) {
            const rect = range.getBoundingClientRect();
            setPickerPosition({
              x: rect.left + rect.width / 2,
              y: rect.top - 10,
            });
          }
        } catch {
          setPickerPosition({ x: typeof window !== "undefined" ? window.innerWidth / 2 : 200, y: 200 });
        }
        setShowFallacyPicker(true);
      }
    },
    []
  );

  const handleClassify = (fallacyId: string) => {
    if (selectedText && activeParagraphId) {
      onTextSelect(selectedText, activeParagraphId);
      // Dispatch custom event with classification
      window.dispatchEvent(
        new CustomEvent("sandika:classify", {
          detail: {
            text: selectedText,
            paragraphId: activeParagraphId,
            fallacyId,
          },
        })
      );
    }
    setShowFallacyPicker(false);
    setSelectedText("");
    window.getSelection()?.removeAllRanges();
  };

  const closePicker = () => {
    setShowFallacyPicker(false);
    setSelectedText("");
  };

  const getHighlightForText = (paragraphId: string) => {
    return highlights.filter((h) => h.paragraphId === paragraphId);
  };

  return (
    <div className="article-panel rounded-2xl p-4 sm:p-6 h-full overflow-y-auto relative">
      {/* Article header */}
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium text-red-400">
              Artikel Fiktif untuk Investigasi
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-surface-200/50 mb-2 sm:mb-3">
          <Newspaper className="w-3 h-3 shrink-0" />
          <span className="font-medium text-surface-200/70">{article.source}</span>
          <span>•</span>
          <span>{article.author}</span>
          <span>•</span>
          <span>{article.date}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-surface-50 leading-tight mb-2">
          {article.headline}
        </h2>

        <p className="text-[11px] sm:text-xs text-surface-200/40 italic">
          {article.imageCaption}
        </p>
      </div>

      {/* Article body */}
      <div className="space-y-4">
        {article.paragraphs.map((paragraph) => {
          const paragraphHighlights = getHighlightForText(paragraph.id);

          return (
            <div key={paragraph.id} className="relative group">
              <p
                onMouseUp={() => handleSelection(paragraph.id)}
                onTouchEnd={() => {
                  setTimeout(() => handleSelection(paragraph.id), 250);
                }}
                className="text-surface-200/80 leading-relaxed text-sm sm:text-[15px] cursor-text selection:bg-primary-500/30 selection:text-primary-100"
              >
                {paragraph.text}
              </p>

              {/* Show highlight indicators */}
              {paragraphHighlights.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {paragraphHighlights.map((h, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium ${
                        h.isCorrect === true
                          ? "bg-green-500/15 text-green-400 border border-green-500/20"
                          : h.isCorrect === false
                          ? "bg-red-500/15 text-red-400 border border-red-500/20"
                          : "bg-primary-500/15 text-primary-400 border border-primary-500/20"
                      }`}
                    >
                      {h.isCorrect === true ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : h.isCorrect === false ? (
                        <XCircle className="w-3 h-3" />
                      ) : null}
                      {h.classifiedAs}
                    </span>
                  ))}
                </div>
              )}

              {/* Paragraph number indicator */}
              <div className="hidden sm:block absolute -left-6 top-1 text-xs text-surface-200/20 font-mono">
                {paragraph.id.replace("p", "¶")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint text */}
      <div className="mt-6 sm:mt-8 p-3.5 sm:p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
        <p className="text-xs text-primary-300/80 leading-relaxed">
          💡 <strong>Petunjuk:</strong> Sorot (blok) kalimat yang mencurigakan pada
          artikel di atas, lalu tentukan jenis falasi logikanya.
        </p>
      </div>

      {/* Fallacy picker popup */}
      {showFallacyPicker && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={closePicker} />

          {/* Desktop popover */}
          <div
            className="hidden sm:block fixed z-50 tooltip-popup p-4 w-72 max-h-80 overflow-y-auto"
            style={{
              left: Math.max(16, Math.min(pickerPosition.x - 144, window.innerWidth - 300)),
              top: Math.max(pickerPosition.y - 320, 10),
            }}
          >
            <p className="text-xs text-surface-200/60 mb-3">
              Klasifikasikan teks yang dipilih:
            </p>
            <div className="text-xs text-primary-300 mb-3 p-2 rounded-lg bg-primary-500/10 max-h-24 overflow-y-auto">
              &quot;{selectedText}&quot;
            </div>
            <div className="space-y-1.5">
              {FALLACY_TYPES.map((fallacy) => (
                <button
                  key={fallacy.id}
                  onClick={() => handleClassify(fallacy.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-500/10 transition-colors text-left"
                >
                  <span className="text-lg">{fallacy.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-surface-200">
                      {fallacy.name}
                    </p>
                    <p className="text-[10px] text-surface-200/40">
                      {fallacy.nameEn}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Bottom Sheet Drawer */}
          <div className="sm:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-surface-900 border-t border-primary-500/30 p-4 max-h-[80vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom">
            <div className="w-10 h-1 rounded-full bg-surface-700 mx-auto mb-3" />
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-surface-100">
                Pilih Falasi Logika Terdeteksi:
              </p>
              <button
                onClick={closePicker}
                className="text-xs text-surface-400 hover:text-surface-200 p-1"
              >
                ✕ Batal
              </button>
            </div>
            <div className="text-xs text-primary-300 mb-3 p-2.5 rounded-xl bg-primary-500/10 border border-primary-500/20 max-h-28 overflow-y-auto">
              &quot;{selectedText}&quot;
            </div>
            <div className="space-y-2">
              {FALLACY_TYPES.map((fallacy) => (
                <button
                  key={fallacy.id}
                  onClick={() => handleClassify(fallacy.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-800/80 border border-surface-700/60 hover:border-primary-500/40 active:bg-primary-500/20 transition-colors text-left"
                >
                  <span className="text-2xl">{fallacy.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-surface-100">
                      {fallacy.name}
                    </p>
                    <p className="text-[11px] text-surface-200/60 line-clamp-1">
                      {fallacy.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
