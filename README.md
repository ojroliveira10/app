# FinançasPessoais

App de gestão financeira pessoal com Next.js, Supabase e shadcn/ui.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (Auth + PostgreSQL + RLS)
- **Recharts** (gráficos)
- **date-fns** (formatação de datas)

## Funcionalidades

- Autenticação via Supabase Auth (email/senha)
- Cadastro de receitas e despesas com categoria, data e descrição
- Dashboard com resumo mensal (receitas, despesas, saldo)
- Gráfico de despesas por categoria (Pie Chart)
- Lista de transações recentes
- Filtros por mês, ano, tipo e categoria
- Editar e excluir transações
- Row Level Security — cada usuário só vê seus dados
- Responsivo (mobile-first)

## Configuração

### 1. Crie um projeto no Supabase

Acesse [supabase.com](https://supabase.com), crie um projeto e copie:
- Project URL
- Anon public key

### 2. Execute a migração SQL

No **SQL Editor** do Supabase, execute o arquivo:

```
supabase/migration.sql
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. Instale e rode

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

## Deploy na Vercel

1. Suba o código para um repositório GitHub
2. Importe o projeto na Vercel
3. Adicione as variáveis de ambiente no painel da Vercel
4. Deploy automático a cada push

## Estrutura

```
app/
├── (auth)/login        # Página de login
├── (auth)/register     # Página de cadastro
└── (dashboard)/        # Páginas autenticadas
    ├── page.tsx        # Dashboard
    └── transactions/   # Transações

components/
├── auth/               # LoginForm, RegisterForm
├── dashboard/          # SummaryCards, CategoryChart, RecentTransactions
├── transactions/       # TransactionForm, TransactionList, TransactionFilters
└── layout/             # Sidebar, MobileNav

lib/
├── supabase/           # client.ts e server.ts
├── constants.ts        # Categorias e cores
└── format.ts           # Formatação de moeda e data

hooks/
└── useTransactions.ts  # Hook principal com CRUD e filtros

supabase/
└── migration.sql       # Schema do banco com RLS
```
