create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

-- first account created becomes the store admin
create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_first_admin after insert on auth.users for each row execute function public.handle_first_admin();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric(10,2) not null default 0,
  sizes text[],
  featured boolean not null default false,
  photos text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read" on public.products for select to anon, authenticated using (true);
create policy "admin insert" on public.products for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admin update" on public.products for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin delete" on public.products for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "public read photos" on storage.objects for select using (bucket_id = 'product-photos');
create policy "admin upload photos" on storage.objects for insert to authenticated with check (bucket_id = 'product-photos' and public.has_role(auth.uid(), 'admin'));
create policy "admin delete photos" on storage.objects for delete to authenticated using (bucket_id = 'product-photos' and public.has_role(auth.uid(), 'admin'));

insert into public.products (name, category, price, sizes, featured, photos, sort_order) values
('Vestido Fada','vestidos',89.9,'{PP,P,M,G,GG}',true,'{https://i.postimg.cc/tJWygM4j/IMG-2516.jpg,https://i.postimg.cc/05w9Zbdc/IMG-2517.jpg}',1),
('Vestido Roxo Laço','vestidos',89.9,'{PP,P,M,G,GG}',false,'{https://i.postimg.cc/t4X1LhBp/IMG-2512.jpg,https://i.postimg.cc/T3RyZrty/IMG-2513.jpg}',2),
('Vestido Creme','vestidos',89.9,'{PP,P,M,G,GG}',false,'{https://i.postimg.cc/tRk82Qvd/IMG-2510.jpg,https://i.postimg.cc/dQ6g4PN2/IMG-2511.jpg}',3),
('Vestido Creme com Top','vestidos',89.9,'{PP,P,M,G,GG}',false,'{https://i.postimg.cc/XqP8m8CN/IMG-2508.jpg,https://i.postimg.cc/hvYr6rdD/IMG-2509.jpg}',4),
('Vestido Babado Roxo','vestidos',89.9,'{PP,P,M,G,GG}',false,'{https://i.postimg.cc/QMMq8wJt/IMG-2482.jpg,https://i.postimg.cc/MGGY6Nmf/IMG-2483.jpg}',5),
('Vestido Rosa Princesa','vestidos',89.9,'{PP,P,M,G,GG}',true,'{https://i.postimg.cc/BnpgG4HJ/IMG-2485.jpg,https://i.postimg.cc/XvvgjmkW/IMG-2487.jpg}',6),
('Vestido Fadinha','vestidos',89.9,'{PP,P,M,G,GG}',false,'{https://i.postimg.cc/bwgTjpb5/IMG-2488.jpg,https://i.postimg.cc/BnpgG4DR/IMG-2490.jpg}',7),
('Vestido Top Rosa','vestidos',89.9,'{PP,P,M,G,GG}',false,'{https://i.postimg.cc/DwngD8W1/IMG-2491.jpg,https://i.postimg.cc/DwngD8W5/IMG-2492.jpg}',8),
('Vestido com Pérolas','vestidos',89.9,'{PP,P,M,G,GG}',false,'{https://i.postimg.cc/nhpk5CsL/IMG-2493.jpg,https://i.postimg.cc/kgqcZBVg/IMG-2494.jpg}',9),
('Vestido Borboleta Verde','vestidos',89.9,'{PP,P,M,G,GG}',false,'{https://i.postimg.cc/4NzPBz3R/IMG-2501.jpg,https://i.postimg.cc/bNQg3QvN/IMG-2502.jpg}',10),
('Vestido Borboleta Rosa','vestidos',89.9,'{PP,P,M,G,GG}',false,'{https://i.postimg.cc/KvXQP9xf/IMG-2504.jpg,https://i.postimg.cc/VLy4q7mW/IMG-2505.jpg}',11),
('Vestido Pérolas Pequeno','vestidos',89.9,'{PP,P,M,G,GG}',false,'{https://i.postimg.cc/ZKkj8f4j/IMG-2506.jpg,https://i.postimg.cc/VLy4q7mK/IMG-2507.jpg}',12),
('Adidog Verde','caminhada',34.99,'{PP,P,M,G,GG}',false,'{https://i.postimg.cc/kMtPMhT8/IMG-2477.jpg}',13),
('Adidog Rosa','caminhada',34.99,'{PP,P,M,G,GG}',true,'{https://i.postimg.cc/ryt2yYf4/IMG-2480.jpg}',14),
('Peitoral Mochila 1','peitoral',35,null,false,'{https://i.postimg.cc/dt4BbJ8w/IMG-2462.jpg}',15),
('Peitoral Mochila 2','peitoral',35,null,false,'{https://i.postimg.cc/4NB5DXzJ/IMG-2465.jpg}',16),
('Peitoral com Top','peitoral',35,null,false,'{https://i.postimg.cc/Hsx57XyC/IMG-2455.jpg}',17),
('Bolinha Automática','brinquedos',19.9,null,true,'{https://i.postimg.cc/vBYDww7F/IMG-2441.jpg,https://i.postimg.cc/zBz3YYCs/IMG-2443.jpg}',18),
('Escova Massageadora Fluffie','brinquedos',24.99,null,false,'{https://i.postimg.cc/PxXNnnW6/IMG-2446.jpg,https://i.postimg.cc/RFSqxx7d/IMG-2447.jpg}',19),
('Roleta de Petisco','brinquedos',49.9,null,false,'{https://i.postimg.cc/NMsLvv6J/IMG-2451.jpg,https://i.postimg.cc/vBYDwwr0/IMG-2452.jpg}',20);