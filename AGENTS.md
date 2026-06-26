# Quickdash — Codex Instance Rules

## Hard Rules
- **NEVER** commit, push, or run any git commands. Only provide commit messages in chat.
- **NEVER** add Codex Co-Authored-By attribution to any commit message.
- **ALWAYS** update `.Codex/changelog.md` when completing work sections.
- **ALWAYS** read `.Codex/changelog.md` at session start to recover context.
- Log what was done, what files changed, and what's next.
- Stay in the quickdash domain only — gemsutopia has its own Codex instance.
- The user is the middleman between both instances and handles all git operations.

## Project Overview
Quickdash is a headless Backend-as-a-Service (BaaS) admin dashboard. It is NOT just an ecommerce dashboard. It connects to ANY frontend (templates, user stacks, Shopify, WordPress, Wix, etc.) and provides:
- Full dynamic content management (no hardcoded pages)
- Payment processing (Stripe, PayPal, Polar, Square)
- Order management
- Auth (OAuth configured, email auth WIP)
- Media management (workspace-scoped)
- Email (Resend integration)
- Template marketplace (planned)

## Architecture
- Monorepo: `apps/admin` (Next.js dashboard), `apps/web` (marketing site - planned), `packages/db` (Drizzle ORM + Neon Postgres)
- Multi-tenant: workspace-scoped everything
- Storefront API: `/api/storefront/*` — headless API that any frontend calls
- Credentials stored in `workspace_integrations` table (`credentials` JSONB, `metadata` JSONB)
- Auth: Better Auth with workspace isolation

## Key Files
- `apps/admin/lib/workspace-integrations.ts` — credential getters (testMode-aware)
- `apps/admin/lib/storefront-auth.ts` — storefront API auth middleware
- `apps/admin/app/(dashboard)/settings/` — workspace settings UI + server actions
- `apps/admin/app/api/storefront/` — headless API endpoints
- `apps/admin/app/api/webhooks/` — payment webhook handlers
- `packages/db/src/schema/` — database schema (Drizzle)

## Current State (as of session start)
See `.Codex/changelog.md` for detailed progress log.
