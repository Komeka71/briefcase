# =====================================================================
# BriefCase - Database Object Application Runner (PowerShell)
# Applies all stored procedures, functions, triggers, views, indexes,
# role security, and finance integrity scripts in sequential order.
# =====================================================================

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backendEnvPath = Join-Path $scriptDir "..\backend\.env"

if (-not (Test-Path $backendEnvPath)) {
    Write-Error "Backend environment file not found at $backendEnvPath"
    exit 1
}

# Parse .env without echoing secrets
$envConfig = @{}
Get-Content $backendEnvPath | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line.Split("=", 2)
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $val = $parts[1].Trim().Trim('"').Trim("'")
            $envConfig[$key] = $val
        }
    }
}

$dbHost = if ($envConfig.ContainsKey("DB_HOST")) { $envConfig["DB_HOST"] } else { "localhost" }
$dbPort = if ($envConfig.ContainsKey("DB_PORT")) { $envConfig["DB_PORT"] } else { "3306" }
$dbName = if ($envConfig.ContainsKey("DB_NAME")) { $envConfig["DB_NAME"] } else { "briefcase" }
$dbUser = if ($envConfig.ContainsKey("DB_MIGRATION_USER")) { $envConfig["DB_MIGRATION_USER"] } else { "root" }
$dbPass = if ($envConfig.ContainsKey("DB_MIGRATION_PASSWORD")) { $envConfig["DB_MIGRATION_PASSWORD"] } else { "" }

# Locate mysql binary
$mysqlBin = "mysql"
$possiblePaths = @(
    "D:\mysql\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
)
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $mysqlBin = $path
        break
    }
}

$filesToApply = @(
    "03_crud_procedures.sql",
    "05_cursor_procedures.sql",
    "06_pagination.sql",
    "07_aggregate_functions.sql",
    "08_validation_triggers.sql",
    "09_normalization_triggers.sql",
    "10_audit_logging.sql",
    "11_office_hours_restriction.sql",
    "12_views.sql",
    "13_indexes.sql",
    "16_role_security.sql",
    "18_finance_integrity.sql",
    "20_view_trigger_demo.sql"
)

Write-Host "========================================================================"
Write-Host " BriefCase Database Object Re-Application"
Write-Host " Target: $dbName on ${dbHost}:${dbPort} (User: $dbUser)"
Write-Host " Using client: $mysqlBin"
Write-Host "========================================================================"

# Set temporary environment variable for MySQL password to prevent command line disclosure
$env:MYSQL_PWD = $dbPass

foreach ($file in $filesToApply) {
    $fullPath = Join-Path $scriptDir $file
    if (-not (Test-Path $fullPath)) {
        Write-Warning "Skipping missing file: $file"
        continue
    }

    Write-Host -NoNewline "Applying $file ... "
    $cmdArgs = @(
        "-h", $dbHost,
        "-P", $dbPort,
        "-u", $dbUser,
        $dbName,
        "--default-character-set=utf8mb4"
    )

    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = $mysqlBin
    $processInfo.Arguments = ($cmdArgs -join " ")
    $processInfo.RedirectStandardInput = $true
    $processInfo.RedirectStandardOutput = $true
    $processInfo.RedirectStandardError = $true
    $processInfo.UseShellExecute = $false
    $processInfo.CreateNoWindow = $true

    $process = [System.Diagnostics.Process]::Start($processInfo)
    $inputSql = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
    $process.StandardInput.Write($inputSql)
    $process.StandardInput.Close()

    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()

    if ($process.ExitCode -eq 0) {
        Write-Host "SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "FAILED (Exit code $($process.ExitCode))" -ForegroundColor Red
        if ($stderr) {
            Write-Host $stderr -ForegroundColor DarkRed
        }
        $env:MYSQL_PWD = $null
        exit $process.ExitCode
    }
}

$env:MYSQL_PWD = $null
Write-Host "------------------------------------------------------------------------"
Write-Host "All database objects applied and verified successfully!" -ForegroundColor Green
Write-Host "------------------------------------------------------------------------"
