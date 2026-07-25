@echo off
git add -A
for /f "delims=" %%i in ('git diff --cached --name-only') do set FILES=%%i
if "%FILES%"=="" (
  echo No changes to commit.
  exit /b 0
)
for /f %%i in ('git diff --cached --name-only ^| find /c /v ""') do set COUNT=%%i
git commit -m "chore: auto-commit %COUNT% changed file(s) on %DATE% %TIME%"
git push
echo Done.
