# Agent Guidelines for Gouda Project

This document outlines essential commands and code style guidelines for agents working on the Gouda project.

## Build/Lint/Test Commands

- **Start Development Server**: `pnpm start` or `expo start`
- **Lint Code**: `pnpm run lint`
- **Format Code**: `pnpm run format`
- **Testing**: No explicit test command found in `package.json`. Testing framework and single test execution commands depend on the chosen testing setup (e.g., Jest).

## Code Style Guidelines

- **Language**: TypeScript for strong typing and improved code quality.
- **Formatting**: Enforced by Prettier. Run `pnpm run format` to auto-format code.
- **Linting**: Enforced by ESLint with `eslint-config-universe`. Run `pnpm run lint` to check for linting issues.
- **Imports**: Follow ESLint import order rules. Prefer absolute imports for project modules.
- **Naming Conventions**:
  - Variables and functions: `camelCase`
  - React Components and Types: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
- **Error Handling**: Use standard `try-catch` blocks for synchronous operations and handle Promise rejections for asynchronous code.
- **Styling**: Utilize NativeWind and Tailwind CSS for a utility-first approach.

## AI-Specific Rules

- **Cursor Rules**: No `.cursor/rules/` or `.cursorrules` found.
- **Copilot Instructions**: No `.github/copilot-instructions.md` found.

## Memories

Always save memories in this file.

Make sure that before each session you check the current status in STATUS.md.
Make sure that at the end of each session you save the progress status in STATUS.md.

Project Overview:

- Two mobile applications: Customer (B2C) and Administrative (B2B).
- Both built with React Native, Expo, NativeWind.
- Backend: Supabase (PostgreSQL, PostgREST, Auth, Storage).
- Monorepo structure.

Key Entities and Database Schema (Supabase):

- `profiles`: Extends `auth.users`, stores `username`, `full_name`, `avatar_url`, `role` (`admin`, `user`).
- `products`: `id`, `business_id`, `name`, `description`, `status` (`draft`, `published`, `rejected`), `price`, `image_url`, `category_id`, `stock_quantity`.
- `categories`: `id`, `business_id`, `name`.
- `carts`: `id`, `user_id`, `business_id`.
- `cart_items`: `id`, `cart_id`, `product_id`, `quantity`, `price_at_time_of_add`.
- `orders`: `id`, `user_id`, `business_id`, `total_amount`, `status` (`pending`, `processing`, `completed`, `cancelled`).
- `order_items`: `id`, `order_id`, `product_id`, `quantity`, `price_at_time_of_order`.
- `organisations`: `id`, `name`, `address`, `status` (`pending`, `approved`, `suspended`, `rejected`).
- `members`: `profile_id`, `business_id`, `role_in_business` (`owner`, `sales_agent`, `customer`).

Authentication:

- Supabase built-in Email/Password authentication.
- JWTs for authorization.

Row Level Security (RLS):

- Crucial for data access control.
- Policies defined for each table based on `auth.uid()`, `auth.jwt()`, and `members` table.
- Global `admin` role has full access.
- `owner` role is the business-specific admin.

API Interaction:

- Supabase auto-generated APIs (PostgREST) for CRUD operations.
- RPC for complex logic via PostgreSQL stored procedures.

Project Plan:

- Detailed plan already exists in `docs/project_plan.md` with phases, tasks, and subtasks. I should follow this plan.
