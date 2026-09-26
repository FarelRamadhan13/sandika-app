"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SearchEntry, SearchResult } from "@/lib/types";
import {
  Search,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Info,
  Loader2,
} from "lucide-react";

interface ReverseSearchProps {
  searchDatabase: SearchEntry[];
  onSearch: () => void;
}

function ResultCard({ result }: { result: SearchResult }) {
  const typeConfig = {
    debunk: {
      icon: ShieldAlert,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      label: "Debunked",
    },
    fact: {
      icon: ShieldCheck,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      label: "Fakta Terverifikasi",
    },
    context: {
      icon: Info,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      label: "Konteks Tambahan",
    },
  };

  const config = typeConfig[result.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`p-3 sm:p-3.5 rounded-xl ${config.bg} border ${config.border} shadow-sm`}
    >
      <div className="flex items-start gap-2.5">
        <Icon className={`w-4 h-4 ${config.color} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <h4 className="text-xs sm:text-sm font-semibold text-surface-100 truncate">
              {result.title}
            </h4>
            <span
              className={`shrink-0 px-1.5 py-0.2 rounded text-[10px] font-medium border ${config.border} ${config.color}`}
            >
              {config.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-surface-200/50">
            <ExternalLink className="w-3 h-3 text-primary-400/80" />
            <span className="text-primary-300/90 font-medium truncate">{result.source}</span>
          </div>

          <p className="text-xs text-surface-200/80 leading-relaxed mb-2">
            {result.snippet}
          </p>

          <div className="flex items-center gap-1.5 pt-1.5 border-t border-primary-500/10">
            <span className="text-[10px] text-surface-200/50">Kredibilitas Sumber:</span>
            <span className={`text-[10px] font-semibold capitalize ${config.color}`}>
              {result.credibility}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ReverseSearch({
  searchDatabase,
  onSearch,
}: ReverseSearchProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchCount, setSearchCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // Build keyword index
  const keywordIndex = useMemo(() => {
    const index = new Map<string, SearchResult[]>();
    for (const entry of searchDatabase) {
      for (const keyword of entry.keywords) {
        index.set(keyword.toLowerCase(), entry.results);
      }
    }
    return index;
  }, [searchDatabase]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    // Simulate search delay
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));

    const queryLower = query.toLowerCase();
    const matchedResults: SearchResult[] = [];

    // Match against keywords
    for (const [keyword, searchResults] of keywordIndex) {
      if (
        queryLower.includes(keyword) ||
        keyword.includes(queryLower)
      ) {
        matchedResults.push(...searchResults);
      }
    }

    // Deduplicate
    const unique = matchedResults.filter(
      (r, i, arr) => arr.findIndex((x) => x.title === r.title) === i
    );

    setResults(unique);
    setSearchCount((c) => c + 1);
    setIsSearching(false);
    onSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performSearch();
    }
  };

  const suggestedQueries = [
    "Prof. Andi Pratama",
    "Institut Klimatologi Nusantara",
    "MetaVerse Oasis",
    "Suhu global turun",
  ];

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Search Header Controls */}
      <div className="shrink-0 mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs sm:text-sm font-semibold text-surface-100 flex items-center gap-1.5">
            <span>🔍</span>
            <span>Pelacakan Balik Tiruan</span>
          </h3>
          {searchCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20 font-medium">
              {searchCount}x ditelusuri
            </span>
          )}
        </div>

        <p className="text-[11px] text-surface-200/50 leading-relaxed mb-2.5">
          Verifikasi nama pakar, klaim, atau lembaga dari artikel ke basis data rujukan.
        </p>

        {/* Search Bar + Button Row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-200/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik klaim atau nama untuk verifikasi..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-900/70 border border-primary-500/20 text-xs sm:text-sm text-surface-100 placeholder-surface-200/30 focus:outline-none focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/20 transition-all"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400 animate-spin" />
            )}
          </div>
          <button
            onClick={performSearch}
            disabled={!query.trim() || isSearching}
            className="btn-primary text-xs !py-2 !px-3.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <span>Lacak</span>
          </button>
        </div>

        {/* Suggested Queries Chips */}
        {!hasSearched && (
          <div className="mt-2.5">
            <p className="text-[10px] text-surface-200/40 mb-1.5 uppercase tracking-wider font-semibold">
              Saran Kata Kunci:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedQueries.map((sq) => (
                <button
                  key={sq}
                  onClick={() => setQuery(sq)}
                  className="px-2 py-0.5 rounded-lg bg-primary-500/10 border border-primary-500/20 text-[11px] text-primary-300 hover:text-primary-200 hover:bg-primary-500/20 transition-all"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Scroll Container - Strictly bounded with min-h-0 and internal scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1">
        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-xs text-surface-200/60">
              <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
              <span>Memindai basis data rujukan...</span>
            </div>
          </div>
        )}

        <AnimatePresence>
          {!isSearching && results.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[11px] font-medium text-surface-200/60 pb-0.5"
              >
                Ditemukan {results.length} catatan rujukan untuk &quot;{query}&quot;:
              </motion.div>
              {results.map((result, idx) => (
                <ResultCard key={idx} result={result} />
              ))}
            </>
          )}
        </AnimatePresence>

        {!isSearching && hasSearched && results.length === 0 && (
          <div className="text-center py-7 px-4 rounded-xl bg-surface-900/40 border border-dashed border-primary-500/20">
            <p className="text-xs font-semibold text-surface-200/80">
              Tidak ditemukan catatan resmi untuk &quot;{query}&quot;
            </p>
            <p className="text-[11px] text-surface-200/40 mt-1 leading-relaxed">
              💡 Ini bisa menjadi indikasi institusi/pakar fiktif atau klaim yang tidak terbukti.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
