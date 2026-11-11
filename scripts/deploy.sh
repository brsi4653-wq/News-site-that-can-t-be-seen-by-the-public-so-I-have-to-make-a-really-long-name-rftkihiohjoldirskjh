#!/usr/bin/env bash
# Build the site and publish it to Cloudflare Pages.
#
# Needs two settings in the shell before it runs:
#   CLOUDFLARE_API_TOKEN   the Cloudflare token (never save it in this repo)
#   CLOUDFLARE_ACCOUNT_ID  the Cloudflare account ID
#
# The upload is done from a folder outside the repo, because wrangler
# writes its own settings files wherever it runs. The "functions" folder
# (the comments system) has to sit beside the built site for the upload.
set -euo pipefail

repo="$(cd "$(dirname "$0")/.." && pwd)"
work="${DEPLOY_DIR:-${TMPDIR:-/tmp}/globalmayhem-deploy}"

cd "$repo"
rm -rf _site
npx eleventy

rm -rf "$work"
mkdir -p "$work"
cp -r _site "$work/site"
cp -r functions "$work/functions"

cd "$work"
CI=1 npx -y wrangler@latest pages deploy site --project-name globalmayhem --branch main --commit-dirty=true
