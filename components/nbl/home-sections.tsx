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
  Sparkles,
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
    label: "Playoff",
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
            08 août 2026 · Abidjan
          </p>
          <h1 className="font-kianda text-3xl lg:text-4xl text-nbl-white leading-none tracking-tight">
            programme de la journée
          </h1>
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
                className={`absolute -right-1 -top-3 font-kianda text-7xl leading-none select-none pointer-events-none tracking-tight ${
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
                <p className="font-kianda text-2xl text-nbl-white leading-tight mt-0.5 tracking-tight">
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
  { value: "5v5", label: "Format", sub: "2 × 5 min / match" },
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
          backgroundImage: "url('/patern/patern_2.png')",
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
            <span className="font-kianda font-black text-5xl lg:text-6xl text-nbl-orange leading-none tracking-tight">
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

// ─── Sponsors / Ils nous soutiennent ─────────────────────────────────────────

type Sponsor = {
  name: string;
  logo: string;
  href?: string;
  tier: "principal" | "officiel";
  tagline?: string;
};

const sponsors: Sponsor[] = [
  {
    name: "Mr Yaourt",
    logo: "/logo/sponsors/Mr_Yaourt.png",
    tier: "principal",
    tagline: "Partenaire officiel · Édition 1",
  },
];

export function HomeSponsors() {
  const principal = sponsors.find((s) => s.tier === "principal");
  const officiels = sponsors.filter((s) => s.tier === "officiel");

  return (
    <section className="relative px-4 lg:px-0 py-12 lg:py-16 overflow-hidden">
      {/* Court line — top */}
      <div className="absolute top-0 left-4 right-4 lg:left-0 lg:right-0 h-px bg-linear-to-r from-transparent via-nbl-border to-transparent" />

      {/* Watermark text */}
      <span
        aria-hidden
        className="hidden lg:block absolute -top-4 right-0 font-kianda text-[180px] leading-none text-nbl-white/[0.025] select-none pointer-events-none tracking-tight"
      >
        2026
      </span>

      {/* Header */}
      <div
        data-gsap="heading"
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8 lg:mb-10"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-nbl-green" />
            <p className="text-nbl-green text-[10px] font-black tracking-[0.25em] uppercase">
              Ils nous soutiennent
            </p>
          </div>
          <h2 className="font-kianda text-4xl lg:text-5xl text-nbl-white leading-[0.9] tracking-tight">
            sponsors &amp; <span className="text-nbl-orange">partenaires</span>
          </h2>
        </div>
        <p className="text-nbl-gray text-xs lg:text-sm max-w-xs leading-relaxed">
          Les marques qui rendent possible la première édition du tournoi NBL à
          Abidjan.
        </p>
      </div>

      {/* Featured / Partenaire principal */}
      {principal && (
        <div data-gsap="cards" className="mb-4">
          <div
            data-gsap="card"
            data-gsap-parent="sponsors-principal"
            className="group relative rounded-3xl overflow-hidden border border-nbl-border bg-nbl-surface"
          >
            {/* Layered background */}
            <div className="absolute inset-0 bg-linear-to-br from-nbl-orange/[0.08] via-transparent to-nbl-green/[0.06]" />
            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage: "url('/patern/patern_2.png')",
                backgroundSize: "200px",
                backgroundRepeat: "repeat",
              }}
            />
            {/* Glow */}
            <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-nbl-orange/15 blur-[90px] pointer-events-none transition-opacity duration-700 group-hover:opacity-150" />

            {/* Diagonal court stripe */}
            <div
              aria-hidden
              className="absolute inset-y-0 right-0 w-1/2 lg:w-2/5 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, var(--nbl-white) 0 1px, transparent 1px 14px)",
              }}
            />

            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] items-stretch">
              {/* Left — meta */}
              <div className="p-6 lg:p-10 flex flex-col justify-between gap-6 lg:gap-10 order-2 lg:order-1">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-nbl-orange" />
                    <span className="text-nbl-orange text-[10px] font-black tracking-[0.3em] uppercase">
                      Partenaire principal
                    </span>
                  </div>
                  <h3 className="font-kianda text-3xl lg:text-5xl text-nbl-white leading-[0.95] tracking-tight">
                    {principal.name}
                  </h3>
                  {principal.tagline && (
                    <p className="text-nbl-gray text-sm leading-relaxed max-w-md">
                      {principal.tagline}. Présent sur le terrain, en tribune et
                      tout au long de la NBL Party.
                    </p>
                  )}
                </div>

                {/* Perk pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    "Naming court",
                    "Tribune VIP",
                    "Branding maillots",
                    "Activation NBL Party",
                  ].map((p) => (
                    <span
                      key={p}
                      className="px-3 py-1 rounded-full border border-nbl-border bg-nbl-bg/40 text-nbl-gray text-[11px] font-semibold tracking-wide"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — logo */}
              <div className="relative order-1 lg:order-2 lg:w-80 xl:w-96 min-h-56 lg:min-h-full flex items-center justify-center p-8 lg:p-12 border-b lg:border-b-0 lg:border-l border-nbl-border bg-nbl-white/[0.02]">
                {/* Corner ticks */}
                <span className="absolute top-3 left-3 w-4 h-px bg-nbl-orange/60" />
                <span className="absolute top-3 left-3 w-px h-4 bg-nbl-orange/60" />
                <span className="absolute bottom-3 right-3 w-4 h-px bg-nbl-orange/60" />
                <span className="absolute bottom-3 right-3 w-px h-4 bg-nbl-orange/60" />

                <Image
                  src={principal.logo}
                  alt={principal.name}
                  width={320}
                  height={200}
                  className="relative max-h-32 lg:max-h-40 w-auto object-contain transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partenaires officiels grid (vide pour l'instant — affiché si présents) */}
      {officiels.length > 0 && (
        <div
          data-gsap="cards"
          className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3"
        >
          {officiels.map((s, i) => {
            const Wrapper: React.ElementType = s.href ? Link : "div";
            const wrapperProps = s.href ? { href: s.href } : {};
            return (
              <Wrapper
                key={`${s.name}-${i}`}
                {...wrapperProps}
                data-gsap="card"
                data-gsap-parent="sponsors-grid"
                className="group relative aspect-[3/2] rounded-xl border border-nbl-border bg-nbl-surface flex items-center justify-center p-4 hover:border-nbl-orange/40 hover:bg-nbl-surface-raised transition-all"
              >
                <Image
                  src={s.logo}
                  alt={s.name}
                  width={160}
                  height={100}
                  className="max-h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </Wrapper>
            );
          })}
        </div>
      )}

      {/* Lien Devenir partenaire */}
      <div
        data-gsap="fade-up"
        className="mt-8 flex items-center justify-center gap-3"
      >
        <span className="h-px flex-1 max-w-16 bg-nbl-border" />
        <Link
          href="/partenaires"
          className="group inline-flex items-center gap-2 text-nbl-orange font-kianda text-xl lg:text-2xl tracking-tight hover:text-nbl-white transition-colors"
        >
          Devenir partenaire
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
        <span className="h-px flex-1 max-w-16 bg-nbl-border" />
      </div>

      {/* Court line — bottom */}
      <div className="mt-10 h-px bg-linear-to-r from-transparent via-nbl-border to-transparent" />
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
        <h2 className="font-kianda text-3xl lg:text-4xl text-nbl-white leading-none tracking-tight">
          dernières nouvelles
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
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
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
        <h2 className="font-kianda text-3xl lg:text-4xl text-nbl-white leading-none tracking-tight">
          prochains matchs
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
