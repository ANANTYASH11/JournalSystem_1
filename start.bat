@echo off
REM Quick startup script for Windows development

echo 🌿 Starting ArvyaX Journal System...
echo.

REM Check if in project root
if not exist "docker-compose.yml" (
    echo ❌ Please run this script from the project root directory
    exit /b 1
)

echo 📦 Installing backend dependencies...
cd backend
call npm install > nul 2>&1
cd ..

echo 📦 Installing frontend dependencies...
cd frontend
call npm install > nul 2>&1
cd ..

echo 🗄️  Setting up database...
cd backend
call npm run prisma:push > nul 2>&1
call npm run seed > nul 2>&1
cd ..

echo.
echo ✅ Setup complete!
echo.
echo 🚀 Starting servers (open two terminals for best experience)...
echo.
echo Frontend will run on: http://localhost:3000
echo Backend will run on:  http://localhost:3001
echo.
echo Option 1: Run both in one terminal (sequential):
echo   Terminal 1: cd backend ^& npm run dev
echo   Terminal 2: cd frontend ^& npm run dev
echo.
echo Option 2: Run in Docker (recommended for deployment):
echo   docker compose up --build
echo.
pause
