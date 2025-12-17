# PropertyApp Setup and Run Script
# This script will help set up and run the PropertyApp project

Write-Host "=== PropertyApp Setup Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking for Python installation..." -ForegroundColor Yellow
$pythonPath = $null

# Try different Python commands
$pythonCommands = @("python", "python3", "py")
foreach ($cmd in $pythonCommands) {
    $version = & $cmd --version 2>&1
    if ($LASTEXITCODE -eq 0 -or $version -match "Python") {
        $pythonPath = $cmd
        Write-Host "✓ Found Python: $version" -ForegroundColor Green
        break
    }
}

if (-not $pythonPath) {
    Write-Host "✗ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Python 3.8 or higher from:" -ForegroundColor Yellow
    Write-Host "  https://www.python.org/downloads/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or install via Microsoft Store:" -ForegroundColor Yellow
    Write-Host "  https://go.microsoft.com/fwlink?linkID=2082640" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installing Python, restart this script." -ForegroundColor Yellow
    exit 1
}

# Check Python version
Write-Host ""
Write-Host "Checking Python version..." -ForegroundColor Yellow
$versionOutput = & $pythonPath --version 2>&1
Write-Host "  $versionOutput" -ForegroundColor Gray

# Install/upgrade pip
Write-Host ""
Write-Host "Upgrading pip..." -ForegroundColor Yellow
& $pythonPath -m pip install --upgrade pip --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ pip upgraded" -ForegroundColor Green
} else {
    Write-Host "⚠ pip upgrade failed, continuing anyway..." -ForegroundColor Yellow
}

# Install dependencies
Write-Host ""
Write-Host "Installing project dependencies..." -ForegroundColor Yellow
& $pythonPath -m pip install -r requirements.txt
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Install Playwright browsers
Write-Host ""
Write-Host "Installing Playwright browsers (this may take a few minutes)..." -ForegroundColor Yellow
& $pythonPath -m playwright install chromium
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Playwright browsers installed" -ForegroundColor Green
} else {
    Write-Host "⚠ Playwright browser installation failed, continuing anyway..." -ForegroundColor Yellow
}

# Check for .env file
Write-Host ""
Write-Host "Checking for environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "⚠ .env file not found" -ForegroundColor Yellow
    Write-Host "  Creating .env template..." -ForegroundColor Gray
    
    $envContent = @"
# WordPress Configuration
WP_URL=http://localhost/propertyapp/wp-json/wp/v2/ukproperty
WP_USERNAME=admin
WP_APP_PASSWORD=your_app_password_here
WP_JWT_TOKEN=your_jwt_token_here

# OpenRouter API (for AI yield prediction)
OPENROUTER_API_KEY=your_openrouter_api_key_here
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✓ Created .env template - please update with your credentials" -ForegroundColor Green
} else {
    Write-Host "✓ .env file found" -ForegroundColor Green
}

# Run the project
Write-Host ""
Write-Host "=== Starting PropertyApp ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Running main scraper..." -ForegroundColor Yellow
Write-Host ""

& $pythonPath main.py

Write-Host ""
Write-Host "=== Script completed ===" -ForegroundColor Cyan

