-- Dish search and live order updates.

-- Dishes in an area whose name or description contains `p_term` (already
-- normalised by the app: lower case, no accents or punctuation). The trigram
-- index serves the LIKE; the app then ranks the candidates with the same
-- searchCatalog() every backend uses. Runs with the caller's rights, so RLS applies.
create function public.search_menu_items(p_area_id text, p_term text, p_limit integer default 200)
returns setof public.menu_items
language sql
stable
security invoker
set search_path = ''
as $$
  select m.*
  from public.menu_items m
  join public.restaurants r on r.id = m.restaurant_id
  where p_area_id = any (r.area_ids)
    and char_length(p_term) >= 2
    and m.search_text like
      '%' || replace(replace(replace(lower(p_term), '\', '\\'), '%', '\%'), '_', '\_') || '%'
  order by extensions.similarity(m.search_text, lower(p_term)) desc, m.position
  limit least(greatest(p_limit, 1), 500);
$$;

grant execute on function public.search_menu_items(text, text, integer) to anon, authenticated;

-- Realtime sends order changes to subscribers. It checks the orders RLS policy
-- for each subscriber, so customers only hear about their own orders.
alter publication supabase_realtime add table public.orders;
