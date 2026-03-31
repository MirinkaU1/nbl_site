import Link from "next/link"
import { ArrowLeft, QrCode } from "lucide-react"

export default function ScanPage() {
  return (
    <main className="min-h-screen bg-nbl-bg flex flex-col items-center justify-center gap-6 px-6">
      <div className="w-16 h-16 rounded-2xl bg-nbl-orange flex items-center justify-center shadow-[0_4px_20px_rgba(217,104,19,0.4)]">
        <QrCode size={32} className="text-nbl-bg" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-black uppercase text-nbl-white">Scanner un billet</h1>
        <p className="text-nbl-gray text-sm mt-2 leading-relaxed">Autorisez l&apos;accès à votre caméra pour scanner votre billet d&apos;entrée.</p>
      </div>
      <button className="flex items-center justify-center w-full max-w-xs py-4 rounded-2xl bg-nbl-orange text-nbl-bg font-black text-sm tracking-widest uppercase shadow-[0_4px_20px_rgba(217,104,19,0.4)]">
        Activer la caméra
      </button>
      <Link href="/" className="flex items-center gap-2 text-nbl-gray text-sm font-semibold">
        <ArrowLeft size={16} />
        Retour
      </Link>
    </main>
  )
}
