-- Artist follows table for tracking follower counts
CREATE TABLE public.artist_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  artist_slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, artist_slug)
);

CREATE INDEX idx_artist_follows_slug ON public.artist_follows(artist_slug);
CREATE INDEX idx_artist_follows_created ON public.artist_follows(created_at);

ALTER TABLE public.artist_follows ENABLE ROW LEVEL SECURITY;

-- Everyone can read follow counts (public stat)
CREATE POLICY "Anyone can view follows"
ON public.artist_follows
FOR SELECT
USING (true);

CREATE POLICY "Users can follow artists"
ON public.artist_follows
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow"
ON public.artist_follows
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);