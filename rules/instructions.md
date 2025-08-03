## Journal

Along with the usage of memory bank, make sure that before each session you check the current status in JOURNAL.md.
Every time we make a decision or a change or I say "Update journal" record that into JOURNAL.md explaining what changes have been made, or what decisions have been made along with the rationale brought us there. Be concise, but also explain:

- what root cause or reason of the change
- how the change addresses the root cause
- why the change addresses the root cause

Journal entries will be in a chronological order.
The result at the end of each session is a track record of our progress for future use.

## Git

- Always use git MCP tools.
- When requested to commit a change, generate a commit message that is relevant to the staged files following the conventional commits format. Always show the commit message and let the user review it before commit.
- The commit message will focus on the functional and structural updates, without explicitly mentioning GEMINI.md or JOURNAL.md.

## Other instructions

- This is a monorepo, so adding packages to the root will always require `-w`.
- Always look for information from the source of truth and not infere from surrounding context. e.g. When I ask "do we have a `business_details` table?" The answer should come from the database schema and not from the surrounding code, which could be outdated.

## Key areas for PRD development

When designing the platform, focus on these key areas:

1.  **User Authentication and Authorization**:
    - Define login mechanisms for all user roles (e.g., customers, business owners, sales agents).
    - Differentiate permissions and access levels between user roles.
2.  **Data Model**:
    - Identify core entities (e.g., Products, Orders, Customers, Stores, Inventory, Pricing).
    - Define the relationships between these entities.
3.  **B2B Side**:
    - Outline necessary functionalities for business users (e.g., managing products, inventory, orders, customer accounts, setting prices, generating reports).
4.  **B2C Side**:
    - Outline necessary functionalities for customers (e.g., browsing products, placing orders, viewing order history, managing their profile).
5.  **Order Processing**:
    - Define the order lifecycle: placement, confirmation, processing, and tracking.
6.  **Search and Filtering**:
    - Design effective product search and filtering mechanisms.
7.  **Pricing and Discounts** (Optional):
    - Consider how to handle wholesale pricing, tiered pricing, or customer-specific discounts.

---

# Notes

Compile those findings into a PRD. Use markdown format. It should contain the
following sections:

- Project overview
- Core requirements
- Core features
- Core components
- App/user flow
- Techstack
- Implementation plan

Based on the generated PRD, create a detailed step-by-step plan to build this project.
Then break it down into small tasks that build on each other.
Based on those tasks, break them into smaller subtasks.
Make sure the steps are small enough to be implemented in a step but big enough
to finish the project with success.
Use best practices of software development and project management, no big
complexity jumps. Wire tasks into others, creating a dependency list. There
should be no orphan tasks.

**VERY IMPORTANT:**

- Use markdown or asciidoc
- Each task and subtask should be a checklist item
- Provide context enough per task so a developer should be able to implement it
- Each task should have a number id
- Each task should list dependent task ids
