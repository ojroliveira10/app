'use client'

import { useReducer, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Transaction, TransactionFilters, MonthlySummary, CategorySummary } from '@/types'
import { CATEGORY_COLORS } from '@/lib/constants'
import { getCurrentMonth, getCurrentYear } from '@/lib/format'

const DEFAULT_FILTERS: TransactionFilters = {
  type: 'all',
  category: 'all',
  month: getCurrentMonth(),
  year: getCurrentYear(),
}

type State = {
  transactions: Transaction[]
  loading: boolean
  filters: TransactionFilters
}

type Action =
  | { type: 'SET_FILTERS'; filters: Partial<TransactionFilters> }
  | { type: 'FETCH_DONE'; transactions: Transaction[] }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.filters }, loading: true }
    case 'FETCH_DONE':
      return { ...state, transactions: action.transactions, loading: false }
  }
}

export function useTransactions() {
  const [state, dispatch] = useReducer(reducer, {
    transactions: [],
    loading: true,
    filters: DEFAULT_FILTERS,
  })

  const { transactions, loading, filters } = state
  const supabase = createClient()

  const fetchTransactions = useCallback(async () => {
    const startDate = `${filters.year}-${filters.month}-01`
    const endDate = new Date(Number(filters.year), Number(filters.month), 0)
      .toISOString()
      .split('T')[0]

    let query = supabase
      .from('transactions')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (filters.type !== 'all') query = query.eq('type', filters.type)
    if (filters.category !== 'all') query = query.eq('category', filters.category)

    const { data, error } = await query
    dispatch({ type: 'FETCH_DONE', transactions: !error && data ? (data as Transaction[]) : [] })
  }, [filters, supabase])

  useEffect(() => {
    void fetchTransactions()
  }, [fetchTransactions])

  const setFilters = (updater: Partial<TransactionFilters> | ((prev: TransactionFilters) => Partial<TransactionFilters>)) => {
    const next = typeof updater === 'function' ? updater(filters) : updater
    dispatch({ type: 'SET_FILTERS', filters: next })
  }

  const addTransaction = async (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: new Error('Não autenticado') }
    const { error } = await supabase.from('transactions').insert({ ...data, user_id: user.id })
    if (!error) void fetchTransactions()
    return { error }
  }

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    const { error } = await supabase
      .from('transactions')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) void fetchTransactions()
    return { error }
  }

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) void fetchTransactions()
    return { error }
  }

  const summary: MonthlySummary = transactions.reduce(
    (acc, t) => {
      if (t.type === 'income') acc.totalIncome += t.amount
      else acc.totalExpenses += t.amount
      acc.balance = acc.totalIncome - acc.totalExpenses
      return acc
    },
    { totalIncome: 0, totalExpenses: 0, balance: 0 }
  )

  const expensesByCategory: CategorySummary[] = (() => {
    const expenses = transactions.filter((t) => t.type === 'expense')
    const total = expenses.reduce((s, t) => s + t.amount, 0)
    const grouped: Record<string, number> = {}
    expenses.forEach((t) => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount
    })
    return Object.entries(grouped)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: CATEGORY_COLORS[category] || '#94a3b8',
      }))
      .sort((a, b) => b.amount - a.amount)
  })()

  return {
    transactions,
    loading,
    filters,
    setFilters,
    summary,
    expensesByCategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refresh: fetchTransactions,
  }
}
