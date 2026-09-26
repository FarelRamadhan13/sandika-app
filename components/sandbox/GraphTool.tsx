"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
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
import { Eye, EyeOff, AlertTriangle, CheckCircle2 } from "lucide-react";

interface GraphToolProps {
  graphConfig: GraphConfig;
  onDiscovered: () => void;
}

export default function GraphTool({ graphConfig, onDiscovered }: GraphToolProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasBeenRevealed, setHasBeenRevealed] = useState(false);

  const handleReveal = () => {
    if (!isRevealed) {
      setHasBeenRevealed(true);
      onDiscovered();
    }
    setIsRevealed(!isRevealed);
  };

  const yMin = isRevealed ? graphConfig.correctYMin : graphConfig.misleadingYMin;
  const yMax = isRevealed ? graphConfig.correctYMax : graphConfig.misleadingYMax;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-surface-200 flex items-center gap-2">
          📊 {graphConfig.title}
        </h3>
        <button
          onClick={handleReveal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isRevealed
              ? "bg-green-500/15 text-green-400 border border-green-500/20"
              : "bg-primary-500/15 text-primary-400 border border-primary-500/20 hover:bg-primary-500/25"
          }`}
        >
          {isRevealed ? (
            <>
              <EyeOff className="w-3 h-3" />
              Lihat Versi Menyesatkan
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              Ungkap Baseline 0
            </>
          )}
        </button>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[250px] bg-surface-900/50 rounded-xl p-4 border border-primary-500/10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={graphConfig.data}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isRevealed ? "#22c55e" : "#ef4444"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isRevealed ? "#22c55e" : "#ef4444"}
                  stopOpacity={0}
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
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              domain={[yMin, yMax]}
              stroke="rgba(148,163,184,0.5)"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value: number) => `${value}°C`}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(17,24,39,0.95)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: "8px",
                color: "#f1f5f9",
                fontSize: "12px",
              }}
              formatter={(value) => [`${value}°C`, "Suhu Rata-rata"]}
            />
            <Area
              type="monotone"
              dataKey="temp"
              stroke={isRevealed ? "#22c55e" : "#ef4444"}
              strokeWidth={2}
              fill="url(#tempGradient)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Info box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isRevealed ? "revealed" : "misleading"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`mt-4 p-3 rounded-xl text-xs leading-relaxed ${
            isRevealed
              ? "bg-green-500/10 border border-green-500/20 text-green-300"
              : "bg-amber-500/10 border border-amber-500/20 text-amber-300"
          }`}
        >
          {isRevealed ? (
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">✅ Skala Sesungguhnya Terungkap!</p>
                <p>
                  Dengan sumbu Y dimulai dari 0°C, terlihat jelas bahwa penurunan suhu
                  0,3°C sangat kecil dibandingkan skala keseluruhan. Grafik asli
                  memanipulasi skala (14.5-15.1°C) agar perbedaan kecil terlihat dramatis.
                  Ini adalah teknik manipulasi visual yang umum digunakan dalam berita menyesatkan.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">⚠️ Perhatikan Sumbu Y</p>
                <p>
                  Grafik ini menampilkan data dengan sumbu Y mulai dari {graphConfig.misleadingYMin}°C
                  hingga {graphConfig.misleadingYMax}°C. Penurunan terlihat sangat dramatis, tapi
                  apakah ini representasi yang akurat? Klik tombol &quot;Ungkap Baseline 0&quot; untuk melihat.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {hasBeenRevealed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-center"
        >
          <span className="score-badge text-green-400">
            +10 Poin — Manipulasi grafik terdeteksi!
          </span>
        </motion.div>
      )}
    </div>
  );
}
