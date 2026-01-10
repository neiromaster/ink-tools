#!/bin/bash
#
# Detect common Vitest configuration issues in the monorepo
#
# This script checks for:
# 1. Packages without vitest.config.ts
# 2. Packages not extending base config
# 3. Workspace dependency resolution issues
#
# Exit codes:
# 0: All checks passed
# 1: One or more checks failed

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Detecting common Vitest issues..."
echo ""

# Track failures
FAILURES=0

# Check 1: Packages without vitest.config.ts
echo "1. Checking for missing vitest.config.ts files..."
MISSING_CONFIGS=$(find packages -name "package.json" -type f | while read pkg; do
  dir=$(dirname "$pkg")
  if [ ! -f "$dir/vitest.config.ts" ]; then
    echo "$dir"
  fi
done)

if [ -n "$MISSING_CONFIGS" ]; then
  echo -e "${RED}ERROR: Missing vitest.config.ts in:${NC}"
  echo "$MISSING_CONFIGS" | while read dir; do
    echo -e "  ${RED}✗${NC} $dir/vitest.config.ts"
  done
  FAILURES=$((FAILURES + 1))
else
  echo -e "${GREEN}✓${NC} All packages have vitest.config.ts"
fi
echo ""

# Check 2: Packages extending base config
echo "2. Checking if packages extend base config..."
NOT_EXTENDING=$(find packages -name "vitest.config.ts" -type f | while read config; do
  if ! grep -q "from '../../vitest.config.base'" "$config"; then
    echo "$config"
  fi
done)

if [ -n "$NOT_EXTENDING" ]; then
  echo -e "${YELLOW}WARNING: Configs that don't extend base:${NC}"
  echo "$NOT_EXTENDING" | while read config; do
    echo -e "  ${YELLOW}⚠${NC} $config"
  done
  echo -e "  ${YELLOW}Consider extending base config for consistency${NC}"
else
  echo -e "${GREEN}✓${NC} All packages extend base config"
fi
echo ""

# Check 3: Workspace dependency resolution
echo "3. Testing workspace dependency resolution..."
if pnpm --filter './packages/*' exec node -e "process.exit(0)" 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Workspace dependencies resolve correctly"
else
  echo -e "${RED}ERROR: Workspace dependency resolution failed${NC}"
  echo -e "  ${RED}✗${NC} Run 'pnpm install' and check workspace: dependencies"
  FAILURES=$((FAILURES + 1))
fi
echo ""

# Check 4: Verify base config exists
echo "4. Checking base configuration..."
if [ -f "vitest.config.base.ts" ]; then
  echo -e "${GREEN}✓${NC} Base config exists"
else
  echo -e "${RED}ERROR: Missing vitest.config.base.ts${NC}"
  echo -e "  ${RED}✗${NC} Create vitest.config.base.ts in repository root"
  FAILURES=$((FAILURES + 1))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $FAILURES -gt 0 ]; then
  echo -e "${RED}❌ Detected $FAILURES issue(s)${NC}"
  echo ""
  echo "Common fixes:"
  echo "  1. Add vitest.config.ts to package directory"
  echo "  2. Extend base config: import baseConfig from '../../vitest.config.base'"
  echo "  3. Run: pnpm install"
  echo "  4. Run: pnpm run build"
  echo ""
  exit 1
else
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  exit 0
fi
