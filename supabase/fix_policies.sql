-- 1. Remover políticas antigas que causam loop infinito
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Admins can update all profiles" on profiles;
drop policy if exists "Admins can view all messages" on messages;
drop policy if exists "Admins can insert messages" on messages;

-- 2. Criar função segura que verifica se é admin sem causar loop (ignora o RLS internamente)
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 3. Recriar as regras usando a função segura
create policy "Admins can view all profiles" on profiles for select using ( public.is_admin() );
create policy "Admins can update all profiles" on profiles for update using ( public.is_admin() );

create policy "Admins can view all messages" on messages for select using ( public.is_admin() );
create policy "Admins can insert messages" on messages for insert with check ( public.is_admin() );
