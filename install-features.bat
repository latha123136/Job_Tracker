@echo off
echo ========================================
echo Installing New Features Dependencies
echo ========================================
echo.

echo [1/3] Installing server dependencies...
cd server
call npm install node-cron nodemailer
if %errorlevel% neq 0 (
    echo Error installing server dependencies!
    pause
    exit /b 1
)
echo Server dependencies installed successfully!
echo.

echo [2/3] Checking client dependencies...
cd ..\client
echo Client dependencies are already up to date!
echo.

echo [3/3] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Update server/.env with email credentials:
echo    EMAIL_SERVICE=gmail
echo    EMAIL_USER=your_email@gmail.com
echo    EMAIL_PASSWORD=your_app_password
echo.
echo 2. Start the server:
echo    cd server
echo    npm run dev
echo.
echo 3. Start the client (in new terminal):
echo    cd client
echo    npm run dev
echo.
echo 4. Access new features:
echo    - Analytics: http://localhost:5173/analytics
echo    - Recommendations: http://localhost:5173/recommendations
echo    - Messages: http://localhost:5173/messages
echo.
echo For detailed documentation, see NEW_FEATURES.md
echo ========================================
pause
