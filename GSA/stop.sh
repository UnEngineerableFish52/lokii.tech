#!/bin/bash

# GSA App - Stop Script
# Stops both backend and frontend servers

echo "🛑 Stopping GSA App..."
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Read PIDs from files if they exist
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        echo -e "${GREEN}✓ Backend stopped${NC}"
    else
        echo "Backend server not running"
    fi
    rm -f logs/backend.pid
else
    echo "No backend PID file found"
fi

if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "Stopping frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        echo -e "${GREEN}✓ Frontend stopped${NC}"
    else
        echo "Frontend server not running"
    fi
    rm -f logs/frontend.pid
else
    echo "No frontend PID file found"
fi

# Also kill any processes on the ports as backup
echo ""
echo "Checking ports..."

for port in 3000 3001 19000 19001; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "Killing process on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null
    fi
done

echo ""
echo -e "${GREEN}✅ GSA App stopped successfully${NC}"
echo ""
