@echo off
REM Kill any existing process on port 7777
netstat -ano | findstr :7777 >nul && (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr :7777') do (
    taskkill /PID %%a /F
  )
)

REM Start server in background
start /B node src/app.js

REM Wait for server to start
timeout /t 3 /nobreak

echo.
echo ========================================
echo 🧪 Testing API Endpoints
echo ========================================
echo.

REM Test 1: Signup
echo 1️⃣  Testing POST /signup
curl -X POST http://localhost:7777/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"age\":25,\"gender\":\"male\",\"skills\":[\"JavaScript\",\"Node.js\"],\"about\":\"Test user\",\"photoUrl\":\"https://example.com/photo.jpg\"}"
echo.
echo.

REM Test 2: Login  
echo 2️⃣  Testing POST /login
curl -X POST http://localhost:7777/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}" ^
  -v
echo.
echo.

REM Test 3: Forgot Password
echo 3️⃣  Testing POST /forgot-password
curl -X POST http://localhost:7777/forgot-password ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\"}"
echo.
echo.

REM Test 4: Profile Edit (need auth token)
echo 4️⃣  Testing PATCH /profile/edit
curl -X PATCH http://localhost:7777/profile/edit ^
  -H "Content-Type: application/json" ^
  -d "{\"firstName\":\"Updated\",\"about\":\"Updated bio\"}"
echo.
echo.

REM Test 5: Change Password
echo 5️⃣  Testing PATCH /profile/password
curl -X PATCH http://localhost:7777/profile/password ^
  -H "Content-Type: application/json" ^
  -d "{\"currentPassword\":\"password123\",\"newPassword\":\"newpassword123\",\"confirmPassword\":\"newpassword123\"}"
echo.
echo.

echo ========================================
echo ✅ Test requests sent!
echo ========================================
