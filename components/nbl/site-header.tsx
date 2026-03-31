"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Users, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "ACCUEIL" },
  { href: "/programme", label: "PROGRAMME" },
  { href: "/matches", label: "SCORES" },
  { href: "/standings", label: "CLASSEMENT" },
  { href: "/store", label: "BOUTIQUE" },
];

function NBLLogo() {
  return (
    <Link href="/" className="shrink-0">
      <Image
        src="/logo/logo_large.jpeg"
        alt="NBL"
        width={96}
        height={40}
        className="h-10 w-auto object-contain"
        priority
      />
    </Link>
  );
}

function LivePill() {
  return (
    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-nbl-surface border border-nbl-border text-xs font-semibold">
      <span className="live-dot w-1.5 h-1.5 rounded-full bg-nbl-green shrink-0" />
      <span className="text-nbl-green font-black tracking-widest">LIVE</span>
      <span className="text-nbl-white">ABIDJAN HEAT</span>
      <span className="font-barlow text-nbl-orange font-black">86</span>
      <span className="text-nbl-gray">–</span>
      <span className="font-barlow text-nbl-orange font-black">82</span>
      <span className="text-nbl-white">TREICHVILLE</span>
      <span className="text-nbl-gray">(Q4 4:21)</span>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-nbl-bg/95 backdrop-blur-md border-b border-nbl-border">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 flex items-center justify-between h-16 gap-4">
          <NBLLogo />

          {/* Desktop nav — centered */}
          <nav
            aria-label="Navigation principale"
            className="hidden lg:flex items-center gap-1 flex-1 justify-center"
          >
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-colors",
                    active
                      ? "text-nbl-white"
                      : "text-nbl-gray hover:text-nbl-white",
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-nbl-orange" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop right — live pill + S'inscrire */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <LivePill />
            <Link
              href="/inscription"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-nbl-orange text-nbl-bg font-black text-xs tracking-widest uppercase shadow-[0_2px_12px_rgba(217,104,19,0.35)] hover:bg-nbl-orange-dark transition-colors"
            >
              <Users size={13} />
              S&apos;inscrire
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            className="lg:hidden text-nbl-white p-1"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 z-40 bg-nbl-bg/98 backdrop-blur-md border-b border-nbl-border">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black tracking-widest uppercase transition-colors",
                    active
                      ? "text-nbl-orange bg-nbl-orange-muted"
                      : "text-nbl-gray hover:text-nbl-white",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/inscription"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-nbl-orange text-nbl-bg font-black text-sm tracking-widest uppercase"
            >
              <Users size={16} />
              S&apos;inscrire
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
