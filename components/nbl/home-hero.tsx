"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Trophy, ArrowRight, Calendar, Users } from "lucide-react";

const stats = [
  { value: "24", label: "Équipes" },
  { value: "5v5", label: "Format" },
  { value: "Gratuit", label: "Entrée" },
  { value: "1 Jour", label: "Durée" },
];

export function HomeHero() {
  return (
    <section className="relative min-h-145 lg:min-h-175 flex flex-col items-center justify-center overflow-hidden lg:rounded-2xl lg:mx-8 lg:mt-8 text-center font-sans px-5 lg:px-10 py-16">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-dunk.jpg"
          alt="Basketball NBL"
          fill
          className="object-cover object-top scale-105"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-nbl-bg/80 via-nbl-bg/60 to-nbl-bg" />
        <div className="absolute inset-0 bg-linear-to-r from-nbl-bg/50 via-transparent to-nbl-bg/50" />
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: "url('/patern/patern_1.png')",
            backgroundSize: "180px",
            backgroundRepeat: "repeat",
          }}
        />
      </div>

      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-nbl-orange/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-70 h-70 rounded-full bg-nbl-green/10 blur-[100px] pointer-events-none" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-7 max-w-2xl">
        {/* Logo */}
        <div data-gsap="hero-badge">
          <Image
            src="/logo/logo_large.jpeg"
            alt="National Basketball Leaders"
            width={220}
            height={92}
            className="h-16 lg:h-24 w-auto object-contain drop-shadow-[0_0_40px_rgba(217,104,19,0.35)]"
            priority
          />
        </div>

        {/* Edition badge */}
        <div
          data-gsap="hero-badge"
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-nbl-surface/80 border border-nbl-border backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-nbl-orange" />
          <span className="text-xs font-black tracking-widest text-nbl-white uppercase">
            Édition 1
          </span>
          <span className="w-px h-3 bg-nbl-border" />
          <Calendar size={11} className="text-nbl-orange" />
          <span className="text-xs font-semibold text-nbl-gray">
            Juillet 2026
          </span>
          <span className="w-px h-3 bg-nbl-border" />
          <MapPin size={11} className="text-nbl-green" />
          <span className="text-xs font-semibold text-nbl-gray">Abidjan</span>
        </div>

        {/* Headline */}
        <div className="flex flex-col items-center gap-0">
          <h1
            data-gsap="hero-line"
            className="font-kianda text-5xl lg:text-7xl leading-[0.9] tracking-tight text-nbl-white"
          >
            <span className="text-nbl-orange">national</span> basketball
          </h1>
          <h1
            data-gsap="hero-line"
            className="font-kianda text-5xl lg:text-7xl leading-[0.9] tracking-tight text-nbl-green"
          >
            leaders.
          </h1>
        </div>

        {/* Subline */}
        <p
          data-gsap="hero-line"
          className="text-sm lg:text-base text-nbl-gray leading-relaxed max-w-md"
        >
          Le premier grand tournoi de street basketball 5v5 d&apos;Abidjan. 24
          équipes, des matchs intenses, une soirée inoubliable.
        </p>

        {/* Stats row */}
        {/* <div
          data-gsap="hero-cta"
          className="grid grid-cols-4 gap-3 w-full max-w-sm lg:max-w-md"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-0.5 px-2 py-3 rounded-xl bg-nbl-surface/60 border border-nbl-border backdrop-blur-sm"
            >
              <span className="font-akira text-lg lg:text-xl text-nbl-orange leading-none">
                {s.value}
              </span>
              <span className="text-[10px] font-semibold text-nbl-gray tracking-wide uppercase">
                {s.label}
              </span>
            </div>
          ))}
        </div> */}

        {/* CTAs */}
        <div
          data-gsap="hero-cta"
          className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
        >
          {/* Primary — plein orange avec icône */}
          <Link
            href="/inscription"
            className="group relative flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-nbl-orange text-nbl-bg font-akira text-2xl tracking-normal uppercase overflow-hidden transition-all active:scale-[0.97] shadow-[0_8px_32px_rgba(217,104,19,0.5)]"
          >
            {/* Shine sweep */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-linear-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            {/* <Users size={32} className="shrink-0" /> */}
            Inscrire mon equipe
          </Link>

          {/* Secondary — contour avec glow au hover */}
          <Link
            href="/programme"
            className="group flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-2xl border-2 border-nbl-white/20 text-nbl-white font-akira text-2xl tracking-normal uppercase backdrop-blur-sm hover:border-nbl-orange hover:text-nbl-orange hover:shadow-[0_0_20px_rgba(217,104,19,0.25)] active:scale-[0.97] transition-all"
          >
            Programme
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Note */}
        <p data-gsap="hero-line" className="text-xs text-nbl-gray">
          <span className="text-nbl-green font-bold">Entrée gratuite</span> pour
          les spectateurs
          <span className="mx-2 opacity-30">·</span>
          <span className="text-nbl-white font-bold">12 Junior + 12 D1</span> —
          places limitées
        </p>
      </div>
    </section>
  );
}

export function MvpRace() {
  return (
    <section className="px-4 pb-4 font-sans">
      <div
        data-gsap="slide-right"
        className="rounded-2xl bg-nbl-surface border border-nbl-border p-4 flex items-center gap-4 overflow-hidden relative"
      >
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: "url('/patern/patern_2.png')",
            backgroundSize: "160px",
            backgroundRepeat: "repeat",
          }}
        />
        <div className="absolute right-3 bottom-0 opacity-10">
          <Trophy size={80} className="text-nbl-orange" />
        </div>
        <div className="flex-1 relative z-10">
          <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase mb-1">
            MVP Race Leader
          </p>
          <h3 className="font-nbl text-2xl uppercase tracking-tight text-nbl-white leading-tight">
            Malik
            <br />
            Diop
          </h3>
          <div className="flex items-end gap-1 mt-1">
            <span className="text-3xl font-black text-nbl-white score-display">
              28.4
            </span>
            <span className="text-nbl-gray text-xs font-bold pb-1.5">PPG</span>
          </div>
        </div>
        <div className="relative z-10 shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-nbl-orange">
            <Image
              src="/images/mvp-malik.jpg"
              alt="Malik Diop MVP"
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
