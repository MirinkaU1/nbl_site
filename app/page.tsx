import { LiveTicker } from "@/components/nbl/live-ticker";
import { HomeHero } from "@/components/nbl/home-hero";
import {
  HomeProgramme,
  HomeNumbers,
  HomeMatches,
  HomePartenaires,
  HomeNews,
} from "@/components/nbl/home-sections";
import { MvpRace } from "@/components/nbl/home-hero";
import { SiteHeader } from "@/components/nbl/site-header";
import { SiteFooter } from "@/components/nbl/site-footer";
import { HomeAnimations } from "@/components/nbl/home-animations";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      <SiteHeader />

      {/* Live ticker — mobile only */}
      <div className="lg:hidden">
        <LiveTicker />
      </div>

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto">
          <HomeHero />
        </div>

        <div className="max-w-7xl mx-auto px-0 lg:px-8">
          {/* ── Chiffres clés ─────────────────────────────── */}
          <HomeNumbers />

          {/* ── Programme de la journée ───────────────────── */}
          <HomeProgramme />

          {/* ── Matchs + MVP (desktop: 2 cols) ───────────── */}
          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
            <HomeMatches />
            <aside className="hidden lg:flex flex-col justify-start pt-8">
              <div className="sticky top-24">
                <MvpRace />
              </div>
            </aside>
          </div>

          {/* MVP mobile */}
          <div className="lg:hidden px-4 pb-4">
            <MvpRace />
          </div>

          {/* ── Devenez partenaire ────────────────────────── */}
          <HomePartenaires />

          {/* ── Actualités ────────────────────────────────── */}
          <HomeNews />
        </div>
      </main>

      <SiteFooter />
      <HomeAnimations />
    </div>
  );
}
