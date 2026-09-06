import { DASHBOARD_API, MODEL_API } from './api'

export type RealtimeStatus = { last_update: string; source: string; status: 'live' | 'stale' | 'offline' }
export type ModelSummary = { id: string; name: string; version: string; status: string; accuracy?: number; updated_at?: string; features?: { name: string; importance: number }[]; description?: string }
export type Transfer = { id: string; date: string; source_shop: string; destination_shop: string; product_id: string; quantity: number; status: string; distance_km?: number }
export type KpiExplanation = { key: string; title: string; definition: string; formula?: string; interpretation?: string }
export type GlossaryTerm = { term: string; category: string; definition: string; example?: string }

async function get<T>(base: string, path: string): Promise<T> {
  const response = await fetch(`${base}${path}`, { headers: { 'Content-Type': 'application/json' } })
  if (!response.ok) throw new Error(`Erreur API (${response.status})`)
  return response.json()
}

function collection<T>(value: unknown, keys: string[]): T[] {
  if (Array.isArray(value)) return value as T[]
  if (!value || typeof value !== 'object') return []
  const payload = value as Record<string, unknown>
  for (const key of keys) {
    const nested = payload[key]
    if (Array.isArray(nested)) return nested as T[]
  }
  return collection<T>(payload.data ?? payload.result, keys)
}

export const extraApi = {
  realtime: () => get<RealtimeStatus>(DASHBOARD_API, '/realtime/status'),
  models: async () => collection<ModelSummary>(await get<unknown>(MODEL_API, '/models'), ['models', 'items']),
  transfers: async (limit = 100) => collection<Transfer>(await get<unknown>(DASHBOARD_API, `/transfers?limit=${limit}`), ['transfers', 'items']),
  kpiExplanations: async () => collection<KpiExplanation>(await get<unknown>(DASHBOARD_API, '/kpis/explanations'), ['explanations', 'items']),
  glossary: async () => collection<GlossaryTerm>(await get<unknown>(DASHBOARD_API, '/glossary'), ['glossary', 'terms', 'items']),
}

export function apiDate(value?: string) { return value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—' }
export function percent(value?: number) { return value === undefined ? '—' : `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value * 100)} %` }
export function safeArray<T>(value: T[] | undefined | null) { return Array.isArray(value) ? value : [] }
