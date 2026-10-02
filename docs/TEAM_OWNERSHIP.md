# Three-Member Workload and Folder Ownership

The project is intentionally divided by **user role** so each member has a clear independent development area while still contributing to one end-to-end system.

## Member 1 – Customer

### Primary code ownership

```text
app/(customer)/
src/features/customer/
```

### Functional ownership

- customer home
- meal discovery
- search/filter
- meal details
- cook profile
- favourites
- cart
- checkout
- order list/tracking
- ratings/reviews
- customer profile

### Main database usage

- read `meals`
- manage `cart_items`
- create/read `orders`
- create/read `order_items`
- manage `favorites`
- create/read `reviews`

---

## Member 2 – Home Cook

### Primary code ownership

```text
app/(cook)/
src/features/cook/
```

### Functional ownership

- cook dashboard
- cook profile
- meal list
- create meal
- edit meal
- meal image selection
- portion/availability management
- incoming orders
- accept/reject order
- preparing/ready status
- scheduled orders
- cancellation handling
- cook order history

### Main database usage

- `cook_profiles`
- create/update `meals`
- read/update `orders`
- read `order_items`

---

## Member 3 – Delivery Rider + System Integration

### Primary code ownership

```text
app/(rider)/
src/features/rider/
src/core/
```

### Functional ownership

- rider dashboard
- delivery details
- pickup information
- pickup confirmation
- customer delivery information
- delivery-status update
- delivery completion
- delivery history
- SQLite initialization
- database schema/migrations
- repositories
- local authentication/session
- role routing integration
- local image/file storage infrastructure
- end-to-end integration

### Main database usage

- `users`
- `orders`
- `order_items`
- shared repositories

---

## Shared Area

```text
app/(auth)/
src/shared/
```

Shared work includes:

- login/register design
- app theme
- shared button/input/header
- common order card/status badge
- reusable loading/empty/error views
- validation helpers

### Rule

If a component is useful for only one role, keep it inside that role's feature folder.

If it is genuinely reusable across roles, put it in `src/shared/`.

## Git Branch Suggestion

```text
main
develop
feature/customer
feature/cook
feature/rider-core
```

Each member works primarily in their branch and role folders. Merge into `develop` for integration and testing.
