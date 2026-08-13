"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout } from "@/lib/auth";
import { getAllGyms, createGym, GymRecord } from "@/lib/gymStore";
import { getAllMembers } from "@/lib/memberStore";
import { Member } from "@/lib/types";
import Logo from "@/components/Logo";

// ============================================================
// Panel del administrador de Ryvo — no es el dashboard de un gimnasio
// concreto (eso es /dashboard, para el rol "ceo"), es la vista de
// arriba del todo: todos los gimnasios que usan la plataforma. Por
// ahora es la única forma de crear un gimnasio nuevo sin entrar a
// mano en el SQL Editor de Supabase.
// ============================================================

export default function AdminPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const [gyms, setGyms] = useState<GymRecord[]>([]);
  const [loadingGyms, setLoadingGyms] = useState(true);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  const [selectedGym, setSelectedGym] = useState<GymRecord | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "admin") {
      router.replace("/login");
      return;
    }
    setChecked(true);
    loadGyms();
  }, [router]);

  async function loadGyms() {
    setLoadingGyms(true);
    setGyms(await getAllGyms());
    setLoadingGyms(false);
  }

  async function handleCreateGym() {
    if (!name.trim() || !slug.trim()) return;
    setCreating(true);
    setCreateMsg(null);
    const result = await createGym({ name, slug });
    setCreating(false);
    if (result.success) {
      setCreateMsg(`✓ "${name}" creado. Slug de fichaje: ${slug}`);
      setName("");
      setSlug("");
      loadGyms();
    } else {
      setCreateMsg(`✗ Error: ${result.error ?? "no se pudo crear"}`);
    }
  }

  async function handleSelectGym(gym: GymRecord) {
    setSelectedGym(gym);
    setLoadingMembers(true);
    setMembers(await getAllMembers(gym.slug));
    setLoadingMembers(false);
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (!checked) return null;

  return (
    <main className="flex-1 bg-podium-chalk text-podium-asphalt px-4 sm:px-6 py-10 overflow-x-hidden">
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-8">
          <div>
            <Logo size="sm" className="mb-2" />
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-podium-asphalt/50 mb-1">
              Panel de administrador
            </p>
            <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight">
              Gimnasios
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="font-mono text-xs uppercase tracking-widest text-podium-asphalt/50 hover:text-podium-asphalt underline shrink-0"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Crear gimnasio nuevo */}
        <div className="rounded-md border border-podium-asphalt/12 bg-white p-5 mb-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-4">
            Crear gimnasio nuevo
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre (ej. Box Triana)"
              className="flex-1 bg-transparent border border-podium-asphalt/20 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-podium-track-dark"
            />
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              placeholder="slug (ej. box-triana)"
              className="flex-1 bg-transparent border border-podium-asphalt/20 rounded-md px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-podium-track-dark"
            />
            <button
              onClick={handleCreateGym}
              disabled={creating || !name.trim() || !slug.trim()}
              className="bg-podium-track hover:bg-podium-track-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md px-6 py-2.5 font-mono text-xs uppercase tracking-widest shrink-0"
            >
              {creating ? "Creando…" : "Crear"}
            </button>
          </div>
          <p className="font-mono text-[10px] text-podium-asphalt/40 mt-2">
            El slug es lo que va en la URL de fichaje: /checkin?gym=slug
          </p>
          {createMsg && (
            <p className="font-mono text-xs text-podium-mint mt-3">{createMsg}</p>
          )}
        </div>

        {/* Lista de gimnasios */}
        <p className="font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-3">
          {loadingGyms ? "Cargando…" : `${gyms.length} gimnasio(s)`}
        </p>
        <div className="flex flex-col gap-2 mb-8">
          {gyms.map((gym) => (
            <button
              key={gym.id}
              onClick={() => handleSelectGym(gym)}
              className={`text-left rounded-md border px-4 py-3 transition-colors ${
                selectedGym?.id === gym.id
                  ? "border-podium-track-dark bg-podium-track/10"
                  : "border-podium-asphalt/12 bg-white hover:border-podium-asphalt/30"
              }`}
            >
              <p className="font-medium">{gym.name}</p>
              <p className="font-mono text-xs text-podium-asphalt/50">/checkin?gym={gym.slug}</p>
            </button>
          ))}
        </div>

        {/* Socios del gimnasio seleccionado */}
        {selectedGym && (
          <>
            <p className="font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-3">
              Socios de {selectedGym.name}
            </p>
            {loadingMembers ? (
              <p className="font-mono text-sm text-podium-asphalt/40 py-6">Cargando…</p>
            ) : members.length === 0 ? (
              <p className="font-mono text-sm text-podium-asphalt/40 text-center py-8 border border-dashed border-podium-asphalt/15 rounded-md">
                Todavía no hay socios registrados en este gimnasio.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-md border border-podium-asphalt/10 bg-white px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{m.fullName}</p>
                      <p className="font-mono text-[11px] text-podium-asphalt/40">
                        {m.memberCode} · {m.totalSesionesValidas} sesiones válidas
                      </p>
                    </div>
                    <span className="font-mono text-sm tabular text-podium-asphalt/70">
                      {m.xpTotal} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
