# Backend Linting Script
# This script runs StyleCop analysis on the .NET backend project

Write-Host "Running StyleCop analysis on backend..." -ForegroundColor Green

# Run dotnet build to trigger StyleCop analysis
dotnet build --verbosity quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend linting passed" -ForegroundColor Green
} else {
    Write-Host "✗ Backend linting failed with $LASTEXITCODE violations" -ForegroundColor Red
    exit $LASTEXITCODE
}