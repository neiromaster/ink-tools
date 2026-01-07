# GitHub Actions Setup for Changesets

This document explains how to configure GitHub Actions permissions for the Changesets release workflow in your organization.

## Current Configuration

Both workflow files use **fine-grained permissions** for security:

- **CI workflow** (`.github/workflows/ci.yml`): `contents: read` only
- **Release workflow** (`.github/workflows/release.yml`): `contents: write` + `pull-requests: write`

This follows the principle of least privilege - each workflow has only the permissions it needs.

## Required GitHub Settings

For the Changesets release workflow to work, you need to configure your repository or organization settings:

### Option 1: Repository-Level Settings (Recommended for Public Repos)

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select:
   - ✅ **Read and write permissions**
3. ✅ Check **Allow GitHub Actions to create and approve pull requests**
4. Click **Save**

### Option 2: Organization-Level Settings (For Private/Org Repos)

If your organization restricts workflow permissions:

1. Go to **Organization Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select:
   - ✅ **Read and write permissions**
3. ✅ Check **Allow GitHub Actions to create and approve pull requests**
4. Optionally, restrict to specific repositories if needed

### Option 3: Manual Release Process (Most Secure)

If you want to minimize automation permissions:

1. **Disable automatic PR creation** in the release workflow
2. When releasing changes:

   ```bash
   # After merging changes to main
   bun changeset version

   # Push the version changes
   git push

   # Create PR manually for the release branch
   ```

## Security Best Practices

### Why This Approach?

- ✅ **Principle of Least Privilege**: Each workflow has minimal required permissions
- ✅ **Audit Trail**: All actions logged as GitHub Actions bot
- ✅ **No Personal Tokens**: No need for PATs tied to individual users
- ✅ **Granular Control**: Fine-grained permissions per workflow

### What Each Permission Does

- `contents: read` - CI can checkout code, but cannot modify
- `contents: write` - Release can commit version bumps and tags
- `pull-requests: write` - Release can create version PRs

### For Organization Security

If your organization has strict security requirements:

1. Consider using **GitHub Apps** instead of PATs for external integrations
2. Regularly audit workflow permissions in **Settings** → **Actions** → **General**
3. Use **environment protection rules** for publishing to npm
4. Enable **required reviews** for workflow changes

## Verification

After configuration, verify it works:

1. Create a changeset: `bun changeset`
2. Commit and push to main
3. Check **Actions** tab for the "Release" workflow
4. Confirm a PR is created for `changeset-release/main`

## Troubleshooting

### Error: "GitHub Actions is not permitted to create or approve pull requests"

**Solution**: Enable the checkbox in Settings as described in Option 1 or 2 above.

### Error: "Resource not accessible by integration"

**Solution**: Ensure the workflow has `contents: write` permission (already configured in `.github/workflows/release.yml`).

### Permission denied when publishing

**Solution**: Ensure `NPM_TOKEN` secret is set in repository settings with npm automation token.

## Additional Resources

- [GitHub Actions: Managing workflow permissions](https://docs.github.com/en/actions/managing-workflow-runs-in-github-actions/managing-workflow-permissions)
- [Changesets: GitHub Action](https://github.com/changesets/action)
- [OAuth scopes and permissions for GitHub Actions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
