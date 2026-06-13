# Customer Pricing App

F&B supplier tool for creating bespoke pricing profiles per customer.

## Running locally

```bash
# Backend (port 4000)
cd backend && npm install && npm run dev

# Frontend (port 5173)
cd frontend && npm install && npm run dev
```

API docs: http://localhost:4000/api-docs

---

## Precedence Rule

When a customer orders a product, multiple pricing profiles may match. The system resolves a single winner using a **specificity score**.


### Customer matching


### Scoring

| Dimension      | Rule                                   | Score |
| -------------- | -------------------------------------- | ----- |
| Customer scope | Individual customer                    | 10    |
| Customer scope | Customer group                         | 0     |
| Product scope  | Exact product (`product` / `explicit`) | 10    |
| Product scope  | Sub-category match                     | 5     |
| Product scope  | Segment match                          | 1     |
| Product scope  | All products                           | 0     |

**Total score = customer score + product score. Highest score wins.**

Tie-break: if two profiles score equally, the newer one (by `createdAt`) wins.


### Rationale

Specificity reflects commercial intent. A bespoke deal negotiated for one customer on one product ("we agreed $95 for Koyama") is a stronger commitment than a blanket group discount. The scoring encodes this: a 1:1 individual+product deal (score 20) always beats a group+category rule (score ≤ 5). This is unambiguous and maps directly to how F&B sales teams think: "the more specific the deal, the more it should stick."

---

## Overlap scenario

> Profile A: 10% off all Wine → Independent Retailers group

> Profile B: $15 off all Sparkling Wine → VIP group

> Profile C: $95 custom price on Koyama Methode Brut Nature NV → Bondi Cellars (individual)

Bondi Cellars is in both groups and orders Koyama Methode Brut Nature NV. Three profiles match.

| Profile                        | Customer score | Product score | Total           |
| ------------------------------ | -------------- | ------------- | --------------- |
| A (group + segment)            | 0              | 1             | **1**           |
| B (group + subCategory)        | 0              | 5             | **5**           |
| C (individual + exact product) | 10             | 10            | **20** ← winner |

**Bondi Cellars pays $95.**

```
GET /api/resolve?customerId=cust_006&productId=prod_001

{
  "resolvedPrice": 95,
  "sourceProfileId": "prof_scenario_c",
  "sourceProfileName": "Profile C — Koyama $95 (Bondi Cellars)",
  "explanation": "\"Profile C — Koyama $95 (Bondi Cellars)\" applied: individual customer (Bondi Cellars) + exact product match (Koyama Methode Brut Nature NV) → $95.00 [score 20] over 2 other matching profiles (scores: Profile B — Sparkling Wine $15 off (VIP): 5, Profile A — Wine 10% off (Independent Retailers): 1)"
}
```

---

## Adjustment types

| Type           | Formula                       | Example                       |
| -------------- | ----------------------------- | ----------------------------- |
| `fixed`        | `New = Base ± amount`         | $15 off a $120 product → $105 |
| `percentage`   | `New = Base ± (rate% × Base)` | 10% off $45 → $40.50          |
| `custom_price` | `New = target`                | Set $95 regardless of base    |

New price is always floored at $0.00 and rounded to 2 decimal places.

---

## Edge cases handled

- **Negative prices**: clamped to $0.00 (`Math.max(0, ...)`)
- **All Products scope**: resolved dynamically at query time — newly added products automatically fall under the profile
- **Deleted products**: items snapshot at profile creation; resolver skips product if no longer in catalogue
- **Tie-break**: newer profile wins, giving suppliers a natural override mechanism (create a new more-specific rule to override an old one)

  # Next steps:

  I would move the in-memory store to a persistent database and add stronger validation, automated tests, and API documentation. I would improve the pricing engine with configurable precedence, audit history, effective dates, and resolved price snapshots so historical orders remain consistent when profiles change. I would also clarify product-scope behaviour, such as whether “All Products” should automatically include future SKUs or remain fixed to the products available when the profile was created. Finally, I would explore AI-assisted pricing insights, such as flagging aggressive discounts, margin risks, or recommending pricing adjustments based on similar customer behaviour.

# Trade-offs:

I used an in-memory store to keep the implementation focused on the customer specific pricing behaviour. On the frontend, I used usedQuery to improve data fetching and loading states and reduce unnecessary rerenders. unsecured endpoint methods when schoosing products. I also focused on current pricing resolution first, while leaving historical price snapshotting, audit history, and advanced profile lifecycle rules as production improvements.
