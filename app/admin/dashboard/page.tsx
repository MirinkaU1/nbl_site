"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  Users,
  Trophy,
  CalendarDays,
  ArrowLeft,
  ShoppingBag,
  UserPlus,
  Save,
  CircleDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TEAMS } from "@/lib/nbl-data";
import { NblSelect, type NblSelectOption } from "@/components/nbl/nbl-select";

type RegistrationStatus =
  | "pending_review"
  | "approved"
  | "waitlist"
  | "rejected";

type RegistrationPaymentStatus = "unpaid" | "partial" | "paid" | "refunded";

interface OperationsData {
  summary: {
    registrationsPending: number;
    registrationsPaid: number;
    teamsActive: number;
    playersActive: number;
    staffActive: number;
    productsActive: number;
    upcomingMatches: number;
  };
  registrations: Array<{
    id: string;
    category: "Junior" | "D1";
    teamName: string;
    captainName: string;
    phone: string;
    commune: string;
    status: RegistrationStatus;
    paymentStatus: RegistrationPaymentStatus;
    registrationFeeCfa: number;
    amountPaidCfa: number;
    createdAt: string;
  }>;
  teams: Array<{
    id: string;
    name: string;
    category: "Junior" | "D1";
    city?: string | null;
    status: "active" | "inactive";
    playerCount: number;
  }>;
  staff: Array<{
    id: string;
    fullName: string;
    role: string;
    phone?: string | null;
    isActive: boolean;
  }>;
  products: Array<{
    id: string;
    name: string;
    category: string;
    priceCfa: number;
    stockQuantity: number;
    isActive: boolean;
  }>;
  matches: Array<{
    id: string;
    status: "live" | "upcoming" | "finished" | "timeout";
    homeTeamId: string;
    awayTeamId: string;
    venue?: string | null;
    scheduledAt?: string | null;
  }>;
}

interface RegistrationEditState {
  status: RegistrationStatus;
  paymentStatus: RegistrationPaymentStatus;
  registrationFeeCfa: string;
  amountPaidCfa: string;
}

type DashboardRegistration = OperationsData["registrations"][number];

const registrationStatusOptions: NblSelectOption[] = [
  { value: "pending_review", label: "pending_review" },
  { value: "approved", label: "approved" },
  { value: "waitlist", label: "waitlist" },
  { value: "rejected", label: "rejected" },
];

const registrationPaymentOptions: NblSelectOption[] = [
  { value: "unpaid", label: "unpaid" },
  { value: "partial", label: "partial" },
  { value: "paid", label: "paid" },
  { value: "refunded", label: "refunded" },
];

const teamCategoryOptions: NblSelectOption[] = [
  { value: "Junior", label: "Junior" },
  { value: "D1", label: "D1" },
];

const playerPositionOptions: NblSelectOption[] = [
  { value: "N/A", label: "N/A" },
  { value: "PG", label: "PG" },
  { value: "SG", label: "SG" },
  { value: "SF", label: "SF" },
  { value: "PF", label: "PF" },
  { value: "C", label: "C" },
];

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border",
        accent
          ? "bg-nbl-orange/10 border-nbl-orange/30"
          : "bg-nbl-surface border-nbl-border",
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          accent ? "bg-nbl-orange/20" : "bg-nbl-surface-raised",
        )}
      >
        <Icon
          size={18}
          className={accent ? "text-nbl-orange" : "text-nbl-gray"}
        />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "text-xl font-black leading-none",
            accent ? "text-nbl-orange" : "text-nbl-white",
          )}
        >
          {value}
        </p>
        <p className="text-xs text-nbl-gray font-semibold mt-0.5">{label}</p>
      </div>
    </div>
  );
}

const adminApiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY;

function makeAdminHeaders() {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (adminApiKey) {
    headers["x-admin-key"] = adminApiKey;
  }

  return headers;
}

async function readJson(response: Response) {
  return response.json().catch(() => null);
}

function resolveTeamName(teamId: string) {
  const existing = TEAMS[teamId as keyof typeof TEAMS];
  return existing?.shortName ?? teamId.toUpperCase();
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return "-";
  }

  return new Date(parsed).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatCfa(value: number) {
  return `${value.toLocaleString("fr-FR")} FCFA`;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<OperationsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [registrationEdits, setRegistrationEdits] = useState<
    Record<string, RegistrationEditState>
  >({});

  const [productForm, setProductForm] = useState({
    name: "",
    category: "MERCH",
    priceCfa: "",
    stockQuantity: "",
    imageUrl: "",
  });

  const [staffForm, setStaffForm] = useState({
    fullName: "",
    role: "",
    phone: "",
    photoUrl: "",
  });

  const [teamForm, setTeamForm] = useState({
    name: "",
    category: "Junior" as "Junior" | "D1",
    city: "",
  });

  const [playerForm, setPlayerForm] = useState({
    teamId: "",
    fullName: "",
    jerseyNumber: "",
    position: "N/A" as "PG" | "SG" | "SF" | "PF" | "C" | "N/A",
    photoUrl: "",
  });

  const [matchForm, setMatchForm] = useState({
    id: "",
    homeTeamId: "",
    awayTeamId: "",
    venue: "",
    scheduledAt: "",
  });

  const knownTeamIds = useMemo(() => Object.keys(TEAMS), []);
  const teamOptions = useMemo(
    () =>
      (data?.teams ?? []).map((team) => ({
        value: team.id,
        label: team.name,
      })),
    [data?.teams],
  );

  function registrationDraftFrom(
    registration: DashboardRegistration,
  ): RegistrationEditState {
    return {
      status: registration.status,
      paymentStatus: registration.paymentStatus,
      registrationFeeCfa: String(registration.registrationFeeCfa),
      amountPaidCfa: String(registration.amountPaidCfa),
    };
  }

  function setRegistrationEdit(
    registration: DashboardRegistration,
    patch: Partial<RegistrationEditState>,
  ) {
    setRegistrationEdits((previous) => ({
      ...previous,
      [registration.id]: {
        ...(previous[registration.id] ?? registrationDraftFrom(registration)),
        ...patch,
      },
    }));
  }

  async function loadOperations() {
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/admin/operations", {
      headers: makeAdminHeaders(),
      cache: "no-store",
    }).catch(() => null);

    if (!response) {
      setError("Erreur reseau pendant le chargement admin.");
      setIsLoading(false);
      return;
    }

    const json = await readJson(response);

    if (!response.ok || !json?.ok) {
      setError(json?.error || "Impossible de charger les donnees admin.");
      setIsLoading(false);
      return;
    }

    setData(json);
    setIsLoading(false);
  }

  useEffect(() => {
    loadOperations();
  }, []);

  useEffect(() => {
    if (!data) {
      return;
    }

    setRegistrationEdits((previous) => {
      const next = { ...previous };

      for (const registration of data.registrations) {
        if (!next[registration.id]) {
          next[registration.id] = registrationDraftFrom(registration);
        }
      }

      return next;
    });

    if (!playerForm.teamId && data.teams[0]) {
      setPlayerForm((previous) => ({ ...previous, teamId: data.teams[0].id }));
    }
  }, [data, playerForm.teamId]);

  async function performAction(
    callback: () => Promise<void>,
    successMessage: string,
  ) {
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      await callback();
      setMessage(successMessage);
      await loadOperations();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Operation admin impossible",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function patchRegistration(registrationId: string) {
    const edit = registrationEdits[registrationId];

    if (!edit) {
      return;
    }

    await performAction(async () => {
      const response = await fetch(
        `/api/admin/registrations/${registrationId}`,
        {
          method: "PATCH",
          headers: makeAdminHeaders(),
          body: JSON.stringify({
            status: edit.status,
            paymentStatus: edit.paymentStatus,
            registrationFeeCfa: Number(edit.registrationFeeCfa) || 0,
            amountPaidCfa: Number(edit.amountPaidCfa) || 0,
            createTeamOnApproval: true,
          }),
        },
      );

      const json = await readJson(response);

      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || "Mise a jour inscription impossible");
      }
    }, "Inscription mise a jour");
  }

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();

    await performAction(async () => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: makeAdminHeaders(),
        body: JSON.stringify({
          name: productForm.name,
          category: productForm.category,
          priceCfa: Number(productForm.priceCfa) || 0,
          stockQuantity: Number(productForm.stockQuantity) || 0,
          imageUrl: productForm.imageUrl || undefined,
        }),
      });

      const json = await readJson(response);
      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || "Creation produit impossible");
      }

      setProductForm({
        name: "",
        category: "MERCH",
        priceCfa: "",
        stockQuantity: "",
        imageUrl: "",
      });
    }, "Produit ajoute");
  }

  async function createStaff(e: React.FormEvent) {
    e.preventDefault();

    await performAction(async () => {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: makeAdminHeaders(),
        body: JSON.stringify({
          fullName: staffForm.fullName,
          role: staffForm.role,
          phone: staffForm.phone || undefined,
          photoUrl: staffForm.photoUrl || undefined,
        }),
      });

      const json = await readJson(response);
      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || "Creation staff impossible");
      }

      setStaffForm({
        fullName: "",
        role: "",
        phone: "",
        photoUrl: "",
      });
    }, "Membre du staff ajoute");
  }

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();

    await performAction(async () => {
      const response = await fetch("/api/admin/teams", {
        method: "POST",
        headers: makeAdminHeaders(),
        body: JSON.stringify({
          name: teamForm.name,
          category: teamForm.category,
          city: teamForm.city || undefined,
        }),
      });

      const json = await readJson(response);
      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || "Creation equipe impossible");
      }

      setTeamForm({
        name: "",
        category: "Junior",
        city: "",
      });
    }, "Equipe ajoutee");
  }

  async function createPlayer(e: React.FormEvent) {
    e.preventDefault();

    await performAction(async () => {
      const response = await fetch("/api/admin/team-players", {
        method: "POST",
        headers: makeAdminHeaders(),
        body: JSON.stringify({
          teamId: playerForm.teamId,
          fullName: playerForm.fullName,
          jerseyNumber: playerForm.jerseyNumber
            ? Number(playerForm.jerseyNumber)
            : undefined,
          position: playerForm.position,
          photoUrl: playerForm.photoUrl || undefined,
        }),
      });

      const json = await readJson(response);
      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || "Creation joueur impossible");
      }

      setPlayerForm((previous) => ({
        ...previous,
        fullName: "",
        jerseyNumber: "",
        position: "N/A",
        photoUrl: "",
      }));
    }, "Joueur ajoute");
  }

  async function createMatch(e: React.FormEvent) {
    e.preventDefault();

    await performAction(async () => {
      const response = await fetch("/api/admin/matches", {
        method: "POST",
        headers: makeAdminHeaders(),
        body: JSON.stringify({
          id: matchForm.id || undefined,
          homeTeamId: matchForm.homeTeamId,
          awayTeamId: matchForm.awayTeamId,
          venue: matchForm.venue || undefined,
          scheduledAt: matchForm.scheduledAt
            ? new Date(matchForm.scheduledAt).toISOString()
            : undefined,
          status: "upcoming",
          quarter: "H1",
          clockSeconds: 600,
        }),
      });

      const json = await readJson(response);
      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || "Creation match impossible");
      }

      setMatchForm({
        id: "",
        homeTeamId: "",
        awayTeamId: "",
        venue: "",
        scheduledAt: "",
      });
    }, "Match planifie");
  }

  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 lg:px-8 py-4 border-b border-nbl-border bg-nbl-bg/98 backdrop-blur-md">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-nbl-gray hover:text-nbl-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-xs font-black tracking-widest uppercase">
            Console
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Image
            src="/logo/logo_large.jpeg"
            alt="NBL"
            width={64}
            height={27}
            className="h-7 w-auto object-contain"
          />
          <span className="ml-1 px-2 py-0.5 rounded-lg bg-nbl-surface-raised border border-nbl-border text-[10px] font-black text-nbl-gray uppercase tracking-widest">
            ADMIN
          </span>
        </div>
        <Link
          href="/"
          className="text-nbl-gray text-xs font-semibold hover:text-nbl-white transition-colors"
        >
          Vue publique
        </Link>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-6 pb-12 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-black uppercase tracking-tight text-nbl-white">
            Dashboard Operations
          </h1>
          <p className="text-sm text-nbl-gray mt-0.5">
            Inscriptions, paiements, equipes, joueurs, staff, produits, matchs
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        {isLoading && !data ? (
          <div className="text-nbl-gray text-sm">
            Chargement des operations...
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              <SummaryCard
                label="Inscriptions en attente"
                value={data.summary.registrationsPending}
                icon={Users}
                accent={data.summary.registrationsPending > 0}
              />
              <SummaryCard
                label="Paiements confirmes"
                value={data.summary.registrationsPaid}
                icon={CircleDollarSign}
              />
              <SummaryCard
                label="Produits actifs"
                value={data.summary.productsActive}
                icon={ShoppingBag}
              />
              <SummaryCard
                label="Matchs a planifier"
                value={data.summary.upcomingMatches}
                icon={CalendarDays}
                accent
              />
            </div>

            <section className="rounded-2xl bg-nbl-surface border border-nbl-border p-4 mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-black tracking-widest uppercase text-nbl-orange">
                  Inscriptions equipes
                </h2>
                <span className="text-[10px] uppercase tracking-widest text-nbl-gray">
                  suivi paiement + validation
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-nbl-gray text-[11px] uppercase tracking-widest">
                      <th className="py-2 pr-3">Equipe</th>
                      <th className="py-2 pr-3">Categorie</th>
                      <th className="py-2 pr-3">Telephone</th>
                      <th className="py-2 pr-3">Statut</th>
                      <th className="py-2 pr-3">Paiement</th>
                      <th className="py-2 pr-3">Frais</th>
                      <th className="py-2 pr-3">Paye</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.registrations.map((registration) => {
                      const edit = registrationEdits[registration.id];

                      return (
                        <tr
                          key={registration.id}
                          className="border-t border-nbl-border/40"
                        >
                          <td className="py-2 pr-3 text-nbl-white font-semibold">
                            {registration.teamName}
                          </td>
                          <td className="py-2 pr-3 text-nbl-gray">
                            {registration.category}
                          </td>
                          <td className="py-2 pr-3 text-nbl-gray">
                            {registration.phone}
                          </td>
                          <td className="py-2 pr-3">
                            <NblSelect
                              ariaLabel="Statut inscription"
                              value={edit?.status ?? registration.status}
                              onValueChange={(value) =>
                                setRegistrationEdit(registration, {
                                  status: value as RegistrationStatus,
                                })
                              }
                              placeholder="Statut"
                              options={registrationStatusOptions}
                              triggerClassName="h-8 min-w-[152px] rounded-lg bg-nbl-surface-raised border-nbl-border text-xs text-nbl-white"
                              contentClassName="z-[80]"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <NblSelect
                              ariaLabel="Statut paiement"
                              value={
                                edit?.paymentStatus ??
                                registration.paymentStatus
                              }
                              onValueChange={(value) =>
                                setRegistrationEdit(registration, {
                                  paymentStatus:
                                    value as RegistrationPaymentStatus,
                                })
                              }
                              placeholder="Paiement"
                              options={registrationPaymentOptions}
                              triggerClassName="h-8 min-w-[132px] rounded-lg bg-nbl-surface-raised border-nbl-border text-xs text-nbl-white"
                              contentClassName="z-[80]"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              value={
                                edit?.registrationFeeCfa ??
                                String(registration.registrationFeeCfa)
                              }
                              onChange={(event) =>
                                setRegistrationEdit(registration, {
                                  registrationFeeCfa: event.target.value,
                                })
                              }
                              className="w-24 px-2 py-1 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-xs"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              value={
                                edit?.amountPaidCfa ??
                                String(registration.amountPaidCfa)
                              }
                              onChange={(event) =>
                                setRegistrationEdit(registration, {
                                  amountPaidCfa: event.target.value,
                                })
                              }
                              className="w-24 px-2 py-1 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-xs"
                            />
                          </td>
                          <td className="py-2">
                            <button
                              onClick={() => patchRegistration(registration.id)}
                              disabled={isSaving}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-nbl-orange text-nbl-bg text-[10px] font-black uppercase tracking-widest"
                            >
                              <Save size={12} />
                              Sauver
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              <section className="rounded-2xl bg-nbl-surface border border-nbl-border p-4">
                <h2 className="text-xs font-black tracking-widest uppercase text-nbl-orange mb-3">
                  Ajouter produit ecommerce
                </h2>
                <form
                  onSubmit={createProduct}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  <input
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Nom produit"
                    className="px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                    required
                  />
                  <input
                    value={productForm.category}
                    onChange={(event) =>
                      setProductForm((previous) => ({
                        ...previous,
                        category: event.target.value,
                      }))
                    }
                    placeholder="Categorie"
                    className="px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                    required
                  />
                  <input
                    value={productForm.priceCfa}
                    onChange={(event) =>
                      setProductForm((previous) => ({
                        ...previous,
                        priceCfa: event.target.value,
                      }))
                    }
                    placeholder="Prix FCFA"
                    type="number"
                    min={0}
                    className="px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                    required
                  />
                  <input
                    value={productForm.stockQuantity}
                    onChange={(event) =>
                      setProductForm((previous) => ({
                        ...previous,
                        stockQuantity: event.target.value,
                      }))
                    }
                    placeholder="Stock"
                    type="number"
                    min={0}
                    className="px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                    required
                  />
                  <input
                    value={productForm.imageUrl}
                    onChange={(event) =>
                      setProductForm((previous) => ({
                        ...previous,
                        imageUrl: event.target.value,
                      }))
                    }
                    placeholder="URL image (optionnel)"
                    className="sm:col-span-2 px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="sm:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-nbl-orange text-nbl-bg text-xs font-black uppercase tracking-widest"
                  >
                    <ShoppingBag size={14} />
                    Ajouter produit
                  </button>
                </form>

                <div className="mt-4 space-y-2">
                  {data.products.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border"
                    >
                      <div>
                        <p className="text-sm font-semibold text-nbl-white">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-nbl-gray">
                          {product.category} · stock {product.stockQuantity}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-nbl-orange">
                        {formatCfa(product.priceCfa)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl bg-nbl-surface border border-nbl-border p-4">
                <h2 className="text-xs font-black tracking-widest uppercase text-nbl-orange mb-3">
                  Ajouter staff
                </h2>
                <form
                  onSubmit={createStaff}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  <input
                    value={staffForm.fullName}
                    onChange={(event) =>
                      setStaffForm((previous) => ({
                        ...previous,
                        fullName: event.target.value,
                      }))
                    }
                    placeholder="Nom complet"
                    className="px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                    required
                  />
                  <input
                    value={staffForm.role}
                    onChange={(event) =>
                      setStaffForm((previous) => ({
                        ...previous,
                        role: event.target.value,
                      }))
                    }
                    placeholder="Role"
                    className="px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                    required
                  />
                  <input
                    value={staffForm.phone}
                    onChange={(event) =>
                      setStaffForm((previous) => ({
                        ...previous,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="Telephone"
                    className="px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                  />
                  <input
                    value={staffForm.photoUrl}
                    onChange={(event) =>
                      setStaffForm((previous) => ({
                        ...previous,
                        photoUrl: event.target.value,
                      }))
                    }
                    placeholder="URL photo"
                    className="px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="sm:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-nbl-orange text-nbl-bg text-xs font-black uppercase tracking-widest"
                  >
                    <UserPlus size={14} />
                    Ajouter staff
                  </button>
                </form>

                <div className="mt-4 space-y-2">
                  {data.staff.slice(0, 5).map((staff) => (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border"
                    >
                      <div>
                        <p className="text-sm font-semibold text-nbl-white">
                          {staff.fullName}
                        </p>
                        <p className="text-[11px] text-nbl-gray">
                          {staff.role} · {staff.phone || "-"}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] uppercase tracking-widest font-black",
                          staff.isActive ? "text-emerald-400" : "text-nbl-gray",
                        )}
                      >
                        {staff.isActive ? "actif" : "inactif"}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              <section className="rounded-2xl bg-nbl-surface border border-nbl-border p-4">
                <h2 className="text-xs font-black tracking-widest uppercase text-nbl-orange mb-3">
                  Equipes & joueurs
                </h2>
                <form
                  onSubmit={createTeam}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4"
                >
                  <input
                    value={teamForm.name}
                    onChange={(event) =>
                      setTeamForm((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Nom equipe"
                    className="px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                    required
                  />
                  <NblSelect
                    ariaLabel="Categorie equipe"
                    value={teamForm.category}
                    onValueChange={(value) =>
                      setTeamForm((previous) => ({
                        ...previous,
                        category: value as "Junior" | "D1",
                      }))
                    }
                    placeholder="Categorie"
                    options={teamCategoryOptions}
                    triggerClassName="h-10 rounded-lg bg-nbl-surface-raised border-nbl-border text-sm text-nbl-white"
                    className="gap-0"
                    contentClassName="z-[80]"
                  />
                  <input
                    value={teamForm.city}
                    onChange={(event) =>
                      setTeamForm((previous) => ({
                        ...previous,
                        city: event.target.value,
                      }))
                    }
                    placeholder="Ville"
                    className="px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="sm:col-span-3 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-nbl-orange text-nbl-bg text-xs font-black uppercase tracking-widest"
                  >
                    <Users size={14} />
                    Ajouter equipe
                  </button>
                </form>

                <form
                  onSubmit={createPlayer}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4"
                >
                  <NblSelect
                    ariaLabel="Equipe joueur"
                    value={playerForm.teamId}
                    onValueChange={(value) =>
                      setPlayerForm((previous) => ({
                        ...previous,
                        teamId: value,
                      }))
                    }
                    placeholder="Selectionner une equipe"
                    options={teamOptions}
                    disabled={teamOptions.length === 0}
                    triggerClassName="h-10 rounded-lg bg-nbl-surface-raised border-nbl-border text-sm text-nbl-white"
                    className="gap-0"
                    contentClassName="z-[80]"
                  />
                  <input
                    value={playerForm.fullName}
                    onChange={(event) =>
                      setPlayerForm((previous) => ({
                        ...previous,
                        fullName: event.target.value,
                      }))
                    }
                    placeholder="Nom joueur"
                    className="px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                    required
                  />
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={playerForm.jerseyNumber}
                    onChange={(event) =>
                      setPlayerForm((previous) => ({
                        ...previous,
                        jerseyNumber: event.target.value,
                      }))
                    }
                    placeholder="Numero"
                    className="px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                  />
                  <NblSelect
                    ariaLabel="Poste joueur"
                    value={playerForm.position}
                    onValueChange={(value) =>
                      setPlayerForm((previous) => ({
                        ...previous,
                        position: value as
                          | "PG"
                          | "SG"
                          | "SF"
                          | "PF"
                          | "C"
                          | "N/A",
                      }))
                    }
                    placeholder="Poste"
                    options={playerPositionOptions}
                    triggerClassName="h-10 rounded-lg bg-nbl-surface-raised border-nbl-border text-sm text-nbl-white"
                    className="gap-0"
                    contentClassName="z-[80]"
                  />
                  <input
                    value={playerForm.photoUrl}
                    onChange={(event) =>
                      setPlayerForm((previous) => ({
                        ...previous,
                        photoUrl: event.target.value,
                      }))
                    }
                    placeholder="URL photo"
                    className="sm:col-span-2 px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="sm:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-nbl-orange text-nbl-bg text-xs font-black uppercase tracking-widest"
                  >
                    <UserPlus size={14} />
                    Ajouter joueur
                  </button>
                </form>

                <div className="space-y-2">
                  {data.teams.slice(0, 6).map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border"
                    >
                      <div>
                        <p className="text-sm font-semibold text-nbl-white">
                          {team.name}
                        </p>
                        <p className="text-[11px] text-nbl-gray">
                          {team.category} · {team.city || "-"}
                        </p>
                      </div>
                      <span className="text-xs text-nbl-orange font-bold">
                        {team.playerCount} joueurs
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl bg-nbl-surface border border-nbl-border p-4">
                <h2 className="text-xs font-black tracking-widest uppercase text-nbl-orange mb-3">
                  Planifier match
                </h2>

                <form
                  onSubmit={createMatch}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4"
                >
                  <input
                    value={matchForm.id}
                    onChange={(event) =>
                      setMatchForm((previous) => ({
                        ...previous,
                        id: event.target.value,
                      }))
                    }
                    placeholder="ID match (optionnel)"
                    className="sm:col-span-2 px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                  />
                  <input
                    list="known-team-ids"
                    value={matchForm.homeTeamId}
                    onChange={(event) =>
                      setMatchForm((previous) => ({
                        ...previous,
                        homeTeamId: event.target.value,
                      }))
                    }
                    placeholder="Home team id"
                    className="px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                    required
                  />
                  <input
                    list="known-team-ids"
                    value={matchForm.awayTeamId}
                    onChange={(event) =>
                      setMatchForm((previous) => ({
                        ...previous,
                        awayTeamId: event.target.value,
                      }))
                    }
                    placeholder="Away team id"
                    className="px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                    required
                  />
                  <datalist id="known-team-ids">
                    {knownTeamIds.map((teamId) => (
                      <option key={teamId} value={teamId} />
                    ))}
                  </datalist>
                  <input
                    value={matchForm.venue}
                    onChange={(event) =>
                      setMatchForm((previous) => ({
                        ...previous,
                        venue: event.target.value,
                      }))
                    }
                    placeholder="Venue"
                    className="sm:col-span-2 px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                  />
                  <input
                    type="datetime-local"
                    value={matchForm.scheduledAt}
                    onChange={(event) =>
                      setMatchForm((previous) => ({
                        ...previous,
                        scheduledAt: event.target.value,
                      }))
                    }
                    className="sm:col-span-2 px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border text-nbl-white text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="sm:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-nbl-orange text-nbl-bg text-xs font-black uppercase tracking-widest"
                  >
                    <Play size={14} />
                    Creer match
                  </button>
                </form>

                <div className="space-y-2">
                  {data.matches.slice(0, 8).map((match) => (
                    <div
                      key={match.id}
                      className="px-3 py-2 rounded-lg bg-nbl-surface-raised border border-nbl-border"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-nbl-white">
                          {resolveTeamName(match.homeTeamId)} vs{" "}
                          {resolveTeamName(match.awayTeamId)}
                        </p>
                        <span
                          className={cn(
                            "text-[10px] uppercase tracking-widest font-black",
                            match.status === "live"
                              ? "text-nbl-orange"
                              : "text-nbl-gray",
                          )}
                        >
                          {match.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-nbl-gray mt-0.5">
                        {match.venue || "Venue a definir"} ·{" "}
                        {formatDate(match.scheduledAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="rounded-2xl bg-nbl-surface border border-nbl-border p-4">
              <h2 className="text-xs font-black tracking-widest uppercase text-nbl-orange mb-3">
                Synthese rapide
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="rounded-xl bg-nbl-surface-raised border border-nbl-border p-3">
                  <p className="text-nbl-gray text-[11px] uppercase tracking-widest">
                    Equipes actives
                  </p>
                  <p className="text-nbl-white font-black text-xl mt-1">
                    {data.summary.teamsActive}
                  </p>
                </div>
                <div className="rounded-xl bg-nbl-surface-raised border border-nbl-border p-3">
                  <p className="text-nbl-gray text-[11px] uppercase tracking-widest">
                    Joueurs actifs
                  </p>
                  <p className="text-nbl-white font-black text-xl mt-1">
                    {data.summary.playersActive}
                  </p>
                </div>
                <div className="rounded-xl bg-nbl-surface-raised border border-nbl-border p-3">
                  <p className="text-nbl-gray text-[11px] uppercase tracking-widest">
                    Staff actif
                  </p>
                  <p className="text-nbl-white font-black text-xl mt-1">
                    {data.summary.staffActive}
                  </p>
                </div>
                <div className="rounded-xl bg-nbl-surface-raised border border-nbl-border p-3">
                  <p className="text-nbl-gray text-[11px] uppercase tracking-widest">
                    Paiements OK
                  </p>
                  <p className="text-nbl-white font-black text-xl mt-1">
                    {data.summary.registrationsPaid}
                  </p>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
