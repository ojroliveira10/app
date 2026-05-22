-- FinançasPessoais — Supabase Migration
-- Execute este SQL no SQL Editor do seu projeto Supabase

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount      DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  date        DATE NOT NULL,
  category    TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Habilitar Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS — cada usuário só acessa seus próprios dados
CREATE POLICY "select_own_transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own_transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
