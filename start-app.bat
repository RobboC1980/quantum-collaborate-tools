@echo off
echo Checking for processes using port 3001...

REM Find processes using port 3001 and kill them if they exist
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Found process using port 3001: %%a
    echo Attempting to terminate process...
    taskkill /F /PID %%a
    if %ERRORLEVEL% EQU 0 (
        echo Successfully terminated process
    ) else (
        echo Failed to terminate process
    )
)

echo Starting the application...
npm run start 