drop policy if exists "public read photos" on storage.objects;
create policy "admin read photos" on storage.objects for select to authenticated
using (bucket_id = 'product-photos' and public.has_role(auth.uid(), 'admin'::public.app_role));