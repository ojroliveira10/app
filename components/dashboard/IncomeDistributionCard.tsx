'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { INCOME_DISTRIBUTION_CONFIG } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'
import type { Transaction } from '@/types'
import { cn } from '@/lib/utils'

interface IncomeDistributionCardProps {
  transactions: Transaction[]
  loading: boolean
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { amount: number; recommended: number } }>
}) => {
  if (active && payload && payload.length) {
    const item = payload[0]
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs space-y-1">
        <p className="font-semibold text-foreground">{item.name}</p>
        <p className="text-muted-foreground">
          Atual: {item.value.toFixed(0)}% ({formatCurrency(item.payload.amount)})
        </p>
        <p className="text-muted-foreground">Meta: {item.payload.recommended}%</p>
      </div>
    )
  }
  return null
}

export function IncomeDistributionCard({ transactions, loading }: IncomeDistributionCardProps) {
  const data = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)

    const expenseByCategory: Record<string, number> = {}
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount
      })

    return INCOME_DISTRIBUTION_CONFIG.map((cfg) => {
      const amount = cfg.categories.reduce(
        (s, cat) => s + (expenseByCategory[cat] || 0),
        0
      )
      const actual = income > 0 ? Math.round((amount / income) * 100) : 0

      return {
        name: cfg.label,
        key: cfg.key,
        recommended: cfg.recommended,
        actual,
        amount,
        color: cfg.color,
        value: actual > 0 ? actual : cfg.recommended,
      }
    })
  }, [transactions])

  const hasData = transactions.length > 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Distribuição da Renda
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">Método 50/20/10/10/10</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-muted animate-pulse" />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    strokeWidth={0}
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={hasData ? 1 : 0.4} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-2">
              {data.map((item) => {
                const over = hasData && item.actual > item.recommended
                const under = hasData && item.actual < item.recommended && item.actual > 0
                return (
                  <div key={item.key} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-foreground font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            'font-semibold tabular-nums',
                            over ? 'text-red-400' : under ? 'text-amber-400' : 'text-muted-foreground'
                          )}
                        >
                          {hasData ? `${item.actual}%` : `—`}
                        </span>
                        <span className="text-muted-foreground">/{item.recommended}%</span>
                      </div>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (hasData ? item.actual : item.recommended) / 100 * 100)}%`,
                          backgroundColor: item.color,
                          opacity: hasData ? 1 : 0.3,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
