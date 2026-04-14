

# Launch Readiness Audit

## Verdict: Bijna klaar — 1 beveiligingsfix is nodig, rest is optioneel

---

## 1. Beveiliging (1 must-fix, 2 nice-to-have)

### MUST-FIX: Affiliates kunnen gevoelige velden wijzigen
De huidige UPDATE RLS policy op `affiliates` staat toe dat een affiliate **alle** kolommen kan wijzigen, inclusief `status`, `affiliate_code`, en `commission_rate`-gerelateerde velden. Een kwaadwillende affiliate zou zichzelf opnieuw kunnen activeren na schorsing.

**Fix:** Vervang de brede UPDATE policy door een restrictievere variant die alleen `iban`, `company_name`, `kvk_number`, `vat_number`, `billing_address`, en `display_name` toestaat via een database trigger of door de update via een Edge Function te laten lopen (zodat alleen specifieke velden worden doorgestuurd). De meest pragmatische aanpak is een validatie-trigger die wijzigingen op `status` en `affiliate_code` blokkeert tenzij de caller service_role is.

### Nice-to-have: Public bucket listing
De `email-assets` bucket staat directory listing toe. Geen gevoelige data, maar kan opgelost worden met een restrictievere SELECT policy.

### Nice-to-have: Leaked Password Protection (HIBP)
Momenteel niet ingeschakeld. Kan via `configure_auth` met `password_hibp_enabled: true`.

---

## 2. Functionaliteiten (alles werkt)

- Revolut payouts: werkend (net getest en succesvol uitgevoerd)
- Invoice generatie: werkend met storage policies
- Affiliate registratie, dashboard, settings: compleet
- Admin panel (overview, subscriptions, payments, customers, analytics, affiliates, settings): compleet
- Publieke pagina's (homepage, pricing, product pages, legal pages): compleet
- Referral tracking via `?ref=` parameter: werkend
- Transactionele e-mails met queue systeem: werkend

---

## 3. Design (geen blokkerende issues)

Het design is consistent met de dark theme en glass-morphism stijl. Responsive layouts zijn aanwezig met carousel fallbacks op mobile. Geen gebroken layouts gevonden.

---

## Implementatieplan (alleen de must-fix)

### Stap 1: Database migratie — Validatie trigger op `affiliates`
Maak een trigger `before UPDATE` op `affiliates` die wijzigingen op `status` en `affiliate_code` blokkeert wanneer de huidige role niet `service_role` is en de gebruiker geen admin is. Dit voorkomt privilege escalation zonder de bestaande RLS policy te hoeven verwijderen.

```sql
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
```

Dit is de enige wijziging die nodig is voor een veilige launch.

