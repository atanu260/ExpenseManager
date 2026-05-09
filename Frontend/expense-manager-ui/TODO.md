# TODO - ExpenseManager Frontend (Angular)

## Step 1: Create required folder structure + components (stubs)
- Create `src/app/core/models/index.ts`
- Create `src/app/core/services/auth.service.ts`, `transaction.service.ts`, `category.service.ts`, `budget.service.ts`
- Create `src/app/core/guards/auth.guard.ts`
- Create `src/app/core/interceptors/auth.interceptor.ts`

- Create layout components:
  - `src/app/layout/shell/shell.component.{ts,html,scss}`
  - `src/app/layout/sidebar/sidebar.component.{ts,html,scss}`
  - `src/app/layout/header/header.component.{ts,html,scss}`

- Create feature routes + components:
  - `src/app/features/auth/auth.routes.ts`
  - `src/app/features/auth/login/login.component.{ts,html,scss}`
  - `src/app/features/auth/register/register.component.{ts,html,scss}`
  - `src/app/features/dashboard/dashboard.component.{ts,html,scss}`
  - `src/app/features/transactions/transactions.component.{ts,html,scss}`
  - `src/app/features/budgets/budgets.component.{ts,html,scss}`
  - `src/app/features/categories/categories.component.{ts,html,scss}`
  - `src/app/features/savings/savings.component.{ts,html,scss}`

## Step 2: Wire routing + layout
- Update `src/app/app.routes.ts` to add public auth routes and protected feature routes under `Shell`.
- Update `src/app/app.ts` / `src/app/app.html` if needed.

## Step 3: Add baseline styling
- Update `src/styles.scss` with basic theme variables.
- Add minimal styling in Shell/Sidebar/Header and feature SCSS files.

## Step 4: Compile / run
- Run `npm test` or `ng build` to ensure everything compiles.

