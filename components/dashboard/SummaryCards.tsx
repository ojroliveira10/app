import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import type { MonthlySummary } from '@/types'
import { cn } from '@/lib/utils'

interface SummaryCardsProps {
  summary: MonthlySummary
  loading: boolean
}

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Receitas',
      value: summary.totalIncome,
      icon: TrendingUp,
      colorClass: 'text-green-600',
      bgClass: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Despesas',
      value: summary.totalExpenses,
      icon: TrendingDown,
      colorClass: 'text-red-500',
      bgClass: 'bg-red-50 dark:bg-red-950',
    },
    {
      title: 'Saldo',
      value: summary.balance,
      icon: Wallet,
      colorClass: summary.balance >= 0 ? 'text-blue-600' : 'text-red-500',
      bgClass: summary.balance >= 0
        ? 'bg-blue-50 dark:bg-blue-950'
        : 'bg-red-50 dark:bg-red-950',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ title, value, icon: Icon, colorClass, bgClass }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className={cn('p-2 rounded-lg', bgClass)}>
              <Icon className={cn('w-4 h-4', colorClass)} />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-7 w-32 bg-muted animate-pulse rounded" />
            ) : (
              <p className={cn('text-2xl font-bold', colorClass)}>
                {formatCurrency(value)}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
