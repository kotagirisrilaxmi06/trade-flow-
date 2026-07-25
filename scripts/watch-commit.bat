@echo off
echo Watching for file changes. Auto-commits every 30 seconds.
echo Press Ctrl+C to stop.

:loop
timeout /t 30 /nobreak >nul
git diff --quiet && git diff --cached --quiet
if errorlevel 1 (
  git add -A
  for /f %%i in ('git diff --cached --name-only ^| find /c /v ""') do set COUNT=%%i
  git commit -m "chore: auto-save %COUNT% file(s) at %TIME%"
  git push
  echo [%TIME%] Committed and pushed.
) else (
  echo [%TIME%] No changes.
)
goto loop
