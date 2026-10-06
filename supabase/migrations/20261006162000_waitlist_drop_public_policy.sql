-- =====================================================================
-- Cap Soleil · v1: tira a policy pública que sobrou (2026-10-06)
--
-- A migration club_housekeeping tirou de anon e authenticated a
-- permissão de gravar na public.waitlist, mas a policy
-- "Anyone can join the list" ficou. Hoje ela não faz nada; se alguém
-- devolver o grant um dia, ela voltaria a abrir a tabela ao público.
-- Sem policy, o RLS nega tudo a quem não é service_role.
--
-- Nada é apagado além da policy (a tabela segue vazia no banco).
-- Não rode de novo.
-- =====================================================================

drop policy "Anyone can join the list" on public.waitlist;
