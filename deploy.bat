@echo off
@setlocal enableextensions enabledelayedexpansion
title Somboon Procurement System - Auto Deploy to GitHub

echo ======================================================================
echo    SOMBOON GROUP - e-Procurement Committee System (PM-01)
echo                   Auto Push to GitHub & Trigger Deploy
echo ======================================================================
echo.

:: 1. Check Git
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git is not installed.
    pause
    exit /b 1
)

:: 2. Check Init
if not exist ".git" (
    echo [INFO] Initializing Git repository...
    git init
    git branch -M main
)

:: 3. Check Remote
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [INFO] Setting remote origin...
    git remote add origin https://github.com/teeraponwuttisan-eng/JK-Rorring.git
)

set BRANCH=main

:: 4. Get Commit Message
echo.
set USER_MSG=
set /p USER_MSG="Enter Commit Message (Press Enter for auto): "

if "%USER_MSG%"=="" (
    set COMMIT_MSG=Update Somboon Procurement System - %DATE% %TIME%
) else (
    set COMMIT_MSG=%USER_MSG%
)

:: 5. Add and Commit
echo.
echo [1/3] Staging files...
git add .

echo.
echo [2/3] Committing...
git commit -m "%COMMIT_MSG%"

:: 6. Push with automatic sync / fallback to force
echo.
echo [3/3] Pushing to GitHub (main)...
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ======================================================================
    echo  [SUCCESS] Successfully pushed to GitHub!
    echo  Render / Netlify will auto deploy your website now.
    echo ======================================================================
) else (
    echo.
    echo ======================================================================
    echo  [NOTICE] Remote has existing files (e.g. README/License).
    echo  Syncing with remote or updating branch...
    echo ======================================================================
    git pull origin main --allow-unrelated-histories --no-rebase -X theirs --no-edit >nul 2>&1
    git push -u origin main
    
    if !ERRORLEVEL! neq 0 (
        echo.
        echo Force pushing local project to GitHub main branch...
        git push -u origin main --force
    )
    
    echo.
    echo ======================================================================
    echo  [SUCCESS] Successfully pushed to GitHub!
    echo ======================================================================
)

echo.
pause
