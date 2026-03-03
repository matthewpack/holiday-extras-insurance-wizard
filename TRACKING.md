# Insurance Wizard — HX Tracker Integration

Documentation for the tracking implementation on the Holiday Extras Insurance Wizard, built on the [HX Tracker](https://github.com/holidayextras/tracker) library.

---

## Quick Start

The tracker is loaded from the HX CDN and initialised on page load:

```html
<script src="//dbq5t2jl0vcpj.cloudfront.net/hx-tracker/tracker-v5-latest.min.js"></script>
```

```javascript
tracker.initialise({
  env: window.location.hostname === 'localhost' ? 'development' : 'production',
  service: 'insurance-wizard',
  organisation: 'Holiday Extras Limited',
  lb: false,
  untracked_inputs: [
    'travellerTitle', 'travellerFirstName', 'travellerLastName',
    'travellerDob', 'emailInput'
  ]
});
```

`untracked_inputs` suppresses auto-capture on form fields that contain PII. Those fields are tracked explicitly via `tracker.inline()` instead, so we control exactly what gets recorded.

---

## Naming Convention

Every tracked event follows a single, strict pattern:

```
insurance-wizard-stage{N}-{name}
```

Where `{N}` is the stage number (1–14) and `{name}` describes what was captured.

### Why?

Running a simple query:

```sql
SELECT name, value FROM tracking ORDER BY name ASC
```

…produces a clean, readable funnel because the stage numbers force alphabetical = chronological order.

### Multi-field stages

When a stage collects more than one piece of information, each field is numbered like questions on a form:

```
insurance-wizard-stage9-traveller1-q1-title       → Mr
insurance-wizard-stage9-traveller1-q2-firstname    → John
insurance-wizard-stage9-traveller1-q3-lastname     → Smith
insurance-wizard-stage9-traveller1-q4-dob          → 1990-05-15
insurance-wizard-stage9-traveller1-q5-continue     → Mr John Smith
```

The `q` numbers match the tab order / visual order of the fields on screen. The final question on a multi-field stage is always a **continue** button whose value summarises what the customer entered.

---

## Full Stage Map

| Stage | Name | Type | Values |
|-------|------|------|--------|
| 1 | `stage1-cover-type` | Single choice | `annual`, `single` |
| 2 | `stage2-destination` | Single choice | `europe-inc`, `europe-exc`, `aus-nz`, `worldwide-inc`, `worldwide-exc` |
| 3 | `stage3-cruise` | Yes / No | `yes`, `no` |
| 4 | `stage4-cancellation` | Single choice | `500`, `1000`, `2500`, `5000`, `6000`, `7000`, `8000`, `9000`, `10000`, `10001` |
| 5 | `stage5-coverstart` | Multi-field | q1-year, q2-month, q3-day, q4-continue |
| 6 | `stage6-coverend` | Multi-field | q1-year, q2-month, q3-day, q4-continue |
| 7 | `stage7-party-size` | Single choice | `1` – `9` |
| 8 | `stage8-relationship` | Single choice | `couple`, `family`, `group` |
| 9 | `stage9-traveller{N}` | Multi-field (×N) | q1-title, q2-firstname, q3-lastname, q4-dob, q5-continue |
| 10 | `stage10-email` | Multi-field | q1-email, q2-send _or_ q2-skip |
| 11 | `stage11-eligibility` | Confirm | q1-agree |
| 12 | `stage12-medical` | Multi-field (4 screens) | q1 – q4, each `yes` or `no` |
| 13 | `stage13-summary` | Confirm | q1-submit |
| 14 | `stage14-results` | Page view only | _(no click events)_ |

### Conditional stages

- **Stage 6** (cover end) is **skipped** for annual policies — only shown for single trip.
- **Stage 8** (relationship) is **skipped** when party size = 1.
- **Stage 9** repeats per traveller: `traveller1`, `traveller2`, etc.

### Stage numbering note

Stages are numbered for the **longest possible journey** (single trip, multiple travellers). Annual policies skip stage 6 but the numbering stays fixed — stages don't renumber. This means the `ORDER BY name ASC` output always lines up regardless of which path the customer took.

---

## Example: Full Single-Trip Funnel

What an analyst would see when running `SELECT name, value FROM tracking WHERE session = '...' ORDER BY name ASC`:

```
insurance-wizard-stage1-cover-type                  single
insurance-wizard-stage2-destination                 europe-inc
insurance-wizard-stage3-cruise                      no
insurance-wizard-stage4-cancellation                5000
insurance-wizard-stage5-coverstart-q1-year          2026
insurance-wizard-stage5-coverstart-q2-month         06
insurance-wizard-stage5-coverstart-q3-day           15
insurance-wizard-stage5-coverstart-q4-continue      2026-06-15
insurance-wizard-stage6-coverend-q1-year            2026
insurance-wizard-stage6-coverend-q2-month           06
insurance-wizard-stage6-coverend-q3-day             22
insurance-wizard-stage6-coverend-q4-continue        2026-06-22
insurance-wizard-stage7-party-size                  2
insurance-wizard-stage8-relationship                couple
insurance-wizard-stage9-traveller1-q1-title         Mr
insurance-wizard-stage9-traveller1-q2-firstname     John
insurance-wizard-stage9-traveller1-q3-lastname      Smith
insurance-wizard-stage9-traveller1-q4-dob           1990-05-15
insurance-wizard-stage9-traveller1-q5-continue      Mr John Smith
insurance-wizard-stage9-traveller2-q1-title         Mrs
insurance-wizard-stage9-traveller2-q2-firstname     Jane
insurance-wizard-stage9-traveller2-q3-lastname      Smith
insurance-wizard-stage9-traveller2-q4-dob           1992-08-22
insurance-wizard-stage9-traveller2-q5-continue      Mrs Jane Smith
insurance-wizard-stage10-email-q1-email             john@example.com
insurance-wizard-stage10-email-q2-send
insurance-wizard-stage11-eligibility-q1-agree
insurance-wizard-stage12-medical-q1                 no
insurance-wizard-stage12-medical-q2                 no
insurance-wizard-stage12-medical-q3                 no
insurance-wizard-stage12-medical-q4                 no
insurance-wizard-stage13-summary-q1-submit
insurance-wizard-stage14-results
```

Reading top-to-bottom tells you the entire customer story.

---

## Implementation Details

There are three tracking mechanisms in use. Which one you pick depends on the element.

### 1. `data-track-name` / `data-track-value` (auto-capture)

Used on **static HTML elements** where the value is known at page-render time — cards, buttons, yes/no options.

```html
<div class="card"
     data-track-name="insurance-wizard-stage2-destination"
     data-track-value="europe-inc"
     onclick="selectDestination('europe-inc')">
```

The tracker picks these up automatically on click. No JavaScript needed.

**Gotcha:** The tracker ignores `data-track-name` when an `id` attribute is present on the same element. If you need both, use `tracker.inline()` instead.

### 2. `tracker.inline()` (explicit capture)

Used when the value is **dynamic** or comes from a form field — traveller details, dates, email.

```javascript
// Capture a form field value (suppress the auto-capture version via untracked_inputs)
tracker.inline('capture', {
  name: 'insurance-wizard-stage9-traveller1-q1-title',
  value: 'Mr'
});

// Capture a button click with a computed value
tracker.inline('click', {
  name: 'insurance-wizard-stage5-coverstart-q4-continue',
  value: '2026-06-15'
});
```

Use `'capture'` for field values, `'click'` for button actions.

### 3. `tracker.page()` (page views)

Fired every time the wizard advances to a new step:

```javascript
tracker.page('insurance-wizard', { page_type: 'stage5-coverstart' });
```

This gives you page-view funnels in addition to the click/capture events.

### Dynamic elements (calendar)

The calendar year/month/day buttons are rendered in JavaScript. Tracking attributes are added in the template strings:

```javascript
const trackStage = type === 'start' ? 'stage5-coverstart' : 'stage6-coverend';

// Year buttons
`<button data-track-name="insurance-wizard-${trackStage}-q1-year"
         data-track-value="${y}"
         onclick="setCalYear('${type}', ${y})">${y}</button>`

// Month buttons
`<button data-track-name="insurance-wizard-${trackStage}-q2-month"
         data-track-value="${String(i + 1).padStart(2, '0')}"
         onclick="setCalMonth('${type}', ${i})">${m}</button>`

// Day cells
`<div data-track-name="insurance-wizard-${trackStage}-q3-day"
      data-track-value="${d}"
      onclick="selectCalDay('${type}', ${d})">${d}</div>`
```

---

## PII Handling

Form fields containing personally identifiable information have their `id` added to `untracked_inputs` in the initialisation config. This prevents the tracker's auto-capture from recording keystrokes.

Those fields are then tracked **explicitly** via `tracker.inline()` at the point of form submission — so we capture the final value once, not every keystroke.

**Suppressed fields:**
- `travellerTitle`
- `travellerFirstName`
- `travellerLastName`
- `travellerDob`
- `emailInput`

---

## For Analysts: Useful Queries

### Full funnel for a session
```sql
SELECT name, value
FROM tracking
WHERE session_id = '...'
ORDER BY name ASC;
```

### Drop-off by stage (how far did customers get?)
```sql
SELECT
  SUBSTRING(name, 1, CHARINDEX('-', name, 27) - 1) AS stage,
  COUNT(DISTINCT session_id) AS sessions
FROM tracking
WHERE name LIKE 'insurance-wizard-stage%'
GROUP BY SUBSTRING(name, 1, CHARINDEX('-', name, 27) - 1)
ORDER BY stage;
```

### Most popular destinations
```sql
SELECT value, COUNT(*) AS picks
FROM tracking
WHERE name = 'insurance-wizard-stage2-destination'
GROUP BY value
ORDER BY picks DESC;
```

### Email capture rate
```sql
SELECT
  COUNT(CASE WHEN name = 'insurance-wizard-stage10-email-q2-send' THEN 1 END) AS sent,
  COUNT(CASE WHEN name = 'insurance-wizard-stage10-email-q2-skip' THEN 1 END) AS skipped
FROM tracking;
```

---

## Adding a New Stage

If the wizard gains a new step, follow this checklist:

1. **Pick the stage number.** Insert it in sequence. If it sits between existing stages, renumber everything after it. The numbering must stay sequential.
2. **Single value?** Add `data-track-name` and `data-track-value` to the HTML element.
3. **Multiple fields?** Number them `q1`, `q2`, `q3`… in visual/tab order. The last question should be the continue button with a summary value.
4. **Dynamic value?** Use `tracker.inline('capture', { name, value })` for fields and `tracker.inline('click', { name, value })` for buttons.
5. **Contains PII?** Add the field's `id` to `untracked_inputs` and use `tracker.inline()` explicitly.
6. **Add page tracking.** Add the step's hash → stage name mapping to the `pageMap` object inside `showStep()`.
7. **Test.** Open browser dev tools → Network tab → filter by `tracker`. Click through the wizard and verify each event fires with the correct name and value.

---

## Reference

- **Tracker repo:** https://github.com/holidayextras/tracker
- **CDN:** `//dbq5t2jl0vcpj.cloudfront.net/hx-tracker/tracker-v5-latest.min.js`
- **Service name:** `insurance-wizard`
- **Organisation:** `Holiday Extras Limited`
- **Environment:** auto-detected (`localhost` → `development`, everything else → `production`)
