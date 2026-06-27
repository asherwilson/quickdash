# Quickdash Changelog - Codex Session Log

## Session - 2026-06-26

### Completed
- Investigated why newly created Quickdash products/categories may not appear on Gemsutopia.
- Reviewed storefront product/category API routes, admin product/category create actions, schema, SDK client, package manifests, and workspace package config.
- Fixed storefront category product counts so the count is scoped to the authenticated storefront workspace.
- Fixed SDK category listing to request `?count=true`, matching the SDK type that promises `productCount`.
- Verified the current Gemsutopia storefront key against the live Quickdash API: the key is valid and returns 5 categories plus 1 active product.
- Confirmed the active product returned by the API has no category, so all category product counts are 0 and Gemsutopia category pages render empty.
- Added a Quickdash product form guard that requires a category when categories exist, plus helper copy explaining that categorized products are required for Gemsutopia category pages.
- Added `.pnpm-store/` to `.gitignore` after finding a repo-local pnpm cache with 85,345 files.
- Repaired pnpm workspace security override placement for pnpm 11 compatibility:
  - Moved active overrides from root `package.json` into `pnpm-workspace.yaml`.
  - Removed stale nested `apps/web/pnpm-workspace.yaml`.
  - Added current advisory override floors for transitive packages.
  - Bumped root `turbo` dev dependency floor to `^2.10.0`.
- Refreshed `pnpm-lock.yaml` with lockfile-only installs.

### Files Changed
- `apps/admin/app/api/storefront/categories/route.ts`
- `apps/admin/app/(dashboard)/products/[id]/product-form.tsx`
- `packages/sdk/src/client.ts`
- `package.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`
- `.gitignore`
- `apps/web/pnpm-workspace.yaml` (removed)
- `.Codex/changelog.md`

### Findings
- Storefront product lists only return products where `isActive = true`; inactive products will not show on Gemsutopia.
- Storefront access is fully determined by `X-Storefront-Key`; if Gemsutopia uses an old key or a key from another workspace, new records from the current workspace will not show.
- Gemsutopia category pages only show products assigned to the matching Quickdash category. Creating a product with no category makes it effectively invisible from those category pages even when it is active.
- The Gemsutopia site only needs a Storefront API key for reads/customer-safe operations. An Admin/API key is only needed for trusted server-side management writes and must never be exposed as `NEXT_PUBLIC_*`.
- Product/category slugs are globally unique in the schema, not workspace-scoped. This can block duplicate slugs across tenants and should be migrated to workspace-scoped unique indexes.
- `pnpm lint` now clears pnpm's build-script approval guard, but fails on existing repo lint debt:
  - `apps/web` ESLint crashes in `@eslint/eslintrc`/AJV.
  - `apps/admin` Biome reports a large pre-existing formatting/rule backlog.
- Audit is reduced to two remaining high advisories, both from `xlsx@0.18.5`.
- The local `.env.local` points to Postgres on `localhost:5434`; the DB was not running, so live Gemsutopia workspace data could not be verified from this checkout.
- A repo-local `.pnpm-store` cache existed with 85,345 files and about 1.2GB of data. It should not be committed.

### Verification
- `pnpm audit --json` now reports only `xlsx` advisories: 2 high, 0 critical.
- `biome lint apps/admin/app/api/storefront/categories/route.ts packages/sdk/src/client.ts` passed.
- `biome lint apps/admin/app/(dashboard)/products/[id]/product-form.tsx apps/admin/app/api/storefront/categories/route.ts packages/sdk/src/client.ts` passed.
- `tsc --noEmit -p packages/sdk/tsconfig.json` passed via the local TypeScript package.
- `tsc --noEmit -p apps/admin/tsconfig.json` passed via the local TypeScript package.

### What's Next
- Update existing uncategorized products in Reese's Quickdash workspace by assigning a category, then refresh/deploy Gemsutopia.
- Confirm Gemsutopia production has `NEXT_PUBLIC_STOREFRONT_API_KEY` and `NEXT_PUBLIC_STOREFRONT_URL` set to the current Quickdash workspace values.
- Replace `xlsx` or switch to the maintained SheetJS distribution source to clear the last audit advisories.
- Add a database migration to make product/category slugs unique per workspace instead of globally unique.
- Triage full lint separately: fix the web ESLint/AJV crash, then decide whether to mass-format admin or relax formatting checks.

## Session - 2026-06-27

### Completed
- Re-scanned the Quickdash/Gemsutopia product and category publishing flow after Reese still saw broken storefront behavior.
- Verified the live Storefront API now returns the active product under category `natural-rough1`, but `/categories?count=true` still reports `productCount: 0` for that category.
- Reworked the storefront categories endpoint to compute active product counts with an explicit grouped product query instead of a raw correlated count subquery.
- Added `Cache-Control: no-store, max-age=0` to authenticated Storefront API responses so storefront publish testing cannot receive stale API payloads.
- Audited the dashboard route map, API route map, navigation model, and database schema against the desired ecommerce-only Quickdash direction.

### Files Changed
- `apps/admin/app/api/storefront/categories/route.ts`
- `apps/admin/lib/storefront-auth.ts`
- `.Codex/changelog.md`

### Findings
- Quickdash currently mixes ecommerce backend, generic CMS/BaaS, CRM, messaging/calling, workflow automation, billing/subscription SaaS, and developer platform concepts.
- The ecommerce core is present and worth preserving: dashboard, analytics, orders, products, categories, variants, reviews, auctions, customers, inventory, subscriptions, shipping, suppliers, storefront API, storefront settings, payment settings, tax, team/settings, and API keys/webhooks.
- The strongest removal candidates are automation/workflows, marketing campaigns/email/referrals/SEO, CRM/sales/calls/scheduling, notifications/messages/activity-log duplication, billing/pricing/Polar subscription gating, music/social/server/presence features, and generic content/blog/pages if Quickdash is being narrowed to ecommerce store operations.
- Product and category slugs are still globally unique instead of workspace/store-scoped.
- Gemsutopia product detail rendering still hardcodes placeholder media in `ProductContent`, so product images can appear unpublished even when Quickdash returns product images correctly.

### Verification
- `biome lint apps/admin/app/api/storefront/categories/route.ts apps/admin/lib/storefront-auth.ts` passed using the local binary.
- `tsc --noEmit -p apps/admin/tsconfig.json` passed using the app-local TypeScript binary.
- `pnpm exec` commands are currently blocked by pnpm attempting an interactive modules purge; direct local binaries work.

### What's Next
- Push/deploy the category-count/no-store fix, then re-check `https://app.quickdash.net/api/storefront/categories?count=true` with the Gemsutopia key.
- Patch Gemsutopia `ProductContent` to use Quickdash product images instead of `placeholderMedia`.
- Decide whether the first cleanup pass should hide non-ecommerce navigation only, or physically remove routes/schema/dependencies in phases.
