alter table public.profiles
  add column if not exists avatar_url text;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  user_display_name text;
  user_avatar_url text;
begin
  user_display_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    split_part(coalesce(new.email, ''), '@', 1)
  );
  user_avatar_url := coalesce(
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_user_meta_data ->> 'picture', '')
  );

  insert into public.profiles (id, email, display_name, avatar_url)
  values (new.id, lower(coalesce(new.email, '')), user_display_name, user_avatar_url)
  on conflict (id) do update
    set email = excluded.email,
        display_name = case
          when public.profiles.display_name = '' then excluded.display_name
          else public.profiles.display_name
        end,
        avatar_url = excluded.avatar_url;

  insert into public.user_roles (user_id, is_admin)
  values (new.id, lower(coalesce(new.email, '')) = 'daveherczeg@gmail.com')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function private.sync_profile_avatar()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  update public.profiles
  set avatar_url = coalesce(
        nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
        nullif(new.raw_user_meta_data ->> 'picture', '')
      ),
      updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_avatar_updated on auth.users;
create trigger on_auth_user_avatar_updated
after update of raw_user_meta_data on auth.users
for each row execute function private.sync_profile_avatar();

update public.profiles as p
set avatar_url = coalesce(
      nullif(u.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(u.raw_user_meta_data ->> 'picture', '')
    )
from auth.users as u
where u.id = p.id;

revoke all on function private.handle_new_user() from public;
revoke all on function private.sync_profile_avatar() from public;
