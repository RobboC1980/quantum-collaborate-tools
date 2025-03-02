@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo    QuantumScribe AI Application Startup Script
echo ===================================================
echo.

REM Check if .env file exists
if not exist .env (
    echo WARNING: .env file not found. Creating a default one...
    echo VITE_QWEN_API_KEY=sk-cca2c0e57dd54ad19e4a8ef8c0ef23e2 > .env
    echo Created .env file with default API key.
    echo Please replace with your actual Qwen API key for production use.
    echo.
)

echo Checking for processes using required ports...

echo Checking port 3001 (API Proxy)...
REM Find processes using port 3001 and kill them if they exist
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Found process using port 3001: %%a
    echo Attempting to terminate process...
    taskkill /F /PID %%a
    if !ERRORLEVEL! EQU 0 (
        echo Successfully terminated process on port 3001
    ) else (
        echo Failed to terminate process on port 3001
    )
)

echo Checking port 3000 (Vite Server)...
REM Find processes using port 3000 and kill them if they exist
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Found process using port 3000: %%a
    echo Attempting to terminate process...
    taskkill /F /PID %%a
    if !ERRORLEVEL! EQU 0 (
        echo Successfully terminated process on port 3000
    ) else (
        echo Failed to terminate process on port 3000
    )
)

REM Also check ports 3002-3004 in case they're being used
for %%p in (3002 3003 3004) do (
    echo Checking port %%p...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING') do (
        echo Found process using port %%p: %%a
        echo Attempting to terminate process...
        taskkill /F /PID %%a
    )
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists, if not run npm install
if not exist node_modules (
    echo node_modules not found. Running npm install...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: npm install failed.
        echo Please check the error messages above.
        echo.
        pause
        exit /b 1
    )
)

echo.
echo Starting the application...
echo.
echo This will start:
echo  1. The API proxy server on port 3001
echo  2. The Vite development server on port 3000
echo.
echo You can access the application at: http://localhost:3000
echo.

REM Start the application using concurrently
npm run start

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Application failed to start properly.
    echo Please check the error messages above.
    echo.
    echo Common issues:
    echo  - Port 3000 or 3001 is already in use by another application
    echo  - Node.js or npm is not installed correctly
    echo  - Missing dependencies (try running 'npm install' manually)
    echo.
    echo Attempting to start with alternative approach...
    
    REM Try starting the proxy server and Vite server separately
    start cmd /k "node api-server.js"
    echo Started API proxy server in a separate window.
    
    REM Wait a moment for the API server to start
    timeout /t 3 /nobreak > nul
    
    start cmd /k "npm run dev"
    echo Started Vite development server in a separate window.
    
    echo.
    echo Application components started in separate windows.
    echo If you close this window, the application will continue running.
    echo To stop the application, close the command prompt windows that were opened.
    echo.
)

echo.
echo If the application is running correctly, you should be able to access it at:
echo http://localhost:3000
echo.
echo The API proxy server should be running at:
echo http://localhost:3002
echo.
echo Press Ctrl+C to stop the application.
echo.

endlocal 