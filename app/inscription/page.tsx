"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/nbl/site-header";
import { SiteFooter } from "@/components/nbl/site-footer";
import { BottomNav } from "@/components/nbl/bottom-nav";
import { Users, CheckCircle, Phone, Mail, AlertCircle } from "lucide-react";

type Category = "Junior" | "D1" | "";

interface FormData {
  category: Category;
  teamName: string;
  captainName: string;
  phone: string;
  email: string;
  commune: string;
  playerCount: string;
  source: string;
}

const communes = [
  "Abobo",
  "Adjamé",
  "Attécoubé",
  "Cocody",
  "Koumassi",
  "Marcory",
  "Plateau",
  "Port-Bouët",
  "Treichville",
  "Yopougon",
  "Autre",
];

export default function InscriptionPage() {
  const [form, setForm] = useState<FormData>({
    category: "",
    teamName: "",
    captainName: "",
    phone: "",
    email: "",
    commune: "",
    playerCount: "5",
    source: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category) {
      setError("Veuillez choisir une catégorie.");
      return;
    }
    if (!form.teamName.trim()) {
      setError("Le nom de l'équipe est requis.");
      return;
    }
    if (!form.captainName.trim()) {
      setError("Le nom du capitaine est requis.");
      return;
    }
    if (!form.phone.trim()) {
      setError("Le numéro de téléphone est requis.");
      return;
    }
    if (!form.commune) {
      setError("Veuillez indiquer votre commune.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-nbl-bg flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-nbl-green/20 border border-nbl-green/40 flex items-center justify-center">
              <CheckCircle size={36} className="text-nbl-green" />
            </div>
            <div>
              <h2 className="font-nbl text-3xl uppercase text-nbl-white mb-2">
                Demande reçue !
              </h2>
              <p className="text-nbl-gray text-sm leading-relaxed">
                L&apos;équipe{" "}
                <span className="text-nbl-white font-bold">
                  {form.teamName}
                </span>{" "}
                est bien enregistrée. Nous vous contacterons au{" "}
                <span className="text-nbl-white font-bold">{form.phone}</span>{" "}
                dans les plus brefs délais pour confirmer votre inscription et
                vous communiquer les modalités de paiement du droit de
                participation.
              </p>
            </div>
            <div className="w-full rounded-2xl bg-nbl-surface border border-nbl-border p-5 text-left flex flex-col gap-3">
              <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase">
                Prochaines étapes
              </p>
              {[
                "On vous rappelle pour confirmer l'inscription",
                "Paiement du droit de participation",
                "Confirmation officielle de votre équipe",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-nbl-orange/20 border border-nbl-orange/40 text-nbl-orange text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-nbl-gray">{step}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-nbl-gray">
              Questions ?{" "}
              <a
                href="tel:+2250798864178"
                className="text-nbl-orange hover:underline"
              >
                +225 07 98 86 41 78
              </a>
            </div>
          </div>
        </main>
        <SiteFooter />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-screen-xl mx-auto px-4 lg:px-8 py-8 w-full">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-nbl-orange text-xs font-black tracking-widest uppercase mb-2">
              Édition 1 · Juillet 2026
            </p>
            <h1 className="font-akira text-4xl lg:text-5xl uppercase text-nbl-white leading-none mb-3">
              Inscrire
              <br />
              <span className="text-nbl-orange">mon équipe</span>
            </h1>
            <p className="text-nbl-gray text-sm leading-relaxed">
              Places limitées :{" "}
              <span className="text-nbl-white font-bold">
                12 équipes Junior
              </span>{" "}
              et <span className="text-nbl-white font-bold">12 équipes D1</span>
              . Remplissez ce formulaire et nous vous contacterons pour
              confirmer votre inscription.
            </p>
          </div>

          {/* Spots remaining */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { cat: "Junior", spots: 9, total: 12 },
              { cat: "D1", spots: 7, total: 12 },
            ].map((c) => (
              <div
                key={c.cat}
                className="rounded-2xl bg-nbl-surface border border-nbl-border p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase">
                    Catégorie {c.cat}
                  </p>
                  <span className="text-xs font-black text-nbl-white">
                    {c.spots} / {c.total}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-nbl-surface-raised overflow-hidden">
                  <div
                    className="h-full rounded-full bg-nbl-orange transition-all"
                    style={{
                      width: `${((c.total - c.spots) / c.total) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-nbl-gray text-xs">
                  {c.spots} places disponibles
                </p>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Category */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black tracking-widest uppercase text-nbl-white">
                Catégorie *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["Junior", "D1"] as Category[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => set("category", cat)}
                    className={`py-4 rounded-xl border font-black text-sm tracking-widest uppercase transition-all ${
                      form.category === cat
                        ? "bg-nbl-orange border-nbl-orange text-nbl-bg shadow-[0_0_16px_rgba(217,104,19,0.3)]"
                        : "bg-nbl-surface border-nbl-border text-nbl-gray hover:border-nbl-orange/40 hover:text-nbl-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Team name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black tracking-widest uppercase text-nbl-white">
                Nom de l&apos;équipe *
              </label>
              <input
                type="text"
                value={form.teamName}
                onChange={(e) => set("teamName", e.target.value)}
                placeholder="Ex : Cocody Ballers"
                className="px-4 py-3.5 rounded-xl bg-nbl-surface border border-nbl-border text-nbl-white text-sm placeholder:text-nbl-gray focus:outline-none focus:border-nbl-orange/60 transition-colors"
              />
            </div>

            {/* Captain name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black tracking-widest uppercase text-nbl-white">
                Nom du capitaine *
              </label>
              <input
                type="text"
                value={form.captainName}
                onChange={(e) => set("captainName", e.target.value)}
                placeholder="Prénom et nom"
                className="px-4 py-3.5 rounded-xl bg-nbl-surface border border-nbl-border text-nbl-white text-sm placeholder:text-nbl-gray focus:outline-none focus:border-nbl-orange/60 transition-colors"
              />
            </div>

            {/* Phone + email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black tracking-widest uppercase text-nbl-white flex items-center gap-1.5">
                  <Phone size={11} className="text-nbl-orange" />
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+225 07 XX XX XX XX"
                  className="px-4 py-3.5 rounded-xl bg-nbl-surface border border-nbl-border text-nbl-white text-sm placeholder:text-nbl-gray focus:outline-none focus:border-nbl-orange/60 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black tracking-widest uppercase text-nbl-white flex items-center gap-1.5">
                  <Mail size={11} className="text-nbl-orange" />
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="capitaine@email.com"
                  className="px-4 py-3.5 rounded-xl bg-nbl-surface border border-nbl-border text-nbl-white text-sm placeholder:text-nbl-gray focus:outline-none focus:border-nbl-orange/60 transition-colors"
                />
              </div>
            </div>

            {/* Commune + players */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black tracking-widest uppercase text-nbl-white">
                  Commune *
                </label>
                <select
                  value={form.commune}
                  onChange={(e) => set("commune", e.target.value)}
                  className="px-4 py-3.5 rounded-xl bg-nbl-surface border border-nbl-border text-nbl-white text-sm focus:outline-none focus:border-nbl-orange/60 transition-colors"
                >
                  <option value="" disabled className="bg-nbl-bg">
                    Sélectionner...
                  </option>
                  {communes.map((c) => (
                    <option key={c} value={c} className="bg-nbl-bg">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black tracking-widest uppercase text-nbl-white flex items-center gap-1.5">
                  <Users size={11} className="text-nbl-orange" />
                  Nombre de joueurs
                </label>
                <select
                  value={form.playerCount}
                  onChange={(e) => set("playerCount", e.target.value)}
                  className="px-4 py-3.5 rounded-xl bg-nbl-surface border border-nbl-border text-nbl-white text-sm focus:outline-none focus:border-nbl-orange/60 transition-colors"
                >
                  {["5", "6", "7", "8"].map((n) => (
                    <option key={n} value={n} className="bg-nbl-bg">
                      {n} joueurs
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* How did you hear */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black tracking-widest uppercase text-nbl-white">
                Comment avez-vous connu le NBL ?
              </label>
              <select
                value={form.source}
                onChange={(e) => set("source", e.target.value)}
                className="px-4 py-3.5 rounded-xl bg-nbl-surface border border-nbl-border text-nbl-white text-sm focus:outline-none focus:border-nbl-orange/60 transition-colors"
              >
                <option value="" className="bg-nbl-bg">
                  Sélectionner...
                </option>
                {[
                  "TikTok / Micro2Baby",
                  "Instagram",
                  "Bouche à oreille",
                  "Ami(e)",
                  "Affiche",
                  "Autre",
                ].map((s) => (
                  <option key={s} value={s} className="bg-nbl-bg">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {/* Payment notice */}
            <div className="rounded-2xl bg-nbl-surface border border-nbl-border p-4 flex flex-col gap-2">
              <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase">
                Droit de participation
              </p>
              <p className="text-nbl-gray text-xs leading-relaxed">
                Après réception de votre demande, notre équipe vous contactera
                pour vous communiquer le montant du droit de participation et
                les modalités de paiement (mobile money).
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-nbl-orange text-nbl-bg font-black text-sm tracking-widest uppercase shadow-[0_4px_20px_rgba(217,104,19,0.4)] hover:bg-nbl-orange-dark active:scale-95 transition-all"
            >
              <Users size={16} />
              Soumettre l&apos;inscription
            </button>
          </form>
        </div>
      </main>

      <SiteFooter />
      <BottomNav />
    </div>
  );
}
