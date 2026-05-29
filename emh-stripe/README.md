# EMH Photography – Stripe Integration Guide

## Hvad du har fået

```
emh-stripe/
├── netlify.toml                        ← Netlify konfiguration
├── package.json                        ← Stripe dependency
├── netlify/
│   └── functions/
│       └── create-checkout.js          ← Serverless funktion (opretter Stripe session)
└── public/
    └── index.html                      ← Din hjemmeside (med Stripe checkout)
```

---

## Trin 1 — Hent din Stripe API-nøgle

1. Gå til [dashboard.stripe.com](https://dashboard.stripe.com)
2. Klik **Developers → API keys**
3. Kopiér din **Secret key** (starter med `sk_live_...` i live-mode)
   - Brug `sk_test_...` til at teste først

---

## Trin 2 — Upload til Netlify (første gang)

### Option A: Via Netlify Drop (nemmest, ingen konto nødvendig)
1. Gå til [app.netlify.com/drop](https://app.netlify.com/drop)
2. Træk **`public/`**-mappen ind på siden
3. Din side er live på f.eks. `https://random-name.netlify.app`

**NB:** Netlify Drop understøtter IKKE Functions. Brug Option B for fuldt setup.

### Option B: Via GitHub (anbefalet)
1. Opret et gratis repository på [github.com](https://github.com)
2. Upload alle filerne i `emh-stripe/`-mappen til repositoriet
3. Gå til [app.netlify.com](https://app.netlify.com) → **Add new site → Import from Git**
4. Forbind dit GitHub repo
5. Build settings (udfyldes automatisk fra `netlify.toml`):
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
6. Klik **Deploy site**

---

## Trin 3 — Tilføj Stripe-nøglen som environment variable

1. Gå til dit site på Netlify → **Site configuration → Environment variables**
2. Klik **Add a variable**
3. Key: `STRIPE_SECRET_KEY`
4. Value: Din secret key fra Stripe
5. Klik **Save**
6. Gå til **Deploys** → **Trigger deploy** for at genstarte med den nye variabel

---

## Trin 4 — Test betalingen

1. Åbn din Netlify URL
2. Tilføj et produkt til kurven
3. Klik **Gå til betaling**
4. Du bliver sendt til Stripe Checkout
5. Brug testkort: `4242 4242 4242 4242` · Udløb: `12/34` · CVC: `123`
6. Betalingen gennemføres og du sendes tilbage til hjemmesiden

---

## Trin 5 — Skift til live (rigtige betalinger)

1. I Stripe Dashboard: klik **Switch to live account** (øverst til højre)
2. Kopiér din **live secret key** (`sk_live_...`)
3. Opdatér environment variablen `STRIPE_SECRET_KEY` på Netlify
4. **Vigtigt:** Slet sandkasse-nøglen bagefter

---

## Hvad sker der teknisk?

```
Kunde klikker "Gå til betaling"
        ↓
JavaScript sender kurv-data til /.netlify/functions/create-checkout
        ↓
Netlify-funktionen opretter en Stripe Checkout Session via Stripe API
        ↓
Stripe returnerer en URL (buy.stripe.com/...)
        ↓
Kunden sendes til Stripe's betalingsside
        ↓
Kunden betaler → Stripe sender kunden tilbage til din side
```

---

## Ordrehåndtering

Stripe sender automatisk:
- **Kvittering** til kunden via email
- **Notifikation** til dig (sæt op under Stripe → Settings → Emails)

For at se alle ordrer: [dashboard.stripe.com/payments](https://dashboard.stripe.com/payments)

---

## Support

Fejl eller spørgsmål? Tjek:
- [Netlify Functions docs](https://docs.netlify.com/functions/overview/)
- [Stripe Checkout docs](https://stripe.com/docs/payments/checkout)
