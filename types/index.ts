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

export type GoalType =
  | 'viagem'
  | 'casa'
  | 'carro'
  | 'emergencia'
  | 'aposentadoria'
  | 'dividas'
  | 'outro'

export interface Goal {
  id: string
  name: string
  type: GoalType
  targetAmount: number
  currentAmount: number
  deadline?: string
  monthlyTarget: number
  color: string
  emoji: string
}

export type AchievementCategory =
  | 'savings'
  | 'investment'
  | 'consistency'
  | 'goals'
  | 'control'

export interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  unlocked: boolean
  unlockedAt?: string
  category: AchievementCategory
  xp: number
  requirement: string
}

export interface ScoreBreakdown {
  controle: number
  consistencia: number
  diversidade: number
  organizacao: number
  saldo: number
}

export interface IncomeDistributionItem {
  label: string
  key: string
  recommended: number
  actual: number
  amount: number
  color: string
  categories: string[]
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export type ScoreLevel = {
  label: string
  min: number
  max: number
  color: string
  emoji: string
  description: string
}
