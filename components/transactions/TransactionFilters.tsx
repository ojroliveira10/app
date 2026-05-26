'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MONTHS, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/constants'
import { getAvailableYears } from '@/lib/format'
import type { TransactionFilters } from '@/types'

interface TransactionFiltersProps {
  filters: TransactionFilters
  onChange: (filters: Partial<TransactionFilters>) => void
}

const TYPE_LABELS: Record<string, string> = {
  all: 'Todos',
  income: 'Receitas',
  expense: 'Despesas',
}

export function TransactionFiltersBar({ filters, onChange }: TransactionFiltersProps) {
  const years = getAvailableYears()
  const allCategories = [...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])]
  const monthLabel = MONTHS.find((m) => m.value === filters.month)?.label ?? 'Mês'
  const categoryLabel = filters.category === 'all' ? 'Todas' : (filters.category || 'Categoria')

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={filters.month} onValueChange={(month) => { if (month) onChange({ month }) }}>
        <SelectTrigger className="w-32">
          <SelectValue>{monthLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.year} onValueChange={(year) => { if (year) onChange({ year }) }}>
        <SelectTrigger className="w-24">
          <SelectValue>{filters.year}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.type} onValueChange={(type) => { if (type) onChange({ type: type as TransactionFilters['type'] }) }}>
        <SelectTrigger className="w-32">
          <SelectValue>{TYPE_LABELS[filters.type] ?? 'Tipo'}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="income">Receitas</SelectItem>
          <SelectItem value="expense">Despesas</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.category} onValueChange={(category) => { if (category) onChange({ category }) }}>
        <SelectTrigger className="w-40">
          <SelectValue>{categoryLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {allCategories.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
