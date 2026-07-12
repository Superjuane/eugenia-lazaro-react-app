# Supabase implementation

This project keeps the React/Vercel app and the Supabase schema in the same repository.

## Hosted pieces

- Frontend: Vercel.
- Database: Supabase Postgres.
- Image files: Supabase Storage bucket `Eugenia Lazaro Pintura - imagenes publicas`.

## Environment variables

Local development uses `.env.local`.

Vercel must have the same variables configured in Project Settings > Environment Variables:

```env
SUPABASE_URL=https://pzxgkiqvnyydqauzdvgv.supabase.co
SUPABASE_REST_URL=https://pzxgkiqvnyydqauzdvgv.supabase.co/rest/v1
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
SUPABASE_STORAGE_BUCKET=Eugenia Lazaro Pintura - imagenes publicas
```

`SUPABASE_SECRET_KEY` must stay server-side only. Do not expose it as a `VITE_` variable.

## Database setup

Apply the migration in Supabase SQL Editor or through Supabase CLI:

```text
supabase/migrations/202607120001_gallery_storage_and_metadata.sql
```

It creates:

- `public.gallery_groups`
- `public.gallery_items`
- RLS read policies for public data
- the Storage bucket
- public read policy for gallery image objects
- MIME restrictions for JPG, PNG, and WebP

## Initial migration of current website images

After the SQL migration exists in Supabase, run:

```powershell
npm.cmd run supabase:seed-gallery
```

The script uploads every file referenced in `src/features/gallery/data/gallery.data.ts` from `public/images/gallery` into Supabase Storage, then upserts the metadata into Postgres.

## Runtime flow

Public website:

- calls `GET /api/gallery`
- receives only `published = true` images
- renders image URLs from Supabase Storage

Admin website:

- logs in with the current `/api/admin/login` cookie flow
- calls `GET /api/gallery?scope=admin`
- uploads images through `POST /api/gallery`
- edits metadata through `PATCH /api/gallery/:id`
- deletes rows and files through `DELETE /api/gallery/:id`

## Notes

The bucket is public for simple website rendering. Drafts are hidden by database filtering, but the underlying object can be reached by URL if somebody knows it. If true private drafts become necessary, the next step is switching to a private bucket and serving signed URLs through the API.
