'use client'

import { useState } from 'react'
import { ArrowUpCircle, ArrowDownCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/format'
import type { Transaction } from '@/types'
import { cn } from '@/lib/utils'

interface TransactionListProps {
  transactions: Transaction[]
  loading: boolean
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => Promise<{ error: unknown }>
}

export function TransactionList({ transactions, loading, onEdit, onDelete }: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await onDelete(id)
    setDeletingId(null)
    setConfirmId(null)
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ArrowUpCircle className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Nenhuma transação encontrada</p>
        <p className="text-xs mt-1">Ajuste os filtros ou adicione uma nova transação</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {transactions.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors"
          >
            {t.type === 'income' ? (
              <ArrowUpCircle className="w-8 h-8 text-green-500 shrink-0" />
            ) : (
              <ArrowDownCircle className="w-8 h-8 text-red-500 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {t.description || t.category}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                <Badge variant="secondary" className="text-xs py-0">{t.category}</Badge>
              </div>
            </div>

            <p className={cn(
              'text-sm font-semibold shrink-0',
              t.type === 'income' ? 'text-green-600' : 'text-red-500'
            )}>
              {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
            </p>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground shrink-0">
                <MoreVertical className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(t)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setConfirmId(t.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <AlertDialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmId && handleDelete(confirmId)}
              disabled={!!deletingId}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
