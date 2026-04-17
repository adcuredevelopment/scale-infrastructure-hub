

User wants invoice PDF redesign:
1. Fix € symbol spacing (currently `€95.59` looks like `€95.59` glued — likely the bullet/encoding issue with Helvetica + euro char). Need a font that renders € properly with space, or add explicit space.
2. Remove "Payment status: PAID" green box entirely
3. Fill company details: KVK 89821211, TAX ID NL003924266B58
4. Refresh design overall — more premium/minimal

The € rendering issue: pdf-lib's StandardFonts.Helvetica uses WinAnsi encoding which DOES support €, but the symbol can render visually tight. I'll add a thin space `€ 95.59` and also consider a cleaner layout.

Plan:

# Plan: Redesign Customer Invoice PDF

## Wijzigingen in `generate-customer-invoice/index.ts`

### 1. Bedrijfsgegevens invullen
```ts
const COMPANY = {
  name: 'Adcure Agency',
  addressLines: ['The Netherlands'],
  email: 'support@adcure.agency',
  kvk: '89821211',
  vat: 'NL003924266B58',
}
```

### 2. Euro spacing fix
Aanpassen `fmtMoney`: `€ 95.59` (spatie tussen symbool en bedrag) zodat het niet meer aan elkaar plakt.

### 3. "Payment status: PAID" box verwijderen
Hele groene status-box weghalen. Vervangen door subtiele tekstregel "Paid via Revolut" onder de totals, of helemaal weglaten — kies voor minimal: kleine grijze regel rechts onder total: `Paid via Revolut · {date}`.

### 4. Design refresh (premium minimal)
- **Header**: logo links, rechts groot "INVOICE" met onder elkaar invoice nr + datum in kleinere grijze tekst
- **Accent kleur**: dunne donkere lijn (1px, #111827) onder header ipv niets
- **From/Bill to**: 2-koloms blok met luchtige typografie, KVK/VAT klein onder bedrijfsnaam
- **Items tabel**: lichtere header bar, meer padding, bedragen rechts uitgelijnd
- **Totals**: rechts uitgelijnd blok, TOTAL groter (14pt) met dunne lijn erboven
- **Footer**: gecentreerd "Thank you for your business" + contact info onderaan in lichte grijs

### 5. Versie suffix
Bestaande facturen niet hergenereren — alleen nieuwe facturen krijgen het nieuwe design. Admin kan via "Generate Invoice" knop oude opnieuw genereren als nodig.

## Bestanden
- **Aangepast**: `supabase/functions/generate-customer-invoice/index.ts`
- **Deploy**: edge function redeploy nodig

## QA
Na deploy: één testfactuur genereren via admin "Generate Invoice" knop op een bestaande betaling, PDF downloaden en visueel checken (€-spacing, KVK/VAT zichtbaar, geen groene box).

