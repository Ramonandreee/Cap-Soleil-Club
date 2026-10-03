-- =====================================================================
-- Cap Soleil · candidatura com sobrenome e WhatsApp (2026-10-03)
--
-- A lista é captação de lead: o formulário passa a pedir sobrenome e
-- WhatsApp. As colunas club.members.last_name e phone_e164 já existiam
-- (desligadas); aqui club.apply() e a ponte public.club_apply() passam a
-- recebê-las.
--
-- Os dois parâmetros novos vêm no fim e têm default null: a função `apply`
-- antiga (que não os envia) continua funcionando até a nova ser publicada.
-- Quem já está na lista não é alterado (ninguém sobrescreve o cadastro de
-- outra pessoa digitando o e-mail dela).
--
-- Aplicada pelo SQL Editor do Supabase (o conector não conseguiu rodar o DROP).
-- Não rode de novo.
-- =====================================================================

drop function public.club_apply(text, text, text, text, boolean, text, jsonb, text, text, text, text, jsonb);
drop function club.apply(text, text, text, text, boolean, text, jsonb, text, text, text, text, jsonb);

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
  p_metadata         jsonb,
  p_last_name        text default null,
  p_phone_e164       text default null
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
    email, first_name, last_name, phone_e164, country_code, locale,
    marketing_consent, consent_version, consent_at,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    referrer_host, landing_path, device_class, invited_by, metadata
  ) values (
    v_email,
    left(trim(p_first_name), 80),
    nullif(left(trim(p_last_name), 80), ''),
    nullif(trim(p_phone_e164), ''),
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

comment on function club.apply is 'Registra uma candidatura (com sobrenome e WhatsApp). Retorna created/existing; a diferença nunca deve chegar ao visitante.';

-- Ponte na API (só service_role) ------------------------------------------
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
  p_metadata         jsonb,
  p_last_name        text default null,
  p_phone_e164       text default null
)
returns text
language sql
set search_path = ''
as $$
  select club.apply(p_email, p_first_name, p_country_code, p_locale, p_consent, p_consent_version,
                    p_utm, p_referrer_host, p_landing_path, p_device_class, p_invite_code, p_metadata,
                    p_last_name, p_phone_e164);
$$;

-- Funções novas nascem executáveis por todos: fecha de novo.
revoke all on function club.apply(text, text, text, text, boolean, text, jsonb, text, text, text, text, jsonb, text, text) from public, anon, authenticated;
revoke all on function public.club_apply(text, text, text, text, boolean, text, jsonb, text, text, text, text, jsonb, text, text) from public, anon, authenticated;
grant execute on function club.apply(text, text, text, text, boolean, text, jsonb, text, text, text, text, jsonb, text, text) to service_role;
grant execute on function public.club_apply(text, text, text, text, boolean, text, jsonb, text, text, text, text, jsonb, text, text) to service_role;
