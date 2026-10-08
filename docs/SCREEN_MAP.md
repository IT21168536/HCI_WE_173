# Screen Map

## Shared Authentication

```text
Login / Register (role) / Forgot Password
App Start
  ↓
Session Check
  ├── no session → Login / Register
  └── session → route by user.role
```

## Customer – Member 1

```text
Customer Home
 ├── Cart badge → Cart
 ├── Search / Filter
 ├── Meal Details
 │    └── Cook Profile
 ├── Favorites
 ├── Cart
 │    └── Checkout
 ├── Orders
 │    ├── Ongoing
 │    ├── Completed
 │    ├── Cancelled
 │    └── Order tracking / cancel
 ├── Review
 └── Profile
      └── Edit Profile
```

Customer bottom navigation:

```text
Home | Orders | Favorite | Profile
```

## Home Cook – Member 2

```text
Cook Dashboard
 ├── Notifications
 ├── Sales Overview
 ├── Meals
 │    ├── Add Meal
 │    ├── Edit Meal
 │    │    └── Delete Meal
 │    └── Availability
 ├── Orders (New / Preparing / Ready)
 │    ├── Order Details
 │    ├── Cancellation request
 │    ├── Scheduled Orders
 │    └── Order History
 └── Profile
      ├── Edit Profile & Kitchen
      └── Reviews & Ratings
```

Cook bottom navigation:

```text
Dashboard | Meals | Orders | Profile
```

## Delivery Rider – Member 3

```text
Rider Dashboard
 ├── Ready deliveries (accept)
 ├── Delivery Details
 ├── Current Delivery
 ├── Complete Delivery
 ├── History
 └── Profile
      └── Edit Profile
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
