# Copilot Instructions for Polysite

This repository contains a Polymarket Live Real-Time Monitor built with Next.js 15, TypeScript, and Tailwind CSS. These instructions help guide code generation to align with the project's standards and architecture.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5 (strict mode enabled)
- **Styling**: Tailwind CSS 3.4 with custom design system
- **State Management**: Zustand for lightweight global state
- **UI Components**: Radix UI primitives with custom styling
- **Real-time Data**: Polymarket WebSocket API (@polymarket/real-time-data-client)
- **Testing**: Vitest with React Testing Library
- **Authentication**: Clerk (optional)

## Project Structure

```
polymarketsite/
├── app/                  # Next.js 15 App Router pages
├── components/           # React components
│   ├── ui/              # Reusable UI primitives (shadcn-style)
│   └── ...              # Feature-specific components
├── services/            # External service integrations (WebSocket, API)
├── store/               # Zustand state management stores
├── types/               # TypeScript type definitions
├── lib/                 # Utility functions and helpers
├── hooks/               # Custom React hooks
└── __tests__/           # Test files
```

## Code Style and Design System

### Design Aesthetic
This project follows a **straight-line design system** with specific aesthetic requirements:

- **NO rounded corners**: Always use `border-radius: 0` (configured in Tailwind)
- **High contrast dark mode**: Background `#0B0B0B`, Foreground `#EAEAEA`
- **Rectangular panels**: 1px borders, zero border-radius
- **Monospace typography**: Use JetBrains Mono for code/data displays
- **Sans-serif typography**: Use Inter for general UI text

### Color Palette
```css
--background: #0B0B0B     /* Pure dark background */
--foreground: #EAEAEA     /* High-contrast text */
--buy: #00FF9C           /* Green for buy/positive */
--sell: #FF3C3C          /* Red for sell/negative */
--neutral: #55AFFF       /* Blue for neutral */
```

### Component Styling
- Use `className="panel"` for rectangular containers
- Prefer Tailwind utility classes over custom CSS
- Use CSS variables defined in `app/globals.css`
- All components should respect the zero-border-radius rule

## TypeScript Guidelines

- **Strict mode**: All TypeScript files must pass strict type checking
- **Explicit types**: Define explicit types for function parameters and return values
- **Type definitions**: Store shared types in `types/` directory
- **Path aliases**: Use `@/` for absolute imports (e.g., `@/components/ui/button`)
- **Avoid `any`**: Use proper typing or `unknown` if type is truly unknown

Example:
```typescript
// Good
export function processMarketData(data: MarketData): ProcessedMarket {
  // ...
}

// Avoid
export function processMarketData(data: any) {
  // ...
}
```

## Component Structure

### React Components
- Use functional components with TypeScript
- Define prop interfaces inline or in separate type files
- Use React 18 features (concurrent features, Suspense, etc.)
- Components should be server components by default (mark with `"use client"` only when needed)

Example:
```typescript
interface MarketCardProps {
  market: Market;
  onSelect?: (id: string) => void;
}

export function MarketCard({ market, onSelect }: MarketCardProps) {
  // Component implementation
}
```

### Client Components
Mark components with `"use client"` directive when they:
- Use React hooks (useState, useEffect, etc.)
- Handle browser events
- Use Zustand stores
- Access browser APIs

## State Management

### Zustand Stores
- Store global state in `store/` directory
- Keep stores focused and single-purpose
- Use TypeScript for store definitions
- Follow the pattern in `store/usePolymarketStore.ts`

Example:
```typescript
interface StoreState {
  data: Market[];
  setData: (data: Market[]) => void;
}

export const useStore = create<StoreState>((set) => ({
  data: [],
  setData: (data) => set({ data }),
}));
```

## Testing

- **Framework**: Vitest with React Testing Library
- **Location**: Place tests in `__tests__/` directory
- **Naming**: Use `*.test.ts` or `*.test.tsx` for test files
- **Coverage**: Write tests for business logic and critical paths
- **Run tests**: `npm test`

Example test structure:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  });
});
```

## WebSocket Integration

- Use `@polymarket/real-time-data-client` for WebSocket connections
- Implement reconnection logic with exponential backoff
- Handle connection states (connecting, connected, disconnected, error)
- Subscribe to topics: `activity:trades`, `crypto_prices:price_update`, etc.
- Store connection state in Zustand stores

## API Routes

- Use Next.js 15 App Router API routes in `app/api/`
- Follow RESTful conventions
- Return proper HTTP status codes
- Use TypeScript for request/response types
- Handle errors gracefully

## Build and Development

- **Development**: `npm run dev` (runs on port 3001)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (uses ESLint with next/core-web-vitals)
- **Test**: `npm test`

## Dependencies

### Adding New Dependencies
- Prefer lightweight libraries
- Check bundle size impact
- Ensure TypeScript support
- Match existing code style

### Key Libraries
- `zustand` for state management (not Redux or Context API)
- `lucide-react` for icons
- `recharts` for data visualization
- `ethers` for blockchain utilities
- `date-fns` for date formatting

## Performance Considerations

- Keep trade history limited (max 100 items)
- Use React 18 concurrent features
- Implement proper cleanup in useEffect hooks
- Avoid unnecessary re-renders with proper memoization
- Use WebSocket subscriptions efficiently

## Documentation

- Add JSDoc comments for complex functions
- Keep README.md files updated for major features
- Document WebSocket topics and data structures
- Include examples in component documentation

## Security

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate all user inputs
- Use prepared statements for any database queries
- Follow Next.js security best practices

## Accessibility

- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Maintain proper color contrast (high contrast design already enforces this)

## Git Workflow

- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Reference issue numbers when applicable
- Test before committing

## When in Doubt

- Follow existing code patterns in the repository
- Maintain the straight-line design aesthetic
- Prioritize code readability and maintainability
- Ask for clarification rather than making assumptions
