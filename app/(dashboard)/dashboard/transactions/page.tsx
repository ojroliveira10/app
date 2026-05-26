'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionFiltersBar } from '@/components/transactions/TransactionFilters'
import { useTransactions } from '@/hooks/useTransactions'
import { formatMonthYear, formatCurrency } from '@/lib/format'
import type { Transaction } from '@/types'

export const dynamic = 'force-dynamic'

export default function TransactionsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const {
    transactions,
    loading,
    filters,
    setFilters,
    summary,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions()

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormOpen(true)
  }

  const handleClose = () => {
    setFormOpen(false)
    setEditingTransaction(null)
  }

  const handleSubmit = async (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (editingTransaction) {
      const result = await updateTransaction(editingTransaction.id, data)
      if (!result.error) toast.success('Transação atualizada!')
      else toast.error('Erro ao atualizar transação.')
      return result
    } else {
      const result = await addTransaction(data)
      if (!result.error) toast.success('Transação adicionada!')
      else toast.error('Erro ao adicionar transação.')
      return result
    }
  }

  const handleDelete = async (id: string) => {
    const result = await deleteTransaction(id)
    if (!result.error) toast.success('Transação excluída.')
    else toast.error('Erro ao excluir transação.')
    return result
  }

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transações</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {formatMonthYear(filters.month, filters.year)}
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} size="sm" className="gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Nova transação
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Receitas</p>
          <p className="text-sm font-semibold text-green-600">{formatCurrency(summary.totalIncome)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Despesas</p>
          <p className="text-sm font-semibold text-red-500">{formatCurrency(summary.totalExpenses)}</p>
        </div>
        <div className={`rounded-lg p-3 ${summary.balance >= 0 ? 'bg-blue-50 dark:bg-blue-950' : 'bg-red-50 dark:bg-red-950'}`}>
          <p className="text-xs text-muted-foreground mb-1">Saldo</p>
          <p className={`text-sm font-semibold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </div>

      <TransactionFiltersBar
        filters={filters}
        onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
      />

      <TransactionList
        transactions={transactions}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TransactionForm
        key={`${editingTransaction?.id ?? 'new'}-${formOpen}`}
        open={formOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        transaction={editingTransaction}
      />
    </div>
  )
}
