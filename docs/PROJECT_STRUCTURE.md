# Project Folder Structure

The structure separates the project by **Customer, Home Cook and Delivery Rider**, while shared infrastructure remains centralized.

```text
worky-kitchen/
│
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   │
│   ├── (auth)/                         # Shared authentication routes
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── role-select.tsx
│   │
│   ├── (customer)/                     # MEMBER 1
│   │   ├── _layout.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── home.tsx
│   │   │   ├── orders.tsx
│   │   │   ├── favorites.tsx
│   │   │   └── profile.tsx
│   │   ├── search.tsx
│   │   ├── meal/
│   │   │   └── [id].tsx
│   │   ├── cook/
│   │   │   └── [id].tsx
│   │   ├── cart.tsx
│   │   ├── checkout.tsx
│   │   └── review/
│   │       └── [orderId].tsx
│   │
│   ├── (cook)/                         # MEMBER 2
│   │   ├── _layout.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── meals.tsx
│   │   │   ├── orders.tsx
│   │   │   └── profile.tsx
│   │   ├── meal/
│   │   │   ├── add.tsx
│   │   │   └── [id]/
│   │   │       └── edit.tsx
│   │   └── order/
│   │       └── [id].tsx
│   │
│   └── (rider)/                        # MEMBER 3
│       ├── _layout.tsx
│       ├── (tabs)/
│       │   ├── _layout.tsx
│       │   ├── dashboard.tsx
│       │   ├── current.tsx
│       │   ├── history.tsx
│       │   └── profile.tsx
│       └── delivery/
│           └── [id].tsx
│
├── src/
│   ├── features/
│   │   ├── customer/                   # MEMBER 1
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   │
│   │   ├── cook/                       # MEMBER 2
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   │
│   │   └── rider/                      # MEMBER 3
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── types/
│   │
│   ├── core/                           # MEMBER 3 / shared infrastructure
│   │   ├── database/
│   │   │   ├── database.ts
│   │   │   ├── schema.ts
│   │   │   ├── seed.ts
│   │   │   └── migrations/
│   │   ├── repositories/
│   │   │   ├── user.repository.ts
│   │   │   ├── cook.repository.ts
│   │   │   ├── meal.repository.ts
│   │   │   ├── cart.repository.ts
│   │   │   ├── order.repository.ts
│   │   │   ├── favorite.repository.ts
│   │   │   └── review.repository.ts
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   └── session.service.ts
│   │   └── storage/
│   │       └── image.service.ts
│   │
│   └── shared/                         # ALL MEMBERS
│       ├── components/
│       │   ├── AppButton.tsx
│       │   ├── AppInput.tsx
│       │   ├── ScreenHeader.tsx
│       │   ├── MealCard.tsx
│       │   ├── OrderCard.tsx
│       │   ├── StatusBadge.tsx
│       │   ├── SearchBar.tsx
│       │   ├── EmptyState.tsx
│       │   └── LoadingView.tsx
│       ├── theme/
│       │   ├── colors.ts
│       │   ├── spacing.ts
│       │   ├── radius.ts
│       │   └── typography.ts
│       ├── hooks/
│       ├── types/
│       └── utils/
│
├── assets/
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── seed/
│
├── docs/
│   ├── PROJECT_STRUCTURE.md
│   ├── TEAM_OWNERSHIP.md
│   ├── SYSTEM_REQUIREMENTS.md
│   ├── DATABASE_SCHEMA.md
│   ├── SCREEN_MAP.md
│   ├── UX_DESIGN_SYSTEM.md
│   └── DEVELOPMENT_PLAN.md
│
├── AGENTS.md
├── README.md
├── setup_structure.bat
├── app.json
├── package.json
└── tsconfig.json
```

## Design Principle

There are **two levels of role separation**:

1. `app/(customer|cook|rider)` – role-specific navigation/screens.
2. `src/features/customer|cook|rider` – role-specific components and business logic.

Shared database/repositories remain in `src/core/` so the three user roles operate on the same local data.
