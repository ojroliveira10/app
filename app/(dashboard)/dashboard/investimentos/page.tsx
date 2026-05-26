'use client'

import { useState } from 'react'
import {
  TrendingUp,
  Shield,
  BookOpen,
  DollarSign,
  BarChart3,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type RiskProfile = 'conservador' | 'moderado' | 'arrojado'

interface Investment {
  name: string
  type: string
  risk: RiskProfile
  returnPct: number
  period: string
  description: string
  minValue: number
  color: string
  emoji: string
  highlight?: string
}

const INVESTMENTS: Investment[] = [
  {
    name: 'Tesouro Selic',
    type: 'Renda Fixa',
    risk: 'conservador',
    returnPct: 10.65,
    period: 'ao ano',
    description: 'Títulos públicos federais com liquidez diária. Ideal para reserva de emergência.',
    minValue: 100,
    color: '#22c55e',
    emoji: '🏛️',
    highlight: 'Melhor para reserva',
  },
  {
    name: 'CDB 110% CDI',
    type: 'Renda Fixa',
    risk: 'conservador',
    returnPct: 11.7,
    period: 'ao ano',
    description: 'Certificado de Depósito Bancário com rentabilidade acima do CDI. Garantido pelo FGC.',
    minValue: 500,
    color: '#22c55e',
    emoji: '🏦',
  },
  {
    name: 'BOVA11',
    type: 'ETF — Bolsa',
    risk: 'arrojado',
    returnPct: 12.4,
    period: 'ao ano (histórico)',
    description: 'ETF que replica o Ibovespa. Diversificação com as maiores empresas do Brasil.',
    minValue: 130,
    color: '#f59e0b',
    emoji: '📈',
    highlight: 'Popular entre iniciantes',
  },
  {
    name: 'Tesouro IPCA+',
    type: 'Renda Fixa',
    risk: 'conservador',
    returnPct: 6.5,
    period: '+ IPCA ao ano',
    description: 'Proteção contra inflação. Indicado para objetivos de longo prazo como aposentadoria.',
    minValue: 100,
    color: '#06b6d4',
    emoji: '🛡️',
  },
  {
    name: 'Fundos de Ações',
    type: 'Fundo — Renda Variável',
    risk: 'arrojado',
    returnPct: 15.2,
    period: 'ao ano (histórico)',
    description: 'Gestão profissional de carteira de ações brasileiras e internacionais.',
    minValue: 1000,
    color: '#8b5cf6',
    emoji: '🏆',
  },
  {
    name: 'LCI/LCA',
    type: 'Renda Fixa — Isento IR',
    risk: 'conservador',
    returnPct: 9.8,
    period: 'ao ano',
    description: 'Letras de Crédito Imobiliário e do Agronegócio. Isentas de imposto de renda.',
    minValue: 5000,
    color: '#22c55e',
    emoji: '🏠',
  },
]

const RISK_COLORS: Record<RiskProfile, { bg: string; text: string; border: string }> = {
  conservador: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  moderado: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  arrojado: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
  },
}

const RISK_LABELS: Record<RiskProfile, string> = {
  conservador: 'Conservador',
  moderado: 'Moderado',
  arrojado: 'Arrojado',
}

function SimulationCard() {
  const [capital, setCapital] = useState(1000)
  const [months, setMonths] = useState(12)
  const rate = 0.1065

  const monthRate = Math.pow(1 + rate, 1 / 12) - 1
  const result = capital * Math.pow(1 + monthRate, months)
  const gain = result - capital

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-400" />
          Simulador de Rentabilidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Capital inicial</label>
            <div className="flex gap-1">
              {[500, 1000, 5000, 10000].map((v) => (
                <button
                  key={v}
                  onClick={() => setCapital(v)}
                  className={cn(
                    'flex-1 py-1.5 rounded text-[11px] font-medium transition-colors',
                    capital === v
                      ? 'bg-violet-600 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {v >= 1000 ? `${v / 1000}k` : v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Período</label>
            <div className="flex gap-1">
              {[6, 12, 24, 60].map((v) => (
                <button
                  key={v}
                  onClick={() => setMonths(v)}
                  className={cn(
                    'flex-1 py-1.5 rounded text-[11px] font-medium transition-colors',
                    months === v
                      ? 'bg-violet-600 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {v >= 12 ? `${v / 12}a` : `${v}m`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Rendimento estimado</p>
              <p className="text-xs text-muted-foreground">(Tesouro Selic ~10,65% a.a.)</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-emerald-400 tabular-nums">
                +{formatCurrency(gain)}
              </p>
              <p className="text-xs text-muted-foreground">
                Total: {formatCurrency(result)}
              </p>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              style={{ width: `${Math.min(100, (gain / result) * 100 * 5)}%` }}
            />
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground">
          * Simulação baseada em taxas históricas. Rentabilidade passada não garante rentabilidade futura.
        </p>
      </CardContent>
    </Card>
  )
}

export default function InvestimentosPage() {
  const [filter, setFilter] = useState<'todos' | RiskProfile>('todos')

  const filtered = INVESTMENTS.filter(
    (inv) => filter === 'todos' || inv.risk === filter
  )

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Investimentos</h1>
        <p className="text-sm text-muted-foreground">
          Estratégias para construir patrimônio sólido
        </p>
      </div>

      {/* Philosophy cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Shield, label: 'Reserva primeiro', desc: '3–6 meses de gastos', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: TrendingUp, label: 'Diversifique', desc: 'Múltiplos ativos', color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { icon: Clock, label: 'Longo prazo', desc: 'Consistência vence', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(({ icon: Icon, label, desc, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-3 flex flex-col items-center text-center gap-2">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', bg)}>
                <Icon className={cn('w-4 h-4', color)} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground">{desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SimulationCard />

      {/* Investment catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Opções de Investimento</h2>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="w-full">
            <TabsTrigger value="todos" className="flex-1 text-xs">Todos</TabsTrigger>
            <TabsTrigger value="conservador" className="flex-1 text-xs">Conservador</TabsTrigger>
            <TabsTrigger value="moderado" className="flex-1 text-xs">Moderado</TabsTrigger>
            <TabsTrigger value="arrojado" className="flex-1 text-xs">Arrojado</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          {filtered.map((inv) => {
            const riskCfg = RISK_COLORS[inv.risk]
            return (
              <Card key={inv.name} className="relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ backgroundColor: inv.color }}
                />
                <CardContent className="pl-5 pr-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-2xl shrink-0">{inv.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-foreground">{inv.name}</p>
                          {inv.highlight && (
                            <span className="text-[10px] bg-violet-500/10 text-violet-400 px-1.5 py-0.5 rounded-full border border-violet-500/20">
                              {inv.highlight}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{inv.type}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {inv.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="text-base font-black" style={{ color: inv.color }}>
                        {inv.returnPct}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">{inv.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full border font-medium',
                          riskCfg.bg,
                          riskCfg.text,
                          riskCfg.border
                        )}
                      >
                        {RISK_LABELS[inv.risk]}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        A partir de {formatCurrency(inv.minValue)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            Conceitos Fundamentais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              term: 'CDI',
              def: 'Certificado de Depósito Interbancário. Referência de rentabilidade para renda fixa no Brasil (~10,65% a.a.).',
            },
            {
              term: 'FGC',
              def: 'Fundo Garantidor de Créditos. Garante até R$250 mil por CPF por instituição em caso de falência.',
            },
            {
              term: 'Liquidez',
              def: 'Facilidade de resgatar o dinheiro. Tesouro Selic tem liquidez diária; CDBs podem ter carência.',
            },
            {
              term: 'Diversificação',
              def: 'Distribuir investimentos em diferentes ativos para reduzir risco sem perder rentabilidade.',
            },
          ].map(({ term, def }) => (
            <div key={term} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
              <span className="shrink-0 font-bold text-sm text-violet-400 min-w-[60px]">
                {term}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">{def}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
