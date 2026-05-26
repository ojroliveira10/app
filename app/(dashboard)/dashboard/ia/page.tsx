'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Send, Bot, Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTransactions } from '@/hooks/useTransactions'
import {
  calculateScoreBreakdown,
  calculateTotalScore,
  getScoreLevel,
} from '@/lib/financialScore'
import { formatCurrency } from '@/lib/format'
import type { AIMessage, Transaction } from '@/types'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STARTERS = [
  'Como posso melhorar meu score?',
  'Onde devo investir meu dinheiro?',
  'Como criar uma reserva de emergência?',
  'Meu orçamento está equilibrado?',
  'Como sair das dívidas?',
  'Quanto devo poupar por mês?',
]

interface FinancialContext {
  income: number
  expenses: number
  balance: number
  score: number
  levelLabel: string
  savingsRate: number
  topCategory: string | null
  transactionCount: number
}

function buildContext(transactions: Transaction[]): FinancialContext {
  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = income - expenses
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0

  const catTotals: Record<string, number> = {}
  transactions.filter((t) => t.type === 'expense').forEach((t) => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount
  })
  const topCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const breakdown = calculateScoreBreakdown(transactions)
  const score = calculateTotalScore(breakdown)
  const level = getScoreLevel(score)

  return {
    income,
    expenses,
    balance,
    score,
    levelLabel: level.label,
    savingsRate: Math.round(savingsRate),
    topCategory,
    transactionCount: transactions.length,
  }
}

function generateResponse(message: string, ctx: FinancialContext): string {
  const lower = message.toLowerCase()

  const hasData = ctx.transactionCount > 0
  const incomeStr = formatCurrency(ctx.income)
  const expStr = formatCurrency(ctx.expenses)
  const balStr = formatCurrency(ctx.balance)

  if (!hasData) {
    return `Olá! 👋 Sou a **IA do ElevaAI**, sua consultora financeira pessoal.\n\nAinda não vejo transações registradas no seu perfil. Para que eu possa dar insights realmente personalizados, comece registrando suas receitas e despesas mensais.\n\nAssim que você adicionar dados, poderei:\n• Analisar seu padrão de gastos\n• Identificar oportunidades de economia\n• Criar estratégias personalizadas para seu perfil\n\nTem alguma dúvida sobre finanças que posso responder agora?`
  }

  // Score related
  if (lower.includes('score') || lower.includes('pontuação') || lower.includes('nota')) {
    const tips =
      ctx.score < 400
        ? '• Adicione descrições às suas transações\n• Use mais categorias para organizar melhor\n• Mantenha um saldo positivo consistente'
        : ctx.score < 700
        ? '• Aumente sua taxa de poupança para 20%+\n• Diversifique mais as categorias de gastos\n• Registre todas as transações'
        : '• Você já está indo muito bem!\n• Foque em manter a consistência\n• Considere começar a investir para maximizar patrimônio'

    return `Seu **Score Financeiro atual é ${ctx.score}/1000** — nível **${ctx.levelLabel}** ${ctx.score >= 600 ? '🚀' : '📈'}\n\nIsso significa que você está ${ctx.score >= 700 ? 'acima da média dos usuários' : ctx.score >= 400 ? 'em evolução constante' : 'começando sua jornada financeira'}.\n\n**Para melhorar seu score:**\n${tips}\n\nCada ponto que você ganha representa um hábito financeiro mais saudável. Continue assim! 💪`
  }

  // Investment related
  if (lower.includes('investir') || lower.includes('investimento') || lower.includes('aplicar')) {
    if (ctx.savingsRate < 10) {
      return `Ótima iniciativa querer investir! Mas antes de investir, precisamos resolver algo importante.\n\nVejo que sua taxa de poupança está em **${ctx.savingsRate}%** — abaixo do mínimo recomendado.\n\n**Minha sugestão:**\n1. 🎯 Primeiro: corte despesas em **${ctx.topCategory ?? 'lazer e assinaturas'}**\n2. 🛡️ Monte uma reserva de emergência (3–6 meses de gastos)\n3. 📈 Depois invista o excedente\n\nCom renda de ${incomeStr} e despesas de ${expStr}, você precisa equilibrar antes de investir. Quer ajuda para criar um orçamento mais eficiente?`
    }
    return `Com uma taxa de poupança de **${ctx.savingsRate}%** e saldo mensal de **${balStr}**, você já tem condições de investir! 🎉\n\n**Estratégia recomendada para o seu perfil:**\n\n🛡️ **1ª Prioridade — Reserva de Emergência:**\nMantenha 3–6 meses de despesas em Tesouro Selic (${formatCurrency(ctx.expenses * 3)} a ${formatCurrency(ctx.expenses * 6)})\n\n📊 **2ª Prioridade — Carteira Diversificada:**\n• 60% Renda Fixa (CDB, LCI, Tesouro)\n• 30% ETFs (BOVA11, IVVB11)\n• 10% Reserva para oportunidades\n\nVeja a aba **Investimentos** para opções detalhadas com simulações! 🚀`
  }

  // Savings related
  if (lower.includes('economizar') || lower.includes('economia') || lower.includes('poupar') || lower.includes('poupo')) {
    if (ctx.savingsRate >= 20) {
      return `Você já está poupando **${ctx.savingsRate}%** da renda — parabéns! Isso está acima da meta ideal de 20%. 🏆\n\nCom ${incomeStr} de receita e ${expStr} de despesas, você retém **${balStr}** por mês.\n\n**Para otimizar ainda mais:**\n• Direcione o excedente para investimentos de longo prazo\n• Considere aumentar aportes em ativos de maior rendimento\n• Revise trimestralmente se sua distribuição ainda faz sentido\n\nVocê está no caminho certo para construir patrimônio sólido! 💰`
    }
    const needed = ctx.income * 0.2
    const gap = needed - (ctx.income - ctx.expenses)
    return `Atualmente você poupa **${ctx.savingsRate}%** da renda (${balStr}/mês).\n\n**Meta ideal: 20%** — isso seria ${formatCurrency(needed)}/mês.\n\n${gap > 0 ? `Para chegar lá, você precisaria reduzir despesas em **${formatCurrency(gap)}** ou aumentar a renda.` : ''}\n\n**Onde cortar gastos:**\n${ctx.topCategory ? `• **${ctx.topCategory}** é sua maior despesa — revise se há excessos\n` : ''}• Assinaturas não utilizadas\n• Compras por impulso\n• Delivery e alimentação fora\n\nAtive os alertas na aba **Dashboard** para receber avisos em tempo real! ⚡`
  }

  // Emergency fund
  if (lower.includes('reserva') || lower.includes('emergência') || lower.includes('emergencia')) {
    const recommended3 = ctx.expenses * 3
    const recommended6 = ctx.expenses * 6
    return `A reserva de emergência é a **fundação de qualquer planejamento financeiro** — você fez a pergunta certa! 🛡️\n\n**Quanto você precisa:**\nCom despesas mensais de **${expStr}**:\n• Mínimo (3 meses): **${formatCurrency(recommended3)}**\n• Ideal (6 meses): **${formatCurrency(recommended6)}**\n\n**Onde guardar:**\n✅ Tesouro Selic — liquidez diária + ~10,65% a.a.\n✅ CDB com liquidez diária — rendimento similar\n❌ Poupança — rendimento inferior\n❌ Conta corrente — dinheiro parado não rende\n\n**Estratégia de construção:**\nSeparando **${formatCurrency(ctx.balance * 0.5)}/mês** (metade do seu saldo), você chega ao mínimo em ~${Math.ceil(recommended3 / (ctx.balance * 0.5))} meses.\n\nCrie uma meta na aba **Metas** para acompanhar o progresso! 🎯`
  }

  // Debt related
  if (lower.includes('dívida') || lower.includes('divida') || lower.includes('dever') || lower.includes('empréstimo')) {
    return `Sair das dívidas é a decisão financeira mais impactante que você pode tomar! 💪\n\n**Método Avalanche (mais eficiente):**\n1. Liste todas as dívidas com taxas de juros\n2. Pague o mínimo em todas\n3. Concentre o máximo na dívida com **maior juros**\n4. Ao quitar, transfira esse valor para a próxima\n\n**Método Bola de Neve (mais motivacional):**\nComece pela **menor dívida** independente dos juros — a sensação de vitória gera momentum.\n\n**Nunca use:**\n❌ Cartão de crédito rotativo (juros de 400%+/ano)\n❌ Cheque especial\n❌ Empréstimo para pagar dívida (exceto refinanciamento com taxas menores)\n\nCom saldo mensal de **${balStr}**, você tem capacidade de quitação. Vamos criar um plano detalhado?`
  }

  // Budget analysis
  if (lower.includes('orçamento') || lower.includes('orcamento') || lower.includes('equilibrado') || lower.includes('gastos')) {
    const ratio = ctx.income > 0 ? (ctx.expenses / ctx.income) * 100 : 0
    const status = ratio <= 70 ? '✅ Saudável' : ratio <= 90 ? '⚠️ Atenção' : '🚨 Crítico'
    return `Análise do seu orçamento atual:\n\n${status}\n• **Receitas:** ${incomeStr}\n• **Despesas:** ${expStr} (${Math.round(ratio)}% da renda)\n• **Saldo:** ${balStr}\n• **Taxa de poupança:** ${ctx.savingsRate}%\n\n**Método 50/20/10/10/10 (recomendado):**\n• 50% Necessidades: ${formatCurrency(ctx.income * 0.5)}\n• 20% Investimentos: ${formatCurrency(ctx.income * 0.2)}\n• 10% Reserva: ${formatCurrency(ctx.income * 0.1)}\n• 10% Lazer: ${formatCurrency(ctx.income * 0.1)}\n• 10% Metas: ${formatCurrency(ctx.income * 0.1)}\n\n${ctx.topCategory ? `⚠️ **${ctx.topCategory}** representa sua maior categoria de gastos. Revise se está dentro do esperado.` : ''}\n\nVeja a distribuição visual no **Dashboard** para mais detalhes! 📊`
  }

  // Greetings / general
  if (
    lower.includes('oi') ||
    lower.includes('olá') ||
    lower.includes('ola') ||
    lower.includes('bom dia') ||
    lower.includes('boa tarde') ||
    lower.includes('boa noite') ||
    lower.includes('ajuda') ||
    lower.includes('help')
  ) {
    return `Olá! Sou a **IA do ElevaAI** 🤖 — sua consultora financeira pessoal.\n\nBaseado no seu perfil:\n• **Score:** ${ctx.score}/1000 (${ctx.levelLabel})\n• **Saldo do mês:** ${balStr}\n• **Taxa de poupança:** ${ctx.savingsRate}%\n\nPosso te ajudar com:\n📊 Análise do seu orçamento\n💰 Estratégias de poupança\n📈 Onde investir\n🎯 Criação de metas\n🛡️ Reserva de emergência\n💳 Sair das dívidas\n\nO que você gostaria de explorar hoje?`
  }

  // Patrimônio / wealth
  if (lower.includes('patrimônio') || lower.includes('patrimonio') || lower.includes('riqueza') || lower.includes('rico')) {
    return `Construir patrimônio é uma maratona, não uma corrida de 100m! 🏗️\n\n**Sua situação atual:**\n• Renda mensal: ${incomeStr}\n• Saldo disponível: ${balStr}/mês\n• Taxa de poupança: ${ctx.savingsRate}%\n\n**Projeção patrimonial (Tesouro Selic ~10,65% a.a.):**\n• Em 5 anos poupando ${formatCurrency(ctx.balance)}/mês: ~**${formatCurrency(ctx.balance * 12 * 5 * 1.4)}**\n• Em 10 anos: ~**${formatCurrency(ctx.balance * 12 * 10 * 1.9)}**\n• Em 20 anos: ~**${formatCurrency(ctx.balance * 12 * 20 * 3.5)}**\n\n**Os 3 pilares do patrimônio:**\n1. 💵 Aumentar renda (carreira, negócio, freelance)\n2. 📉 Reduzir despesas (eficiência financeira)\n3. 📈 Investir o excedente (juros compostos)\n\nO tempo é seu maior aliado. Quanto antes começar, maior será o resultado! 🚀`
  }

  // Default comprehensive response
  return `Boa pergunta! Analisando seu perfil financeiro:\n\n📊 **Resumo atual:**\n• Receitas: ${incomeStr} | Despesas: ${expStr}\n• Saldo: ${balStr} | Score: ${ctx.score}/1000\n• Taxa de poupança: ${ctx.savingsRate}%\n\nCom base nesses dados, minha principal recomendação é:\n\n${ctx.savingsRate >= 20 ? `✅ Seu orçamento está saudável! Foque em **investir consistentemente** para multiplicar seu patrimônio.` : ctx.savingsRate >= 0 ? `⚠️ Há espaço para aumentar sua poupança. **Revise a categoria de ${ctx.topCategory ?? 'maiores gastos'}** para liberar mais dinheiro.` : `🚨 Suas despesas superam a renda. **Prioridade máxima:** cortar gastos não essenciais imediatamente.`}\n\nPosso detalhar qualquer aspecto das suas finanças. Qual dúvida específica posso resolver?`
}

export default function IAPage() {
  const { transactions } = useTransactions()
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Olá! Sou a **IA do ElevaAI** 🤖 — sua consultora financeira pessoal com inteligência artificial.\n\nEstou aqui para analisar seu perfil financeiro e oferecer orientações personalizadas. O que você gostaria de explorar hoje?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const ctx = useMemo(() => buildContext(transactions), [transactions])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isTyping) return

      const userMsg: AIMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsTyping(true)

      setTimeout(() => {
        const response = generateResponse(text, ctx)
        const aiMsg: AIMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMsg])
        setIsTyping(false)
      }, 800 + Math.random() * 700)
    },
    [ctx, isTyping]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content:
          'Conversa reiniciada! 🔄 Como posso te ajudar com suas finanças hoje?',
        timestamp: new Date(),
      },
    ])
  }

  const formatMessage = (content: string) => {
    return content
      .split('\n')
      .map((line, i) => {
        const formatted = line
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/^• (.+)/, '<span class="flex gap-1.5"><span class="text-violet-400 shrink-0">•</span><span>$1</span></span>')
          .replace(/^(\d+)\. (.+)/, '<span class="flex gap-1.5"><span class="text-violet-400 font-semibold shrink-0">$1.</span><span>$2</span></span>')
        return (
          <span
            key={i}
            className="block"
            dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }}
          />
        )
      })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-2rem)] px-4 md:px-8 py-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-violet-400" />
            IA Financeira
          </h1>
          <p className="text-sm text-muted-foreground">
            Consultora pessoal com análise do seu perfil real
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground"
          onClick={resetChat}
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Reiniciar</span>
        </Button>
      </div>

      {/* Quick starters */}
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-hide">
        {STARTERS.map((s) => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors whitespace-nowrap"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed space-y-0.5',
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-tr-sm'
                    : 'bg-muted text-foreground rounded-tl-sm'
                )}
              >
                {formatMessage(msg.content)}
                <p
                  className={cn(
                    'text-[10px] mt-2',
                    msg.role === 'user' ? 'text-violet-200' : 'text-muted-foreground'
                  )}
                >
                  {msg.timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="border-t border-border p-4 shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre suas finanças..."
              className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 placeholder:text-muted-foreground"
              disabled={isTyping}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-violet-600 hover:bg-violet-700 text-white border-0 rounded-xl px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
