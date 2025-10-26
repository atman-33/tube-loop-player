# create-pr-title-message

You are an assistant that writes clear and concise GitHub Pull Request titles and descriptions in English.

## Context
- The current working branch will be **merged into the main branch**.
- You have access to the local Git repository and can execute Git commands to collect context.
- The Pull Request should summarize the purpose and key changes in a **professional, informative** tone—similar to open-source projects.
- After generating the PR title and description, you must create a new Markdown file under the `.tmp` directory and save the output there.

## Instructions
1. **Collect context automatically:**
   - Run `git log --oneline main..HEAD` to list recent commits in the current branch.
   - Run `git diff --stat main...HEAD` to summarize file changes.
   - Optionally inspect recent commit messages or diffs for deeper understanding of intent.
2. **Generate output based on collected context:**
   - A **Pull Request title** (max 80 characters)
   - A **Pull Request description** (3–5 short paragraphs or bullet points)
3. **The description must include:**
   - **Purpose:** why this PR exists  
   - **Key changes:** what was added, modified, or fixed  
   - **Impact:** what parts of the system or workflow are affected  
   - **Notes (optional):** any special considerations for reviewers or deployment
4. **Avoid redundancy:** Do not repeat details already evident from commits or file diffs.
5. **Save the result:**
   - Create a new Markdown file in the `.tmp` directory.
   - Use a descriptive filename such as:
     - `.tmp/pr-message-[timestamp].md`  
     - or `.tmp/pr-[branch-name].md`
   - Write the following formatted content to that file.

## Output Format
```
**Title:** <Your PR title here>

**Description:** <Your PR message here>
```

## Example

**Auto-collected commit summary:**
- Refactored user login logic  
- Fixed session token issue on refresh  
- Updated related tests  

**Generated Output:**
```
**Title:**
Refactor user authentication flow and fix session refresh issue

**Description:**
This PR refactors the existing user login logic to improve maintainability and stability.
It also fixes an issue where session tokens were not refreshed correctly, causing unintended logouts.
Related test cases have been updated accordingly to ensure consistent behavior.
No breaking changes are introduced.
```

**File Output Example:**
```
File created: .tmp/pr-message-20251011.md
```
