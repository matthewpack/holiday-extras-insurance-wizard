# Insurance Wizard — Project Update

**Date:** 4 March 2026
**Author:** Matthew Pack
**For:** Insurance team (PM, Scrum Master, Designer)

---

## What is this?

A working prototype of a travel insurance quote wizard — a single-page app that walks a customer through ~20 questions and submits them to a quote API. You can use it right now:

**Live:** https://protected-headland-61348-9c97c9907f71.herokuapp.com/
**Code:** https://github.com/matthewpack/holiday-extras-insurance-wizard

This isn't a finished product. It's a prototype built to learn fast, test ideas, and give the technical team something concrete to build against. Everything described below is what we've discovered by doing.

---

## What we built

The wizard collects everything needed for a travel insurance quote:

1. Cover type (annual / single trip)
2. Destination (Europe inc/exc UK, Aus & NZ, Worldwide inc/exc USA)
3. Cruise cover (yes / no)
4. Cancellation cover (£500 – £10,000+)
5. Holiday start date (calendar picker)
6. Holiday end date (single trip only)
7. Party size (1–9)
8. Relationship type (couple / family / group — skipped for solo)
9. Traveller details (title, name, DOB — repeated per person)
10. Email (optional, inline send/skip)
11. Eligibility declaration
12. Medical screening (4 questions)
13. Summary & submit
14. Results (quotes returned from API)

The flow adapts: annual policies skip the end date, solo travellers skip the relationship question, and the traveller details screen repeats for each person in the party.

---

## The approach: API-first

The single most useful decision was to **write the API specification before writing any UI**.

We created [API-SPEC.md](API-SPEC.md) — a full contract defining every field the quote endpoint expects, every validation rule, and every response shape. This did three things:

1. **Gave the technical team a clear build target.** They don't need to reverse-engineer what the frontend expects. The spec is the source of truth.
2. **Let us build the wizard independently.** The prototype has a mock API that returns dummy quotes, so we could build and test the full user journey without waiting for the real backend.
3. **Forced us to think through edge cases early.** Writing the spec surfaced questions about field formats, optional vs required fields, and error handling that would have been painful to discover later.

The technical team is building the real API against this spec now. When it's ready, we swap one URL and the wizard talks to real data.

---

## What we learned about the UX

Building a clickable prototype — not wireframes, an actual working thing — taught us things that wouldn't have surfaced in static designs:

### Mobile-first matters immediately
The wizard looked fine on desktop but felt boxed-in on mobile with visible grey borders. Going full-width on small screens (no side margins, no card border) made it feel native. Small CSS change, big difference in feel.

### Sticky headers eat screen space
On mobile, a sticky header with the logo takes up precious vertical space. Making it scroll away gives the customer more room for the actual content — especially on the calendar picker and traveller forms where space is tight.

### Scroll-to-top on step change
When the wizard advances to the next step, the page needs to scroll to the top. Without this, customers land mid-page on mobile and miss the question heading. Easy to miss in desktop testing, obvious on a phone.

### Inline email is better than a full form
The email step originally had a text field and a separate submit button below it. Putting the send button inline (right next to the input) with a prominent "Skip this step" below made the whole interaction faster and the optional nature of email clearer.

### Calendar pickers need careful thought
Date picking for holiday start/end is a three-step drill-down: year → month → day. Each selection narrows the next. This felt more controlled than a native date input (which varies wildly across devices) and gave us full control over disabling past dates and limiting date ranges.

These aren't revolutionary insights individually. But the speed at which we found them — by clicking through a real thing on a real phone — would have been much slower with static mockups.

---

## How we built it (and how fast)

The prototype is two files:

- **index.html** — all HTML, CSS, and JavaScript in one self-contained file (~2,000 lines)
- **api.js** — a Node.js server that serves the page and mocks the API endpoint

That's it. No framework, no build step, no dependencies. This was deliberate: the goal was speed and portability, not production architecture.

The wizard was built and iterated using **Claude Code** (an AI coding tool). The workflow:

1. Describe what we want in plain English
2. Claude writes or modifies the code
3. Preview on device, give feedback
4. Claude makes the change, we preview again

This loop is fast — minutes per iteration, not hours. UX changes like "make it full-width on mobile" or "move the email button inline" went from request to deployed-and-live in under 5 minutes each.

**This is not about replacing developers.** The technical team is building the real API with proper architecture, testing, security, and scale. The prototype is a thinking tool — it lets us explore and learn before committing to expensive implementation work.

---

## Tracking: what we learned and gave back

We integrated the [HX Tracker](https://github.com/holidayextras/tracker) to instrument every step of the wizard. The goal was to be able to understand the customer journey from the data alone.

### The naming convention

We designed a naming pattern that makes analyst queries trivial:

```
insurance-wizard-stage{N}-{name}
```

With multi-field stages using question numbering:

```
insurance-wizard-stage5-coverstart-q1-year     → 2026
insurance-wizard-stage5-coverstart-q2-month    → 06
insurance-wizard-stage5-coverstart-q3-day      → 15
insurance-wizard-stage5-coverstart-q4-continue → 2026-06-15
```

The key insight: if stages are numbered sequentially, then `ORDER BY name ASC` returns events in chronological order. An analyst can run one query and read the entire customer journey top-to-bottom. No timestamp joins, no complex grouping.

Full details are in [TRACKING.md](TRACKING.md).

### Contributing back

While integrating the tracker, we hit a few gotchas that aren't in the official documentation — particularly around how `id` attributes interact with `data-track-name`, and patterns for handling PII fields. We've written these up as a [Real-World Integration Guide](tracker-pr/docs/real_world_guide.md) to contribute back to the tracker repo so the next team has an easier time.

---

## What's next

The wizard currently submits to a mock API that returns dummy quotes. The real journey has four more API stages:

| Step | What it does | Status |
|------|-------------|--------|
| **Quote API** | Takes the ~20 variables and returns insurance quotes | 🔨 Being built by tech team against [API-SPEC.md](API-SPEC.md) |
| **Pricing & Availability API** | Returns live pricing for the returned quotes | ⏳ Next — needs spec writing |
| **Add-ons API** | Returns available add-ons (extra cover, upgrades) | ⏳ After pricing |
| **Payment redirect** | Hands the customer off to a payment screen | ⏳ After add-ons |

Each of these will follow the same approach: **write the spec first**, then build the wizard screens against a mock, then swap in the real API when the tech team delivers it.

---

## How to use this

**Try it:** https://protected-headland-61348-9c97c9907f71.herokuapp.com/ — click through the whole journey on your phone. It takes about 90 seconds.

**Read the API spec:** [API-SPEC.md](API-SPEC.md) — this is what the tech team is building against.

**Read the tracking spec:** [TRACKING.md](TRACKING.md) — this is how we'll measure what customers do.

**Look at the code:** https://github.com/matthewpack/holiday-extras-insurance-wizard — it's all there, nothing hidden.

Feedback, questions, and ideas are all welcome. The whole point of building this early is to learn together.
