---
problem:
  type: npm_publishing, oidc, first_time_publication
  component: .github/workflows/release.yml, packages/xterm-mouse/package.json
  severity: high
  summary: First-time publication of unscoped npm package failing with OIDC due to registry-url configuration blocking token exchange

component:
  name: ".github/workflows/release.yml"
  affected_files:
    - .github/workflows/release.yml
    - packages/xterm-mouse/package.json
    - packages/ink-mouse/package.json
    - packages/ink-mouse/tsconfig.json
    - tsconfig.json

dates:
  first_encountered: 2025-01-09
  resolved_at: 2025-01-09
  resolution_time: ~2 hours

tags:
  - ci-cd
  - npm
  - oidc
  - trusted-publishing
  - github-actions
  - unscoped-packages
  - package-migration
  - changesets

related_docs:
  - ../npm-trusted-publishing-oidc-setup.md
  - ../../github-actions-setup.md
  - ../../migration-guide.md

---

# GitHub Actions OIDC: Unscoped Package First-Time Publication

## Problem

When attempting to publish an unscoped npm package for the first time using OIDC (Trusted Publishing), the GitHub Actions workflow failed with authentication errors, despite OIDC being properly configured.

### Error 1: Access Token Expired

```text
npm notice Access token expired or revoked. Please try logging in again.
npm error code E404
npm error 404 Not Found - PUT https://registry.npmjs.org/xterm-mouse
npm error The requested resource 'xterm-mouse@0.7.2' could not be found
```

### Error 2: Package Not Found

```text
🦋 error Received 404 for npm info "xterm-mouse"
🦋 error Publishing "xterm-mouse" at "0.7.2"
🦋 error an error occurred while publishing xterm-mouse: E404 Not Found
```

### Context

The package was being migrated from scoped (`@ink-tools/xterm-mouse`) to unscoped (`xterm-mouse`) for better npm discoverability. All 324 tests passed, builds succeeded, but CI/CD publication failed.

## Root Cause

### Primary Issue: `registry-url` Parameter Blocks OIDC

When `registry-url` is specified in `actions/setup-node@v6`:

```yaml
- name: Setup Node.js for npm
  uses: actions/setup-node@v6
  with:
    node-version: "lts/*"
    registry-url: "https://registry.npmjs.org"  # ❌ BLOCKS OIDC
```

The action automatically creates a `.npmrc` file with:

```text
//registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}
```

**Why This Breaks OIDC:**

1. **GitHub Actions** checks for `registry-url` parameter
2. **If present**, it configures `.npmrc` with token-based authentication
3. **npm** sees the configured token and skips OIDC token exchange
4. **OIDC** (Trusted Publishing) is bypassed entirely
5. **Result**: "Access token expired or revoked" error

### Secondary Issue: Unscoped Packages Require Initial Publication

npm's OIDC system requires the package to **already exist** on the registry before Trusted Publishing can be configured. This is because:

1. **Trusted Publisher** configuration is package-specific
2. **Configuration happens** in npm dashboard for each package
3. **Package must exist** before you can access settings
4. **First publication** must establish ownership

**For scoped packages:** Often already published during development, so OIDC works immediately.

**For unscoped packages:** May never have been published, requiring manual first-time publication.

## Investigation Steps

### Attempted Solutions

1. **Verified OIDC Configuration** ✓
   - `id-token: write` permission set at workflow and job level
   - `NPM_CONFIG_PROVENANCE: true` environment variable set
   - Trusted Publisher configured for `@ink-tools/ink-mouse`

2. **Checked Package Metadata** ✓
   - `repository.url` correctly set to GitHub repository
   - `publishConfig.access: "public"` included in package.json

3. **Reviewed Workflow Logs**
   - Discovered `.npmrc` was being created with NPM_TOKEN reference
   - Found that `registry-url` parameter was the cause

4. **Tested Without registry-url** ✓
   - Removed parameter from workflow
   - OIDC token exchange began working
   - **But**: Unscoped package still needed first publication

### Key Discovery

**The `registry-url` parameter is designed for:**

- Private registry authentication
- Scoped packages with custom registries
- Token-based authentication

**It should NOT be used when:**

- Publishing to public npm registry with OIDC
- Using Trusted Publishing (OIDC)
- Publishing unscoped packages

## Solution

### Step 1: Fix GitHub Actions Workflow

**File:** `.github/workflows/release.yml`

**Remove `registry-url` parameter:**

```yaml
# ❌ BEFORE - Blocks OIDC
- name: Setup Node.js for npm
  uses: actions/setup-node@v6
  with:
    node-version: "lts/*"
    registry-url: "https://registry.npmjs.org"
```

```yaml
# ✅ AFTER - Enables OIDC
- name: Setup Node.js for npm
  uses: actions/setup-node@v6
  with:
    node-version: "lts/*"
```

**Why this works:**

- Without `registry-url`, `setup-node` doesn't create `.npmrc`
- npm CLI defaults to public registry
- OIDC token exchange works properly
- `npm/auth-providers` action handles authentication

**Complete fixed workflow:**

```yaml
jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write  # REQUIRED for OIDC
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Setup Node.js for npm
        uses: actions/setup-node@v6
        with:
          node-version: "lts/*"
          # ✅ No registry-url - OIDC works!

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

**Commit:** `6cb7e69` - "fix: remove registry-url from setup-node to enable OIDC"

### Step 2: Manual First-Time Publication (Unscoped Packages Only)

**Required for:** Unscoped packages that have never been published

#### 2.1 Create npm Access Token

1. Go to <https://www.npmjs.com/settings/tokens>
2. Click "Generate New Token" → "Automation"
3. Token name: `xterm-mouse one-time publish`
4. Select: "Publish"
5. Copy the token (won't be shown again!)

#### 2.2 Configure Local npm Authentication

**Create temporary `.npmrc`:**

```bash
# In repository root
cat > .npmrc << 'EOF'
//registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE
registry=https://registry.npmjs.org/
EOF
```

**Verify authentication:**

```bash
npm whoami
# Should output: neiromaster
```

#### 2.3 Publish Package

**Build first:**

```bash
cd packages/xterm-mouse
bun run build
```

**Publish with access flag:**

```bash
npm publish --access public
```

**Expected success output:**

```text
npm notice
npm notice 📦  xterm-mouse@0.7.2
npm notice === Tarball Contents ===
npm notice 1.2kB   LICENSE
npm notice 5.1kB   dist/index.js
npm notice 15.6kB  dist/index.d.ts
...
npm notice === Tarball Details ===
npm notice name:          xterm-mouse
npm notice version:       0.7.2
npm notice total size:    31.2 kB
npm notice
npm notice Publishing to https://registry.npmjs.org/
+ xterm-mouse@0.7.2
```

#### 2.4 Clean Up

**Remove temporary `.npmrc`:**

```bash
rm .npmrc
```

**Add to .gitignore:**

```bash
echo ".npmrc" >> .gitignore
git add .gitignore
git commit -m "chore: add .npmrc to gitignore"
```

**Delete npm token:**

1. Go to <https://www.npmjs.com/settings/tokens>
2. Find token: `xterm-mouse one-time publish`
3. Click "Delete"

### Step 3: Configure Trusted Publisher for Unscoped Package

**After first publication, configure OIDC:**

1. Go to <https://www.npmjs.com/package/xterm-mouse/settings>
2. Navigate to **"Trusted Publishers"**
3. Click **"Add Trusted Publisher"**
4. Fill in:
   - **Organization**: (leave empty - unscoped package)
   - **Repository**: `neiromaster/ink-tools`
   - **Workflow filename**: `.github/workflows/release.yml`
   - **Environment**: (leave empty)
5. Click **"Create"**

**Critical differences from scoped packages:**

- **Scoped**: Organization field required (e.g., `@ink-tools`)
- **Unscoped**: Organization field left empty
- Everything else is identical

### Step 4: Verify OIDC Publication

**Create a test changeset:**

```bash
bun changeset
# Select xterm-mouse, choose "patch"
# Message: "test: verify OIDC publishing"

git add .
git commit -m "test: add changeset to verify OIDC"
git push
```

**Monitor workflow:**

1. Go to <https://github.com/neiromaster/ink-tools/actions>
2. Click on latest "Release" workflow
3. Look for success indicators:

   ```
   npm notice Publishing with provenance
   npm notice
   npm notice 📦  xterm-mouse@0.7.3
   ```

**Verify provenance:**

```bash
npm view xterm-mouse@0.7.3 --json | jq '.attestations'
```

**Expected output:**

```json
{
  "url": "https://registry.npmjs.org/-/npm/v1/attestations/xterm-mouse@0.7.3",
  "provenance": {
    "predicateType": "https://slsa.dev/provenance/v1"
  }
}
```

## Package Name Migration (Scoped → Unscoped)

### Changes Made

#### 1. Update package.json

**File:** `packages/xterm-mouse/package.json`

```json
{
  "name": "xterm-mouse",  // Changed from @ink-tools/xterm-mouse
  "version": "0.7.2",
  "publishConfig": {
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/neiromaster/ink-tools.git",
    "directory": "packages/xterm-mouse"
  }
}
```

**Key points:**

- Package name: `@ink-tools/xterm-mouse` → `xterm-mouse`
- `publishConfig.access: "public"` - Still recommended for consistency
- `repository.url` - Required for OIDC provenance

#### 2. Update Dependent Package

**File:** `packages/ink-mouse/package.json`

```json
{
  "dependencies": {
    "xterm-mouse": "workspace:*"  // Changed from @ink-tools/xterm-mouse
  }
}
```

**File:** `packages/ink-mouse/tsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "xterm-mouse": ["../xterm-mouse/src"],
      "xterm-mouse/*": ["../xterm-mouse/src/*"]
    }
  }
}
```

**File:** `tsconfig.json` (root)

```json
{
  "compilerOptions": {
    "paths": {
      "xterm-mouse": ["./packages/xterm-mouse/src"],
      "xterm-mouse/*": ["./packages/xterm-mouse/src/*"]
    }
  }
}
```

#### 3. Update Import Statements

**Pattern applied across 10+ files:**

```typescript
// Before
import { Mouse } from '@ink-tools/xterm-mouse';

// After
import { Mouse } from 'xterm-mouse';
```

**Files updated:**

- `packages/ink-mouse/src/hooks/useMouse.ts`
- `packages/ink-mouse/src/provider.tsx`
- `packages/ink-mouse/src/types.ts`
- `packages/ink-mouse/src/integration/integration.test.tsx`
- `packages/ink-mouse/test/mocks/mouse-events.ts`
- `packages/ink-mouse/README.md`
- `packages/ink-mouse/CLAUDE.md`
- `packages/xterm-mouse/README.md`

#### 4. Update Documentation

**README.md installation examples:**

```bash
# Before
bun add @ink-tools/xterm-mouse

# After
bun add xterm-mouse
```

**Import examples:**

```typescript
// Before
import { Mouse } from '@ink-tools/xterm-mouse';

// After
import { Mouse } from 'xterm-mouse';
```

## Verification

### Test Suite

```bash
bun test
# ✅ 324 pass (176 xterm-mouse + 148 ink-mouse)
# ✅ 0 fail
```

### Build Verification

```bash
bun run build
# ✅ xterm-mouse: 9.61 KB output
# ✅ ink-mouse: ESM + CJS output
```

### Import Verification

```bash
# Create test file
cat > /tmp/test-import.mjs << 'EOF'
import { Mouse } from 'xterm-mouse';
console.log('✅ Import successful');
EOF

bun /tmp/test-import.mjs
# ✅ Import successful
```

### Package Verification

```bash
npm view xterm-mouse
# ✅ Shows package metadata
# ✅ Latest version available
# ✅ Repository URL correct
```

## Prevention

### Pre-Migration Checklist

Before changing package names from scoped to unscoped:

- [ ] **Assess Impact**: Check download stats and dependents

  ```bash
  npm view @ink-tools/xterm-mose
  # Check "dependents" count
  ```

- [ ] **Verify OIDC Setup**: Ensure `id-token: write` permission

  ```yaml
  permissions:
    id-token: write  # Required
  ```

- [ ] **Remove registry-url**: Check workflow doesn't have `registry-url`

  ```yaml
  # ❌ Don't use this with OIDC
  registry-url: "https://registry.npmjs.org"
  ```

- [ ] **Prepare package.json**: Update name, keep `publishConfig`

  ```json
  {
    "name": "unscoped-name",
    "publishConfig": {
      "access": "public"
    }
  }
  ```

- [ ] **Update Dependencies**: Change workspace imports

  ```json
  {
    "dependencies": {
      "unscoped-name": "workspace:*"
    }
  }
  ```

### Common Pitfalls

#### Pitfall 1: registry-url Blocks OIDC

**Problem:**

```yaml
registry-url: "https://registry.npmjs.org"
```

Creates `.npmrc` with NPM_TOKEN, blocking OIDC.

**Solution:**
Remove `registry-url` parameter from `actions/setup-node@v6`.

**Detection:**
Workflow logs show "npm notice Access token expired" instead of "npm notice Publishing with provenance".

#### Pitfall 2: First Publication Fails

**Problem:**
Unscoped package doesn't exist, OIDC can't be configured.

**Solution:**
Manual first publication with npm token, then configure Trusted Publisher.

**Detection:**
404 errors on `npm publish` in CI, but `npm view package-name` shows package doesn't exist.

#### Pitfall 3: Breaking Change Without Migration

**Problem:**
Changing package name without migration breaks all dependents.

**Solution:**
Keep both packages, deprecate old one gradually.

**Migration Strategy:**

1. Publish unscoped package
2. Add deprecation notice to scoped package
3. Update documentation to recommend unscoped
4. Maintain scoped package for 6+ months
5. Sunset scoped package

#### Pitfall 4: TypeScript Path Mappings

**Problem:**
TypeScript can't find unscoped package after rename.

**Solution:**
Update all `tsconfig.json` `paths` mappings.

```json
{
  "paths": {
    "new-name": ["./packages/new-name/src"],
    "new-name/*": ["./packages/new-name/src/*"]
  }
}
```

### Best Practices

#### For Unscoped Packages

1. **First Publication**: Always manual, then configure OIDC
2. **package.json**: Include `publishConfig.access: "public"`
3. **repository.url**: Required for provenance validation
4. **Documentation**: Update all installation examples

#### For OIDC Configuration

1. **Never use `registry-url`**: Let npm handle OIDC auth
2. **Always include permissions**: `id-token: write` at workflow and job level
3. **Enable provenance**: `NPM_CONFIG_PROVENANCE: true` env variable
4. **Use npm CLI 11.5.1+**: Automatic with `actions/setup-node@v6`

#### For Package Naming

**Use scoped when:**

- Part of organization's package ecosystem
- Multiple related packages in monorepo
- Branding is important
- Private packages

**Use unscoped when:**

- Generic, reusable library
- Search discoverability is critical
- Standalone utility
- Public package with wide appeal

## Related Documentation

### Internal Documentation

- **[npm Trusted Publishing (OIDC) Setup](../npm-trusted-publishing-oidc-setup.md)** - Complete OIDC configuration guide, including EACCES and E422 error fixes, repository URL requirements, and provenance configuration

- **[GitHub Actions Setup for Changesets](../../github-actions-setup.md)** - OIDC-focused GitHub Actions configuration, fine-grained permissions, Trusted Publisher setup

- **[Migration Guide](../../migration-guide.md)** - Package migration documentation showing transition from `@neiropacks` to `@ink-tools`

### External Resources

- **[npm: About Trusted Publishing](https://docs.npmjs.com/generating-provenance-steps)** - Official npm documentation on provenance and OIDC

- **[npm: Configuring Trusted Publishing](https://docs.npmjs.com/creating-and-viewing-access-tokens#configuring-trusted-publishing)** - Setting up Trusted Publishers in npm dashboard

- **[GitHub: About OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)** - GitHub's OIDC documentation

- **[SLSA Provenance](https://slsa.dev/provenance/v1)** - SLSA provenance specification

## Timeline

### Chronological commits

1. **`afae949`** - Change xterm-mouse to unscoped package name
2. **`373ca86`** - Update ink-mouse to import from unscoped xterm-mouse
3. **`6cb7e69`** - Remove registry-url from setup-node to enable OIDC

### Resolution Timeline

- **2025-01-09 19:00** - Problem discovered (CI failure)
- **2025-01-09 19:15** - Root cause identified (registry-url blocks OIDC)
- **2025-01-09 19:30** - Workflow fixed (registry-url removed)
- **2025-01-09 19:45** - Manual publication completed
- **2025-01-09 20:00** - Trusted Publisher configured
- **2025-01-09 20:15** - OIDC verified working

## Benefits Achieved

✅ **Better Discoverability** - "xterm-mouse" appears in npm search for "xterm mouse" queries

✅ **OIDC Working** - Trusted Publishing functions for both scoped and unscoped packages

✅ **Simplified Installation** - `bun add xterm-mouse` instead of `bun add @ink-tools/xterm-mouse`

✅ **No Token Management** - Eliminated NPM_TOKEN, using short-lived OIDC credentials

✅ **SLSA Provenance** - All published packages have cryptographic provenance attestations

✅ **Security Enhanced** - Complies with npm and GitHub best practices for package publishing

## Summary

This issue demonstrated that:

1. **The `registry-url` parameter in `actions/setup-node@v6` is incompatible with OIDC** - it creates `.npmrc` with token auth, blocking OIDC token exchange

2. **Unscoped packages require manual first publication** - OIDC's Trusted Publisher can only be configured for packages that already exist on npm

3. **Scoped → Unscoped migration is straightforward** - update package name, imports, paths, and publish

4. **OIDC works consistently for both scoped and unscoped** - once configured, no token management needed

The key fix was **commit `6cb7e69`**, which removed `registry-url: "https://registry.npmjs.org"` from the workflow, enabling OIDC to function properly for all package types.
