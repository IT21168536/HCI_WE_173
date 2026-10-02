# Screen Map

## Shared Authentication

```text
App Start
  ↓
Session Check
  ├── no session → Login / Register
  └── session → route by user.role
```

## Customer – Member 1

```text
Customer Home
 ├── Search / Filter
 ├── Meal Details
 │    └── Cook Profile
 ├── Favorites
 ├── Cart
 │    └── Checkout
 ├── Orders
 │    ├── Ongoing
 │    ├── Completed
 │    └── Cancelled
 ├── Review
 └── Profile
```

Customer bottom navigation:

```text
Home | Orders | Favorite | Profile
```

## Home Cook – Member 2

```text
Cook Dashboard
 ├── Meals
 │    ├── Add Meal
 │    └── Edit Meal
 ├── Orders
 │    └── Order Details
 └── Profile
```

Cook bottom navigation:

```text
Dashboard | Meals | Orders | Profile
```

## Delivery Rider – Member 3

```text
Rider Dashboard
 ├── Delivery Details
 ├── Current Delivery
 ├── Complete Delivery
 ├── History
 └── Profile
```

Rider bottom navigation:

```text
Dashboard | Current | History | Profile
```

## Full Business Flow

```text
Cook creates meal
      ↓
Customer discovers meal
      ↓
Customer places order
      ↓
requested
      ↓
Cook accepts
      ↓
accepted
      ↓
Cook prepares
      ↓
preparing
      ↓
Cook marks ready
      ↓
ready
      ↓
Rider confirms pickup
      ↓
picked_up
      ↓
Rider travels to customer
      ↓
on_the_way
      ↓
Rider completes handover
      ↓
delivered
      ↓
Customer reviews
```
