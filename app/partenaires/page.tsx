import { SiteHeader } from "@/components/nbl/site-header";
import { SiteFooter } from "@/components/nbl/site-footer";
import { BottomNav } from "@/components/nbl/bottom-nav";
import { ArrowRight, Users, Eye, Megaphone, Star } from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: Eye,
    title: "Visibilité terrain",
    description:
      "Votre marque affichée sur les terrains et banderoles pendant toute la journée de compétition.",
  },
  {
    icon: Megaphone,
    title: "Communication digitale",
    description:
      "Mention sur tous nos supports digitaux : réseaux sociaux, site web, flyers et stories.",
  },
  {
    icon: Users,
    title: "Accès VIP",
    description:
      "Espace partenaire dédié avec accès privilégié aux matchs et à la cérémonie de remise des prix.",
  },
  {
    icon: Star,
    title: "Association premium",
    description:
      "Positionnement en tant que partenaire officiel de la première édition du NBL — un événement fondateur.",
  },
];

export default function PartenairesPage() {
  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-screen-xl mx-auto px-4 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-10">
          <p className="text-nbl-orange text-xs font-black tracking-widest uppercase mb-2">
            National Basketball Leaders · Édition 1
          </p>
          <h1 className="font-akira text-4xl lg:text-5xl uppercase text-nbl-white leading-none mb-3">
            Devenez
            <br />
            <span className="text-nbl-orange">partenaire</span>
          </h1>
          <p className="text-nbl-gray text-sm leading-relaxed max-w-lg">
            Le NBL est le premier tournoi de street basketball 5v5
            d&apos;Abidjan. Rejoignez l&apos;aventure dès l&apos;Édition 1 et
            associez votre marque à un événement culturel et sportif unique.
          </p>
        </div>

        {/* Event numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
          {[
            { value: "24", label: "Équipes participantes" },
            { value: "200+", label: "Joueurs attendus" },
            { value: "1 jour", label: "Compétition intense" },
            { value: "Abidjan", label: "Cœur de la ville" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-nbl-surface border border-nbl-border p-5 flex flex-col gap-1"
            >
              <span className="font-barlow font-black text-2xl lg:text-3xl text-nbl-orange leading-none">
                {s.value}
              </span>
              <span className="text-nbl-gray text-xs leading-snug">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="font-barlow font-bold text-2xl uppercase text-nbl-white mb-6">
            Ce que vous gagnez
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="flex gap-4 p-5 rounded-2xl bg-nbl-surface border border-nbl-border"
                >
                  <div className="w-12 h-12 rounded-xl bg-nbl-orange/15 border border-nbl-orange/30 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-nbl-orange" />
                  </div>
                  <div>
                    <p className="text-nbl-white font-bold text-sm mb-1">
                      {b.title}
                    </p>
                    <p className="text-nbl-gray text-xs leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pattern-decorated CTA block */}
        <div className="relative rounded-2xl bg-nbl-surface border border-nbl-border p-8 lg:p-12 overflow-hidden flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: "url('/logo/patern_2.png')",
              backgroundSize: "200px",
              backgroundRepeat: "repeat",
            }}
          />
          <div className="relative">
            <h2 className="font-akira text-3xl lg:text-4xl uppercase text-nbl-white mb-2">
              Interesse ?
            </h2>
            <p className="text-nbl-gray text-sm max-w-md leading-relaxed">
              Contactez-nous pour discuter des opportunités de partenariat
              adaptées à votre marque et à vos objectifs.
            </p>
          </div>
          <div className="relative flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="mailto:nationalbasketballleaders1@gmail.com"
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-nbl-orange text-nbl-bg font-black text-sm tracking-widest uppercase shadow-[0_4px_20px_rgba(217,104,19,0.4)] hover:bg-nbl-orange-dark transition-colors"
            >
              Nous écrire
              <ArrowRight size={14} />
            </a>
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-nbl-border text-nbl-white font-black text-sm tracking-widest uppercase hover:border-nbl-orange/40 transition-colors"
            >
              Voir les contacts
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
      <BottomNav />
    </div>
  );
}
