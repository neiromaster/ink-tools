---
problem:
  type: ci-cd
  category: npm_publishing
  severity: high
  summary: Configuring secure npm publishing using OIDC instead of authentication tokens, resolving EACCES and E422 provenance errors
  status: solved
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

related_docs:
  - ../github-actions-setup.md
  - ../testing/testing-react-hooks-error-handling-monorepo.md

---

# Setting Up npm Trusted Publishing (OIDC) with GitHub Actions

## Problem

When attempting to configure npm publishing using **Trusted Publishing (OIDC)** instead of traditional NPM_TOKEN authentication, encountered multiple errors during GitHub Actions workflow execution:

### Error 1: Permission Denied (EACCES)

```text
npm error code EACCES
npm error syscall mkdir
npm error path /usr/local/share/man/man7
npm error errno -13
npm error Error: EACCES: permission denied, mkdir '/usr/local/share/man/man7'
```

**Cause**: Attempted to install npm globally using `npm install -g npm@latest` without proper permissions in GitHub Actions runner.

### Error 2: Provenance Validation Failed (E422)

```text
npm error code E422
npm error 422 Unprocessable Entity
npm error Error verifying sigstore provenance bundle:
npm error Failed to validate repository information:
npm error package.json: "repository.url" is "",
npm error expected to match "https://github.com/neiropacks/ink-tui-kit" from provenance
```

**Cause**: npm's provenance validation requires the `repository.url` field in package.json to exactly match the GitHub repository URL.

## Root Cause

1. **Incorrect npm Update Method**: Using `npm install -g npm@latest` in CI environments fails due to insufficient permissions for system directories.

2. **Missing Repository Metadata**: npm's provenance feature requires exact match between GitHub repository URL and package.json's `repository.url` field. Without this field, provenance validation fails.

3. **Incomplete OIDC Setup**: Initial attempt used manual `.npmrc` configuration without proper OIDC token exchange setup through `npm/auth-providers` action.

## Investigation Steps

### Attempted Solutions

1. **Manual npm global install** → **FAILED**

   ```yaml
   - run: npm install -g npm@latest
   ```

   Result: `EACCES: permission denied`

2. **Manual .npmrc configuration** → **FAILED**

   ```yaml
   - run: |
       echo "@neiropacks:registry=https://registry.npmjs.org/" > .npmrc
       echo "//registry.npmjs.org/:_authToken=\${{ secrets.NPM_TOKEN }}" >> .npmrc
   ```

   Result: Still used NPM_TOKEN instead of OIDC

3. **Used `actions/setup-node@v6`** → **SUCCESS**
   - Includes npm CLI with OIDC support (11.5.1+)
   - Avoids EACCES errors
   - Properly configured for GitHub Actions

### Key Discovery

The `npm/auth-providers@v1` action is essential for proper OIDC token exchange between GitHub Actions and npm.

## Solution

### Step 1: Update GitHub Actions Workflow

**File**: `.github/workflows/release.yml`

Add `id-token: write` permission (required for OIDC):

```yaml
permissions:
  contents: write
  pull-requests: write
  id-token: write  # REQUIRED for OIDC
```

Replace problematic global npm install with `setup-node` action:

```yaml
jobs:
  release:
    permissions:
      contents: write
      pull-requests: write
      id-token: write  # Also at job level
    steps:
      - uses: actions/checkout@v6

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Setup Node.js for npm
        uses: actions/setup-node@v6
        with:
          node-version: "lts/*"
          registry-url: "https://registry.npmjs.org"

      - name: Install dependencies
        run: bun install

      - name: Build Packages
        run: bun run build

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          version: bun changeset version
          publish: bun changeset publish
          title: "chore: Release packages"
          commit: "chore: Release packages"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_CONFIG_PROVENANCE: true
```

**Key changes**:

- ✅ Added `id-token: write` permission (workflow + job level)
- ✅ Replaced `npm install -g npm@latest` with `actions/setup-node@v6`
- ✅ Removed manual `.npmrc` configuration with NPM_TOKEN
- ✅ Added `NPM_CONFIG_PROVENANCE: true` environment variable

### Step 2: Add Repository Metadata to package.json

**File**: `packages/ink-mouse/package.json`

Add required fields for npm provenance:

```json
{
  "name": "@neiropacks/ink-mouse",
  "version": "0.2.2",
  "publishConfig": {
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/neiropacks/ink-tui-kit.git"
  }
}
```

**Critical fields**:

- `publishConfig.access: "public"` - Required for scoped packages (`@neiropacks/*`)
- `repository.url` - Must match GitHub repository **exactly** for provenance validation

### Step 3: Configure Trusted Publisher in npm

For each package, configure Trusted Publisher in npm dashboard:

1. Go to package on npm: <https://www.npmjs.com/package/@neiropacks/ink-mouse>
2. Navigate to **Settings** → **Trusted Publishers**
3. Click **Add Trusted Publisher**
4. Select **GitHub Actions**
5. Fill in:
   - **Organization**: `neiropacks`
   - **Repository**: `neiropacks/ink-tui-kit`
   - **Workflow filename**: `.github/workflows/release.yml`
   - **Environment**: (leave empty)
6. Click **Create**

**Note**: Each package in the monorepo needs its own Trusted Publisher configuration.

## Verification

### 1. Check Package has Attestations

```bash
npm view @neiropacks/ink-mouse@0.2.2 --json | grep attestations
```

Expected output:

```json
"attestations": {
  "url": "https://registry.npmjs.org/-/npm/v1/attestations/@neiropacks%2fink-mouse@0.2.2",
  "provenance": {
    "predicateType": "https://slsa.dev/provenance/v1"
  }
}
```

### 2. Verify Package Metadata

```bash
npm view @neiropacks/ink-mouse@0.2.2
```

### 3. Check Published Versions

```bash
npm view @neiropacks/ink-mouse versions --json
```

Expected: Version 0.2.2 appears in the list with provenance.

## Prevention

### Pre-Setup Checklist

Before setting up npm Trusted Publishing:

- [ ] Package already exists on npm (OIDC requires first publication)
- [ ] `publishConfig.access: "public"` in package.json for scoped packages
- [ ] `repository.url` exactly matches GitHub repository URL
- [ ] GitHub Actions workflow has `id-token: write` permission
- [ ] Using npm CLI 11.5.1+ (automatic with `actions/setup-node@v6`)
- [ ] Trusted Publisher configured in npm dashboard

### Common Pitfalls

#### 1. EACCES Errors with Global npm Install

**Problem**: `npm install -g npm@latest` fails in CI
**Solution**: Use `actions/setup-node@v6` instead

#### 2. Missing repository.url

**Problem**: E422 provenance validation error
**Solution**: Add exact GitHub repository URL to package.json

#### 3. Missing publishConfig for Scoped Packages

**Problem**: Package defaults to private
**Solution**: Add `"publishConfig": { "access": "public" }`

#### 4. Missing id-token: write Permission

**Problem**: OIDC token not generated
**Solution**: Add permission at both workflow and job level

#### 5. Multiple Trusted Publishers

**Problem**: "Each package can only have one trusted publisher"
**Solution**: Use single workflow for all packages in monorepo

### Best Practices

#### Monorepo Strategy

- Use **single workflow** for all packages (recommended for small/medium monorepos)
- Configure each package's Trusted Publisher to trust the same workflow
- Add `repository.url` to each package's package.json

#### Testing Strategy

```bash
# Dry run to test OIDC configuration
bun changeset publish --dry-run

# Test with canary release (optional)
npm publish --tag canary
```

#### Verification Commands

```bash
# Check npm version (must be 11.5.1+)
npm --version

# Verify OIDC token exchange (in CI logs)
# Look for: "npm notice Publishing with provenance"

# Verify package has attestations
npm view <package-name>@<version> --json | jq '.attestations'
```

### Migration Checklist: NPM_TOKEN → OIDC

1. **Pre-migration**:
   - [ ] Verify npm CLI version 11.5.1+ in CI
   - [ ] Add `id-token: write` permission to workflow
   - [ ] Add `repository.url` to all package.json files
   - [ ] Add `publishConfig.access: "public"` to scoped packages

2. **Configure Trusted Publishers**:
   - [ ] For each package, configure Trusted Publisher in npm dashboard
   - [ ] Verify organization, repository, and workflow filename match exactly

3. **Update Workflow**:
   - [ ] Replace `npm install -g` with `actions/setup-node@v6`
   - [ ] Remove NPM_TOKEN from environment variables
   - [ ] Add `NPM_CONFIG_PROVENANCE: true`
   - [ ] Remove manual `.npmrc` configuration

4. **Test**:
   - [ ] Create changeset for test version
   - [ ] Push to main branch
   - [ ] Verify release PR created successfully
   - [ ] Merge PR and verify publication with OIDC

5. **Post-migration** (after successful publication):
   - [ ] Delete NPM_TOKEN from GitHub Secrets
   - [ ] Revoke old npm automation tokens
   - [ ] Enable "Require 2FA" in npm package settings
   - [ ] Enable "Disallow tokens" for maximum security

## Related Documentation

- **[GitHub Actions Setup for Changesets](../github-actions-setup.md)** - Comprehensive guide for npm publishing with Changesets
- **[Testing Monorepo Packages](../testing-monorepo-packages.md)** - Testing infrastructure and CI/CD patterns

## Implementation Timeline

### Chronological commits leading to solution

1. **`747cb2e`** - Initial OIDC configuration (manual .npmrc approach)
2. **`973b854`** - Add `id-token: write` permission, remove NPM_TOKEN
3. **`5cd98cc`** - Use `npm/auth-providers` action
4. **`4806ef9`** - Replace `npm install -g` with `actions/setup-node@v6` (fixes EACCES)
5. **`2781665`** - Create changeset for OIDC testing
6. **`cf241be`** - Add `repository.url` to package.json (fixes E422)
7. **`58d6e02`** - Release v0.2.2 with working OIDC setup

**Success confirmed**: Version 0.2.2 published with SLSA provenance attestations using Trusted Publishing (OIDC).

## Benefits Achieved

✅ **No long-lived tokens** - Eliminated NPM_TOKEN management
✅ **Automatic provenance** - SLSA provenance v1 generated automatically
✅ **Short-lived credentials** - OIDC tokens expire automatically
✅ **Enhanced security** - Complies with npm and GitHub best practices
✅ **Simplified operations** - No token rotation required

## Additional Resources

- [npm: About Trusted Publishing](https://docs.npmjs.com/generating-provenance-steps)
- [npm: Configuring Trusted Publishing](https://docs.npmjs.com/creating-and-viewing-access-tokens#configuring-trusted-publishing)
- [GitHub: About OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [SLSA Provenance](https://slsa.dev/provenance/v1)
