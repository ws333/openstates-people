#!/bin/bash

# Script to rebase the current branch on upstream/main and force push to origin
# Usage: ./rebaseUpstream.sh

set -e  # Exit on any error

echo "Fetching latest changes from upstream..."
git fetch upstream

echo "Rebasing current branch on upstream/main..."
git rebase upstream/main

# echo "Force pushing to origin..."
# git push origin HEAD --force

echo "Rebase complete! Your branch is now up to date with upstream. Force push to origin if everything looks ok."