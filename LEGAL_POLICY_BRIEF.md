# Legal Policy Drafting Brief

**Deliverables requested from legal agent:**
1. Privacy Policy (web + mobile app)
2. Terms of Use / Terms of Service (web + mobile app)
3. Cookie Policy (web; in-app tracking disclosure if applicable)

**Output format:** Three separate documents, plain English, UAE law primary, mobile + web in scope. Player-facing language must be readable by minors and guardians.

**Use this brief as ground truth. Where a field is marked `[TO_CONFIRM]`, do not invent — list it back to the founder as an open question before finalising.**

---

## 1. Company & Jurisdiction

| Field | Value |
|---|---|
| Legal entity name | `[TO_CONFIRM]` |
| Trading name / product name | `[TO_CONFIRM]` |
| Registered address | `[TO_CONFIRM]` |
| Free zone vs onshore | `[TO_CONFIRM]` — confirm: Mainland UAE, DIFC, ADGM, Dubai Internet City, or other. **Materially changes which DP law applies.** |
| Primary launch jurisdiction | United Arab Emirates |
| Expansion roadmap | Other GCC + global; draft so future markets can be appended without rewrite |
| Website domain(s) | `[TO_CONFIRM]` |
| Support / DPO contact email | `[TO_CONFIRM]` |
| Designated Data Protection Officer | `[TO_CONFIRM]` — required under UAE PDPL where large-scale processing of sensitive data occurs; recommend appointing |

---

## 2. Product Overview (what we actually do)

A mobile + web platform for **football player performance analysis**, expanding to other sports. Three pillars:

1. **Health vitals ingestion** — read-only sync from Apple Health (HealthKit) and Google Health Connect (steps, heart rate, HRV, sleep, workouts, weight, etc.).
2. **Training video capture & analysis** — players (or coaches) record training sessions on the phone camera. Video uploads to our servers, where a CV/AI pipeline produces annotated video + performance metrics + textual coaching summaries.
3. **Coach & scout marketplace / dashboard** — coaches and scouts can search/discover players, view consented performance profiles, and monitor teams they manage.

**AI usage:** computer-vision pipeline (player detection, tracking, pose/movement metrics) + LLM-generated coaching and health suggestions.

---

## 3. User Roles & Account Types

| Role | Description | Data they generate | Data they can see about others |
|---|---|---|---|
| Player (adult, 18+) | Records own training, syncs own health data | Video, health vitals, profile, performance metrics | Own data only by default |
| Player (minor, <18) | Same, with guardian consent | Same as above | Same as above |
| Guardian / Parent | Consents on behalf of minor; manages minor's account | Identity, relationship to minor | Their minor's full profile |
| Coach | Manages a team / roster of players | Notes, session plans, ratings | Performance + health summaries of players who have accepted the coach's link |
| Scout | Searches and evaluates players for clubs / academies | Notes, watchlists | Only what the player has marked publicly discoverable, plus what a player explicitly shares with the scout |
| Club / Academy admin (if applicable) | Manages coach + player seats for an organisation | Org-level config | Org-level data per agreement |

**Consent model decisions to lock:**
- Players must opt-in before any coach or scout can see their data. Default = private.
- Coaches/scouts cannot "discover" a player's identity or vitals without that player's explicit acceptance of the connection.
- Minors require verifiable guardian consent before account activation. **All connections to coaches/scouts for a minor must be guardian-approved, not minor-approved.**
- A player can revoke a coach/scout connection at any time; on revocation, the coach/scout loses access prospectively (history of past access is logged).

---

## 4. Data Inventory

### 4.1 Personal data — standard
- Identity: name, date of birth, gender, nationality, profile photo
- Contact: email, phone, optionally address
- Account: hashed password, auth tokens, login history, device IDs
- Sporting profile: position, dominant foot, height, weight, club affiliation, years played, achievements
- Payment / billing data (if paid tiers exist) — `[TO_CONFIRM]` if launching with paid plans
- Communications: in-app messages, support tickets

### 4.2 Personal data — sensitive (special category under UAE PDPL Art. 1 & 15)
- **Health vitals from HealthKit / Health Connect:** heart rate, HRV, resting HR, blood oxygen, sleep, weight, body composition, menstrual cycle data (if female athletes), step count, active energy, VO2 max estimates, workouts.
- **Biometric / behavioural data derived from video:** pose keypoints, movement signatures, sprint/jump metrics, potentially facial detection used to identify the player on-pitch.
- **Children's data:** any player under 18 — heightened protection.

### 4.3 User-generated content
- Raw training videos (uploaded by player or coach with player's consent)
- Annotated/processed videos (derivative work produced by our pipeline)
- Coach notes, ratings, tags

### 4.4 Automatically collected
- Device info: model, OS version, app version, locale, timezone
- Diagnostics, crash logs
- IP address, approximate location (city-level), precise location only if user grants permission (e.g. for tagging a training venue)
- Analytics events (screen views, feature interactions)
- Cookies and similar SDK identifiers (see §10)

### 4.5 Data from third parties
- HealthKit / Health Connect (with OS-level user permission)
- Identity verification provider (if KYC for payouts/scouts) — `[TO_CONFIRM]`
- Authentication providers (Apple, Google, Facebook sign-in) — `[TO_CONFIRM]` which are enabled
- Coaches/scouts may submit data *about* a player (notes, ratings). Player must be informed and able to access this.

---

## 5. Purposes of Processing & Legal Bases

Map each purpose to a UAE PDPL legal basis (consent / contract / legitimate interest / legal obligation / vital interest / public interest). Recommended mapping:

| Purpose | Data used | Legal basis |
|---|---|---|
| Create and operate user account | Identity, contact, account | Performance of contract |
| Sync and display health vitals | Health data | **Explicit consent** (sensitive data) |
| Process training videos and generate AI analysis | Video, biometric-derived data | **Explicit consent** (biometric-derived) + contract |
| Allow coach / scout discovery and connections | Profile, performance summaries | Explicit consent of player (and guardian for minors) |
| Generate personalised health & training suggestions | Health + performance data | Explicit consent + contract |
| Service security, fraud prevention, abuse detection | Account, device, IP, logs | Legitimate interest |
| Product analytics & improvement | Usage analytics, aggregated metrics | Consent (analytics cookies/SDKs) — opt-in banner |
| Marketing communications | Contact, preferences | Consent — opt-in, separately revocable |
| Legal compliance (tax, AML, court orders) | As required | Legal obligation |

**Critical:** the legal agent must NOT default to "legitimate interest" for any sensitive category. Health and biometric data require explicit, granular, separately revocable consent.

---

## 6. Third-Party Integrations & Sub-Processors

List in the privacy policy. Mark each as data-processor or independent-controller.

`[TO_CONFIRM]` the actual stack. Likely candidates:

| Vendor | Purpose | Data shared | Location |
|---|---|---|---|
| AWS / GCP / Azure | Cloud hosting, video storage, compute | All categories | `[TO_CONFIRM]` — strongly recommend a **UAE region** for health data |
| Apple HealthKit | Health vitals source | Health data | On-device → our servers via user permission |
| Google Health Connect | Health vitals source | Health data | Same |
| Anthropic / OpenAI / other LLM API | AI coaching summaries | Performance + health summaries (de-identified where possible) | US-based — flag in cross-border section |
| Computer vision model providers (if any external) | Video analysis | Video frames or extracted features | `[TO_CONFIRM]` |
| Google Analytics / Firebase / Mixpanel / Amplitude | Web + app analytics | Usage + device data | `[TO_CONFIRM]` |
| Payment processor (Stripe / Telr / Network International / etc.) | Billing | Payment + identity | `[TO_CONFIRM]` |
| Email / push (SendGrid, Postmark, OneSignal, etc.) | Comms | Contact + content | `[TO_CONFIRM]` |
| Customer support tool (Intercom, Zendesk, etc.) | Support | Account + ticket content | `[TO_CONFIRM]` |
| Auth provider (Auth0, Firebase Auth, Cognito, etc.) | Login | Account credentials | `[TO_CONFIRM]` |
| Crash reporting (Sentry, Crashlytics) | Diagnostics | Device + crash data | `[TO_CONFIRM]` |

---

## 7. Cross-Border Data Transfers

**This is the single highest-risk area for this product.** Flag prominently in the brief and in the policy.

- UAE **Federal Law No. 2 of 2019 concerning the Use of ICT in Health Fields** restricts the storage and transfer of health data generated inside the UAE outside the country, unless authorised by the relevant health authority (MOHAP / DHA / DOH depending on emirate).
- UAE PDPL (Federal Decree-Law No. 45 of 2021) requires either an adequacy decision, appropriate safeguards (e.g. SCCs), or explicit consent for cross-border transfers.
- DIFC DP Law 2020 and ADGM DPR 2021 have their own regimes if the entity is registered there.

**Drafting instruction to the legal agent:**
1. Default architecture assumption: **health data stays in a UAE cloud region**. If this is not feasible, flag it as a blocker and request founder confirmation.
2. Where non-health data (e.g. analytics, LLM-generated summaries) is processed abroad, the policy must (a) name the destination country, (b) state the safeguard relied on, (c) obtain explicit consent at signup if needed.
3. Specifically address transfers to LLM providers (likely US): summarise what is sent, that it is not used to train third-party models (confirm contractually), retention by the provider, and the user's right to refuse AI features.

---

## 8. Minors

Football players span a wide age range. Many users will be under 18. Some may be under 13.

**Decisions to lock with the legal agent:**
- Minimum age to use the app independently: **18**. Below 18, account requires verifiable guardian consent.
- Minimum age allowed at all (with guardian consent): `[TO_CONFIRM]` — recommend not below **13**; if academies want younger players, the account is operated by the guardian / coach with the minor as the data subject but not the account holder.
- Guardian consent mechanism: verifiable (e.g. Emirates ID verification of guardian, or credit-card check, or signed e-form with witness).
- Coaches and scouts contacting minors: **disallowed except through guardian-mediated approval flow**.
- Marketing to minors: prohibited.
- Data minimisation for minors: explicitly call out reduced retention, restricted sharing, no public discoverability by default.

---

## 9. Retention

Draft a retention schedule. Suggested defaults — legal agent to refine:

| Data | Retention |
|---|---|
| Active account data | While account active + 90 days post-deletion request (grace + backups) |
| Raw uploaded video | `[TO_CONFIRM]` — recommend 12 months from upload unless the user pins it |
| Annotated video + derived metrics | While account active |
| Health vitals time series | Default 24 months rolling window; user can request earlier deletion |
| Coach notes about a player | Until the connection is revoked, then 90 days |
| Billing records | 7 years (UAE tax / commercial law) |
| Support tickets | 24 months |
| Logs (security, audit) | 12 months |
| Anonymised aggregate analytics | Indefinite |

---

## 10. Cookies & Analytics

For the website:

| Category | Examples | Consent |
|---|---|---|
| Strictly necessary | Session, CSRF, auth | No consent needed — disclose only |
| Functional / preference | Language, theme | Opt-in (UAE PDPL is consent-default) |
| Analytics / performance | GA4, Firebase, Mixpanel, Hotjar, etc. | Opt-in |
| Marketing / advertising | Meta Pixel, LinkedIn Insight, Google Ads | Opt-in, separately |

**Required mechanism:** a cookie consent banner with granular toggles, "reject all" as prominent as "accept all", and ability to change choices later via a persistent "Cookie settings" link in the footer.

**In-app tracking (iOS / Android):**
- iOS: comply with **App Tracking Transparency (ATT)** — request permission before any cross-app tracking SDKs are active.
- Android: respect **Advertising ID** opt-out; declare data use in Google Play Data Safety form (must be kept in sync with the privacy policy).
- The Cookie Policy can include a "Mobile SDKs and identifiers" section, or this can sit inside the Privacy Policy — legal agent to choose, but it must be covered somewhere.

---

## 11. User Rights (UAE PDPL Art. 13–20)

The Privacy Policy must enumerate, with a clear mechanism for each:
- Right to access / obtain a copy
- Right to rectification
- Right to erasure
- Right to restrict processing
- Right to data portability
- Right to object
- Right to withdraw consent (without affecting prior lawful processing)
- Right to information about automated decision-making — **relevant: our AI generates coaching and health suggestions. The policy must explain this, state that no legally significant or solely-automated decisions are made (assuming a human coach is always in the loop), and offer a route to request human review.**
- Right to lodge a complaint with the UAE Data Office (or DIFC Commissioner of Data Protection / ADGM Office of Data Protection depending on entity location)

Provide a single contact channel for rights requests with a max **30-day response SLA** (extendable to 60 days for complex requests with notice).

---

## 12. Security

Privacy Policy should describe security measures at a high level (no specifics that aid attackers). Required mentions:
- Encryption in transit (TLS 1.2+) and at rest
- Access control on a need-to-know basis
- Logging and monitoring
- Secure software development practices
- Vendor due diligence on sub-processors
- Breach notification: commitment to notify the UAE Data Office and affected users without undue delay where the breach is likely to result in risk to data subjects (PDPL Art. 9)

---

## 13. Terms of Use — Specific Clauses Required

Beyond standard SaaS boilerplate, the Terms must explicitly cover:

1. **Eligibility & age** — mirror the minors decisions in §8.
2. **Account types & role-specific obligations** — players, coaches, scouts, guardians, club admins.
3. **User content licence** — user retains ownership of uploaded videos; grants the platform a worldwide, royalty-free, sub-licensable licence **strictly for the purpose of providing the service** (analysis, storage, sharing with consented recipients). Explicitly carve out: no use for advertising, no sale to third parties, no use to train external AI models without separate opt-in.
4. **Generated content** — annotated videos and AI summaries are derivative works owned by the platform but licensed back to the user for personal/professional use within the service.
5. **Health & training disclaimer** — AI-generated suggestions are **not medical advice, not a substitute for a qualified doctor, physiotherapist, or licensed coach.** Vitals shown are informational, not diagnostic.
6. **AI limitations** — analyses may be inaccurate or incomplete; users should not make critical career, training, or health decisions solely on platform output.
7. **Coach / scout code of conduct** — prohibited behaviours: harassment, doxxing, contacting minors outside the platform, sharing player data externally, scraping, screenshotting for redistribution.
8. **Player protection** — players can revoke any connection at any time; coaches and scouts cannot retaliate by altering ratings post-revocation.
9. **Acceptable use** — no uploading content where the player has not consented; no uploading other people's children without guardian consent; no illegal content; no copyrighted match footage the user does not own rights to.
10. **Account suspension and termination** — grounds, notice, appeal.
11. **Payment, refunds, auto-renewal** — `[TO_CONFIRM]` once paid tiers are defined.
12. **Liability cap & disclaimer** — to the maximum extent permitted under UAE law; explicitly limit consequential damages; cap at fees paid in the last 12 months (or AED `[TO_CONFIRM]` for free users).
13. **Indemnification** — by user for content they upload.
14. **Force majeure**.
15. **Changes to the Terms** — notice mechanism, deemed-acceptance window.
16. **Governing law & dispute resolution** — `[TO_CONFIRM]`. Likely options: (a) UAE federal law + Dubai Courts, (b) DIFC law + DIFC Courts if the entity is DIFC-registered, (c) ADGM equivalents. Consider arbitration (DIAC / DIFC-LCIA successor / ADGM Arbitration Centre) for B2B coach/club contracts.
17. **Export controls / sanctions** — standard clause.
18. **No employment relationship** between platform and coaches/scouts.
19. **Discoverability and matchmaking** — terms by which scouts can search players and the boundaries of that.

---

## 14. Applicable Laws / Compliance Framework

The legal agent should draft against the following framework. Cite the relevant law in plain English in the policy (not legal-citation form, but enough that a regulator can map it).

**UAE primary:**
- Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL)
- Federal Decree-Law No. 34 of 2021 on Combatting Rumours and Cybercrimes
- Federal Law No. 2 of 2019 on the Use of ICT in Health Fields
- TDRA regulations applicable to apps and online services
- Consumer Protection Law (Federal Law No. 15 of 2020) if there is a B2C paid offering

**Free-zone alternatives (apply only if entity is registered there):**
- DIFC Data Protection Law No. 5 of 2020
- ADGM Data Protection Regulations 2021

**Likely-relevant given user base:**
- Apple App Store Review Guidelines (esp. §5.1 Privacy, §5.1.3 Health, HealthKit rules)
- Google Play Developer Policies (Health Connect, sensitive data, Data Safety form)
- Apple HealthKit terms — prohibit using HealthKit data for advertising, restrict sharing, require explicit user permission for each data type, and forbid using HealthKit data in services not primarily designed to provide health/fitness functionality. The Privacy Policy must specifically address HealthKit data handling.
- Google Health Connect — similar restrictions; must publish a privacy policy that discloses Health Connect data uses.

**If users may include EU/UK residents in future:**
- Flag GDPR / UK GDPR for the founder; not in scope for v1 but design the policy to be extensible.

---

## 15. Drafting Style & Format Instructions

- Plain English; reading age ~14. Avoid Latin and unexplained legalese.
- Each policy starts with a one-paragraph **plain-language summary** before the formal text.
- Use a **layered notice** approach: a short "at a glance" box at the top of each section, then detail.
- Privacy Policy must have a **"How we handle children's data"** standalone section.
- Privacy Policy must have a **"How we handle health and biometric data"** standalone section, with HealthKit / Health Connect named.
- Privacy Policy must have a **"How our AI features work"** standalone section explaining what data goes to which model, what comes back, and the user's right to opt out.
- All three documents must include: effective date, last-updated date, version number, changelog link.
- All three documents must be available in **English** at launch. **Arabic** translation should be planned — confirm with founder whether v1 launches bilingual. If Arabic is included, the English version should be marked as the prevailing version in case of conflict (or vice versa — founder to choose).
- Each document must list a **single contact point** (email + postal address) for data subject requests, complaints, and legal notices.

---

## 16. Open Questions for the Founder (return these before drafting)

The legal agent must come back with answers to these before producing final drafts:

1. Legal entity name, address, free-zone vs onshore status.
2. Cloud architecture: where will health data and video physically reside? UAE region available?
3. Confirmed third-party stack from §6.
4. LLM provider(s) used and whether a no-training contractual commitment is in place.
5. Minimum age of a user with guardian consent.
6. Paid tiers at launch? Payment processor?
7. Bilingual launch (EN + AR) or English first?
8. DPO appointment.
9. Governing law / dispute forum preference.
10. Whether scouts pay for access (changes the consumer-protection framing).
11. Whether the platform will ever sell or share anonymised/aggregated data with clubs, federations, or research partners — answer drives an explicit disclosure section.
12. Whether the platform integrates with any wearables directly (Garmin, Whoop, Polar) beyond HealthKit/Health Connect.
13. Marketing and partnerships strategy — sponsored content, affiliate links, integrations with academies.
14. Insurance — professional indemnity, cyber — affects liability clauses.

---

**End of brief.**
