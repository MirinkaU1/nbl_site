"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Camera,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Upload,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/nbl/site-header";
import { SiteFooter } from "@/components/nbl/site-footer";
import { NblSelect, type NblSelectOption } from "@/components/nbl/nbl-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Category = "Junior" | "D1" | "";
type Position = "PG" | "SG" | "SF" | "PF" | "C" | "N/A";
type InscriptionStep = 1 | 2 | 3;
type StepDirection = "forward" | "backward";

interface PlayerDraft {
  fullName: string;
  jerseyNumber: string;
  position: Position;
  photoUrl: string;
  photoFileName: string;
}

interface FormData {
  category: Category;
  teamName: string;
  captainName: string;
  phone: string;
  email: string;
  commune: string;
  playerCount: string;
  source: string;
  notes: string;
  players: PlayerDraft[];
  captainIndex: number;
}

interface SpotsState {
  Junior: {
    capacity: number;
    activeRegistrations: number;
    approved: number;
    remaining: number;
  };
  D1: {
    capacity: number;
    activeRegistrations: number;
    approved: number;
    remaining: number;
  };
}

interface SubmissionState {
  registrationId: string;
  paymentStatus: string;
}

type EditableField =
  | "teamName"
  | "captainName"
  | "phone"
  | "email"
  | "commune"
  | "playerCount"
  | "source"
  | "notes";

const MIN_PLAYERS = 5;
const MAX_PLAYERS = 12;
const MAX_PHOTO_UPLOAD_BYTES = 2 * 1024 * 1024;

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

const positions: Position[] = ["PG", "SG", "SF", "PF", "C", "N/A"];

const sources = [
  "TikTok / Micro2Baby",
  "Instagram",
  "Bouche à oreille",
  "Ami(e)",
  "Affiche",
  "Autre",
];

const inscriptionSteps = [
  {
    id: 1 as const,
    title: "Equipe",
    subtitle: "Coordonnees",
  },
  {
    id: 2 as const,
    title: "Joueurs",
    subtitle: "Roster & photos",
  },
  {
    id: 3 as const,
    title: "Validation",
    subtitle: "Confirmation",
  },
];

const communeOptions: NblSelectOption[] = communes.map((commune) => ({
  value: commune,
  label: commune,
}));

const sourceOptions: NblSelectOption[] = sources.map((source) => ({
  value: source,
  label: source,
}));

const playerCountOptions: NblSelectOption[] = Array.from(
  { length: MAX_PLAYERS - MIN_PLAYERS + 1 },
  (_, index) => {
    const value = String(MIN_PLAYERS + index);
    return {
      value,
      label: `${value} joueurs`,
    };
  },
);

const positionOptions: NblSelectOption[] = positions.map((position) => ({
  value: position,
  label: position,
}));

function createPlayerDraft(): PlayerDraft {
  return {
    fullName: "",
    jerseyNumber: "",
    position: "N/A",
    photoUrl: "",
    photoFileName: "",
  };
}

function buildRoster(size: number, current: PlayerDraft[]) {
  const normalizedSize = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, size));
  const roster = [...current.slice(0, normalizedSize)];

  while (roster.length < normalizedSize) {
    roster.push(createPlayerDraft());
  }

  return roster;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Invalid file format"));
    };

    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

const initialSpots: SpotsState = {
  Junior: {
    capacity: 12,
    activeRegistrations: 3,
    approved: 0,
    remaining: 9,
  },
  D1: {
    capacity: 12,
    activeRegistrations: 5,
    approved: 0,
    remaining: 7,
  },
};

export default function InscriptionPage() {
  const [form, setForm] = useState<FormData>({
    category: "",
    teamName: "",
    captainName: "",
    phone: "",
    email: "",
    commune: "",
    playerCount: String(MIN_PLAYERS),
    source: "",
    notes: "",
    players: buildRoster(MIN_PLAYERS, []),
    captainIndex: 0,
  });
  const [step, setStep] = useState<InscriptionStep>(1);
  const [stepDirection, setStepDirection] = useState<StepDirection>("forward");
  const [submitted, setSubmitted] = useState(false);
  const [submission, setSubmission] = useState<SubmissionState | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spots, setSpots] = useState<SpotsState>(initialSpots);

  const inputClassName =
    "h-12 rounded-xl border-nbl-border bg-nbl-surface text-nbl-white placeholder:text-nbl-gray focus-visible:border-nbl-orange/60 focus-visible:ring-nbl-orange/20";

  function setField(field: EditableField, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setError("");
  }

  function setCategory(category: Category) {
    setForm((previous) => ({
      ...previous,
      category,
    }));
    setError("");
  }

  function setPlayer(index: number, field: keyof PlayerDraft, value: string) {
    setForm((previous) => {
      const nextPlayers = [...previous.players];
      const current = nextPlayers[index] ?? createPlayerDraft();
      nextPlayers[index] = {
        ...current,
        [field]: value,
      };

      return {
        ...previous,
        players: nextPlayers,
        captainName:
          field === "fullName" && previous.captainIndex === index
            ? value
            : previous.captainName,
      };
    });
    setError("");
  }

  function setCaptain(index: number) {
    setForm((previous) => ({
      ...previous,
      captainIndex: index,
      captainName: previous.players[index]?.fullName || previous.captainName,
    }));
    setError("");
  }

  function moveToStep(nextStep: InscriptionStep) {
    if (nextStep === step) {
      return;
    }

    setStepDirection(nextStep > step ? "forward" : "backward");
    setStep(nextStep);
    setError("");
  }

  function validateStepOne() {
    if (!form.category) {
      setError("Veuillez choisir une categorie.");
      return false;
    }

    if (!form.teamName.trim()) {
      setError("Le nom de l'equipe est requis.");
      return false;
    }

    if (!form.captainName.trim()) {
      setError("Le nom du capitaine est requis.");
      return false;
    }

    if (!form.phone.trim()) {
      setError("Le numero de telephone est requis.");
      return false;
    }

    if (!form.commune.trim()) {
      setError("Veuillez indiquer votre commune.");
      return false;
    }

    return true;
  }

  function validateStepTwo() {
    const rosterSize = Number(form.playerCount) || MIN_PLAYERS;
    const selectedPlayers = form.players.slice(0, rosterSize);

    const emptyPlayerIndex = selectedPlayers.findIndex(
      (player) => !player.fullName.trim(),
    );

    if (emptyPlayerIndex >= 0) {
      setError(`Le nom du joueur ${emptyPlayerIndex + 1} est requis.`);
      return false;
    }

    return true;
  }

  function handleNextStep() {
    if (step === 1 && !validateStepOne()) {
      return;
    }

    if (step === 2 && !validateStepTwo()) {
      return;
    }

    if (step < 3) {
      moveToStep((step + 1) as InscriptionStep);
    }
  }

  function handlePreviousStep() {
    if (step > 1) {
      moveToStep((step - 1) as InscriptionStep);
    }
  }

  async function handlePhotoUpload(index: number, file: File | null) {
    if (!file) {
      setPlayer(index, "photoUrl", "");
      setPlayer(index, "photoFileName", "");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(`Le fichier du joueur ${index + 1} doit etre une image.`);
      return;
    }

    if (file.size > MAX_PHOTO_UPLOAD_BYTES) {
      setError(
        `La photo du joueur ${index + 1} depasse 2 Mo. Reduisez sa taille.`,
      );
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);

      setForm((previous) => {
        const nextPlayers = [...previous.players];
        const current = nextPlayers[index] ?? createPlayerDraft();

        nextPlayers[index] = {
          ...current,
          photoUrl: dataUrl,
          photoFileName: file.name,
        };

        return {
          ...previous,
          players: nextPlayers,
        };
      });

      setError("");
    } catch {
      setError(`Impossible de lire la photo du joueur ${index + 1}.`);
    }
  }

  useEffect(() => {
    const rosterSize = Number(form.playerCount) || MIN_PLAYERS;

    setForm((previous) => {
      const nextPlayers = buildRoster(rosterSize, previous.players);
      const nextCaptainIndex = Math.min(
        previous.captainIndex,
        nextPlayers.length - 1,
      );

      return {
        ...previous,
        players: nextPlayers,
        captainIndex: nextCaptainIndex,
      };
    });
  }, [form.playerCount]);

  useEffect(() => {
    let isMounted = true;

    async function loadSpots() {
      const response = await fetch("/api/registrations", {
        cache: "no-store",
      }).catch(() => null);

      if (!response?.ok) {
        return;
      }

      const json = await response.json().catch(() => null);
      if (!json?.ok || !json.categories || !isMounted) {
        return;
      }

      setSpots(json.categories);
    }

    void loadSpots();

    return () => {
      isMounted = false;
    };
  }, []);

  const roster = useMemo(() => {
    const count = Number(form.playerCount) || MIN_PLAYERS;
    return form.players.slice(0, count);
  }, [form.playerCount, form.players]);

  const summaryPlayers = useMemo(
    () => roster.filter((player) => player.fullName.trim().length > 0),
    [roster],
  );

  const selectedCategorySpots = form.category ? spots[form.category] : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (step !== 3) {
      handleNextStep();
      return;
    }

    if (!validateStepOne()) {
      moveToStep(1);
      return;
    }

    if (!validateStepTwo()) {
      moveToStep(2);
      return;
    }

    const rosterSize = Number(form.playerCount) || MIN_PLAYERS;
    const selectedPlayers = form.players.slice(0, rosterSize);
    const safeCaptainIndex = Math.min(
      form.captainIndex,
      selectedPlayers.length - 1,
    );
    const captainNameFromRoster =
      selectedPlayers[safeCaptainIndex]?.fullName.trim();

    setIsSubmitting(true);
    setError("");

    const payload = {
      category: form.category,
      teamName: form.teamName.trim(),
      captainName: captainNameFromRoster || form.captainName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      commune: form.commune,
      playerCount: rosterSize,
      source: form.source,
      notes: form.notes,
      players: selectedPlayers.map((player, index) => ({
        fullName: player.fullName.trim(),
        jerseyNumber: player.jerseyNumber
          ? Number(player.jerseyNumber)
          : undefined,
        position: player.position,
        photoUrl: player.photoUrl.trim() || undefined,
        isCaptain: index === safeCaptainIndex,
      })),
    };

    const response = await fetch("/api/registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (!response) {
      setIsSubmitting(false);
      setError("Erreur reseau. Veuillez reessayer.");
      return;
    }

    const json = await response.json().catch(() => null);

    if (!response.ok || !json?.ok) {
      setIsSubmitting(false);
      setError(json?.error || "Impossible d'enregistrer l'inscription.");
      return;
    }

    setSubmission({
      registrationId: json.registration.id,
      paymentStatus: json.registration.paymentStatus,
    });
    setSubmitted(true);
    setIsSubmitting(false);
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
                Demande recue !
              </h2>
              <p className="text-nbl-gray text-sm leading-relaxed">
                L'equipe{" "}
                <span className="text-nbl-white font-bold">
                  {form.teamName}
                </span>{" "}
                est bien enregistree. Nous vous contacterons au{" "}
                <span className="text-nbl-white font-bold">{form.phone}</span>{" "}
                pour finaliser la validation et le paiement.
              </p>
              {submission && (
                <p className="text-nbl-gray text-xs mt-2">
                  Reference: {submission.registrationId} · Paiement:{" "}
                  <span className="text-nbl-white font-bold">
                    {submission.paymentStatus}
                  </span>
                </p>
              )}
            </div>
            <div className="w-full rounded-2xl bg-nbl-surface border border-nbl-border p-5 text-left flex flex-col gap-3">
              <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase">
                Prochaines etapes
              </p>
              {[
                "Validation de l'inscription",
                "Confirmation du droit de participation",
                "Envoi des details logistiques",
              ].map((stepText, index) => (
                <div key={stepText} className="flex items-start gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-nbl-orange/20 border border-nbl-orange/40 text-nbl-orange text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-nbl-gray">{stepText}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="text-nbl-orange text-xs font-black tracking-widest uppercase mb-2">
              Edition 1 · Juillet 2026
            </p>
            <h1 className="font-akira text-4xl lg:text-5xl uppercase text-nbl-white leading-none mb-3">
              Inscrire
              <br />
              <span className="text-nbl-orange">mon equipe</span>
            </h1>
            <p className="text-nbl-gray text-sm leading-relaxed">
              Formulaire en 3 etapes pour une inscription claire, avec upload
              des photos joueurs integre.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {(["Junior", "D1"] as const).map((category) => {
              const item = spots[category];
              return (
                <div
                  key={category}
                  className="rounded-2xl bg-nbl-surface border border-nbl-border p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase">
                      Categorie {category}
                    </p>
                    <span className="text-xs font-black text-nbl-white">
                      {item.remaining} / {item.capacity}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-nbl-surface-raised overflow-hidden">
                    <div
                      className="h-full rounded-full bg-nbl-orange transition-all"
                      style={{
                        width: `${(item.activeRegistrations / item.capacity) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-nbl-gray text-xs">
                    {item.remaining} places disponibles
                  </p>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="rounded-2xl bg-nbl-surface border border-nbl-border p-4">
              <div className="flex items-center gap-2">
                {inscriptionSteps.map((item, index) => {
                  const isDone = step > item.id;
                  const isActive = step === item.id;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center flex-1 last:flex-none"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (item.id <= step) {
                            moveToStep(item.id);
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2 text-left",
                          item.id <= step
                            ? "cursor-pointer"
                            : "cursor-not-allowed",
                        )}
                        disabled={item.id > step}
                      >
                        <span
                          className={cn(
                            "w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-black transition-colors",
                            isDone &&
                              "bg-nbl-orange border-nbl-orange text-nbl-bg",
                            isActive && "border-nbl-orange text-nbl-orange",
                            !isDone &&
                              !isActive &&
                              "border-nbl-border text-nbl-gray",
                          )}
                        >
                          {isDone ? <CheckCircle size={14} /> : item.id}
                        </span>
                        <span className="hidden sm:flex flex-col leading-tight">
                          <span
                            className={cn(
                              "text-[11px] uppercase tracking-widest font-black",
                              isActive || isDone
                                ? "text-nbl-white"
                                : "text-nbl-gray",
                            )}
                          >
                            {item.title}
                          </span>
                          <span className="text-[10px] text-nbl-gray">
                            {item.subtitle}
                          </span>
                        </span>
                      </button>

                      {index < inscriptionSteps.length - 1 && (
                        <div
                          className={cn(
                            "h-px flex-1 mx-2 transition-colors",
                            step > item.id
                              ? "bg-nbl-orange/70"
                              : "bg-nbl-border",
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 h-1 rounded-full bg-nbl-surface-raised overflow-hidden">
                <div
                  className="h-full bg-nbl-orange transition-all duration-300"
                  style={{
                    width: `${((step - 1) / (inscriptionSteps.length - 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div
              key={step}
              className={cn(
                "rounded-2xl bg-nbl-surface border border-nbl-border p-5 flex flex-col gap-5",
                "animate-in fade-in-0 duration-300",
                stepDirection === "forward"
                  ? "slide-in-from-right-4"
                  : "slide-in-from-left-4",
              )}
            >
              {step === 1 && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black tracking-widest uppercase text-nbl-white">
                      Categorie *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["Junior", "D1"] as const).map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setCategory(category)}
                          className={cn(
                            "py-4 rounded-xl border font-black text-sm tracking-widest uppercase transition-all",
                            form.category === category
                              ? "bg-nbl-orange border-nbl-orange text-nbl-bg shadow-[0_0_16px_rgba(217,104,19,0.3)]"
                              : "bg-nbl-surface-raised border-nbl-border text-nbl-gray hover:border-nbl-orange/40 hover:text-nbl-white",
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    {selectedCategorySpots && (
                      <p className="text-[11px] text-nbl-gray">
                        Restant en {form.category}:{" "}
                        {selectedCategorySpots.remaining} places
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black tracking-widest uppercase text-nbl-white">
                        Nom de l'equipe *
                      </label>
                      <Input
                        type="text"
                        value={form.teamName}
                        onChange={(event) =>
                          setField("teamName", event.target.value)
                        }
                        placeholder="Ex : Cocody Ballers"
                        className={inputClassName}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black tracking-widest uppercase text-nbl-white">
                        Nom du capitaine *
                      </label>
                      <Input
                        type="text"
                        value={form.captainName}
                        onChange={(event) =>
                          setField("captainName", event.target.value)
                        }
                        placeholder="Prenom et nom"
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black tracking-widest uppercase text-nbl-white flex items-center gap-1.5">
                        <Phone size={12} className="text-nbl-orange" />
                        Telephone *
                      </label>
                      <Input
                        type="tel"
                        value={form.phone}
                        onChange={(event) =>
                          setField("phone", event.target.value)
                        }
                        placeholder="+225 07 XX XX XX XX"
                        className={inputClassName}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black tracking-widest uppercase text-nbl-white flex items-center gap-1.5">
                        <Mail size={12} className="text-nbl-orange" />
                        Email (optionnel)
                      </label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          setField("email", event.target.value)
                        }
                        placeholder="capitaine@email.com"
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NblSelect
                      label="Commune"
                      required
                      value={form.commune}
                      onValueChange={(value) => setField("commune", value)}
                      placeholder="Selectionner..."
                      options={communeOptions}
                    />

                    <NblSelect
                      label="Nombre de joueurs"
                      icon={<Users size={12} className="text-nbl-orange" />}
                      value={form.playerCount}
                      onValueChange={(value) => setField("playerCount", value)}
                      placeholder="Selectionner..."
                      options={playerCountOptions}
                    />
                  </div>

                  <NblSelect
                    label="Comment avez-vous connu le NBL ?"
                    value={form.source}
                    onValueChange={(value) => setField("source", value)}
                    placeholder="Selectionner..."
                    options={sourceOptions}
                  />

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black tracking-widest uppercase text-nbl-white">
                      Notes (optionnel)
                    </label>
                    <Textarea
                      value={form.notes}
                      onChange={(event) =>
                        setField("notes", event.target.value)
                      }
                      rows={3}
                      placeholder="Infos utiles pour le staff NBL"
                      className="rounded-xl border-nbl-border bg-nbl-surface text-nbl-white placeholder:text-nbl-gray focus-visible:border-nbl-orange/60 focus-visible:ring-nbl-orange/20"
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase mb-1">
                        Roster joueurs
                      </p>
                      <p className="text-sm text-nbl-gray">
                        Upload photo prioritaire, URL en secours si besoin.
                      </p>
                    </div>
                    <span className="text-[11px] font-black tracking-widest uppercase text-nbl-white">
                      {roster.length} joueurs
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {roster.map((player, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-nbl-border bg-nbl-surface-raised/40 p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-black tracking-widest uppercase text-nbl-white">
                            Joueur {index + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => setCaptain(index)}
                            className={cn(
                              "text-[10px] px-2.5 py-1 rounded-lg border uppercase tracking-widest font-black transition-colors",
                              form.captainIndex === index
                                ? "bg-nbl-orange text-nbl-bg border-nbl-orange"
                                : "text-nbl-gray border-nbl-border hover:border-nbl-orange/50",
                            )}
                          >
                            Capitaine
                          </button>
                        </div>

                        <Input
                          type="text"
                          value={player.fullName}
                          onChange={(event) =>
                            setPlayer(index, "fullName", event.target.value)
                          }
                          placeholder="Nom complet du joueur"
                          className={inputClassName}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-3">
                          <Input
                            type="number"
                            min={0}
                            max={99}
                            value={player.jerseyNumber}
                            onChange={(event) =>
                              setPlayer(
                                index,
                                "jerseyNumber",
                                event.target.value,
                              )
                            }
                            placeholder="Numero"
                            className={inputClassName}
                          />

                          <NblSelect
                            label="Poste"
                            value={player.position}
                            onValueChange={(value) =>
                              setPlayer(index, "position", value as Position)
                            }
                            placeholder="Poste"
                            options={positionOptions}
                            className="gap-1"
                          />
                        </div>

                        <div className="rounded-xl border border-nbl-border bg-nbl-surface p-3 flex flex-col gap-2">
                          <label className="text-xs font-black tracking-widest uppercase text-nbl-white flex items-center gap-1.5">
                            <Camera size={12} className="text-nbl-orange" />
                            Photo joueur (upload)
                          </label>

                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              void handlePhotoUpload(
                                index,
                                event.target.files?.[0] ?? null,
                              )
                            }
                            className="h-11 rounded-xl border-nbl-border bg-nbl-surface-raised text-nbl-white file:text-[11px] file:font-black file:tracking-wide file:text-nbl-orange"
                          />

                          <p className="text-[11px] text-nbl-gray flex items-center gap-1.5">
                            <Upload size={12} className="text-nbl-orange" />
                            JPG/PNG/WebP - max 2 Mo
                          </p>

                          {player.photoFileName && (
                            <p className="text-[11px] text-nbl-white">
                              Fichier: {player.photoFileName}
                            </p>
                          )}

                          {player.photoUrl && (
                            <img
                              src={player.photoUrl}
                              alt={`Photo joueur ${index + 1}`}
                              className="w-20 h-20 rounded-lg object-cover border border-nbl-border"
                            />
                          )}

                          <Input
                            type="url"
                            value={player.photoFileName ? "" : player.photoUrl}
                            onChange={(event) => {
                              const nextValue = event.target.value;
                              setForm((previous) => {
                                const nextPlayers = [...previous.players];
                                const current =
                                  nextPlayers[index] ?? createPlayerDraft();

                                nextPlayers[index] = {
                                  ...current,
                                  photoUrl: nextValue,
                                  photoFileName: "",
                                };

                                return {
                                  ...previous,
                                  players: nextPlayers,
                                };
                              });
                              setError("");
                            }}
                            placeholder="URL photo (optionnel)"
                            className="h-11 rounded-xl border-nbl-border bg-nbl-surface-raised text-nbl-white placeholder:text-nbl-gray focus-visible:border-nbl-orange/60 focus-visible:ring-nbl-orange/20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div>
                    <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase mb-2">
                      Verification finale
                    </p>
                    <h2 className="text-xl font-black text-nbl-white">
                      Confirmez votre inscription
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-nbl-surface-raised border border-nbl-border p-3">
                      <p className="text-[10px] uppercase tracking-widest text-nbl-gray font-black">
                        Equipe
                      </p>
                      <p className="text-sm text-nbl-white font-semibold mt-1">
                        {form.teamName || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-nbl-surface-raised border border-nbl-border p-3">
                      <p className="text-[10px] uppercase tracking-widest text-nbl-gray font-black">
                        Categorie
                      </p>
                      <p className="text-sm text-nbl-white font-semibold mt-1">
                        {form.category || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-nbl-surface-raised border border-nbl-border p-3">
                      <p className="text-[10px] uppercase tracking-widest text-nbl-gray font-black">
                        Capitaine
                      </p>
                      <p className="text-sm text-nbl-white font-semibold mt-1">
                        {form.captainName || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-nbl-surface-raised border border-nbl-border p-3">
                      <p className="text-[10px] uppercase tracking-widest text-nbl-gray font-black">
                        Contact
                      </p>
                      <p className="text-sm text-nbl-white font-semibold mt-1">
                        {form.phone || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-nbl-surface-raised border border-nbl-border p-4">
                    <p className="text-[10px] uppercase tracking-widest text-nbl-gray font-black mb-3">
                      Joueurs valides ({summaryPlayers.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {roster.map((player, index) => {
                        if (!player.fullName.trim()) {
                          return null;
                        }

                        return (
                          <p
                            key={`${player.fullName}-${index}`}
                            className="text-sm text-nbl-white"
                          >
                            {index + 1}. {player.fullName}
                            {form.captainIndex === index ? " (C)" : ""}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-nbl-surface border border-nbl-border p-4 flex flex-col gap-2">
                    <p className="text-nbl-orange text-[10px] font-black tracking-widest uppercase">
                      Droit de participation
                    </p>
                    <p className="text-nbl-gray text-xs leading-relaxed">
                      Apres validation, notre equipe vous contacte pour
                      confirmer le montant et les modalites de paiement mobile
                      money.
                    </p>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={step === 1 || isSubmitting}
                className="h-11 rounded-xl border-nbl-border bg-nbl-surface text-nbl-white hover:bg-nbl-surface-raised"
              >
                <ChevronLeft size={15} />
                Retour
              </Button>

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="h-11 rounded-xl bg-nbl-orange text-nbl-bg hover:bg-nbl-orange-dark font-black tracking-widest uppercase"
                >
                  Continuer
                  <ChevronRight size={15} />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 rounded-xl bg-nbl-orange text-nbl-bg hover:bg-nbl-orange-dark font-black tracking-widest uppercase"
                >
                  <Users size={16} />
                  {isSubmitting
                    ? "Envoi en cours..."
                    : "Soumettre l'inscription"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
