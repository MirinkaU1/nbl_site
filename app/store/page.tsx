"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/nbl/site-header";
import { SiteFooter } from "@/components/nbl/site-footer";

type Category = string;
type StoreProduct = {
  id: string;
  name: string;
  priceCfa: number;
  image: string;
  category: string;
  badge?: string | null;
};

const fallbackProducts: StoreProduct[] = [
  {
    id: "local-1",
    name: "NBL PRO JERSEY 24",
    priceCfa: 15000,
    image: "/images/product-jersey.jpg",
    category: "MAILLOTS",
    badge: null,
  },
  {
    id: "local-2",
    name: "STREET LEGEND HOODIE",
    priceCfa: 25000,
    image: "/images/product-hoodie.jpg",
    category: "T-SHIRTS",
    badge: "HOT",
  },
  {
    id: "local-3",
    name: "COURTSIDE CAP",
    priceCfa: 10000,
    image: "/images/product-cap.jpg",
    category: "ACCES.",
    badge: null,
  },
  {
    id: "local-4",
    name: "NBL MATCH BALL",
    priceCfa: 35000,
    image: "/images/product-ball.jpg",
    category: "ACCES.",
    badge: null,
  },
  {
    id: "local-5",
    name: "ELITE SHORTS",
    priceCfa: 12000,
    image: "/images/product-shorts.jpg",
    category: "MAILLOTS",
    badge: null,
  },
  {
    id: "local-6",
    name: "PRO WRISTBAND",
    priceCfa: 3000,
    image: "/images/product-wristband.jpg",
    category: "ACCES.",
    badge: null,
  },
];

function ProductImage({ product }: { product: StoreProduct }) {
  if (product.image.startsWith("/")) {
    return (
      <Image
        src={product.image}
        alt={product.name}
        fill
        className="object-cover"
      />
    );
  }

  return (
    <img
      src={product.image}
      alt={product.name}
      className="h-full w-full object-cover"
      loading="lazy"
    />
  );
}

function ProductCard({ product }: { product: StoreProduct }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="rounded-2xl bg-nbl-surface border border-nbl-border overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-nbl-surface-raised">
        <ProductImage product={product} />
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
          <Heart
            size={14}
            className={cn(
              "transition-colors",
              liked ? "fill-nbl-orange text-nbl-orange" : "text-nbl-gray",
            )}
          />
        </button>
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-xs font-black text-nbl-white leading-tight text-balance">
            {product.name}
          </p>
          <p className="text-sm font-black text-nbl-white mt-1">
            {product.priceCfa.toLocaleString("fr-FR")}{" "}
            <span className="text-nbl-gray font-normal text-xs">FCFA</span>
          </p>
        </div>
        <button className="mt-auto flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-nbl-orange text-nbl-bg font-black text-[10px] tracking-widest uppercase shadow-[0_2px_10px_rgba(217,104,19,0.3)] hover:bg-nbl-orange-dark active:scale-95 transition-all">
          VOIR LE PRODUIT
        </button>
      </div>
    </div>
  );
}

export default function StorePage() {
  const [products, setProducts] = useState<StoreProduct[]>(fallbackProducts);
  const [activeCategory, setActiveCategory] = useState<Category>("TOUT");
  const [isLiveCatalogue, setIsLiveCatalogue] = useState(false);
  const [cartCount] = useState(2);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      const response = await fetch("/api/store/products", {
        cache: "no-store",
      }).catch(() => null);

      if (!response?.ok) {
        return;
      }

      const json = await response.json().catch(() => null);

      if (!isMounted || !json?.ok || !Array.isArray(json.products)) {
        return;
      }

      if (json.products.length === 0) {
        return;
      }

      const mapped = json.products.map(
        (item: {
          id: string;
          name: string;
          category: string;
          priceCfa: number;
          imageUrl?: string | null;
        }) => ({
          id: item.id,
          name: item.name,
          category: item.category.toUpperCase(),
          priceCfa: item.priceCfa,
          image: item.imageUrl || "/images/product-ball.jpg",
          badge: null,
        }),
      );

      setProducts(mapped);
      setIsLiveCatalogue(true);
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(
    () => [
      "TOUT",
      ...Array.from(new Set(products.map((product) => product.category))),
    ],
    [products],
  );

  useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory("TOUT");
    }
  }, [activeCategory, categories]);

  const filtered =
    activeCategory === "TOUT"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      <SiteHeader cartCount={cartCount} />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Banner */}
          <div className="relative h-44 lg:h-72 mt-4 lg:mt-8 rounded-2xl overflow-hidden">
            <Image
              src="/images/store-banner.jpg"
              alt="Street Kings Collection"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />
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
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-nbl-white">
                Boutique Officielle
              </h2>
              <p
                className={cn(
                  "text-[10px] mt-1 uppercase tracking-widest font-black",
                  isLiveCatalogue ? "text-emerald-400" : "text-nbl-gray",
                )}
              >
                {isLiveCatalogue ? "Catalogue live" : "Catalogue local"}
              </p>
            </div>
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
                    : "bg-nbl-surface border-nbl-border text-nbl-gray hover:border-nbl-orange/40",
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product grid — 2 cols mobile, 3 cols tablet, 4 cols desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 mt-4 pb-12">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
