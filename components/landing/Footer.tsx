"use client";

import { Shield, Heart } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-primary-500/10 bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gradient">SANDIKA</span>
            </div>
            <p className="text-sm text-surface-200/50 leading-relaxed">
              Sandbox Anti-Hoax Interactive Platform — Melatih kemampuan
              berpikir kritis generasi muda Indonesia.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-surface-200/80 mb-4 uppercase tracking-wider">
              Navigasi
            </h4>
            <div className="space-y-2">
              <Link
                href="/"
                className="block text-sm text-surface-200/50 hover:text-primary-400 transition-colors"
              >
                Beranda
              </Link>
              <Link
                href="/sandbox"
                className="block text-sm text-surface-200/50 hover:text-primary-400 transition-colors"
              >
                Sandbox Investigasi
              </Link>
              <Link
                href="/dashboard"
                className="block text-sm text-surface-200/50 hover:text-primary-400 transition-colors"
              >
                Dashboard Pelajar
              </Link>
              <Link
                href="/data-siswa"
                className="block text-sm text-surface-200/50 hover:text-primary-400 transition-colors"
              >
                Semua Data Siswa
              </Link>
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold text-surface-200/80 mb-4 uppercase tracking-wider">
              Tentang
            </h4>
            <p className="text-sm text-surface-200/50 leading-relaxed">
              Dibuat untuk Hackathon ITFest 2026 — Solusi inovatif
              untuk mengatasi penyebaran hoax melalui edukasi interaktif.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-200/40 flex items-center gap-1">
            © 2026 SANDIKA. Dibuat dengan{" "}
            <Heart className="w-3 h-3 text-red-400 inline" /> untuk ITFest
          </p>
          <p className="text-sm text-surface-200/40">
            Hackathon ITFest 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
