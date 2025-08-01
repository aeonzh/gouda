# Clean Project

I'll help clean up development artifacts while preserving your working code.

First, let me create a safety checkpoint and backup:

```bash
# Create backup directory
BACKUP_DIR="$HOME/.claude/.ccplugins_backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Creating safety backup at: $BACKUP_DIR"

# Verify critical directories are protected
if [ -d "$HOME/.claude" ]; then
    echo "✓ .claude directory detected and will be protected"
fi
```

Then I'll identify what should be cleaned based on:

- Our conversation history
- Common development patterns
- Temporary files and artifacts

I'll look for and remove:

- Debug/log files
- Temporary files
- Failed implementation attempts
- Development artifacts
- Debug statements in code

Important: I will NEVER remove:

- The .claude directory (contains commands and configurations)
- .git directory
- Essential configuration files
- Source code files unless explicitly identified as temporary

When I find multiple items to clean, I'll create a todo list to process them safely.

Before removing anything, I'll:

1. Show you what I plan to remove
2. Create backups of files before deletion
3. Explain why it should be removed
4. Wait for your confirmation

If the cleanup encounters any errors:

- I'll stop immediately
- Report what failed
- Ensure partial changes can be rolled back
- Suggest alternative approaches

After cleanup, I'll verify the project still works properly by:

- Checking build/compile status
- Running basic sanity checks
- Confirming no critical files were affected

The goal is to keep only the clean, working solution while maintaining safety.

# Smart Git Commit

I'll analyze your changes and create a meaningful commit message.

First, let me check if this is a git repository and what's changed:

```bash
# Verify we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not a git repository"
    echo "This command requires git version control"
    exit 1
fi

# Check if we have changes to commit
if ! git diff --cached --quiet || ! git diff --quiet; then
    echo "Changes detected:"
    git status --short
else
    echo "No changes to commit"
    exit 0
fi

# Show detailed changes
git diff --cached --stat
git diff --stat
```

Now I'll analyze the changes to determine:

1. What files were modified
2. The nature of changes (feature, fix, refactor, etc.)
3. The scope/component affected

If the analysis or commit encounters errors:

- I'll explain what went wrong
- Suggest how to resolve it
- Ensure no partial commits occur

```bash
# If nothing is staged, I'll stage modified files (not untracked)
if git diff --cached --quiet; then
    echo "No files staged. Staging modified files..."
    git add -u
fi

# Show what will be committed
git diff --cached --name-status
```

Based on the analysis, I'll create a conventional commit message:

- **Type**: feat|fix|docs|style|refactor|test|chore
- **Scope**: component or area affected (optional)
- **Subject**: clear description in present tense
- **Body**: why the change was made (if needed)

```bash
# I'll create the commit with the analyzed message
# Example: git commit -m "fix(auth): resolve login timeout issue"
```

The commit message will be concise, meaningful, and follow your project's conventions if I can detect them from recent commits.

**Important**: I will NEVER:

- Add "Co-authored-by" or any Claude signatures
- Include "Generated with Claude Code" or similar messages
- Modify git config or user credentials
- Add any AI/assistant attribution to the commit

The commit will use only your existing git user configuration, maintaining full ownership and authenticity of your commits.

# Find TODOs

I'll locate all TODO comments and unfinished work markers in your codebase.

First, let me scan for various TODO patterns:

```bash
# Common TODO patterns across different languages
echo "Searching for TODOs, FIXMEs, and other markers..."

# Count different types based on project structure
echo "Analyzing codebase for markers..."

# Results will be shown after analysis
```

I'll search for these patterns:

- **TODO/Todo/todo**: General tasks to complete
- **FIXME/Fixme/fixme**: Known issues that need fixing
- **HACK/Hack/hack**: Temporary workarounds
- **XXX**: Warnings or problematic code
- **NOTE/Note**: Important notes that might indicate incomplete work
- Various comment styles based on your project's languages

For each marker found, I'll show:

1. **File location** with line number
2. **The full comment** with context
3. **Surrounding code** to understand what needs to be done
4. **Priority assessment** based on the marker type

I'll organize findings by:

- **Critical** (FIXME, HACK, XXX): Issues that could cause problems
- **Important** (TODO): Features or improvements needed
- **Informational** (NOTE): Context that might need attention

I'll also identify:

- TODOs that reference missing implementations
- Placeholder code that needs replacement
- Incomplete error handling
- Stubbed functions awaiting implementation

This helps you track and prioritize unfinished work in your codebase.

# Fix Broken Imports

I'll help fix import statements that broke after moving or renaming files.

First, let me analyze your project structure and identify any broken imports. I'll:

1. **Detect your project type** from file patterns and configurations
2. **Identify import/include patterns** specific to your language
3. **Check which imports are broken** by verifying if referenced files exist
4. **Find where files were moved** by searching for matching filenames

Based on what I find, I'll:

- Detect the import patterns used in your project
- Handle the specific syntax for your language
- Preserve your existing code style

If I find multiple broken imports, I'll create a todo list to fix them systematically.

For each broken import, I'll:

1. Show you the broken import with its location
2. Search for the moved/renamed file
3. Check for ambiguous matches

**For ambiguous cases:**

- If multiple files could match the import
- I'll list all possible options
- Show you the context
- Ask which file is the correct target
- Never guess when unsure

**Error handling:**

- If an import can't be resolved
- I'll report why it failed
- Continue with other fixable imports
- Suggest manual fixes if needed

After fixing imports:

- Verify the syntax is correct
- Ensure no new conflicts were introduced
- Report summary of changes made

This ensures your code continues to work after file reorganization with safety and clarity.

# Auto Format Code

I'll format your code using the project's configured formatter.

First, let me check if this project has a formatter configured by analyzing:

- Configuration files in the project root
- Build or task runner setups
- Editor configuration files
- Code style definitions

Based on what I find, I'll determine the appropriate formatting approach for your project.

I'll format only the files that have been modified to:

- Avoid unnecessary changes
- Keep the formatting focused
- Prevent touching vendor/dependency directories

After formatting, I'll show you what changed.

If no formatter is found:

- I'll list what I searched for
- Suggest popular formatters for your project type
- Ask if you'd like me to format manually using language conventions

If formatting fails:

- I'll show the exact error
- Explain what might be wrong
- Suggest fixes or alternatives

This ensures consistent code style according to your project's standards.

# Human Mode

I'll adjust my approach to be more practical and less perfectionist.

```bash
# Create mode indicator file
HUMAN_MODE_FILE="$HOME/.claude/.human_mode"
echo "active" > "$HUMAN_MODE_FILE"
echo "Human mode activated for this session"
```

When activated, I'll:

- Focus on solutions that work rather than perfect architecture
- Use simpler, more direct implementations
- Skip unnecessary abstractions and over-engineering
- Provide shorter, more focused explanations
- Consider common pitfalls and known issues upfront

My priorities will shift to:

- Getting things done quickly
- Using built-in solutions first
- Making pragmatic choices
- Avoiding analysis paralysis
- Anticipating typical integration problems

I'll proactively think about:

- Common edge cases that break in production
- Known compatibility issues between tools
- Typical async/timing bugs
- Common deployment gotchas
- Integration points that often fail

This helps when you need:

- Quick prototypes
- Practical fixes
- Simple solutions
- Less discussion, more action

To deactivate human mode:

```bash
rm -f "$HUMAN_MODE_FILE"
echo "Human mode deactivated"
```

The mode persists for your current session and affects how I approach all tasks.

# Make It Pretty

I'll improve code readability while preserving exact functionality.

First, let me create a safety commit and backup:

```bash
# Create a commit before changes
git add -A
git commit -m "Backup before prettifying code" || echo "No changes to commit"

# Create backup folder
BACKUP_DIR="$HOME/.claude/.prettify_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Creating backup at: $BACKUP_DIR"
```

I'll identify files to beautify based on:

- Files you specify, or if none specified, analyze the entire application
- Recently modified code
- Our conversation context

```bash
# Copy files to backup before modifications
if [ -n "$ARGUMENTS" ]; then
    cp -r "$ARGUMENTS" "$BACKUP_DIR/" 2>/dev/null || true
else
    # Backup all source files based on project structure
    echo "Backing up source files..."
fi
```

I'll improve:

- Variable and function names for clarity
- Code organization and structure
- Remove unused code and clutter
- Simplify complex expressions
- Group related functionality
- Fix loose or generic type declarations
- Add missing type annotations where supported
- Make types more specific based on usage

My approach:

1. Analyze current code patterns and type usage
2. Apply consistent naming conventions
3. Improve type safety where applicable
4. Reorganize for better readability
5. Remove redundancy without changing logic

I'll ensure:

- All functionality remains identical
- Tests continue to pass (if available)
- No behavior changes occur
- Backups are available for rollback

After beautifying, I'll:

- Show a summary of improvements
- Verify everything still works
- Create another commit with the improvements

```bash
# After prettifying, commit the changes
git add -A
git commit -m "Prettify code: improve readability and organization" || echo "No changes made"
```

This helps transform working code into maintainable code without risk.

# Remove Obvious Comments

I'll clean up redundant comments while preserving valuable documentation.

First, let me identify files with comments to review:

```bash
# Find files modified recently that likely have comments
if [ -d .git ]; then
    echo "Checking recently modified files for comments..."
    # I'll look at files changed recently in your project
else
    echo "Checking source files in the project..."
    # I'll scan for files that typically contain code
fi
```

I'll analyze each file and remove comments that:

- Simply restate what the code does
- Add no value beyond the code itself
- State the obvious (like "constructor" above a constructor)

I'll preserve comments that:

- Explain WHY something is done
- Document complex business logic
- Contain TODOs, FIXMEs, or HACKs
- Warn about non-obvious behavior
- Provide important context

For each file with obvious comments, I'll:

1. Show you the redundant comments I found
2. Explain why they should be removed
3. Show the cleaner version
4. Apply the changes after your confirmation

This creates cleaner, more maintainable code where every comment has real value.

# Code Review

I'll review your code for potential issues.

Let me examine the files we've been working on and any recent changes for:

1. **Security Issues**
   - Hardcoded credentials
   - Input validation problems
   - Potential vulnerabilities

2. **Common Bugs**
   - Null/undefined handling
   - Error handling gaps
   - Logic errors

3. **Performance Concerns**
   - Inefficient patterns
   - Memory leaks
   - Unnecessary operations

4. **Code Quality**
   - Dead code
   - Overly complex functions
   - Missing error handling

If I find multiple issues, I'll create a todo list to address them systematically.

For each issue I find, I'll:

- Show you exactly where it is
- Explain why it's a problem
- Suggest how to fix it

If I encounter errors during review:

- I'll continue checking other files
- Report what couldn't be analyzed
- Focus on the code I can access

This review focuses on real problems that could affect your application.

# End Coding Session

I'll summarize this coding session and prepare handoff notes.

Let me analyze what we accomplished by:

1. Looking at what files were created/modified
2. Checking git changes made during the session
3. Summarizing the work completed

```bash
# Find the latest session file
SESSION_FILE=$(ls -t .claude-sessions/session_*.log 2>/dev/null | head -1)

if [ -f "$SESSION_FILE" ]; then
    echo "" >> "$SESSION_FILE"
    echo "=== Session Summary ===" >> "$SESSION_FILE"
    echo "Ended: $(date)" >> "$SESSION_FILE"
    echo "" >> "$SESSION_FILE"
fi

# Check what changed
git diff --stat $(git rev-parse HEAD~1 2>/dev/null || echo HEAD) 2>/dev/null || echo "No git changes"
```

## Session Summary:

### Accomplished:

- I'll list all completed tasks from our conversation
- Files created/modified
- Problems solved

### Pending Items:

- Tasks started but not completed
- Known issues to address
- Next steps recommended

### Handoff Notes:

- Key decisions made
- Important context for next session
- Any blockers or dependencies

This summary helps maintain continuity between coding sessions.

# Start Coding Session

I'll begin a documented coding session to track progress and maintain context.

Creating session record with:

- Timestamp: Current date/time
- Git state: Current branch and commit
- Session goals: What we aim to accomplish

```bash
SESSION_DIR=".claude-sessions"
mkdir -p "$SESSION_DIR"
SESSION_FILE="$SESSION_DIR/session_$(date +%Y%m%d_%H%M%S).log"

echo "=== Claude Coding Session ===" > "$SESSION_FILE"
echo "Started: $(date)" >> "$SESSION_FILE"
echo "Branch: $(git branch --show-current 2>/dev/null || echo 'no git')" >> "$SESSION_FILE"
echo "Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'no git')" >> "$SESSION_FILE"
echo "" >> "$SESSION_FILE"
echo "Goals:" >> "$SESSION_FILE"
```

Please tell me:

1. What are we working on today?
2. What specific goals do you want to accomplish?
3. Any context I should know about?

I'll document these goals and track our progress throughout the session.

# Smart Test Runner

I'll run the tests for this project and help with any failures.

First, let me check if this project has tests configured:

I'll analyze:

- The project structure for test patterns
- Configuration files that might define test commands
- Common test directory names
- Files with test-related naming patterns
- Build or task runner configurations

Based on what I discover about your project, I'll identify how to run the tests.

After running the tests, I'll:

1. Parse any failures
2. Show you the specific errors
3. Explain what's wrong
4. Suggest how to fix them

If tests fail due to missing dependencies or configuration issues, I'll help identify and resolve those problems.

If no tests are found:

- I'll list all the patterns I searched for
- Show the project structure I analyzed
- Ask if tests exist in a non-standard location
- Offer to help set up a testing framework if needed

If I can't run the tests:

- I'll show the exact command that failed
- Explain possible reasons (missing deps, wrong command)
- Suggest fixes based on the error

My goal is to help you understand and fix test failures, not to hide them by changing assertions.

# TODOs to GitHub Issues

I'll scan your codebase for TODO comments and create GitHub issues automatically.

First, let me check if this is a GitHub repository and we have the necessary tools:

```bash
# Check if we're in a git repository with GitHub remote
if ! git remote -v | grep -q github.com; then
    echo "Error: No GitHub remote found"
    echo "This command requires a GitHub repository"
    exit 1
fi

# Check for gh CLI
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) not found"
    echo "Install from: https://cli.github.com"
    exit 1
fi

# Verify authentication
if ! gh auth status &>/dev/null; then
    echo "Error: Not authenticated with GitHub"
    echo "Run: gh auth login"
    exit 1
fi
```

Now I'll scan for TODO patterns in your code and analyze their context.

When I find multiple TODOs, I'll create a todo list to track which ones have been converted to issues.

For each TODO found, I'll:

1. Extract the comment content and surrounding code
2. Create a descriptive issue title
3. Include file location and context
4. Add appropriate labels
5. Create the issue on GitHub

I'll handle rate limits and show you a summary of all created issues.

This helps convert your development notes into trackable work items.

# Undo Last Operation

I'll help you rollback the last destructive operation performed by CCPlugins commands.

First, let me check for available backups and recent operations:

```bash
# Check for CCPlugins backup directory
BACKUP_DIR="$HOME/.claude/.ccplugins_backups"
if [ -d "$BACKUP_DIR" ]; then
    echo "Found backup directory. Recent backups:"
    ls -la "$BACKUP_DIR" | tail -10
else
    echo "No backup directory found."
fi

# Check git status for recent changes
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "\nGit status:"
    git status --short
fi
```

Based on what I find, I can:

1. **Restore from CCPlugins backup** - If a backup exists from /cleanproject or other commands
2. **Use git to restore** - If changes haven't been committed yet
3. **Identify what was changed** - Show you what was modified so you can decide

I'll analyze the situation and suggest the safest recovery method.

If multiple restore options exist, I'll:

- Show you what each option would restore
- Explain the implications
- Let you choose the best approach

This ensures you can confidently undo operations without losing important work.
