<#
PowerShell helper to apply all SQL files in supabase/migrations and supabase/seeds

Usage (PowerShell):
  $env:PGHOST='localhost'; $env:PGPORT='5432'; $env:PGUSER='postgres'; $env:PGPASSWORD='yourpwd'; $env:PGDATABASE='click_storage';
  pwsh .\scripts\apply-sql.ps1

Or to run against Supabase, set:
  $env:PGHOST='db.yoursupabase.host'; $env:PGPORT='5432'; $env:PGUSER='postgres'; $env:PGPASSWORD='<supabase-db-password>'; $env:PGDATABASE='postgres';

This script relies on psql being available in PATH. On Windows, you can install PostgreSQL and add psql.exe to PATH or use the Supabase CLI 'supabase db remote set' to connect.
#>

$ErrorActionPreference = 'Stop'

function Test-Command($cmd) {
    $which = Get-Command $cmd -ErrorAction SilentlyContinue
    return $which -ne $null
}

if (-not (Test-Command psql)) {
    Write-Error "psql not found in PATH. Please install PostgreSQL client or add psql to PATH."
    exit 1
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Resolve-Path "$root\.."

$migrations = Get-ChildItem -Path "$projectRoot\supabase\migrations" -Filter *.sql -File -Recurse | Sort-Object Name
$seeds = Get-ChildItem -Path "$projectRoot\supabase\seeds" -Filter *.sql -File -Recurse | Sort-Object Name

if (-not $migrations -and -not $seeds) {
    Write-Host "No SQL files found in supabase/migrations or supabase/seeds"
    exit 0
}

Write-Host "Using connection: $($env:PGUSER)@$($env:PGHOST):$($env:PGPORT)/$($env:PGDATABASE)"

foreach ($file in $migrations) {
    Write-Host "Applying migration: $($file.FullName)"
    & psql "host=$env:PGHOST port=$env:PGPORT user=$env:PGUSER password=$env:PGPASSWORD dbname=$env:PGDATABASE" -f $file.FullName
}

foreach ($file in $seeds) {
    Write-Host "Applying seed: $($file.FullName)"
    & psql "host=$env:PGHOST port=$env:PGPORT user=$env:PGUSER password=$env:PGPASSWORD dbname=$env:PGDATABASE" -f $file.FullName
}

Write-Host "All SQL files applied."
