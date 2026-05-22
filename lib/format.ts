import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatMonthYear(month: string, year: string): string {
  const date = new Date(Number(year), Number(month) - 1, 1)
  return format(date, "MMMM 'de' yyyy", { locale: ptBR })
}

export function getCurrentMonth(): string {
  return String(new Date().getMonth() + 1).padStart(2, '0')
}

export function getCurrentYear(): string {
  return String(new Date().getFullYear())
}

export function getAvailableYears(): string[] {
  const current = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => String(current - 2 + i))
}
