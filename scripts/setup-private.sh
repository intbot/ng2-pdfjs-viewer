#!/usr/bin/env bash
#
# setup-private.sh — link this repo's private working folder into ./internal/
#
# Derives the project name from the current git repository and links
# ./internal/  ->  ../private/<project>  (a folder inside a sibling "private"
# git repo). Anything you keep under ./internal/ is physically stored in — and
# committed from — that private repo, never this public one. ./internal/ is
# also gitignored here as a backstop.
#
# Works on Linux, macOS, and Windows (Git Bash / MSYS2 / Cygwin). On Windows it
# creates a native directory junction (no admin / Developer Mode needed).
# Fails gracefully — if there is no matching private folder, it says so.

set -euo pipefail

# --- locate the repo and derive paths ----------------------------------------

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$repo_root" ]; then
  echo "setup-private: not inside a git repository — nothing to link." >&2
  exit 1
fi

project="$(basename "$repo_root")"
# sibling "private" repo: <repo_root>/../private/<project>
source_dir="$(cd "$repo_root/.." && pwd)/private/$project"
target_dir="$repo_root/internal"

# --- create the private source folder if it doesn't exist --------------------

if [ ! -d "$source_dir" ]; then
  echo "setup-private: no private folder at '$source_dir' — creating it."
  echo "               (remember to 'git add' it from inside the private repo)"
  mkdir -p "$source_dir"
fi

# --- handle an existing ./internal/ ------------------------------------------

if [ -L "$target_dir" ] || [ -d "$target_dir" ]; then
  # A junction shows up as a dir on Windows; readlink may be empty for it.
  current="$(readlink "$target_dir" 2>/dev/null || true)"
  echo "setup-private: ./internal already exists${current:+ -> $current} — leaving it as is."
  exit 0
fi

if [ -e "$target_dir" ]; then
  echo "setup-private: ./internal already exists and is not a link — refusing to touch it." >&2
  exit 1
fi

# --- create the link (OS-aware) ----------------------------------------------

case "$(uname -s)" in
  MINGW* | MSYS* | CYGWIN*)
    # Windows: prefer PowerShell New-Item -ItemType Junction — reliable and does
    # not need Developer Mode or an elevated shell. (Git Bash's `ln -s` often
    # copies instead of linking; `cmd /c mklink` is sensitive to path mangling.)
    if ! powershell -NoProfile -Command \
        "New-Item -ItemType Junction -Path '$target_dir' -Target '$source_dir' | Out-Null"; then
      echo "setup-private: failed to create junction to '$source_dir'." >&2
      exit 1
    fi
    ;;
  *)
    ln -s "$source_dir" "$target_dir"
    ;;
esac

echo "setup-private: linked ./internal -> $source_dir"
