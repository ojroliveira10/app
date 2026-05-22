export const INCOME_CATEGORIES = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Aluguel Recebido',
  'Presente',
  'Outros',
] as const

export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Moradia',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer',
  'Vestuário',
  'Serviços',
  'Assinaturas',
  'Outros',
] as const

export const CATEGORY_COLORS: Record<string, string> = {
  // Income
  Salário: '#22c55e',
  Freelance: '#16a34a',
  Investimentos: '#15803d',
  'Aluguel Recebido': '#166534',
  Presente: '#4ade80',
  // Expense
  Alimentação: '#ef4444',
  Moradia: '#f97316',
  Transporte: '#eab308',
  Saúde: '#ec4899',
  Educação: '#8b5cf6',
  Lazer: '#06b6d4',
  Vestuário: '#f43f5e',
  Serviços: '#64748b',
  Assinaturas: '#7c3aed',
  Outros: '#94a3b8',
}

export const MONTHS = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]
