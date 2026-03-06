# Insurance Wizard

A working prototype of a travel insurance quote wizard for Holiday Extras. Collects ~20 variables across 14 steps and submits them to a quote API.

**Live demo:** https://protected-headland-61348-9c97c9907f71.herokuapp.com/

## What this is

A single-page app that walks a customer through the full travel insurance quote journey:

1. Cover type (annual / single trip)
2. Destination
3. Cruise cover
4. Cancellation cover level
5. Holiday start date
6. Holiday end date (single trip only)
7. Party size
8. Relationship type (skipped for solo travellers)
9. Traveller details (title, name, DOB — repeated per person)
10. Email (optional)
11. Eligibility declaration
12. Medical screening (4 questions)
13. Summary & submit
14. Results

The flow adapts based on choices — annual policies skip the end date, solo travellers skip the relationship step, and traveller details repeat for each person in the party.

## What it's for

This is a **prototype**, not a production application. It exists to:

- **Test the user journey** — click through on a real phone and find UX issues that wireframes miss
- **Drive out the API contract** — writing the spec first forced us to think through every field, validation rule, and edge case before anyone writes backend code
- **Give the technical team a clear build target** — the API spec is the source of truth for what the backend needs to deliver
- **Prove the tracking approach** — the HX Tracker integration validates our naming convention and gives analysts a working dataset to query against
- **Explore fast with AI tooling** — the wizard was built and iterated using Claude Code, with UX changes going from idea to deployed-and-live in minutes

## How it works

Two files, no framework, no dependencies:

- **`index.html`** — all HTML, CSS, and JavaScript in one self-contained file (~2,000 lines)
- **`api.js`** — a Node.js server that serves the static files and mocks the quote API endpoint

The mock API returns dummy quotes so the full journey can be tested end-to-end without a real backend. When the technical team delivers the real API, we swap one URL.

## Running locally

```bash
node api.js
```

Opens on http://localhost:3001

No `npm install` needed — there are zero dependencies.

## Deploying

The app is deployed to Heroku and auto-serves from the same Node.js server:

```bash
git push heroku main
```

**Heroku app:** protected-headland-61348
**Live URL:** https://protected-headland-61348-9c97c9907f71.herokuapp.com/

## Documentation

| Document | What it covers |
|----------|---------------|
| [API-SPEC.md](API-SPEC.md) | Full API contract — every field, validation rule, and response shape. This is what the technical team is building against. |
| [TRACKING.md](TRACKING.md) | Tracking integration — naming convention, stage map, implementation details, PII handling, and analyst queries. |
| [PROJECT-UPDATE.md](PROJECT-UPDATE.md) | Project summary for the insurance team — approach, UX learnings, and next steps. |

## What we're testing

### UX assumptions
- A step-per-screen wizard is clearer than a long scrollable form on mobile
- Calendar drill-down (year → month → day) is better than native date inputs across devices
- Optional email with a prominent "Skip" reduces friction without killing capture rates
- Inline validation and auto-advance (where possible) speeds up the journey

### Technical approach
- API-first: write the spec, build the UI against a mock, swap in the real backend later
- Single-file frontend: fast to iterate, easy to hand off, no build tooling to manage
- AI-assisted development: Claude Code for rapid prototyping, human judgement for direction

### Tracking convention
- `insurance-wizard-stage{N}-{name}` naming so `ORDER BY name ASC` gives chronological funnels
- Multi-field stages use `q1`, `q2`, `q3` numbering in visual order
- PII fields suppressed from auto-capture and tracked explicitly at submit time

## What's next

| Step | Description | Status |
|------|-------------|--------|
| **Quote API** | Real backend returning insurance quotes | Being built by tech team against [API-SPEC.md](API-SPEC.md) |
| **Pricing & Availability** | Live pricing for returned quotes | Needs spec |
| **Add-ons** | Optional extras and upgrades | Needs spec |
| **Payment redirect** | Hand-off to payment screen | Needs spec |
| **Image hosting** | Move logo/images to a CDN | Planned |
| **Tracker PR** | Contribute real-world integration guide back to HX Tracker repo | [PR #610](https://github.com/holidayextras/tracker/pull/610) |

Each new API stage will follow the same pattern: write the spec first, build the wizard screens against a mock, then swap in the real API when it's delivered.

## Tech stack

- **Frontend:** Vanilla HTML/CSS/JS (no framework)
- **Server:** Node.js (no dependencies)
- **Tracking:** [HX Tracker v5](https://github.com/holidayextras/tracker) via CloudFront CDN
- **Hosting:** Heroku
- **Source:** GitHub
- **Built with:** [Claude Code](https://claude.com/claude-code)
