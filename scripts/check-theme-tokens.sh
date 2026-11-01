#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ALLOW=(
  'src/components/ui/Button.tsx'
  'src/components/ui/IconButton.tsx'
  'src/components/FeedbackWhatsAppLink.tsx'
)

violations=0
while IFS= read -r file; do
  rel="${file#"$ROOT/"}"
  skip=0
  for a in "${ALLOW[@]}"; do
    if [[ "$rel" == "$a" ]]; then skip=1; break; fi
  done
  [[ $skip -eq 1 ]] && continue
  if matches=$(rg -n '\b(text-white|bg-black)\b' "$file" 2>/dev/null || true); then
    if [[ -n "$matches" ]]; then
      echo "Hardcoded theme color in ${file#"$ROOT/"} (use semantic ui-* tokens):"
      echo "$matches"
      violations=1
    fi
  fi
done < <(find src -name '*.tsx' -o -name '*.ts')

if [[ $violations -ne 0 ]]; then
  exit 1
fi

echo "Theme token guard: OK"
