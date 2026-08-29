# Health in the Spirit — Community & Monetization Strategy

**Prepared:** August 2026
**For:** Dr. Ryan DeNome & Annie DeNome
**Current state:** ~9 episodes on Transistor → Apple/Spotify. Funnel = IG post → comment "pod" → DM → website → tap to Apple/Spotify. No email capture. Substack planned at 500 IG followers.

---

## TL;DR — the five decisions

1. **Paid community platform: Substack (paid tier + Chat), with bonus audio published as paid Substack podcast posts.** #2 is **Ghost Pro (Publisher) + Transistor's native Ghost members integration** — switch to it when recurring revenue passes roughly **$300–600/mo**. Patreon is #3: same 10% cut as Substack, but you never own the email list.
2. **Tier ladder: Free / $8 per month / $200 per year founding.** Deliberately *two* paid price points, not three. Everything in the $8 tier is a by-product of work already being done.
3. **The single highest-leverage product is "After the Mic"** — 15–20 minutes of unedited husband-and-wife debrief recorded in the same sitting as each episode. Near-zero marginal effort, and it is the one thing that cannot be gotten free.
4. **Fix the funnel before building the community.** Today the DM sends people to Apple/Spotify — a dead end that captures nothing. It must send them to a dedicated landing page that trades a lead magnet for an email address. Email capture is worth more right now than the paid tier.
5. **Email platform: MailerLite.** Free to 250 subscribers, then ~$12/mo — and critically, it includes real automation on every plan. Kit's free plan looks more generous (10,000 subscribers) but **excludes email sequences entirely**, and the nurture sequence is the whole point.

**Do not launch a paid community yet.** At ~9 episodes and <500 IG followers there is not enough audience to convert. Build the list for 90 days first. Realistic first paid cohort: 20–40 members. Section 7 has the sequencing.

---

## 0. What was verified vs. inferred

Everything in Section 1 (platform pricing) and Section 6 (email pricing) was fetched or searched in August 2026 and is cited. Section 2 separates **[OBSERVED]** tier data pulled from live pages from **[INFERRED]** patterns. Sections 3–5 are original recommendations built on that evidence — they are judgment, not observation, and are labeled as such.

Pricing changes constantly. Re-verify Substack's 10% and MailerLite's tiers before signing anything.

---

## 1. Platform comparison for a paid community

### 1.1 The fee landscape at a glance

| Platform | Fixed cost | Platform cut | Payment processing | Real multi-tier? | Native private podcast feed? |
|---|---|---|---|---|---|
| **Substack** | $0 | **10%** | Stripe 2.9% + $0.30 | Partial (paid + founding only) | **Yes**, automatic per-subscriber RSS |
| **Patreon** | $0 | **10% flat** (new creators, post-Aug 4 2025); legacy 5/8/12% | 2.9% + $0.30 (≥$3); 5% + $0.10 under $3 | Yes, unlimited tiers | **Yes**, members-only RSS |
| **Circle.so** | **$89/mo** (Professional, annual) | 2% (Prof) / 1% (Business) | Stripe 2.9% + $0.30 | Yes | No — needs external host |
| **Skool** | $9/mo (Hobby) or **$99/mo (Pro)** | 10% (Hobby) / **2.9% + $0.30** (Pro) | included above | Weak — one group, one price | No |
| **Kajabi** | **$179/mo** (Basic) | 0% w/ Kajabi Payments; **5%** on Basic if you use your own Stripe | 2.9% + $0.30 (Kajabi Payments, Basic) | Yes | No |
| **Locals** | $0 | **10%** subs/tips; **20%** on Content+ | Stripe, varies | Limited | Limited |
| **Discord + Ko-fi** | $0, or $6/mo Ko-fi Gold | **5%** free plan → **0%** with Gold | Stripe/PayPal | Yes (Ko-fi tiers + Discord roles) | No — needs Transistor |
| **Self-hosted (Stripe + Astro/Cloudflare)** | ~$0–5/mo | **0%** | 2.9% + $0.30, **+0.5–0.7%** if you use Stripe Billing | Anything you build | Only if you build it |
| *(Reference)* **Ghost Pro Publisher** | **$29/mo** (annual) | **0%** | Stripe 2.9% + $0.30 | Yes | **Yes**, native Transistor integration |
| *(Reference)* **Memberful** | $0 / **$25/mo** Pro | **10%** free / **4.9%** Pro | Stripe 2.9% + $0.30 | Yes | **Yes** |

Sources: [Substack](https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost), [Patreon fees](https://www.schoolmaker.com/blog/patreon-pricing), [Circle](https://www.schoolmaker.com/blog/circle-so-pricing), [Skool](https://kourses.com/skool-pricing/), [Kajabi](https://kourses.com/kajabi-pricing/), [Locals](https://support.locals.com/en/article/how-much-does-locals-charge-u7tcux/), [Ko-fi](https://www.ruzuku.com/learn/articles/ko-fi-pricing), [Stripe](https://stripe.com/pricing), [Ghost](https://thatmarketingbuddy.com/pricing/ghost), [Memberful](https://memberful.co/pricing).

### 1.2 Platform-by-platform

#### Substack — paid tier + Chat
**Fees:** 10% of subscription revenue + Stripe 2.9% + $0.30. Zero fixed cost; you pay nothing until you turn on paid. On a $10/mo subscriber you net roughly **$8.41**.
**What you actually get:** a full publication (the daily reflections you already planned), native podcast hosting with automatic per-subscriber private RSS for paid episodes, Chat (a threaded group space that can be paywalled to paid or founding-only), Notes for discovery, an iOS app, and a subscriber list you can export as CSV at any time. Free subscribers see only free episodes in their feed; paid episodes appear only in the paid subscriber's private feed.
**Effort:** lowest of any option on this list. One account, one editor, one payment setup. No separate community tool to seed and moderate.
**Fit for a two-person team:** excellent. It is one login, and Annie can run the publishing side entirely from a phone.
**Private podcast handling:** best-in-class for the effort. Publish a bonus episode, mark it paid, and every paying subscriber's private RSS updates automatically — no manual adding or removing of subscribers, and no Transistor plan upgrade required for the bonus feed.
**The real limitation:** Substack supports monthly, annual, and a **founding** tier — it does not support two genuinely different paid content tiers the way Patreon does. Chat can be gated to founding-only, which gets you a functional two-tier ladder, but do not plan on three differentiated content tiers here.
**Second limitation:** the 10% never goes away. At $3,000/mo that is $300/mo forever.

#### Patreon
**Fees:** creators who joined after **August 4, 2025 pay a flat 10%**. Legacy creators are on Lite 5% / Pro 8% / Premium 12%. Processing is 2.9% + $0.30 on pledges of $3+, or 5% + $0.10 on micro-pledges under $3. Paid RSS feeds for podcasts require the Pro tier for legacy creators.
**What you get:** genuine unlimited tiers, per-tier gating, members-only RSS (each member gets a private authorized link), Discord role sync, annual billing, and — importantly for this niche — **audience familiarity**. Catholic and Christian podcast listeners already have Patreon accounts (see Section 2).
**Effort:** low. Tier setup is the only real work, plus fulfilling any physical perks you promise (don't).
**Fit:** good, but it is a *funding* platform, not a publishing platform. The daily-reflections plan does not live here well.
**Private podcast handling:** native and solid.
**Why it is #3:** you pay the same 10% as Substack but you do not own the email list in any meaningful way, and Patreon is a weak newsletter tool. **[UNVERIFIED — check before committing]** Patreon's move to Apple in-app purchase means iOS-app signups may carry Apple's 15–30% cut on top; confirm current handling directly with Patreon.

#### Circle.so
**Fees:** Professional **$89/mo** (annual billing) with a 2% transaction fee; Business $199/mo at 1%. No free plan, 14-day trial. Add-ons stack fast: Email Hub $99/mo, branded emails $40/mo, extra admin seats $10/mo each, extra spaces $20/mo per 10.
**What you get:** a genuinely good, modern community product — spaces, events, live rooms, courses, mobile app.
**Effort:** **high**. Circle is a room you have to fill. An empty Circle is worse than no Circle, and a two-person team publishing weekly does not have the hours to drive daily discussion.
**Fit:** poor at this stage. $89/mo is $1,068/year before you have a single member, and you would need ~11 members at $8 just to break even on the platform.
**Private podcast:** none. You would still pay Transistor and hand out feeds manually.
**Verdict:** revisit at 500+ paying members. Not now.

#### Skool
**Fees:** Hobby **$9/mo** with a 10% transaction fee; Pro **$99/mo** with **2.9% + $0.30**. Annual: $90 and $990. Pro becomes the cheaper plan above roughly **$1,268/mo** in member billing. Both tiers get unlimited members, courses, video, and live calls.
**What you get:** a gamified feed, a classroom module, a calendar, and one strong idea — simplicity.
**Effort:** moderate. Like Circle, it lives or dies on daily engagement.
**Fit:** Skool's culture is business/coaching/"make money online." A Catholic health show would be an odd fit tonally, and Skool's structural constraint — essentially **one group at one price** — kills the tier ladder.
**Private podcast:** none.
**Verdict:** no.

#### Kajabi
**Fees:** Basic **$179/mo** ($143 annual), Growth $249, Pro $499. The Kickstarter plan ($89/mo) was pulled from public pricing in January 2026. 0% platform fee if you use Kajabi Payments (2.9% + $0.30 on Basic), but **5% on Basic if you bring your own Stripe**.
**What you get:** an all-in-one course/funnel/email/site platform.
**Effort:** high, and it is the wrong shape. Kajabi is built for launching $497 courses, not running a $8/mo community.
**Fit:** poor. $179/mo means you need ~28 members at $8 just to cover the tool.
**Verdict:** no. Revisit only if the business becomes "we sell a $600 protocol course," which is a different business.

#### Locals
**Fees:** **10%** on subscriptions, one-time transactions and tips; **20%** on one-time Content+ purchases. App-store signups (Apple/Google/Amazon/Roku) carry an additional **15–30%**.
**What you get:** a simple creator community with posts, comments, livestreams and a supporter feed. Owned by Rumble.
**Effort:** low.
**Fit:** the fee math is worse than Substack for a subscription business, the email list is not really yours, and the platform's political identity carries brand baggage that a health-and-faith show broadening from Catholic to "Christian" probably does not want attached. Matt Fradd's presence there is a Fradd-specific audience decision, not a template.
**Private podcast:** limited.
**Verdict:** no.

#### Discord + Ko-fi
**Fees:** Ko-fi charges **0% on tips**, **5% on memberships/shop/commissions** on the free plan, or **$6/mo Ko-fi Gold** to drop that to **0%**. Gold pays for itself above ~$120/mo in membership revenue. Discord is free. Ko-fi has a native Discord integration that grants supporter roles automatically.
**What you get:** the cheapest possible stack. At $1,000/mo you would pay $6 + Stripe (~$59) and keep ~$935 — better than any other option here.
**Effort:** **deceptively high**. Discord is a 24/7 firehose. It is a young, tech-literate, always-on medium, and moderating it is a real job. It is also a poor fit for the likely demographic here — Catholic and Christian wellness audiences skew toward women 30–55 who are on Instagram and Facebook, not Discord.
**Private podcast:** none. You'd bolt on Transistor and manage feeds by hand.
**Verdict:** cheapest on paper, most expensive in hours. No.

#### Self-hosted (Stripe + Cloudflare/Astro)
**Fees:** Stripe 2.9% + $0.30, plus **0.5–0.7% of billing volume if you use Stripe Billing** for the subscription layer. Cloudflare Pages/Workers is effectively free at this scale. Platform cut: 0%.
**What you get:** exactly what you build, and 100% ownership. You already have the Astro + Cloudflare Pages + Decap CMS stack running at `healthinthespirit.com`, so the foundation exists.
**Effort:** **very high, and ongoing**. You would be building and maintaining: Stripe Checkout, webhooks, a customer portal, auth/magic links, content gating, private RSS token generation and revocation, dunning for failed cards, and tax handling. That is weeks of work up front and a permanent maintenance obligation. Every hour spent on it is an hour not spent making episodes.
**Fit:** poor *now*, defensible later. The 10% Substack takes only becomes worth engineering around somewhere north of $5,000/mo.
**Verdict:** no. Keep the Astro site as the marketing and funnel front door — which is exactly what it is good at — and let someone else run billing.

### 1.3 The money math

Assumes an $8/mo core tier with some annual and founding members mixed in, averaging **$10/member/month**.

| Members / MRR | Substack net | Ghost Pro net | Patreon net | Circle net |
|---|---|---|---|---|
| 50 / $500 | **$420** (10% = $50, Stripe $30) | **$442** ($29 fixed, Stripe $30) | $420 | $322 ($89 fixed) |
| 150 / $1,500 | **$1,262** (fees $239) | **$1,353** ($29 + Transistor +$30 + Stripe $89) | $1,262 | $1,113 |
| 300 / $3,000 | **$2,523** (fees $477) | **$2,764** | $2,523 | $2,521 |

**Break-even between Substack and Ghost:** roughly **$290/mo** in revenue while you are under 50 private-podcast subscribers, and roughly **$590/mo** once you need Transistor's Professional plan ($49/mo, 500 private subscribers) to serve the private feed. Below that, Substack's 10% is genuinely cheaper than anyone's monthly fee. Above ~$1,500/mo, staying on Substack costs about $1,100/year in avoidable fees; above $3,000/mo, about $2,900/year.

Transistor's plans, for reference: Starter $19/mo (20K downloads, **50 private subscribers**), Professional $49/mo (100K, **500 private subscribers**), Business $99/mo (250K, 3K private subscribers). Twelve months for the price of ten on annual billing.

### 1.4 Recommendation

> ### #1 — Substack (paid tier + paywalled Chat), bonus audio as paid Substack podcast posts
>
> **Why:** it costs nothing until it earns something; it is one tool instead of three; it is the tool you were already going to adopt for daily reflections; and it solves the private podcast feed with zero ongoing labor — publish, mark paid, done. No manually adding and removing subscribers from Transistor every time someone joins or churns. For a two-person team with a clinic to run and limited hours, the operational simplicity is worth more than the 10%.
>
> Keep the public show on Transistor exactly as it is. Substack hosts only the bonus audio.
>
> **The one thing to accept:** you get a paid tier and a founding tier, not three content tiers. Section 3's ladder is designed around that constraint on purpose.

> ### #2 — Ghost Pro (Publisher, $29/mo annual) + Transistor's native Ghost integration
>
> **Why:** **0% platform fee** — you keep everything but Stripe's cut — plus real multi-tier memberships, your own domain, and a first-class members-only podcast integration built specifically with Transistor. Select an audience per podcast ("all members" or "paid members only") and access is granted on upgrade and revoked on cancellation automatically. It is the same zero-labor private feed as Substack, without the 10%.
>
> **Why not first:** it is a migration and a monthly bill before you have proof anyone will pay. Ghost has no Substack Notes equivalent, so you lose the discovery surface that matters most when you are small.
>
> **Trigger to switch:** when recurring revenue clears **~$600/mo** and holds for three consecutive months. Migrating from Substack to Ghost is a well-trodden path and your subscriber list exports cleanly.

**#3 — Patreon**, if audience familiarity turns out to matter more than list ownership. It is the default in this niche and conversion may be higher purely from recognition. Same 10%. Reconsider it if list-building on Substack stalls.

---

## 2. What Christian & health podcasts actually sell

### 2.1 Observed tiers and prices

#### The Catholic Talk Show — Patreon **[OBSERVED]**
Full ladder, pulled from their own Patreon landing page:

| Tier | Price | What you get |
|---|---|---|
| Angel | **$5/mo** | Exclusive Zoom hangouts with the hosts; invitations to in-person meetups at Catholic sites |
| Archangels | **$10/mo** | Vocations chaplet bracelet + official coffee mug |
| Patron Saint | **$25/mo** | Bracelet, mug, official hoodie |
| Apostles | **$50/mo** | All above + St. Benedict rosary, holy water from Lourdes, St. Dismas holy medal |
| Cardinals | **$100/mo** | All above + suggest an episode topic, photo on the set wall |
| Bobblehead | (unlisted) | All above + custom bobblehead of the patron, set of 6 saint bobbleheads |

Scale: **~609–668 paid members**, ~494–516 exclusive posts.

**Read this carefully, because it is a trap.** The Catholic Talk Show's ladder is almost entirely **physical merchandise**. That is a fulfillment business — sourcing, warehousing, packing, shipping, replacing lost mail — bolted onto a podcast. Do not copy it. A two-person team with a clinic cannot ship rosaries. Note also that their *entry* tier is the only digital one, and its perks are **access** (Zoom, meetups), not content.

#### The Holy Post — Patreon ("Holy Post Plus") **[OBSERVED]**
Five tiers: **$5 / $10 / $25 / $50 / $100 per month**.
- **$5** — Basic: the exclusive-shows bundle (*The Skyepod*, *Getting Schooled*, *66 Verses That Explain the Bible*), bonus interviews, behind-the-scenes, book club, recurring segments ("Know Your Heresies," "My Hill to Die On").
- **$10** — adds ad-free listening and *With God Daily*, plus a **free copy of each quarter's book club book**, with the author joining a live stream for Q&A.
- **$25** — swag and books.
- **$50** — Insider. **$100** — All Access.

This is the **better template**. The value is *more shows*, produced with the same skills and gear they already use. Note where the price step actually bites: **ad-free at $10** and a **quarterly physical book** — one shipment every three months, not a per-member bundle.

#### Abiding Together — Patreon **[OBSERVED]**
Membership starts at **$15/mo**, with a free join option. **~1,551 total members, ~680 paid.** Patrons at **$150/mo** for 3+ months receive a free Abiding Together journal. The show is three Catholic women in conversation — the closest structural comparison to a two-host relational show in this space.

The number that matters: **680 paid members × $15 = roughly $10,000/mo gross.** Note the free-to-paid ratio — about **44% of members are paid** (though "members" here means people who joined the Patreon at all, not total listeners, so the real listener→paid rate is far lower).

#### Pints With Aquinas / Matt Fradd — Locals **[OBSERVED]**
Effectively a **single tier at $15/mo**: access to all content, ability to comment and post, participation in livestreams and chats, supporter-only posts. Direct messaging with Matt requires support **above $10/mo**. There is no elaborate ladder — one price, plus access to the host as the premium feature.

**The lesson:** the most successful Catholic creator community in the space monetizes **access to the host**, not artifacts.

#### Ascension Press — app subscription **[OBSERVED]**
**$8.95/mo or $59.95/yr** (~$8.99/$59.99 in app stores). Free tier keeps Bible and Catechism text, daily readings and reflections, some podcasts, and rosary recordings. Paid unlocks study plans, Lectio Divina, Bible Answers, Bible studies, and podcast companions.

**This is the single most relevant price point in this document.** Ascension is the dominant Catholic media brand, and it has landed on **$9/mo with $60/yr as the anchor**. Your audience's mental model of "what a Catholic digital subscription costs" is set here.

#### Hallow **[OBSERVED]**
**$10.99/mo, $69.99/yr**, Friends & Family $119.99/yr for six. **Exodus 90:** $90 upfront or $29.99/mo × 3, renewing at $90/yr; student Exodus+ $19/yr.

Two more datapoints confirming the same band, and Exodus 90 proves something important: **Catholics will pay $90 for a 90-day structured challenge with a start date and an end date.** That is a product, not a subscription, and it converts on a different psychology.

#### Christian health & functional-medicine creators **[PARTIALLY OBSERVED]**
- **Refined Wellness** (Christian functional medicine + nervous system regulation for women of faith) — tiered membership, price gated behind a Teachable checkout and **not publicly listed**. Includes: a "Decoding Your Body Blueprint" workshop, self-paced modules on gut health, hormone balance and sleep, new content quarterly, curated articles/videos/PDF guides, a faith-filled women's community, and group calls with an integrative somatic practitioner. Access is revoked on cancellation.
- **Christian Functional Medicine Academy** — practitioner training, not consumer membership; bundles a live monthly mentorship program.
- **General functional-medicine memberships** for comparison: Tendwell **$175/mo**; 360 Health Wellness **$125/mo** with a 3-month minimum.

**The gap this reveals:** Christian functional-medicine offerings cluster at either **$0 (podcast)** or **$125–175/mo (clinical care)**. There is very little at **$8–20/mo**. Nobody has built the "$10/mo Christian health *media* community" well. That is the opening.

- **Well-Fed Women** (Noelle Tarr) — repeated searches surfaced **no public Patreon or paid tier**. Treat as: not currently a useful comp.

### 2.2 The patterns worth stealing **[INFERRED]**

1. **$5 is the floor, $10–15 is the real price.** Every observed Christian community sits at $5 entry with the substantive tier at $10–15. Ascension and Hallow anchor the category at **$9–11/mo, $60–70/yr**.
2. **The single most common paid deliverable is more audio.** Holy Post sells extra shows. Catholic Talk Show sells exclusive posts. This is the cheapest thing for a podcast to make and the thing listeners most want.
3. **Ad-free is a real, cheap upgrade lever** — Holy Post puts it at the $10 step. You have no ads yet, which means you have a free upgrade lever in reserve for later.
4. **Access to the host is the top-value perk** at every price point: Zoom hangouts at $5 (Catholic Talk Show), DMs above $10 (Fradd), live author streams at $10 (Holy Post).
5. **Physical merchandise appears everywhere and is almost always a mistake** for small teams. Catholic Talk Show can ship because they have volume and staff. Holy Post ships **one book per quarter**, which is a defensible cadence. Abiding Together gates its journal at **$150/mo** — effectively pricing fulfillment out of reach of ordinary members. That is the smart pattern: put physical goods so high they are rare.
6. **Annual pricing is standard and heavily used** — a ~2 months free discount is the norm.
7. **Free tiers exist and matter.** Abiding Together, Ascension, and Hallow all keep a substantial free layer. Free members are the top of the funnel, not lost revenue.
8. **The liturgical calendar is a proven conversion event.** Exodus 90 at $90 and CMF CURO's Lenten daily-reflection-plus-wellness-challenge format both demonstrate that seasonal, dated, finite programs sell in this audience. **[OBSERVED for existence, INFERRED for conversion efficacy.]**

### 2.3 Benchmark reality check
Industry data suggests premium podcast subscriptions land at **$4–15/mo**, and that subscriptions account for about **9% of podcast revenue** overall. One frequently-cited figure claims ~20% of *subscribers* opt into paid tiers — treat that with heavy skepticism; it measures people already on a list, not listeners. **Plan on 2–5% of an engaged email list converting to paid**, and be delighted if it is higher.

---

## 3. The tier ladder for Health in the Spirit

### 3.1 Design principles

1. **Two paid price points, not three.** Substack supports paid + founding. Three content tiers would also triple the weekly production burden. Resist.
2. **Everything in the core tier must be a by-product**, not a new project. If it requires a separate production session, it does not belong in the weekly tier.
3. **Price at $8/mo, $80/yr.** Just under the Ascension anchor ($8.95), which makes you feel like obvious value against the category's reference price rather than a premium ask from an unknown show.
4. **The founding tier is where access lives.** Live time with Ryan and Annie is your scarcest resource — it must be gated behind the highest price, not the lowest.

### 3.2 The ladder

#### FREE — *"The Parish"*
The audience-building layer. Costs you nothing incremental.

- Weekly episode, public, on Apple/Spotify/YouTube via Transistor
- **Three free reflections per week** on Substack (Mon / Wed / Fri) — short, 200–400 words, one saint or scripture + one physical practice
- Monthly **Saint of the Month** post — free, and your best shareable asset
- The lead magnet (Section 5) and any seasonal free challenge kickoff
- Full show notes and transcripts on healthinthespirit.com
- Read-only view of the paid Chat (they see the conversation, they cannot join it — this is the single most effective upgrade prompt Substack offers)

#### $8/mo or $80/yr — *"The Household"*
The core tier. Target: 80% of paid members here.

| Deliverable | Cadence | Where it comes from | Net new time |
|---|---|---|---|
| **"After the Mic"** — 15–20 min unedited debrief, private podcast feed | Weekly | Recorded immediately after the main episode, same setup, same sitting. Publish raw. | **~20 min** |
| **"Ask the Doc"** thread in paywalled Chat | Weekly | Ryan answers 5–8 member questions in one sitting. Clinical knowledge he already has. | **~30 min** |
| **Episode Companion** — one-page "practice this week" PDF | Weekly | Derived from the transcript and show notes you already produce | **~20 min (Annie)** |
| **Daily reflections**, all 7 days (vs. 3 free) | Daily | You planned to write these anyway; 4 of 7 simply go behind the wall | 0 |
| **72-hour early access** to each episode | Weekly | Scheduling change only | 0 |
| **Saint of the Month protocol** — 1-page PDF pairing the saint with one physiological theme and one practice | Monthly | Ryan's clinical framing + Annie's design | **~90 min/mo** |
| **Seasonal challenge access** (Advent, Lent, Easter, Ordinary Time reset) | 4×/yr | Built once, re-run annually | See §4 |
| **Prayer intention thread** — members post, you pray | Weekly | Annie posts the thread; members fill it | **~10 min** |

**Total net-new weekly load: roughly 80 minutes across two people.** Plus ~90 minutes once a month. That is the entire point of this design.

#### $200/yr founding — *"The Guild"*
Target: 10–15% of paid members. Everything above, plus:

- **Monthly live Zoom** — 60 minutes, Ryan and Annie together, member Q&A / office hours. Recorded and posted for founders who miss it. **One hour a month.**
- **Founders-only Chat channel** — smaller room, priority questions, direct access
- **Quarterly protocol deep-dive** — one substantial downloadable guide per quarter (sleep, gut, thyroid, kids' health, fertility & cycle). Built once, sold forever, reused as a standalone product later.
- **Priority question queue** — founders' questions go to the front of "Ask the Doc" and are the ones most likely to become episode segments
- **Named in the show credits**, and **prayed for by name** in a monthly intention
- **Annual gift, mailed once a year** — a blessed medal or holy card of the year's patron saint. One shipping day per year, not a monthly obligation. (This is the Abiding Together pattern: gate physical goods behind the top tier so fulfillment stays rare.)

**Why $200/yr and not $20/mo:** annual-only removes monthly churn management, front-loads cash, and self-selects for committed members. It also positions the tier as a *patronage* decision rather than a subscription decision, which is how this audience actually thinks about supporting ministry.

### 3.3 What is deliberately NOT in the ladder

- **Monthly physical merchandise.** You do not have a fulfillment operation. Do not build one.
- **A course.** A course is a launch, and a launch is a project. Later, and only if the protocol library sells.
- **1:1 consults or anything resembling individualized care.** See §8.
- **A Discord.** See §1.2.
- **A third mid-tier.** It would cannibalize both ends and triple the work.

---

## 4. Community offer ideas, ranked

Scored on **Value to member (1–5)** × **Effort to produce (1 = trivial, 5 = heavy)**. Ranked by Value ÷ Effort — highest leverage first. "Reuse" flags work that already exists.

### Tier A — build these first (score ≥ 2.5)

| # | Offer | V | E | Score | Notes |
|---|---|---|---|---|---|
| 1 | **"After the Mic"** — 15–20 min unedited post-episode debrief on the private feed. Unpolished on purpose: the disagreements, the tangent you cut, what Annie actually thinks about what Ryan just said. | 5 | 1 | **5.0** | Reuse: same session, same gear. The flagship. |
| 2 | **Member prayer intention board** + a monthly Mass or family rosary offered for members by name | 5 | 1 | **5.0** | Members generate the content. Deepest loyalty driver per minute spent. |
| 3 | **Read-only paid Chat visible to free members** | 4 | 1 | **4.0** | Not a perk — a conversion mechanism. Free users watch the room they can't enter. |
| 4 | **"One Thing This Week"** — single-page episode companion: the practice, the scripture, the saint, one line to journal | 4 | 1 | **4.0** | Reuse: generated from the transcript. |
| 5 | **Ad-free + 72-hour early access** | 3 | 1 | **3.0** | Costs a scheduling toggle. Hold ad-free in reserve until you actually have ads. |
| 6 | **"Bring your question to the show"** — members submit; the best becomes an on-air segment | 4 | 1 | **4.0** | Solves your content pipeline and rewards members simultaneously. |
| 7 | **"Ask Annie"** — a separate weekly thread for the household side: feeding kids real food, cooking on a Friday, the practical marriage-and-health friction | 4 | 1 | **4.0** | Gives Annie an owned surface. Critically: it is *not* clinical, so it carries no compliance risk. |
| 8 | **Weekly "Ask the Doc" thread** — Ryan answers 5–8 general-education questions in one sitting | 5 | 2 | **2.5** | Reuse: clinical knowledge. **Read §8 before launching this.** |
| 9 | **Saint of the Month health focus** — one saint, one physiological system, one practice, one prayer (e.g. Hildegard → gut & botanicals; Cosmas & Damian → discernment in medical decisions; Gemma Galgani → chronic illness) | 5 | 2 | **2.5** | Reuse: you already publish saint content on the site. Your single most distinctive brand asset. |
| 10 | **Q&A archive, tagged by condition & searchable** | 4 | 2 | **2.0** | Compounding: worth nothing in month 1, worth the whole membership by month 18. Requires only disciplined tagging. |

### Tier B — high value, real but manageable effort (score 1.3–2.0)

| # | Offer | V | E | Score | Notes |
|---|---|---|---|---|---|
| 11 | **"Examen of the Body"** — a 5-minute guided audio adapting the Ignatian examen to physical stewardship: where did I honor this body today, where did I neglect it, what does tomorrow need | 4 | 2 | **2.0** | Recorded once, used forever. Doubles as your best lead magnet (§5). Genuinely novel — nobody else has this. |
| 12 | **"Lab of the Month"** — how to read one common marker, what ranges actually mean, what to ask your doctor | 4 | 2 | **2.0** | Reuse: Ryan explains this daily in clinic. Extremely high perceived value. |
| 13 | **Prayer + habit tracker** — printable monthly page pairing a devotional practice with a physical one, laid out on the liturgical month | 4 | 2 | **2.0** | Built once as a template, re-skinned monthly. Highly shareable on IG. |
| 14 | **"What we actually use"** — an honest, reasoned list of the supplements/products in the DeNome house, with the *why*, and affiliate relationships disclosed plainly or refused outright | 4 | 2 | **2.0** | The most-asked question in health media. Refusing affiliate money here is itself a brand asset. |
| 15 | **Annie's kitchen** — one real family recipe + 60-second video per week | 4 | 2 | **2.0** | Reuse: dinner is already happening. Feeds the Shorts pipeline too. |
| 16 | **Feast day feasting guide** — how to actually *feast* well after fasting, which almost nobody teaches | 4 | 2 | **2.0** | Distinctive. Fasting content is everywhere; feasting content is not. |
| 17 | **Monthly live Zoom Q&A / office hours** | 5 | 3 | **1.7** | The founding-tier anchor. One hour a month. |
| 18 | **40-day liturgical challenges** — *Fast Well* (Lent), *Rest Well* (Advent), *Move Well* (Easter's 50 days), *Reset Well* (January / Ordinary Time) | 5 | 3 | **1.7** | Built once, re-run every year — effort amortizes to near zero by year two. Exodus 90 proves the demand. |
| 19 | **"Saints who suffered"** — a limited audio series on chronic illness, disability, and the theology of suffering (Gemma Galgani, Bernadette, Damien of Molokai, Thérèse) | 5 | 3 | **1.7** | The deepest thing you could make. Speaks to the listener no wellness podcast speaks to: the one who did everything right and is still sick. |
| 20 | **Downloadable protocol library** — sleep, gut reset, "labs to ask for," postpartum recovery, kids' fevers, perimenopause | 5 | 3 | **1.7** | Reuse: clinical knowledge. Founding-tier quarterly deliverable; later a standalone product. |
| 21 | **Cycle & nutrition track** — NFP-adjacent, Annie-led, charting-aware | 5 | 3 | **1.7** | Underserved and unmistakably on-brand for a Catholic-rooted health show. Big draw for the likely core demographic. |
| 22 | **Fasting-tradition meal plans** — Friday abstinence, Ember Days, Lenten weeks, the Nativity fast | 5 | 4 | **1.3** | High value, genuinely laborious. Build ONE (Lent), reuse annually, expand only if it lands. |
| 23 | **Marriage & health module** — praying and eating as a couple, the two-person household as the unit of health | 4 | 3 | **1.3** | You are a married couple; this is your unfair advantage. |
| 24 | **Kids & family quick-answers vault** | 4 | 3 | **1.3** | Sustained demand from the core demographic. Compounds like #10. |

### Tier C — later, or only if asked for (score < 1.3)

| # | Offer | V | E | Score | Notes |
|---|---|---|---|---|---|
| 25 | **Seasonal "Household Reset" cohort** — 4 weeks, twice a year (January + September), with a start date and a finish line | 5 | 4 | **1.3** | Sell as a $49–90 standalone. Exodus 90 pricing psychology. Do this only once the community is stable. |
| 26 | **Live rosary or watch-along before an episode drops** | 3 | 2 | **1.5** | Lovely, low-cost, but demands a fixed weekly time slot. |
| 27 | **Member directory by state/diocese** — finding local practitioners and friends | 3 | 3 | **1.0** | Only valuable past ~200 members. Carries a real referral-liability question. |
| 28 | **Annual founding-member gift** — blessed medal or holy card of the year's patron | 3 | 4 | **0.8** | One shipping day per year. Keep it at that. |
| 29 | **Custom merchandise line** | 2 | 5 | **0.4** | The Catholic Talk Show trap. Do not. |

### The four to launch with
If you build nothing else in the first 60 days: **#1 After the Mic**, **#8 Ask the Doc**, **#9 Saint of the Month**, **#2 Prayer board**. That is a complete, defensible $8/mo product and it costs under 90 minutes a week.

---

## 5. The funnel

### 5.1 What is broken now

The current path is: IG post → comment "pod" → DM with a website link → tap through to Apple/Spotify.

The failure is at the end. **Apple and Spotify are terminal nodes.** Once someone taps into a podcast app, you have permanently lost the ability to contact them, you cannot measure whether they listened, and you cannot invite them to anything ever again. You are spending your scarcest resource — the attention of someone who *raised their hand* — to acquire an anonymous listener.

Every step of the fix is about one thing: **get the email address before you hand off the listen link.**

### 5.2 The corrected funnel

```
IG Reel / post ("comment POD")
        ↓
ManyChat comment-to-DM  ──→  public comment reply (required by Meta)
        ↓
DM #1: the hook + a question that requires a reply
        ↓  (member replies — opens the 24-hour messaging window)
DM #2: single link → healthinthespirit.com/start
        ↓
Landing page: lead magnet ⇄ email address   ← THE ONLY GOAL OF THIS PAGE
        ↓
MailerLite: instant delivery of the lead magnet
        ↓
5-email welcome sequence (days 0, 2, 4, 7, 10)  → listen links appear in email #2, not before
        ↓
Weekly newsletter / Substack free tier
        ↓
Day 21+: invitation to The Household ($8/mo)
```

### 5.3 The DM automation

**Tool:** ManyChat. Note the free plan collapsed to **25 active contacts** — one Reel that performs will blow through it in an afternoon. Start on **Essential: $17/mo, or $14/mo annual, 250 active contacts** ($0.10 per contact beyond). Move to **Pro ($39/$29, 2,500 contacts)** only when you're consistently over 250/month. ManyChat uses the official Meta Messaging API, so this is compliant.

**Two rules that constrain the copy:**
- Meta requires you to also post a **public reply** to the comment. Use it — it is free social proof.
- Automated messages must stay inside the **24-hour window** after the person engages. This is why DM #1 asks a question: their reply resets and confirms the window, and it dramatically raises the odds they read DM #2.

**Public comment reply** (vary it, never post the same string 40 times — Meta reads that as spam):
> Sent it to your DMs 🙏

**DM #1 — do NOT lead with the link:**
> Hi! Ryan & Annie here — thanks for asking about the show 🙏
>
> Quick question before I send it over, so I point you at the right thing: what's the health thing you're most tired of fighting right now — **energy, gut, sleep, or hormones?**
>
> (Just reply with the word. I read these.)

**DM #2 — after they reply:**
> Perfect. Two things:
>
> 1. Here's the free **Fast Well Guide** — how to fast on Fridays and through Lent without wrecking your metabolism. It's the thing I wish someone had handed me ten years ago: 👉 healthinthespirit.com/start
>
> 2. Once you grab it, the episode links are right there on the same page.
>
> Health in the Spirit is a Catholic-rooted health show — body and soul, not one at the expense of the other. Glad you're here 🙏
> — Ryan & Annie

Why this works: it opens with a question rather than a link (higher reply rate, longer window, and it segments the lead by their stated problem, which you can tag in MailerLite); it delivers a specific promised thing rather than a vague "check out our show"; and it puts the listen links *behind* the email capture rather than in front of it.

### 5.4 The landing page — `healthinthespirit.com/start`

Build this as a new Astro page. It must be a **dedicated page, not the homepage and not /subscribe**, and it must break the site's normal rules.

**Required elements, in order:**

1. **No site navigation.** Strip the header. Every link is an exit. The only navigable elements are the form and the footer legal links.
2. **Above the fold, on a 375px-wide screen** — this is a 100% mobile audience arriving from Instagram:
   - Headline naming the specific promise, not the brand: *"Fast without wrecking your metabolism."*
   - One-line subhead: *"A free 7-day guide for Catholics who fast — from a functional-medicine doc and his wife."*
   - A visual of the actual asset (a mocked-up PDF cover or the audio card). People download things they can see.
   - **One email field and one button.** No name field — every extra field costs conversions, and you don't need a first name for this to work.
   - Button copy: **"Send me the guide"**, never "Submit."
3. **Immediately below:** a two-line credibility block with photos — *Dr. Ryan DeNome, chiropractor and functional medicine practitioner. Annie DeNome.* You already have `/public/photos/ryan-annie.jpg`. Faces convert.
4. **Social proof:** an Apple Podcasts rating, a listener count, or two short listener quotes. If you have none yet, use *"New episodes every Tuesday"* and the episode count — a real number beats a vague claim.
5. **Listen links — below the form, never above it.** Apple, Spotify, YouTube.
6. **One-line privacy reassurance:** *"One email a week. Unsubscribe any time. We never sell your address."*
7. **Zero other CTAs.** No blog links, no shop, no "learn more about us."

**Technical:** the current `/subscribe` page posts to `action="mailto:..."` — that does not work in most browsers and silently loses submissions. Replace it with MailerLite's embedded form (a plain HTML POST to their endpoint, no JavaScript required), which works perfectly in a static Astro build on Cloudflare Pages. Add a `/pod` redirect to `/start` since "pod" is the trigger word people already know.

**Also:** add a modest inline capture to the homepage and to every episode page — but `/start` is the one that carries the paid traffic.

### 5.5 Lead magnets — five candidates

| # | Lead magnet | Format | Why it works | Effort |
|---|---|---|---|---|
| **1** | **"Fast Well: 7 Days of Fasting Without Wrecking Your Metabolism"** — how to actually do Friday abstinence, Ember Days, and Lent when you're hypothyroid, pregnant, nursing, blood-sugar dysregulated, or 55 | 6–8 page PDF | **Recommended primary.** Sits exactly at the faith × physiology intersection nobody else occupies. Evergreen, with a massive annual spike at Ash Wednesday. It is unobtainable anywhere else, which is the whole test of a lead magnet. | Medium |
| **2** | **"5 Labs to Ask For Before You're Told You're Fine"** — the specific panels, why standard ranges mislead, the exact words to say to your doctor | 2-page PDF | **Recommended challenger.** Highest raw conversion of the five — it is concrete, urgent, and screenshot-shareable. Weakness: it is not distinctively Christian, so it builds a list that may convert worse to a faith-rooted paid tier. | Low |
| 3 | **"Examen of the Body"** — a 5-minute guided audio adapting the Ignatian examen to physical stewardship, plus a printed card | Audio + 1-page PDF | The most on-brand and the cheapest to make — audio is what you're already good at. Its hidden advantage: it trains the private-feed listening habit before you ever ask for money. | Low |
| 4 | **"The Saints' Medicine Cabinet"** — 12 saints, 12 ailments, 12 practices, laid out as a printable year | 12-page PDF / wall calendar | Most shareable and most brand-defining. Doubles as 12 months of episode and Reel content. Highest design effort of the five. | High |
| 5 | **"The Domestic Church Reset"** — a one-page Sunday planning sheet for the week's food, sleep, and family prayer | 1-page printable | Lowest effort of all, and the one most likely to be stuck on a refrigerator — which is durable, ambient brand presence. Weakest standalone pull. | Very low |

**Recommendation:** launch with **#1 (Fast Well)**. It is the one thing on this list that only Ryan and Annie could have made. Build **#3 (Examen of the Body)** second as the audio companion and hand it to everyone who finishes the welcome sequence. Run **#2** as an A/B challenger once you have enough traffic to read the difference.

### 5.6 The 5-email welcome sequence

Sent from `ryan@healthinthespirit.com`, plain-text-feeling, signed by both. Days 0, 2, 4, 7, 10.

---
**Email 1 — Day 0, immediate**
**Subject:** `Your Fast Well guide (+ one question)`
**Preview:** `Plus the one thing most people get wrong about fasting.`

Deliver the PDF above the fold. Two sentences on who you are. Set the expectation: *one email a week, Tuesdays.* Then one single ask — **reply with the health thing you're most tired of fighting.** Replies are the highest-value signal you can get: they teach deliverability algorithms you're wanted, they hand you episode topics, and they start a relationship. No listen links yet.

---
**Email 2 — Day 2**
**Subject:** `The question we get asked more than any other`
**Preview:** `"Is it okay to care this much about my body?"`

The origin story and the thesis: you are not a soul driving a body around. Care for the body is not vanity and not a distraction from holiness — it is stewardship. This is the email that makes them *your* listener rather than a person on a list. End with the single best episode you've made, one link, framed as *"if this resonates, start here."*

---
**Email 3 — Day 4**
**Subject:** `St. Hildegard had a supplement protocol`
**Preview:** `Spelt, fennel, and a 12th-century abbess who was right.`

Pure value and delight. The saints angle — the thing that makes this show unlike every other health podcast. Establishes that faith content here is substantive, not decorative. Introduce the Saint of the Month rhythm so the paid tier already feels familiar when you name it later. No ask.

---
**Email 4 — Day 7**
**Subject:** `The 3 labs we'd run on you tomorrow`
**Preview:** `Most people have never had two of them ordered.`

Ryan's clinical credibility, given away for free. Specific, actionable, the kind of thing people forward to their sister. Close with a soft, unpushy first mention: *"We answer questions like this every week for our members — more on that soon."* Plant, don't sell.

---
**Email 5 — Day 10**
**Subject:** `We built a room for the rest of this`
**Preview:** `Everything we can't fit in an episode — $8/mo.`

The invitation. Name what The Household actually is: After the Mic, the weekly Ask the Doc thread, the Saint of the Month protocol, the prayer board. Be concrete — list the four things. Be honest about why it costs money: it funds the show and it keeps you off sponsorships you don't believe in. Include a **founding-member offer with a real deadline** (first 50 members lock $8/mo for life, or $80/yr). One button. One link. If they don't convert, they stay on the free weekly list and you ask again at the next liturgical season, which is the real conversion event anyway.

---

**After email 5:** they drop into the weekly newsletter. Re-pitch at Advent and again at Lent, tied to the seasonal challenge — a dated program with a start line converts far better than an open-ended "join our community."

---

## 6. Email platform

### 6.1 The comparison

| Platform | Free tier | Automations on free? | Cost at ~1,000 subs | Astro embed | Verdict |
|---|---|---|---|---|---|
| **MailerLite** | **250 subscribers / 2,500 emails/mo** | **Yes — 3 automations, 5 steps each** | **~$12/mo** (Comfort; 50 automations, 100 steps) | Plain HTML form POST or embed snippet — works in a static build | **✅ Recommended** |
| **Kit (ConvertKit)** | **10,000 subscribers**, unlimited broadcasts, unlimited forms & landing pages | **No — sequences and visual automations are excluded entirely** | $33/mo annual / $39 monthly (Creator) | Excellent — HTML form or JS embed | Strong #2 |
| **beehiiv** | **2,500 subscribers**, unlimited sends, custom domain | **No — automations are Scale-only** | $43/mo annual (Scale), $49 monthly | Good; opinionated toward beehiiv-hosted pages | #3 |
| **Substack as email** | Unlimited free subscribers, $0 until you charge | Single welcome email; native drip campaigns were in beta / rolling out through 2026 — **do not bet the funnel on them yet** | $0 + 10% of paid revenue | Just a link — you can't embed the signup properly in Astro | Publication layer, not funnel layer |
| **Resend + custom** | 3,000 emails/mo, **capped at 100/day** | You build them | $20/mo (50K emails) at Pro | You write all of it | ❌ Wrong tool |

Sources: [MailerLite](https://www.mailerlite.com/pricing), [Kit](https://kit.com/pricing), [beehiiv](https://www.beehiiv.com/pricing), [Resend](https://www.stackscored.com/pricing/transactional-email/resend/).

### 6.2 The finding that decides it

**Kit's free plan looks like the obvious winner and is not.** 10,000 free subscribers with unlimited broadcasts is genuinely the most generous free tier in the category — but Kit's own pricing page lists **"Email sequences" and "Visual automations" as excluded from Free.** The 5-email welcome sequence in §5.6 *is* the funnel. Without it, a subscriber arrives, gets one email, and is never spoken to again until the next broadcast — which is close to what's happening today.

The same disqualifier applies to beehiiv (automations are Scale-only, $43+/mo) and, differently, to Substack (one welcome email; real drip campaigns still in rollout).

**MailerLite is the only platform here that gives you a working automated sequence at or near zero cost**, and its paid step (~$12/mo) is a third of Kit's and a quarter of beehiiv's.

### 6.3 Recommendation

> **Primary: MailerLite.** Free while under 250 subscribers, ~$12/mo after. Build the `/start` form and the 5-email sequence here in week one. It embeds into Astro as an ordinary HTML form posting to MailerLite's endpoint — no JavaScript, no serverless function, no change to the Cloudflare Pages static deploy.
>
> **Runner-up: Kit**, if you'd rather pay $39/mo for a better creator ecosystem, better commerce tooling, and stronger deliverability reputation. Genuinely defensible — just not at this stage, and not on the free plan.
>
> **Explicitly not Resend.** Resend is transactional-email infrastructure for developers. Using it means hand-writing the sequence scheduler, the unsubscribe handling, the CAN-SPAM compliance, the preference center, and the bounce processing. The 100/day free cap alone makes it unworkable. This is the same trap as the self-hosted community option: real engineering cost against a problem that $12/mo solves.

### 6.4 How MailerLite and Substack coexist

They do different jobs and the handoff is clean:

- **MailerLite = the funnel.** Landing page capture → lead magnet delivery → 5-email nurture → tag by the problem they named in the DM. Its job ends at the paid invitation.
- **Substack = the publication.** Daily reflections, Chat, paid tier, bonus podcast feed, discovery via Notes.
- **The handoff:** email #5 sends them to Substack, where they subscribe (free or paid). MailerLite keeps sending the weekly newsletter to anyone who never crossed over, and re-pitches at Advent and Lent.

Two tools is a small, one-time setup cost. Write the sequence once and it runs unattended forever.

**If you truly want one tool:** run everything on Substack and accept a single welcome email delivering the lead magnet, plus manually scheduled broadcasts standing in for the drip. It works. You will convert measurably worse, because free→paid conversion happens in the nurture sequence. Revisit once Substack's drip campaigns reach general availability, at which point collapsing to Substack-only becomes the right call.

---

## 7. Sequencing — the next 90 days

**Do not launch the paid community first.** With ~9 episodes and under 500 Instagram followers, there is no audience to convert. A paid tier that launches to 6 members is demoralizing and hard to relaunch. Build the list first.

### Days 1–30: fix the leak
- Build `/start` in Astro (§5.4). Add a `/pod` → `/start` redirect.
- Set up MailerLite. **Replace the broken `mailto:` form on `/subscribe`** — it is silently dropping every submission today.
- Write and design lead magnet #1, *Fast Well*.
- Set up ManyChat Essential; rewrite the DM flow as two messages (§5.3).
- Add inline capture to the homepage and every episode page.
- **Success metric: 150 email subscribers.** Not followers. Subscribers.

### Days 31–60: prove the content
- Write and load the 5-email welcome sequence.
- Start recording **After the Mic** now — publish it *free* for six weeks. This does two things: it proves you can sustain the cadence, and it builds demand for the thing you're about to put behind a wall.
- Publish the first three **Saint of the Month** posts free. They are your best organic growth asset.
- Keep the weekly episode uninterrupted. Nothing here matters if the show slips.
- **Success metric: 400 email subscribers, 6 consecutive weeks of After the Mic.**

### Days 61–90: launch The Household
- Turn on Substack paid: **$8/mo, $80/yr, $200/yr founding.**
- Move After the Mic behind the paywall — with a public announcement giving three weeks' notice, and grandfathering nobody. Clean lines.
- Launch with a **founding-member offer**: first 50 members lock $8/mo for life.
- Time the launch to a **liturgical season** — Advent or Lent. A dated program with a start line converts far better than an open invitation.
- **Realistic first cohort: 20–40 members ($160–320/mo).** That is a normal, healthy start. It is not failure.

### The metric to actually watch
Not follower count. Not downloads. **Email subscribers, and the free→paid conversion rate on the welcome sequence.** Everything else is vanity.

---

## 8. Compliance — read before launching "Ask the Doc"

Ryan is a licensed chiropractor and functional-medicine practitioner in Ohio. A paid community where members ask health questions and a doctor answers them for money is a materially different legal posture than a podcast, and it needs guardrails from day one.

- **Draw a bright line between education and care.** "Ask the Doc" answers **general educational questions about physiology, labs, and research** — it does not diagnose, treat, or advise on any individual's specific condition. Answer the category, not the person: *"Here's what elevated ferritin generally indicates and what's worth asking your doctor about"* — never *"you should take X."*
- **Do not create a doctor-patient relationship** through the community. Every paid space and every downloadable protocol needs a plain, visible disclaimer stating no such relationship is formed and that members should consult their own provider.
- **Watch the licensure boundary.** Members will be in states where Ryan is not licensed. General education crosses state lines; individualized care does not.
- **Have a redirect script ready** and use it without apology: *"That one needs a real workup — here's what to bring to your own doctor."* Reaching for it visibly will build more trust than answering would.
- **Never route community members into the clinic as patients** without independent legal review — that touches referral, advertising, and scope-of-practice rules simultaneously.
- **Supplement and product recommendations** (offer #14) need disclosed affiliate relationships or none at all. In this audience, refusing affiliate revenue outright is worth more in trust than the revenue is worth in dollars.
- **Have an Ohio-licensed healthcare attorney review** the community terms, the disclaimer language, and the "Ask the Doc" format before it goes live. This is a one-time few-hundred-dollar cost against a category of risk that can end a license.

*(This section is operational caution, not legal advice.)*

---

## 9. Sources

**Platform pricing**
- Substack — [How much does Substack cost](https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost) · [fee analysis](https://gigmoneytips.com/substack-fees-2026/) · [paywalling Chat](https://support.substack.com/hc/en-us/articles/26161950679572-How-do-I-paywall-my-Chat-on-Substack) · [paid podcast RSS](https://support.substack.com/hc/en-us/articles/360041722272-Will-my-Podcast-RSS-feed-show-paid-only-content) · [tiers & founding members](https://support.substack.com/hc/en-us/articles/360042039091-Can-I-set-up-another-subscription-plan-for-readers-who-want-to-pay-more) · [drip campaigns 2026](https://thrivewithcarrie.substack.com/p/substack-drip-campaigns-email-sequences-2026)
- Patreon — [pricing & fees 2026](https://www.schoolmaker.com/blog/patreon-pricing) · [fee breakdown](https://www.ruzuku.com/learn/articles/patreon-pricing) · [members-only audio RSS](https://support.patreon.com/hc/en-us/articles/213557023-Enable-audio-RSS-feeds-for-my-members)
- Circle.so — [pricing 2026](https://www.schoolmaker.com/blog/circle-so-pricing) · [fees & add-ons](https://www.ruzuku.com/compare/circle-pricing)
- Skool — [pricing 2026](https://kourses.com/skool-pricing/) · [$9 vs $99 analysis](https://revenuegeeks.com/software/skool/pricing)
- Kajabi — [pricing & hidden fees](https://kourses.com/kajabi-pricing/) · [fee calculator](https://www.learningrevolution.net/kajabi-pricing/)
- Locals — [How much does Locals charge](https://support.locals.com/en/article/how-much-does-locals-charge-u7tcux/) · [explainer](https://unil.ink/blog/locals-com-explained-2026)
- Ko-fi — [pricing, Gold & what you keep](https://www.ruzuku.com/learn/articles/ko-fi-pricing) · [Discord integration](https://ko-fi.com/discord)
- Ghost — [pricing 2026](https://thatmarketingbuddy.com/pricing/ghost) · [Ghost + Transistor integration](https://ghost.org/integrations/transistor/) · [members-only podcasts](https://transistor.fm/changelog/ghost/)
- Memberful — [pricing 2026](https://memberful.co/pricing)
- Stripe — [pricing & fees](https://stripe.com/pricing) · [Billing pricing](https://stripe.com/billing/pricing)
- Transistor — [pricing](https://transistor.fm/pricing/) · [private podcasts](https://transistor.fm/features/private-podcasts/) · [paid private podcast guide](https://transistor.fm/paid-private-podcast/) · [what are private subscribers](https://support.transistor.fm/en/article/what-are-private-podcast-subscribers-12lzzka/)

**Christian & health community examples**
- The Catholic Talk Show — [Patreon tiers](https://catholictalkshow.com/patreon) · [Patreon page](https://www.patreon.com/catholictalkshow)
- The Holy Post — [Holy Post Plus](https://www.holypost.com/plus) · [Patreon](https://www.patreon.com/cw/holypost)
- Abiding Together — [Patreon](https://www.patreon.com/abidingtogetherpodcast/about)
- Matt Fradd / Pints With Aquinas — [Locals community](https://mattfradd.locals.com/support) · [FAQ](https://mattfradd.locals.com/faq)
- Ascension Press — [app subscription costs](https://ascension.helpscoutdocs.com/article/27-ascension-app-subscription-costs) · [Ascension app](https://ascensionpress.com/pages/ascension-app)
- Hallow — [pricing](https://thedolceway.com/blog/hallow-app-free-pricing-breakdown) · Exodus 90 — [pricing](https://exodus90.com/pricing/)
- Refined Wellness — [Christian functional medicine membership](https://www.refinedwellness.org/refinedwellnessmembership-5szrd)
- Functional medicine comps — [Tendwell](https://tendwellhealth.com/membership-options/) · [360 Health Wellness](https://360health-wellness.com/functional-med-membership)
- CMF CURO — [Catholic health & wellness](https://cmfcuro.com/category/catholic-health-and-wellness/)

**Funnel & email**
- ManyChat — [pricing 2026](https://setsmart.io/blog/manychat-pricing) · [comment-to-DM](https://get.manychat.com/use-case/comment-to-dm) · [Instagram DM automation rules](https://manychat.com/blog/instagram-dm-automation-rules/)
- MailerLite — [pricing](https://www.mailerlite.com/pricing) · [free plan update FAQ](https://www.mailerlite.com/help/free-plan-update-faq)
- Kit — [pricing](https://kit.com/pricing)
- beehiiv — [pricing](https://www.beehiiv.com/pricing)
- Resend — [pricing 2026](https://www.stackscored.com/pricing/transactional-email/resend/)
- Benchmarks — [podcast monetization 2026](https://audiencelift.com/blog/podcast-monetization-in-2026-how-to-make-money-podcasting-without-a-million-downloads/)
