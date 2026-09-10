'use client'

import { Alert } from '@/lib/api-alerts'
import { formatNumber } from '@/lib/api'
import { Button } from '@/components/ui/button'

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'à l\'instant'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `il y a ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `il y a ${days}j`
  if (days < 30) return `il y a ${Math.floor(days / 7)}w`
  return date.toLocaleDateString('fr-FR')
}

export function AlertCard({
  alert,
  onApprove,
  onReject,
  disabled = false,
}: {
  alert: Alert
  onApprove?: (alertId: string) => void
  onReject?: (alertId: string) => void
  disabled?: boolean
}) {
  const isPending = alert.status === 'PENDING'

  const severityColor =
    alert.severity === 'RUPTURE'
      ? 'bg-red-100 text-red-800'
      : alert.severity === 'SURSTOCK'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-gray-100 text-gray-800'

  const recommendationColor =
    alert.agent_recommendation === 'ENVOYER'
      ? 'bg-[#ff7900]/10 text-[#ff7900]'
      : 'bg-gray-100 text-gray-800'

  const borderColor =
    alert.status === 'APPROVED'
      ? 'border-l-4 border-l-green-500'
      : alert.status === 'REJECTED'
        ? 'border-l-4 border-l-red-500'
        : 'border-l-4 border-l-gray-200'

  return (
    <div className={`rounded-lg border bg-white p-5 shadow-sm ${borderColor}`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {alert.shop_id}
            </span>
            <span className="font-semibold text-gray-900">
              {alert.product_id}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {alert.governorate} · {alert.region}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${severityColor}`}>
            {alert.severity}
          </span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${recommendationColor}`}>
          {alert.agent_recommendation}
        </span>
        <span className="text-xs text-gray-500">
          Confiance: {alert.agent_confidence}
        </span>
      </div>

      <div className="mb-4 rounded-lg border-l-4 border-l-[#ff7900] bg-[#ff7900]/5 p-3">
        <p className="text-sm leading-relaxed text-gray-800">
          {alert.agent_justification}
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-gray-600">Demandé</p>
          <p className="font-semibold text-gray-900">
            {alert.suggested_qty !== null ? formatNumber(alert.suggested_qty) : '–'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Alloué</p>
          <p className="font-semibold text-gray-900">
            {alert.qty_allocated !== null ? formatNumber(alert.qty_allocated) : '–'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Statut allocation</p>
          <p className="font-semibold text-gray-900">
            {alert.allocation_status || '–'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Risque</p>
          <p className="font-semibold text-gray-900">
            {alert.stockout_risk_score !== null
              ? alert.stockout_risk_score.toFixed(1)
              : '–'}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-1 border-t pt-3 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {formatRelativeDate(alert.created_at)} · {alert.recipient_email}
        </div>
      </div>

      {isPending ? (
        <div className="flex gap-2">
          <Button
            onClick={() => onApprove?.(alert.alert_id)}
            disabled={disabled}
            className="flex-1 bg-[#ff7900] text-white hover:bg-[#ff7900]/90 sm:flex-none"
          >
            Approuver
          </Button>
          <Button
            onClick={() => onReject?.(alert.alert_id)}
            disabled={disabled}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            Refuser
          </Button>
        </div>
      ) : (
        <div className="text-xs text-gray-600">
          <p className="font-semibold">
            {alert.status === 'APPROVED'
              ? '✓ Approuvée'
              : alert.status === 'REJECTED'
                ? '✕ Refusée'
                : '→ Envoyée'}
          </p>
          <p>
            par {alert.decided_by}{' '}
            {alert.decided_at && `· ${formatRelativeDate(alert.decided_at)}`}
            {alert.decision_reason && ` · ${alert.decision_reason}`}
          </p>
        </div>
      )}
    </div>
  )
}
