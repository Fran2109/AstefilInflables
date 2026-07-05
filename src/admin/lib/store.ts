import type { ModoStorage } from "@/admin/types";

/**
 * Adaptador de persistencia. Es la ÚNICA capa que toca el almacenamiento:
 * hoy usa localStorage (→ memoria si falla). Para migrar a Supabase se reemplaza
 * la implementación de get/set/del manteniendo esta misma interfaz async.
 *
 * No usar localStorage directo en el resto del admin: siempre a través de `store`.
 */
export const K = {
  inf: "astefil:inflables",
  res: "astefil:reservas",
  cfg: "astefil:config",
} as const;

const mem: Record<string, unknown> = {};
let modo: ModoStorage = "navegador";

export function modoStorage(): ModoStorage {
  return modo;
}

export const store = {
  async get<T>(k: string): Promise<T | null> {
    try {
      const v = localStorage.getItem(k);
      modo = "navegador";
      return v ? (JSON.parse(v) as T) : null;
    } catch {
      modo = "memoria";
      return (mem[k] as T) ?? null;
    }
  },

  async set<T>(k: string, v: T): Promise<void> {
    try {
      localStorage.setItem(k, JSON.stringify(v));
      modo = "navegador";
    } catch {
      mem[k] = v;
      modo = "memoria";
    }
  },

  async del(k: string): Promise<void> {
    try {
      localStorage.removeItem(k);
    } catch {
      delete mem[k];
    }
  },
};
