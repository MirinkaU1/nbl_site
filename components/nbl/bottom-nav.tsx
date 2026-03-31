"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CalendarDays, ClipboardList, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "ACCUEIL", icon: Home },
  { href: "/programme", label: "PROGRAMME", icon: ClipboardList },
  { href: "/matches", label: "SCORES", icon: CalendarDays },
  { href: "/inscription", label: "INSCRIRE", icon: Users },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-nbl-border bg-nbl-bg/95 backdrop-blur-md">
      <div className="flex items-end justify-around px-2 pb-safe">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-3 text-[10px] font-semibold tracking-widest transition-colors",
                active ? "text-nbl-orange" : "text-nbl-gray"
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Center inscription CTA */}
        <Link
          href="/inscription"
          className="relative -top-3 flex items-center justify-center w-14 h-14 rounded-full bg-nbl-orange shadow-[0_0_20px_rgba(217,104,19,0.5)] transition-transform active:scale-95"
          aria-label="Inscrire mon équipe"
        >
          <Users size={22} className="text-nbl-bg" />
        </Link>

        {navItems.slice(2).map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-3 text-[10px] font-semibold tracking-widest transition-colors",
                active ? "text-nbl-orange" : "text-nbl-gray"
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
