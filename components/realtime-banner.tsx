'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Radio } from 'lucide-react'
import { extraApi, extraFormat, priorityColor, relativeTime, type RealtimeKpis, type RealtimePrediction } from '@/lib/api-extra'

const priorityTitles: Record<string, string> = {
  P1: 'Rayon vide ou moins d’un jour de couverture',
  P2: 'Couverture inférieure au délai de livraison, ou risque modèle supérieur à 38 %',
  P3: 'Sous surveillance',
  P4: 'Situation normale',
}

export function RealtimeBanner() {
  const [kpis, setKpis] = useState<RealtimeKpis | null>(null)
  const [rows, setRows] = useState<RealtimePrediction[]>([])
  const load = async () => {
    try {
      const [nextKpis, nextRows] = await Promise.all([extraApi.realtimeKpis(), extraApi.realtimePredictions()])
      setKpis(nextKpis); setRows(nextRows)
    } catch { setKpis(null); setRows([]) }
  }
  useEffect(() => { load(); const id = setInterval(load, 5000); return () => clearInterval(id) }, [])
  if (!kpis) return null
  const priorityTotal = kpis.p1 + kpis.p2 + kpis.p3 + kpis.p4
  const total = Math.max(1, priorityTotal)
  const counts = [['P1', kpis.p1, '#dc2626'], ['P2', kpis.p2, '#ff7900'], ['P3', kpis.p3, '#f59e0b'], ['P4', kpis.p4, '#94a3b8']] as const

  return <section className="rounded-2xl border border-black/5 bg-white p-5" aria-label="Flux temps réel">
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="size-2 animate-pulse rounded-full bg-emerald-500"/><h3 className="font-bold tracking-tight">Flux temps réel</h3><span className="text-sm text-black/45">{extraFormat(kpis.ventes_recues)} ventes reçues et {extraFormat(kpis.couples_rescores)} couples rescorés sur la dernière heure</span></div><span className="text-xs text-black/45">{relativeTime(kpis.dernier_scoring)}</span></div>
    <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-black/5" aria-label="Répartition des priorités">{counts.map(([p, n, color]) => <div key={p} style={{ width: `${n / total * 100}%`, background: color }} title={`${p} : ${n}`}/>)}</div>
    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-black/55">{counts.map(([p, n, color]) => <span key={p} className="flex items-center gap-1.5" title={priorityTitles[p]}><i className="size-2 rounded-full" style={{ background: color }}/>{p} · {n}</span>)}</div>
    <p className="mt-2 text-[11px] leading-relaxed text-black/40 md:whitespace-nowrap">P1 rupture immédiate · P2 réapprovisionnement urgent · P3 surveillance · P4 situation normale</p>
    {kpis.couples_rescores === 0 ? <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-black/45"><Radio className="size-6"/><p>Aucune vente reçue sur la dernière heure</p><p className="text-xs">Lancer le simulateur pour observer le scoring en direct.</p></div> : <div className="mt-5"><div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 border-b border-black/5 pb-2 text-[10px] uppercase tracking-wide text-black/30"><span/><span>Stock</span><span>Couverture</span><span>Risque 7j</span></div><div className="flex flex-col">{rows.map(row => <div key={`${row.shop_id}-${row.product_id}`} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 border-b border-black/5 py-3 text-xs"><div className="min-w-0"><b className="truncate">{row.shop_id}</b><p className="truncate text-black/45">{row.product_id}</p></div><span title="unites en rayon">{extraFormat(row.stock_on_hand)} u</span><span title="jours de vente couverts au rythme habituel">{extraFormat(row.coverage_days_now, 1)} j</span><span className="flex items-center gap-1" title="probabilite de rupture sous 7 jours estimee par le modele">{row.proba_stockout_7d >= .5 ? <ArrowUp className="size-3 text-red-600"/> : <ArrowDown className="size-3 text-emerald-600"/>}{extraFormat(row.proba_stockout_7d * 100)} %</span></div>)}</div></div>}
  </section>
}

export { priorityColor }

