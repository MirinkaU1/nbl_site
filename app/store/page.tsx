"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { BottomNav } from "@/components/nbl/bottom-nav"
import { SiteHeader } from "@/components/nbl/site-header"
import { SiteFooter } from "@/components/nbl/site-footer"

const categories = ["TOUT", "MAILLOTS", "T-SHIRTS", "SNEAKERS", "ACCES."] as const
type Category = (typeof categories)[number]

const products = [
  { id: 1, name: "NBL PRO JERSEY 24", price: "15 000", image: "/images/product-jersey.jpg", category: "MAILLOTS", badge: null },
  { id: 2, name: "STREET LEGEND HOODIE", price: "25 000", image: "/images/product-hoodie.jpg", category: "T-SHIRTS", badge: "HOT" },
  { id: 3, name: "COURTSIDE CAP", price: "10 000", image: "/images/product-cap.jpg", category: "ACCES.", badge: null },
  { id: 4, name: "NBL MATCH BALL", price: "35 000", image: "/images/product-ball.jpg", category: "ACCES.", badge: null },
  { id: 5, name: "ELITE SHORTS", price: "12 000", image: "/images/product-shorts.jpg", category: "MAILLOTS", badge: null },
  { id: 6, name: "PRO WRISTBAND", price: "3 000", image: "/images/product-wristband.jpg", category: "ACCES.", badge: null },
]

function ProductCard({ product }: { product: (typeof products)[0] }) {
  const [liked, setLiked] = useState(false)
  return (
    <div className="rounded-2xl bg-nbl-surface border border-nbl-border overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-nbl-surface-raised">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
        {product.badge && (
          <span className="absolute top-2 left-2 px-2 py-1 rounded-md bg-red-500 text-white text-[10px] font-black tracking-widest uppercase">
            {product.badge}
          </span>
        )}
        <button
          onClick={() => setLiked((l) => !l)}
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-nbl-surface/80 backdrop-blur-sm flex items-center justify-center border border-nbl-border hover:bg-nbl-surface transition-colors"
        >
          <Heart size={14} className={cn("transition-colors", liked ? "fill-nbl-orange text-nbl-orange" : "text-nbl-gray")} />
        </button>
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-xs font-black text-nbl-white leading-tight text-balance">{product.name}</p>
          <p className="text-sm font-black text-nbl-white mt-1">
            {product.price} <span className="text-nbl-gray font-normal text-xs">FCFA</span>
          </p>
        </div>
        <button className="mt-auto flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-nbl-orange text-nbl-bg font-black text-[10px] tracking-widest uppercase shadow-[0_2px_10px_rgba(217,104,19,0.3)] hover:bg-nbl-orange-dark active:scale-95 transition-all">
          VOIR LE PRODUIT
        </button>
      </div>
    </div>
  )
}

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState<Category>("TOUT")
  const [cartCount] = useState(2)

  const filtered = activeCategory === "TOUT" ? products : products.filter((p) => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      <SiteHeader cartCount={cartCount} />

      <main className="flex-1">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
          {/* Banner */}
          <div className="relative h-44 lg:h-72 mt-4 lg:mt-8 rounded-2xl overflow-hidden">
            <Image src="/images/store-banner.jpg" alt="Street Kings Collection" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 p-5 lg:p-10 flex flex-col justify-end">
              <span className="inline-flex self-start items-center px-2 py-0.5 rounded-md bg-nbl-orange text-nbl-bg text-[10px] font-black tracking-widest uppercase mb-2">
                New Drop
              </span>
              <h2 className="text-2xl lg:text-4xl font-black uppercase leading-tight text-nbl-white text-balance">
                Street Kings
                <br />
                Collection
              </h2>
            </div>
            <Link
              href="#"
              className="absolute bottom-4 lg:bottom-8 right-4 lg:right-8 flex items-center justify-center w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-nbl-orange/90 text-nbl-bg shadow-[0_4px_14px_rgba(217,104,19,0.4)] hover:bg-nbl-orange transition-colors"
              aria-label="Voir la collection"
            >
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Section title */}
          <div className="flex items-center justify-between mt-6 lg:mt-10 mb-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-nbl-white">Boutique Officielle</h2>
            <button className="text-nbl-orange text-xs font-bold tracking-widest uppercase hover:underline">
              Voir tout
            </button>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase transition-all border",
                  activeCategory === cat
                    ? "bg-nbl-orange text-nbl-bg border-nbl-orange shadow-[0_2px_10px_rgba(217,104,19,0.3)]"
                    : "bg-nbl-surface border-nbl-border text-nbl-gray hover:border-nbl-orange/40"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product grid — 2 cols mobile, 3 cols tablet, 4 cols desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 mt-4 pb-28 lg:pb-12">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
      <BottomNav />
    </div>
  )
}
