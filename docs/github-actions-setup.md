# GitHub Actions Setup for Changesets

This document explains how to configure GitHub Actions permissions for the Changesets release workflow in your organization, including setting up npm publishing.

## Current Publishing Method

**Note**: This project uses **Trusted Publishing (OIDC)** for npm publishing. This is the recommended secure approach that eliminates the need for npm tokens.

### Setting Up Trusted Publishing (Current Method)

#### Step 1: Configure Trusted Publisher in npm

1. Go to [@neiropacks/ink-mouse on npm](https://www.npmjs.com/package/@neiropacks/ink-mouse)
2. Click **Settings** → **Trusted Publishers**
3. Click **Add Trusted Publisher**
4. Select **GitHub Actions**
5. Fill in:
   - **Organization**: `neiropacks`
   - **Repository**: `neiropacks/ink-tui-kit`
   - **Workflow filename**: `.github/workflows/release.yml`
   - **Environment**: (leave empty)
6. Click **Create**

**Note**: Each package needs its own Trusted Publisher configuration in npm.

#### Step 2: Verify Workflow Configuration

The workflow is already configured with the correct settings:

```yaml
permissions:
  contents: write
  pull-requests: write
  id-token: write  # Required for OIDC
```

This permission allows GitHub Actions to generate OIDC tokens for npm authentication.

#### Step 3: Test the Setup

1. Create a changeset: `bun changeset`
2. Commit and push to main
3. GitHub Actions will create a release PR
4. Merge the PR
5. GitHub Actions will publish to npm using Trusted Publishing

**No NPM_TOKEN secret needed!** ✅

---

## What is Trusted Publishing?

Trusted Publishing eliminates the need for npm tokens by using OpenID Connect (OIDC) to authenticate GitHub Actions directly with npm. Benefits:

- ✅ **No tokens to manage** - No long-lived secrets to rotate or leak
- ✅ **More secure** - Automatic, short-lived credentials
- ✅ **Provenance** - Automatically generates software supply chain transparency
- ✅ **Best practice** - Recommended by npm and GitHub
- ✅ **Generally available** - npm OIDC is generally available as of July 31, 2025

### Troubleshooting Trusted Publishing

#### Error: "404 Not Found" during publish

**Cause**: npm cannot match your workflow to the Trusted Publisher configuration.

**Solutions**:

1. Verify organization name matches GitHub URL exactly: `neiropacks`
2. Ensure repository is specified fully: `neiropacks/ink-tui-kit`
3. Check that workflow filename matches exactly: `.github/workflows/release.yml`
4. Ensure npm CLI version is 11.5.1+ (automatically updated in workflow)

For a complete troubleshooting guide including EACCES and E422 errors, see [npm Trusted Publishing OIDC Setup](solutions/ci-cd/npm-trusted-publishing-oidc-setup.md).

#### Error: "Permission denied"

**Cause**: Missing `id-token: write` permission.

**Solution**: Ensure workflow has:

```yaml
permissions:
  id-token: write  # This is REQUIRED
```

#### Error: "Package not found"

**Cause**: Package doesn't exist on npm yet.

**Solution**: The package `@neiropacks/ink-mouse` version 0.2.0 has already been published, so this error should not occur.

#### Error: "No publisher found"

**Cause**: Trusted Publishing not configured in npm.

**Solution**: Follow "Step 1" above to configure Trusted Publisher in npm dashboard.

---

## Current Configuration

The release workflow (`.github/workflows/release.yml`) uses **fine-grained permissions** for security:

- `contents: write` - for committing version bumps
- `pull-requests: write` - for creating release PRs
- `id-token: write` - for generating OIDC tokens for npm authentication

This follows the principle of least privilege - the workflow has only the permissions it needs.

## Required GitHub Settings

For the Changesets release workflow to work, you need to configure your repository or organization settings:

### Option 1: Fine-grained Permissions (Recommended)

Enable **"Fine-grained permissions for workflows"** in organization settings:

1. **Organization Settings** → **Actions** → **General**
2. Select **"Fine-grained permissions for workflows"**
3. **Save**

After this, each workflow will have only the permissions specified in its YAML file.

### Option 2: Repository-Level Settings (Alternative)

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select:
   - ✅ **Read and write permissions**
3. ✅ Check **Allow GitHub Actions to create and approve pull requests**
4. Click **Save**

### Option 3: Organization-Level Settings (For Private/Org Repos)

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

### Error: "ENEEDAUTH" when publishing to npm

**Cause**: Trusted Publisher is not configured in npm or configuration is incorrect.

**Solution**:

1. Verify Trusted Publisher is configured in npm for the package
2. Check that organization, repository, and workflow filename match exactly
3. Ensure workflow has `id-token: write` permission
4. Re-run the failed workflow

### Error: "404 Not Found" when publishing

**Cause**: Package doesn't exist on npm yet (first publication).

**Solution**: Publish the first version manually:

```bash
npm login
bun changeset publish
```

After first publication, automatic publishing will work.

## Additional Resources

### GitHub Actions & Permissions

- [GitHub Actions: Managing workflow permissions](https://docs.github.com/en/actions/managing-workflow-runs-in-github-actions/managing-workflow-permissions)
- [OAuth scopes and permissions for GitHub Actions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)

### npm Publishing

- [npm: Creating and viewing access tokens](https://docs.npmjs.com/creating-and-viewing-access-tokens)
- [npm: About automation tokens](https://docs.npmjs.com/about-access-tokens#automation-tokens)

### Changesets

- [Changesets: GitHub Action](https://github.com/changesets/action)
- [Changesets Documentation](https://github.com/changesets/changesets)

### Trusted Publishing

- [npm: About Trusted Publishing](https://docs.npmjs.com/generating-provenance-steps)
- [npm: Configuring Trusted Publishing](https://docs.npmjs.com/creating-and-viewing-access-tokens#configuring-trusted-publishing)
- [GitHub: About OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
