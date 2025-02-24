# AgriSmart Platform

## Component Architecture

### Client Components
All interactive components are properly marked with `'use client'` and organized in dedicated wrappers:

- `components/ui/brand-logo.tsx` - Logo component with proper client-side rendering
- `components/ui/button-wrapper.tsx` - Event handler wrapper for buttons
- `components/ui/dialog-wrapper.tsx` - Modal dialog wrapper
- `components/ui/menu-wrapper.tsx` - Dropdown menu wrapper

### Providers
Client-side providers are properly isolated:

- `components/providers/auth-provider.tsx` - Authentication context provider
- `components/providers/theme-provider.tsx` - Theme management provider

### Server/Client Component Guidelines

1. Use Client Components for:
   - Interactive UI elements (buttons, forms, etc.)
   - Components that use browser APIs
   - Components that use React hooks
   - Event handlers

2. Use Server Components for:
   - Static UI elements
   - Data fetching
   - Access to backend resources
   - Static route handling

3. Component Boundaries:
   - Keep interactive logic in client components
   - Pass static props through server components
   - Use wrappers for common interactive patterns

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Testing Credentials

For development testing:

```
Email: test@example.com
Password: password123
```

## Important Notes

1. All components in `/components/ui` that require interactivity should be marked with `'use client'`
2. Use wrapper components for common interactive patterns
3. Keep server components lean and focused on data fetching
4. Use proper client boundaries to prevent hydration mismatches
5. Clear browser cache and restart dev server if you encounter rendering issues