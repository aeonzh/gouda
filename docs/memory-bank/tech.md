# Technology Stack & Setup: Gouda E-Commerce Platform

## 1. Code Style Guidelines

This document outlines the coding standards and style guidelines for the Gouda project to ensure consistency and maintainability across the codebase.

### 1.1. Language & Type System

- **Language**: **TypeScript**
  - **Rationale**: Provides strong typing and improved code quality, catching errors at compile time and enabling better tooling support.

### 1.2. Code Formatting

- **Formatting Tool**: **Prettier**
  - **Rationale**: Enforces consistent code formatting automatically. Run `pnpm format` to auto-format code.

### 1.3. Linting

- **Linting Tool**: **ESLint** with `eslint-config-universe`
  - **Rationale**: Catches potential issues and enforces coding standards. Run `pnpm lint` to check for linting issues across the entire codebase, or `pnpm eslint <file>` for specific files.

### 1.4. Import Organization

- **Import Rules**: Follow ESLint import order rules
  - **Rationale**: Maintains consistent import organization across the project.
  - **Preference**: Use absolute imports for project modules (e.g., `import { Button } from '@/components/Button'`)

### 1.5. Naming Conventions

- **Variables and Functions**: `camelCase`
  - **Example**: `getUserProfile`, `cartItems`
- **React Components and Types**: `PascalCase`
  - **Example**: `UserProfile`, `CartItem`
- **Constants**: `UPPER_SNAKE_CASE`
  - **Example**: `API_BASE_URL`, `MAX_RETRY_ATTEMPTS`

### 1.6. Error Handling

- **Synchronous Operations**: Use standard `try-catch` blocks
  - **Example**:
    ```typescript
    try {
      const result = riskyOperation();
      return result;
    } catch (error) {
      console.error('Operation failed:', error);
      throw error;
    }
    ```
- **Asynchronous Operations**: Handle Promise rejections
  - **Example**:
    ```typescript
    async function fetchData() {
      try {
        const data = await apiCall();
        return data;
      } catch (error) {
        console.error('Fetch failed:', error);
        throw error;
      }
    }
    ```

### 1.7. Styling

- **Styling Approach**: **NativeWind** and **Tailwind CSS**
  - **Rationale**: Utility-first approach for rapid and consistent UI development without leaving component files.
  - **Usage**: Apply classes directly to components (e.g., `className="p-4 bg-white rounded-lg"`)

## 2. Core Technologies

This document outlines the primary technologies used in the Gouda project, along with setup instructions and technical constraints.

### 2.1. Frontend

- **Framework**: **React Native**
  - **Rationale**: A leading framework for building cross-platform mobile applications from a single codebase, enabling efficient development for both iOS and Android.
- **Platform**: **Expo**
  - **Rationale**: Simplifies React Native development with a managed workflow, easy-to-use tools, and a rich library of pre-built modules, accelerating the development and deployment cycle.
- **Styling**: **NativeWind**
  - **Rationale**: Brings the utility-first approach of Tailwind CSS to React Native, allowing for rapid and consistent UI development without leaving the component files.

### 2.2. Backend

- **Backend-as-a-Service (BaaS)**: **Supabase**
  - **Rationale**: An open-source Firebase alternative that provides a comprehensive suite of backend services, including a PostgreSQL database, authentication, auto-generated APIs, and storage.
- **Database**: **PostgreSQL**
  - **Rationale**: A powerful, open-source object-relational database system known for its reliability, feature robustness, and performance.
- **API**: **PostgREST**
  - **Rationale**: Auto-generates a RESTful API directly from the PostgreSQL schema, providing a secure and efficient way for the frontend applications to interact with the database.

### 2.3. Development & Tooling

- **Package Manager**: **pnpm**
  - **Rationale**: A fast and disk-space-efficient package manager, well-suited for managing dependencies in a monorepo.
- **Monorepo Management**: **Expo Monorepo Support**
  - **Rationale**: Leverages Expo's built-in capabilities for managing monorepos, ensuring seamless integration between the apps and shared packages.

## 2. Development Environment Setup

To set up the local development environment, follow these steps:

1.  **Clone the Repository**:

    ```bash
    git clone <repository-url>
    cd gouda
    ```

2.  **Install Dependencies**:
    Install `pnpm` if you haven't already, then install the project dependencies.

    ```bash
    npm install -g pnpm
    pnpm install
    ```

3.  **Set up Supabase Local Environment**:
    The project uses the Supabase CLI and Docker to run a local instance of the backend.
    - **Install Supabase CLI**:
      ```bash
      # Using Homebrew (macOS)
      brew install supabase/tap/supabase
      # Or using npm
      npm install supabase --save-dev
      ```
    - **Start Supabase Services**:
      This command will start all necessary Docker containers for the local backend.
      ```bash
      supabase start
      ```
    - **Apply Migrations**:
      To set up the database schema, apply the existing migrations.
      ```bash
      supabase db reset
      ```
      This command drops the local database and re-creates it using the SQL files in `supabase/migrations/`.

4.  **Run the Mobile Applications**:
    You can run either the B2C or B2B application on a simulator or a physical device.
    - **To run the B2C (Customer) App**:
      ```bash
      pnpm b2c
      ```
    - **To run the B2B (Admin) App**:
      ```bash
      pnpm b2b
      ```

## 3. Build, Lint & Test Commands

### 3.1. Development Servers

- **Start B2B (Admin) Application**:

  ```bash
  pnpm b2b
  ```

  Runs the administrative application on `http://localhost:8081`

- **Start B2C (Customer) Application**:
  ```bash
  pnpm b2c
  ```
  Runs the customer application on `http://localhost:8080`

### 3.2. Code Quality

- **Lint Entire Codebase**:

  ```bash
  pnpm lint
  ```

- **Lint Specific File** (recommended during development):

  ```bash
  pnpm eslint <file-path>
  ```

- **Format Code**:
  ```bash
  pnpm format
  ```

### 3.3. Testing

- **Current Status**: No explicit test command is configured in `package.json`. The testing framework and single test execution commands depend on the chosen testing setup (e.g., Jest).

## 4. Technical Constraints & Considerations

- **Offline Support**: The current architecture relies on a constant connection to the Supabase backend. There is no built-in offline support; implementing it would require a significant architectural addition (e.g., local database like WatermelonDB and a synchronization layer).
- **No Server-Side Rendering (SSR)**: As mobile applications, there is no concept of SSR. All rendering happens on the client device.
- **Stateless API**: The PostgREST API is stateless. All necessary context for a request (like authentication) must be provided in the request itself, typically via a JWT in the `Authorization` header.
- **Security is DB-Centric**: A significant portion of the application's security model, particularly data access control, is enforced at the database level through PostgreSQL's Row Level Security (RLS). This makes the RLS policies a critical part of the application's security.
