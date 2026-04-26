-- Cole e execute este código no SQL Editor do Supabase (https://supabase.com/dashboard/project/pxlaksthiagyvkivkjof/sql/new)

-- 1. Criar tabela de perfis (profiles)
create table profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  name text,
  role text default 'client' check (role in ('client', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Criar tabela de mensagens (messages)
create table messages (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sender_id uuid references auth.users not null,
  receiver_id uuid references auth.users,
  text text not null
);

-- 3. Ativar segurança (RLS - Row Level Security)
alter table profiles enable row level security;
alter table messages enable row level security;

-- Regras de Perfis:
-- Clientes podem ver e atualizar o próprio perfil
create policy "Users can view own profile" on profiles for select using ( auth.uid() = id );
create policy "Users can insert own profile" on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile" on profiles for update using ( auth.uid() = id );
-- Admin pode ver e atualizar todos os perfis
create policy "Admins can view all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update all profiles" on profiles for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Regras de Mensagens:
-- Clientes podem ver suas próprias mensagens
create policy "Users can view own messages" on messages for select using ( auth.uid() = sender_id or auth.uid() = receiver_id );
-- Clientes podem enviar mensagens
create policy "Users can insert messages" on messages for insert with check ( auth.uid() = sender_id );
-- Admin pode ver todas as mensagens
create policy "Admins can view all messages" on messages for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
-- Admin pode enviar mensagens para qualquer um
create policy "Admins can insert messages" on messages for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 4. Função para criar perfil automaticamente quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    -- Define você como admin baseado no email fornecido
    case when new.email = 'enzoeduardoamaral15@gmail.com' then 'admin' else 'client' end
  );
  return new;
end;
$$ language plpgsql security definer;

-- 5. Trigger (Gatilho) para chamar a função acima sempre que houver novo cadastro
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Habilitar o modo Realtime para a tabela de mensagens (para o chat atualizar ao vivo)
alter publication supabase_realtime add table messages;
