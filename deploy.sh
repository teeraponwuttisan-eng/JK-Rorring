#!/bin/bash
# Somboon Procurement System - Auto Push & Deploy Script for Linux/macOS/Git Bash

echo "======================================================================"
echo "   SOMBOON GROUP - e-Procurement Committee & Approval System (PM-01)   "
echo "                  Auto Push to GitHub & Trigger Deploy                 "
echo "======================================================================"
echo ""

if ! command -v git &> /dev/null; then
    echo "[ERROR] Git is not installed."
    exit 1
fi

if [ ! -d ".git" ]; then
    echo "[INFO] Initializing Git..."
    git init
    git branch -M main
fi

if ! git remote get-url origin &> /dev/null; then
    echo "[SETUP] Remote origin not set."
    read -p "Enter GitHub Repository URL (e.g. https://github.com/username/repo.git): " REPO_URL
    if [ -n "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
    else
        echo "[ERROR] Invalid URL."
        exit 1
    fi
fi

BRANCH=$(git branch --show-current)
if [ -z "$BRANCH" ]; then
    BRANCH="main"
fi

read -p "Enter Commit Message (Press Enter for default): " USER_MSG
if [ -z "$USER_MSG" ]; then
    COMMIT_MSG="Update Somboon Procurement System - $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$USER_MSG"
fi

echo ""
echo "[1/3] Adding files (git add .)..."
git add .

echo "[2/3] Committing changes (git commit)..."
git commit -m "$COMMIT_MSG"

echo "[3/3] Pushing to GitHub (git push origin $BRANCH)..."
git push -u origin "$BRANCH"

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================================================"
    echo " [SUCCESS] Pushed to GitHub successfully! Render/Netlify will auto deploy."
    echo "======================================================================"
else
    echo ""
    echo "======================================================================"
    echo " [WARNING] Push failed. Check credentials or pull remote changes."
    echo "======================================================================"
fi
