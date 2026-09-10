const BASE = process.env.NEXT_PUBLIC_JOBS_API_URL || 'http://localhost:8005'

export type OrderStatus = 'PROPOSE' | 'VALIDE' | 'EMIS' | 'RECU' | 'ANNULE'
export type Order = { order_id:string; created_at:string; recommendation_date:string; shop_id:string; product_id:string; order_type:'REASSORT'|'RETRAIT'; qty_ordered:number; status:OrderStatus; severity:string; allocation_status:string|null; suggested_qty:number|null; qty_allocated:number|null; depot_available:number|null; justification:string; mode_at_creation:string; auto_eligible:boolean; auto_block_reason:string|null; allocation_policy:string|null; coverage_days_param:number|null; models_scored_at:string|null; validated_at:string|null; validated_by:string|null; emitted_at:string|null; received_at:string|null; closed_reason:string|null }
export type OrderKpis = { mode:string; enabled:boolean; total:number; propose:number; valide:number; emis:number; recu:number; annule:number; units_emitted_today:number; daily_unit_cap:number; cap_usage_rate:number; auto_eligible_share:number }
export type OrderConfig = { mode:string; enabled:boolean; allowed_severities:string; max_qty_per_order:number; product_whitelist:string; daily_unit_cap:number; dedup_hours:number; updated_at:string; updated_by:string }
export type BlockedReason = { motif:string; ordres:number; unites:number }
export type DepotStock = { stock:{product_id:string; initial:number; delta:number; net:number; taux_consommation:number}[]; mouvements:{product_id:string; movement_type:string; mouvements:number; delta:number}[] }
export type GenerateSummary = { crees:number; auto_emis:number; en_attente:number; mode?:string; enabled?:boolean; unites_emises?:number; unites_sorties_du_depot?:number; motifs_de_blocage?:Record<string,number>; message?:string }
async function request<T>(path:string, init?:RequestInit):Promise<T>{ const r=await fetch(`${BASE}${path}`,{...init,headers:{'Content-Type':'application/json',...(init?.headers||{})}}); let data:unknown; try{data=await r.json()}catch{data=null} if(!r.ok){const e=new Error(typeof data==='object'&&data&&'detail'in data?String((data as {detail:string}).detail):`Erreur API (${r.status})`); (e as Error&{status?:number}).status=r.status; throw e} return data as T }
function query(values:Record<string,string|number|boolean|undefined>){const p=new URLSearchParams(); Object.entries(values).forEach(([k,v])=>v!==undefined&&p.set(k,String(v))); const s=p.toString(); return s?`?${s}`:''}
export const ordersApi={
 kpis:()=>request<OrderKpis>('/orders/kpis'),
 list:(filters:{status?:OrderStatus;shop_id?:string;product_id?:string;auto_only?:boolean;limit?:number})=>request<Order[]>(`/orders${query(filters)}`),
 action:(id:string, action:'validate'|'emit'|'receive'|'cancel', decided_by:string, reason?:string)=>request<Order>(`/orders/${encodeURIComponent(id)}/${action}`,{method:'POST',body:JSON.stringify({decided_by,reason})}),
 generate:(limit=2000)=>request<GenerateSummary>(`/orders/generate?limit=${limit}`,{method:'POST'}),
 config:()=>request<OrderConfig>('/orders/config'),
 updateConfig:(body:Partial<OrderConfig>&{updated_by:string})=>request<OrderConfig>('/orders/config',{method:'PUT',body:JSON.stringify(body)}),
 blocked:()=>request<BlockedReason[]>('/orders/blocked'),
 depotStock:()=>request<DepotStock>('/orders/depot-stock'),
}
export const fmt=(n:number|null|undefined, d=0)=>n==null?'—':new Intl.NumberFormat('fr-FR',{maximumFractionDigits:d,minimumFractionDigits:d}).format(n)
export const dateFr=(s:string|null)=>s?new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium'}).format(new Date(s)):'—'

export type { Order as OrderRecord }
