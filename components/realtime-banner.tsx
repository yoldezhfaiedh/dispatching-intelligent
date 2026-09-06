'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, RefreshCw } from 'lucide-react'
import { DASHBOARD_API } from '@/lib/api'

type RealtimeData = {
  status?: string
  last_update?: string
  kpis?: { p1?: number; p2?: number; p3?: number; p4?: number; couples_rescores?: number }
  predictions?: Array<{ priority?: string | number; stock?: number; couverture?: number; risque_7j?: number; delta?: number; updated_at?: string }>
}

const priorityTitles: Record<string, string> = {
  P1: 'Rayon vide ou moins d’un jour de couverture',
  P2: 'Couverture inférieure au délai de livraison, ou risque modèle supérieur à 38 %',
  P3: 'Sous surveillance',
  P4: 'Situation normale',
}

function relativeDate(value?: string) {
  if (!value) return '—'
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return `il y a ${seconds} s`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function unwrap<T>(value: T | { data?: T; result?: T; kpis?: T; predictions?: T }) {
  if (value && typeof value === 'object' && 'data' in value && value.data !== undefined) return value.data as T
  if (value && typeof value === 'object' && 'result' in value && value.result !== undefined) return value.result as T
  return value as T
}

export function RealtimeBanner() {
  const [data, setData] = useState<RealtimeData | null>(null)
  const [error, setError] = useState(false)
  const load = async () => {
    try {
      setError(false)
      const [statusResponse, kpiResponse, predictionResponse] = await Promise.all([
        fetch(`${DASHBOARD_API}/realtime/status`).then((response) => response.json()),
        fetch(`${DASHBOARD_API}/realtime/kpis?window_minutes=60`).then((response) => response.json()),
        fetch(`${DASHBOARD_API}/realtime/predictions?limit=8`).then((response) => response.json()),
      ])
      setData({ ...unwrap(statusResponse), kpis: unwrap(kpiResponse), predictions: unwrap(predictionResponse) as RealtimeData['predictions'] })
    } catch { setError(true) }
  }
  useEffect(() => { load() }, [])
  const kpis = data?.kpis
  const counts = [kpis?.p1 ?? 0, kpis?.p2 ?? 0, kpis?.p3 ?? 0, kpis?.p4 ?? 0]
  const countedTotal = counts.reduce((sum, value) => sum + value, 0)
  const total = countedTotal || kpis?.couples_rescores || 0
  const live = data?.status === 'live'
  const number = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })
  const segments = useMemo(() => counts.map((value, index) => ({ value, width: total ? `${(value / total) * 100}%` : '0%', color: ['bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-emerald-500'][index] })), [counts, total])
  return <section className={`rounded-2xl border p-4 ${error ? 'border-red-200 bg-red-50 text-red-800' : live ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><Activity className="size-4"/><span className="font-semibold">{error ? 'Données temps réel indisponibles' : live ? 'Données en temps réel' : 'Données potentiellement obsolètes'}</span><span className="text-xs opacity-70">{relativeDate(data?.last_update)}</span></div><button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-current/15 bg-white/70 px-3 py-2 text-xs font-semibold"><RefreshCw className="size-3"/> Actualiser</button></div>
    {!error && <><div className="mt-4 flex h-3 overflow-hidden rounded-full bg-black/10">{segments.map((segment, index) => <div key={`segment-${index}`} className={segment.color} style={{ width: segment.width }} />)}</div><div className="mt-2 grid grid-cols-4 gap-2 text-xs font-semibold"><span title={priorityTitles.P1}>P1 {counts[0]}</span><span title={priorityTitles.P2}>P2 {counts[1]}</span><span title={priorityTitles.P3}>P3 {counts[2]}</span><span title={priorityTitles.P4}>P4 {counts[3]}</span></div><p className="mt-2 text-[11px] text-black/40">P1 rupture immédiate · P2 réapprovisionnement urgent · P3 surveillance · P4 situation normale</p><div className="mt-4 grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-black/5 pb-2 text-[10px] uppercase tracking-wide text-black/30"><span>Priorité</span><span title="unités en rayon">Stock</span><span title="jours de vente couverts au rythme habituel">Couverture</span><span title="probabilité de rupture sous 7 jours estimée par le modèle">Risque 7j</span></div>{data?.predictions?.map((prediction, index) => <div key={`${prediction.updated_at ?? 'prediction'}-${index}`} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 py-2 text-xs"><span className="font-semibold" title={priorityTitles[`P${prediction.priority}`] ?? 'Priorité'}>P{prediction.priority}</span><span title="unités en rayon">{prediction.stock ?? '—'} u</span><span title="jours de vente couverts au rythme habituel">{prediction.couverture ?? '—'} j</span><span title="probabilité de rupture sous 7 jours estimée par le modèle">{prediction.risque_7j === undefined ? '—' : `${number.format(prediction.risque_7j * 100)} %`}</span></div>)}</>}
  </section>
}
