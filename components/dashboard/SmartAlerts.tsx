import { AlertTriangle, Info, CheckCircle2, Bot } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { generateSmartAlerts } from '@/lib/financialScore'
import type { Transaction } from '@/types'
import { cn } from '@/lib/utils'

interface SmartAlertsProps {
  transactions: Transaction[]
  score: number
  loading: boolean
}

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon_color: 'text-amber-400',
    text_color: 'text-amber-300',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon_color: 'text-blue-400',
    text_color: 'text-blue-300',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon_color: 'text-emerald-400',
    text_color: 'text-emerald-300',
  },
}

export function SmartAlerts({ transactions, score, loading }: SmartAlertsProps) {
  const alerts = generateSmartAlerts(transactions, score)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-violet-500/10">
            <Bot className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <CardTitle className="text-sm font-medium">Insights da IA</CardTitle>
          <span className="text-[10px] bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/20 ml-auto">
            Personalizado
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum insight disponível no momento.
          </p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert, i) => {
              const cfg = alertConfig[alert.type]
              const Icon = cfg.icon
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border',
                    cfg.bg,
                    cfg.border
                  )}
                >
                  <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', cfg.icon_color)} />
                  <div className="min-w-0">
                    <p className={cn('text-sm font-medium', cfg.text_color)}>
                      {alert.message}
                    </p>
                    {alert.detail && (
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.detail}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
