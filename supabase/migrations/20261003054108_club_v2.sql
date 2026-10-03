-- =====================================================================
-- Cap Soleil Lawn Tennis Club: banco v2 ("club")
--
-- Aplicada no projeto "Cap Soleil Club" (eu-west-3) em 2026-10-03.
-- É ADITIVA: não altera public.waitlist nem public.join_waitlist (v1),
-- que continuam servindo o site atual até o v2 ir ao ar.
--
-- Desenho:
--   • tudo fica no esquema `club`, que NÃO é exposto pela API pública;
--   • o site não escreve no banco: a Edge Function `apply` valida, limita
--     tentativas e chama public.club_apply() com a chave secreta;
--   • public.club_apply() e public.club_rate_limit_hit() só podem ser
--     executadas pelo service_role (anon e authenticated não têm acesso);
--   • RLS ligado em todas as tabelas, sem políticas (negação total) como
--     segunda camada de proteção.
-- =====================================================================

create extension if not exists citext with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create schema if not exists club;
comment on schema club is 'Cap Soleil: membros da lista, consentimentos e eventos. Acesso só pelo servidor.';

revoke all on schema club from public, anon, authenticated;
grant usage on schema club to service_role;

-- Status do membro -----------------------------------------------------
--   pending       candidatura recebida (ainda sem confirmação por e-mail)
--   confirmed     confirmou o e-mail (dupla confirmação, quando houver e-mail)
--   unsubscribed  pediu para sair das cartas
--   bounced       e-mail inválido / devolvido
--   shop_invited  recebeu o convite de abertura da Pro Shop
--   customer      já comprou
create type club.member_status as enum ('pending', 'confirmed', 'unsubscribed', 'bounced', 'shop_invited', 'customer');

-- Código de convite: 8 caracteres sem ambíguos (sem 0/O, 1/I/L) -------
create function club.new_invite_code()
returns text
language sql
volatile
set search_path = ''
as $$
  select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', (get_byte(b, i) % 31) + 1, 1), '')
  from (select extensions.gen_random_bytes(8) as b) r, generate_series(0, 7) as i;
$$;

-- Número de membro: atribuído na confirmação (fase com e-mail) ---------
create sequence club.member_number_seq start 1;

-- Membros (leads) -------------------------------------------------------
create table club.members (
  id                uuid primary key default gen_random_uuid(),
  email             extensions.citext not null unique,
  first_name        text not null,
  last_name         text,
  phone_e164        text,
  country_code      char(2),
  locale            text not null default 'en',
  status            club.member_status not null default 'pending',
  member_number     integer unique,
  invite_code       text not null unique default club.new_invite_code(),
  invited_by        uuid references club.members (id) on delete set null,
  invitations_left  smallint not null default 3,

  -- origem (primeiro contato)
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  utm_content       text,
  utm_term          text,
  referrer_host     text,
  landing_path      text,
  device_class      text,

  -- consentimento atual (o histórico completo fica em club.consents)
  marketing_consent boolean not null default false,
  consent_version   text,
  consent_at        timestamptz,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  confirmed_at      timestamptz,
  unsubscribed_at   timestamptz,

  -- integração futura (CRM / e-mail marketing)
  crm_contact_id    text,
  crm_synced_at     timestamptz,

  metadata          jsonb not null default '{}'::jsonb,

  constraint members_email_format check (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint members_first_name_len check (char_length(first_name) between 1 and 80),
  constraint members_last_name_len check (last_name is null or char_length(last_name) <= 80),
  constraint members_phone_format check (phone_e164 is null or phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  constraint members_country_format check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  constraint members_locale_len check (char_length(locale) between 2 and 16),
  constraint members_invitations check (invitations_left between 0 and 50),
  constraint members_utm_len check (
    coalesce(char_length(utm_source), 0) <= 120 and coalesce(char_length(utm_medium), 0) <= 120 and
    coalesce(char_length(utm_campaign), 0) <= 120 and coalesce(char_length(utm_content), 0) <= 120 and
    coalesce(char_length(utm_term), 0) <= 120
  ),
  constraint members_referrer_len check (referrer_host is null or char_length(referrer_host) <= 255),
  constraint members_landing_len check (landing_path is null or char_length(landing_path) <= 255),
  constraint members_device check (device_class is null or device_class in ('mobile', 'tablet', 'desktop')),
  constraint members_consent_version_len check (consent_version is null or char_length(consent_version) <= 40),
  constraint members_metadata_object check (jsonb_typeof(metadata) = 'object')
);

comment on table club.members is 'Lista de espera da Cap Soleil (um registro por e-mail). Escrita só via public.club_apply().';

create index members_status_idx on club.members (status);
create index members_created_idx on club.members (created_at desc);
create index members_invited_by_idx on club.members (invited_by) where invited_by is not null;

-- Consentimentos (prova de consentimento, GDPR art. 7) -----------------
create table club.consents (
  id            bigint generated always as identity primary key,
  member_id     uuid not null references club.members (id) on delete cascade,
  purpose       text not null,
  granted       boolean not null,
  text_version  text not null,
  method        text not null,
  created_at    timestamptz not null default now(),
  constraint consents_purpose check (purpose in ('club_letters')),
  constraint consents_method check (method in ('web_form', 'double_opt_in', 'unsubscribe_link', 'admin')),
  constraint consents_version_len check (char_length(text_version) between 1 and 40)
);

create index consents_member_idx on club.consents (member_id, created_at desc);

-- Eventos (histórico para campanhas e auditoria) ------------------------
create table club.events (
  id          bigint generated always as identity primary key,
  member_id   uuid references club.members (id) on delete cascade,
  type        text not null,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  constraint events_type_format check (type ~ '^[a-z_]{2,40}$'),
  constraint events_data_object check (jsonb_typeof(data) = 'object')
);

create index events_member_idx on club.events (member_id, created_at desc);
create index events_type_idx on club.events (type, created_at desc);

-- Limite de tentativas (chaves com hash; nunca IP ou e-mail em claro) ---
create table club.rate_limits (
  key           text not null,
  window_start  timestamptz not null,
  hits          integer not null default 1,
  primary key (key, window_start),
  constraint rate_limits_key_len check (char_length(key) <= 120)
);

-- updated_at automático -------------------------------------------------
create function club.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger members_touch_updated_at
  before update on club.members
  for each row execute function club.touch_updated_at();

-- RLS ligado, sem políticas (negação total para anon e authenticated) ----
alter table club.members enable row level security;
alter table club.consents enable row level security;
alter table club.events enable row level security;
alter table club.rate_limits enable row level security;

-- Candidatura -----------------------------------------------------------
-- Retorna 'created' (novo) ou 'existing' (já na lista). Quem chama NUNCA
-- deve mostrar essa diferença ao visitante (resposta igual nos dois casos).
create function club.apply(
  p_email            text,
  p_first_name       text,
  p_country_code     text,
  p_locale           text,
  p_consent          boolean,
  p_consent_version  text,
  p_utm              jsonb,
  p_referrer_host    text,
  p_landing_path     text,
  p_device_class     text,
  p_invite_code      text,
  p_metadata         jsonb
)
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_email    text := lower(trim(p_email));
  v_id       uuid;
  v_status   club.member_status;
  v_inviter  uuid;
  v_utm      jsonb := coalesce(p_utm, '{}'::jsonb);
begin
  if not coalesce(p_consent, false) then
    raise exception 'consent is required' using errcode = '22023';
  end if;
  if nullif(trim(p_consent_version), '') is null then
    raise exception 'consent version is required' using errcode = '22023';
  end if;

  if nullif(trim(p_invite_code), '') is not null then
    select id into v_inviter from club.members where invite_code = upper(trim(p_invite_code));
  end if;

  insert into club.members (
    email, first_name, country_code, locale,
    marketing_consent, consent_version, consent_at,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    referrer_host, landing_path, device_class, invited_by, metadata
  ) values (
    v_email,
    left(trim(p_first_name), 80),
    upper(nullif(trim(p_country_code), '')),
    coalesce(nullif(trim(p_locale), ''), 'en'),
    true, p_consent_version, now(),
    left(nullif(trim(v_utm ->> 'source'), ''), 120),
    left(nullif(trim(v_utm ->> 'medium'), ''), 120),
    left(nullif(trim(v_utm ->> 'campaign'), ''), 120),
    left(nullif(trim(v_utm ->> 'content'), ''), 120),
    left(nullif(trim(v_utm ->> 'term'), ''), 120),
    left(nullif(trim(p_referrer_host), ''), 255),
    left(nullif(trim(p_landing_path), ''), 255),
    nullif(trim(p_device_class), ''),
    v_inviter,
    coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (email) do nothing
  returning id into v_id;

  if v_id is not null then
    insert into club.consents (member_id, purpose, granted, text_version, method)
    values (v_id, 'club_letters', true, p_consent_version, 'web_form');

    insert into club.events (member_id, type, data)
    values (v_id, 'applied', jsonb_strip_nulls(jsonb_build_object(
      'utm_source', v_utm ->> 'source', 'invited', v_inviter is not null, 'device', p_device_class)));

    if v_inviter is not null then
      insert into club.events (member_id, type, data)
      values (v_inviter, 'invite_used', jsonb_build_object('invitee', v_id));
    end if;

    return 'created';
  end if;

  -- Já está na lista: não sobrescreve nada que um terceiro possa ter digitado.
  -- Só quem tinha saído e voltou a consentir é reativado.
  select id, status into v_id, v_status from club.members where email = v_email;

  if v_status = 'unsubscribed' then
    update club.members
       set status = 'pending', marketing_consent = true, consent_version = p_consent_version,
           consent_at = now(), unsubscribed_at = null
     where id = v_id;
    insert into club.consents (member_id, purpose, granted, text_version, method)
    values (v_id, 'club_letters', true, p_consent_version, 'web_form');
  end if;

  insert into club.events (member_id, type, data)
  values (v_id, 'applied_again', jsonb_strip_nulls(jsonb_build_object('utm_source', v_utm ->> 'source')));

  return 'existing';
end;
$$;

comment on function club.apply is 'Registra uma candidatura. Retorna created/existing; a diferença nunca deve chegar ao visitante.';

-- Limite de tentativas: true = permitido ---------------------------------
create function club.rate_limit_hit(p_key text, p_window_seconds integer, p_max integer)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits integer;
begin
  insert into club.rate_limits (key, window_start, hits)
  values (left(p_key, 120), v_window, 1)
  on conflict (key, window_start) do update set hits = club.rate_limits.hits + 1
  returning hits into v_hits;

  -- limpeza barata de janelas antigas
  if random() < 0.02 then
    delete from club.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_max;
end;
$$;

-- Visão para o painel ----------------------------------------------------
create view club.v_daily
with (security_invoker = true)
as
select date_trunc('day', created_at)::date as day,
       status,
       coalesce(utm_source, 'direct') as source,
       country_code,
       device_class,
       count(*) as members
  from club.members
 group by 1, 2, 3, 4, 5;

-- Privilégios: só o service_role (no fim, quando todos os objetos existem) --
revoke all on all tables in schema club from public, anon, authenticated;
revoke all on all sequences in schema club from public, anon, authenticated;
revoke all on all functions in schema club from public, anon, authenticated;

grant select, insert, update, delete on all tables in schema club to service_role;
grant usage, select on all sequences in schema club to service_role;
grant execute on all functions in schema club to service_role;

-- Pontes na API (só service_role) -----------------------------------------
create function public.club_apply(
  p_email            text,
  p_first_name       text,
  p_country_code     text,
  p_locale           text,
  p_consent          boolean,
  p_consent_version  text,
  p_utm              jsonb,
  p_referrer_host    text,
  p_landing_path     text,
  p_device_class     text,
  p_invite_code      text,
  p_metadata         jsonb
)
returns text
language sql
set search_path = ''
as $$
  select club.apply(p_email, p_first_name, p_country_code, p_locale, p_consent, p_consent_version,
                    p_utm, p_referrer_host, p_landing_path, p_device_class, p_invite_code, p_metadata);
$$;

create function public.club_rate_limit_hit(p_key text, p_window_seconds integer, p_max integer)
returns boolean
language sql
set search_path = ''
as $$
  select club.rate_limit_hit(p_key, p_window_seconds, p_max);
$$;

revoke all on function public.club_apply(text, text, text, text, boolean, text, jsonb, text, text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.club_rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.club_apply(text, text, text, text, boolean, text, jsonb, text, text, text, text, jsonb) to service_role;
grant execute on function public.club_rate_limit_hit(text, integer, integer) to service_role;

-- Migração dos dados da v1 (idempotente; rodar de novo na virada) ---------
with moved as (
  insert into club.members (email, first_name, marketing_consent, consent_version, consent_at, utm_source, created_at, metadata)
  select lower(w.email),
         coalesce(nullif(trim(w.first_name), ''), 'Member'),
         w.consent,
         'v1',
         w.consent_at,
         left(w.source, 120),
         w.created_at,
         jsonb_build_object('migrated_from', 'public.waitlist', 'country_name', w.country)
    from public.waitlist w
  on conflict (email) do nothing
  returning id, consent_at
)
insert into club.consents (member_id, purpose, granted, text_version, method, created_at)
select id, 'club_letters', true, 'v1', 'web_form', consent_at from moved;
