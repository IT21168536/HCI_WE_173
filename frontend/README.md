# Worky Kitchen Frontend

Expo SDK 57 and React Native application for the Worky Kitchen home-cooked meal delivery MVP.

## Install

```powershell
npm install
```

## Run

Start the development server from this `frontend` directory:

```powershell
npx.cmd expo start
```

Scan the QR code using Expo Go on a phone connected to the same network. To clear the Metro cache, run `npx.cmd expo start -c`.

Demo accounts use the password `demo-password`:

```text
customer1@test.com
cook1@test.com
rider1@test.com
```

## Structure

```text
app/                    # Expo Router screens
  (auth)/               # Authentication
  (customer)/           # Customer experience
  (cook)/               # Home-cook experience
  (rider)/              # Delivery-rider experience
src/
  core/                 # SQLite, repositories, authentication, storage
  features/<role>/      # Feature services and components
  shared/               # Shared UI, theme, hooks, types, and utilities
tests/                  # SQLite end-to-end workflow tests
```

## Checks

```powershell
npx.cmd tsc --noEmit
npx.cmd expo lint
npm.cmd run test:flow
```

See the root [README](../README.md) for the complete setup guide and evaluation walkthrough.
