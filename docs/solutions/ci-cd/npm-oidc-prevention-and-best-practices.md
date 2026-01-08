---
problem:
  type: ci-cd
  category: npm_publishing
  severity: high
  summary: Comprehensive prevention strategies, common pitfalls, and best practices for setting up and maintaining npm Trusted Publishing with GitHub Actions
  status: reference
  verified: true

component:
  name: ".github/workflows/release.yml"
  affected_files:
    - .github/workflows/release.yml
    - packages/*/package.json
    - docs/github-actions-setup.md

dates:
  first_encountered: 2025-01-08
  resolved_at: 2025-01-08
  resolution_time: ~2 hours

tags:
  - ci-cd
  - npm
  - oidc
  - trusted-publishing
  - github-actions
  - provenance
  - security
  - changesets
  - best-practices
  - prevention

related_docs:
  - ./npm-trusted-publishing-oidc-setup.md
  - ../github-actions-setup.md
  - ../testing-monorepo-packages.md

---

# npm Trusted Publishing (OIDC) Prevention and Best Practices

This guide provides comprehensive prevention strategies, common pitfalls, and best practices for setting up and maintaining npm Trusted Publishing (OIDC) with GitHub Actions.

## Table of Contents

- [Prevention Checklist](#prevention-checklist)
- [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
- [Best Practices](#best-practices)
- [Testing Strategy](#testing-strategy)
- [Migration Guide](#migration-guide-npm_token-to-oidc)
- [Troubleshooting Reference](#troubleshooting-reference)

---

## Prevention Checklist

Use this checklist BEFORE setting up npm Trusted Publishing to avoid common issues.

### Prerequisites Verification

#### Package Requirements

- [ ] **Package exists on npm**: OIDC requires the package to be published at least once

  ```bash
  # Verify package exists
  npm view @ink-tools/package-name
  ```

- [ ] **Package is scoped**: Use `@scope/package-name` format
  - Required for Trusted Publishing
  - Enables proper provenance validation

- [ ] **Package version not published**: Check you're not republishing existing version

  ```bash
  # Check if version exists
  npm view @ink-tools/package-name versions --json | grep "0.2.3"
  ```

#### package.json Configuration

- [ ] **publishConfig.access**: Set to "public" for scoped packages

  ```json
  {
    "publishConfig": {
      "access": "public"
    }
  }
  ```

- [ ] **repository.url**: Must match GitHub repository URL exactly

  ```json
  {
    "repository": {
      "type": "git",
      "url": "git+https://github.com/neiromaster/ink-tools.git"
    }
  }
  ```

  **Critical**: The URL format must be:
  - Start with `git+https://`
  - End with `.git`
  - Match GitHub URL exactly (case-sensitive)

- [ ] **No trailing slashes in repository.url**: Ensure clean URL format

  ```json
  // Correct
  "url": "git+https://github.com/neiromaster/ink-tools.git"

  // Incorrect
  "url": "git+https://github.com/neiromaster/ink-tools.git/"
  ```

#### GitHub Actions Configuration

- [ ] **id-token: write permission**: Required at both workflow and job level

  ```yaml
  permissions:
    contents: write
    pull-requests: write
    id-token: write  # REQUIRED

  jobs:
    release:
      permissions:
        id-token: write  # ALSO REQUIRED here
  ```

- [ ] **npm CLI version 11.5.1+**: Use `actions/setup-node@v6` for automatic setup

  ```yaml
  - uses: actions/setup-node@v6
    with:
      node-version: "lts/*"
      registry-url: "https://registry.npmjs.org"
  ```

- [ ] **NPM_CONFIG_PROVENANCE: true**: Enable provenance generation

  ```yaml
  env:
    NPM_CONFIG_PROVENANCE: true
  ```

#### npm Dashboard Configuration

- [ ] **Trusted Publisher configured**: For each package in the monorepo
  - Organization: `neiromaster`
  - Repository: `neiromaster/ink-tools`
  - Workflow filename: `.github/workflows/release.yml`
  - Environment: (leave empty unless using environments)

- [ ] **No conflicting publishers**: Each package can only have one Trusted Publisher

  ```bash
  # Check existing publishers via npm dashboard
  # Navigate to: Package Settings → Trusted Publishers
  ```

#### GitHub Settings

- [ ] **Fine-grained permissions enabled**: In organization or repository settings
  - Settings → Actions → General
  - Enable "Fine-grained permissions for workflows"

- [ ] **Write permissions allowed**: For contents and pull-requests
  - Settings → Actions → General
  - Enable "Read and write permissions"
  - Check "Allow GitHub Actions to create and approve pull requests"

---

## Common Pitfalls and Solutions

### 1. EACCES Errors with Global npm Install

**Problem**:

```text
npm error code EACCES
npm error path /usr/local/share/man/man7
npm error errno -13
npm error Error: EACCES: permission denied
```

**Cause**: Attempting to install npm globally in CI environment

**Solution**: Use `actions/setup-node@v6` instead of manual npm install

```yaml
# ❌ WRONG
- name: Update npm
  run: npm install -g npm@latest

# ✅ CORRECT
- name: Setup Node.js for npm
  uses: actions/setup-node@v6
  with:
    node-version: "lts/*"
    registry-url: "https://registry.npmjs.org"
```

**Why this works**:

- `setup-node` includes latest npm with OIDC support (11.5.1+)
- No system directory access required
- Properly configured for GitHub Actions environment

---

### 2. Missing repository.url for Provenance

**Problem**:

```text
npm error code E422
npm error 422 Unprocessable Entity
npm error Error verifying sigstore provenance bundle:
npm error Failed to validate repository information:
npm error package.json: "repository.url" is "",
```

**Cause**: npm provenance requires `repository.url` to match GitHub repository

**Solution**: Add exact repository URL to package.json

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/neiromaster/ink-tools.git"
  }
}
```

**Verification**:

```bash
# Check repository URL matches
npm view @ink-tools/package-name repository.url

# Compare with GitHub URL
echo "git+https://github.com/neiromaster/ink-tools.git"
```

---

### 3. Missing publishConfig for Scoped Packages

**Problem**: Package defaults to private when publishing

**Cause**: Scoped packages (`@ink-tools/*`) default to private access

**Solution**: Add `publishConfig.access: "public"` to package.json

```json
{
  "name": "@ink-tools/ink-mouse",
  "publishConfig": {
    "access": "public"
  }
}
```

**Why this is required**:

- Scoped packages are private by default
- Without this, npm rejects publication with "EPUBLISHCONFLICT"
- Must be set before first publication

---

### 4. Missing id-token: write Permission

**Problem**: OIDC token not generated during workflow execution

**Error in logs**:

```text
npm ERR! code ENEEDAUTH
npm ERR! Unable to authenticate, need: Basic
```

**Cause**: GitHub Actions cannot generate OIDC token without permission

**Solution**: Add `id-token: write` at both workflow and job level

```yaml
permissions:
  contents: write
  pull-requests: write
  id-token: write  # REQUIRED at workflow level

jobs:
  release:
    permissions:
      contents: write
      pull-requests: write
      id-token: write  # ALSO REQUIRED at job level
```

**Why both levels?**:

- Workflow-level: Enables OIDC for the workflow
- Job-level: Grants permission to specific job
- Best practice: Set both for clarity and security

---

### 5. Each Package Can Only Have One Trusted Publisher

**Problem**: Error when adding second Trusted Publisher in npm dashboard

**Error**: "Each package can only have one trusted publisher"

**Cause**: npm limits each package to one Trusted Publisher configuration

**Solution**: Use single workflow for all packages in monorepo

```yaml
# ✅ CORRECT: Single workflow for all packages
name: Release
on:
  push:
    branches:
      - main

jobs:
  release:
    steps:
      - uses: changesets/action@v1
        with:
          publish: bun changeset publish  # Publishes all packages
```

**Monorepo strategy**:

- Configure each package's Trusted Publisher to trust the same workflow
- Changesets handles multi-package publishing
- OIDC token is generated once per workflow run

---

### 6. Provenance Validation Mismatch

**Problem**: Provenance validation fails despite correct configuration

**Error**:

```text
npm error expected to match "https://github.com/neiromaster/ink-tools"
```

**Common causes**:

1. Repository URL format mismatch (missing `.git` suffix)
2. Case sensitivity in organization or repository name
3. Workflow filename mismatch (must be exact)

**Solution**:

```bash
# Verify exact GitHub URL
gh repo view --json url,name

# Check workflow filename exists
ls -la .github/workflows/release.yml

# Compare with npm Trusted Publisher config
# npm dashboard → Package → Settings → Trusted Publishers
```

**Verification checklist**:

- [ ] Organization: `neiromaster` (lowercase)
- [ ] Repository: `ink-tools` (lowercase, kebab-case)
- [ ] Workflow: `.github/workflows/release.yml` (exact path)
- [ ] Environment: empty (unless using environments)

---

### 7. NPM_TOKEN Still Being Used

**Problem**: Workflow uses NPM_TOKEN instead of OIDC despite configuration

**Cause**: Old `.npmrc` configuration or environment variables

**Solution**: Remove all token-based authentication

```yaml
# ❌ WRONG
env:
  NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

# ✅ CORRECT
env:
  NPM_CONFIG_PROVENANCE: true
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Cleanup steps**:

1. Remove `NPM_TOKEN` from workflow environment
2. Remove manual `.npmrc` configuration steps
3. Delete NPM_TOKEN from GitHub Secrets (after successful OIDC publication)
4. Revoke old npm automation tokens

---

## Best Practices

### Monorepo Publishing Strategy

#### Single Workflow Approach (Recommended)

Use one workflow for all packages in the monorepo:

**Advantages**:

- Single OIDC token generation per release
- Simplified Trusted Publisher configuration
- Atomic multi-package publishing
- Easier debugging and maintenance

**Configuration**:

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write
  id-token: write

jobs:
  release:
    permissions:
      contents: write
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v6
        with:
          node-version: "lts/*"
          registry-url: "https://registry.npmjs.org"

      - name: Install and build
        run: |
          bun install
          bun run build

      - uses: changesets/action@v1
        with:
          publish: bun changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_CONFIG_PROVENANCE: true
```

**npm Trusted Publisher configuration** (for each package):

- Organization: `neiromaster`
- Repository: `neiromaster/ink-tools`
- Workflow filename: `.github/workflows/release.yml`
- Environment: (empty)

#### Multiple Workflow Approach (Alternative)

For large monorepos with complex release requirements:

```yaml
# .github/workflows/release-packages.yml
# Separate workflow for different package groups

jobs:
  release-ui:
    # Publish UI packages
    steps:
      - run: bun changeset publish --filter @ink-tools/ink-*

  release-utils:
    # Publish utility packages
    steps:
      - run: bun changeset publish --filter @ink-tools/xterm-*
```

**Trade-offs**:

- More complex setup
- Multiple OIDC token generations
- Can enable independent release cycles
- Useful for packages with different dependencies

---

### Security Hardening

#### Principle of Least Privilege

Configure minimal required permissions:

```yaml
# ✅ GOOD: Minimal permissions
permissions:
  contents: write      # For version bumps
  pull-requests: write # For release PRs
  id-token: write     # For OIDC

# ❌ BAD: Overly permissive
permissions: write-all
```

#### Package Protection Settings

Configure npm package settings for maximum security:

1. **Require two-factor authentication**:
   - npm dashboard → Package → Settings
   - Enable "Require 2FA for publishing"

2. **Disallow tokens** (after OIDC migration):
   - npm dashboard → Package → Settings
   - Enable "Disallow tokens"
   - Forces OIDC-only publishing

3. **Code Review required** (for organizations):
   - npm dashboard → Organization → Settings
   - Enable "Require code review for packages"

#### Provenance Verification

Always verify provenance after publication:

```bash
# Check package has attestations
npm view @ink-tools/ink-mouse@0.2.2 --json | jq '.attestations'

# Download and verify provenance
npm view @ink-tools/ink-mouse@0.2.2 --json > package.json
cat package.json | jq '.attestations.provenance'
```

**Expected output**:

```json
{
  "attestations": {
    "url": "https://registry.npmjs.org/-/npm/v1/attestations/@ink-tools%2fink-mouse@1.0.0",
    "provenance": {
      "predicateType": "https://slsa.dev/provenance/v1"
    }
  }
}
```

---

### Testing Strategy

#### Pre-Flight Checks

Before attempting OIDC publication:

```bash
# 1. Verify package exists on npm
npm view @ink-tools/package-name

# 2. Check repository URL matches
npm view @ink-tools/package-name repository.url
echo "git+https://github.com/neiromaster/ink-tools.git"

# 3. Verify npm version (must be 11.5.1+)
npm --version

# 4. Check for uncommitted changes
git status

# 5. Verify workflow exists
ls -la .github/workflows/release.yml
```

#### Dry-Run Testing

Test publishing without actual publication:

```bash
# Changesets dry run
bun changeset publish --dry-run

# Test build process
bun run build

# Verify package contents
ls -la packages/*/dist/
```

#### Canary Releases

Test OIDC with canary tag before production release:

```bash
# Publish canary version
npm publish --tag canary

# Verify canary has provenance
npm view @ink-tools/package-name@canary --json | jq '.attestations'

# If successful, proceed to production release
bun changeset publish
```

#### Verification Commands

After publication, verify provenance:

```bash
# 1. Check attestations exist
npm view @ink-tools/package-name@version --json | jq '.attestations'

# 2. Verify SLSA provenance type
npm view @ink-tools/package-name@version --json | jq '.attestations.provenance.predicateType'
# Expected: "https://slsa.dev/provenance/v1"

# 3. Download provenance bundle
npm view @ink-tools/package-name@version --json | jq -r '.attestations.url' | xargs curl

# 4. Verify package metadata
npm view @ink-tools/package-name@version
```

---

## Migration Guide: NPM_TOKEN to OIDC

Follow this step-by-step guide to migrate from token-based to OIDC-based publishing.

### Phase 1: Preparation

#### Step 1: Verify Current Setup

```bash
# Check current npm version
npm --version
# Must be 11.5.1+ for OIDC

# List existing packages
npm view @ink-tools/* --json | jq 'keys'

# Check current workflow uses NPM_TOKEN
grep -r "NPM_TOKEN" .github/workflows/
```

#### Step 2: Update package.json Files

For each package, add required fields:

```bash
# For each package in packages/
cd packages/ink-mouse

# Add publishConfig (if missing)
npm pkg set publishConfig.access=public

# Add repository (if missing)
npm pkg set repository.type=git
npm pkg set repository.url="git+https://github.com/neiromaster/ink-tools.git"

# Verify changes
cat package.json | grep -A2 "publishConfig\|repository"
```

**Template**:

```json
{
  "name": "@ink-tools/package-name",
  "publishConfig": {
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/neiromaster/ink-tools.git"
  }
}
```

#### Step 3: Verify GitHub Settings

1. **Enable fine-grained permissions**:
   - Organization Settings → Actions → General
   - Enable "Fine-grained permissions for workflows"

2. **Allow write permissions**:
   - Repository Settings → Actions → General
   - Select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

---

### Phase 2: Configure OIDC

#### Step 4: Update GitHub Actions Workflow

**Before** (token-based):

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: "lts/*"
    registry-url: "https://registry.npmjs.org"

- run: npm install -g npm@latest  # ❌ Remove this

- run: bun changeset publish
  env:
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}  # ❌ Remove this
```

**After** (OIDC-based):

```yaml
permissions:
  contents: write
  pull-requests: write
  id-token: write  # ✅ Add this

jobs:
  release:
    permissions:
      contents: write
      pull-requests: write
      id-token: write  # ✅ Add this too
    steps:
      - uses: actions/setup-node@v6  # ✅ Use v6
        with:
          node-version: "lts/*"
          registry-url: "https://registry.npmjs.org"

      - run: bun changeset publish
        env:
          NPM_CONFIG_PROVENANCE: true  # ✅ Add this
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Key changes**:

1. Add `id-token: write` at workflow and job level
2. Upgrade `actions/setup-node@v4` → `@v6`
3. Remove `npm install -g npm@latest`
4. Replace `NPM_TOKEN` with `NPM_CONFIG_PROVENANCE: true`

#### Step 5: Configure Trusted Publishers

For each package in npm:

1. Navigate to package on npm: `https://www.npmjs.com/package/@ink-tools/package-name`
2. Go to **Settings** → **Trusted Publishers**
3. Click **Add Trusted Publisher**
4. Select **GitHub Actions**
5. Fill in:
   - **Organization**: `neiromaster`
   - **Repository**: `neiromaster/ink-tools`
   - **Workflow filename**: `.github/workflows/release.yml`
   - **Environment**: (leave empty)
6. Click **Create**

**Repeat for each package** in the monorepo.

---

### Phase 3: Testing

#### Step 6: Create Test Release

```bash
# Create changeset for test version
bun changeset
# Select packages, enter "minor" bump, add message: "test OIDC"

# Commit changeset
git add .
git commit -m "test: add changeset for OIDC testing"
git push
```

#### Step 7: Verify Release PR

1. Check **Actions** tab for workflow run
2. Verify release PR created successfully
3. Review workflow logs for OIDC token generation
4. Look for: "npm notice Publishing with provenance"

#### Step 8: Merge and Publish

```bash
# Merge release PR (via GitHub UI or gh CLI)
gh pr merge <pr-number> --merge

# Monitor publication workflow
gh run list --workflow=release.yml

# Check workflow logs for errors
gh run view --log
```

#### Step 9: Verify Provenance

```bash
# Check published version has attestations
npm view @ink-tools/package-name@version --json | jq '.attestations'

# Verify SLSA provenance type
npm view @ink-tools/package-name@version --json |
  jq '.attestations.provenance.predicateType'
# Expected: "https://slsa.dev/provenance/v1"
```

---

### Phase 4: Cleanup

#### Step 10: Remove Legacy Tokens

**Only after successful OIDC publication**:

1. **Delete NPM_TOKEN from GitHub Secrets**:
   - Repository Settings → Secrets and variables → Actions
   - Delete `NPM_TOKEN`

2. **Revoke npm automation tokens**:
   - npmjs.com/settings/tokens
   - Revoke all automation tokens
   - Keep personal tokens (for manual operations)

3. **Enable security features**:
   - Enable "Disallow tokens" in npm package settings
   - Enable "Require 2FA" in npm organization settings

---

### Rollback Strategy

If OIDC publication fails:

#### Immediate Rollback

```bash
# 1. Revert workflow changes
git revert <commit-hash>

# 2. Restore NPM_TOKEN to GitHub Secrets
# (if not already deleted)

# 3. Publish with token
# Update workflow temporarily to use NPM_TOKEN
git push
```

#### Diagnostic Mode

Keep OIDC configuration but add diagnostics:

```yaml
- name: Diagnose OIDC
  run: |
    echo "npm version: $(npm --version)"
    echo "Node version: $(node --version)"
    echo "Workflow: ${GITHUB_WORKFLOW_REF}"
    npm config list

- name: Publish with diagnostics
  run: bun changeset publish --verbose
  env:
    NPM_CONFIG_LOGLEVEL: verbose
    NPM_CONFIG_PROVENANCE: true
```

#### Recovery Steps

1. Check workflow logs for OIDC errors
2. Verify Trusted Publisher configuration in npm
3. Check `id-token: write` permission
4. Verify repository URL in package.json
5. Retry publication after fixes

---

## Troubleshooting Reference

### Error Codes and Solutions

#### EACCES: Permission Denied

**Error**: `npm error code EACCES`

**Cause**: Attempting global npm install

**Solution**: Use `actions/setup-node@v6` instead of `npm install -g`

---

#### E422: Provenance Validation Failed

**Error**: `npm error code E422`

**Cause**: Missing or incorrect `repository.url` in package.json

**Solution**:

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/neiromaster/ink-tools.git"
  }
}
```

**Verification**:

```bash
npm view @ink-tools/package-name repository.url
```

---

#### ENEEDAUTH: Authentication Required

**Error**: `npm ERR! code ENEEDAUTH`

**Cause**: OIDC token not generated or Trusted Publisher misconfigured

**Solutions**:

1. Verify `id-token: write` permission in workflow
2. Check Trusted Publisher configuration in npm
3. Ensure workflow filename matches exactly
4. Verify organization and repository names

---

#### 404: Package Not Found

**Error**: `npm ERR! 404 Not Found`

**Cause**: Package doesn't exist on npm (first publication)

**Solution**: Publish first version manually with token:

```bash
npm login
bun changeset publish
```

After first publication, OIDC will work.

---

#### EPUBLISHCONFLICT: Version Exists

**Error**: `npm ERR! EPUBLISHCONFLICT`

**Cause**: Version already published

**Solution**: This is normal - Changesets will skip existing versions. Create new changeset for next version.

---

### Diagnostic Commands

```bash
# Check npm version (must be 11.5.1+)
npm --version

# Verify package metadata
npm view @ink-tools/package-name

# Check repository URL
npm view @ink-tools/package-name repository.url

# Verify attestations
npm view @ink-tools/package-name@version --json | jq '.attestations'

# Test OIDC configuration (in CI)
# Add to workflow:
- run: |
    echo "npm version: $(npm --version)"
    echo "OIDC token: ${{ github.token_id }}"
    npm config list
```

### Verification Checklist

Before opening issue or seeking help:

- [ ] npm CLI version 11.5.1+ (check with `npm --version`)
- [ ] `id-token: write` permission in workflow (both levels)
- [ ] `publishConfig.access: "public"` in package.json
- [ ] `repository.url` matches GitHub URL exactly
- [ ] Trusted Publisher configured in npm dashboard
- [ ] Workflow filename matches exactly (`.github/workflows/release.yml`)
- [ ] Package exists on npm (OIDC requires first publication)
- [ ] No conflicting Trusted Publishers (one per package)
- [ ] `NPM_CONFIG_PROVENANCE: true` in workflow environment
- [ ] Using `actions/setup-node@v6` (not manual npm install)

---

## Additional Resources

### Official Documentation

- [npm: About Trusted Publishing](https://docs.npmjs.com/generating-provenance-steps)
- [npm: Configuring Trusted Publishing](https://docs.npmjs.com/creating-and-viewing-access-tokens#configuring-trusted-publishing)
- [GitHub: About OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [SLSA Provenance](https://slsa.dev/provenance/v1)
- [Changesets: GitHub Action](https://github.com/changesets/action)

### Related Documentation

- **[npm Trusted Publishing OIDC Setup](./npm-trusted-publishing-oidc-setup.md)** - Complete implementation guide with problem-solving details
- **[GitHub Actions Setup for Changesets](../github-actions-setup.md)** - Comprehensive GitHub Actions configuration guide
- **[Testing Monorepo Packages](../testing-monorepo-packages.md)** - Testing infrastructure and CI/CD patterns

### Quick Reference

```bash
# Verify OIDC setup
npm --version                    # Must be 11.5.1+
npm view <package> repository.url  # Check matches GitHub
npm view <package>@<version> --json | jq '.attestations'  # Verify provenance

# Workflow configuration
grep -A5 "permissions:" .github/workflows/release.yml  # Check id-token: write
grep "NPM_CONFIG_PROVENANCE" .github/workflows/release.yml  # Should be true

# npm configuration
npm config get registry  # Should be https://registry.npmjs.org/
npm config list          # Check for conflicting auth configs
```

---

## Summary

### Key Takeaways

1. **Prevention is better than cure**: Use the prevention checklist before setup
2. **Repository URL is critical**: Must match GitHub URL exactly for provenance
3. **Permissions matter**: `id-token: write` at both workflow and job level
4. **One publisher per package**: Use single workflow for monorepo publishing
5. **Test before production**: Use dry-run and canary releases
6. **Verify provenance**: Always check attestations after publication
7. **Clean up tokens**: Remove NPM_TOKEN after successful OIDC migration

### Success Criteria

- ✅ All packages publish with OIDC authentication
- ✅ Provenance attestations present on all packages
- ✅ No NPM_TOKEN in workflow or GitHub Secrets
- ✅ Trusted Publisher configured for each package
- ✅ No EACCES, E422, or ENEEDAUTH errors
- ✅ Changesets workflow creates release PRs successfully
- ✅ Publications generate SLSA provenance v1

### Maintenance

- **Monthly**: Review GitHub Actions workflow logs for errors
- **Quarterly**: Audit Trusted Publisher configurations in npm
- **Annually**: Review and update npm CLI version in CI
- **As needed**: Add new packages to Trusted Publisher configuration
- **As needed**: Update this guide with new npm/GitHub features
