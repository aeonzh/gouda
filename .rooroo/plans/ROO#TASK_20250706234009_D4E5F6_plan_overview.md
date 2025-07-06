# Plan: Rename "buyer" to "customer"

## Overall Strategy

This plan outlines the steps to globally rename all instances of "buyer" to "customer" across the entire project. The process is broken down into several sub-tasks to ensure a systematic and complete refactoring. The plan starts with an analysis phase to identify all occurrences, followed by execution phases for renaming directories, files, and content, and concludes with a documentation review.

## Sub-tasks List

1.  **Analyze 'buyer' occurrences:**
    - **Objective:** Find all instances of "buyer" in file/directory names and content.
    - **Assigned Expert:** `rooroo-analyzer`
2.  **Rename `apps/buyer` directory:**
    - **Objective:** Rename the main buyer-facing application directory.
    - **Assigned Expert:** `rooroo-developer`
3.  **Rename `apps/admin/app/buyers` directory:**
    - **Objective:** Rename the buyers-related directory in the admin app.
    - **Assigned Expert:** `rooroo-developer`
4.  **Rename remaining files and directories:**
    - **Objective:** Rename all other files and directories containing "buyer".
    - **Assigned Expert:** `rooroo-developer`
5.  **Replace "buyer" in file content:**
    - **Objective:** Update all code and text to use "customer" instead of "buyer".
    - **Assigned Expert:** `rooroo-developer`
6.  **Update documentation:**
    - **Objective:** Ensure all documentation is updated with the new terminology.
    - **Assigned Expert:** `rooroo-documenter`

## Key Dependencies

- Sub-tasks 2-6 are dependent on the successful completion and output of Sub-task 1.
- The developer tasks (2-5) should be executed before the documentation task (6).

## Assumptions Made

- The renaming should be case-sensitive where appropriate (e.g., `Buyer` -> `Customer`, `buyer` -> `customer`).
- The analysis in Sub-task 1 will be comprehensive and accurate.
