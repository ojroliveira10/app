import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/format'
import type { Transaction } from '@/types'
import { cn } from '@/lib/utils'

interface RecentTransactionsProps {
  transactions: Transaction[]
  loading: boolean
}

export function RecentTransactions({ transactions, loading }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma transação neste período
          </p>
        ) : (
          <div className="space-y-3">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                {t.type === 'income' ? (
                  <ArrowUpCircle className="w-8 h-8 text-green-500 shrink-0" />
                ) : (
                  <ArrowDownCircle className="w-8 h-8 text-red-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.description || t.category}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn(
                    'text-sm font-semibold',
                    t.type === 'income' ? 'text-green-600' : 'text-red-500'
                  )}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                  <Badge variant="secondary" className="text-xs">{t.category}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
