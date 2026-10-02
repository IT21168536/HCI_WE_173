# Development Plan for Three Members

## Phase 0 – Project Foundation

**Lead: Member 3**

- create React Native/Expo project
- run structure setup
- install SQLite/FileSystem/ImagePicker/SecureStore
- create theme constants
- create SQLite schema
- repositories
- seed demo users
- session/role routing

All members verify the app runs before feature work begins.

---

## Phase 1 – Shared Authentication

**Shared, integration lead Member 3**

Build:

- Login
- Register
- Role select
- Session check
- Logout
- Role-based navigation

Demo accounts should include multiple cooks and riders.

Example:

```text
customer1@test.com
cook1@test.com
cook2@test.com
rider1@test.com
rider2@test.com
```

---

## Phase 2 – Parallel Role Development

### Member 1 – Customer

Build in:

```text
app/(customer)/
src/features/customer/
```

Priority:

1. Home
2. Meal list/search
3. Meal details
4. Favourite
5. Cart
6. Checkout
7. Orders
8. Review
9. Profile

### Member 2 – Cook

Build in:

```text
app/(cook)/
src/features/cook/
```

Priority:

1. Dashboard
2. Meal list
3. Add meal
4. Edit meal
5. Availability
6. Orders
7. Order details
8. Status updates
9. Profile

### Member 3 – Rider + Core

Build in:

```text
app/(rider)/
src/features/rider/
src/core/
```

Priority:

1. Rider dashboard
2. Delivery details
3. Current delivery
4. Pickup confirmation
5. On-the-way status
6. Complete delivery
7. History
8. Core integration fixes

---

## Phase 3 – End-to-End Integration

Required working demo:

```text
Cook login
  → create meal
  → logout

Customer login
  → see cook meal
  → add to cart
  → create order
  → logout

Cook login
  → accept order
  → preparing
  → ready
  → logout

Rider login
  → see ready delivery
  → pickup
  → on the way
  → delivered
  → logout

Customer login
  → see completed order
  → leave review
```

This full flow is more important than adding many disconnected screens.

---

## Phase 4 – UX Polish

All members review:

- shared colour palette
- typography
- consistent card/button styles
- loading states
- empty states
- error states
- validation
- accessibility labels
- screen spacing
- safe areas

---

## Git Branches

```text
main
develop
feature/customer
feature/cook
feature/rider-core
```

### Merge Rules

- role member owns role folder
- shared/core change should be discussed before merge
- pull latest `develop` before integration
- do not commit directly to `main`

Suggested commits:

```text
feat(customer): add meal search and filters
feat(cook): add meal creation form
feat(rider): add delivery status flow
feat(db): add order repository
fix(ui): align shared order card spacing
```
