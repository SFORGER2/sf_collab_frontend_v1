# SF Ecosystem - User Data Collection & Tracking

**Internal Developer Documentation**

## Purpose of This Document

This document explains:

- What user data we collect across the SF Ecosystem
- Why we collect it
- How it should be implemented technically
- What must be avoided for legal and architectural safety

This applies to **SFCollab, SFManagers,** and all future **SF** products.

## 1. Core Principle (READ THIS FIRST)

We do not “spy” on users. We **observe** system interactions to ensure integrity, safety, and intelligence.

Data collection exists to:

- Prevent abuse and scams
- Enforce one-account-per-user
- Power gamification and reputation
- Enable AI and future intelligence
- Protect founders, mentors, and investors

## 2. Data Collection Layers (Architecture Overview)

There are **4** layers of data, each with different responsibilities and storage rules.

### 2.1 Passive System Data (Automatic)

**What it is:** Data generated automatically when users use the platform.

**Examples:**

- Page views / route changes
- Feature usage
- Session duration
- Errors and crashes
- Device, browser, OS
- IP address (coarse location only)

**Implementation:**

- Frontend analytics events
- Backend request logs
- Server / CDN logs

**Rules:**

- No precise GPS tracking
- No hidden recording
- No keystroke logging

### 2.2 Explicit Interaction Events (CORE SF DATA)

This is the **most** important layer.

**Examples:**

- idea_submitted
- idea_voted
- startup_created
- startup_joined
- team_member_added
- mentor_session_started
- payment_initiated
- investment_committed
- escrow_released
- account_flagged
- account_banned

**Why this matters:**

- Powers reputation & points
- Enables fraud detection
- Feeds AI training later
- Enables investor trust

**Implementation rules:**

- Events must represent **state** changes
- Events must be **backend-validated**
- Frontend events alone are NOT trusted

### 2.3 Identity & Trust Data (Sensitive, Mostly External)

**What it includes:**

- KYC / identity verification
- Face verification
- ID checks
- Risk & trust signals

**How it works:**

- Handled by **external** providers
- We receive:
  - verification status
  - provider reference ID
  - trust level / risk flags

**What we NEVER store:**

- Raw ID images
- Full biometric data
- Government ID numbers (unless legally required)

**Developer rule:** Treat identity data as **read-only** trust signals, not user content.

### 2.4 Intelligence & Training Data (Derived)

**What it is:** Aggregated, derived, long-term insights.

**Examples:**

- Contribution patterns
- Startup health signals
- Fraud heuristics
- Reputation trajectories

**Implementation:**

- Built from event data
- Aggregated / anonymized where possible
- Stored separately from raw events

**Not required in MVP:** But raw data must be clean from day one.

## 3. Event Design Guidelines (VERY IMPORTANT)

### ✅ DO

- Track meaningful actions
- Use consistent event naming
- Include timestamps
- Include actor (user_id)
- Include context (startup_id, team_id)
- Log enforcement actions

### ❌ DO NOT

- Track raw text unnecessarily
- Track private content outside context
- Track sensitive personal data
- Rely only on frontend events

## 4. Required Core Event Fields (Standard)

Every event should include:

```json
{
  "event_name": "startup_joined",
  "user_id": "uuid",
  "context": { "startup_id": "uuid", "role": "member" },
  "timestamp": "ISO-8601",
  "source": "backend",
  "ip_hash": "hashed",
  "device_fingerprint": "hashed"
}
```

Hash identifiers where possible. Never store raw fingerprints in plain text.

## 5. Enforcement & Audit Logging

**What must be logged:**

- Warnings
- Restrictions
- Bans
- Payment disputes
- Escrow actions

**Why:**

- Legal defensibility
- Abuse prevention
- Appeal review (if allowed)
- Pattern detection

**Rule:** **No** silent enforcement. Everything must be auditable.

## 6. Payments, Escrow & Investments

**What to track:**

- Initiation
- Status changes
- Milestones
- Deadlines
- Releases
- Failures

**What NOT to track:**

- Full card numbers
- Wallet private keys
- Sensitive payment credentials

Payments are **metadata** + **references**, never raw secrets.

## 7. AI Training Considerations (Future-Safe)

**What AI can use:**

- Aggregated events
- Anonymized patterns
- System metadata
- Content where permitted by policy

**What AI must NOT use:**

- Raw identity documents
- Private credentials
- Sensitive personal data

**Developer responsibility:** Design systems so:

- Raw data can be separated
- Training datasets can be filtered
- Deletion requests can be respected where required

## 8. Privacy & Compliance Rules (NON-NEGOTIABLE)

- No sensitive data unless explicitly required
- External providers for KYC
- Lawful basis for all processing
- Data minimization by default
- Retain abuse-related data even after bans

If unsure → **ask** before implementing.

## 9. What We Are Building (Mental Model)

We are building:

- An **observable** ecosystem
- A **trust-based** platform
- An **AI-ready** data foundation

We are NOT building:

- Surveillance software
- Ad tracking systems
- Behavioral manipulation engines

## 10. Final Developer Checklist

Before shipping a feature:

- Events defined?
- Backend validation?
- No sensitive data leaked?
- Audit trail present?
- Abuse vectors considered?
- Future AI compatibility ensured?

If any box is unchecked → do not ship.

## Final Note to Developers

SF’s strength comes from:

- Clean data
- Clear intent
- Strong enforcement
- Respect for users who build honestly

If we get data right now, **everything** else becomes **easier** **later**.
