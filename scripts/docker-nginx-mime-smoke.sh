#!/usr/bin/env bash
# Build production image and assert nginx Content-Type + cache headers for static assets.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

IMAGE="${NGINX_SMOKE_IMAGE:-droid-tycoon-companion-nginx-mime-smoke:local}"
CONTAINER="${NGINX_SMOKE_CONTAINER:-dtc-nginx-mime-smoke}"
PORT="${NGINX_SMOKE_PORT:-18080}"
BASE_URL="http://127.0.0.1:${PORT}"

if docker info >/dev/null 2>&1; then
  DOCKER=(docker)
elif sudo docker info >/dev/null 2>&1; then
  DOCKER=(sudo docker)
else
  echo "Docker daemon not available" >&2
  exit 1
fi

header() {
  local path=$1
  local name=$2
  curl -sI "${BASE_URL}${path}" | tr -d '\r' | awk -F': ' -v n="$name" 'tolower($1)==tolower(n){print $2; exit}'
}

assert_content_type() {
  local path=$1
  local pattern=$2
  local ct
  ct="$(header "$path" Content-Type)"
  if [[ -z "$ct" ]] || ! echo "$ct" | grep -qiE "$pattern"; then
    echo "FAIL ${path}: Content-Type expected ~/${pattern}/i, got: ${ct:-<empty>}" >&2
    exit 1
  fi
  echo "OK  ${path} -> ${ct}"
}

assert_cache_no_store() {
  local path=$1
  local cc
  cc="$(header "$path" Cache-Control)"
  if [[ -z "$cc" ]] || ! echo "$cc" | grep -qi 'no-cache'; then
    echo "FAIL ${path}: Cache-Control expected no-cache, got: ${cc:-<empty>}" >&2
    exit 1
  fi
  echo "OK  ${path} Cache-Control -> ${cc}"
}

cleanup() {
  "${DOCKER[@]}" rm -f "$CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Building ${IMAGE}..."
"${DOCKER[@]}" build -t "$IMAGE" .

cleanup
"${DOCKER[@]}" run -d --name "$CONTAINER" -p "127.0.0.1:${PORT}:80" "$IMAGE" >/dev/null

for _ in $(seq 1 45); do
  if curl -sf -o /dev/null "$BASE_URL/"; then
    break
  fi
  sleep 1
done

if ! curl -sf -o /dev/null "$BASE_URL/"; then
  echo "Container did not respond on ${BASE_URL}" >&2
  "${DOCKER[@]}" logs "$CONTAINER" >&2 || true
  exit 1
fi

JS_PATH="$(
  "${DOCKER[@]}" exec "$CONTAINER" sh -c 'ls /usr/share/nginx/html/assets/*.js 2>/dev/null | head -1' \
    | sed 's|/usr/share/nginx/html||'
)"
CSS_PATH="$(
  "${DOCKER[@]}" exec "$CONTAINER" sh -c 'ls /usr/share/nginx/html/assets/*.css 2>/dev/null | head -1' \
    | sed 's|/usr/share/nginx/html||'
)"

if [[ -z "$JS_PATH" || -z "$CSS_PATH" ]]; then
  echo "Could not find built JS/CSS under /assets in container" >&2
  exit 1
fi

assert_content_type "$JS_PATH" 'application/javascript|text/javascript'
assert_content_type "$CSS_PATH" 'text/css'
assert_content_type '/pwa-192.png' 'image/png'
assert_content_type '/favicon.svg' 'image/svg(\+xml)?'
assert_content_type '/manifest.webmanifest' 'application/manifest\+json'
assert_content_type '/sw.js' 'application/javascript|text/javascript'
assert_cache_no_store '/sw.js'
assert_cache_no_store '/manifest.webmanifest'

echo "All nginx MIME smoke checks passed."
