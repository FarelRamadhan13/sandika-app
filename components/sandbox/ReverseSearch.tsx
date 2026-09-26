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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-xl ${config.bg} border ${config.border}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.color} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-surface-50 truncate">
              {result.title}
            </h4>
          </div>
          <div className="flex items-center gap-1 mb-2">
            <ExternalLink className="w-3 h-3 text-surface-200/40" />
            <span className="text-xs text-primary-400">{result.source}</span>
            <span
              className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${config.bg} ${config.color}`}
            >
              {config.label}
            </span>
          </div>
          <p className="text-xs text-surface-200/70 leading-relaxed">
            {result.snippet}
          </p>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-[10px] text-surface-200/40">Kredibilitas:</span>
            <span className={`text-[10px] font-medium ${config.color}`}>
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
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500));

    const queryLower = query.toLowerCase();
    const matchedResults: SearchResult[] = [];

    // Match against keywords
    for (const [keyword, results] of keywordIndex) {
      if (
        queryLower.includes(keyword) ||
        keyword.includes(queryLower)
      ) {
        matchedResults.push(...results);
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
      performSearch();
    }
  };

  const suggestedQueries = [
    "Prof. Andi Pratama",
    "Institut Klimatologi Nusantara",
    "suhu global turun",
    "Penghargaan Sains Nusantara",
  ];

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold text-surface-200 mb-3 flex items-center gap-2">
        🔍 Pelacakan Balik Tiruan
      </h3>

      <p className="text-xs text-surface-200/50 mb-4">
        Cari dan verifikasi klaim, nama, atau institusi yang disebutkan dalam
        artikel. Blok teks dari artikel dan tempelkan di sini.
      </p>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Masukkan teks untuk diverifikasi..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-900/60 border border-primary-500/15 text-sm text-surface-200 placeholder-surface-200/30 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 animate-spin" />
        )}
      </div>

      <button
        onClick={performSearch}
        disabled={!query.trim() || isSearching}
        className="w-full btn-primary text-sm !py-2 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex items-center justify-center gap-2">
          <Search className="w-4 h-4" />
          Lacak Informasi
        </span>
      </button>

      {/* Suggested queries */}
      {!hasSearched && (
        <div className="mb-4">
          <p className="text-[10px] text-surface-200/40 mb-2 uppercase tracking-wider">
            Saran Pencarian:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQueries.map((sq) => (
              <button
                key={sq}
                onClick={() => setQuery(sq)}
                className="px-2.5 py-1 rounded-lg bg-primary-500/8 border border-primary-500/15 text-xs text-primary-300/70 hover:text-primary-300 hover:bg-primary-500/15 transition-all"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-sm text-surface-200/50">
              <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
              Mencari informasi...
            </div>
          </div>
        )}

        <AnimatePresence>
          {!isSearching && results.length > 0 && (
            <>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-surface-200/50"
              >
                Ditemukan {results.length} hasil untuk &quot;{query}&quot;
              </motion.p>
              {results.map((result, idx) => (
                <ResultCard key={idx} result={result} />
              ))}
            </>
          )}
        </AnimatePresence>

        {!isSearching && hasSearched && results.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-surface-200/50">
              Tidak ditemukan hasil untuk &quot;{query}&quot;
            </p>
            <p className="text-xs text-surface-200/30 mt-1">
              Coba kata kunci yang berbeda dari artikel.
            </p>
          </div>
        )}
      </div>

      {searchCount > 0 && (
        <div className="mt-3 text-center">
          <span className="text-xs text-surface-200/40">
            Total pencarian: {searchCount}
          </span>
        </div>
      )}
    </div>
  );
}
