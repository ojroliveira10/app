'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MONTHS } from '@/lib/constants'
import { getAvailableYears } from '@/lib/format'
import type { TransactionFilters } from '@/types'

interface PeriodSelectorProps {
  filters: TransactionFilters
  onChange: (filters: Partial<TransactionFilters>) => void
}

export function PeriodSelector({ filters, onChange }: PeriodSelectorProps) {
  const years = getAvailableYears()
  const monthLabel = MONTHS.find((m) => m.value === filters.month)?.label ?? 'Mês'

  return (
    <div className="flex items-center gap-2">
      <Select value={filters.month} onValueChange={(month) => { if (month) onChange({ month }) }}>
        <SelectTrigger className="w-36">
          <SelectValue>{monthLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.year} onValueChange={(year) => { if (year) onChange({ year }) }}>
        <SelectTrigger className="w-24">
          <SelectValue>{filters.year}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
