import Link from "next/link";
import Image from "next/image";
import { Instagram, Youtube, Twitter, MapPin, Mail, Phone } from "lucide-react";

const footerNav = [
  {
    heading: "Événement",
    links: [
      { label: "Programme", href: "/programme" },
      { label: "Scores live", href: "/matches" },
      { label: "Classement", href: "/standings" },
      { label: "Inscrire mon équipe", href: "/inscription" },
    ],
  },
  {
    heading: "Boutique",
    links: [
      { label: "Maillots", href: "/store" },
      { label: "Accessoires", href: "/store" },
      { label: "New Drop", href: "/store" },
      { label: "Mon panier", href: "/store" },
    ],
  },
  {
    heading: "NBL",
    links: [
      { label: "À propos", href: "#" },
      { label: "Partenaires", href: "/partenaires" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const socials = [
  { label: "Instagram", icon: Instagram, href: "#" },
  { label: "YouTube", icon: Youtube, href: "#" },
  { label: "TikTok", icon: Twitter, href: "#" },
];

function NBLLogoSmall() {
  return (
    <Link href="/" className="shrink-0">
      <Image
        src="/logo/logo_large.jpeg"
        alt="NBL"
        width={80}
        height={34}
        className="h-8 w-auto object-contain"
      />
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer
      className="relative bg-nbl-surface border-t border-nbl-border mt-16 overflow-hidden"
      role="contentinfo"
    >
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "url('/logo/patern_2.png')",
          backgroundSize: "300px",
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative max-w-screen-xl mx-auto px-4 lg:px-8 py-12">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] gap-10">
          {/* Brand column */}
          <div className="flex flex-col gap-5">
            <NBLLogoSmall />
            <p className="text-nbl-gray text-sm leading-relaxed max-w-xs">
              Le tournoi de street basketball 5v5 le plus électrique
              d&apos;Abidjan. Compétition, culture, communauté.
            </p>
            <div className="flex items-center gap-1 text-nbl-gray text-xs">
              <MapPin size={12} className="shrink-0 text-nbl-orange" />
              <span>Abidjan, Côte d&apos;Ivoire</span>
            </div>
            <div className="flex items-center gap-1 text-nbl-gray text-xs">
              <Mail size={12} className="shrink-0 text-nbl-orange" />
              <a
                href="mailto:nationalbasketballleaders1@gmail.com"
                className="hover:text-nbl-white transition-colors"
              >
                nationalbasketballleaders1@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-1 text-nbl-gray text-xs">
              <Phone size={12} className="shrink-0 text-nbl-orange" />
              <a
                href="tel:+2250798864178"
                className="hover:text-nbl-white transition-colors"
              >
                +225 07 98 86 41 78
              </a>
            </div>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-1">
              {socials.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-nbl-surface-raised border border-nbl-border flex items-center justify-center text-nbl-gray hover:text-nbl-orange hover:border-nbl-orange/40 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {footerNav.map((col) => (
            <div key={col.heading} className="flex flex-col gap-4">
              <h3 className="text-[10px] font-black tracking-widest uppercase text-nbl-orange">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-nbl-gray hover:text-nbl-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Event teaser */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-black tracking-widest uppercase text-nbl-orange">
              L&apos;Événement
            </h3>
            <div className="rounded-2xl bg-nbl-surface-raised border border-nbl-border p-4 flex flex-col gap-3">
              <p className="text-[10px] font-black tracking-widest uppercase text-nbl-orange">
                Édition 1
              </p>
              <p className="text-sm font-black text-nbl-white leading-snug">
                National Basketball Leaders
              </p>
              <div className="w-full h-px bg-nbl-border" />
              <div className="flex items-center gap-1.5 text-xs text-nbl-gray">
                <MapPin size={11} className="text-nbl-orange shrink-0" />
                <span>Abidjan, Côte d&apos;Ivoire</span>
              </div>
              <p className="text-xs font-black text-nbl-white tracking-wide">
                Juillet 2026 · Entrée Gratuite
              </p>
              <Link
                href="/inscription"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-nbl-orange text-nbl-bg font-black text-[10px] tracking-widest uppercase shadow-[0_2px_10px_rgba(217,104,19,0.3)] hover:bg-nbl-orange-dark transition-colors"
              >
                INSCRIRE MON ÉQUIPE
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-nbl-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-nbl-gray">
          <p>
            © {new Date().getFullYear()} National Basketball Leaders. Tous
            droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-nbl-white transition-colors">
              Mentions légales
            </a>
            <a href="#" className="hover:text-nbl-white transition-colors">
              Politique de confidentialité
            </a>
            <a href="#" className="hover:text-nbl-white transition-colors">
              CGU
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
