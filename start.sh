#!/bin/bash
# Quick startup script for development

echo "🌿 Starting ArvyaX Journal System..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if in project root
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
npm install > /dev/null 2>&1

echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd ../frontend
npm install > /dev/null 2>&1
cd ..

echo -e "${BLUE}🗄️  Setting up database...${NC}"
cd backend
npm run prisma:push > /dev/null 2>&1
npm run seed > /dev/null 2>&1
cd ..

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}Starting servers...${NC}"
echo ""

# Start backend in background
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}🚀 Servers running:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for signals
wait
