'use client'
import { useEffect, useState } from 'react'
import { Activity, RefreshCw } from 'lucide-react'
import { extraApi, apiDate, type RealtimeStatus } from '@/lib/api-extra'

export function RealtimeBanner() {
  const [data, setData] = useState<RealtimeStatus | null>(null)
  const [error, setError] = useState(false)
  const load = () => { setError(false); extraApi.realtime().then(setData).catch(() => setError(true)) }
  useEffect(() => { load() }, [])
  const live = data?.status === 'live'
  return <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-800' : live ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}><div className="flex items-center gap-3"><Activity className="size-4"/><span className="font-semibold">{error ? 'Données temps réel indisponibles' : live ? 'Données en temps réel' : 'Données potentiellement obsolètes'}</span>{data?.last_update && <span className="text-xs opacity-70">Dernière mise à jour : {apiDate(data.last_update)}</span>}</div><button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-current/15 bg-white/70 px-3 py-2 text-xs font-semibold"><RefreshCw className="size-3"/> Actualiser</button></div>
}
