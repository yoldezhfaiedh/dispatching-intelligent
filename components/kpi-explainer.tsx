'use client'
import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import { extraApi, type KpiExplanation } from '@/lib/api-extra'

export function KpiExplainer({ kpiKey }: { kpiKey: string }) {
  const [items, setItems] = useState<KpiExplanation[]>([])
  useEffect(() => { extraApi.kpiExplanations().then(setItems).catch(() => setItems([])) }, [])
  const item = items.find((entry) => entry.key === kpiKey)
  if (!item) return null
  return <span className="group relative inline-flex"><button type="button" aria-label={`Définition de ${item.title}`} className="rounded-full p-1 text-black/35 hover:bg-black/5 hover:text-[#ff7900]"><Info className="size-3.5"/></button><span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-64 -translate-x-1/2 rounded-xl bg-[#171717] p-3 text-left text-xs leading-relaxed text-white shadow-xl group-hover:block"><strong className="block text-white">{item.title}</strong><span className="mt-1 block text-white/75">{item.definition}</span>{item.formula && <span className="mt-2 block font-mono text-[10px] text-[#ffb066]">{item.formula}</span>}</span></span>
}
