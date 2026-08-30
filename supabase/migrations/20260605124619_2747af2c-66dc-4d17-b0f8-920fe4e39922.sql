
CREATE OR REPLACE FUNCTION public.prevent_creator_songs_restricted_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Changing song status is not allowed';
  END IF;
  IF NEW.plays IS DISTINCT FROM OLD.plays THEN
    RAISE EXCEPTION 'Changing plays is not allowed';
  END IF;
  IF NEW.likes IS DISTINCT FROM OLD.likes THEN
    RAISE EXCEPTION 'Changing likes is not allowed';
  END IF;
  IF NEW.ai_notes IS DISTINCT FROM OLD.ai_notes THEN
    RAISE EXCEPTION 'Changing ai_notes is not allowed';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_creator_songs_restricted_update() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS creator_songs_prevent_restricted_update ON public.creator_songs;
CREATE TRIGGER creator_songs_prevent_restricted_update
BEFORE UPDATE ON public.creator_songs
FOR EACH ROW EXECUTE FUNCTION public.prevent_creator_songs_restricted_update();
