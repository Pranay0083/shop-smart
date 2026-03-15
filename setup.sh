#!/usr/bin/env bash

# ShopSmart Environment Setup Script (idempotent)
# - Creates env files only if missing
# - Installs dependencies only if needed (or with --force)
# - Runs Prisma generate/migrate if Prisma schema exists and Prisma is available

set -euo pipefail

FORCE=false
while [[ $# -gt 0 ]]; do
    case "$1" in
        --force|-f) FORCE=true; shift ;;
        --help|-h) echo "Usage: $0 [--force]"; exit 0 ;;
        *) echo "Unknown arg: $1"; exit 1 ;;
    esac
done

echo "🚀 ShopSmart Idempotent Setup"
echo "================================"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed. Please install it and re-run this script.${NC}"
        return 1
    fi
    return 0
}

echo -e "${BLUE}Checking required commands: node, npm${NC}"
check_command node || exit 1
check_command npm || exit 1
echo -e "${GREEN}✅ Node and npm are available${NC}"

# Root package convenience: ensure concurrently available if root script uses it
if [ -f package.json ]; then
    if grep -q "concurrently" package.json && [ ! -d node_modules ]; then
        echo -e "${BLUE}Installing root devDependencies...${NC}"
        npm install --no-audit --no-fund || true
    fi
fi

INSTALL_IF_NEEDED() {
    # $1 = path
    # Installs dependencies if node_modules is missing or --force
    local P="$1"
    if [ ! -d "$P" ]; then
        echo -e "${RED}❌ Directory $P not found${NC}"
        return 1
    fi
    if [ "$FORCE" = true ] || [ ! -d "$P/node_modules" ]; then
        echo -e "${BLUE}Installing dependencies in $P...${NC}"
        pushd "$P" > /dev/null
        if [ -f package-lock.json ]; then
            npm ci --no-audit --no-fund
        else
            npm install --no-audit --no-fund
        fi
        popd > /dev/null
        echo -e "${GREEN}✅ Installed $P dependencies${NC}"
    else
        echo -e "${GREEN}✅ Skipping $P install (node_modules exists). Use --force to reinstall.${NC}"
    fi
}

echo -e "\n${BLUE}Installing server dependencies (idempotent)...${NC}"
INSTALL_IF_NEEDED "server"

echo -e "\n${BLUE}Installing client dependencies (idempotent)...${NC}"
INSTALL_IF_NEEDED "client"

# Environment files (only create if missing)
echo -e "\n${BLUE}Ensuring environment files exist...${NC}"
if [ ! -f server/.env ]; then
    cat > server/.env <<'EOF'
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (SQLite)
DATABASE_URL="file:./dev.db"

# CORS Configuration
CLIENT_URL=http://localhost:5173

EOF
    echo -e "${GREEN}✅ Created server/.env${NC}"
else
    echo -e "${GREEN}✅ server/.env already exists${NC}"
fi

if [ ! -f client/.env ]; then
    cat > client/.env <<'EOF'
# API Configuration
VITE_API_URL=http://localhost:5000/api
EOF
    echo -e "${GREEN}✅ Created client/.env${NC}"
else
    echo -e "${GREEN}✅ client/.env already exists${NC}"
fi

# Create useful directories (idempotent)
echo -e "\n${BLUE}Creating directories...${NC}"
mkdir -p server/logs server/uploads
echo -e "${GREEN}✅ Directories ensured${NC}"

# Prisma: run only if schema exists and prisma is available
if [ -f server/prisma/schema.prisma ]; then
    echo -e "\n${BLUE}Prisma schema found. Checking Prisma availability...${NC}"
    if (cd server && (npx --no-install prisma -v) > /dev/null 2>&1) || [ -x "server/node_modules/.bin/prisma" ]; then
        echo -e "${BLUE}Running Prisma generate and migrate (idempotent)...${NC}"
        pushd server > /dev/null
        npx prisma generate || true
        # Run migrate only if migrations directory is present or --force
        if [ -d prisma/migrations ] || [ "$FORCE" = true ]; then
            npx prisma migrate deploy || npx prisma migrate dev --name init || true
        else
            echo -e "${BLUE}No migrations detected; skipping migrate.${NC}"
        fi
        popd > /dev/null
        echo -e "${GREEN}✅ Prisma steps completed (if applicable)${NC}"
    else
        echo -e "${BLUE}Prisma not installed in server. Skipping Prisma steps.${NC}"
    fi
else
    echo -e "${BLUE}No Prisma schema found; skipping Prisma setup.${NC}"
fi

echo -e "\n=========================================="
echo -e "${GREEN}✅ Setup finished (idempotent).${NC}"
echo -e "=========================================="
echo -e "\nNext steps:"
echo -e "1) Inspect and edit server/.env and client/.env as needed."
echo -e "2) Start the server: cd server && npm run dev"
echo -e "3) Start the client: cd client && npm run dev"
echo -e "\nTo force reinstall dependencies, re-run with --force:\n  $0 --force"

