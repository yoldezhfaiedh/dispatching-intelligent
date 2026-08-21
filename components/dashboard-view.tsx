'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AlertCircle, ArrowUpRight, RefreshCw, TrendingDown, Warehouse } from 'lucide-react'
import { api, formatDate, formatNumber, type Freshness, type Kpis, type TopRisk } from '@/lib/api'
import { RealtimeBanner } from '@/components/realtime-banner'
import { KpiTooltip } from '@/components/kpi-tooltip'

function ErrorCard({ retry }: { retry: () => void }) {
  return <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-300 bg-red-50 p-5 text-sm text-red-800"><div className="flex items-center gap-3"><AlertCircle className="size-5 shrink-0"/><div><p className="font-bold">Connexion au service impossible</p><p className="mt-1">L&apos;API live ne répond pas.</p></div></div><button onClick={retry} className="flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold"><RefreshCw className="size-3"/> Réessayer</button></div>
}

export function DashboardView() {
  const [kpis, setKpis] = useState<Kpis | null>(null)
  const [freshness, setFreshness] = useState<Freshness | null>(null)
  const [risks, setRisks] = useState<TopRisk[]>([])
  const [error, setError] = useState(false)
  const load = () => { setError(false); Promise.all([api.kpis(), api.topRisks(), api.freshness()]).then(([k, r, f]) => { setKpis(k); setRisks(r); setFreshness(f) }).catch(() => { setKpis(null); setFreshness(null); setRisks([]); setError(true) }) }
  useEffect(() => { load() }, [])
  const value = (v: number | undefined) => v === undefined ? '—' : formatNumber(v)
  const lastSale = freshness?.derniere_vente || freshness?.last_sale_at
  const minutesAgo = lastSale ? Math.max(0, Math.floor((Date.now() - new Date(lastSale).getTime()) / 60000)) : null
  const batchDate = freshness?.date_batch || kpis?.date_batch || kpis?.reference_date
  const recommendationDate = kpis?.recommendation_date || batchDate
  const cards = [
    { label: 'En risque de rupture', value: `${value(kpis?.pairs_at_stockout_risk)} / ${value(kpis?.total_pairs)}`, icon: TrendingDown, caption: `${value(kpis?.shops_at_stockout_risk)} boutiques touchées` },
    { label: 'En surstock', value: `${value(kpis?.pairs_at_overstock_risk)} / ${value(kpis?.total_pairs)}`, icon: Warehouse, caption: `${value(kpis?.shops_at_overstock_risk)} boutiques concernées` },
    { label: 'Actions urgentes', value: `${value(kpis?.high_priority_recommendations)} / ${value(kpis?.total_recommendations)}`, icon: TrendingDown, caption: `plan du ${recommendationDate ? formatDate(recommendationDate) : '—'}` },
    { label: 'Unités à dispatcher', value: value(kpis?.total_units_to_dispatch), icon: Warehouse, caption: `plan du ${recommendationDate ? formatDate(recommendationDate) : '—'}` },
  ]
  return <div className="mx-auto max-w-7xl space-y-8"><RealtimeBanner/><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700"><span className="size-2 animate-pulse rounded-full bg-emerald-500"/>Stock à jour · dernière vente {minutesAgo === null ? '—' : `il y a ${minutesAgo} min`}</p><h2 className="text-3xl font-bold tracking-tight md:text-4xl">Pilotez vos stocks avec précision.</h2><p className="mt-2 text-sm text-black/50">Vue consolidée des risques et actions prioritaires sur le réseau Orange.</p></div><Link href="/recommendations" className="inline-flex items-center gap-2 rounded-xl bg-[#ff7900] px-4 py-3 text-sm font-bold text-white">Voir les actions <ArrowUpRight className="size-4"/></Link></div>{error && <ErrorCard retry={load}/>}<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map(card => { const Icon = card.icon; return <article key={card.label} className="rounded-2xl border border-black/5 bg-white p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-black/55">{card.label}</p><p className="mt-3 text-2xl font-bold tracking-tight">{card.value}</p></div><Icon className="size-5 text-[#ff7900]"/></div><p className="mt-4 text-xs text-black/40">{card.caption}</p></article>})}</div><p className="text-xs text-black/40">{freshness?.fraicheur_pct ?? kpis?.fraicheur_pct ?? 0} % du réseau rescoré depuis le batch du {batchDate ? formatDate(batchDate) : '—'}</p><section className="rounded-2xl border border-black/5 bg-white p-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">Surveillance live</p><h3 className="mt-1 text-xl font-bold">Top risques</h3></div><KpiTooltip title="Top risques" text="Couples boutique-produit classés par probabilité de rupture à 7 jours."/></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-black/5 text-xs text-black/40"><tr><th className="pb-3">Boutique</th><th className="pb-3">Produit</th><th className="pb-3">Région</th><th className="pb-3">Risque rupture</th><th className="pb-3">Stock</th></tr></thead><tbody>{risks.map(risk => <tr key={`${risk.shop_id}-${risk.product_id}`} className="border-b border-black/5 last:border-0"><td className="py-3 font-semibold">{risk.shop_id}</td><td className="py-3">{risk.product_id}</td><td className="py-3 text-black/55">{risk.region || risk.governorate}</td><td className="py-3 font-semibold">{formatNumber(risk.proba_stockout_7d * 100)} % {risk.est_temps_reel && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-700">live</span>}</td><td className="py-3">{formatNumber(risk.stock_on_hand)}</td></tr>)}</tbody></table>{risks.length === 0 && <p className="py-8 text-center text-sm text-black/40">Aucun risque disponible.</p>}</div></section></div>
}
