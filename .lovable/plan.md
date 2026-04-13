

# Platform Analyse — Adcure Agency

## 1. SECURITY (Kritiek)

### 1.1 Webhook gebruikt `supabase` voor het declareren (BUG)
**Probleem:** In `revolut-webhook/index.ts` (regel 205) wordt `supabase` gebruikt voor subscription events VOORDAT de client is aangemaakt (regel 227-230). Dit crasht de functie bij SUBSCRIPTION_CANCELLED events.
**Impact:** Subscription cancellaties via webhook worden niet verwerkt — klanten blijven actief in de database terwijl ze opgezegd hebben.
**Oplossing:** Verplaats de `createClient` call naar boven de subscription event handling.

### 1.2 Contact formulier stuurt geen data
**Probleem:** `Contact.tsx` heeft een `handleSubmit` die alleen een `setTimeout` doet met een success toast — het formulier verstuurt niks. Geen data wordt opgeslagen of gemaild.
**Impact:** Alle contactverzoeken van potentiële klanten gaan verloren. Directe impact op conversie.
**Oplossing:** Formulierdata opslaan in database of versturen via transactional email.

### 1.3 Revolut Client ID hardcoded in edge function
**Probleem:** `revolut-execute-payout/index.ts` regel 8: `REVOLUT_CLIENT_ID` staat hardcoded in de code.
**Impact:** Laag risico (geen secret), maar maakt rotatie moeilijk en is slechte practice.
**Oplossing:** Verplaats naar een environment secret.

### 1.4 Affiliate registratie — race condition & geen foutafhandeling
**Probleem:** In `AffiliateRegister.tsx` (regel 57-84) wordt na `signUp` de affiliate-register function aangeroepen, maar als deze faalt wordt het genegeerd (`catch` logt alleen). De gebruiker denkt dat registratie succesvol was.
**Impact:** Affiliate accounts zonder affiliate records in de database. Geen referral tracking mogelijk.
**Oplossing:** Bij fout de gebruiker waarschuwen en retry aanbieden.

### 1.5 Database functies zonder `search_path` (Linter warnings)
**Probleem:** 4 database functies (`read_email_batch`, `delete_email`, `move_to_dlq`, `enqueue_email`) missen `SET search_path`.
**Impact:** Potentieel search_path hijacking (laag risico in deze context, maar moet gefixt worden).
**Oplossing:** Migratie om `SET search_path TO 'public'` toe te voegen aan deze functies.

### 1.6 Admin login — geen rate limiting of brute-force bescherming
**Probleem:** `AdminLogin.tsx` heeft geen client-side rate limiting. De `/admin/login` route is publiek toegankelijk.
**Impact:** Brute-force aanvallen op admin accounts.
**Oplossing:** Voeg client-side rate limiting toe + overweeg account lockout na X pogingen.

---

## 2. BUGS & FUNCTIONALITEIT

### 2.1 AdminOverview: `totalRevenue` is identiek aan `mrr`
**Probleem:** Regel 66-67 in `AdminOverview.tsx`: zowel `totalRevenue` als `mrr` berekenen exact hetzelfde — som van actieve subscriptions. Total Revenue zou historisch moeten zijn (alle betalingen ooit).
**Impact:** Admin ziet misleidende data. Total Revenue en MRR tonen hetzelfde getal.
**Oplossing:** Total Revenue berekenen uit `payments` tabel (status=completed), niet uit actieve subscriptions.

### 2.2 Payout flow: dubbele betaling mogelijk
**Probleem:** `handleUpdatePayoutStatus` (regel 216-258) en `handleExecuteRevolutPayout` (regel 192-214) zijn twee aparte flows. Een admin kan eerst "Pay via Revolut" klikken (automatisch → paid) en daarna handmatig ook op "paid" zetten, wat de invoice opnieuw genereert en referrals opnieuw update.
**Impact:** Dubbele invoices, potentieel dubbele betalingen.
**Oplossing:** Disable handmatige status-wijziging als er al een `revolut_transaction_id` is.

### 2.3 Webhook: duplicate subscriptions bij ORDER_COMPLETED
**Probleem:** Elke ORDER_COMPLETED in `revolut-webhook/index.ts` doet een `INSERT` in `subscriptions` (regel 294). Bij herhaalde webhooks (Revolut stuurt soms duplicates) worden er meerdere subscription records aangemaakt.
**Impact:** Opgeblazen subscription counts, onjuiste MRR berekeningen.
**Oplossing:** Gebruik `upsert` met `revolut_subscription_id` als unique constraint (die al bestaat), of check eerst of subscription al exists.

### 2.4 Payments pagina: geen paginatie
**Probleem:** `AdminPayments.tsx` laadt ALLE payments in één keer (`select("*")`). Geen server-side paginatie.
**Impact:** Bij groei (1000+ payments) raakt de pagina traag en wordt de Supabase 1000-row limiet bereikt — data verdwijnt.
**Oplossing:** Server-side paginatie implementeren met `range()`.

### 2.5 AdminAffiliates: cascade delete van referrals bij paid payouts
**Probleem:** Regel 249-253 in `AdminAffiliates.tsx`: bij "paid" worden referrals van cancelled klanten verwijderd (`DELETE`). Dit vernietigt historische data.
**Impact:** Audit trail verloren, earnings rapportage wordt inaccuraat.
**Oplossing:** Gebruik een soft-delete (status='cancelled') in plaats van harde delete.

---

## 3. PERFORMANCE

### 3.1 AdminOverview: 4 parallelle queries laden ALLE data
**Probleem:** Regel 49-54: `select("*")` op subscriptions, customers, payments (2x — eentje met limit 10, eentje alles). Bij schaal wordt dit extreem traag.
**Impact:** Trage dashboard load, hoog databasegebruik.
**Oplossing:** Gebruik database views of aggregatie-functies. Haal alleen benodigde kolommen op.

### 3.2 Sync function: N+1 query probleem
**Probleem:** `revolut-sync-orders/index.ts` doet per order individuele API calls naar Revolut (fetchRevolutSubscriptionStates, regel 145-167) EN per order individuele database queries.
**Impact:** Bij 500+ orders kan de sync function 60+ seconden duren en timeoutten.
**Oplossing:** Batch database operaties, beperk API calls met caching.

### 3.3 Geen lazy loading op admin routes
**Probleem:** Alle admin pagina's worden eager geladen in `App.tsx` (regel 30-40). Dit vergroot de initiële bundle voor ALLE bezoekers.
**Impact:** Langzamere FCP/LCP voor de publieke website.
**Oplossing:** `React.lazy()` + `Suspense` voor admin en affiliate routes.

---

## 4. UX/UI & CONVERSIE

### 4.1 Checkout dialog sluit bij fout
**Probleem:** `PricingSection.tsx` regel 142: `setSelectedPlan(null)` wordt aangeroepen VOORDAT de API call — het checkout dialog sluit meteen. Als er een fout is, moet de gebruiker opnieuw beginnen.
**Impact:** Frustratie, drop-off in checkout flow.
**Oplossing:** Houd het dialog open totdat de redirect naar Revolut plaatsvindt. Sluit alleen bij succes.

### 4.2 Geen error boundaries
**Probleem:** Geen enkele `ErrorBoundary` component in de applicatie. Een crash in één component brengt de hele app neer.
**Impact:** Witte pagina voor gebruikers bij onverwachte fouten.
**Oplossing:** Voeg error boundaries toe rond key secties (admin layout, checkout, affiliate dashboard).

### 4.3 Payment Success pagina — geen verificatie
**Probleem:** `PaymentSuccess.tsx` toont altijd "success" gebaseerd op URL parameters. Iedereen kan `/payment-success?plan=Growth` bezoeken.
**Impact:** Verwarring, mogelijkheid tot social engineering.
**Oplossing:** Verifieer de betaalstatus via de backend voordat het success scherm getoond wordt.

### 4.4 BTW alleen voor Nederland
**Probleem:** BTW (21%) wordt alleen geheven voor NL klanten. EU-klanten uit andere landen moeten mogelijk ook lokaal BTW betalen (afhankelijk van B2B/B2C en OSS drempel).
**Impact:** Potentieel niet-compliant met EU BTW regelgeving.
**Oplossing:** Review BTW compliance met een boekhouder. Overweeg BTW voor alle EU B2C klanten.

---

## 5. ARCHITECTUUR & SCHAALBAARHEID

### 5.1 Gedupliceerde business logic
**Probleem:** `handleAffiliateCommission` is volledig gedupliceerd in `revolut-webhook/index.ts` EN `revolut-sync-orders/index.ts`. Signup bonuses staan hardcoded op 3 plekken.
**Impact:** Bij wijziging van commissie-structuur moeten meerdere files aangepast worden — hoog risico op bugs.
**Oplossing:** Verplaats naar een shared module in `_shared/`.

### 5.2 JWT helpers gedupliceerd
**Probleem:** `generateClientAssertionJWT`, `importPrivateKey`, `base64urlEncode` staan in zowel `revolut-business-callback` als `revolut-execute-payout`.
**Impact:** Onderhoudslast, inconsistentie-risico.
**Oplossing:** Verplaats naar `_shared/revolut-auth.ts`.

---

## Prioritering (Top 5 acties)

| # | Issue | Ernst | Impact |
|---|-------|-------|--------|
| 1 | Webhook `supabase` undefined bug | Kritiek | Cancellaties worden niet verwerkt |
| 2 | Contact formulier stuurt niks | Hoog | Verloren leads = verloren omzet |
| 3 | Checkout dialog sluit voortijdig | Hoog | Drop-off in checkout conversie |
| 4 | TotalRevenue = MRR (verkeerde metric) | Medium | Misleidende admin data |
| 5 | Geen paginatie (1000 row limiet) | Medium | Data verdwijnt bij groei |

---

## Aanbevolen aanpak

**Fase 1 — Kritieke bugs fixen** (issues 1, 2, 3, 2.3)
**Fase 2 — Data-integriteit** (issues 2.1, 2.2, 2.5, 4.3)
**Fase 3 — Schaalbaarheid** (issues 3.1, 3.2, 3.3, 2.4)
**Fase 4 — Security hardening** (issues 1.3, 1.5, 1.6)
**Fase 5 — Architectuur cleanup** (issues 5.1, 5.2)

Wil je dat ik begin met Fase 1 — de kritieke bugs fixen?

