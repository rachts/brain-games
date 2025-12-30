-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'username', new.email),
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.email)
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_stats (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan_type)
  VALUES (new.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
