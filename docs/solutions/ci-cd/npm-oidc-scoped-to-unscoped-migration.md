---
problem:
  type: ci-cd
  category: npm_publishing
  severity: high
  summary: Preventing and solving OIDC publishing issues when migrating packages from scoped to unscoped, including first-time publication and registry-url conflicts
  status: reference
  verified: true

component:
  name: ".github/workflows/release.yml"
  affected_files:
    - .github/workflows/release.yml
    - packages/*/package.json
    - packages/*/README.md

dates:
  first_encountered: 2026-01-08
  resolved_at: 2026-01-09
  resolution_time: ~1 day

tags:
  - ci-cd
  - npm
  - oidc
  - trusted-publishing
  - github-actions
  - package-migration
  - scoped-vs-unscoped
  - registry-url

related_docs:
  - ./npm-trusted-publishing-oidc-setup.md
  - ./npm-oidc-prevention-and-best-practices.md
  - ../github-actions-setup.md

---

# npm OIDC Scoped to Unscoped Migration Guide

This guide provides comprehensive prevention strategies and solutions for OIDC publishing issues when migrating packages between scoped and unscoped names.

## Problem Context

### The Issue

When migrating a package from scoped (`@ink-tools/package-name`) to unscoped (`package-name`), several OIDC-specific issues arise:

1. **First publication requirement**: OIDC requires package to exist on npm before Trusted Publishing works
2. **registry-url interference**: `setup-node` action's `registry-url` parameter blocks OIDC by forcing token-based auth
3. **Trusted Publisher reconfiguration**: Package name change breaks existing OIDC trust relationship
4. **Package discovery**: Scoped packages have better brand recognition but unscoped packages are more discoverable

### Real-World Example

**Migration**: `@ink-tools/xterm-mouse` → `xterm-mouse`

**What happened**:

- Changed package name in package.json for better discoverability
- GitHub Actions workflow used `registry-url` parameter
- Workflow automatically created `.npmrc` with token-based auth
- OIDC token exchange failed because `registry-url` took precedence
- First publication of unscoped package required manual intervention

**Solution**:

- Removed `registry-url` from `setup-node` action
- Published first version of unscoped package manually
- Reconfigured Trusted Publisher in npm dashboard
- Subsequent versions published with OIDC successfully

---

## Prevention Checklist

### Pre-Migration Verification

Before changing package names, verify these conditions:

#### Package Requirements

- [ ] **Understand OIDC first-publication limitation**: OIDC requires package to exist before Trusted Publishing works
- [ ] **Scoped packages preferred for branding**: Use `@scope/package-name` for brand recognition
- [ ] **Unscoped packages for discoverability**: Use `package-name` only if generic/searchable term
- [ ] **Commit to one naming strategy**: Migrating back and forth breaks OIDC trust

#### Current State Assessment

- [ ] **Check current package exists on npm**:

  ```bash
  npm view @scope/package-name
  ```

- [ ] **Verify current OIDC setup is working**:

  ```bash
  npm view @scope/package-name@latest --json | jq '.attestations'
  ```

- [ ] **Review current GitHub Actions workflow**:

  ```bash
  grep -A5 "setup-node" .github/workflows/release.yml
  # Check for registry-url parameter
  ```

- [ ] **Document current Trusted Publisher configuration**:
  - Organization name
  - Repository name
  - Workflow filename
  - Environment (if any)

#### Decision Matrix: Scoped vs Unscoped

Use this table to decide:

| Factor | Scoped (`@scope/name`) | Unscoped (`name`) |
|:------||:-----|:------------------|
| **Brand recognition** | ✅ Excellent (associates with org) | ❌ Poor (no org association) |
| **npm search ranking** | ❌ Lower (search ignores scope) | ✅ Higher (direct keyword match) |
| **Name availability** | ✅ Guaranteed (unique per scope) | ❌ Competitive (global namespace) |
| **OIDC setup** | ✅ Recommended by npm | ⚠️ Works but less common |
| **First publication** | ✅ Can use OIDC directly | ⚠️ Requires manual first publish |
| **Migration difficulty** | ⚠️ Requires new package name | ⚠️ Requires new package name |

**Recommendation**: Use scoped packages (`@ink-tools/*`) for:

- Brand recognition
- Monorepo consistency
- OIDC best practices
- Name availability guarantees

Use unscoped packages only for:

- Generic, highly-searchable terms (e.g., `xterm-mouse`, `lodash`, `express`)
- Libraries that predate scoped packages
- Foundation/utility libraries

---

## Common Pitfalls

### Pitfall 1: registry-url Blocks OIDC

**Problem**:

```yaml
# ❌ WRONG: registry-url forces token-based auth
- uses: actions/setup-node@v6
  with:
    node-version: "lts/*"
    registry-url: "https://registry.npmjs.org"  # This creates .npmrc
```

**What happens**:

1. `setup-node` action creates `.npmrc` file automatically
2. If `NPM_TOKEN` exists in GitHub Secrets, it's written to `.npmrc`
3. npm uses token-based auth instead of attempting OIDC
4. OIDC token exchange is bypassed entirely

**Solution**:

```yaml
# ✅ CORRECT: Let npm handle auth via OIDC
- uses: actions/setup-node@v6
  with:
    node-version: "lts/*"
    # No registry-url parameter!
```

**Why this works**:

- Without `registry-url`, `setup-node` doesn't create `.npmrc`
- npm CLI detects `id-token: write` permission
- npm exchanges OIDC token with GitHub automatically
- No manual token management required

**Verification**:

```bash
# Check workflow doesn't use registry-url
grep "registry-url" .github/workflows/release.yml
# Should return empty (or commented out)

# Verify OIDC is working after publication
npm view package-name@version --json | jq '.attestations'
```

---

### Pitfall 2: First Publication Fails with OIDC

**Problem**:

```text
npm ERR! code ENEEDAUTH
npm ERR! Unable to authenticate, need: Basic
```

**Cause**: OIDC requires package to exist on npm before Trusted Publisher works

**Solution**: Publish first version manually with authentication

#### Step 1: Login to npm

```bash
# Using npm CLI
npm login

# Or create token on npmjs.com and use
npm config set //registry.npmjs.org/:_authToken ${NPM_TOKEN}
```

#### Step 2: Publish First Version

```bash
# From package directory
cd packages/xterm-mouse

# Build package
bun run build

# Publish first version
npm publish

# Or use Changesets
bun changeset publish
```

#### Step 3: Verify Package Exists

```bash
# Check package on npm
npm view xterm-mouse

# Verify metadata
npm view xterm-mouse repository.url
```

#### Step 4: Configure Trusted Publisher

After first publication, configure OIDC:

1. Go to package on npm: <https://www.npmjs.com/package/xterm-mouse>
2. Navigate to **Settings** → **Trusted Publishers**
3. Click **Add Trusted Publisher**
4. Fill in:
   - **Organization**: `neiromaster`
   - **Repository**: `neiromaster/ink-tools`
   - **Workflow filename**: `.github/workflows/release.yml`
   - **Environment**: (leave empty)
5. Click **Create**

#### Step 5: Test OIDC Publication

```bash
# Create changeset for test version
bun changeset
# Select xterm-mouse, enter "patch" bump, add message: "test OIDC"

# Commit and push
git add .
git commit -m "test: add changeset for OIDC testing"
git push

# Verify release PR created successfully
# Merge PR and check OIDC publication
```

**Verification**:

```bash
# Check published version has attestations
npm view xterm-mouse@version --json | jq '.attestations'

# Expected output:
{
  "attestations": {
    "url": "https://registry.npmjs.org/-/npm/v1/attestations/xterm-mouse@version",
    "provenance": {
      "predicateType": "https://slsa.dev/provenance/v1"
    }
  }
}
```

---

### Pitfall 3: Package Name Change Breaks Trust Relationship

**Problem**: Changing package name breaks existing Trusted Publisher configuration

**What happens**:

1. Package `@ink-tools/xterm-mouse` has Trusted Publisher configured
2. Package name changed to `xterm-mouse` in package.json
3. Old Trusted Publisher still points to `@ink-tools/xterm-mouse`
4. OIDC publication fails because package name doesn't match

**Solution**: Reconfigure Trusted Publisher for new package name

#### Option 1: Keep Old Package (Recommended)

```json
// Old package remains on npm
{
  "name": "@ink-tools/xterm-mouse",
  "version": "0.7.1",
  "deprecated": "Use 'xterm-mouse' instead"
}
```

```json
// New package published separately
{
  "name": "xterm-mouse",
  "version": "1.0.0"
}
```

**Advantages**:

- Old package continues working for existing users
- No breaking changes for consumers
- Can deprecate old package gradually
- Separate Trusted Publisher configurations

**Disadvantages**:

- Two packages to maintain temporarily
- Need migration guide for users

#### Option 2: Replace Package (Not Recommended)

```json
// Replace existing package
{
  "name": "xterm-mouse",  // Changed from @ink-tools/xterm-mouse
  "version": "1.0.0"
}
```

**Disadvantages**:

- Breaking change for all users
- Old package name becomes unavailable
- Requires coordinated migration
- May confuse users

**Recommendation**: Use Option 1 (keep both packages)

---

### Pitfall 4: Scoped to Unscoped Migration Strategy

**Problem**: How to migrate users from scoped to unscoped package

**Solution**: Gradual migration with deprecation

#### Phase 1: Publish Unscoped Package

```bash
# Publish new unscoped package
cd packages/xterm-mouse
npm publish
```

#### Phase 2: Deprecate Scoped Package

```json
// packages/ink-tools-xterm-mouse/package.json
{
  "name": "@ink-tools/xterm-mouse",
  "version": "0.7.2",
  "deprecated": "Use 'xterm-mouse' instead. See migration guide."
}
```

#### Phase 3: Update Dependent Packages

```bash
# Update ink-mouse to use unscoped xterm-mouse
cd packages/ink-mouse

# Remove old dependency
bun remove @ink-tools/xterm-mouse

# Add new dependency
bun add xterm-mouse@latest
```

```json
// packages/ink-mouse/package.json
{
  "dependencies": {
    "xterm-mouse": "workspace:*"  // Changed from @ink-tools/xterm-mouse
  }
}
```

#### Phase 4: Create Migration Guide

Create `docs/migration-guide-scoped-to-unscoped.md`:

```markdown
# Migration Guide: @ink-tools/xterm-mouse → xterm-mouse

## Why the Change?

The `xterm-mouse` package is now published as an unscoped package for better discoverability in npm search results.

## Migration Steps

### 1. Update Dependencies

```bash
# Remove old package
bun remove @ink-tools/xterm-mouse

# Add new package
bun add xterm-mouse@latest
```

### 2. Update Imports

```typescript
// Before
import { Mouse } from '@ink-tools/xterm-mouse';

// After
import { Mouse } from 'xterm-mouse';
```

### 3. Update Lockfile

```bash
bun install
```

## Timeline

- **v0.7.2**: Last scoped version with deprecation notice
- **v1.0.0**: First unscoped version
- **Future**: Scoped package will be unpublished (TBD)

```

#### Phase 5: Announce Deprecation

Create GitHub issue with deprecation notice:

```markdown
# Deprecation: @ink-tools/xterm-mouse

The `@ink-tools/xterm-mouse` package is deprecated. Use `xterm-mouse` instead.

## Migration

See [Migration Guide](./docs/migration-guide-scoped-to-unscoped.md).

## Timeline

- **Phase 1**: Unscoped package published (v1.0.0)
- **Phase 2**: Scoped package deprecated (v0.7.2)
- **Phase 3**: Scoped package unpublished (6 months after v1.0.0)
```

---

## Best Practices

### Package Naming Strategy

#### Use Scoped Packages When

- Building a branded library ecosystem
- Publishing packages in a monorepo
- Want guaranteed name availability
- Need organizational association
- Following npm best practices

**Examples**:

- `@ink-tools/ink-mouse`
- `@ink-tools/ink-tabs`
- `@ink-tools/ink-table`

#### Use Unscoped Packages When

- Publishing generic, foundational libraries
- Package name is highly searchable
- Building language-agnostic tools
- Migrating existing popular packages

**Examples**:

- `xterm-mouse` (generic terminal utility)
- `lodash` (foundational library)
- `express` (web framework)

#### Decision Tree

```
Start: Need to publish a package
  │
  ├─ Is it a brand-specific tool?
  │   ├─ Yes → Use scoped package
  │   └─ No → Continue
  │
  ├─ Is it part of a monorepo?
  │   ├─ Yes → Use scoped package
  │   └─ No → Continue
  │
  ├─ Is the name generic/highly searchable?
  │   ├─ Yes → Use unscoped package
  │   └─ No → Use scoped package
  │
  └─ Final decision: Choose based on trade-offs
```

---

### OIDC Configuration for Unscoped Packages

#### GitHub Actions Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write
  id-token: write  # REQUIRED for OIDC

jobs:
  release:
    permissions:
      contents: write
      pull-requests: write
      id-token: write  # REQUIRED at job level too
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      # ✅ CRITICAL: No registry-url parameter!
      - uses: actions/setup-node@v6
        with:
          node-version: "lts/*"

      - name: Install dependencies
        run: bun install

      - name: Build packages
        run: bun run build

      - uses: changesets/action@v1
        with:
          version: bun changeset version
          publish: bun changeset publish
          title: "chore: Release packages"
          commit: "chore: Release packages"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_CONFIG_PROVENANCE: true  # Enable provenance
```

#### Key Points

1. **No registry-url**: This is critical for unscoped packages with OIDC
2. **id-token: write**: Required at both workflow and job level
3. **NPM_CONFIG_PROVENANCE**: Enables SLSA provenance generation
4. **No NPM_TOKEN**: OIDC handles authentication automatically

---

### First-Time Publication Strategy

#### For Unscoped Packages

```bash
# 1. Login to npm (only for first publication)
npm login

# 2. Publish first version manually
cd packages/xterm-mouse
bun run build
npm publish

# 3. Configure Trusted Publisher in npm dashboard
# Go to: https://www.npmjs.com/package/xterm-mouse/settings
# Add GitHub Actions Trusted Publisher

# 4. Test OIDC with second version
bun changeset
# Enter "patch" bump, add message: "test OIDC"

git add .
git commit -m "test: add changeset for OIDC"
git push

# 5. Verify OIDC publication
npm view xterm-mouse@version --json | jq '.attestations'
```

#### For Scoped Packages

```bash
# 1. Configure Trusted Publisher in npm dashboard FIRST
# (Package doesn't need to exist yet for scoped packages)

# 2. Publish first version with OIDC directly
cd packages/ink-mouse
bun run build
bun changeset publish
# OIDC will work on first publication for scoped packages
```

---

### Testing Strategy

#### Pre-Migration Testing

```bash
# 1. Test locally with new package name
cd packages/xterm-mouse

# 2. Build package
bun run build

# 3. Test package locally
bun test

# 4. Dry-run publish (doesn't actually publish)
npm publish --dry-run

# 5. Check for any errors
```

#### OIDC Configuration Testing

```bash
# 1. Verify workflow doesn't use registry-url
grep "registry-url" .github/workflows/release.yml
# Should return empty

# 2. Verify id-token permission exists
grep -A3 "permissions:" .github/workflows/release.yml | grep "id-token"
# Should show: id-token: write

# 3. Check npm version (must be 11.5.1+)
npm --version

# 4. Verify Trusted Publisher configured
# (Manual check in npm dashboard)
```

#### Post-Migration Verification

```bash
# 1. Check package exists on npm
npm view xterm-mouse

# 2. Verify repository URL
npm view xterm-mouse repository.url
# Should match: git+https://github.com/neiromaster/ink-tools.git

# 3. Check latest version has attestations
npm view xterm-mouse@latest --json | jq '.attestations'

# 4. Verify SLSA provenance type
npm view xterm-mouse@latest --json |
  jq '.attestations.provenance.predicateType'
# Expected: "https://slsa.dev/provenance/v1"

# 5. Test installation in new project
mkdir test-xterm-mouse
cd test-xterm-mouse
bun init
bun add xterm-mouse
# Should install successfully
```

---

## Migration Guide

### Scoped to Unscoped Package Migration

Follow this step-by-step guide to migrate from scoped to unscoped package name.

#### Phase 1: Preparation

**Step 1: Assess Migration Impact**

```bash
# Check package usage
npm view @ink-tools/xterm-mouse --json | jq '.downloads'

# Check dependent packages
# (Use npm's "depends" packages or GitHub search)

# Document current OIDC setup
# - Organization: neiromaster
# - Repository: neiromaster/ink-tools
# - Workflow: .github/workflows/release.yml
```

**Step 2: Verify Workflow Configuration**

```bash
# Check for registry-url (CRITICAL)
grep "registry-url" .github/workflows/release.yml
# If found, remove it! See Pitfall 1

# Verify id-token permission
grep -A5 "permissions:" .github/workflows/release.yml | grep "id-token"
# Should show: id-token: write
```

**Step 3: Update package.json**

```bash
cd packages/xterm-mouse

# Update package name
npm pkg set name="xterm-mouse"

# Verify changes
cat package.json | grep '"name"'
```

**Before**:

```json
{
  "name": "@ink-tools/xterm-mouse",
  "version": "0.7.1"
}
```

**After**:

```json
{
  "name": "xterm-mouse",
  "version": "1.0.0"  # Major bump for breaking change
}
```

**Step 4: Update README and Documentation**

```bash
# Update installation examples
# Find and replace: @ink-tools/xterm-mouse → xterm-mouse
```

**Before**:

```bash
npm install @ink-tools/xterm-mouse
```

**After**:

```bash
npm install xterm-mouse
```

**Step 5: Update Import Statements**

```bash
# Find all imports in codebase
grep -r "@ink-tools/xterm-mouse" packages/

# Update to use new package name
# @ink-tools/xterm-mouse → xterm-mouse
```

---

#### Phase 2: Publication

**Step 6: Remove registry-url from Workflow**

```yaml
# .github/workflows/release.yml

# ❌ REMOVE THIS LINE
- uses: actions/setup-node@v6
  with:
    node-version: "lts/*"
    registry-url: "https://registry.npmjs.org"  # DELETE THIS

# ✅ USE THIS INSTEAD
- uses: actions/setup-node@v6
  with:
    node-version: "lts/*"
```

**Commit this change first**:

```bash
git add .github/workflows/release.yml
git commit -m "fix: remove registry-url to enable OIDC for unscoped packages"
git push
```

**Step 7: Publish First Version Manually**

```bash
# Login to npm
npm login

# Build package
bun run build

# Publish first version of unscoped package
npm publish

# Verify package exists
npm view xterm-mouse
```

**Step 8: Configure Trusted Publisher**

1. Go to: <https://www.npmjs.com/package/xterm-mouse/settings>
2. Click **Trusted Publishers**
3. Click **Add Trusted Publisher**
4. Fill in:
   - **Organization**: `neiromaster`
   - **Repository**: `neiromaster/ink-tools`
   - **Workflow filename**: `.github/workflows/release.yml`
   - **Environment**: (leave empty)
5. Click **Create**

---

#### Phase 3: Testing

**Step 9: Create Test Changeset**

```bash
# Create changeset for test version
bun changeset
# Select xterm-mouse, enter "patch" bump
# Add message: "test OIDC publication"

# Commit changeset
git add .
git commit -m "test: add changeset for OIDC testing"
git push
```

**Step 10: Verify Release PR**

```bash
# Check Actions tab for workflow run
gh run list --workflow=release.yml --limit 5

# Monitor workflow logs for OIDC token generation
gh run watch

# Look for: "npm notice Publishing with provenance"
```

**Step 11: Merge Release PR**

```bash
# Merge PR (via GitHub UI or gh CLI)
gh pr merge <pr-number> --merge

# Monitor publication workflow
gh run list --workflow=release.yml
gh run watch
```

**Step 12: Verify OIDC Publication**

```bash
# Check published version has attestations
npm view xterm-mouse@version --json | jq '.attestations'

# Verify SLSA provenance
npm view xterm-mouse@version --json |
  jq '.attestations.provenance.predicateType'
# Expected: "https://slsa.dev/provenance/v1"
```

---

#### Phase 4: Deprecation

**Step 13: Deprecate Old Scoped Package**

```bash
cd packages/ink-tools-xterm-mouse  # Old package directory

# Bump version to add deprecation notice
npm version patch  # 0.7.1 → 0.7.2

# Add deprecation notice to package.json
npm pkg set deprecated="Use 'xterm-mouse' instead. See: https://github.com/neiromaster/ink-tools/blob/main/docs/migration-guide-scoped-to-unscoped.md"

# Publish deprecated version
bun run build
npm publish
```

**Step 14: Update Dependent Packages**

```bash
cd packages/ink-mouse

# Remove old dependency
bun remove @ink-tools/xterm-mouse

# Add new dependency
bun add xterm-mouse@latest

# Update imports
# Find and replace: @ink-tools/xterm-mouse → xterm-mouse

# Commit changes
git add .
git commit -m "feat: migrate to unscoped xterm-mouse package"
git push
```

**Step 15: Create Migration Guide**

Create `docs/migration-guide-scoped-to-unscoped.md` (see Phase 4 in Pitfall 4)

**Step 16: Announce Migration**

Create GitHub issue announcing deprecation and migration path.

---

#### Phase 5: Cleanup

**Step 17: Monitor Adoption**

```bash
# Track unscoped package downloads
npm view xterm-mouse --json | jq '.downloads'

# Track scoped package downloads (should decrease)
npm view @ink-tools/xterm-mouse --json | jq '.downloads'

# Check for issues or questions
gh issue list --search "xterm-mouse migration"
```

**Step 18: Timeline for Unpublishing**

Based on adoption metrics:

- **3 months**: Check download ratio (unscoped vs scoped)
- **6 months**: If unscoped > 90%, announce unpublishing date
- **12 months**: Unpublish scoped package (if appropriate)

**Step 19: Update Documentation**

```bash
# Update all README.md files
# Update CLAUDE.md files
# Update GitHub Actions setup guide
# Update any external documentation or tutorials
```

---

## Troubleshooting

### Error: ENEEDAUTH - Unable to Authenticate

**Cause**: OIDC token not generated or package doesn't exist on npm

**Solutions**:

1. **Package doesn't exist** (first publication):

   ```bash
   # Publish manually with token
   npm login
   npm publish
   ```

2. **Missing id-token permission**:

   ```yaml
   # Add to workflow
   permissions:
     id-token: write  # REQUIRED
   ```

3. **registry-url blocking OIDC**:

   ```yaml
   # Remove registry-url parameter
   - uses: actions/setup-node@v6
     with:
       node-version: "lts/*"
       # registry-url: "https://registry.npmjs.org"  # REMOVE THIS
   ```

---

### Error: 404 Package Not Found

**Cause**: Package doesn't exist on npm (first publication)

**Solution**: Publish first version manually

```bash
# Login to npm
npm login

# Publish first version
npm publish
```

---

### Error: Workflow Uses NPM_TOKEN Instead of OIDC

**Cause**: `registry-url` parameter forces token-based auth

**Solution**: Remove `registry-url` from workflow

```yaml
# Before
- uses: actions/setup-node@v6
  with:
    node-version: "lts/*"
    registry-url: "https://registry.npmjs.org"  # ❌ REMOVE

# After
- uses: actions/setup-node@v6
  with:
    node-version: "lts/*"
```

---

### Error: Trusted Publisher Configuration Fails

**Cause**: Package name changed but Trusted Publisher points to old name

**Solution**: Reconfigure Trusted Publisher for new package name

1. Remove old Trusted Publisher (if replacing package)
2. Add new Trusted Publisher with new package name
3. Verify workflow filename matches exactly

---

### Verification Commands

```bash
# Check package exists
npm view xterm-mouse

# Check repository URL
npm view xterm-mouse repository.url

# Check attestations exist
npm view xterm-mouse@version --json | jq '.attestations'

# Check SLSA provenance type
npm view xterm-mouse@version --json |
  jq '.attestations.provenance.predicateType'

# Check workflow has id-token permission
grep -A5 "permissions:" .github/workflows/release.yml | grep "id-token"

# Check workflow doesn't use registry-url
grep "registry-url" .github/workflows/release.yml
# Should return empty

# Check npm version (must be 11.5.1+)
npm --version
```

---

## Quick Reference

### Checklist: Scoped to Unscoped Migration

**Preparation**:

- [ ] Assessed migration impact (downloads, dependents)
- [ ] Verified workflow has `id-token: write`
- [ ] Removed `registry-url` from workflow
- [ ] Updated package.json with new name
- [ ] Updated README and documentation
- [ ] Updated import statements

**Publication**:

- [ ] Committed workflow changes (registry-url removal)
- [ ] Logged in to npm
- [ ] Published first version manually
- [ ] Configured Trusted Publisher in npm dashboard

**Testing**:

- [ ] Created test changeset
- [ ] Verified release PR created
- [ ] Merged release PR
- [ ] Verified OIDC publication with attestations

**Deprecation**:

- [ ] Added deprecation notice to old package
- [ ] Updated dependent packages
- [ ] Created migration guide
- [ ] Announced migration (GitHub issue)

**Cleanup**:

- [ ] Monitoring adoption metrics
- [ ] Timeline set for unpublishing old package
- [ ] Updated all documentation

---

### Critical Reminders

1. **registry-url blocks OIDC**: Always remove when using unscoped packages
2. **OIDC requires package to exist**: First publication must be manual
3. **Scoped packages are preferred**: Use unscoped only for generic libraries
4. **Reconfigure Trusted Publisher**: Package name change breaks trust relationship
5. **Deprecate, don't replace**: Keep old package for gradual migration

---

### Key Commands

```bash
# Remove registry-url from workflow
sed -i '/registry-url/d' .github/workflows/release.yml

# Publish first version manually
npm login && npm publish

# Verify OIDC publication
npm view package@version --json | jq '.attestations'

# Check Trusted Publisher configuration
# (Manual check in npm dashboard)
```

---

## Summary

### Key Takeaways

1. **Prevent registry-url issues**: Remove `registry-url` parameter to enable OIDC for unscoped packages
2. **First publication manual**: OIDC requires package to exist before Trusted Publishing works
3. **Scoped preferred**: Use scoped packages for branding, monorepos, and OIDC best practices
4. **Deprecation strategy**: Keep old package, deprecate gradually, maintain migration path
5. **Test thoroughly**: Verify OIDC publication with attestations after migration

### Success Criteria

- ✅ Unscoped package published on npm
- ✅ Trusted Publisher configured correctly
- ✅ OIDC publication working (attestations present)
- ✅ No `registry-url` in workflow
- ✅ Old package deprecated with notice
- ✅ Migration guide created
- ✅ Dependent packages updated

### Related Documentation

- **[npm Trusted Publishing OIDC Setup](./npm-trusted-publishing-oidc-setup.md)** - Complete OIDC implementation guide
- **[npm OIDC Prevention and Best Practices](./npm-oidc-prevention-and-best-practices.md)** - Comprehensive prevention strategies
- **[GitHub Actions Setup](../github-actions-setup.md)** - CI/CD configuration guide
