import { AGENT_API } from './api'

export type AlertKpis = {
  total: number
  pending: number
  approved: number
  rejected: number
  sent: number
  conformity_rate: number | null
  agent_agreement_rate: number | null
}

export type Alert = {
  alert_id: string
  created_at: string
  shop_id: string
  product_id: string
  alert_type: string
  governorate: string
  region: string
  severity: 'RUPTURE' | 'SURSTOCK' | 'NORMAL'
  suggested_qty: number | null
  qty_allocated: number | null
  allocation_status: string | null
  stockout_risk_score: number | null
  agent_recommendation: 'ENVOYER' | 'IGNORER'
  agent_justification: string
  agent_confidence: 'HAUTE' | 'MOYENNE' | 'BASSE'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SENT'
  decided_at: string | null
  decided_by: string | null
  decision_reason: string | null
  recipient_email: string
  sent_at: string | null
}

export type AlertRecipients = {
  recipients: { region: string; email: string; active: boolean }[]
  default_email: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${AGENT_API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  })

  if (response.status === 409) {
    const data = await response.json()
    const error = new Error(data.detail || 'Conflict')
    ;(error as any).detail = data.detail
    ;(error as any).status = 409
    throw error
  }

  if (!response.ok) {
    throw new Error(`Erreur API (${response.status})`)
  }

  return response.json()
}

export const alertsApi = {
  kpis: () => request<AlertKpis>('/alerts/kpis'),

  queue: (status?: string, region?: string, limit = 100) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (region) params.append('region', region)
    params.append('limit', limit.toString())
    return request<Alert[]>(`/alerts/queue?${params.toString()}`)
  },

  approve: (alertId: string, decideBy: string, reason?: string) =>
    request<Alert>(`/alerts/${alertId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ decided_by: decideBy, reason }),
    }),

  reject: (alertId: string, decideBy: string, reason?: string) =>
    request<Alert>(`/alerts/${alertId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ decided_by: decideBy, reason }),
    }),

  propose: (limit = 10, useAgent = true) => {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    params.append('use_agent', useAgent.toString())
    return request<Alert[]>(`/alerts/propose?${params.toString()}`, {
      method: 'POST',
    })
  },

  recipients: () => request<AlertRecipients>('/alerts/recipients'),
}
