'use client'

import { useMemo } from 'react'
import { Lock, Zap, Trophy, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTransactions } from '@/hooks/useTransactions'
import {
  calculateScoreBreakdown,
  calculateTotalScore,
  computeAchievements,
} from '@/lib/financialScore'
import type { Achievement, AchievementCategory } from '@/types'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  savings: '💰 Poupança',
  investment: '📈 Investimentos',
  consistency: '📊 Consistência',
  goals: '🎯 Metas',
  control: '🛡️ Controle',
}

const CATEGORY_COLORS: Record<AchievementCategory, { bg: string; text: string; border: string }> = {
  savings: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  investment: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  consistency: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  goals: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  control: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const cfg = CATEGORY_COLORS[achievement.category]
  return (
    <div
      className={cn(
        'relative rounded-xl p-4 border transition-all',
        achievement.unlocked
          ? 'bg-card border-border'
          : 'bg-muted/30 border-border/40 opacity-60'
      )}
    >
      {achievement.unlocked && (
        <div className="absolute -top-1 -right-1">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">✓</span>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center text-center gap-2">
        <div
          className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl relative',
            achievement.unlocked ? cfg.bg : 'bg-muted/50'
          )}
        >
          {achievement.unlocked ? (
            achievement.emoji
          ) : (
            <Lock className="w-5 h-5 text-muted-foreground/50" />
          )}
        </div>

        <div className="space-y-0.5">
          <p
            className={cn(
              'text-xs font-semibold',
              achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {achievement.title}
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {achievement.unlocked ? achievement.description : achievement.requirement}
          </p>
        </div>

        <div
          className={cn(
            'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
            achievement.unlocked ? cfg.bg + ' ' + cfg.text + ' ' + cfg.border : 'bg-muted/50 text-muted-foreground border-transparent'
          )}
        >
          <Zap className="w-2.5 h-2.5" />
          {achievement.xp} XP
        </div>
      </div>
    </div>
  )
}

const CHALLENGES = [
  {
    id: 1,
    title: '7 dias sem compras por impulso',
    emoji: '🧠',
    xp: 200,
    days: 7,
    active: true,
  },
  {
    id: 2,
    title: 'Registre 10 transações esta semana',
    emoji: '📊',
    xp: 150,
    days: 7,
    active: true,
  },
  {
    id: 3,
    title: 'Feche o mês com saldo positivo',
    emoji: '💰',
    xp: 300,
    days: 30,
    active: false,
  },
  {
    id: 4,
    title: 'Reduza gastos com lazer em 20%',
    emoji: '📉',
    xp: 250,
    days: 30,
    active: false,
  },
]

export default function ConquistasPage() {
  const { transactions } = useTransactions()

  const breakdown = useMemo(() => calculateScoreBreakdown(transactions), [transactions])
  const score = useMemo(() => calculateTotalScore(breakdown), [breakdown])
  const achievements = useMemo(
    () => computeAchievements(transactions, score),
    [transactions, score]
  )

  const unlocked = achievements.filter((a) => a.unlocked)
  const totalXP = unlocked.reduce((s, a) => s + a.xp, 0)
  const maxXP = achievements.reduce((s, a) => s + a.xp, 0)
  const xpPct = maxXP > 0 ? Math.round((totalXP / maxXP) * 100) : 0

  const byCategory = achievements.reduce(
    (acc, a) => {
      if (!acc[a.category]) acc[a.category] = []
      acc[a.category].push(a)
      return acc
    },
    {} as Record<AchievementCategory, Achievement[]>
  )

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conquistas</h1>
        <p className="text-sm text-muted-foreground">
          Desbloqueie badges e acompanhe seu progresso
        </p>
      </div>

      {/* XP Summary */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-amber-500/5 pointer-events-none" />
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black text-amber-400 tabular-nums">{totalXP}</p>
                  <p className="text-xs text-muted-foreground">XP de {maxXP} total</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {unlocked.length}/{achievements.length} conquistas
                  </p>
                  <p className="text-xs text-muted-foreground">{xpPct}% completo</p>
                </div>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-700"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Sequência de Atividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="text-4xl font-black text-orange-400 tabular-nums">
              {transactions.length > 0 ? Math.min(transactions.length, 30) : 0}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {transactions.length > 0 ? 'transações registradas' : 'dias sem atividade'}
              </p>
              <p className="text-xs text-muted-foreground">
                {transactions.length >= 30
                  ? 'Você está incrível! Continue assim! 🔥'
                  : transactions.length > 0
                  ? 'Bom começo! Registre mais transações para aumentar'
                  : 'Comece registrando sua primeira transação'}
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 h-6 rounded transition-all',
                  i < Math.min(7, Math.ceil(transactions.length / 4))
                    ? 'bg-gradient-to-t from-orange-500 to-amber-400'
                    : 'bg-muted'
                )}
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-center">Últimos 7 dias</p>
        </CardContent>
      </Card>

      {/* Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Desafios da Semana</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {CHALLENGES.map((c) => (
            <div
              key={c.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                c.active
                  ? 'bg-violet-500/5 border-violet-500/20'
                  : 'bg-muted/30 border-border/50 opacity-60'
              )}
            >
              <span className="text-xl">{c.emoji}</span>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-xs font-medium',
                    c.active ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {c.title}
                </p>
                <p className="text-[10px] text-muted-foreground">{c.days} dias</p>
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full',
                  c.active
                    ? 'bg-violet-500/10 text-violet-400'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Zap className="w-2.5 h-2.5" />
                {c.xp} XP
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements by category */}
      {(Object.entries(byCategory) as [AchievementCategory, Achievement[]][]).map(
        ([category, items]) => (
          <div key={category} className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((a) => (
                <AchievementCard key={a.id} achievement={a} />
              ))}
            </div>
          </div>
        )
      )}

      {/* Motivation */}
      {unlocked.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center space-y-3">
            <div className="text-4xl">🌱</div>
            <p className="font-semibold text-foreground">
              Comece sua jornada hoje!
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Registre sua primeira transação para desbloquear conquistas e ganhar XP.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
