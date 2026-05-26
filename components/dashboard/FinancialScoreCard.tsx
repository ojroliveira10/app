'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  calculateScoreBreakdown,
  calculateTotalScore,
  getScoreLevel,
} from '@/lib/financialScore'
import type { Transaction } from '@/types'
import { cn } from '@/lib/utils'

interface FinancialScoreCardProps {
  transactions: Transaction[]
}

function ScoreGauge({ score }: { score: number }) {
  const pct = score / 1000
  const r = 72
  const cx = 100
  const cy = 92
  const startAngle = 200
  const endAngle = -20
  const totalDeg = startAngle - endAngle

  function toRad(deg: number) {
    return (deg * Math.PI) / 180
  }

  function point(deg: number) {
    return {
      x: cx + r * Math.cos(toRad(deg)),
      y: cy - r * Math.sin(toRad(deg)),
    }
  }

  function arcPath(from: number, to: number) {
    const s = point(from)
    const e = point(to)
    const large = Math.abs(from - to) > 180 ? 1 : 0
    const sweep = from > to ? 0 : 1
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} ${sweep} ${e.x} ${e.y}`
  }

  const scoreEndAngle = startAngle - pct * totalDeg

  return (
    <svg viewBox="0 0 200 110" className="w-44 h-24">
      {/* Background track */}
      <path
        d={arcPath(startAngle, endAngle)}
        fill="none"
        stroke="rgb(55 65 81)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Score fill */}
      {score > 0 && (
        <path
          d={arcPath(startAngle, scoreEndAngle)}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="10"
          strokeLinecap="round"
        />
      )}
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function FinancialScoreCard({ transactions }: FinancialScoreCardProps) {
  const breakdown = useMemo(() => calculateScoreBreakdown(transactions), [transactions])
  const score = useMemo(() => calculateTotalScore(breakdown), [breakdown])
  const level = useMemo(() => getScoreLevel(score), [score])

  const progressPct = ((score - level.min) / (level.max - level.min)) * 100

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-600/5 pointer-events-none" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Score Financeiro</CardTitle>
          <Link
            href="/dashboard/score"
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Ver detalhes <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="relative flex flex-col items-center">
            <ScoreGauge score={score} />
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
              <span className="text-3xl font-black text-foreground tabular-nums">{score}</span>
              <span className="text-[10px] text-muted-foreground">de 1000</span>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{level.emoji}</span>
                <span className="font-semibold text-sm" style={{ color: level.color }}>
                  {level.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{level.description}</p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{level.label}</span>
                <span>{Math.round(progressPct)}% para próximo nível</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, progressPct)}%` }}
                />
              </div>
            </div>

            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              score > 0 ? 'text-emerald-400' : 'text-muted-foreground'
            )}>
              <TrendingUp className="w-3 h-3" />
              <span>{transactions.length} transações registradas</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
