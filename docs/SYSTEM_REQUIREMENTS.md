# System Requirements

## 1. System Goal

Provide a mobile application that supports the complete home-cooked meal workflow between customers, home cooks and delivery riders.

## 2. Users

The system must support multiple accounts for each role:

- many customers
- many home cooks
- many delivery riders

All accounts are stored in one `users` table with a `role` field.

## 3. Shared Functions

- registration
- login
- logout
- session persistence
- profile management
- role-based navigation

## 4. Customer Requirements – Member 1

- customer home
- meal search
- filtering by location/price/type/dietary need
- view meal details
- view cook profile
- view ingredients/allergens/hygiene/reviews
- favourites
- cart
- checkout
- delivery or pickup choice
- scheduled/pre-order
- order tracking
- order history
- review completed order

## 5. Home Cook Requirements – Member 2

- cook dashboard
- cook profile
- create meal
- select/store meal image
- edit meal
- set price/category/ingredients/allergens
- set available portions
- mark available/sold out
- receive orders in one place
- accept/reject order
- update accepted → preparing → ready
- view scheduled orders
- handle cancellation
- order history

## 6. Delivery Rider Requirements – Member 3

- rider dashboard
- view ready/assigned delivery
- view cook pickup information
- see meal-ready status
- confirm pickup
- view customer delivery information
- contact cook/customer where supported
- update picked_up → on_the_way → delivered
- complete delivery
- delivery history

## 7. Non-Functional Requirements

- simple, consistent navigation
- readable typography
- responsive local database operations
- reliable local order persistence
- role-appropriate access
- accurate prices/availability/status information
- reusable maintainable code
- clear loading/empty/error feedback
- privacy-aware display of contact/location information
- Android-focused compatibility for assignment testing

## 8. MVP Exclusions

Not required for the first working prototype:

- real payment processing
- multi-device synchronization
- cloud backend
- live location tracking
- automatic rider assignment
- built-in map routing engine
- real-time chat
- push-notification backend
