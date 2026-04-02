import { SiteHeader } from "@/components/nbl/site-header";
import { SiteFooter } from "@/components/nbl/site-footer";
import { MapPin, Clock, Music, Trophy, Zap, Star } from "lucide-react";

const schedule = [
  {
    time: "09h00",
    endTime: "12h30",
    label: "Matchs de poules",
    description:
      "Phase de groupes — Catégories Junior & D1 sur les deux terrains simultanément. Format 2 × 10 minutes par match.",
    icon: Zap,
    color: "orange",
    details: [
      "12 équipes Junior en compétition",
      "12 équipes D1 en compétition",
      "2 terrains simultanés",
      "Format : 2 × 10 min / match",
    ],
  },
  {
    time: "12h30",
    endTime: "14h00",
    label: "Animations & Concours",
    description:
      "Pause midday avec des activités pour les joueurs et spectateurs. Concours de dribbles, dunks, etc.",
    icon: Star,
    color: "green",
    details: [
      "Concours de dribbles",
      "Défi dunks",
      "Ambiance DJ",
      "Remise des prix intermédiaires",
    ],
  },
  {
    time: "14h00",
    endTime: "17h30",
    label: "Phases finales",
    description:
      "Les meilleures équipes s'affrontent pour le titre. Quarts de finale, demi-finales, et les deux grandes finales.",
    icon: Trophy,
    color: "orange",
    details: [
      "Quarts de finale Junior & D1",
      "Demi-finales Junior & D1",
      "Finale Junior",
      "Finale D1 — Match pour le titre",
    ],
  },
  {
    time: "18h00",
    endTime: "20h00",
    label: "NBL Party",
    description:
      "La soirée de clôture pour célébrer les champions. DJ, artistes live, NBL Fun Pong et concours freestyle.",
    icon: Music,
    color: "green",
    details: [
      "DJ set",
      "Artistes live",
      "NBL Fun Pong",
      "Concours de freestyle",
    ],
  },
];

export default function ProgrammePage() {
  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-10 lg:mb-14">
          <p className="text-nbl-orange text-xs font-black tracking-widest uppercase mb-2">
            Édition 1 · Juillet 2026
          </p>
          <h1 className="font-kianda tracking-tight text-4xl lg:text-5xl text-nbl-white leading-none mb-3">
            Programme
            <br />
            <span className="text-nbl-orange">de la journée</span>
          </h1>
          <div className="flex items-center gap-2 text-nbl-gray text-sm">
            <MapPin size={14} className="text-nbl-orange" />
            <span>Abidjan, Côte d&apos;Ivoire</span>
            <span className="opacity-30">·</span>
            <Clock size={14} className="text-nbl-green" />
            <span>09h00 — 20h00</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-7 lg:left-9 top-0 bottom-0 w-px bg-nbl-border" />

          <div className="flex flex-col gap-8 lg:gap-12">
            {schedule.map((item, i) => {
              const Icon = item.icon;
              const isOrange = item.color === "orange";
              return (
                <div key={i} className="relative flex gap-6 lg:gap-10">
                  {/* Icon dot */}
                  <div
                    className={`relative z-10 shrink-0 w-14 h-14 lg:w-18 lg:h-18 rounded-2xl flex items-center justify-center shadow-lg ${
                      isOrange
                        ? "bg-nbl-orange/20 border border-nbl-orange/40 shadow-[0_0_20px_rgba(217,104,19,0.2)]"
                        : "bg-nbl-green/20 border border-nbl-green/40 shadow-[0_0_20px_rgba(46,105,48,0.2)]"
                    }`}
                  >
                    <Icon
                      size={22}
                      className={
                        isOrange ? "text-nbl-orange" : "text-nbl-green"
                      }
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    {/* Time */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-black tracking-widest ${isOrange ? "text-nbl-orange" : "text-nbl-green"}`}
                      >
                        {item.time} — {item.endTime}
                      </span>
                    </div>

                    <h2 className="font-barlow font-bold text-2xl lg:text-3xl uppercase text-nbl-white leading-none mb-2">
                      {item.label}
                    </h2>
                    <p className="text-nbl-gray text-sm leading-relaxed mb-4 max-w-lg">
                      {item.description}
                    </p>

                    {/* Detail pills */}
                    <div className="flex flex-wrap gap-2">
                      {item.details.map((d, j) => (
                        <span
                          key={j}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            isOrange
                              ? "bg-nbl-orange/10 border-nbl-orange/20 text-nbl-orange"
                              : "bg-nbl-green/10 border-nbl-green/20 text-nbl-green"
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info cards */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-nbl-surface border border-nbl-border p-5 flex flex-col gap-2">
            <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase">
              Entrée
            </p>
            <p className="text-nbl-white font-black text-lg">Gratuite</p>
            <p className="text-nbl-gray text-xs leading-relaxed">
              L&apos;accès au tournoi est libre et gratuit pour tous les
              spectateurs.
            </p>
          </div>
          <div className="rounded-2xl bg-nbl-surface border border-nbl-border p-5 flex flex-col gap-2">
            <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase">
              Format
            </p>
            <p className="text-nbl-white font-black text-lg">2 × 10 min</p>
            <p className="text-nbl-gray text-xs leading-relaxed">
              Chaque match se joue en 2 mi-temps de 10 minutes. Catégories
              Junior & D1.
            </p>
          </div>
          <div className="rounded-2xl bg-nbl-surface border border-nbl-border p-5 flex flex-col gap-2">
            <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase">
              Équipes
            </p>
            <p className="text-nbl-white font-black text-lg">24 équipes</p>
            <p className="text-nbl-gray text-xs leading-relaxed">
              12 équipes Junior + 12 équipes D1. Places limitées —
              inscrivez-vous dès maintenant.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
