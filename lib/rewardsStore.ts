"use client";

import { Reward, REWARDS as DEFAULT_REWARDS } from "./types";
import { supabase } from "./supabase";
import { getGymBySlug, updateGymSettings } from "./gymStore";

function rowToReward(row: {
  id: string;
  title: string;
  xp_required: number;
  announcement: string | null;
}): Reward {
  return {
    id: row.id,
    title: row.title,
    xpRequired: row.xp_required,
    announcement: row.announcement ?? undefined,
  };
}

// Si el gimnasio nunca ha personalizado sus premios (rewards_customized
// = false), arranca con la escalera de ejemplo. En cuanto el CEO guarda
// algo una vez — aunque sea vaciar la lista a propósito — se respeta lo
// que haya en la tabla, sea lo que sea.
export async function getRewardsForGym(gymSlug: string): Promise<Reward[]> {
  const gym = await getGymBySlug(gymSlug);
  if (!gym || !supabase) return DEFAULT_REWARDS;

  if (!gym.rewards_customized) return DEFAULT_REWARDS;

  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("gym_id", gym.id)
    .order("xp_required", { ascending: true });

  if (error) {
    console.error("No se pudieron cargar los premios:", error);
    return DEFAULT_REWARDS;
  }
  return (data ?? []).map(rowToReward);
}

export async function saveRewardsForGym(gymSlug: string, rewards: Reward[]) {
  const gym = await getGymBySlug(gymSlug);
  if (!gym || !supabase) return;

  // Borrar y volver a insertar es más simple y fiable aquí que
  // intentar calcular qué cambió fila a fila.
  const { error: deleteError } = await supabase.from("rewards").delete().eq("gym_id", gym.id);
  if (deleteError) console.error("No se pudieron borrar los premios anteriores:", deleteError);

  if (rewards.length > 0) {
    const { error: insertError } = await supabase.from("rewards").insert(
      rewards.map((r) => ({
        gym_id: gym.id,
        title: r.title,
        xp_required: r.xpRequired,
        announcement: r.announcement || null,
      }))
    );
    if (insertError) console.error("No se pudieron guardar los premios:", insertError);
  }

  await updateGymSettings(gymSlug, { rewards_customized: true });
}

export function newBlankReward(): Reward {
  return {
    id: `temp-${Date.now()}`, // se sustituye por el id real que asigna Supabase al guardar
    title: "",
    xpRequired: 500,
    announcement: "",
  };
}
