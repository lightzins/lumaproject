-- Tabela para guardar os orçamentos (leads)
create table leads (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  idea text not null,
  budget text,
  services text[]
);

-- Ativar RLS
alter table leads enable row level security;

-- Regras:
-- Qualquer um pode enviar um lead (não precisa estar logado)
create policy "Anyone can insert leads" on leads for insert with check (true);

-- Só administradores podem ver os leads
create policy "Admins can view leads" on leads for select using ( public.is_admin() );
