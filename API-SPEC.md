# Insurance Wizard API Specification

> **Status:** Contract for development team
> **Version:** 1.0

---

## Overview

The Insurance Wizard front-end collects travel insurance quote details from the customer and submits them as a single JSON payload to a REST API. The API processes the variables, performs the insurance search, and returns a **redirect URL** that takes the customer to continue their buying journey.

---

## Endpoint

```
POST /api/insurance/quote
Content-Type: application/json
```

---

## Request Payload

```json
{
  "agentCode":                  "WY992",
  "tripType":                   "single",
  "partyType":                  "couple",
  "destination":                "europe-inc",
  "cruise":                     false,
  "winterSports":               false,
  "carHireExcess":              false,
  "cancellationCover":          2500,
  "holidayStart":               "2026-04-15",
  "holidayEnd":                 "2026-04-22",
  "travellerCount":             2,
  "relationship":               "couple",
  "email":                      "matt@example.com",
  "medicalSurgeryTreatment":    false,
  "medicalUndiagnosedSymptoms": false,
  "medicalListedConditions":    false,
  "medicalRecentConditions":    false,
  "travellers": [
    { "title": "Mr",  "firstName": "Matthew", "lastName": "Pack", "dob": "27 / 04 / 1976" },
    { "title": "Mrs", "firstName": "Jane",    "lastName": "Pack", "dob": "15 / 09 / 1980" }
  ]
}
```

---

## Field Reference

### `agentCode`
- **Type:** `string` or `null`
- **Required:** No
- **Source:** URL parameter `?agent=XXX` or `agent` cookie
- **Examples:** `"WY992"`, `"HX001"`, `null`

### `tripType`
- **Type:** `string`
- **Required:** Yes
- **Values:** `"annual"` | `"single"`

### `partyType`
- **Type:** `string`
- **Required:** Yes — always present
- **Values:** `"solo"` | `"couple"` | `"family"` | `"group"`
- **Rules:** `"solo"` when `travellerCount` is 1; otherwise matches `relationship`

### `destination`
- **Type:** `string`
- **Required:** Yes
- **Values:**

| Value | Meaning |
|-------|---------|
| `"europe-inc"` | Europe **including** Spain, Cyprus, Malta, Turkey, Greece |
| `"europe-exc"` | Europe **excluding** Spain, Cyprus, Malta, Turkey, Greece |
| `"aus-nz"` | Australia & New Zealand |
| `"worldwide-inc"` | Worldwide **including** USA, Canada, Mexico, Caribbean |
| `"worldwide-exc"` | Worldwide **excluding** USA, Canada, Mexico, Caribbean |

### `cruise`
- **Type:** `boolean`
- **Required:** Yes
- **Values:** `true` | `false`

### `winterSports`
- **Type:** `boolean`
- **Required:** Yes
- **Values:** Currently always `false` (reserved for future use)

### `carHireExcess`
- **Type:** `boolean`
- **Required:** Yes
- **Values:** Currently always `false` (reserved for future use)

### `cancellationCover`
- **Type:** `integer`
- **Required:** Yes
- **Values:** `500` | `1000` | `2500` | `5000` | `6000` | `7000` | `8000` | `9000` | `10000` | `10001`
- **Note:** `10001` means the customer wants more than £10,000

### `holidayStart`
- **Type:** `string` (ISO date `YYYY-MM-DD`)
- **Required:** Yes
- **Description:** Holiday start date (single trip) or policy start date (annual)
- **Examples:** `"2026-03-01"`, `"2027-06-15"`

### `holidayEnd`
- **Type:** `string` (ISO date `YYYY-MM-DD`) or `null`
- **Required:** Only for single trip
- **Note:** Always `null` for annual cover

### `travellerCount`
- **Type:** `integer`
- **Required:** Yes
- **Range:** `1` to `9`

### `relationship`
- **Type:** `string` or `null`
- **Required:** Only when `travellerCount` >= 2
- **Values:** `"couple"` | `"family"` | `"group"` | `null`
- **Note:** `null` when solo traveller

### `email`
- **Type:** `string` or `null`
- **Required:** No
- **Examples:** `"matt@example.com"`, `null`

### `medicalSurgeryTreatment`
- **Type:** `boolean`
- **Required:** Yes
- **Description:** Undergoing/awaiting surgery, treatment, dialysis, cancer treatment, terminal illness, or addiction treatment in last 5 years

### `medicalUndiagnosedSymptoms`
- **Type:** `boolean`
- **Required:** Yes
- **Description:** Currently experiencing undiagnosed symptoms

### `medicalListedConditions`
- **Type:** `boolean`
- **Required:** Yes
- **Description:** Ever had heart/circulation, brain/nervous system, lung, digestive, or cancer conditions

### `medicalRecentConditions`
- **Type:** `boolean`
- **Required:** Yes
- **Description:** In last 2 years, any physical/psychological condition requiring treatment or medication

### `travellers`
- **Type:** `array` of objects
- **Required:** Yes
- **Length:** Matches `travellerCount`

Each traveller:

| Field | Type | Values |
|-------|------|--------|
| `title` | `string` | `"Mr"`, `"Mrs"`, `"Miss"`, `"Ms"`, `"Mx"`, `"Dr"` |
| `firstName` | `string` | Given name |
| `lastName` | `string` | Family name |
| `dob` | `string` | Format: `"DD / MM / YYYY"` e.g. `"27 / 04 / 1976"` |

---

## Response

### Success (200)

```json
{
  "redirectUrl": "https://www.holidayextras.com/insurance/quote/a1b2c3d4e5f6"
}
```

### Error (500)

```json
{
  "error": "Internal error",
  "detail": "Description of what went wrong"
}
```

---

## Examples

### Solo annual, Europe, no medical flags

```json
{
  "agentCode": null,
  "tripType": "annual",
  "partyType": "solo",
  "destination": "europe-inc",
  "cruise": false,
  "winterSports": false,
  "carHireExcess": false,
  "cancellationCover": 1000,
  "holidayStart": "2026-03-01",
  "holidayEnd": null,
  "travellerCount": 1,
  "relationship": null,
  "email": "alice@example.com",
  "medicalSurgeryTreatment": false,
  "medicalUndiagnosedSymptoms": false,
  "medicalListedConditions": false,
  "medicalRecentConditions": false,
  "travellers": [
    { "title": "Ms", "firstName": "Alice", "lastName": "Johnson", "dob": "12 / 06 / 1990" }
  ]
}
```

### Couple single trip, worldwide cruise, agent code, medical flag

```json
{
  "agentCode": "WY992",
  "tripType": "single",
  "partyType": "couple",
  "destination": "worldwide-inc",
  "cruise": true,
  "winterSports": false,
  "carHireExcess": false,
  "cancellationCover": 5000,
  "holidayStart": "2026-06-10",
  "holidayEnd": "2026-06-24",
  "travellerCount": 2,
  "relationship": "couple",
  "email": "matt@example.com",
  "medicalSurgeryTreatment": false,
  "medicalUndiagnosedSymptoms": false,
  "medicalListedConditions": true,
  "medicalRecentConditions": false,
  "travellers": [
    { "title": "Mr",  "firstName": "Matthew", "lastName": "Pack", "dob": "27 / 04 / 1976" },
    { "title": "Mrs", "firstName": "Jane",    "lastName": "Pack", "dob": "15 / 09 / 1980" }
  ]
}
```

### Family annual, Aus/NZ, max cancellation, multiple medical flags

```json
{
  "agentCode": "HX001",
  "tripType": "annual",
  "partyType": "family",
  "destination": "aus-nz",
  "cruise": false,
  "winterSports": false,
  "carHireExcess": false,
  "cancellationCover": 10001,
  "holidayStart": "2026-09-01",
  "holidayEnd": null,
  "travellerCount": 4,
  "relationship": "family",
  "email": null,
  "medicalSurgeryTreatment": true,
  "medicalUndiagnosedSymptoms": false,
  "medicalListedConditions": true,
  "medicalRecentConditions": true,
  "travellers": [
    { "title": "Dr",   "firstName": "James", "lastName": "Wilson", "dob": "03 / 11 / 1972" },
    { "title": "Mrs",  "firstName": "Sarah", "lastName": "Wilson", "dob": "22 / 07 / 1975" },
    { "title": "Miss", "firstName": "Emily", "lastName": "Wilson", "dob": "14 / 03 / 2010" },
    { "title": "Mr",   "firstName": "Tom",   "lastName": "Wilson", "dob": "30 / 01 / 2013" }
  ]
}
```

### Group single trip, Europe excluding

```json
{
  "agentCode": null,
  "tripType": "single",
  "partyType": "group",
  "destination": "europe-exc",
  "cruise": false,
  "winterSports": false,
  "carHireExcess": false,
  "cancellationCover": 500,
  "holidayStart": "2026-08-01",
  "holidayEnd": "2026-08-10",
  "travellerCount": 3,
  "relationship": "group",
  "email": null,
  "medicalSurgeryTreatment": false,
  "medicalUndiagnosedSymptoms": false,
  "medicalListedConditions": false,
  "medicalRecentConditions": false,
  "travellers": [
    { "title": "Mx",   "firstName": "Alex",  "lastName": "Rivera", "dob": "05 / 02 / 1995" },
    { "title": "Mr",   "firstName": "Sam",   "lastName": "Chen",   "dob": "19 / 08 / 1994" },
    { "title": "Miss", "firstName": "Priya", "lastName": "Patel",  "dob": "11 / 12 / 1996" }
  ]
}
```

---

## Business Rules

| Rule | Detail |
|------|--------|
| `holidayEnd` is `null` for annual | Annual cover has no end date |
| `relationship` is `null` for solo | Solo travellers skip relationship step |
| `partyType` is always `"solo"` for 1 traveller | Regardless of other state |
| `partyType` mirrors `relationship` for 2+ | Same values: couple, family, group |
| `winterSports` and `carHireExcess` always `false` | Reserved for future wizard steps |
| `cancellationCover: 10001` means £10,000+ | Customer needs more than £10k |
| `travellers` length matches `travellerCount` | Always exactly that number |
| `email` is `null` when skipped | Email step is optional |
| All 4 medical fields always present | `true` or `false`, never `null` |
