
CREATE TABLE public.user_api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  function_name text NOT NULL,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  call_count integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, function_name, usage_date)
);

ALTER TABLE public.user_api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own usage" ON public.user_api_usage
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own usage" ON public.user_api_usage
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own usage" ON public.user_api_usage
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Service role function to check and increment usage (bypasses RLS)
CREATE OR REPLACE FUNCTION public.check_and_increment_api_usage(
  _user_id uuid,
  _function_name text,
  _daily_limit integer DEFAULT 20
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_count integer;
  _result jsonb;
BEGIN
  -- Try to insert or get current count
  INSERT INTO user_api_usage (user_id, function_name, usage_date, call_count)
  VALUES (_user_id, _function_name, CURRENT_DATE, 1)
  ON CONFLICT (user_id, function_name, usage_date)
  DO UPDATE SET call_count = user_api_usage.call_count + 1, updated_at = now()
  RETURNING call_count INTO _current_count;

  IF _current_count > _daily_limit THEN
    _result := jsonb_build_object('allowed', false, 'current_count', _current_count, 'daily_limit', _daily_limit);
  ELSE
    _result := jsonb_build_object('allowed', true, 'current_count', _current_count, 'daily_limit', _daily_limit);
  END IF;

  RETURN _result;
END;
$$;
