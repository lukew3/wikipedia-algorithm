---
description: Commit all changes and push to remote
user_invocable: true
---

# Ship

Commit all staged and unstaged changes and push to the remote branch.

## Steps

1. Run `git status` and `git diff --stat` to understand current changes
2. Run `git log --oneline -5` to match commit message style
3. Stage all changes with `git add -A`
4. Write a concise commit message summarizing the changes (follow the repo's existing commit style: lowercase, imperative mood)
5. Commit and push to the current branch
6. Report the commit hash and branch pushed to
