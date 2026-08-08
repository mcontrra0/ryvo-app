import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// En desarrollo local sin cuenta de Supabase todavía, la app funciona
// con datos simulados (ver lib/mockData.ts). En cuanto rellenes las
// variables de entorno en .env.local, este cliente se conecta a tu
// proyecto real y toda la lógica de negocio (lib/types.ts) es la misma.
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
