# Email Capture & CRM Options for Health in the Spirit

Research date: **2026-08-29**. Every claim is either cited to a live source or marked **[verified]** where it was
checked empirically against a live endpoint with `curl`/`dig` on the research date. Pricing and free-tier limits
change without notice — re-verify anything load-bearing before acting on it a year from now.

**Situation this document is written against:**

- ~9 published episodes, under 500 Instagram followers, **list size today is effectively zero**
- Two-person team (Dr. Ryan and Annie DeNome) with very little time
- Static Astro site on Cloudflare Workers — no server, no PHP, no database
- Substack planned later for daily reflections plus a paid community
- Funnel: Instagram comment "pod" → DM → landing page → email capture → **nurture sequence** → paid community
- **The nurture sequence (automated drip) is the make-or-break feature**, not broadcasts
- The user already runs **Mautic** and **Brevo** for The Wellness Way Mason (chiropractic clinic).
  Adding a *fourth* tool is a real cost. Consolidation is weighted heavily throughout.

---

## 0. TL;DR

**Recommendation: Brevo free plan, on the existing Brevo account, as a separate list + separate sending identity.**

The single fact that decides this: Brevo's free plan **includes multi-step marketing automation, capped at
2,000 contacts**. That is the drip sequence, for $0, and 2,000 contacts is far beyond where this list will be
for a long time. Almost every competing free tier either excludes sequences outright (Kit, Beehiiv, Substack)
or caps the list well below Brevo's automation ceiling.

Second fact: the user **already pays attention to Brevo**. Zero new vendors, zero new logins, zero new
maintenance surface.

**Do not stand up Mautic for this.** See §2.6 — it is a server, a database, and a cron daemon whose failure
mode is silent, in exchange for capabilities this list will not need at 500 or even 5,000 contacts.

---

## 1. Brevo — deep dive

### 1.1 Brevo restructured its plans, and most 2026 blog posts are stale

This matters, because the third-party comparison articles that dominate search results still describe the old
**Free / Starter / Business / Enterprise** lineup. The live pricing page now serves:

| Plan | Monthly (USD) | Annual (USD) |
|---|---|---|
| Free | $0 | $0 |
| Starter | $9/mo | $96.96/yr |
| Standard | $18/mo | $194.04/yr |
| Professional | $499/mo | $5,388.96/yr |
| Enterprise | Custom | Custom |

**[verified]** Extracted from the embedded JSON payload of <https://www.brevo.com/pricing/> on 2026-08-29
(the page is a Next.js app; the plan objects are in the `self.__next_f` payload, e.g.
`{"id":"standard","name":"Standard","price":"18","period":"MON","currency":"USD"}`).

"Business" is gone; **"Standard" ($18/mo) is its successor**, and a new **"Professional" tier sits at $499/mo** —
a very large jump. Anything a blog post says about "Brevo Business" should be read as "Standard".

### 1.2 The automation question — answered, and the answer has a trap in it

**Marketing automation IS available on the free plan, limited to 2,000 contacts. That is still true in 2026.**

From Brevo's own feature comparison table at <https://www.brevo.com/pricing/see-all-features> **[verified]**,
the row reads across the five plan columns (Free / Starter / Standard / Professional / Enterprise):

| Row | Free | Starter | Standard | Professional | Enterprise |
|---|---|---|---|---|---|
| Multichannel marketing automation | **Limited to 2,000 contacts** | **Limited to 2,000 contacts** | Unlimited | Unlimited | Unlimited |
| Workflow editor | ✅ | ✅ | ✅ | ✅ | ✅ |
| Real time event triggers | ✅ | ✅ | ✅ | ✅ | ✅ |
| Multiple entry points | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pathway reporting | ✅ | ✅ | ✅ | ✅ | ✅ |
| Multi-branch testing | ❌ | ❌ | ❌ | ✅ | ✅ |

Brevo's own tooltip for the row: automations are described as multi-step journeys connecting email, SMS and more.
An older 4-column version of the same table still present in the page markup agrees exactly
("Marketing automation | Up to 2,000 contacts | Up to 2,000 contacts | Unlimited | Unlimited").

**The trap:** the $9 Starter plan does **not** lift the 2,000-contact automation cap — it is still
"Limited to 2,000 contacts". Paying $9 buys send volume, not automation headroom. The first plan that
removes the cap is **Standard at $18/mo**. So the upgrade path is **Free → $18 Standard**, and $9 Starter is
a trap tier for this specific use case. Budget accordingly.

### 1.3 Free plan, precisely

| Attribute | Free plan |
|---|---|
| Send limit | **300 emails/day** (campaigns + transactional combined) |
| Monthly cap | None — the limit is purely daily |
| Reset | Daily; unused sends do **not** roll over |
| Contact storage | Up to **100,000 contacts** |
| Marketing automation | ✅ **capped at 2,000 contacts** |
| Custom signup forms | ✅ |
| Double opt-in | ✅ |
| Advanced segmentation | ✅ |
| Contact timeline | ✅ |
| Web & event tracking | ✅ |
| Transactional email (API/SMTP) | ✅ |
| API access | ✅ |
| Outbound webhooks / Zapier | ✅ |
| GDPR compliance tooling | ✅ |
| Brevo branding in email footer | **Present, and cannot be removed on Free** (add-on on Starter; included from Standard) |
| A/B testing | ❌ |
| Landing pages | ❌ (1 page from Standard) |
| Click heatmaps / geo reports | ❌ |
| Users | Single user |

Sources: feature matrix at <https://www.brevo.com/pricing/see-all-features> **[verified]**;
daily-limit and account-approval behaviour per Brevo's own FAQ
<https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan>.

**Sending requires account approval.** Brevo's pricing-page FAQ states that a new account starts on the Free
plan for uploading contacts, and that sending up to 300/day begins *once Brevo approves the account for
sending* **[verified]** (FAQ text in the pricing page payload: "Once we approve your account for sending, you
can start sending up to 300 emails per day"). Budget a short review delay before the first send — do not
schedule a launch email for the same day the account is created.

**300/day in practice.** At 500 subscribers a single broadcast is 500 emails — that exceeds the daily cap and
Brevo will spill it across days or block it. This is the real ceiling on the free plan, and it binds
*earlier than the 2,000-contact automation cap*. Drip sequences are fine (they trickle a few sends per day),
but a single blast to the whole list stops working somewhere around 300 subscribers.

### 1.4 Does Brevo include a real CRM?

Yes — Brevo bundles a genuine sales CRM ("Sales Essentials"), and a free tier of it is included. From the same
official comparison table **[verified]**, the free CRM column gives:

- **Open deals: limited to 50**; **pipelines: limited to 1**
- Notes & files ✅, task management & reminders ✅, booking pages ✅, in-browser video calling ✅
- Mailbox synchronization: limited to 1; connected calendars: limited to 1
- Live chat ✅ (chatbot scenarios ❌)
- Contact timeline ✅, unlimited custom fields ✅, unlimited companies ✅
- Sales automation ❌, multi-user ❌, Instagram DMs ❌ (paid), Facebook Messenger ❌ (paid)

For a podcast this is more CRM than needed. It is genuinely useful for one thing: **tracking the Instagram DM →
landing page conversations** as deals/notes if they ever want to. Note Instagram DM integration is a *paid*
CRM feature, so the DM step of the funnel stays manual on free.

### 1.5 Forms, and whether a static site can POST directly

**Yes, and the site's existing component already works with it unchanged.**

Brevo hosts form endpoints at:

```
https://{account-id}.sibforms.com/serve/{form-id}
```

Brevo expects some hidden fields alongside `email` — notably `email_address_check` (a honeypot, submitted
empty), `locale`, and `html_type`.
Source: <https://help.brevo.com/hc/en-us/articles/208771869-Create-a-sign-up-form-in-Brevo> and
<https://www.create.net/support/brevo>.

Two integration paths, both viable with no server:

**(a) Plain HTML form POST — no JavaScript, no CORS involved.** A native `<form method="post" action="…">`
submission is a *navigation*, not a scripted request, so the same-origin policy does not apply and CORS is
irrelevant. The visitor lands on Brevo's own confirmation page. This works on a fully static site.

**(b) `fetch()` from the page — also works, because Brevo sends permissive CORS headers.**
**[verified]** An `OPTIONS` preflight against a live `sibforms.com/serve/…` endpoint with
`Origin: https://healthinthespirit.com` returned:

```
HTTP/2 200
access-control-allow-origin: https://healthinthespirit.com
access-control-allow-credentials: true
access-control-allow-methods: GET,DELETE,OPTIONS,PATCH,POST,PUT
access-control-allow-headers: Content-Type,Content-Disposition,Origin,Accept,x-csrf-token,x-xsrf-token
vary: Origin
```

The origin is **reflected**, and `Accept` and `Content-Type` are both in the allowed-headers list. That is
exactly what `src/components/NewsletterForm.astro` already sends (`fetch(form.action, { method: 'POST',
body: new FormData(form), headers: { Accept: 'application/json' } })`), so the in-place success message will
work rather than falling back to a full-page redirect.

**This means adopting Brevo is a one-line change** — set `newsletter.formAction` in
`src/content/settings/site.json` to the Brevo serve URL. The component is already provider-agnostic and
`newsletterLive` flips automatically once the value stops starting with `PLACEHOLDER`.

### 1.6 Contacts API, and using it from a Cloudflare Worker

- **Endpoint:** `POST https://api.brevo.com/v3/contacts`
- **Auth:** an `api-key` request header. **[verified]** — a keyless POST returns
  `{"message":"authentication not found in headers","code":"unauthorized"}`.
- **Body fields:** `email`, `attributes` (object), `listIds` (list of longs), `updateEnabled` (boolean —
  set `true` to upsert rather than error on an existing contact), `emailBlacklisted`, `ext_id`.
- **Double opt-in has its own endpoint:** `POST /contacts/doubleOptinConfirmation`, taking `includeListIds`,
  `templateId` and `redirectionUrl`.

Source: <https://developers.brevo.com/reference/createcontact> and
<https://developers.brevo.com/reference/create-doi-contact> **[verified]**.

**Security note — this one matters.** The API *does* permit browser calls: **[verified]** an `OPTIONS`
preflight to `https://api.brevo.com/v3/contacts` with `Origin: https://healthinthespirit.com` returned
`access-control-allow-origin: https://healthinthespirit.com` and
`access-control-allow-headers: api-key,content-type`. **Do not take that as permission.** A Brevo API key is
account-wide — the same key that adds a contact can read the entire contact database and send mail. Putting it
in client-side JavaScript publishes it. If the API is used at all, it belongs in a **Cloudflare Worker** with
the key stored as a Worker secret, exactly like the existing `worker/decap-oauth.js` pattern.

For this project the API is **not needed** — the plain form endpoint (§1.5) is simpler and has no secret to
leak. Reach for the Worker only if a custom form flow, server-side validation, or Turnstile is wanted later.

### 1.7 Double opt-in, GDPR, CAN-SPAM

- Forms built in Brevo have a native **"Double confirmation"** toggle that sets up DOI without any automation
  workflow: <https://help.brevo.com/hc/en-us/articles/360019540880-Create-a-custom-double-opt-in-DOI-email-template-for-a-sign-up-form-created-in-Brevo>
- For forms built *outside* Brevo, DOI is implemented as an automation:
  <https://help.brevo.com/hc/en-us/articles/27353832123026-Set-up-a-double-opt-in-process-for-a-sign-up-form-created-outside-of-Brevo>.
  **Note the interaction with the free tier:** that route consumes the automation feature, which is capped at
  2,000 contacts on Free. Using a *Brevo-hosted* form endpoint avoids this, since the native toggle is a form
  setting rather than an automation.
- GDPR compliance tooling is marked available on every plan including Free in the official matrix **[verified]**.
- Unsubscribe links are inserted by Brevo in marketing campaigns; one-click unsubscribe is part of what the
  bulk-sender rules now require (see §5).

**Recommendation: turn double opt-in on.** With a list starting at zero and traffic arriving from Instagram
DMs, DOI costs a few percent of signups and buys a clean list and a defensible consent record. It is much
harder to repair a reputation than to protect one.

### 1.8 Deliverability in 2026

Brevo sends from **shared IP pools** on all lower tiers; a dedicated IP is an add-on and is realistically a
Professional-tier concern. Independent testing puts Brevo's overall inbox placement in the high-80s to low-90s
percent, with **Gmail placement noticeably weaker than the overall average** — which matters here, because a
Christian-wellness podcast audience will skew heavily Gmail.

Sources: <https://www.emailtooltester.com/en/reviews/brevo/pricing/>,
<https://www.inboxeagle.com/esp-insights/brevo/>, <https://encharge.io/brevo-deliverability/>.

**Label: partially verified.** These are third-party test panels, not Brevo's own figures, and inbox-placement
studies vary a lot by methodology and sending domain. Treat "Brevo is mid-tier on shared IPs, and Gmail is the
weak spot" as the durable takeaway rather than any specific percentage.

The practical mitigation is entirely in the user's hands and matters more than the ESP choice at this size:
authenticate the domain properly (§5), use double opt-in, mail people who actually asked, and keep the list
clean. A 500-person engaged list will outperform the shared-pool average.

### 1.9 Brevo as an SMTP relay (relevant to the Mautic question)

Brevo also sells plain SMTP relay, which is how Mautic would send if it were used:

- Host `smtp-relay.brevo.com`; ports 587 or 2525 (STARTTLS), or 465 (SSL/TLS)
- Username = the Brevo account login email; password = a generated **SMTP key**, which is a *different
  credential from the API key*
- Sources: <https://developers.brevo.com/docs/smtp-integration>,
  <https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP>,
  <https://help.brevo.com/hc/en-us/articles/10905415650322-Which-SMTP-port-should-I-use-Port-587-465-or-2525>

**The catch for a Mautic-over-Brevo design:** the free plan's cap is labelled in Brevo's own pricing table as
**"Daily email volume (campaigns & transactional)"** **[verified]** — campaigns and transactional/relay traffic
share the *same* 300/day budget. Relaying Mautic through a free Brevo account does not add sending capacity;
it just spends the same 300 from a second application, and it would be shared with the clinic's traffic if the
same account is used.

---

## 2. Mautic — the self-hosted option they already run

