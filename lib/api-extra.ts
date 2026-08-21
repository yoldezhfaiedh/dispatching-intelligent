const DASHBOARD = process.env.NEXT_PUBLIC_DASHBOARD_API ?? 'http://localhost:8002'
const MODELS = process.env.NEXT_PUBLIC_MODEL_API ?? 'http://localhost:8001'

async function get<T>(base: string, path: string): Promise<T> {
  const response = await fetch(`${base}${path}`)
  if (!response.ok) throw new Error(`API ${response.status}`)
  return response.json()
}

export type RealtimeKpis = { couples_rescores: number; p1: number; p2: number; p3: number; p4: number; ruptures_constatees: number; critiques: number; risque_modele: number; boutiques_touchees: number; risque_moyen: number; derive_moyenne: number; dernier_scoring: string; ventes_recues: number; unites_vendues: number; boutiques_actives: number; fenetre_minutes: number }
export type RealtimePrediction = { shop_id: string; product_id: string; governorate: string; shop_type: string; stock_on_hand: number; coverage_days_now: number; severity_now: string; priority_final: string; proba_stockout_7d: number; proba_overstock: number; predicted_demand_7d: number; delta_vs_batch: number; trigger_reason: string; scored_at: string }
export type ExplainedKpi = { id: string; libelle: string; valeur: number; unite: string; definition: string; formule: string; lecture: string; source: string; modele?: string }
export type ModelFeature = { feature: string; importance: number; part_pct: number }
export type ModelMetric = { nom: string; valeur: number; unite: string; sens: string }
export type ModelSummary = { genere_le: string; perimetre: { boutiques?: number; produits?: number; couples?: number; decoupage?: string } | string; modeles: ModelInfo[] }
export type ModelInfo = { id: string; nom: string; question: string; famille: string; classe: string; type_tache: string; sortie: string; seuil?: number; role: string; n_features: number; entraine_le: string; taille_mo: number; metriques: ModelMetric[]; hyperparametres: Record<string, unknown>; top_features: ModelFeature[]; limite_connue?: string | null; justification_seuil?: string | null; baseline?: string | null }
export type TransferDiagnostic = { verdict: string; explication: string; total_besoins: number; total_sources: number; appariements_theoriques: number; produits_avec_recouvrement: string[]; plan: { transferts: number; unites_deplacees: number; intra_region: number }; matrice: { product_id: string; besoins: number; sources: number; appariements_possibles: number }[] }
export type Transfer = { source_shop_id: string; target_shop_id: string; product_id: string; quantity: number; priority: string; same_region: boolean; business_reason: string }
export type Divergence = { shop_id: string; product_id: string; governorate: string; stock_on_hand: number; coverage_days_now: number; severity_now: string; proba_stockout_7d: number; predicted_demand_7d: number; priority_final: string; lecture: string }
export type GlossaryTerm = { terme: string; definition: string }

export const extraApi = {
  realtimeKpis: () => get<RealtimeKpis>(DASHBOARD, '/realtime/kpis?window_minutes=60'),
  realtimePredictions: () => get<RealtimePrediction[]>(DASHBOARD, '/realtime/predictions?limit=8'),
  explained: () => get<{ date_reference: string; indicateurs: ExplainedKpi[] }>(DASHBOARD, '/kpis/explained'),
  models: () => get<ModelSummary>(MODELS, '/models/summary'),
  model: (id: string) => get<ModelInfo & { features?: string[] }>(MODELS, `/models/${encodeURIComponent(id)}`),
  diagnostic: () => get<TransferDiagnostic>(DASHBOARD, '/transfers/diagnostic'),
  transfers: () => get<Transfer[]>(DASHBOARD, '/transfers?limit=100'),
  divergence: () => get<Divergence[]>(DASHBOARD, '/realtime/divergence?limit=20'),
  glossary: () => get<GlossaryTerm[]>(DASHBOARD, '/kpis/glossaire'),
}

export const extraFormat = (value: number, decimals = 0) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value)
export const relativeTime = (value: string) => { const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000)); if (seconds < 3600) return `il y a ${seconds} s`; return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) }
export const priorityColor = (p: string) => ({ P1: '#dc2626', P2: '#ff7900', P3: '#f59e0b', P4: '#94a3b8' }[p] ?? '#94a3b8')
export const severityPercent = (s: string) => ({ RUPTURE: 100, CRITIQUE: 80, URGENT: 60, SURVEILLANCE: 40, NORMAL: 15 }[s] ?? 0)
