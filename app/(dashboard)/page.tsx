"use client"

import { Users, CalendarDays, CalendarRange } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getEmpresaScopedStore, seedIfEmpty } from "@/lib/store"
import { useEffect, useMemo, useState } from "react"

type MetricCardProps = {
  title: string
  value: number | string
  icon: React.ReactNode
  className?: string
}

function MetricCard({ title, value, icon, className }: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
MetricCard.defaultProps = {
  className: "",
}

export default function Page() {
  const [empresa, setEmpresa] = useState<string>("")
  const [metrics, setMetrics] = useState({
    total: 0,
    weekly: 0,
    monthly: 0,
    trend: [] as { day: string; usos: number }[],
  })

  useEffect(() => {
    const empresaCookie =
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("empresa="))
        ?.split("=")[1] ?? "acme"
    setEmpresa(empresaCookie)
  }, [])

  useEffect(() => {
    if (!empresa) return
    seedIfEmpty(empresa)
    const store = getEmpresaScopedStore(empresa)
    const clientes = store.getClientes()
    const today = new Date()
    const last7 = clientes.filter((c) => {
      const d = c.ultimoUso ? new Date(c.ultimoUso) : null
      return d ? (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7 : false
    }).length
    const last30 = clientes.filter((c) => {
      const d = c.ultimoUso ? new Date(c.ultimoUso) : null
      return d ? (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 30 : false
    }).length
    const trendData = store.getUsoTrend() // 14 días
    setMetrics({
      total: clientes.length,
      weekly: last7,
      monthly: last30,
      trend: trendData,
    })
  }, [empresa])

  const chartColor = useMemo(() => "#16a34a", [])

  const w = 640
  const h = 220
  const pad = 24
  const maxUsos = Math.max(1, ...metrics.trend.map((t) => t.usos))
  const n = metrics.trend.length || 1
  const step = n > 1 ? (w - 2 * pad) / (n - 1) : 0
  const points = metrics.trend.map((t, i) => {
    const x = pad + i * step
    const y = h - pad - (t.usos / maxUsos) * (h - 2 * pad)
    return `${x},${y}`
  }).join(" ")
  const axisY = h - pad
  const gridColor = "#e5e7eb"

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Usuarios con Wallet"
          value={metrics.total}
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
        />
        <MetricCard
          title="Uso últimos 7 días"
          value={metrics.weekly}
          icon={<CalendarDays className="h-5 w-5 text-muted-foreground" />}
        />
        <MetricCard
          title="Uso últimos 30 días"
          value={metrics.monthly}
          icon={<CalendarRange className="h-5 w-5 text-muted-foreground" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{"Tendencia de uso (últimos 14 días)"}</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          <div className="w-full overflow-x-auto">
            <svg width={w} height={h} role="img" aria-label="Tendencia de uso">
              {/* Grid lines */}
              <g stroke={gridColor} strokeWidth="1" opacity="0.6">
                <line x1={pad} y1={axisY} x2={w - pad} y2={axisY} />
                <line x1={pad} y1={pad} x2={w - pad} y2={pad} />
              </g>
              {/* Polyline */}
              <polyline
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
                points={points}
              />
              {/* Dots */}
              {metrics.trend.map((t, i) => {
                const x = pad + i * step
                const y = h - pad - (t.usos / maxUsos) * (h - 2 * pad)
                return <circle key={i} cx={x} cy={y} r="3" fill="#16a34a" />
              })}
              {/* X labels (sparse) */}
              {metrics.trend.map((t, i) => {
                if (i % Math.max(1, Math.floor(n / 6)) !== 0) return null
                const x = pad + i * step
                return (
                  <text key={`lbl-${i}`} x={x} y={h - 4} fontSize="10" textAnchor="middle" fill="#6b7280">
                    {t.day}
                  </text>
                )
              })}
              {/* Y labels */}
              <text x={pad - 8} y={pad + 4} fontSize="10" textAnchor="end" fill="#6b7280">{maxUsos}</text>
              <text x={pad - 8} y={axisY} fontSize="10" textAnchor="end" fill="#6b7280">0</text>
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
