#!/usr/bin/env pwsh

Write-Host "🧪 Testing API Endpoints`n" -ForegroundColor Green

# Wait a bit for server
Start-Sleep -Seconds 1

$baseUrl = "http://localhost:7777"
$testEmail = "testuser@example.com"
$testPassword = "password123"

# Test 1: Signup
Write-Host "1️⃣ Testing POST /signup" -ForegroundColor Cyan
$signupData = @{
    firstName = "Test"
    lastName = "User"
    email = $testEmail
    password = $testPassword
    age = 25
    gender = "male"
    skills = @("JavaScript", "Node.js")
    about = "Test user"
    photoUrl = "https://example.com/photo.jpg"
} | ConvertTo-Json

try {
    $signupRes = Invoke-WebRequest -Uri "$baseUrl/signup" `
        -Method POST `
        -ContentType "application/json" `
        -Body $signupData `
        -ErrorAction Stop
    Write-Host "✅ Status: $($signupRes.StatusCode)" -ForegroundColor Green
    Write-Host $signupRes.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.Response.Content.ReadAsStringAsync().Result
}
Write-Host "`n"

# Test 2: Login
Write-Host "2️⃣ Testing POST /login" -ForegroundColor Cyan
$loginData = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $loginRes = Invoke-WebRequest -Uri "$baseUrl/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData `
        -ErrorAction Stop
    Write-Host "✅ Status: $($loginRes.StatusCode)" -ForegroundColor Green
    Write-Host $loginRes.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
    
    # Extract token from cookies
    $token = $loginRes.Headers['Set-Cookie']
    Write-Host "Token: $token`n" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.Response.Content.ReadAsStringAsync().Result
}
Write-Host "`n"

# Test 3: Forgot Password
Write-Host "3️⃣ Testing POST /forgot-password" -ForegroundColor Cyan
$forgotData = @{
    email = $testEmail
} | ConvertTo-Json

try {
    $forgotRes = Invoke-WebRequest -Uri "$baseUrl/forgot-password" `
        -Method POST `
        -ContentType "application/json" `
        -Body $forgotData `
        -ErrorAction Stop
    Write-Host "✅ Status: $($forgotRes.StatusCode)" -ForegroundColor Green
    $forgotContent = $forgotRes.Content | ConvertFrom-Json
    Write-Host $forgotContent | ConvertTo-Json -Depth 3
    $resetToken = $forgotContent.resetToken
    Write-Host "Reset Token: $resetToken`n" -ForegroundColor Yellow
} catch {
    Write-Host " Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host "`n"

# Test 4: Reset Password
Write-Host "4️⃣ Testing POST /reset-password" -ForegroundColor Cyan
$resetData = @{
    token = $resetToken
    newPassword = "newpassword456"
    confirmPassword = "newpassword456"
} | ConvertTo-Json

try {
    $resetRes = Invoke-WebRequest -Uri "$baseUrl/reset-password" `
        -Method POST `
        -ContentType "application/json" `
        -Body $resetData `
        -ErrorAction Stop
    Write-Host "✅ Status: $($resetRes.StatusCode)" -ForegroundColor Green
    Write-Host $resetRes.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host "`n"

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Tests Completed!" -ForegroundColor Green
Write-Host "========================================`n"