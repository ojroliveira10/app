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

export function TransactionFiltersBar({ filters, onChange }: TransactionFiltersProps) {
  const years = getAvailableYears()
  const allCategories = ['all', ...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={filters.month} onValueChange={(month) => { if (month) onChange({ month }) }}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.year} onValueChange={(year) => { if (year) onChange({ year }) }}>
        <SelectTrigger className="w-24">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.type} onValueChange={(type) => { if (type) onChange({ type: type as TransactionFilters['type'] }) }}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="income">Receitas</SelectItem>
          <SelectItem value="expense">Despesas</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.category} onValueChange={(category) => { if (category) onChange({ category }) }}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {allCategories.filter(c => c !== 'all').map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
