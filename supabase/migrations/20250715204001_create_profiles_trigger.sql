CREATE    OR REPLACE FUNCTION public.handle_new_user () returns trigger language plpgsql security definer
SET       search_path = '' AS $$
BEGIN
INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
VALUES
  (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'role'
  );
RETURN NEW;
END;
$$;

CREATE    OR REPLACE TRIGGER on_auth_user_created
AFTER     insert ON auth.users FOR each ROW
EXECUTE   function public.handle_new_user ();