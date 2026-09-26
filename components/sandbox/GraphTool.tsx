"use client";

import { useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import type { GraphConfig } from "@/lib/types";
import { Eye, EyeOff, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface GraphToolProps {
  graphConfig?: GraphConfig;
  onDiscovered: () => void;
}

export default function GraphTool({ graphConfig, onDiscovered }: GraphToolProps) {
  const [mounted, setMounted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasBeenRevealed, setHasBeenRevealed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!graphConfig || !graphConfig.data || graphConfig.data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center text-surface-200/50 text-xs">
        <p>Data visualisasi grafik tidak tersedia untuk kasus ini.</p>
      </div>
    );
  }

  const handleReveal = () => {
    if (!isRevealed) {
      setHasBeenRevealed(true);
      onDiscovered();
    }
    setIsRevealed(!isRevealed);
  };

  const yMin = isRevealed ? graphConfig.correctYMin : graphConfig.misleadingYMin;
  const yMax = isRevealed ? graphConfig.correctYMax : graphConfig.misleadingYMax;

  // Extract unit from title if available, e.g. "Suhu Rata-rata Global (°C)" -> "°C"
  const unitMatch = graphConfig.title.match(/\(([^)]+)\)/);
  const unit = unitMatch ? unitMatch[1] : "";
  const unitSuffix = unit ? ` ${unit}` : "";
  const cleanTitle = graphConfig.title.replace(/\s*\([^)]*\)/, "").trim() || "Nilai";

  const firstPoint = graphConfig.data[0];
  const valueKey =
    firstPoint && "temp" in firstPoint
      ? "temp"
      : firstPoint && "value" in firstPoint
      ? "value"
      : Object.keys(firstPoint || {}).find((k) => k !== "year") || "temp";

  const gradientId = `graphGrad-${cleanTitle.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className="h-full flex flex-col overflow-y-auto pr-1 space-y-3">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between gap-2">
        <h3 className="text-xs sm:text-sm font-semibold text-surface-200 flex items-center gap-1.5 truncate">
          <span>📊</span>
          <span className="truncate">{graphConfig.title}</span>
        </h3>
        <button
          onClick={handleReveal}
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isRevealed
              ? "bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25"
              : "bg-primary-500/15 text-primary-400 border border-primary-500/20 hover:bg-primary-500/25"
          }`}
        >
          {isRevealed ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Versi Menyesatkan</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Ungkap Baseline 0</span>
            </>
          )}
        </button>
      </div>

      {/* Chart */}
      <div className="shrink-0 w-full h-[220px] bg-surface-900/50 rounded-xl p-2.5 sm:p-3 border border-primary-500/10 relative">
        {!mounted ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={graphConfig.data}
              margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isRevealed ? "#22c55e" : "#ef4444"}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor={isRevealed ? "#22c55e" : "#ef4444"}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(59,130,246,0.1)"
              />
              <XAxis
                dataKey="year"
                stroke="rgba(148,163,184,0.5)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                domain={[yMin, yMax]}
                stroke="rgba(148,163,184,0.5)"
                fontSize={11}
                tickLine={false}
                tickFormatter={(value: number) => `${value}${unitSuffix}`}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(17,24,39,0.95)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value}${unitSuffix}`, cleanTitle]}
              />
              <Area
                type="monotone"
                dataKey={valueKey}
                stroke={isRevealed ? "#22c55e" : "#ef4444"}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Info box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isRevealed ? "revealed" : "misleading"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={`shrink-0 p-3 rounded-xl text-xs leading-relaxed ${
            isRevealed
              ? "bg-green-500/10 border border-green-500/20 text-green-300"
              : "bg-amber-500/10 border border-amber-500/20 text-amber-300"
          }`}
        >
          {isRevealed ? (
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400 mt-0.5" />
              <div>
                <p className="font-semibold mb-1 text-green-300">
                  ✅ Skala Sesungguhnya Terungkap!
                </p>
                <p className="text-green-300/90 leading-relaxed text-[11px] sm:text-xs">
                  Dengan sumbu Y dimulai dari baseline {graphConfig.correctYMin}{unitSuffix} hingga {graphConfig.correctYMax}{unitSuffix},
                  terlihat jelas proporsi perubahan yang sesungguhnya. Grafik manipulatif sengaja memotong baseline untuk menciptakan ilusi visual yang mendukung narasi menyesatkan.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold mb-1 text-amber-300">
                  ⚠️ Perhatikan Sumbu Y (Truncated Axis)
                </p>
                <p className="text-amber-300/90 leading-relaxed text-[11px] sm:text-xs">
                  Grafik ini memotong baseline sumbu Y dan hanya menampilkan rentang {graphConfig.misleadingYMin}{unitSuffix} hingga {graphConfig.misleadingYMax}{unitSuffix}.
                  Pemotongan baseline membuat tren terlihat sangat dramatis dari fakta aslinya. Klik tombol &quot;Ungkap Baseline 0&quot; untuk membuktikannya.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {hasBeenRevealed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="shrink-0 text-center pb-1"
        >
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold">
            +10 Poin — Manipulasi grafik terdeteksi!
          </span>
        </motion.div>
      )}
    </div>
  );
}
