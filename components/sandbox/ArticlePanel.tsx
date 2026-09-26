"use client";

import { useState, useCallback } from "react";
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

  const handleMouseUp = useCallback(
    (paragraphId: string) => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 10) {
        setSelectedText(text);
        setActiveParagraphId(paragraphId);

        // Get position for popup
        const range = selection?.getRangeAt(0);
        if (range) {
          const rect = range.getBoundingClientRect();
          setPickerPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          });
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
    <div className="article-panel rounded-2xl p-6 h-full overflow-y-auto relative">
      {/* Article header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span className="text-xs font-medium text-red-400">
              Artikel Fiktif untuk Investigasi
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-surface-200/40 mb-3">
          <Newspaper className="w-3 h-3" />
          <span>{article.source}</span>
          <span>•</span>
          <span>{article.author}</span>
          <span>•</span>
          <span>{article.date}</span>
        </div>

        <h2 className="text-2xl font-bold text-surface-50 leading-tight mb-2">
          {article.headline}
        </h2>

        <p className="text-xs text-surface-200/40 italic">
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
                onMouseUp={() => handleMouseUp(paragraph.id)}
                className="text-surface-200/80 leading-relaxed text-[15px] cursor-text selection:bg-primary-500/30 selection:text-primary-100"
              >
                {paragraph.text}
              </p>

              {/* Show highlight indicators */}
              {paragraphHighlights.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {paragraphHighlights.map((h, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
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
              <div className="absolute -left-6 top-1 text-xs text-surface-200/20 font-mono">
                {paragraph.id.replace("p", "¶")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint text */}
      <div className="mt-8 p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
        <p className="text-xs text-primary-300/70">
          💡 <strong>Petunjuk:</strong> Sorot (blok) teks yang mencurigakan pada
          artikel di atas, lalu klasifikasikan jenis falasi logikanya. Gunakan
          alat investigasi di panel kanan untuk membantu analisis.
        </p>
      </div>

      {/* Fallacy picker popup */}
      {showFallacyPicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={closePicker} />
          <div
            className="fixed z-50 tooltip-popup p-4 w-72 max-h-80 overflow-y-auto"
            style={{
              left: Math.min(pickerPosition.x - 144, window.innerWidth - 300),
              top: Math.max(pickerPosition.y - 320, 10),
            }}
          >
            <p className="text-xs text-surface-200/60 mb-3">
              Klasifikasikan teks yang dipilih:
            </p>
            <div className="text-xs text-primary-300 mb-3 p-2 rounded-lg bg-primary-500/10 line-clamp-2">
              &quot;{selectedText.substring(0, 80)}
              {selectedText.length > 80 ? "..." : ""}&quot;
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
        </>
      )}
    </div>
  );
}
