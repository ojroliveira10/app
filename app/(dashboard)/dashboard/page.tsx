'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { useTransactions } from '@/hooks/useTransactions'
import { formatMonthYear } from '@/lib/format'

export const dynamic = 'force-dynamic'

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

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
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
          <Button onClick={() => setFormOpen(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Nova transação
          </Button>
        </div>
      </div>

      <SummaryCards summary={summary} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart data={expensesByCategory} loading={loading} />
        <RecentTransactions transactions={transactions} loading={loading} />
      </div>

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={addTransaction}
      />
    </div>
  )
}
