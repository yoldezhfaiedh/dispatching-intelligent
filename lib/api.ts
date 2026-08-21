// Détection dynamique de l'hôte : si le frontend est ouvert depuis une autre
// machine du réseau, les APIs sont appelées sur la même IP plutôt que localhost.
const browserHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const browserProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:'

export const DASHBOARD_API = process.env.NEXT_PUBLIC_DASHBOARD_API || `${browserProtocol}//${browserHost}:8002`
export const MODEL_API = process.env.NEXT_PUBLIC_MODEL_API || `${browserProtocol}//${browserHost}:8001`
export const AGENT_API = process.env.NEXT_PUBLIC_AGENT_API || `${browserProtocol}//${browserHost}:8003`

export type Kpis = { reference_date?: string; date_batch?: string; total_shops: number; total_products: number; total_pairs?: number; pairs_at_stockout_risk?: number; pairs_at_overstock_risk?: number; shops_at_stockout_risk: number; shops_at_overstock_risk: number; total_recommendations: number; high_priority_recommendations: number; total_units_to_dispatch: number; most_critical_product: string; most_critical_governorate: string; fraicheur_pct?: number }
export type Prediction = { date: string; shop_id: string; product_id: string; predicted_demand_7d: number; proba_stockout_7d: number; risk_stockout_7d_predicted: number; proba_overstock: number; risk_overstock_predicted: number; stock_on_hand: number; order_up_to_level: number }
export type Recommendation = { recommendation_date: string; shop_id: string; product_id: string; recommendation_type: string; priority: 'High'|'Medium'|'Low'; suggested_qty: number; business_reason: string; estimated_7d_demand: number; current_stock: number; stock_in_transit: number; stockout_risk_score: number }
export type TopRisk = { shop_id: string; product_id: string; proba_stockout_7d: number; predicted_demand_7d: number; stock_on_hand: number; governorate: string; region: string; shop_type: string; est_temps_reel?: boolean };
export type Freshness = { fraicheur_pct: number; date_batch?: string; derniere_vente?: string; last_sale_at?: string }
export type Shop = { shop_id: string; shop_name: string; shop_type: string; governorate: string; region: string; territory_profile: string; latitude: number; longitude: number; distance_from_depot_km: number; lead_time_days: number; catchment_score: number; fwa_coverage_score: number; shop_demand_factor: number; is_active: boolean }
export type ShopDetail = { shop: Shop; predictions: Prediction[]; recommendations: Recommendation[] }
export type SimulationResult = { shop_id: string; product_id: string; predicted_demand_7d: number; proba_stockout_7d: number; risk_stockout_7d: number; proba_overstock: number; risk_overstock: number }
export type AgentTool = { name: string; args: Record<string, unknown>; result_preview: string }
export type AgentResponse = { answer: string; tools_called: AgentTool[]; similar_past_conversations: { id: string; score: number; user_message: string; agent_answer: string; tools_called: string[]; timestamp: string }[]; iterations: number; memory_id: string }
export type AgentHealth = { status: string; groq_api_key_configured: boolean; memory: { qdrant_reachable: boolean; collection_exists: boolean; embedding_model: string; vector_size: number } }

async function request<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${base}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } })
  if (!response.ok) throw new Error(`Erreur API (${response.status})`)
  return response.json()
}

export const api = {
  kpis: () => request<Kpis>(DASHBOARD_API, '/live/kpis'),
  freshness: () => request<Freshness>(DASHBOARD_API, '/live/freshness'),
  topRisks: (limit = 20) => request<TopRisk[]>(DASHBOARD_API, `/live/top-risks?limit=${limit}`),
  recommendations: (priority = '', limit = 500) => request<Recommendation[]>(DASHBOARD_API, `/recommendations?${priority ? `priority=${priority}&` : ''}limit=${limit}`),
  shop: (id: string) => request<ShopDetail>(DASHBOARD_API, `/shop/${encodeURIComponent(id)}`),
  simulate: (body: Record<string, unknown>) => request<SimulationResult>(MODEL_API, '/predict', { method: 'POST', body: JSON.stringify(body) }),
  agentHealth: () => request<AgentHealth>(AGENT_API, '/health'),
  chat: (body: { message: string; history: { role: string; content: string }[]; user_id?: string }) => request<AgentResponse>(AGENT_API, '/chat', { method: 'POST', body: JSON.stringify(body) }),
  history: (limit = 20) => request<AgentResponse['similar_past_conversations']>(AGENT_API, `/history?limit=${limit}`),
  memorySearch: (q: string, limit = 5, minScore = 0.5) => request<AgentResponse['similar_past_conversations']>(AGENT_API, `/memory/search?q=${encodeURIComponent(q)}&limit=${limit}&min_score=${minScore}`),
  deleteMemory: (id: string) => request<{ deleted: string }>(AGENT_API, `/memory/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}

export function formatNumber(value: number, decimals = 0) { return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value) }
export function formatDate(value: string) { return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value)) }
export function downloadCsv(filename: string, rows: Record<string, unknown>[], labels: Record<string, string> = {}) { if (!rows.length) return; const keys = Object.keys(rows[0]); const csv = [keys.map(key => JSON.stringify(labels[key] ?? key)).join(';'), ...rows.map(row => keys.map(key => JSON.stringify(row[key] ?? '')).join(';'))].join('\n'); const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url) }
export function priorityTone(priority: string) { return priority === 'High' ? 'danger' : priority === 'Medium' ? 'warning' : 'info' }
