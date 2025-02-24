# Express Server Architecture

## Directory Structure

```
server/express/
├── services/           # Business logic and service layer
│   ├── AuthService.ts
│   ├── EmailService.ts
│   ├── NotificationService.ts
│   └── ...
├── controllers/        # Route handlers
├── routes/            # Route definitions
├── models/            # Database models
├── middleware/        # Custom middleware
├── types/             # TypeScript type definitions
└── __tests__/         # Test files
```

## Setup

1. Install dependencies:
```bash
./scripts/setup-server.sh
```

2. Verify installation:
```bash
npm run analyze:server
```

## Services Organization

We maintain a single services directory at `/server/express/services/` for all service implementations. Any code in `/server/express/src/services/` should be migrated to the main services directory.

### Current Services

- **AuthService**: Authentication and authorization
- **EmailService**: Email sending and templates
- **EmailVerificationService**: Email verification workflow
- **NotificationService**: User notifications
- **ContentModerationService**: Content moderation
- **AnalyticsService**: User and system analytics

### Service Dependencies

```
AuthService
├── EmailService
└── EmailVerificationService

NotificationService
└── EmailService

ContentModerationService
└── NotificationService
```

## Development Guidelines

1. Place new services in `/server/express/services/`
2. Follow the singleton pattern for service instances
3. Use dependency injection for service dependencies
4. Maintain type safety with TypeScript
5. Write tests for all service methods

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## Type Safety

The project uses TypeScript with strict type checking. Ensure all services:
- Have proper type definitions
- Use typed request/response objects
- Handle errors with typed exceptions
- Document public methods

## Monitoring and Maintenance

- Regular dependency updates via `npm audit`
- Performance monitoring through analytics
- Error tracking and logging
- Regular code quality checks

## Migration Notes

If you find any code in `/server/express/src/`, please:
1. Check for usage in the codebase
2. Migrate to the appropriate location
3. Update all imports
4. Remove the old code
5. Update documentation