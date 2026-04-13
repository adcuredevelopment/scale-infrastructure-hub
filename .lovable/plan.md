

# Fix Revolut Payout 401 + Affiliate Settings Tab

## Probleem 1: Payout 401 Error

**Oorzaak:** Twee bugs in `revolut-execute-payout/index.ts`:

1. **Verkeerde `iss` claim** (regel 323): De JWT `iss` is `uwncaohygevjvtgkazvv.supabase.co/functions/v1/revolut-execute-payout` maar Revolut verwacht exact het domein dat geregistreerd is bij de OAuth app: `uwncaohygevjvtgkazvv.supabase.co` (zoals in de werkende callback function).

2. **Verkeerde token URL** (regel 212): `${REVOLUT_BASE_URL}/../auth/token` resolveert naar `https://b2b.revolut.com/auth/token`. De werkende callback gebruikt `https://b2b.revolut.com/api/1.0/auth/token`.

**Fix:**
- Wijzig `iss` naar `uwncaohygevjvtgkazvv.supabase.co`
- Wijzig token URL naar `https://b2b.revolut.com/api/1.0/auth/token`
- Deploy en test de function

## Probleem 2: Affiliate Settings Tab

**Wat wordt gebouwd:**
Een "Settings" tab in het affiliate dashboard waar partners hun gegevens kunnen bijwerken:
- IBAN
- Company name
- KVK number
- VAT number
- Billing address

**Bestanden:**
1. **`src/components/affiliate/AffiliateSettings.tsx`** — Formulier met de huidige gegevens, edit en save functionaliteit
2. **`src/pages/affiliate/AffiliateDashboard.tsx`** — Tabs toevoegen (Dashboard | Settings) met de Tabs component
3. **`src/hooks/useAffiliate.ts`** — Extra velden ophalen uit de `affiliates` tabel (iban, company_name, kvk_number, vat_number, billing_address) + update functie toevoegen

**RLS:** Affiliates kunnen hun eigen record al lezen (bestaand beleid). Een UPDATE policy moet worden toegevoegd zodat affiliates hun eigen gegevens kunnen wijzigen (alleen specifieke kolommen).

**Database:** Migratie voor een RLS UPDATE policy op de `affiliates` tabel zodat `auth.uid() = user_id` kan updaten.

### Stappen
1. Fix de twee bugs in `revolut-execute-payout` en deploy
2. Database migratie: UPDATE policy voor affiliates
3. Bouw `AffiliateSettings.tsx` component
4. Update `useAffiliate.ts` met extra velden en update functie
5. Voeg tabs toe aan `AffiliateDashboard.tsx`

