# Technology Stack & Setup: Gouda E-Commerce Platform

## 1. Core Technologies

This document outlines the primary technologies used in the Gouda project, along with setup instructions and technical constraints.

### 1.1. Frontend

- **Framework**: **React Native**
  - **Rationale**: A leading framework for building cross-platform mobile applications from a single codebase, enabling efficient development for both iOS and Android.
- **Platform**: **Expo**
  - **Rationale**: Simplifies React Native development with a managed workflow, easy-to-use tools, and a rich library of pre-built modules, accelerating the development and deployment cycle.
- **Styling**: **NativeWind**
  - **Rationale**: Brings the utility-first approach of Tailwind CSS to React Native, allowing for rapid and consistent UI development without leaving the component files.

### 1.2. Backend

- **Backend-as-a-Service (BaaS)**: **Supabase**
  - **Rationale**: An open-source Firebase alternative that provides a comprehensive suite of backend services, including a PostgreSQL database, authentication, auto-generated APIs, and storage.
- **Database**: **PostgreSQL**
  - **Rationale**: A powerful, open-source object-relational database system known for its reliability, feature robustness, and performance.
- **API**: **PostgREST**
  - **Rationale**: Auto-generates a RESTful API directly from the PostgreSQL schema, providing a secure and efficient way for the frontend applications to interact with the database.

### 1.3. Development & Tooling

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

## 3. Technical Constraints & Considerations

- **Offline Support**: The current architecture relies on a constant connection to the Supabase backend. There is no built-in offline support; implementing it would require a significant architectural addition (e.g., local database like WatermelonDB and a synchronization layer).
- **No Server-Side Rendering (SSR)**: As mobile applications, there is no concept of SSR. All rendering happens on the client device.
- **Stateless API**: The PostgREST API is stateless. All necessary context for a request (like authentication) must be provided in the request itself, typically via a JWT in the `Authorization` header.
- **Security is DB-Centric**: A significant portion of the application's security model, particularly data access control, is enforced at the database level through PostgreSQL's Row Level Security (RLS). This makes the RLS policies a critical part of the application's security.
