'use client'

import { AlertKpis } from '@/lib/api-alerts'
import { formatNumber } from '@/lib/api'

export function AlertKpiCards({ data }: { data: AlertKpis }) {
  const conformityPercent =
    data.conformity_rate !== null ? data.conformity_rate.toFixed(1) : null
  const agreementPercent =
    data.agent_agreement_rate !== null
      ? data.agent_agreement_rate.toFixed(1)
      : null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">En attente</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-[#ff7900]">
          {formatNumber(data.pending)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          alertes à traiter
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">Taux de conformité</p>
        <p className="mt-3 text-3xl font-bold tracking-tight">
          {conformityPercent !== null ? `${conformityPercent}%` : '–'}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {conformityPercent !== null
            ? `${formatNumber(data.approved + data.sent)} / ${formatNumber(data.approved + data.rejected + data.sent)}`
            : 'aucune décision encore prise'}
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">Accord avec l&apos;agent</p>
        <p className="mt-3 text-3xl font-bold tracking-tight">
          {agreementPercent !== null ? `${agreementPercent}%` : '–'}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          part des décisions qui ont suivi l&apos;avis de l&apos;agent
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">Envoyées</p>
        <p className="mt-3 text-3xl font-bold tracking-tight">
          {formatNumber(data.sent)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {formatNumber(data.approved)} en attente d&apos;envoi
        </p>
      </div>
    </div>
  )
}
