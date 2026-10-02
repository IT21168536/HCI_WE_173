# UX Design System

## 1. Design Source

The current UI direction comes from the supplied mobile mockups and HTML/CSS prototype.

The React Native implementation should keep that visual identity while adjusting the content from a generic restaurant app to a **home-cooked meal marketplace**.

## 2. Colour Palette

```text
Brand Coral        #FF5B45
Brand Dark         #ED4934
Header Charcoal    #353535
Main Text          #202020
Muted Text         #777777
Surface            #FFFFFF
Soft Background    #F6F7F8
Border             #E8E8E8
Danger             #D84636
Success            #2E7D32
Warning            #F9A825
Info               #2F80ED
```

### React Native theme

```ts
export const colors = {
  brand: '#FF5B45',
  brandDark: '#ED4934',
  header: '#353535',
  ink: '#202020',
  muted: '#777777',
  surface: '#FFFFFF',
  soft: '#F6F7F8',
  line: '#E8E8E8',
  danger: '#D84636',
  success: '#2E7D32',
  warning: '#F9A825',
  info: '#2F80ED',
};
```

## 3. Typography

Use Poppins or the closest available consistent app font.

```text
Screen title       22–24 / Bold
Section title      18–20 / SemiBold
Card title         14–16 / SemiBold
Body               13–15 / Regular
Caption            11–12 / Regular
Button             14–16 / SemiBold
```

## 4. Shape Language

- rounded pill search bar
- rounded CTA buttons
- soft rectangular cards
- circular profile avatars
- coral highlights/borders
- dark charcoal top bars where appropriate
- simple line icons
- light grey dividers

## 5. Spacing

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};
```

## 6. Radius

```ts
export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
};
```

## 7. Customer UX Direction

The existing design is visually suitable, but change generic restaurant wording.

Prefer:

```text
Search home-cooked meals or cooks
```

instead of:

```text
Restaurant, Foods, Drinks
```

Recommended categories:

- Rice & Curry
- Breakfast
- Lunch
- Dinner
- Vegetarian
- Healthy
- Traditional
- Desserts

Meal cards should clearly show the cook:

```text
Chicken Rice & Curry
by Nadeesha's Kitchen
★ 4.8
Rs. 650
3.2 km
8 portions available
```

## 8. Cook UX Direction

Cook UI should emphasize operational clarity:

- today's orders
- order status
- menu availability
- remaining portions
- scheduled/pre-orders
- large clear Accept / Reject / Preparing / Ready actions

Avoid unnecessarily decorative layouts on order-management screens.

## 9. Rider UX Direction

Rider UI should emphasize speed and clarity:

- pickup location
- customer address
- contact actions
- meal-ready state
- current status
- next required action

Use one primary status action per stage where possible.

## 10. Shared Components

Create reusable:

- `AppButton`
- `AppInput`
- `ScreenHeader`
- `MealCard`
- `OrderCard`
- `StatusBadge`
- `SearchBar`
- `EmptyState`
- `LoadingView`
- `Avatar`

## 11. UX States

Design and implement relevant states:

```text
Loading meals...
No meals available in this area.
No meals match your filters.
Sold out for today.
Order successfully placed.
The cook could not accept this order.
Couldn't load data. Try again.
Delivery is running later than expected.
```

## 12. Accessibility

- readable font sizes
- sufficient contrast
- clear field labels
- icons with text/accessible labels where necessary
- comfortable touch targets
- visible validation feedback
- do not communicate status through colour alone
