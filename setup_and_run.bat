@echo off
echo === PropertyApp Setup Script ===
echo.

echo Checking for Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH
    echo.
    echo Please install Python 3.8 or higher from:
    echo   https://www.python.org/downloads/
    echo.
    echo Or install via Microsoft Store:
    echo   https://go.microsoft.com/fwlink?linkID=2082640
    echo.
    pause
    exit /b 1
)

echo Python found!
python --version
echo.

echo Upgrading pip...
python -m pip install --upgrade pip --quiet
echo.

echo Installing project dependencies...
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Installing Playwright browsers (this may take a few minutes)...
python -m playwright install chromium
echo.

echo Checking for .env file...
if not exist .env (
    echo Creating .env template...
    (
        echo # WordPress Configuration
        echo WP_URL=http://localhost/propertyapp/wp-json/wp/v2/ukproperty
        echo WP_USERNAME=admin
        echo WP_APP_PASSWORD=your_app_password_here
        echo WP_JWT_TOKEN=your_jwt_token_here
        echo.
        echo # OpenRouter API ^(for AI yield prediction^)
        echo OPENROUTER_API_KEY=your_openrouter_api_key_here
    ) > .env
    echo .env template created - please update with your credentials
) else (
    echo .env file found
)
echo.

echo === Starting PropertyApp ===
echo.
echo Running main scraper...
echo.

python main.py

echo.
echo === Script completed ===
pause

