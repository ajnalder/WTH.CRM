-- Backfill existing quotes with creator names from profiles
UPDATE public.quotes q
SET creator_name = p.full_name
FROM public.profiles p
WHERE q.user_id = p.id AND q.creator_name IS NULL;