'use client'

import { useState, useMemo } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { FinancialScoreCard } from '@/components/dashboard/FinancialScoreCard'
import { SmartAlerts } from '@/components/dashboard/SmartAlerts'
import { IncomeDistributionCard } from '@/components/dashboard/IncomeDistributionCard'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCurrency, formatMonthYear } from '@/lib/format'
import {
  calculateScoreBreakdown,
  calculateTotalScore,
} from '@/lib/financialScore'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const MetricCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
  bgClass,
  loading,
  trend,
  raw,
}: {
  title: string
  value: number
  icon: React.ElementType
  colorClass: string
  bgClass: string
  loading: boolean
  trend?: string
  raw?: boolean
}) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
      <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
      <div className={cn('p-1.5 rounded-lg', bgClass)}>
        <Icon className={cn('w-3.5 h-3.5', colorClass)} />
      </div>
    </CardHeader>
    <CardContent className="px-4 pb-4">
      {loading ? (
        <div className="h-6 w-28 bg-muted animate-pulse rounded" />
      ) : (
        <>
          <p className={cn('text-xl font-bold tabular-nums', colorClass)}>
            {raw ? value : formatCurrency(value)}
          </p>
          {trend && <p className="text-[10px] text-muted-foreground mt-0.5">{trend}</p>}
        </>
      )}
    </CardContent>
  </Card>
)

export default function DashboardPage() {
  const [formOpen, setFormOpen] = useState(false)
  const {
    transactions,
    loading,
    filters,
    setFilters,
    summary,
    expensesByCategory,
    addTransaction,
  } = useTransactions()

  const breakdown = useMemo(() => calculateScoreBreakdown(transactions), [transactions])
  const score = useMemo(() => calculateTotalScore(breakdown), [breakdown])

  const savingsRate =
    summary.totalIncome > 0
      ? Math.round(((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100)
      : 0

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {formatMonthYear(filters.month, filters.year)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <PeriodSelector
            filters={filters}
            onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
          />
          <Button
            onClick={() => setFormOpen(true)}
            size="sm"
            className="gap-2 bg-violet-600 hover:bg-violet-700 text-white border-0"
          >
            <Plus className="w-4 h-4" />
            Nova transação
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="Receitas"
          value={summary.totalIncome}
          icon={TrendingUp}
          colorClass="text-emerald-400"
          bgClass="bg-emerald-500/10"
          loading={loading}
          trend="este mês"
        />
        <MetricCard
          title="Despesas"
          value={summary.totalExpenses}
          icon={TrendingDown}
          colorClass="text-rose-400"
          bgClass="bg-rose-500/10"
          loading={loading}
          trend="este mês"
        />
        <MetricCard
          title="Saldo"
          value={summary.balance}
          icon={Wallet}
          colorClass={summary.balance >= 0 ? 'text-blue-400' : 'text-rose-400'}
          bgClass={summary.balance >= 0 ? 'bg-blue-500/10' : 'bg-rose-500/10'}
          loading={loading}
          trend={savingsRate > 0 ? `${savingsRate}% poupado` : undefined}
        />
        <MetricCard
          title="Transações"
          value={transactions.length}
          icon={BarChart3}
          colorClass="text-violet-400"
          bgClass="bg-violet-500/10"
          loading={loading}
          trend={`Score: ${score}`}
          raw
        />
      </div>

      {/* Score + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FinancialScoreCard transactions={transactions} />
        <IncomeDistributionCard transactions={transactions} loading={loading} />
      </div>

      {/* AI Insights */}
      <SmartAlerts transactions={transactions} score={score} loading={loading} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart data={expensesByCategory} loading={loading} />
        <RecentTransactions transactions={transactions} loading={loading} />
      </div>

      <TransactionForm
        key={`new-${formOpen}`}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={addTransaction}
      />
    </div>
  )
}
