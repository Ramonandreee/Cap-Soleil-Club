-- =====================================================================
-- Cap Soleil · arrumação do banco (2026-10-06)
--
-- 1. Limpeza dos códigos anti-abuso (club.rate_limits). A Privacy promete
--    apagá-los em até um dia, mas a limpeza dependia de 2% das candidaturas
--    e, sem tráfego, não rodava. Agora uma tarefa do próprio banco
--    (Supabase Cron, extensão pg_cron) roda a cada hora.
-- 2. Aposentadoria da v1. O site v1 saiu do ar, mas a função
--    public.join_waitlist e a tabela public.waitlist ainda aceitavam
--    gravação pública (anon e authenticated). Aqui só tiramos a
--    permissão: nada é apagado, e um grant desfaz.
--
-- Não rode de novo.
-- =====================================================================

create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Limpeza dos códigos anti-abuso -----------------------------------------
-- Tira as janelas com mais de um dia e diz quantas saíram.
create function club.purge_rate_limits()
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_count integer;
begin
  delete from club.rate_limits where window_start < now() - interval '1 day';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

comment on function club.purge_rate_limits is
  'Apaga os códigos anti-abuso com mais de um dia (promessa da Privacy). Roda a cada hora pelo Supabase Cron.';

revoke all on function club.purge_rate_limits() from public, anon, authenticated;
grant execute on function club.purge_rate_limits() to service_role;

-- A cada hora, no minuto 17. Acompanhe em Integrations › Cron no painel.
select cron.schedule('club-purge-rate-limits', '17 * * * *', $$select club.purge_rate_limits()$$);

-- E já limpa o que venceu.
select club.purge_rate_limits();

-- v1: sem gravação pública -------------------------------------------------
revoke execute on function public.join_waitlist(text, text, text, text, boolean) from public, anon, authenticated;
revoke insert (email, first_name, country, source, consent) on public.waitlist from anon, authenticated;
revoke insert on public.waitlist from anon, authenticated;
