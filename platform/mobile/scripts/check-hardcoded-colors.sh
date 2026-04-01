#!/bin/bash
# Check for hardcoded hex colors in screen files
echo "Checking for hardcoded hex colors in screen files..."
RESULTS=$(grep -rn "'#[0-9a-fA-F]\{3,8\}'" apps/*/src/screens/ --include="*.tsx" | grep -v "// eslint-disable" | grep -v "test" || true)
if [ -n "$RESULTS" ]; then
  echo "Found hardcoded hex colors:"
  echo "$RESULTS"
  exit 1
else
  echo "No hardcoded hex colors found"
  exit 0
fi
