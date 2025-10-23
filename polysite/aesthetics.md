# Aesthetics Overview

## Project Description

**betterPoly** is a real-time monitoring dashboard for Polymarket, providing live trading data, order books, market activity, and crypto prices through Polymarket's WebSocket API. Built with Next.js 15, TypeScript, and Tailwind CSS.

## Design System

### Core Philosophy
- **Straight-Line Design**: Zero border-radius, rectangular panels, sharp edges
- **High-Contrast Dark Mode**: Pure dark backgrounds with high-contrast text
- **Minimalist UI**: Clean, functional interface focused on data visualization
- **Real-Time Focus**: Design optimized for live data streaming and rapid updates

### Color Palette

#### Primary Colors
- **Background**: `#0B0B0B` (Pure dark)
- **Foreground**: `#EAEAEA` (High-contrast text)
- **Card Background**: `#121212` (Slightly lighter dark)
- **Border**: `#2A2A2A` (Subtle borders)

#### Semantic Colors
- **Buy/Green**: `#00FF9C` (Success, positive values, buy orders)
- **Sell/Red**: `#FF3C3C` (Destructive, negative values, sell orders)
- **Neutral/Blue**: `#55AFFF` (Primary, neutral actions, links)

#### Supporting Colors
- **Muted Text**: `#8B8B8B` (Secondary text)
- **Accent**: `#1E1E1E` (Hover states, secondary backgrounds)

### Typography

#### Font Families
- **Primary**: JetBrains Mono (Monospace) - Used for data, code, and technical content
- **Secondary**: Inter (Sans-serif) - Used for UI text and headings

#### Font Sizes (Normalized)
- **Text Scale**: Custom scale with readability at 100% zoom
- **Small Text**: 11px, 12px for data-dense areas
- **Base Text**: 14px-16px for readable content
- **Headings**: 18px+ for section headers

### Layout & Spacing

#### Panel System
- **Panel Class**: `.panel` - Standard container with `bg-card border border-border p-4`
- **Border Width**: 1px throughout
- **Padding**: 1rem (16px) standard, 0.75rem on smaller screens
- **Grid System**: Responsive grid layouts for dashboard components

#### Component Structure
- **Rectangular Panels**: All containers use sharp corners
- **Thin Borders**: 1px borders for definition without heaviness
- **Consistent Spacing**: 4px, 8px, 16px, 24px scale
- **No Shadows**: Flat design, no elevation effects

### Interactive Elements

#### Buttons
- **Border Radius**: 0 (sharp corners)
- **Sizes**: Extra small (xs), small (sm) with normalized padding
- **States**: Hover effects using opacity changes
- **Colors**: Semantic colors for actions (buy/sell/neutral)

#### Inputs & Controls
- **Styling**: Border-based with focus states
- **Colors**: Match panel system, success color for focus
- **Typography**: Monospace for data entry

### Data Visualization

#### Charts & Graphs
- **Library**: Recharts for consistent styling
- **Colors**: Semantic color scheme (buy/sell/neutral)
- **Grid**: Minimal grid lines, high contrast
- **Animations**: Smooth transitions for live data updates

#### Tables & Lists
- **Striped Rows**: Alternating background colors
- **Typography**: Monospace for numerical data
- **Borders**: Thin borders between rows/columns

### Responsive Design

#### Breakpoints
- **Mobile**: Optimized for phones with adjusted padding
- **Tablet**: Balanced layout for medium screens
- **Desktop**: Full dashboard layout with multiple panels

#### Adaptive Elements
- **Panel Padding**: Reduced on smaller screens (0.75rem)
- **Font Sizes**: Normalized for readability across devices
- **Grid Layouts**: Responsive columns and rows

### Theme System

#### Dark Mode Only
- **Default Theme**: Dark mode enforced
- **Color Scheme**: `color-scheme: dark` in CSS
- **Meta Theme Color**: `#0B0B0B` for browser UI

#### CSS Variables
- **HSL Format**: All colors defined as HSL values for alpha transparency
- **Custom Properties**: `--buy`, `--sell`, `--neutral` for semantic colors
- **Utility Classes**: `.text-buy`, `.bg-sell`, etc. for consistent application

### Animation & Motion

#### Scroll Animations
- **Fade In Up**: Elements animate in from bottom on scroll
- **Stagger Effect**: Child elements animate sequentially
- **Duration**: 0.8s ease-out for smooth reveals

#### Live Data Updates
- **Real-Time**: Immediate visual feedback for data changes
- **Color Transitions**: Smooth color changes for price movements
- **No Heavy Animations**: Performance-focused, minimal motion

### Accessibility

#### Contrast
- **WCAG AA**: High contrast ratios for text readability
- **Color Blindness**: Semantic colors distinguishable in common color vision deficiencies
- **Focus States**: Clear focus indicators for keyboard navigation

#### Typography
- **Font Smoothing**: Antialiased fonts for crisp text
- **Line Heights**: Optimized for readability (1.2-1.3x font size)
- **Size Normalization**: Custom font sizes prevent zoom issues

### Component Library

#### Base Components
- **shadcn/ui**: Headless UI components customized to design system
- **Lucide Icons**: Consistent iconography
- **Custom Panels**: Standardized container components

#### Specialized Components
- **Connection Status**: Visual indicators for WebSocket state
- **Trade Feed**: Live scrolling list with color-coded trades
- **Order Book**: Depth visualization with buy/sell colors
- **Crypto Ticker**: Price display with trend indicators

### Performance Considerations

#### CSS Optimization
- **Utility-First**: Tailwind CSS for minimal bundle size
- **No Unused Styles**: PurgeCSS removes unused classes
- **CSS Variables**: Efficient color management

#### Rendering
- **React 18**: Concurrent features for smooth updates
- **Virtual Scrolling**: For large data sets (trades, comments)
- **Debounced Updates**: Prevent excessive re-renders

### Browser Support

#### Modern Browsers
- **Chrome/Edge**: Full feature support
- **Firefox**: Full feature support
- **Safari**: Full feature support
- **Mobile Browsers**: iOS Safari, Chrome Mobile

#### Progressive Enhancement
- **WebSocket Fallback**: Graceful degradation for connection issues
- **CSS Grid Fallback**: Flexbox fallbacks for older browsers
- **Font Loading**: System font fallbacks

### Development Guidelines

#### CSS Architecture
- **Layered Approach**: Base, components, utilities
- **Custom Properties**: Centralized color and spacing tokens
- **Utility Classes**: Consistent application of design tokens

#### Component Development
- **Design System First**: All components follow established patterns
- **Type Safety**: TypeScript for prop validation
- **Accessibility**: ARIA attributes and semantic HTML

This design system creates a cohesive, professional interface optimized for real-time financial data monitoring, with emphasis on clarity, performance, and user experience in a dark, technical environment.