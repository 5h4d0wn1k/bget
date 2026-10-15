# Branch Protection Rules

This document outlines the required branch protection rules for the `bget-website` repository.

## `main` branch

- **Status checks required:** `test` must pass (all jobs in the `test` job: `npm ci`, lint, `tsc --noEmit`, security audit (`npm audit`), and `npm run build`).
- **Pull request reviews:** At least **1 review** is required before merging.
- **Restrict pushes:** Only maintainers and CI can push directly (push via PR required).
- **Require conversation resolution:** All conversations must be resolved.
- **Require signed commits:** Optional but recommended (--optional enhancement).

## `staging` branch (optional)

- Same rules as `main` for consistency.
- Used for staging environment deployments when PRs are merged to `staging` or labeled with `preview`.

## Setup instructions

1. Go to **Settings → Branches** in the repository.
2. Add a protection rule for `main`.
3. Check the required status checks and select `test`.
4. Set "Require pull request reviews before merging" to 1.
5. Optionally enable "Restrict who can push to matching branches".
