export interface Fallacy {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  color: string;
}

export const FALLACY_TYPES: Fallacy[] = [
  {
    id: "cherry-picking",
    name: "Cherry Picking",
    nameEn: "Cherry Picking",
    description:
      "Memilih hanya data atau fakta yang mendukung argumen sambil mengabaikan bukti yang bertentangan.",
    icon: "🍒",
    color: "#ef4444",
  },
  {
    id: "ad-hominem",
    name: "Ad Hominem",
    nameEn: "Ad Hominem",
    description:
      "Menyerang karakter atau pribadi seseorang alih-alih menanggapi argumen mereka secara substansi.",
    icon: "👤",
    color: "#f97316",
  },
  {
    id: "appeal-to-authority",
    name: "Banding ke Otoritas",
    nameEn: "Appeal to Authority",
    description:
      "Menggunakan pendapat tokoh otoritas sebagai bukti kebenaran, meskipun tokoh tersebut bukan ahli di bidang yang relevan.",
    icon: "🎓",
    color: "#eab308",
  },
  {
    id: "false-cause",
    name: "Penyebab Palsu",
    nameEn: "False Cause",
    description:
      "Menyimpulkan bahwa suatu peristiwa menyebabkan peristiwa lain hanya karena terjadi berurutan atau bersamaan.",
    icon: "🔗",
    color: "#8b5cf6",
  },
  {
    id: "hasty-generalization",
    name: "Generalisasi Terburu-buru",
    nameEn: "Hasty Generalization",
    description:
      "Membuat kesimpulan umum dari sampel yang terlalu kecil atau tidak representatif.",
    icon: "⚡",
    color: "#06b6d4",
  },
  {
    id: "straw-man",
    name: "Manusia Jerami",
    nameEn: "Straw Man",
    description:
      "Mendistorsi argumen lawan agar lebih mudah diserang, kemudian menyerang versi yang sudah didistorsi tersebut.",
    icon: "🎭",
    color: "#ec4899",
  },
  {
    id: "bias-kutipan",
    name: "Bias Kutipan",
    nameEn: "Quotation Bias",
    description:
      "Mengutip pernyataan secara tidak lengkap atau di luar konteks sehingga mengubah makna aslinya.",
    icon: "📝",
    color: "#14b8a6",
  },
  {
    id: "bandwagon",
    name: "Ikut Arus",
    nameEn: "Bandwagon",
    description:
      "Mengklaim sesuatu benar karena banyak orang mempercayainya.",
    icon: "🚂",
    color: "#f59e0b",
  },
];

export function getFallacyById(id: string): Fallacy | undefined {
  return FALLACY_TYPES.find((f) => f.id === id);
}
