CREATE OR REPLACE FUNCTION public.protect_affiliate_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
BEGIN
  IF current_setting('role') != 'service_role' 
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.status := OLD.status;
    NEW.affiliate_code := OLD.affiliate_code;
    NEW.email := OLD.email;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_affiliate_fields_trigger
BEFORE UPDATE ON public.affiliates
FOR EACH ROW EXECUTE FUNCTION public.protect_affiliate_fields();