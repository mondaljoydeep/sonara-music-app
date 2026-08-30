
DROP POLICY IF EXISTS "Creators insert own songs" ON public.creator_songs;

CREATE POLICY "Creators insert own songs"
ON public.creator_songs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'creator'
  )
);
