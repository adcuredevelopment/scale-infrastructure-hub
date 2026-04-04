
ALTER TABLE public.affiliate_referrals
ADD COLUMN referral_type text NOT NULL DEFAULT 'recurring';

ALTER TABLE public.subscriptions
ADD COLUMN affiliate_code text;
