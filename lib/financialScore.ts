import type { Transaction, ScoreBreakdown, ScoreLevel, Achievement } from '@/types'
import { SCORE_LEVELS, ACHIEVEMENTS } from '@/lib/constants'

export function calculateScoreBreakdown(transactions: Transaction[]): ScoreBreakdown {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  // Controle (0-300): How well expenses are controlled vs income
  let controle = 0
  if (income > 0) {
    const ratio = expenses / income
    if (ratio <= 0.5) controle = 300
    else if (ratio <= 0.7) controle = 240
    else if (ratio <= 0.85) controle = 160
    else if (ratio <= 1.0) controle = 80
    else controle = Math.max(0, 80 - Math.round((ratio - 1) * 200))
  }

  // Consistência (0-200): Transaction volume = financial awareness
  const count = transactions.length
  let consistencia = 0
  if (count >= 30) consistencia = 200
  else if (count >= 20) consistencia = 160
  else if (count >= 10) consistencia = 120
  else if (count >= 5) consistencia = 80
  else if (count >= 1) consistencia = 40

  // Diversidade (0-200): Category diversity
  const categories = new Set(transactions.map((t) => t.category))
  let diversidade = 0
  if (categories.size >= 7) diversidade = 200
  else if (categories.size >= 5) diversidade = 160
  else if (categories.size >= 3) diversidade = 120
  else if (categories.size >= 2) diversidade = 80
  else if (categories.size >= 1) diversidade = 40

  // Organização (0-150): % of transactions with descriptions
  const withDesc = transactions.filter((t) => t.description && t.description.trim().length > 0).length
  const descRate = count > 0 ? withDesc / count : 0
  let organizacao = 0
  if (descRate >= 0.8) organizacao = 150
  else if (descRate >= 0.5) organizacao = 110
  else if (descRate >= 0.2) organizacao = 70
  else if (count > 0) organizacao = 30

  // Saldo (0-150): Positive balance quality
  let saldo = 0
  if (income > 0) {
    const savingsRate = (income - expenses) / income
    if (savingsRate >= 0.3) saldo = 150
    else if (savingsRate >= 0.2) saldo = 120
    else if (savingsRate >= 0.1) saldo = 90
    else if (savingsRate >= 0) saldo = 50
    else saldo = 0
  }

  return { controle, consistencia, diversidade, organizacao, saldo }
}

export function calculateTotalScore(breakdown: ScoreBreakdown): number {
  return Math.min(
    1000,
    breakdown.controle +
      breakdown.consistencia +
      breakdown.diversidade +
      breakdown.organizacao +
      breakdown.saldo
  )
}

export function getScoreLevel(score: number): ScoreLevel {
  return (
    SCORE_LEVELS.find((l) => score >= l.min && score <= l.max) ??
    SCORE_LEVELS[SCORE_LEVELS.length - 1]
  )
}

export function computeAchievements(transactions: Transaction[], score: number): Achievement[] {
  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const categories = new Set(transactions.map((t) => t.category))
  const months = new Set(transactions.map((t) => t.date.slice(0, 7)))
  const savingsRate = income > 0 ? (income - expenses) / income : 0

  return ACHIEVEMENTS.map((a) => {
    let unlocked = false

    switch (a.id) {
      case 'first_transaction':
        unlocked = transactions.length >= 1
        break
      case 'ten_transactions':
        unlocked = transactions.length >= 10
        break
      case 'fifty_transactions':
        unlocked = transactions.length >= 50
        break
      case 'positive_balance':
        unlocked = income > 0 && income > expenses
        break
      case 'savings_20':
        unlocked = savingsRate >= 0.2
        break
      case 'five_categories':
        unlocked = categories.size >= 5
        break
      case 'score_500':
        unlocked = score >= 500
        break
      case 'score_800':
        unlocked = score >= 800
        break
      case 'no_overspend':
        unlocked = income > 0 && expenses <= income
        break
      case 'income_recorded':
        unlocked = income > 0
        break
      case 'three_months':
        unlocked = months.size >= 3
        break
      case 'wealth_builder':
        unlocked = income > 0 && savingsRate >= 0.1
        break
      default:
        unlocked = false
    }

    return { ...a, unlocked }
  })
}

export function generateSmartAlerts(
  transactions: Transaction[],
  score: number
): { type: 'warning' | 'info' | 'success'; message: string; detail?: string }[] {
  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const alerts: { type: 'warning' | 'info' | 'success'; message: string; detail?: string }[] = []

  if (transactions.length === 0) {
    alerts.push({
      type: 'info',
      message: 'Comece registrando suas transações',
      detail: 'Adicione receitas e despesas para receber insights personalizados.',
    })
    return alerts
  }

  const savingsRate = income > 0 ? (income - expenses) / income : 0

  if (income > 0 && savingsRate < 0) {
    alerts.push({
      type: 'warning',
      message: 'Suas despesas superam a renda este mês',
      detail: `Você gastou R$${(expenses - income).toFixed(2).replace('.', ',')} a mais do que recebeu.`,
    })
  } else if (income > 0 && savingsRate >= 0.2) {
    alerts.push({
      type: 'success',
      message: `Ótimo! Você está poupando ${Math.round(savingsRate * 100)}% da renda`,
      detail: 'Continue assim — você está acima da meta recomendada de 20%.',
    })
  } else if (income > 0 && savingsRate < 0.1) {
    alerts.push({
      type: 'warning',
      message: `Taxa de poupança de ${Math.round(savingsRate * 100)}% — abaixo do ideal`,
      detail: 'Recomendamos poupar pelo menos 20% da renda mensal.',
    })
  }

  // Category insights
  const expenseByCategory: Record<string, number> = {}
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount
    })

  const topCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0]
  if (topCategory && income > 0) {
    const pct = Math.round((topCategory[1] / income) * 100)
    if (pct > 40) {
      alerts.push({
        type: 'warning',
        message: `${pct}% da renda vai para ${topCategory[0]}`,
        detail: 'Considere revisar essa categoria para equilibrar seu orçamento.',
      })
    }
  }

  // Subscription detection
  const subscriptions = transactions.filter(
    (t) => t.type === 'expense' && t.category === 'Assinaturas'
  )
  if (subscriptions.length > 0) {
    const totalSubs = subscriptions.reduce((s, t) => s + t.amount, 0)
    alerts.push({
      type: 'info',
      message: `R$${totalSubs.toFixed(2).replace('.', ',')} em assinaturas este mês`,
      detail: 'Revise suas assinaturas regularmente para eliminar as que não usa.',
    })
  }

  // Score improvement tip
  if (score < 400) {
    alerts.push({
      type: 'info',
      message: 'Dica: descreva suas transações para melhorar o score',
      detail: 'Adicionar descrições aumenta sua pontuação de Organização.',
    })
  }

  return alerts.slice(0, 3)
}
