'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertCard } from '@/components/alertes/alert-card'
import { AlertKpiCards } from '@/components/alertes/alert-kpi-cards'
import { alertsApi, type Alert, type AlertKpis } from '@/lib/api-alerts'

export default function AlertesPage() {
  const [kpis, setKpis] = useState<AlertKpis | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [nextKpis, nextAlerts] = await Promise.all([
        alertsApi.kpis(),
        alertsApi.queue('PENDING'),
      ])
      setKpis(nextKpis)
      setAlerts(nextAlerts)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de charger les alertes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const decide = async (alertId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') await alertsApi.approve(alertId, 'dashboard')
      else await alertsApi.reject(alertId, 'dashboard')
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'La décision n’a pas pu être enregistrée.')
    }
  }

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 p-5 md:p-8">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#ff7900]">Dispatching intelligent</p>
        <h2 className="text-3xl font-bold tracking-tight">Alertes agent</h2>
        <p className="mt-2 text-sm text-black/50">Validez les propositions de l’agent avant leur envoi.</p>
      </div>
      {error && <div role="alert" className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span>{error}</span><button onClick={() => void load()} className="font-semibold underline">Réessayer</button></div>}
      {loading && <p className="text-sm text-black/50">Chargement des alertes…</p>}
      {!loading && kpis && <AlertKpiCards data={kpis} />}
      {!loading && alerts.length === 0 && !error && <div className="rounded-2xl border bg-white p-10 text-center text-sm text-black/50">Aucune alerte en attente.</div>}
      <section className="flex flex-col gap-4">
        {alerts.map((alert) => <AlertCard key={alert.alert_id} alert={alert} onApprove={(id) => void decide(id, 'approve')} onReject={(id) => void decide(id, 'reject')} disabled={loading} />)}
      </section>
    </main>
  )
}
