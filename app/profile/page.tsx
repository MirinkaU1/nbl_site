import { Trophy, Star, Settings } from "lucide-react";
import { SiteHeader } from "@/components/nbl/site-header";
import { SiteFooter } from "@/components/nbl/site-footer";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 pb-12 pt-8">
        <div className="max-w-lg lg:max-w-none mx-auto lg:grid lg:grid-cols-[300px_1fr] lg:gap-10 lg:items-start">
          {/* Profile card */}
          <div className="flex flex-col items-center lg:items-start gap-4">
            <div className="flex flex-col items-center lg:flex-row lg:items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-nbl-surface border-2 border-nbl-orange flex items-center justify-center shrink-0">
                <span className="text-2xl font-black text-nbl-white">KD</span>
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-xl font-black text-nbl-white">
                  Koné Dramane
                </h1>
                <p className="text-nbl-gray text-xs">Supporter · Abidjan</p>
              </div>
            </div>

            <div className="w-full grid grid-cols-3 gap-3 mt-2">
              {[
                { icon: Trophy, label: "Matchs vus", value: "24" },
                { icon: Star, label: "Favoris", value: "3" },
                { icon: Settings, label: "Billets", value: "7" },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl bg-nbl-surface border border-nbl-border p-3 text-center"
                >
                  <Icon size={18} className="text-nbl-orange mx-auto mb-1" />
                  <p className="text-xl font-black text-nbl-white">{value}</p>
                  <p className="text-[10px] text-nbl-gray font-semibold tracking-wide">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="mt-6 lg:mt-0 space-y-4">
            <div className="rounded-2xl bg-nbl-surface border border-nbl-border p-4">
              <p className="text-xs font-black tracking-widest uppercase text-nbl-gray mb-3">
                Équipe favorite
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-nbl-surface-raised border border-nbl-border flex items-center justify-center text-xs font-black text-nbl-white">
                  BT
                </div>
                <span className="font-black text-nbl-white">
                  BLKTOP — ABIDJAN
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-nbl-surface border border-nbl-border p-4">
              <p className="text-xs font-black tracking-widest uppercase text-nbl-gray mb-3">
                Paramètres du compte
              </p>
              <div className="flex items-center justify-between py-2 border-b border-nbl-border">
                <span className="text-sm text-nbl-white">Notifications</span>
                <span className="text-xs text-nbl-orange font-bold">
                  Activées
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-nbl-white">Langue</span>
                <span className="text-xs text-nbl-gray">Français</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
