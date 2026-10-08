# HCI_WE_173 — Worky Kitchen (WOKY)

Worky Kitchen is an Expo/React Native mobile application that connects customers, home cooks, and delivery riders. The MVP runs locally on the phone and stores its data in SQLite.

## Technology

- Expo SDK 57 and React Native
- Expo Router
- Expo SQLite
- TypeScript
- Android, iOS, and web support

## Repository layout

```text
HCI_WE_173/
├── frontend/   # Expo React Native application
├── backend/    # Backend notes; the MVP currently uses local SQLite
└── docs/       # Requirements, schema, UX system, and screen documentation
```

## Prerequisites

Install the following before starting:

- Node.js 22.13 or newer
- npm
- Expo Go on an Android or iOS phone
- Git, if cloning the project

Keep the development computer and phone connected to the same network when using Expo Go.

## Clone and install

```powershell
git clone https://github.com/IT21168536/HCI_WE_173.git
cd HCI_WE_173\frontend
npm install
```

## Run with Expo Go

From the `frontend` directory, run:

```powershell
npx.cmd expo start
```

Scan the displayed QR code using Expo Go. You can also press `a` to open an Android emulator or `w` to open the web version.

If Metro has stale cached data, restart it with:

```powershell
npx.cmd expo start -c
```

On macOS, Linux, or a terminal that does not require the Windows `.cmd` suffix, use `npx expo start`.

## Demo accounts

Every demo account uses the password `demo-password`.

| Role | Email | Description |
|---|---|---|
| Customer | `customer1@test.com` | Customer with active and completed orders |
| Customer | `customer2@test.com` to `customer5@test.com` | Additional customer accounts |
| Home cook | `cook1@test.com` | Nadeesha Kitchen, Malabe |
| Home cook | `cook2@test.com` | Kamal's Homestyle, Rajagiriya |
| Rider | `rider1@test.com` | Rider with profile, schedules, and delivery history |
| Rider | `rider2@test.com` | Additional rider account |

## Main features

### Customer

- Browse and search meals
- Filter by type, price, area, and availability
- Manage favourites and a multi-kitchen cart
- Choose delivery or pickup and schedule orders
- Track, cancel, and review orders
- Manage customer profile details

### Home cook

- Manage meals, images, portions, and availability
- Accept, prepare, decline, and complete orders
- Handle scheduled orders and cancellation requests
- View sales charts, earnings, top meals, and reviews
- Manage kitchen and profile details

### Delivery rider

- View an analytics dashboard with delivery and earnings graphs
- Accept and progress active deliveries
- Create, view, update, pause, and delete working schedules
- Create and update rider and vehicle details
- Search completed delivery history and remove rider-side history entries
- Validate mobile numbers, emergency contacts, vehicle registrations, licence numbers, and working hours

## Demonstration workflow

1. Sign in as `cook1@test.com`, add a meal, and log out.
2. Sign in as `customer1@test.com`, add the meal to the cart, and place a delivery order.
3. Sign in as the cook and progress the order through accepted, preparing, and ready.
4. Sign in as `rider1@test.com`, accept the delivery, confirm pickup, start delivery, and complete it.
5. Sign in as the customer and submit a rating and review.
6. As the rider, open Profile to demonstrate vehicle details and working-schedule CRUD operations.

## Validation and checks

Run these commands from `frontend`:

```powershell
npx.cmd tsc --noEmit
npx.cmd expo lint
npm.cmd run test:flow
```

The flow test uses a temporary SQLite database and verifies authentication, customer ordering, cook order processing, rider delivery processing, rider profile persistence, schedule CRUD operations, history removal, validation, cancellations, reviews, and sales calculations.

## Troubleshooting

- If PowerShell blocks `npx.ps1`, use the documented `npx.cmd` commands.
- If the phone cannot connect, confirm that both devices use the same network and allow Node.js through the Windows firewall.
- After pulling database schema changes, fully reload the app so SQLite migrations can run.
- If dependencies are incompatible with the Expo SDK, run `npx.cmd expo install --fix` from `frontend`.

## Prototype limits

Payments, cloud synchronization, maps/live GPS, chat, and push notifications are outside the current MVP. Card payment is simulated, and all application data is stored locally on the device.
