import { SiteHeader } from "@/components/nbl/site-header";
import { SiteFooter } from "@/components/nbl/site-footer";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import Link from "next/link";

const staff = [
  { name: "DIANÉ Ali", role: "Président", initial: "DA" },
  {
    name: "DABONÉ Koudous",
    role: "Communication · @Micro2Baby",
    initial: "DK",
  },
  {
    name: "COULIBALY Marie-Carole",
    role: "Assistance communication & stands",
    initial: "CM",
  },
  { name: "KOMISSÉ André Josué", role: "Responsable technique", initial: "KA" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-10">
          <p className="text-nbl-orange text-xs font-black tracking-widest uppercase mb-2">
            National Basketball Leaders
          </p>
          <h1 className="font-nbl text-4xl lg:text-5xl uppercase text-nbl-white leading-none mb-3">
            Nous
            <br />
            <span className="text-nbl-orange">contacter</span>
          </h1>
          <p className="text-nbl-gray text-sm leading-relaxed max-w-md">
            Une question sur le tournoi, les inscriptions ou un partenariat ?
            Notre équipe est disponible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left — contact info */}
          <div className="flex flex-col gap-6">
            {/* Contact cards */}
            <div className="flex flex-col gap-3">
              <a
                href="mailto:nationalbasketballleaders1@gmail.com"
                className="group flex items-center gap-4 p-5 rounded-2xl bg-nbl-surface border border-nbl-border hover:border-nbl-orange/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-nbl-orange/15 border border-nbl-orange/30 flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-nbl-orange" />
                </div>
                <div>
                  <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase mb-0.5">
                    Email
                  </p>
                  <p className="text-nbl-white text-sm font-semibold group-hover:text-nbl-orange transition-colors break-all">
                    nationalbasketballleaders1@gmail.com
                  </p>
                </div>
              </a>

              <a
                href="tel:+2250798864178"
                className="group flex items-center gap-4 p-5 rounded-2xl bg-nbl-surface border border-nbl-border hover:border-nbl-orange/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-nbl-orange/15 border border-nbl-orange/30 flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-nbl-orange" />
                </div>
                <div>
                  <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase mb-0.5">
                    Téléphone
                  </p>
                  <p className="text-nbl-white text-sm font-semibold">
                    +225 07 98 86 41 78
                  </p>
                  <p className="text-nbl-white text-sm font-semibold">
                    +225 07 59 22 24 55
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-4 p-5 rounded-2xl bg-nbl-surface border border-nbl-border">
                <div className="w-12 h-12 rounded-xl bg-nbl-green/15 border border-nbl-green/30 flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-nbl-green" />
                </div>
                <div>
                  <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase mb-0.5">
                    Lieu
                  </p>
                  <p className="text-nbl-white text-sm font-semibold">
                    Abidjan, Côte d&apos;Ivoire
                  </p>
                  <p className="text-nbl-gray text-xs">
                    Juillet 2026 · Édition 1
                  </p>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="flex flex-col gap-3">
              <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase">
                Réseaux sociaux
              </p>
              <a
                href="#"
                className="group flex items-center gap-3 p-4 rounded-xl bg-nbl-surface border border-nbl-border hover:border-nbl-orange/40 transition-colors"
              >
                <Instagram
                  size={18}
                  className="text-nbl-gray group-hover:text-nbl-orange transition-colors"
                />
                <span className="text-nbl-gray text-sm group-hover:text-nbl-white transition-colors">
                  @nbl_officiel
                </span>
              </a>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-nbl-surface border border-nbl-border">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-nbl-gray shrink-0"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.83 1.54V6.79a4.85 4.85 0 0 1-1.06-.1z" />
                </svg>
                <span className="text-nbl-gray text-sm">
                  @Micro2Baby (TikTok)
                </span>
              </div>
            </div>
          </div>

          {/* Right — staff + inscription link */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase mb-4">
                L&apos;équipe organisatrice
              </p>
              <div className="flex flex-col gap-3">
                {staff.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center gap-4 p-4 rounded-xl bg-nbl-surface border border-nbl-border"
                  >
                    <div className="w-10 h-10 rounded-full bg-nbl-surface-raised border border-nbl-border flex items-center justify-center shrink-0">
                      <span className="text-xs font-black text-nbl-orange">
                        {member.initial}
                      </span>
                    </div>
                    <div>
                      <p className="text-nbl-white text-sm font-bold">
                        {member.name}
                      </p>
                      <p className="text-nbl-gray text-xs">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-2xl bg-nbl-surface border border-nbl-border p-6 flex flex-col gap-4">
              <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase">
                Prêt à jouer ?
              </p>
              <p className="text-nbl-white font-bold text-sm leading-relaxed">
                Inscrivez votre équipe avant que les places soient complètes.
              </p>
              <Link
                href="/inscription"
                className="flex items-center justify-center py-3 rounded-xl bg-nbl-orange text-nbl-bg font-black text-xs tracking-widest uppercase shadow-[0_2px_12px_rgba(217,104,19,0.35)] hover:bg-nbl-orange-dark transition-colors"
              >
                Inscrire mon équipe
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
