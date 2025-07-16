# Git Bash Cheat‑Sheet — Day‑to‑Day Team Work

> A quick‑reference for the Git commands you ask for most often, with ready‑to‑copy blocks. The examples assume your main branch is called `` and the remote is ``.

---

## 1. Sync your local **main** with the remote

Brief → keeps history linear and avoids extra merge commits. ([stackoverflow.com](https://stackoverflow.com/questions/2472254/when-should-i-use-git-pull-rebase?utm_source=chatgpt.com))

```bash
# switch to main (or use `git switch main`)
git checkout main
# fast‑forward or rebase onto the newest remote commits
git pull --rebase origin main
```

---

## 2. Create a feature branch off **main**

Creates and checks out a new branch in one step. ([stackoverflow.com](https://stackoverflow.com/questions/78717565/how-to-create-new-branches-from-previous-commits-using-git-bash?utm_source=chatgpt.com))

```bash
git checkout -b feature/<short‑slug> main   # equally: git switch -c feature/<slug> main
```

---

## 3. Push the new branch to GitHub and set upstream

`-u` links your local branch to the remote so later `git push`/`pull` need no extra args. ([stackoverflow.com](https://stackoverflow.com/questions/2765421/how-do-i-push-a-new-local-branch-to-a-remote-git-repository-and-track-it-too?utm_source=chatgpt.com))

```bash
git push -u origin feature/<short‑slug>
```

---

## 4. Keep your feature branch current while you code

Re‑apply your commits on top of the latest **main** for a clean history. ([git-scm.com](https://git-scm.com/book/en/v2/Git-Branching-Rebasing?utm_source=chatgpt.com))

```bash
# while on feature/<slug>
git fetch origin
git rebase origin/main
# resolve conflicts if any, then continue
```

*(Prefer rebase for private branches; use **`git merge origin/main`** if the branch is shared.)*

---

## 5. Push all work as you complete tasks

Simple push once upstream is set.

```bash
git push      # shorthand for git push origin HEAD
```

For tags or multiple branches:

```bash
git push --all && git push --tags  # publish everything ([github.com](https://github.com/git-guides/git-push?utm_source=chatgpt.com))
```

---

## 6. Override **local** files with the current remote **main**

*Danger: destroys unpushed changes.* ([stackoverflow.com](https://stackoverflow.com/questions/1125968/how-do-i-force-git-pull-to-overwrite-local-files?utm_source=chatgpt.com), [stackoverflow.com](https://stackoverflow.com/questions/1125968/how-do-i-force-git-pull-to-overwrite-local-files/75933465?utm_source=chatgpt.com))

```bash
git fetch origin
git reset --hard origin/main   # hard reset working tree & index
```

---

## 7. Force‑push when history was rewritten

`--force-with-lease` is the safe default; it aborts if someone else pushed meanwhile. ([stackoverflow.com](https://stackoverflow.com/questions/52823692/git-push-force-with-lease-vs-force?utm_source=chatgpt.com), [reddit.com](https://www.reddit.com/r/git/comments/ky0giq/difference_between_git_push_vs_git_push/?utm_source=chatgpt.com))

```bash
# after interactive rebase / amend commits
git push --force-with-lease origin feature/<short‑slug>
```

*(Use plain **`--force`** only if you’re ****certain**** nobody else touched the branch.)*

---

### Quick Troubleshooting

| Situation                               | One‑liner                                                    |
| --------------------------------------- | ------------------------------------------------------------ |
| Accidentally committed to `main`        | `git reset --soft origin/main` (then create branch & commit) |
| See what will be pushed                 | `git log origin/HEAD..HEAD --oneline --graph`                |
| Delete remote branch                    | `git push origin --delete feature/<slug>`                    |
| Undo last local commit but keep changes | `git reset --mixed HEAD~1`                                   |

---

**Tip:** Add aliases in your `~/.gitconfig` for the commands you use daily, e.g.

```ini
[alias]
  sync = !git checkout main && git pull --rebase origin main
  fp   = push --force-with-lease
```

