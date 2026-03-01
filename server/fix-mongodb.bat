@echo off
echo 🔧 MongoDB Connection Fix Script
echo.

echo Option 1: Install MongoDB Community Server locally
echo Download from: https://www.mongodb.com/try/download/community
echo.

echo Option 2: Fix Atlas IP Whitelist
echo 1. Go to MongoDB Atlas dashboard
echo 2. Navigate to Network Access
echo 3. Click "Add IP Address"
echo 4. Add 0.0.0.0/0 to allow all IPs (for development only)
echo.

echo Option 3: Use temporary local connection
echo Starting server with local MongoDB fallback...
echo.

pause