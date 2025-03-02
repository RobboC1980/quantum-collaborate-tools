# PowerShell script to start the application
Write-Host "Checking for processes using required ports..." -ForegroundColor Cyan

# Function to check and kill processes on a specific port
function Clear-Port {
    param (
        [int]$Port,
        [string]$Description
    )
    
    Write-Host "Checking port $Port ($Description)..." -ForegroundColor Yellow
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object State -eq Listen
    
    foreach ($process in $processes) {
        $processId = $process.OwningProcess
        $processName = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
        
        Write-Host "Found process using port $Port`: $processName (PID: $processId)" -ForegroundColor Yellow
        Write-Host "Attempting to terminate process..." -ForegroundColor Yellow
        
        try {
            Stop-Process -Id $processId -Force
            Write-Host "Successfully terminated process on port $Port" -ForegroundColor Green
        } catch {
            Write-Host "Failed to terminate process on port $Port" -ForegroundColor Red
        }
    }
}

# Clear ports used by the application
Clear-Port -Port 3001 -Description "API Proxy"
Clear-Port -Port 3000 -Description "Vite Server"
Clear-Port -Port 3002 -Description "Alternative Vite Port"
Clear-Port -Port 3003 -Description "Alternative Vite Port"
Clear-Port -Port 3004 -Description "Alternative Vite Port"

# Start the application
Write-Host "Starting the application..." -ForegroundColor Cyan

# Use cmd.exe to run npm commands to avoid PowerShell-specific issues
cmd /c "npm run start"

# Check if the command was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Application failed to start properly." -ForegroundColor Red
    Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
} 