@echo off
setlocal EnableExtensions

rem ============================================================
rem Worky Kitchen - React Native / Expo Folder Structure Setup
rem 3-member split: Customer / Cook / Rider + Shared Core
rem ============================================================

echo.
echo ============================================================
echo   Worky Kitchen - React Native Project Structure Setup
echo ============================================================
echo.

if not exist "package.json" (
  echo [ERROR] package.json was not found.
  echo.
  echo Run this file from the ROOT of your React Native Expo project.
  echo Example:
  echo   npx create-expo-app@latest worky-kitchen
  echo   cd worky-kitchen
  echo   setup_structure.bat
  echo.
  pause
  exit /b 1
)

echo [1/5] Creating role route folders...

call :mk "app\(auth)"

call :mk "app\(customer)\(tabs)"
call :mk "app\(customer)\meal"
call :mk "app\(customer)\cook"
call :mk "app\(customer)\review"

call :mk "app\(cook)\(tabs)"
call :mk "app\(cook)\meal"
call :mk "app\(cook)\meal\[id]"
call :mk "app\(cook)\order"

call :mk "app\(rider)\(tabs)"
call :mk "app\(rider)\delivery"

echo [2/5] Creating feature folders for 3 members...

for %%R in (customer cook rider) do (
  call :mk "src\features\%%R\components"
  call :mk "src\features\%%R\hooks"
  call :mk "src\features\%%R\services"
  call :mk "src\features\%%R\types"
)

echo [3/5] Creating shared core and shared UI folders...

call :mk "src\core\database\migrations"
call :mk "src\core\repositories"
call :mk "src\core\auth"
call :mk "src\core\storage"

call :mk "src\shared\components"
call :mk "src\shared\theme"
call :mk "src\shared\hooks"
call :mk "src\shared\types"
call :mk "src\shared\utils"

call :mk "assets\images"
call :mk "assets\icons"
call :mk "assets\fonts"
call :mk "assets\seed"
call :mk "docs"

echo [4/5] Creating Expo Router route placeholders...

call :touch "app\_layout.tsx"
call :touch "app\index.tsx"

rem ---------- Shared Auth ----------
call :touch "app\(auth)\_layout.tsx"
call :touch "app\(auth)\login.tsx"
call :touch "app\(auth)\register.tsx"
call :touch "app\(auth)\role-select.tsx"

rem ---------- MEMBER 1: CUSTOMER ----------
call :touch "app\(customer)\_layout.tsx"
call :touch "app\(customer)\(tabs)\_layout.tsx"
call :touch "app\(customer)\(tabs)\home.tsx"
call :touch "app\(customer)\(tabs)\orders.tsx"
call :touch "app\(customer)\(tabs)\favorites.tsx"
call :touch "app\(customer)\(tabs)\profile.tsx"
call :touch "app\(customer)\search.tsx"
call :touch "app\(customer)\meal\[id].tsx"
call :touch "app\(customer)\cook\[id].tsx"
call :touch "app\(customer)\cart.tsx"
call :touch "app\(customer)\checkout.tsx"
call :touch "app\(customer)\review\[orderId].tsx"

rem ---------- MEMBER 2: HOME COOK ----------
call :touch "app\(cook)\_layout.tsx"
call :touch "app\(cook)\(tabs)\_layout.tsx"
call :touch "app\(cook)\(tabs)\dashboard.tsx"
call :touch "app\(cook)\(tabs)\meals.tsx"
call :touch "app\(cook)\(tabs)\orders.tsx"
call :touch "app\(cook)\(tabs)\profile.tsx"
call :touch "app\(cook)\meal\add.tsx"
call :touch "app\(cook)\meal\[id]\edit.tsx"
call :touch "app\(cook)\order\[id].tsx"

rem ---------- MEMBER 3: DELIVERY RIDER ----------
call :touch "app\(rider)\_layout.tsx"
call :touch "app\(rider)\(tabs)\_layout.tsx"
call :touch "app\(rider)\(tabs)\dashboard.tsx"
call :touch "app\(rider)\(tabs)\current.tsx"
call :touch "app\(rider)\(tabs)\history.tsx"
call :touch "app\(rider)\(tabs)\profile.tsx"
call :touch "app\(rider)\delivery\[id].tsx"

echo [5/5] Creating core/shared placeholders...

rem ---------- Core database ----------
call :touch "src\core\database\database.ts"
call :touch "src\core\database\schema.ts"
call :touch "src\core\database\seed.ts"
call :touch "src\core\database\migrations\.gitkeep"

rem ---------- Core repositories ----------
for %%F in (user cook meal cart order favorite review) do (
  call :touch "src\core\repositories\%%F.repository.ts"
)

rem ---------- Auth / Session ----------
call :touch "src\core\auth\auth.service.ts"
call :touch "src\core\auth\session.service.ts"

rem ---------- Local image storage ----------
call :touch "src\core\storage\image.service.ts"

rem ---------- Shared components ----------
for %%F in (AppButton AppInput ScreenHeader MealCard OrderCard StatusBadge SearchBar EmptyState LoadingView Avatar) do (
  call :touch "src\shared\components\%%F.tsx"
)

rem ---------- Shared theme ----------
for %%F in (colors spacing radius typography) do (
  call :touch "src\shared\theme\%%F.ts"
)

rem ---------- Shared types ----------
for %%F in (User CookProfile Meal CartItem Order OrderItem Review) do (
  call :touch "src\shared\types\%%F.ts"
)

rem ---------- Shared utils ----------
for %%F in (validators formatCurrency dateUtils) do (
  call :touch "src\shared\utils\%%F.ts"
)

rem ---------- Helpful role README placeholders ----------
call :writeRoleReadme "src\features\customer\README.md" "MEMBER 1 - CUSTOMER" "Customer feature components, hooks, services and types. Main routes are under app/(customer)."
call :writeRoleReadme "src\features\cook\README.md" "MEMBER 2 - HOME COOK" "Home-cook feature components, hooks, services and types. Main routes are under app/(cook)."
call :writeRoleReadme "src\features\rider\README.md" "MEMBER 3 - DELIVERY RIDER" "Rider feature components, hooks, services and types. Main routes are under app/(rider). Member 3 also owns src/core integration."

echo.
echo ============================================================
echo   Structure created successfully.
echo ============================================================
echo.
echo Member 1 folders:
echo   app\(customer)
echo   src\features\customer

echo Member 2 folders:
echo   app\(cook)
echo   src\features\cook

echo Member 3 folders:
echo   app\(rider)
echo   src\features\rider

echo   src\core

echo Shared folders:
echo   app\(auth)
echo   src\shared

echo.
echo Required packages:
echo   npx expo install expo-sqlite expo-file-system expo-image-picker expo-secure-store

echo.
echo Recommended next steps:
echo   1. Copy AGENTS.md and docs folder into project root.
echo   2. Implement src\shared\theme constants.
echo   3. Implement SQLite schema and seed data.
echo   4. Implement login and role routing.
echo   5. Start the three role features in parallel.
echo.
pause
exit /b 0

:mk
if not exist "%~1" mkdir "%~1" >nul 2>&1
exit /b 0

:touch
if not exist "%~1" type nul > "%~1"
exit /b 0

:writeRoleReadme
if not exist "%~1" (
  >"%~1" echo # %~2
  >>"%~1" echo.
  >>"%~1" echo %~3
)
exit /b 0
