# Migration Guide: Prisma to Mongoose

## Overview
This guide covers the migration from Prisma ORM to Mongoose for MongoDB in our Express.js backend.

## Major Changes

### 1. Database Access
- **Before**: Prisma Client
- **Now**: Mongoose Models & Schemas
- **Impact**: All database queries need to be updated

### 2. Schema Definitions
- **Before**: `schema.prisma`
- **Now**: Mongoose schema files in `models/`
- **Location**: `server/express/src/models/`

### 3. Type System
- All types are now defined in `types/` directory
- Mongoose models include TypeScript interfaces
- Enhanced type safety with custom type guards

## Migration Steps

### 1. Authentication System
```typescript
// Old Prisma Query
const user = await prisma.user.findUnique({
  where: { email }
});

// New Mongoose Query
const user = await User.findOne({ email });
```

### 2. Token Management
```typescript
// Old Prisma
await prisma.token.create({
  data: { ... }
});

// New Mongoose
await Token.create({ ... });
```

## Automated Cleanup

- TTL indexes handle token expiration
- Automatic session cleanup
- Background jobs for data maintenance

## Type Safety

```typescript
// Type Guards
const assertRole = (role: unknown): Role => {
  if (!isRole(role)) throw new Error('Invalid role');
  return role;
};
```

## Database Operations

### Create
```typescript
// Before
const user = await prisma.user.create({
  data: { ... }
});

// After
const user = await User.create({ ... });
```

### Read
```typescript
// Before
const user = await prisma.user.findUnique({
  where: { id }
});

// After
const user = await User.findById(id);
```

### Update
```typescript
// Before
await prisma.user.update({
  where: { id },
  data: { ... }
});

// After
await User.findByIdAndUpdate(id, { ... });
```

### Delete
```typescript
// Before
await prisma.user.delete({
  where: { id }
});

// After
await User.findByIdAndDelete(id);
```

## Benefits

1. **Better MongoDB Integration**
   - Native MongoDB features
   - Optimized queries
   - Mongoose middleware support

2. **Enhanced Type Safety**
   - Custom type guards
   - Interface-based models
   - Runtime validation

3. **Improved Performance**
   - Optimized indexes
   - Lean queries
   - Built-in caching

## Testing

Update test files to use Mongoose models:

```typescript
// Before
mockPrisma.user.findUnique.mockResolvedValue(mockUser);

// After
jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
```

## Common Issues

1. **ObjectId vs String**
   - Use `mongoose.Types.ObjectId` for IDs
   - Convert string IDs when needed

2. **Async Operations**
   - All Mongoose operations return Promises
   - Use try/catch or Promise chaining

3. **Validation**
   - Schema-level validation
   - Custom validators

## Support

Contact the backend team for migration assistance.