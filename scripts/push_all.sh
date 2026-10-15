#!/bin/bash

# push_all.sh - Project-specific configuration for push_projects.sh
#
# Defines the CharacterBuilder family projects in dependency order and sources
# the reusable push_projects.sh script from the workflows repo.
#
# Usage:
#   ./push_all.sh                              # Update deps and process only projects with changes
#   ./push_all.sh --force                      # Force version bump on all projects
#   ./push_all.sh --subpackages                # Also process sub-packages in /packages directories
#   ./push_all.sh --starting-project <name>    # Skip projects until reaching <name>
#   ./push_all.sh --help                       # Show help message

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Define projects in dependency order with wait times
# Format: "relative_path:wait_after_in_seconds"
#
# This family uses bun's `link:` (global local links) between the
# `@sudobility/characterbuilder_*` packages during development — no consumer
# does `bun add @sudobility/characterbuilder_<sibling>@<version>` — so a wait
# here does NOT gate the next project's ability to resolve a fresh version.
# Waits are kept small for the publishing packages and 0 for those that never
# publish to npm (`skip-npm-publish: true` in CI, or no CI at all).
PROJECTS=(
    # Shared types + Zod schemas + the pure prompt composer. No sibling
    # dependency of its own. Publishes to npm (public).
    "../characterbuilder_types:30"
    # Network client + react-query hooks. Depends on characterbuilder_types.
    # Publishes to npm (restricted).
    "../characterbuilder_client:30"
    # Frontend business logic (draft store, form metadata). Depends on
    # characterbuilder_client and characterbuilder_types. Publishes to npm
    # (restricted).
    "../characterbuilder_lib:30"
    # The REST API service (Hono + Postgres + ShapeShyft). Depends on
    # characterbuilder_types. `skip-npm-publish: true` in CI — tests/build only.
    "../characterbuilder_api:0"
    # The web app itself, last: it depends on characterbuilder_client,
    # characterbuilder_lib and characterbuilder_types, and nothing depends on
    # it. No CI workflow (kept out of the CI rollout on purpose) — this entry
    # exists to version, commit and push it like every other repo.
    "../characterbuilder_app:0"
)

# Source reusable script: prefer local workflows repo, fall back to GitHub
LOCAL_SCRIPT="$(cd "$BASE_DIR" && pwd)/../workflows/scripts/push_projects.sh"
if [ -f "$LOCAL_SCRIPT" ]; then
    source "$LOCAL_SCRIPT"
else
    PUSH_SCRIPT=$(mktemp)
    trap "rm -f $PUSH_SCRIPT" EXIT
    if ! curl -fsSL "https://raw.githubusercontent.com/johnqh/workflows/main/scripts/push_projects.sh" -o "$PUSH_SCRIPT"; then
        echo "Error: Failed to download push_projects.sh from GitHub"
        exit 1
    fi
    source "$PUSH_SCRIPT"
fi

# Parse command-line arguments
parse_args "$@"

# Run the push process
run_push_projects "$BASE_DIR" "${PROJECTS[@]}"
