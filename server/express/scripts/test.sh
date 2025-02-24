#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting test suite...${NC}"

# Check if coverage flag is provided
if [ "$1" == "--coverage" ]; then
    echo -e "${BLUE}Running tests with coverage...${NC}"
    vitest run --coverage --config ./vitest.config.coverage.ts
else
    echo -e "${BLUE}Running tests...${NC}"
    vitest run
fi

# Store the exit code
EXIT_CODE=$?

# Check if tests passed
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
else
    echo -e "${RED}Tests failed!${NC}"
fi

exit $EXIT_CODE