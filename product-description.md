# Product Description — Customer-Specific Pricing Tool

## Project Context

A customer-specific pricing profile tool for a food and beverage supplier.

The supplier needs a way to offer bespoke product prices to specific customers or customer groups to tailor commercial offers while protecting margin.

The app allows a supplier to:

1. Search and filter products by title, SKU, sub-category, segment, and brand.
2. Select products into a pricing profile using one of five product scopes.
3. Apply a fixed dollar, percentage, or custom price adjustment.
4. Choose whether the adjustment increases or decreases the base price.
5. Preview adjusted prices before saving, with live per-product calculations.
6. Save the pricing profile through an API.
7. Save the profile against a specific customer or customer group.
8. Resolve which pricing profile applies to a customer + product combination.
9. Batch-resolve prices for multiple products at once.

## Tech Stack

- React 18 frontend (Vite)
- Node.js + Express backend
- TypeScript (full stack)
- Mock in-memory data
- Tailwind CSS
- shadcn/ui (Radix primitives)
- Sonner (toast notifications)
- Lucide React (icons)
- OpenAPI 3.0 / Swagger UI (`/api-docs`)

## Demo Data (seeded)

- **5 products** across Wine, Beer, Non-Alcoholic, Food segments
- **6 customers** — some belong to customer groups
- **2 customer groups**: Independent Retailers, VIP
- **3 pre-seeded pricing profiles** (see Overlapping Profiles scenario below)

---

## Core Concepts

### Pricing Profile

A named set of product price adjustments saved against a customer or customer group.

Example: `"Bondi Cellars — Summer Wine Discount"`

### Customer Scope

| Scope | Description |
|---|---|
| Individual | Targets a single named customer |
| Group | Targets all customers in a named group |

### Product Scope

| Scope | Description |
|---|---|
| One Product | Targets a single product (single-select) |
| Multiple Products | Targets an explicit list of products (multi-select) |
| By Sub-Category | Targets all products in a sub-category |
| By Segment | Targets all products in a segment |
| All Products | Targets the entire catalogue (dynamic — includes future products) |

### Adjustment Types

| Type | Formula | Direction applies? |
|---|---|---|
| Fixed $ | `New Price = Base ± Amount` | Yes |
| Percentage % | `New Price = Base ± (Rate% × Base)` | Yes |
| Custom Price | `New Price = Target` | No |

---

## Pricing Rules

### Overlapping Profiles

In F&B wholesale, suppliers run multiple profiles simultaneously and customers often belong to more than one group.

**Scenario (pre-seeded)**

- Profile A: 10% off all Wine → "Independent Retailers" group
- Profile B: $15 off all Sparkling Wine → "VIP" group
- Profile C: Custom price $95 on Koyama Methode Brut Nature NV → "Bondi Cellars" (individual)

Bondi Cellars is in both groups and orders Koyama Methode Brut Nature NV. Three profiles match. **Profile C wins.**

### Specificity Scoring

The system scores each matching profile and picks the highest. More specific deals always beat broader ones.

| Dimension | Rule | Score |
|---|---|---|
| Customer | Individual customer | 10 |
| Customer | Customer group | 0 |
| Product | Exact product (one/explicit) | 10 |
| Product | Sub-category match | 5 |
| Product | Segment match | 1 |
| Product | All products | 0 |

**Total Score = Customer Score + Product Score**

Profile C above: Individual (10) + Exact product (10) = **20** — beats A (1) and B (5).

**Tie-break**: if two profiles score equally, the newer one (by `createdAt`) wins. This gives suppliers a natural override mechanism.

### Adjustment Calculation Examples

**Fixed**
```
Base Price: $120 | Adjustment: −$15 | New Price: $105
```

**Percentage**
```
Base Price: $100 | Adjustment: −10% | New Price: $90
```

**Custom Price**
```
Base Price: $130 | Target: $95 | New Price: $95
```

### Price Constraints

- New price is **never negative** — floored at `$0.00` (rounded to 2 decimal places).
- If any adjusted price reaches `$0.00`, a warning badge is shown in the preview and **saving is blocked**.

---

## Product Requirements

### Product Search and Filtering

- Search by title or SKU (debounced 300 ms)
- Dropdowns to filter by sub-category, segment, brand
- All active filters combine with AND logic
- Available on both the Pricing page (product selection) and the Resolve page (product lookup)

### Adjustment Flow

1. Choose **product scope** (One / Multiple / Sub-Category / Segment / All)
2. Select products (skipped for All Products scope)
3. Set **adjustment type**: Fixed $ | Percentage % | Custom Price
4. Set **adjustment direction**: Increase | Decrease (hidden for Custom Price)
5. Enter adjustment value
6. Review live preview
7. Click **Save Profile**

Save is blocked until:
- Profile name is filled
- A customer or group is selected
- At least one product is selected (except All Products scope)
- Adjustment value > 0
- No products result in a $0 price


## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | List products; filter via `search`, `sku`, `subCategory`, `segment`, `brand` query params |
| GET | `/api/customers` | List all customers with group memberships |
| GET | `/api/customer-groups` | List all customer groups |
| GET | `/api/pricing-profiles` | List all pricing profiles |
| GET | `/api/pricing-profiles/:id` | Get profile by ID |
| POST | `/api/pricing-profiles` | Create pricing profile; validates customer, resolves products, snapshots items |
| PUT | `/api/pricing-profiles/:id` | Update profile name; recomputes items at current base prices |
| DELETE | `/api/pricing-profiles/:id` | Delete profile |
| GET | `/api/resolve` | Resolve price for one customer + product (`?customerId=X&productId=Y`) |
| GET | `/api/resolve/batch` | Batch resolve (`?customerId=X&productIds=A,B,C`) |
| GET | `/api/health` | Backend health check |
| GET | `/api-docs` | Swagger UI |

### Resolve Response

Single resolve returns: `resolvedPrice`, `sourceProfileId`, `sourceProfileName`, `explanation` (full scoring breakdown).

Batch resolve returns per product: base price, resolved price, adjustment type/direction/value, profile name.

---

## Pages

### Pricing Page

Primary profile creation UI. Two sections:

- **Setup Profile** — profile name, customer scope toggle, customer/group selector
- **Setup Product Pricing** — product scope, product selection table, filters, adjustment panel, live preview, save button

### Resolve Page

Price resolution tester.

1. Select customer
2. Multi-select products from searchable list
3. Click **Resolve**
4. Results table: Product | Base Price | Adjustment (e.g. `−10% (automatic)`) | New Price | Profile Applied

Shows "No profile" per product if no rules match.
