

## Plan: Automatische Affiliate Payouts via Revolut Business API

### Huidige situatie
- Payouts worden handmatig aangemaakt (pending → processing → paid)
- Bij "paid" wordt een self-billing invoice gegenereerd en gemaild
- Revolut Business API OAuth is volledig geconfigureerd (private key, client ID, refresh token)
- Er is geen daadwerkelijke bankoverschrijving geïntegreerd

### Wat wordt gebouwd

**1. Nieuwe Edge Function: `revolut-execute-payout`**
- Ontvangt een `payoutId` van de admin
- Haalt affiliate IBAN en bedrag op uit de database
- Verkrijgt een access token via de refresh token + client assertion JWT (hergebruikt logica uit callback)
- Maakt een counterparty aan via Revolut Business API (of hergebruikt bestaande)
- Voert de betaling uit via `POST /api/1.0/pay`
- Slaat het Revolut transaction ID op in de database
- Geeft status terug aan de frontend

**2. Database wijziging: `affiliate_payouts` tabel uitbreiden**
- Nieuw veld `revolut_transaction_id` (text, nullable) om de Revolut betaling te traceren

**3. Frontend: AdminAffiliates payout flow aanpassen**
- Wanneer admin een payout op "processing" zet, wordt de `revolut-execute-payout` functie aangeroepen
- De flow wordt: **pending → processing (Revolut API call) → paid (na bevestiging)**
- Duidelijke feedback: loading state, foutmeldingen, en succes-melding met transaction ID
- Bij succesvolle Revolut betaling wordt de payout automatisch op "paid" gezet en invoice gegenereerd

### Technische details

**Revolut Business API endpoints gebruikt:**
- `POST /api/1.0/auth/token` — access token ophalen met refresh token
- `POST /api/1.0/counterparty` — bankrekening van affiliate registreren
- `POST /api/1.0/pay` — daadwerkelijke betaling uitvoeren

**JWT client assertion:** Hergebruik van de `generateClientAssertionJWT`, `importPrivateKey`, en `base64urlEncode` functies uit de callback function.

**Veiligheid:** Admin-only (JWT validatie + `has_role` check). IBAN-validatie voordat betaling wordt uitgevoerd.

### Stappen
1. Database migratie: `revolut_transaction_id` kolom toevoegen aan `affiliate_payouts`
2. Edge function `revolut-execute-payout` bouwen met Revolut API integratie
3. Frontend `AdminAffiliates.tsx` aanpassen: "Processing" knop roept de edge function aan
4. Deploy en testen

