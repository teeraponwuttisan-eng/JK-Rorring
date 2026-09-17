@echo off
@setlocal enableextensions enabledelayedexpansion
title Somboon Procurement System - Auto Deploy to GitHub

echo ======================================================================
echo    SOMBOON GROUP - e-Procurement Committee System (PM-01)
echo                   Auto Push to GitHub & Trigger Deploy
echo ======================================================================
echo.

:: 1. Check if git is installed
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git is not installed or not in PATH.
    echo Please install Git from: https://git-scm.com/
    pause
    exit /b 1
)

:: 2. Check if git repository is initialized
if not exist ".git" (
    echo [INFO] Initializing Git repository...
    git init
    git branch -M main
)

:: 3. Check remote origin
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo [SETUP] No GitHub Remote URL configured yet.
    set /p REPO_URL="Enter GitHub Repository URL (e.g. https://github.com/username/repo.git): "
    if "!REPO_URL!"=="" (
        echo [ERROR] Invalid Repository URL. Cancelled.
        pause
        exit /b 1
    )
    git remote add origin !REPO_URL!
    echo [OK] Remote origin added successfully.
)

:: 4. Get Current Branch
set BRANCH=main
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set BRANCH=%%i
if "%BRANCH%"=="" set BRANCH=main
if "%BRANCH%"=="HEAD" set BRANCH=main

:: 5. Get commit message
echo.
set USER_MSG=
set /p USER_MSG="Enter Commit Message (Press Enter for auto-date message): "

if "%USER_MSG%"=="" (
    set COMMIT_MSG=Update Somboon Procurement System - %DATE% %TIME%
) else (
    set COMMIT_MSG=%USER_MSG%
)

:: 6. Stage, Commit & Push
echo.
echo [1/3] Staging files (git add .)...
git add .

echo.
echo [2/3] Committing changes (git commit)...
git commit -m "%COMMIT_MSG%"

echo.
echo [3/3] Pushing to GitHub (git push origin %BRANCH%)...
git push -u origin %BRANCH%

if %ERRORLEVEL% equ 0 (
    echo.
    echo ======================================================================
    echo  [SUCCESS] Successfully pushed to GitHub!
    echo  Render / Netlify will now automatically build and deploy your site.
    echo ======================================================================
) else (
    echo.
    echo ======================================================================
    echo  [NOTICE] Push failed or rejected.
    echo  Trying to pull and rebase before pushing again...
    echo ======================================================================
    git pull origin %BRANCH% --rebase
    git push -u origin %BRANCH%
)

echo.
pause
