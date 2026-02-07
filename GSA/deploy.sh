#!/bin/bash

# GSA App Deployment Helper Script
# This script helps you deploy the GSA app quickly

echo "========================================="
echo "  GSA App - Quick Deployment Helper"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 14+ first.${NC}"
    exit 1
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION} installed${NC}"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found. Please install npm first.${NC}"
    exit 1
else
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm ${NPM_VERSION} installed${NC}"
fi

echo ""
echo -e "${BLUE}Choose deployment option:${NC}"
echo "1. Local Development (Test locally)"
echo "2. Production Setup (Deploy to server)"
echo "3. Build APK (Create Android app)"
echo "4. Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}Setting up for local development...${NC}"
        echo ""
        
        # Backend setup
        echo -e "${BLUE}Step 1: Setting up Backend${NC}"
        cd backend
        
        if [ ! -f ".env" ]; then
            echo -e "${YELLOW}Creating .env file from template...${NC}"
            cp .env.example .env
            echo -e "${GREEN}✓ .env file created${NC}"
            echo -e "${YELLOW}You can edit backend/.env to customize settings${NC}"
        else
            echo -e "${GREEN}✓ .env file already exists${NC}"
        fi
        
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}Installing backend dependencies...${NC}"
            npm install
            echo -e "${GREEN}✓ Backend dependencies installed${NC}"
        else
            echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
        fi
        
        cd ..
        
        # Frontend setup
        echo ""
        echo -e "${BLUE}Step 2: Setting up Frontend${NC}"
        
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}Installing frontend dependencies...${NC}"
            npm install
            echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
        else
            echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
        fi
        
        echo ""
        echo -e "${GREEN}=========================================${NC}"
        echo -e "${GREEN}  Setup Complete! Ready to run.${NC}"
        echo -e "${GREEN}=========================================${NC}"
        echo ""
        echo -e "${BLUE}To start the app:${NC}"
        echo ""
        echo "Terminal 1 (Backend):"
        echo -e "${YELLOW}  cd GSA/backend && npm start${NC}"
        echo ""
        echo "Terminal 2 (Frontend):"
        echo -e "${YELLOW}  cd GSA && npm start${NC}"
        echo ""
        echo "Then scan the QR code with Expo Go app on your phone!"
        echo ""
        ;;
        
    2)
        echo ""
        echo -e "${YELLOW}Production Setup Guide${NC}"
        echo ""
        echo "For production deployment, please see:"
        echo -e "${BLUE}  DEPLOYMENT_GUIDE.md${NC}"
        echo ""
        echo "Quick options:"
        echo "1. Heroku: Follow 'Option 2: Heroku Deployment' in guide"
        echo "2. VPS (AWS/DO): Follow 'Option 3: DigitalOcean/AWS' in guide"
        echo ""
        ;;
        
    3)
        echo ""
        echo -e "${YELLOW}Building Android APK${NC}"
        echo ""
        echo "To build APK, you need:"
        echo "1. Expo CLI installed: npm install -g expo-cli"
        echo "2. Expo account (free): expo register"
        echo ""
        echo "Then run:"
        echo -e "${BLUE}  cd GSA${NC}"
        echo -e "${BLUE}  expo build:android${NC}"
        echo ""
        echo "See DEPLOYMENT_GUIDE.md for details"
        echo ""
        ;;
        
    4)
        echo "Goodbye!"
        exit 0
        ;;
        
    *)
        echo -e "${RED}Invalid choice. Please run again.${NC}"
        exit 1
        ;;
esac
