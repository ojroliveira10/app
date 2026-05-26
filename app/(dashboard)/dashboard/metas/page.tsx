'use client'

import { useState } from 'react'
import { Plus, Trash2, Target, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/format'
import { GOAL_EMOJIS, GOAL_COLORS } from '@/lib/constants'
import type { Goal, GoalType } from '@/types'

export const dynamic = 'force-dynamic'

const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  viagem: 'Viagem',
  casa: 'Casa própria',
  carro: 'Carro',
  emergencia: 'Reserva de emergência',
  aposentadoria: 'Aposentadoria',
  dividas: 'Quitar dívidas',
  outro: 'Outro',
}

const DEMO_GOALS: Goal[] = [
  {
    id: 'demo-1',
    name: 'Reserva de Emergência',
    type: 'emergencia',
    targetAmount: 15000,
    currentAmount: 8500,
    deadline: '2026-12-01',
    monthlyTarget: 800,
    color: GOAL_COLORS.emergencia,
    emoji: GOAL_EMOJIS.emergencia,
  },
  {
    id: 'demo-2',
    name: 'Viagem para Europa',
    type: 'viagem',
    targetAmount: 12000,
    currentAmount: 3200,
    deadline: '2027-06-01',
    monthlyTarget: 700,
    color: GOAL_COLORS.viagem,
    emoji: GOAL_EMOJIS.viagem,
  },
]

function GoalCard({ goal, onDelete }: { goal: Goal; onDelete: (id: string) => void }) {
  const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
  const remaining = goal.targetAmount - goal.currentAmount
  const monthsLeft = goal.monthlyTarget > 0 ? Math.ceil(remaining / goal.monthlyTarget) : null

  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: goal.color }}
      />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: `${goal.color}20` }}
            >
              {goal.emoji}
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{goal.name}</p>
              <p className="text-xs text-muted-foreground">{GOAL_TYPE_LABELS[goal.type]}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
            onClick={() => onDelete(goal.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-foreground tabular-nums">
              {formatCurrency(goal.currentAmount)}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {formatCurrency(goal.targetAmount)}
            </span>
          </div>

          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${goal.color}cc, ${goal.color})`,
              }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white"
            >
              {progress}%
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/60 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground">Faltam</p>
              <p className="text-xs font-semibold text-foreground truncate">
                {formatCurrency(remaining)}
              </p>
            </div>
            <div className="bg-muted/60 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground">Por mês</p>
              <p className="text-xs font-semibold text-foreground">
                {formatCurrency(goal.monthlyTarget)}
              </p>
            </div>
            <div className="bg-muted/60 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground">Estimativa</p>
              <p className="text-xs font-semibold text-foreground">
                {monthsLeft ? `${monthsLeft}m` : '—'}
              </p>
            </div>
          </div>

          {goal.deadline && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>
                Meta:{' '}
                {new Date(goal.deadline).toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AddGoalDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (goal: Goal) => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<GoalType>('outro')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('0')
  const [monthly, setMonthly] = useState('')
  const [deadline, setDeadline] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetAmt = parseFloat(target.replace(',', '.'))
    const currentAmt = parseFloat(current.replace(',', '.')) || 0
    const monthlyAmt = parseFloat(monthly.replace(',', '.')) || 0

    if (!name || isNaN(targetAmt) || targetAmt <= 0) return

    onAdd({
      id: `goal-${Date.now()}`,
      name,
      type,
      targetAmount: targetAmt,
      currentAmount: currentAmt,
      monthlyTarget: monthlyAmt,
      deadline: deadline || undefined,
      color: GOAL_COLORS[type],
      emoji: GOAL_EMOJIS[type],
    })

    setName('')
    setType('outro')
    setTarget('')
    setCurrent('0')
    setMonthly('')
    setDeadline('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Meta Financeira</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da meta</Label>
            <Input
              placeholder="Ex: Reserva de emergência"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as GoalType)}>
              <SelectTrigger>
                <SelectValue>{GOAL_EMOJIS[type]} {GOAL_TYPE_LABELS[type]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GOAL_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {GOAL_EMOJIS[k as GoalType]} {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Valor total (R$)</Label>
              <Input
                placeholder="15.000,00"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Já guardei (R$)</Label>
              <Input
                placeholder="0,00"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Aporte mensal (R$)</Label>
              <Input
                placeholder="800,00"
                value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data limite</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 text-white border-0"
            >
              Criar Meta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function loadGoalsFromStorage(): Goal[] {
  if (typeof window === 'undefined') return DEMO_GOALS
  const stored = localStorage.getItem('elevaai_goals')
  if (!stored) return DEMO_GOALS
  try {
    return JSON.parse(stored) as Goal[]
  } catch {
    return DEMO_GOALS
  }
}

export default function MetasPage() {
  const [goals, setGoals] = useState<Goal[]>(loadGoalsFromStorage)
  const [dialogOpen, setDialogOpen] = useState(false)

  const persistGoals = (updated: Goal[]) => {
    setGoals(updated)
    localStorage.setItem('elevaai_goals', JSON.stringify(updated))
  }

  const addGoal = (goal: Goal) => persistGoals([...goals, goal])
  const deleteGoal = (id: string) => persistGoals(goals.filter((g) => g.id !== id))

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0)
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Metas Financeiras</h1>
          <p className="text-sm text-muted-foreground">
            Visualize e acompanhe seus objetivos
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          size="sm"
          className="gap-2 bg-violet-600 hover:bg-violet-700 text-white border-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nova meta
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Metas ativas</p>
            <p className="text-2xl font-bold text-violet-400">{goals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total guardado</p>
            <p className="text-lg font-bold text-emerald-400 tabular-nums">
              {formatCurrency(totalSaved)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Progresso geral</p>
            <p className="text-2xl font-bold text-amber-400">{overallPct}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals grid */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <Target className="w-8 h-8 text-violet-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Nenhuma meta criada</p>
              <p className="text-sm text-muted-foreground mt-1">
                Defina objetivos financeiros e acompanhe seu progresso
              </p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onDelete={deleteGoal} />
          ))}
        </div>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            Estratégias para atingir suas metas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                emoji: '🎯',
                title: 'Regra 50/20/10/10/10',
                desc: 'Distribua automaticamente 10% da renda para cada meta prioritária',
              },
              {
                emoji: '⚡',
                title: 'Automatize aportes',
                desc: 'Configure transferências automáticas no dia do pagamento para não esquecer',
              },
              {
                emoji: '📊',
                title: 'Revise mensalmente',
                desc: 'Ajuste os aportes conforme sua renda e prioridades mudarem',
              },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-xl">{emoji}</span>
                <p className="text-xs font-semibold text-foreground">{title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AddGoalDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onAdd={addGoal} />
    </div>
  )
}
