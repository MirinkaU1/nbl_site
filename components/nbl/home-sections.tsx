import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Zap,
  Star,
  Trophy,
  Music,
  Users,
  MapPin,
  Clock,
} from "lucide-react";

// ─── Programme snapshot ───────────────────────────────────────────────────────

const schedule = [
  {
    time: "09h00",
    label: "Matchs de poules",
    sub: "Junior & D1 sur 2 terrains",
    icon: Zap,
    color: "orange",
  },
  {
    time: "12h30",
    label: "Animations & Concours",
    sub: "Dribbles, dunks, DJ",
    icon: Star,
    color: "green",
  },
  {
    time: "14h00",
    label: "Phases finales",
    sub: "QF · DF · Finales Junior & D1",
    icon: Trophy,
    color: "orange",
  },
  {
    time: "18h00",
    label: "NBL Party",
    sub: "DJ · Artistes · Fun Pong · Freestyle",
    icon: Music,
    color: "green",
  },
];

export function HomeProgramme() {
  return (
    <section className="px-4 lg:px-0 py-10 lg:py-14">
      {/* Header */}
      <div data-gsap="heading" className="flex items-end justify-between mb-6">
        <div>
          <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase mb-1">
            Juillet 2026 · Abidjan
          </p>
          <h2 className="font-barlow font-bold text-3xl lg:text-4xl uppercase text-nbl-white leading-none">
            Programme de la journée
          </h2>
        </div>
        <Link
          href="/programme"
          className="text-nbl-orange text-xs font-bold tracking-widest uppercase flex items-center gap-1 hover:gap-2 transition-all"
        >
          Voir tout <ArrowRight size={12} />
        </Link>
      </div>

      {/* Timeline cards */}
      <div
        data-gsap="cards"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {schedule.map((item, i) => {
          const Icon = item.icon;
          const isOrange = item.color === "orange";
          return (
            <div
              key={i}
              data-gsap="card"
              className={`relative rounded-2xl border p-5 flex flex-col gap-3 overflow-hidden ${
                isOrange
                  ? "bg-nbl-orange/10 border-nbl-orange/25"
                  : "bg-nbl-green/10 border-nbl-green/25"
              }`}
            >
              {/* Big time watermark */}
              <span
                className={`absolute -right-1 -top-3 font-barlow font-black text-7xl leading-none select-none pointer-events-none ${
                  isOrange ? "text-nbl-orange/10" : "text-nbl-green/10"
                }`}
              >
                {item.time.replace("h", ":")}
              </span>

              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isOrange ? "bg-nbl-orange/20" : "bg-nbl-green/20"
                }`}
              >
                <Icon
                  size={18}
                  className={isOrange ? "text-nbl-orange" : "text-nbl-green"}
                />
              </div>

              <div>
                <p
                  className={`text-xs font-black tracking-widest ${isOrange ? "text-nbl-orange" : "text-nbl-green"}`}
                >
                  {item.time}
                </p>
                <p className="font-barlow font-bold text-2xl uppercase text-nbl-white leading-tight mt-0.5">
                  {item.label}
                </p>
                <p className="text-nbl-gray text-xs mt-1 leading-snug">
                  {item.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info strip */}
      <div
        data-gsap="fade-up"
        className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 px-1"
      >
        <span className="flex items-center gap-1.5 text-xs text-nbl-gray">
          <MapPin size={11} className="text-nbl-orange" />
          Abidjan, Côte d&apos;Ivoire
        </span>
        <span className="flex items-center gap-1.5 text-xs text-nbl-gray">
          <Clock size={11} className="text-nbl-green" />
          09h00 — 20h00
        </span>
        <span className="flex items-center gap-1.5 text-xs text-nbl-green font-bold">
          Entrée gratuite pour les spectateurs
        </span>
      </div>
    </section>
  );
}

// ─── Key numbers ─────────────────────────────────────────────────────────────

const numbers = [
  { value: "24", label: "Équipes", sub: "12 Junior + 12 D1" },
  { value: "5v5", label: "Format", sub: "2 × 10 min / match" },
  { value: "1", label: "Journée", sub: "Du matin à la nuit" },
  { value: "∞", label: "Énergie", sub: "Street basketball pur" },
];

export function HomeNumbers() {
  return (
    <section className="relative px-4 lg:px-0 py-10 overflow-hidden">
      {/* Pattern bg */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "url('/logo/patern_2.png')",
          backgroundSize: "220px",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3">
        {numbers.map((n, i) => (
          <div
            key={i}
            data-gsap="card"
            data-gsap-parent="numbers"
            className="rounded-2xl bg-nbl-surface border border-nbl-border p-5 lg:p-6 flex flex-col gap-1"
          >
            <span className="font-barlow font-black text-5xl lg:text-6xl text-nbl-orange leading-none">
              {n.value}
            </span>
            <span className="font-black text-sm text-nbl-white uppercase tracking-wide">
              {n.label}
            </span>
            <span className="text-nbl-gray text-xs">{n.sub}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Partenaires CTA ─────────────────────────────────────────────────────────

export function HomePartenaires() {
  return (
    <section className="px-4 lg:px-0 py-10 lg:py-14">
      <div data-gsap="fade-up" className="relative rounded-2xl overflow-hidden">
        {/* BG layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-nbl-green/20 via-nbl-surface to-nbl-orange/15" />
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: "url('/logo/patern_1.png')",
            backgroundSize: "160px",
            backgroundRepeat: "repeat",
          }}
        />
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-nbl-orange/20 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-nbl-green/20 blur-[80px] pointer-events-none" />

        <div className="relative px-6 lg:px-12 py-10 lg:py-14 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Left */}
          <div className="flex flex-col gap-4 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-nbl-orange" />
              <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase">
                Opportunité partenariat
              </p>
            </div>
            <h2 className="font-akira text-4xl lg:text-5xl uppercase text-nbl-white leading-none">
              Associez votre marque
              <br />
              <span className="text-nbl-orange">à l&apos;édition 1.</span>
            </h2>
            <p className="text-nbl-gray text-sm leading-relaxed">
              Visibilité terrain, communication digitale, accès VIP. Soyez
              présent dès le lancement du premier grand tournoi de street
              basketball d&apos;Abidjan.
            </p>

            {/* Perks row */}
            <div className="flex flex-wrap gap-2 mt-1">
              {[
                "Visibilité terrain",
                "Réseaux sociaux",
                "Accès VIP",
                "Co-branding",
              ].map((p) => (
                <span
                  key={p}
                  className="px-3 py-1 rounded-full bg-nbl-surface/80 border border-nbl-border text-nbl-gray text-xs font-semibold"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-3 shrink-0">
            <Link
              href="/partenaires"
              className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-nbl-orange text-nbl-bg font-akira text-2xl uppercase shadow-[0_4px_24px_rgba(217,104,19,0.45)] hover:bg-nbl-orange-dark active:scale-[0.97] transition-all"
            >
              Devenir partenaire
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <a
              href="mailto:nationalbasketballleaders1@gmail.com"
              className="text-center text-nbl-gray text-xs hover:text-nbl-white transition-colors"
            >
              nationalbasketballleaders1@gmail.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── News ────────────────────────────────────────────────────────────────────

const newsItems = [
  {
    image: "/images/news-1.jpg",
    tag: "Inscriptions",
    time: "Il y a 2 heures",
    title:
      "Les inscriptions sont ouvertes — 24 équipes attendues pour l'Édition 1.",
    href: "/inscription",
  },
  {
    image: "/images/news-2.jpg",
    tag: "Programme",
    time: "Hier",
    title:
      "Programme complet de la journée NBL — matchs, animations & NBL Party.",
    href: "/programme",
  },
];

export function HomeNews() {
  return (
    <section className="px-4 lg:px-0 pb-28 lg:pb-16">
      <div data-gsap="heading" className="flex items-end justify-between mb-6">
        <h2 className="font-barlow font-bold text-3xl lg:text-4xl uppercase text-nbl-white leading-none">
          Dernières Nouvelles
        </h2>
      </div>
      <div data-gsap="cards" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {newsItems.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            data-gsap="card"
            className="group flex flex-col gap-3"
          >
            <div className="relative h-52 lg:h-60 rounded-2xl overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Tag */}
              <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-nbl-orange text-nbl-bg text-[10px] font-black tracking-widest uppercase">
                {item.tag}
              </span>
              {/* Title on image */}
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-nbl-white font-bold text-sm leading-snug text-balance">
                  {item.title}
                </p>
                <p className="text-nbl-gray/80 text-xs mt-1">{item.time}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Upcoming matches (compact) ───────────────────────────────────────────────

const upcomingMatches = [
  {
    date: "Auj. 19:00",
    venue: "Treichville",
    home: { code: "PX", name: "PHOENIX" },
    away: { code: "TR", name: "TIGERS" },
  },
  {
    date: "Dem. 18:30",
    venue: "Cocody",
    home: { code: "VS", name: "VIPERS" },
    away: { code: "HK", name: "HOOP K." },
  },
  {
    date: "Dem. 21:00",
    venue: "Plateau",
    home: { code: "SS", name: "ST. SOUL" },
    away: { code: "BL", name: "BALLERS" },
  },
];

export function HomeMatches() {
  return (
    <section className="px-4 lg:px-0 py-8">
      <div data-gsap="heading" className="flex items-end justify-between mb-5">
        <h2 className="font-barlow font-bold text-3xl lg:text-4xl uppercase text-nbl-white leading-none">
          Prochains Matchs
        </h2>
        <Link
          href="/matches"
          className="text-nbl-orange text-xs font-bold tracking-widest uppercase flex items-center gap-1 hover:gap-2 transition-all"
        >
          Voir tout <ArrowRight size={12} />
        </Link>
      </div>

      <div data-gsap="cards" className="flex flex-col gap-2">
        {upcomingMatches.map((match, i) => (
          <div
            key={i}
            data-gsap="card"
            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-nbl-surface border border-nbl-border hover:border-nbl-orange/30 transition-colors"
          >
            {/* Date */}
            <div className="shrink-0 w-20 text-left">
              <p className="text-nbl-orange text-xs font-black">{match.date}</p>
              <p className="text-nbl-gray text-[10px] flex items-center gap-0.5 mt-0.5">
                <MapPin size={9} />
                {match.venue}
              </p>
            </div>

            {/* Teams */}
            <div className="flex-1 flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-nbl-surface-raised border border-nbl-border flex items-center justify-center text-[10px] font-black text-nbl-white">
                  {match.home.code}
                </div>
                <span className="text-sm font-black text-nbl-white hidden sm:block">
                  {match.home.name}
                </span>
              </div>
              <span className="text-nbl-gray text-xs font-black px-2">VS</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-nbl-white hidden sm:block">
                  {match.away.name}
                </span>
                <div className="w-8 h-8 rounded-full bg-nbl-surface-raised border border-nbl-border flex items-center justify-center text-[10px] font-black text-nbl-white">
                  {match.away.code}
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/inscription"
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-nbl-border text-nbl-gray text-[10px] font-bold tracking-widest uppercase hover:border-nbl-orange hover:text-nbl-orange transition-colors"
            >
              <Users size={10} />
              Billets
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
