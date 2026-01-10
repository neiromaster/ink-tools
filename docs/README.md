# Documentation Index

This directory contains comprehensive documentation for the ink-tools monorepo.

## Vitest Configuration Documentation

The Vitest configuration documentation provides guidance on setting up and maintaining Vitest in pnpm workspace monorepos.

### Quick Start

**New to the project?** Start here:

- [Implementation Summary](./VITEST-IMPLEMENTATION-SUMMARY.md) - Overview of the Vitest configuration solution

**Need to add tests?** Read this:

- [Quick Checklist](./VITEST-CHECKLIST.md) - Pre-commit and validation checklist

**Comprehensive reference?** See this:

- [Configuration Guide](./VITEST-CONFIG-GUIDE.md) - Complete guide with examples and troubleshooting

### Document Overview

#### VITEST-IMPLEMENTATION-SUMMARY.md

Concise summary of the Vitest module resolution issue and the solution implemented in this monorepo.

**When to read**:

- Understanding the overall approach
- Getting started with the project
- Reviewing architectural decisions

**Contents**:

- Problem description
- Solution overview
- Implementation details
- Migration path
- Benefits and maintenance

#### VITEST-CHECKLIST.md

Quick-reference checklist for Vitest configuration and validation.

**When to read**:

- Before committing changes
- Setting up a new package
- Debugging test failures

**Contents**:

- New package setup checklist
- Pre-commit validations
- CI/CD requirements
- Quick fix templates
- Common commands

#### VITEST-CONFIG-GUIDE.md

Comprehensive guide for Vitest configuration in pnpm monorepos.

**When to read**:

- Need detailed explanations
- Troubleshooting complex issues
- Establishing team practices
- Onboarding new developers

**Contents**:

- Understanding the problem
- Prevention strategies
- Best practices
- Testing checklist
- Common pitfalls
- Configuration templates
- Troubleshooting guide

## Using This Documentation

### For New Contributors

1. Read [Implementation Summary](./VITEST-IMPLEMENTATION-SUMMARY.md) for context
2. Follow the [Quick Checklist](./VITEST-CHECKLIST.md) when adding code
3. Reference the [Configuration Guide](./VITEST-CONFIG-GUIDE.md) for details

### For Maintainers

1. Keep [Implementation Summary](./VITEST-IMPLEMENTATION-SUMMARY.md) updated with changes
2. Update [Checklist](./VITEST-CHECKLIST.md) with new validation steps
3. Expand [Configuration Guide](./VITEST-CONFIG-GUIDE.md) with lessons learned

### For Debugging

1. Check [Quick Checklist](./VITEST-CHECKLIST.md) for common issues
2. Run diagnostic commands from the checklist
3. Consult [Configuration Guide](./VITEST-CONFIG-GUIDE.md) troubleshooting section
4. Review [Implementation Summary](./VITEST-IMPLEMENTATION-SUMMARY.md) for architecture

## Related Documentation

### Project Documentation

- [CLAUDE.md](../CLAUDE.md) - Project overview and development guidelines
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines (if exists)
- Package-specific CLAUDE.md files in `packages/*/`

### External Resources

- [Vitest Documentation](https://vitest.dev/)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Ink Documentation](https://github.com/vadimdemedes/ink)

## Contributing to Documentation

When adding to these docs:

1. **Choose the right document**:
   - Summary: High-level overview and architecture
   - Checklist: Quick reference and procedures
   - Guide: Detailed explanations and examples

2. **Follow conventions**:
   - Use relative paths to project files
   - Include code examples
   - Provide copy-pasteable snippets
   - Update table of contents

3. **Test your changes**:
   - Run verification scripts
   - Follow your own instructions
   - Get feedback from team

4. **Keep it current**:
   - Update with new features
   - Add lessons learned
   - Remove outdated information
   - Cross-reference related docs

## Quick Reference

### Essential Commands

```bash
# Validate all vitest configs
pnpm verify:configs

# Detect common issues
pnpm verify:tests

# Run all tests
pnpm -r --filter './packages/*' test

# Build packages
pnpm run build
```

### File Locations

```text
docs/
├── README.md (this file)
├── VITEST-IMPLEMENTATION-SUMMARY.md
├── VITEST-CHECKLIST.md
└── VITEST-CONFIG-GUIDE.md

scripts/
├── verify-vitest-configs.js
└── detect-vitest-issues.sh

vitest.config.base.ts
vitest.config.ts
packages/*/vitest.config.ts
```

### Common Tasks

**Add a new package**:

1. Follow checklist in VITEST-CHECKLIST.md
2. Use template from VITEST-CONFIG-GUIDE.md
3. Run `pnpm verify:configs`

**Debug test failures**:

1. Check VITEST-CHECKLIST.md warning signs
2. Run diagnostic commands
3. Consult VITEST-CONFIG-GUIDE.md troubleshooting

**Update CI workflow**:

1. Reference VITEST-IMPLEMENTATION-SUMMARY.md
2. Follow validation job pattern
3. Add new checks to scripts/

## Support

### Getting Help

1. Check the troubleshooting section in [Configuration Guide](./VITEST-CONFIG-GUIDE.md)
2. Review common issues in [Checklist](./VITEST-CHECKLIST.md)
3. Search existing GitHub issues
4. Create new issue with diagnostic output

### Reporting Issues

When reporting Vitest configuration issues, include:

- Error messages
- Configuration files (vitest.config.ts)
- Package structure
- Steps to reproduce
- Output from `pnpm verify:tests`

---

**Last Updated**: 2025-01-10
**Maintainer**: @neiromaster
