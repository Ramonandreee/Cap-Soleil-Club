-- =====================================================================
-- Cap Soleil Lawn Tennis Club: lista de espera ("The list")
--
-- SOMENTE REFERÊNCIA. O banco já existe no projeto "Cap Soleil Club"
-- (Supabase, eu-west-3). NÃO rode este arquivo: ele documenta o schema
-- que o site usa, conforme está no banco hoje.
-- =====================================================================

-- Tabela -------------------------------------------------------------

create table public.waitlist (
  id          uuid        primary key default gen_random_uuid(),
  email       text        not null unique,
  first_name  text,
  country     text,
  source      text,
  consent     boolean     not null default true,
  consent_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),

  constraint waitlist_email_format check (
    email = lower(email)
    and char_length(email) <= 254
    and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  constraint waitlist_first_name_len check (first_name is null or char_length(first_name) <= 80),
  constraint waitlist_country_len    check (country    is null or char_length(country)    <= 64),
  constraint waitlist_source_len     check (source     is null or char_length(source)     <= 120)
);

comment on table public.waitlist is
  'Cap Soleil pre-launch list. Written only through join_waitlist().';

-- Segurança (RLS) ----------------------------------------------------
-- O público só pode INSERIR, e só com consentimento. Ninguém de fora lê
-- a lista: não existe política de SELECT, UPDATE ou DELETE.

alter table public.waitlist enable row level security;

create policy "Anyone can join the list"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (consent = true);

revoke all on public.waitlist from anon, authenticated;
grant insert (email, first_name, country, source, consent)
  on public.waitlist to anon, authenticated;

-- Função usada pelo site --------------------------------------------
-- supabase.rpc('join_waitlist', { p_email, p_first_name, p_country, p_source, p_consent })
-- Um e-mail repetido não gera erro nem altera nada: a resposta é a mesma
-- de um cadastro novo, para não revelar quem já está na lista.

create or replace function public.join_waitlist(
  p_email      text,
  p_first_name text    default null,
  p_country    text    default null,
  p_source     text    default null,
  p_consent    boolean default false
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if not coalesce(p_consent, false) then
    raise exception 'consent is required' using errcode = '22023';
  end if;

  insert into public.waitlist (email, first_name, country, source, consent)
  values (
    lower(trim(p_email)),
    nullif(left(trim(coalesce(p_first_name, '')), 80), ''),
    nullif(left(trim(coalesce(p_country, '')), 64), ''),
    nullif(left(trim(coalesce(p_source, '')), 120), ''),
    true
  );
exception
  when unique_violation then
    null; -- already on the list: change nothing, reveal nothing
end;
$$;

comment on function public.join_waitlist(text, text, text, text, boolean) is
  'Adds an email to the Cap Soleil list. Repeats are ignored.';

revoke all on function public.join_waitlist(text, text, text, text, boolean) from public;
grant execute on function public.join_waitlist(text, text, text, text, boolean)
  to anon, authenticated, service_role;
