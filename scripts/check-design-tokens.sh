#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ALLOW_FILES=(
  'src/components/ui/Button.tsx'
  'src/components/ui/IconButton.tsx'
  'src/components/FeedbackWhatsAppLink.tsx'
)

violations=0
while IFS= read -r file; do
  rel="${file#"$ROOT/"}"
  skip=0
  for a in "${ALLOW_FILES[@]}"; do
    if [[ "$rel" == "$a" ]]; then skip=1; break; fi
  done
  [[ $skip -eq 1 ]] && continue
  if matches=$(rg -n '#[0-9a-fA-F]{3,8}\b' "$file" 2>/dev/null || true); then
    if [[ -n "$matches" ]]; then
      echo "Raw hex color in ${rel} (use design/theme tokens):"
      echo "$matches"
      violations=1
    fi
  fi
done < <(find src -name '*.tsx')

if [[ $violations -ne 0 ]]; then
  exit 1
fi

echo "Design token hex guard: OK"
