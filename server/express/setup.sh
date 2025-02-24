#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Express server setup...${NC}"

# Create necessary directories
echo -e "\n${YELLOW}Creating directory structure...${NC}"
mkdir -p logs
mkdir -p uploads/temp
mkdir -p src/{controllers,models,routes,services,utils,middleware,types,validations}

# Check if .env exists, if not create from example
if [ ! -f ".env" ]; then
    echo -e "\n${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}Created .env file. Please update with your configuration.${NC}"
else
    echo -e "\n${YELLOW}.env file already exists. Skipping...${NC}"
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install --save express mongoose @types/mongoose cors helmet compression dotenv winston \
    express-rate-limit multer @types/multer @google-cloud/storage jsonwebtoken bcrypt \
    zod express-validator cookie-parser express-session

# Install dev dependencies
echo -e "\n${YELLOW}Installing development dependencies...${NC}"
npm install --save-dev typescript @types/node @types/express vitest supertest @types/supertest \
    @types/jsonwebtoken @types/bcrypt eslint prettier @typescript-eslint/parser \
    @typescript-eslint/eslint-plugin nodemon ts-node

# Initialize TypeScript configuration if not exists
if [ ! -f "tsconfig.json" ]; then
    echo -e "\n${YELLOW}Initializing TypeScript configuration...${NC}"
    npx tsc --init
fi

# Create logs directory with proper permissions
echo -e "\n${YELLOW}Setting up logs directory...${NC}"
mkdir -p logs
touch logs/app.log logs/error.log
chmod 755 logs
chmod 644 logs/app.log logs/error.log

# Add npm scripts to package.json if they don't exist
echo -e "\n${YELLOW}Updating package.json scripts...${NC}"
if ! grep -q '"dev":' package.json; then
    # Create temporary file
    TMP_FILE=$(mktemp)
    jq '.scripts += {
        "dev": "nodemon",
        "build": "tsc",
        "start": "node dist/src/server.js",
        "test": "vitest",
        "test:watch": "vitest watch",
        "test:coverage": "vitest run --coverage",
        "lint": "eslint . --ext .ts",
        "format": "prettier --write \"src/**/*.ts\"",
        "validate": "tsc --noEmit",
        "clean": "rm -rf dist coverage"
    }' package.json > "$TMP_FILE" && mv "$TMP_FILE" package.json
fi

# Create nodemon configuration
echo -e "\n${YELLOW}Creating nodemon configuration...${NC}"
cat > nodemon.json << EOL
{
  "watch": ["src"],
  "ext": ".ts,.js",
  "ignore": [],
  "exec": "ts-node ./src/server.ts"
}
EOL

# Setup git hooks if git is initialized
if [ -d ".git" ]; then
    echo -e "\n${YELLOW}Setting up git hooks...${NC}"
    npx husky install
    npx husky add .husky/pre-commit "npm run lint && npm run validate"
    npx husky add .husky/pre-push "npm test"
fi

# Final setup message
echo -e "\n${GREEN}Setup completed successfully!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Update the .env file with your configuration"
echo -e "2. Run 'npm run dev' to start the development server"
echo -e "3. Run 'npm test' to verify the setup"
echo -e "\n${YELLOW}For more information, check the README.md file${NC}"

# Check for potential issues
echo -e "\n${YELLOW}Performing final checks...${NC}"
ISSUES=0

# Check MongoDB connection
if ! command -v mongod &> /dev/null; then
    echo -e "${RED}MongoDB is not installed${NC}"
    ISSUES=$((ISSUES+1))
fi

# Check node version
NODE_VERSION=$(node -v | cut -d'v' -f2)
if [[ "${NODE_VERSION}" < "16.0.0" ]]; then
    echo -e "${RED}Node.js version should be 16.0.0 or higher${NC}"
    ISSUES=$((ISSUES+1))
fi

# Final status
if [ $ISSUES -eq 0 ]; then
    echo -e "\n${GREEN}All checks passed! You're ready to start development.${NC}"
else
    echo -e "\n${RED}Found $ISSUES issue(s). Please resolve them before continuing.${NC}"
fi

exit 0