# Git Rules

## Commit

Before committing, always ask for confirmation.
Before pushing, always ask for confirmation.

## Commit Message

### Commit Message Structure

```txt
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

e.g.

```txt
fix(api): prevent racing of requests

Introduce a request id, and add request id to any log message.

BREAKING CHANGE: drop support for Node 6
Refs: #123
```

### Commit Types

- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semicolons, etc)
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding missing tests or correcting existing tests
- chore: Changes to the build process or auxiliary tools and libraries such as documentation generation

- Commit messages should start with a present tense verb
- Do not add punctuation at the end of commit messages
- Commit messages should be written in English

## Pull Request

- Pull Request messages should be written in English

Before creating a pull request, always ask for confirmation.
Follow these steps to create a pull request:

1. First, create a `pr_body.txt` file describing the PR body.
2. Next, run the `gh pr create` command, specifying the created `pr_body.txt` file with the `--body-file` option, to create the PR.
3. After the PR is created, delete the unnecessary `pr_body.txt` file.

```txt
## Overview  
<!-- Briefly describe the purpose of this Pull Request. -->

## Changes  

- Change 1  
- Change 2  
- Change 3  

## Related Issue  

- Issue number (e.g., #123)
