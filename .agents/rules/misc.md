---
description: Journal update protocol, commit message policy, and monorepo/source-of-truth practices.
alwaysApply: true
---

## Journal

Along with the usage of memory bank, make sure that before each session you check the current status in `JOURNAL.md`.
Every time we make a decision or a change or I say "Update journal" record that into `JOURNAL.md` explaining what changes have been made, or what decisions have been made along with the rationale brought us there. Be concise, but also explain:

- what root cause or reason of the change
- how the change addresses the root cause
- why the change addresses the root cause

Journal entries will be in a chronological order.
The result at the end of each session is a track record of our progress for future use.

## Git

- Never use `git add -A`. Only add the files that are relevant to the change.
- Never use `git commit --no-gpg-sign`.
- When requested to commit a change, generate a commit message that is relevant to the staged files following the conventional commits format. Always show the commit message and let the user review it before commit.
- The commit message will focus on the functional and structural updates, without explicitly mentioning `GEMINI.md` or `JOURNAL.md`.

## Other instructions

- This is a monorepo, so adding packages to the root will always require `-w`.
- Always look for information from the source of truth and not infere from surrounding context. e.g. When I ask "do we have a `business_details` table?" The answer should come from the database schema and not from the surrounding code, which could be outdated.
