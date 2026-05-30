
-- 1. Update handle_new_user to no longer auto-admin the first user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, is_admin)
  values (new.id, new.email, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Ensure trigger exists on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Create the admin user cool123@gmail.com / cool123
do $$
declare
  new_user_id uuid;
  existing_id uuid;
begin
  select id into existing_id from auth.users where email = 'cool123@gmail.com';

  if existing_id is null then
    new_user_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', 'cool123@gmail.com',
      crypt('cool123', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      now(), now(), '', '', '', ''
    );

    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), new_user_id, jsonb_build_object('sub', new_user_id::text, 'email', 'cool123@gmail.com'), 'email', new_user_id::text, now(), now(), now());
  else
    new_user_id := existing_id;
  end if;

  insert into public.profiles (id, email, is_admin)
  values (new_user_id, 'cool123@gmail.com', true)
  on conflict (id) do update set is_admin = true, email = excluded.email;
end $$;
