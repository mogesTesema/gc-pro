# Enterprise Contribution Guidelines

## Branch Naming Convention
Branches must follow the format: `<type>/<ticket-id>-<short-description>`
Types: `feat`, `fix`, `hotfix`, `chore`, `docs`.
Example: `feat/JIRA-123-add-auth-module`

## Commit Messages
We enforce [Conventional Commits](https://www.conventionalcommits.org/).
Format: `<type>(<scope>): <description>`

## Pull Requests
1. Ensure all CI tests pass.
2. Code coverage must not drop below 95%.
3. Requires at least 2 approvals from senior engineers.
