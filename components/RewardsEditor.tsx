"use client";

import { useEffect, useState } from "react";
import { CashbackRule, Reward } from "@/lib/types";
import { GYM_ID } from "@/lib/mockData";
import { getRewardsForGym, saveRewardsForGym, newBlankReward } from "@/lib/rewardsStore";
import { getCashbackRuleForGym, saveCashbackRuleForGym } from "@/lib/cashbackStore";
import { getOffpeakRuleForGym, saveOffpeakRuleForGym, OffpeakRule } from "@/lib/offpeakStore";
import { IconPercent, IconSun, IconTrophy, IconBadge } from "@/components/icons";

export default function RewardsEditor() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [cashback, setCashback] = useState<CashbackRule | null>(null);
  const [offpeak, setOffpeak] = useState<OffpeakRule | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    (async () => {
      setRewards(await getRewardsForGym(GYM_ID));
      setCashback(await getCashbackRuleForGym(GYM_ID));
      setOffpeak(await getOffpeakRuleForGym(GYM_ID));
    })();
  }, []);

  function updateOffpeak(patch: Partial<OffpeakRule>) {
    setOffpeak((prev) => (prev ? { ...prev, ...patch } : prev));
    setSavedMsg(false);
  }

  function updateCashback(patch: Partial<CashbackRule>) {
    setCashback((prev) => (prev ? { ...prev, ...patch } : prev));
    setSavedMsg(false);
  }

  function updateField(id: string, patch: Partial<Reward>) {
    setRewards((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setSavedMsg(false);
  }

  function removeReward(id: string) {
    setRewards((prev) => prev.filter((r) => r.id !== id));
    setSavedMsg(false);
  }

  function addReward() {
    setRewards((prev) => [...prev, newBlankReward()]);
    setSavedMsg(false);
  }

  // Un único botón guarda las dos cosas a la vez — antes había un botón
  // separado para el cashback y otro para los premios, y era fácil
  // pulsar el que no tocaba pensando que ya se había guardado todo.
  async function handleSaveAll() {
    const clean = rewards.filter((r) => r.title.trim().length > 0 && r.xpRequired > 0);
    await saveRewardsForGym(GYM_ID, clean);
    setRewards(await getRewardsForGym(GYM_ID)); // recarga ya ordenado por XP

    if (cashback) await saveCashbackRuleForGym(GYM_ID, cashback);
    if (offpeak) await saveOffpeakRuleForGym(GYM_ID, offpeak);

    setSavedMsg(true);
  }

  return (
    <div>
      <p className="text-podium-asphalt/60 mb-6 max-w-md">
        Define aquí los premios que puede conseguir un socio y cuánto XP
        necesita para cada uno — algunos pueden costar poco para que se
        consigan a menudo, y otros mucho para que sean un hito real. Se
        guardan solo para <span className="font-medium">{GYM_ID}</span>,
        no afectan a otros gimnasios.
      </p>

      <div className="rounded-md border border-podium-mint/30 bg-podium-mint/5 p-4 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-podium-mint flex items-center gap-2">
            <IconBadge icon={IconPercent} tone="mint" size="sm" />
            Cashback (alternativa a los premios)
          </p>
          <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={cashback?.enabled ?? false}
              onChange={(e) => updateCashback({ enabled: e.target.checked })}
            />
            Activado
          </label>
        </div>

        {cashback && (
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex-1 flex items-center gap-2 text-sm">
              Ven
              <input
                type="number"
                min={1}
                value={cashback.minDaysPerMonth}
                onChange={(e) => updateCashback({ minDaysPerMonth: Number(e.target.value) || 0 })}
                className="w-20 bg-transparent border border-podium-asphalt/20 rounded-md px-2 py-1.5 text-sm tabular focus:outline-none focus:border-podium-track-dark"
              />
              días al mes →
            </label>
            <label className="flex-1 flex items-center gap-2 text-sm">
              Descuento
              <input
                type="number"
                min={1}
                value={cashback.discountEuros}
                onChange={(e) => updateCashback({ discountEuros: Number(e.target.value) || 0 })}
                className="w-20 bg-transparent border border-podium-asphalt/20 rounded-md px-2 py-1.5 text-sm tabular focus:outline-none focus:border-podium-track-dark"
              />
              € en la cuota
            </label>
          </div>
        )}
      </div>

      <div className="rounded-md border border-podium-asphalt/12 bg-white p-4 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 flex items-center gap-2">
            <IconBadge icon={IconSun} tone="gold" size="sm" />
            Horas valle
          </p>
          <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={offpeak?.enabled ?? false}
              onChange={(e) => updateOffpeak({ enabled: e.target.checked })}
            />
            Activado
          </label>
        </div>
        {offpeak && (
          <>
            <label className="flex items-center gap-2 text-sm flex-wrap mb-2">
              Bonus de
              <input
                type="number"
                min={1}
                value={offpeak.bonusXp}
                onChange={(e) => updateOffpeak({ bonusXp: Number(e.target.value) || 0 })}
                className="w-16 bg-transparent border border-podium-asphalt/20 rounded-md px-2 py-1.5 text-sm tabular focus:outline-none focus:border-podium-track-dark"
              />
              XP para quien entrena entre las
              <input
                type="number"
                min={0}
                max={23}
                value={offpeak.startHour}
                onChange={(e) => updateOffpeak({ startHour: Number(e.target.value) || 0 })}
                className="w-14 bg-transparent border border-podium-asphalt/20 rounded-md px-2 py-1.5 text-sm tabular focus:outline-none focus:border-podium-track-dark"
              />
              h y las
              <input
                type="number"
                min={0}
                max={23}
                value={offpeak.endHour}
                onChange={(e) => updateOffpeak({ endHour: Number(e.target.value) || 0 })}
                className="w-14 bg-transparent border border-podium-asphalt/20 rounded-md px-2 py-1.5 text-sm tabular focus:outline-none focus:border-podium-track-dark"
              />
              h
            </label>
            <p className="font-mono text-[10px] text-podium-asphalt/40">
              Útil para llenar las horas muertas — mira la gráfica de "Horas
              punta" en Resumen para decidir cuáles son las tuyas.
            </p>
          </>
        )}
      </div>

      <h3 className="font-mono text-[11px] uppercase tracking-widest text-podium-asphalt/50 mb-3 flex items-center gap-2">
        <IconBadge icon={IconTrophy} tone="track" size="sm" />
        Premios por XP
      </h3>
      <div className="flex flex-col gap-3 mb-6">
        {rewards.map((r) => (
          <div
            key={r.id}
            className="rounded-md border border-podium-asphalt/12 bg-white p-4 flex flex-col gap-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                value={r.title}
                onChange={(e) => updateField(r.id, { title: e.target.value })}
                placeholder="Nombre del premio (ej. Batido gratis)"
                className="flex-1 min-w-0 bg-transparent border border-podium-asphalt/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-podium-track-dark"
              />

              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  min={1}
                  value={r.xpRequired}
                  onChange={(e) =>
                    updateField(r.id, { xpRequired: Number(e.target.value) || 0 })
                  }
                  className="w-24 bg-transparent border border-podium-asphalt/20 rounded-md px-3 py-2 text-sm tabular focus:outline-none focus:border-podium-track-dark"
                />
                <span className="font-mono text-xs text-podium-asphalt/40">XP</span>
              </div>

              <button
                onClick={() => removeReward(r.id)}
                className="shrink-0 font-mono text-xs uppercase tracking-widest text-podium-danger hover:underline px-2"
              >
                Eliminar
              </button>
            </div>

            <input
              value={r.announcement ?? ""}
              onChange={(e) => updateField(r.id, { announcement: e.target.value })}
              placeholder="Anuncio opcional para el socio (ej. válido en la barra hasta fin de mes)"
              className="w-full bg-transparent border border-podium-asphalt/15 rounded-md px-3 py-2 text-xs text-podium-asphalt/70 focus:outline-none focus:border-podium-track-dark"
            />
          </div>
        ))}

        {rewards.length === 0 && (
          <p className="font-mono text-sm text-podium-asphalt/40 text-center py-8">
            Todavía no hay premios. Añade el primero abajo.
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={addReward}
          className="flex-1 border border-podium-asphalt/20 hover:border-podium-track-dark hover:bg-podium-track/10 transition-colors rounded-md py-3 font-mono text-xs uppercase tracking-widest"
        >
          + Añadir premio
        </button>
        <button
          onClick={handleSaveAll}
          className="flex-1 bg-podium-track hover:bg-podium-track-dark transition-colors rounded-md py-3 font-display text-lg uppercase tracking-wide text-podium-asphalt"
        >
          Guardar cambios
        </button>
      </div>

      {savedMsg && (
        <p className="font-mono text-xs text-podium-mint mt-3">
          ✓ Guardado — premios y cashback actualizados para tus socios.
        </p>
      )}
    </div>
  );
}
