export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  date: string
  category: string
  description?: string | null
  created_at: string
  updated_at: string
}

export interface TransactionFormData {
  type: TransactionType
  amount: string
  date: string
  category: string
  description: string
}

export interface TransactionFilters {
  type: TransactionType | 'all'
  category: string
  month: string
  year: string
}

export interface MonthlySummary {
  totalIncome: number
  totalExpenses: number
  balance: number
}

export interface CategorySummary {
  category: string
  amount: number
  percentage: number
  color: string
}
