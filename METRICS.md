# Metrics & Instrumentation — Spendora

## North Star Metric

### **Audits Completed (Monthly)**

**Definition:** Total number of unique audits run through the tool per month.

**Why this metric:**
- Directly measures user interest and product-market fit signal
- Leading indicator for leads captured and revenue potential
- Easy to measure and not gamifiable
- Correlates directly to Credex lead-generation value
- Tracks adoption velocity across distribution channels

**Success Benchmarks:**
- Month 1: 20-30 audits
- Month 3: 200-400 audits
- Month 6: 800-1,200 audits
- Month 12: 2,000+ audits/month

---

## 3 Input Metrics (Drive North Star)

### 1. **Email Capture Rate** (%)

**Definition:** `(Emails captured / Audits completed) × 100`

**Target:** 55-65%

**Why it matters:**
- If audits run but emails aren't captured, leads aren't being collected
- Indicates if value proposition is compelling enough for lead conversion
- Shows product-market fit (users want to opt-in after seeing value)

**How to instrument:**
- Log every audit completion (time, tools submitted, savings calculated)
- Log every successful email capture event
- Track failed capture attempts and reasons
- Calculate rate daily and alert if drops below 50%

**Example:**
```
Day 1: 25 audits → 16 emails (64%)
Day 2: 18 audits → 12 emails (67%)
Day 3: 22 audits → 13 emails (59%)
Weekly: 98 audits → 62 emails (63%)
```

---

### 2. **High-Savings Audit Rate** (%)

**Definition:** `(Audits with >$500 monthly savings / Total audits) × 100`

**Target:** 40-50%

**Why it matters:**
- Indicator of audit quality and Credex partnership viability
- High-savings audits = high-value leads for Credex
- If rate is too low (<30%), audit engine isn't finding real opportunities
- If rate is too high (>70%), recommendations might be unrealistic

**How to instrument:**
- Calculate savings amount in audit engine
- Tag audits with savings bucket: <$100 | $100-500 | >$500
- Log to analytics each audit completion with savings tier
- Monitor daily and alert on threshold changes

**Example:**
```
May 7: 10 audits → 5 high-savings (50%)
May 8: 15 audits → 6 high-savings (40%)
May 9: 12 audits → 5 high-savings (42%)
Rolling 7-day: 125 audits → 52 high-savings (42%)
```

---

### 3. **Referral/Share Rate** (%)

**Definition:** `(Unique shareable URLs viewed / Audits completed) × 100`

**Target:** 8-12%

**Why it matters:**
- Indicates if results are compelling enough to share (viral loop signal)
- Shows user satisfaction and product stickiness
- Organic word-of-mouth growth driver
- Key for reaching 100+ users with $0 marketing budget

**How to instrument:**
- Add analytics tracking to `/audit/[id]` route handler
- Log every unique page view with referrer source
- Track if visitor comes from Twitter, Slack, email, or direct
- Calculate weekly share-out rate

**Example:**
```
May 7: 10 audits → 1 URL shared (10%)
May 8: 15 audits → 2 URLs shared (13%)
May 9: 12 audits → 1 URL shared (8%)
Rolling: 125 audits → 12 URL views (9.6%)
```

---

## What to Instrument First (Priority Order)

### Week 1 — Core Instrumentation (CRITICAL)
1. **Audit Completion Events**
   - Event name: `audit_completed`
   - Properties: `tool_count`, `total_savings`, `savings_tier` (low/medium/high)
   - When: After audit engine runs successfully

2. **Email Capture Events**
   - Event name: `email_captured`
   - Properties: `email`, `company`, `audit_id`
   - When: User successfully submits lead form

3. **Daily Metrics Dashboard**
   - Audits completed (daily + cumulative)
   - Email capture rate (%)
   - High-savings rate (%)

### Week 2 — Extended Instrumentation
1. **Shareable URL Events**
   - Event name: `audit_url_viewed`
   - Properties: `audit_id`, `referrer_source`, `timestamp`
   - When: Someone visits `/audit/[id]`

2. **CTA Click Events**
   - Event name: `cta_clicked`
   - Properties: `cta_type` (credex_consult | notify_me), `audit_id`
   - When: User clicks primary CTA button

---

## Pivot Trigger #1: Email Capture Rate Drops Below 40%

**When this happens:** After Week 2, if email capture rate falls to <40%

**Possible causes:**
- Form/UX friction too high (too many fields, unclear labels)
- Audit results not compelling (recommendations weak or generic)
- Trust issue (users don't believe savings estimates)
- Value proposition misaligned with visitor expectations

**Response plan:**
1. Run 2-3 quick user interviews: "Why didn't you enter your email?"
2. Test UX variations: move email gate later, simplify form, add trust signals
3. Audit recommendation quality: are we finding real savings?
4. A/B test email copy: test different CTA messaging

**Recovery target:** Restore to 55%+ within 3 days of changes

---

## Pivot Trigger #2: High-Savings Rate Stays Above 65% for 2 Weeks

**When this happens:** Consistent >65% high-savings audits across multiple days

**Possible meaning:**
- Audit recommendations might be unrealistic (too optimistic)
- Targeting wrong segment (users already highly optimized)
- Calculation logic might be inflated

**OR (Good scenario):**
- Product is genuinely finding huge optimization opportunities
- Word-of-mouth is attracting right target segment
- Market is larger than expected

**Response plan:**
1. Manually review 5-10 audit results: are savings realistic?
2. Check: Are users with high savings actually converting to Credex customers?
3. If realistic + converting: DOUBLE DOWN on GTM channels finding this segment
4. If unrealistic: Recalibrate audit engine conservativeness

---

## Key Metrics for Credex (Internal KPIs)

Track these weekly:

| Metric | Month 1 Target | Month 3 Target | Month 6 Target |
|--------|---|---|---|
| **Monthly Audits** | 25+ | 300+ | 1,000+ |
| **Email Capture Rate** | 55%+ | 60%+ | 62%+ |
| **High-Savings Rate** | 40%+ | 42%+ | 40-45% |
| **Shareable URL Rate** | 5%+ | 9%+ | 12%+ |
| **CTA Click-Through** | 15%+ | 18%+ | 20%+ |
| **Lead Value (avg)** | $220 | $220 | $250 |

---

## Analytics Implementation Checklist

- [ ] Create analytics events in audit completion handler
- [ ] Log email captures with success/failure tracking
- [ ] Add shareable URL route instrumentation
- [ ] Create daily metrics dashboard/report
- [ ] Set up alerts for threshold violations
- [ ] Weekly review meeting on metrics trends
- [ ] Document any audit engine recalibrations
- [ ] Track which GTM channels drive highest-quality audits
