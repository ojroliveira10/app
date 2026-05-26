'use client'

import { useMemo } from 'react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTransactions } from '@/hooks/useTransactions'
import {
  calculateScoreBreakdown,
  calculateTotalScore,
  getScoreLevel,
} from '@/lib/financialScore'
import { SCORE_LEVELS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function ScoreGaugeLarge({ score }: { score: number }) {
  const pct = score / 1000
  const r = 110
  const cx = 150
  const cy = 150
  const startAngle = 210
  const endAngle = -30
  const totalDeg = startAngle - endAngle

  function toRad(deg: number) {
    return (deg * Math.PI) / 180
  }

  function pt(deg: number) {
    return {
      x: cx + r * Math.cos(toRad(deg)),
      y: cy - r * Math.sin(toRad(deg)),
    }
  }

  function arc(from: number, to: number) {
    const s = pt(from)
    const e = pt(to)
    const large = Math.abs(from - to) > 180 ? 1 : 0
    const sweep = from > to ? 0 : 1
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} ${sweep} ${e.x} ${e.y}`
  }

  const scoreEnd = startAngle - pct * totalDeg

  return (
    <svg viewBox="0 0 300 200" className="w-full max-w-xs mx-auto">
      <defs>
        <linearGradient id="bigScoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Track */}
      <path
        d={arc(startAngle, endAngle)}
        fill="none"
        stroke="rgb(55 65 81)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* Score fill */}
      {score > 0 && (
        <path
          d={arc(startAngle, scoreEnd)}
          fill="none"
          stroke="url(#bigScoreGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          filter="url(#glow)"
        />
      )}
      {/* Tick marks */}
      {[0, 200, 400, 600, 800, 1000].map((tick) => {
        const angle = startAngle - (tick / 1000) * totalDeg
        const inner = pt_r(cx, cy, r - 22, angle)
        const outer = pt_r(cx, cy, r - 12, angle)
        return (
          <line
            key={tick}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="rgb(75 85 99)"
            strokeWidth="2"
          />
        )
      })}
    </svg>
  )
}

function pt_r(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

const CRITERIA_LABELS: Record<string, string> = {
  controle: 'Controle',
  consistencia: 'Consistência',
  diversidade: 'Diversidade',
  organizacao: 'Organização',
  saldo: 'Saldo',
}
const CRITERIA_MAX: Record<string, number> = {
  controle: 300,
  consistencia: 200,
  diversidade: 200,
  organizacao: 150,
  saldo: 150,
}

export default function ScorePage() {
  const { transactions, loading } = useTransactions()
  const breakdown = useMemo(() => calculateScoreBreakdown(transactions), [transactions])
  const score = useMemo(() => calculateTotalScore(breakdown), [breakdown])
  const level = useMemo(() => getScoreLevel(score), [score])

  const radarData = Object.entries(breakdown).map(([key, value]) => ({
    subject: CRITERIA_LABELS[key],
    value: Math.round((value / CRITERIA_MAX[key]) * 100),
    fullMark: 100,
  }))

  const breakdownItems = Object.entries(breakdown).map(([key, value]) => ({
    key,
    label: CRITERIA_LABELS[key],
    value,
    max: CRITERIA_MAX[key],
    pct: Math.round((value / CRITERIA_MAX[key]) * 100),
  }))

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Score Financeiro</h1>
        <p className="text-sm text-muted-foreground">
          Pontuação proprietária baseada no seu comportamento financeiro
        </p>
      </div>

      {loading ? (
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      ) : (
        <>
          {/* Main score */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-cyan-500/5 pointer-events-none" />
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col items-center relative">
                <ScoreGaugeLarge score={score} />
                <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
                  <span className="text-6xl font-black text-foreground tabular-nums tracking-tight">
                    {score}
                  </span>
                  <span className="text-sm text-muted-foreground">de 1000 pontos</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl">{level.emoji}</span>
                  <span className="text-xl font-bold" style={{ color: level.color }}>
                    {level.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{level.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Level progression */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Níveis de Evolução</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {SCORE_LEVELS.map((lvl) => {
                  const isActive = score >= lvl.min && score <= lvl.max
                  const isPast = score > lvl.max
                  return (
                    <div
                      key={lvl.label}
                      className={cn(
                        'flex items-center gap-3 p-2.5 rounded-lg transition-all',
                        isActive ? 'bg-violet-500/10 border border-violet-500/20' : 'border border-transparent',
                        isPast ? 'opacity-60' : ''
                      )}
                    >
                      <span className="text-xl w-8 text-center">{lvl.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn('text-sm font-semibold', isActive ? 'text-foreground' : 'text-muted-foreground')}
                          >
                            {lvl.label}
                          </span>
                          {isActive && (
                            <span className="text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full">
                              Atual
                            </span>
                          )}
                          {isPast && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{lvl.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                        {lvl.min}–{lvl.max}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pontuação por Critério</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {breakdownItems.map((item) => (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">{item.label}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {item.value}/{item.max}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-700"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{item.pct}% do máximo</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Radar Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgb(55 65 81)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: 'rgb(156 163 175)', fontSize: 11 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.25}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgb(31 41 55)',
                        border: '1px solid rgb(55 65 81)',
                        borderRadius: '8px',
                        fontSize: 12,
                      }}
                      formatter={(v) => [`${v}%`, 'Pontuação']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Como melhorar seu score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { emoji: '📊', tip: 'Registre todas as transações para aumentar Consistência' },
                  { emoji: '🏷️', tip: 'Adicione descrições detalhadas para melhorar Organização' },
                  { emoji: '💰', tip: 'Mantenha despesas abaixo de 80% da renda para melhorar Controle' },
                  { emoji: '🗂️', tip: 'Use categorias variadas para aumentar Diversidade' },
                  { emoji: '📈', tip: 'Poupe 20%+ da renda mensal para maximizar Saldo' },
                  { emoji: '⚡', tip: 'Score 600+ coloca você no top 30% dos usuários' },
                ].map(({ emoji, tip }) => (
                  <div key={tip} className="flex items-start gap-2 p-2.5 bg-muted/50 rounded-lg">
                    <span className="text-base">{emoji}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
