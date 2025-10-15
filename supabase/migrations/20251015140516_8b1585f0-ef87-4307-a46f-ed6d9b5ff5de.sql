-- Fix remaining SECURITY DEFINER functions missing SET search_path
-- =====================================================

CREATE OR REPLACE FUNCTION public.admin_get_all_midias()
RETURNS TABLE(id uuid, user_id uuid, user_email text, user_name text, tipo_arquivo text, url_arquivo text, nome_arquivo text, tamanho_bytes bigint, data_envio timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    m.id,
    m.user_id,
    p.email,
    p.full_name,
    m.tipo_arquivo,
    m.url_arquivo,
    m.nome_arquivo,
    m.tamanho_bytes,
    m.data_envio
  FROM public.midia_usuarios m
  LEFT JOIN public.profiles p ON p.id = m.user_id
  WHERE public.is_admin_user()
  ORDER BY m.data_envio DESC;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.athlete_stories
  WHERE expires_at <= now();
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_submission(p_submission_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id
  FROM participation_submissions
  WHERE id = p_submission_id;

  UPDATE participation_submissions
  SET status = 'approved'
  WHERE id = p_submission_id;

  INSERT INTO user_ranking_points (user_id, total_points, peneiras_completed)
  VALUES (v_user_id, 10, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_ranking_points.total_points + 10,
    peneiras_completed = user_ranking_points.peneiras_completed + 1,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_active_stories(target_user_id uuid)
RETURNS TABLE(id uuid, user_id uuid, file_path text, file_name text, mime_type text, story_type text, duration integer, caption text, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (role = 'admin' OR subscription_tier IN ('mensal', 'premium'))
  ) AND auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Premium access required to view stories';
  END IF;

  RETURN QUERY
  SELECT 
    s.id,
    s.user_id,
    s.file_path,
    s.file_name,
    s.mime_type,
    s.story_type,
    s.duration,
    s.caption,
    s.created_at
  FROM public.athlete_stories s
  WHERE s.user_id = target_user_id
    AND s.expires_at > now()
  ORDER BY s.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_participation_submission(submission_id uuid, admin_comment text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  submission_record RECORD;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can approve submissions';
  END IF;

  SELECT * INTO submission_record 
  FROM public.participation_submissions 
  WHERE id = submission_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found or already processed';
  END IF;

  UPDATE public.participation_submissions
  SET 
    status = 'approved',
    admin_id = auth.uid(),
    admin_comment = approve_participation_submission.admin_comment,
    points_awarded = 10,
    updated_at = now()
  WHERE id = submission_id;

  INSERT INTO public.user_ranking_points (user_id, total_points, peneiras_completed)
  VALUES (submission_record.user_id, 10, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_ranking_points.total_points + 10,
    peneiras_completed = user_ranking_points.peneiras_completed + 1,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_participation_submission(submission_id uuid, admin_comment text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can reject submissions';
  END IF;

  UPDATE public.participation_submissions
  SET 
    status = 'rejected',
    admin_id = auth.uid(),
    admin_comment = reject_participation_submission.admin_comment,
    updated_at = now()
  WHERE id = submission_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found or already processed';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_participation_submissions_for_admin()
RETURNS TABLE(id uuid, user_id uuid, user_name text, user_email text, peneira_id uuid, peneira_name text, image_url text, comment text, status text, admin_comment text, points_awarded integer, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can view submissions';
  END IF;

  RETURN QUERY
  SELECT 
    ps.id,
    ps.user_id,
    p.full_name,
    p.email,
    ps.peneira_id,
    pen.name,
    ps.image_url,
    ps.comment,
    ps.status,
    ps.admin_comment,
    ps.points_awarded,
    ps.created_at,
    ps.updated_at
  FROM public.participation_submissions ps
  LEFT JOIN public.profiles p ON p.id = ps.user_id
  LEFT JOIN public.peneiras pen ON pen.id = ps.peneira_id
  ORDER BY ps.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.realizar_sorteio(p_month_year text)
RETURNS TABLE(user_id uuid, user_name text, premio text, cupons integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  premios TEXT[] := ARRAY[
    '1 ano de assinatura grátis',
    'Chuteiras profissionais',
    'Camisa oficial do clube',
    'Camisa oficial do clube',
    'Kit Merch Peneira Fácil',
    'Kit Merch Peneira Fácil',
    'Kit Merch Peneira Fácil',
    'Kit Merch Peneira Fácil',
    'Kit Merch Peneira Fácil',
    'Kit Merch Peneira Fácil',
    'Kit Merch Peneira Fácil',
    'Kit Merch Peneira Fácil',
    'Kit Merch Peneira Fácil',
    'Kit Merch Peneira Fácil'
  ];
  total_cupons INT;
  sorteados UUID[] := '{}';
  premio_idx INT;
  selected_user UUID;
  selected_name TEXT;
  selected_cupons INT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Apenas admins podem realizar sorteios';
  END IF;

  CREATE TEMP TABLE tmp_cupons (user_id UUID, cupons INTEGER);
  
  INSERT INTO tmp_cupons (user_id, cupons)
  SELECT sp.user_id, FLOOR(sp.points / 10) as cupons
  FROM public.sorteio_pontos sp
  WHERE sp.month_year = p_month_year 
    AND sp.points >= 10;
  
  total_cupons := (SELECT COALESCE(SUM(cupons), 0) FROM tmp_cupons);
  
  IF total_cupons = 0 THEN
    RAISE EXCEPTION 'Nenhum cupom válido para o mês %', p_month_year;
  END IF;

  FOR premio_idx IN 1..array_length(premios, 1) LOOP
    WITH weighted_selection AS (
      SELECT 
        tc.user_id,
        p.full_name,
        tc.cupons,
        random() * tc.cupons as weighted_random
      FROM tmp_cupons tc
      JOIN public.profiles p ON p.id = tc.user_id
      WHERE tc.user_id <> ALL(sorteados)
      ORDER BY weighted_random DESC
      LIMIT 1
    )
    SELECT ws.user_id, ws.full_name, ws.cupons 
    INTO selected_user, selected_name, selected_cupons
    FROM weighted_selection ws;
    
    EXIT WHEN selected_user IS NULL;
    
    sorteados := array_append(sorteados, selected_user);
    
    user_id := selected_user;
    user_name := selected_name;
    premio := premios[premio_idx];
    cupons := selected_cupons;
    
    RETURN NEXT;
  END LOOP;
  
  DROP TABLE tmp_cupons;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_all_points()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can reset points';
  END IF;

  DELETE FROM public.user_ranking_points;
  DELETE FROM public.sorteio_pontos;

  INSERT INTO public.admin_audit_log (
    user_id,
    action,
    table_name,
    record_id,
    new_data,
    created_at
  ) VALUES (
    auth.uid(),
    'RESET_ALL_POINTS',
    'user_ranking_points',
    null,
    '{"action": "reset_all_points", "message": "All points reset to zero"}'::jsonb,
    now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_participation_submission(p_submission_id uuid, p_admin_id uuid DEFAULT auth.uid())
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_photo_url TEXT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can approve submissions';
  END IF;

  SELECT user_id, photo_url INTO v_user_id, v_photo_url
  FROM participation_submissions
  WHERE id = p_submission_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found or already processed';
  END IF;

  UPDATE participation_submissions
  SET 
    status = 'approved',
    reviewed_by = p_admin_id,
    reviewed_at = now(),
    points_awarded = 10
  WHERE id = p_submission_id;

  INSERT INTO user_ranking_points (user_id, total_points, peneiras_completed)
  VALUES (v_user_id, 10, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_ranking_points.total_points + 10,
    peneiras_completed = user_ranking_points.peneiras_completed + 1,
    updated_at = now();

  INSERT INTO sorteio_pontos (user_id, month_year, points)
  VALUES (v_user_id, to_char(now(), 'YYYY-MM'), 10)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET 
    points = sorteio_pontos.points + 10,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_participation_submission(p_submission_id uuid, p_rejection_reason text DEFAULT NULL::text, p_admin_id uuid DEFAULT auth.uid())
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can reject submissions';
  END IF;

  UPDATE participation_submissions
  SET 
    status = 'rejected',
    reviewed_by = p_admin_id,
    reviewed_at = now(),
    rejection_reason = p_rejection_reason
  WHERE id = p_submission_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found or already processed';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_peneira_submission(submission_id uuid, admin_comment text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  submission_record RECORD;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can approve submissions';
  END IF;

  SELECT * INTO submission_record 
  FROM public.participation_submissions 
  WHERE id = submission_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found or already processed';
  END IF;

  UPDATE public.participation_submissions
  SET 
    status = 'approved',
    admin_id = auth.uid(),
    admin_comment = approve_peneira_submission.admin_comment,
    points_awarded = 10,
    updated_at = now()
  WHERE id = submission_id;

  INSERT INTO public.user_ranking_points (user_id, total_points, peneiras_completed)
  VALUES (submission_record.user_id, 10, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_ranking_points.total_points + 10,
    peneiras_completed = user_ranking_points.peneiras_completed + 1,
    updated_at = now();

  INSERT INTO public.sorteio_pontos (user_id, month_year, points)
  VALUES (submission_record.user_id, to_char(now(), 'YYYY-MM'), 10)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET 
    points = sorteio_pontos.points + 10,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_peneira_submission(submission_id uuid, admin_comment text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can reject submissions';
  END IF;

  UPDATE public.participation_submissions
  SET 
    status = 'rejected',
    admin_id = auth.uid(),
    admin_comment = reject_peneira_submission.admin_comment,
    updated_at = now()
  WHERE id = submission_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found or already processed';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_peneira_submissions_for_admin()
RETURNS TABLE(id uuid, user_id uuid, user_name text, user_email text, peneira_id uuid, peneira_name text, local_image_url text, selfie_image_url text, comment text, status text, admin_comment text, points_awarded integer, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can view submissions';
  END IF;

  RETURN QUERY
  SELECT 
    ps.id,
    ps.user_id,
    p.full_name,
    p.email,
    ps.peneira_id,
    pen.name,
    ps.local_image_url,
    ps.selfie_image_url,
    ps.comment,
    ps.status,
    ps.admin_comment,
    ps.points_awarded,
    ps.created_at,
    ps.updated_at
  FROM public.participation_submissions ps
  LEFT JOIN public.profiles p ON p.id = ps.user_id
  LEFT JOIN public.peneiras pen ON pen.id = ps.peneira_id
  ORDER BY ps.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_monthly_ranking()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can reset ranking';
  END IF;

  DELETE FROM public.user_ranking_points;
  DELETE FROM public.sorteio_pontos;

  INSERT INTO public.admin_audit_log (
    user_id,
    action,
    table_name,
    record_id,
    new_data,
    created_at
  ) VALUES (
    auth.uid(),
    'MONTHLY_RESET_RANKING',
    'user_ranking_points',
    null,
    '{"action": "monthly_reset", "message": "Monthly automatic ranking reset"}'::jsonb,
    now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_email_submission(p_submission_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can approve submissions';
  END IF;

  SELECT user_id INTO v_user_id
  FROM public.sent_peneiras_submissions
  WHERE id = p_submission_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found or already processed';
  END IF;

  UPDATE public.sent_peneiras_submissions
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE id = p_submission_id;

  INSERT INTO public.user_ranking_points (user_id, total_points, peneiras_completed)
  VALUES (v_user_id, 10, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_ranking_points.total_points + 10,
    peneiras_completed = user_ranking_points.peneiras_completed + 1,
    updated_at = now();

  INSERT INTO public.sorteio_pontos (user_id, month_year, points)
  VALUES (v_user_id, to_char(now(), 'YYYY-MM'), 10)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET 
    points = sorteio_pontos.points + 10,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_email_submission(p_submission_id uuid, p_reason text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can reject submissions';
  END IF;

  UPDATE public.sent_peneiras_submissions
  SET 
    status = 'rejected',
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE id = p_submission_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found or already processed';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_ranking_submission(submission_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  submission_record RECORD;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can approve submissions';
  END IF;

  SELECT * INTO submission_record 
  FROM public.ranking_submissions 
  WHERE id = submission_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found or already processed';
  END IF;

  UPDATE public.ranking_submissions
  SET 
    status = 'approved',
    updated_at = now()
  WHERE id = submission_id;

  INSERT INTO public.user_ranking_points (user_id, total_points, peneiras_completed)
  VALUES (submission_record.athlete_id, 10, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_ranking_points.total_points + 10,
    peneiras_completed = user_ranking_points.peneiras_completed + 1,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_referrals_for_admin()
RETURNS TABLE(id uuid, referrer_name text, referrer_email text, referred_name text, referred_email text, referral_code text, status text, referrer_reward_given boolean, referred_reward_given boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can view referrals';
  END IF;

  RETURN QUERY
  SELECT 
    r.id,
    p1.full_name as referrer_name,
    p1.email as referrer_email,
    COALESCE(p2.full_name, 'Usuário não cadastrado') as referred_name,
    r.email_referred as referred_email,
    r.referral_code,
    r.status,
    r.referrer_reward_given,
    r.referred_reward_given,
    r.created_at,
    r.updated_at
  FROM public.referrals r
  LEFT JOIN public.profiles p1 ON p1.id = r.referrer_id
  LEFT JOIN public.profiles p2 ON p2.id = r.referred_id
  ORDER BY r.created_at DESC;
END;
$$;

-- Recreate public_athlete_profiles as a regular view (not security definer)
DROP VIEW IF EXISTS public.public_athlete_profiles;
CREATE VIEW public.public_athlete_profiles AS
SELECT 
  id,
  full_name,
  position,
  biography,
  is_athlete,
  city,
  state,
  photo_url,
  instagram
FROM public.profiles
WHERE is_athlete = true;

GRANT SELECT ON public.public_athlete_profiles TO authenticated, anon;