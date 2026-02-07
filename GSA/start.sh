#!/bin/bash

# GSA App - Simple Startup Script
# Starts both backend and frontend servers

echo "🚀 Starting GSA App..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"
echo ""

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${RED}❌ Port $1 is already in use!${NC}"
        echo "Kill the process with: lsof -ti:$1 | xargs kill -9"
        return 1
    fi
    return 0
}

# Check if ports are available
echo "Checking ports..."
check_port 3000 || exit 1
check_port 3001 || exit 1
check_port 19000 || exit 1
echo -e "${GREEN}✓ Ports are available${NC}"
echo ""

# Setup backend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Setting up Backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd backend

# Install backend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

echo ""

# Setup frontend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Setting up Frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd ..

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 Starting Servers..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create log directory
mkdir -p logs

echo "Starting backend server..."
cd backend
node server.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if backend started successfully
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend server started (PID: $BACKEND_PID)${NC}"
    echo -e "  ${BLUE}API: http://localhost:3000${NC}"
    echo -e "  ${BLUE}Socket.io: http://localhost:3001${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    echo "Check logs/backend.log for details"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "Starting frontend server..."
npm start > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

if lsof -Pi :19000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend server started (PID: $FRONTEND_PID)${NC}"
    echo -e "  ${BLUE}Dev Tools: http://localhost:19000${NC}"
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
    echo "Check logs/frontend.log for details"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}✅ GSA App is Running!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Next steps:"
echo "  1. Open Expo Go app on your phone"
echo "  2. Scan the QR code below"
echo "  3. App will load automatically!"
echo ""
echo "🌐 Access points:"
echo "  Backend:  http://localhost:3000"
echo "  Frontend: http://localhost:19000"
echo ""
echo "📋 Process IDs:"
echo "  Backend:  $BACKEND_PID"
echo "  Frontend: $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "  Backend:  logs/backend.log"
echo "  Frontend: logs/frontend.log"
echo ""
echo "🔴 To stop: Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Save PIDs to file for easy shutdown
echo "$BACKEND_PID" > logs/backend.pid
echo "$FRONTEND_PID" > logs/frontend.pid

# Display QR code
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📱 Scan QR Code to Open App"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Follow frontend logs to show QR code
tail -f logs/frontend.log
