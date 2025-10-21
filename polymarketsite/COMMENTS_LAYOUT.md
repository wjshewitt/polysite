# Comments Panel Layout

## Overview
The market detail modal now supports an expandable comments panel that appears on the right side without shrinking the main content.

## Layout Behavior

### Without Comments (Default State)
```
┌─────────────────────────────────────────────────────┐
│  Market Detail Modal (max-w-5xl)                    │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │         MAIN CONTENT                          │  │
│  │         (100% width)                          │  │
│  │                                               │  │
│  │  - Stats Grid                                 │  │
│  │  - Description                                │  │
│  │  - Outcomes & Prices                          │  │
│  │  - Market Details                             │  │
│  │  - Tags                                       │  │
│  │  - Resolution Source                          │  │
│  │  - Technical Info                             │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### With Comments Expanded
```
┌──────────────────────────────────────────────────────────────────────┐
│  Market Detail Modal (max-w-95vw)                                    │
│  ┌──────────────────────────────┬─────────────────────────────────┐  │
│  │                              │                                 │  │
│  │    MAIN CONTENT              │    COMMENTS PANEL               │  │
│  │    (60% width - fixed)       │    (40% width - expands in)     │  │
│  │                              │                                 │  │
│  │  - Stats Grid                │  ┌─────────────────────────┐   │  │
│  │  - Description               │  │ COMMENTS (50)           │   │  │
│  │  - Outcomes & Prices         │  ├─────────────────────────┤   │  │
│  │  - Market Details            │  │                         │   │  │
│  │  - Tags                      │  │  [User Avatar]          │   │  │
│  │  - Resolution Source         │  │  Username     2h ago    │   │  │
│  │  - Technical Info            │  │  Comment text here...   │   │  │
│  │                              │  │  👍 5                    │   │  │
│  │                              │  │                         │   │  │
│  │                              │  │  [User Avatar]          │   │  │
│  │                              │  │  Another User  5m ago   │   │  │
│  │                              │  │  More comments...       │   │  │
│  │                              │  │                         │   │  │
│  │                              │  └─────────────────────────┘   │  │
│  │                              │   (Scrollable)                 │  │
│  └──────────────────────────────┴─────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Main Content Area
- **Width**: Fixed at 60% when comments are shown
- **Scrolling**: Independent ScrollArea component
- **Content**: All market information remains fully visible
- Does NOT shrink or compress when comments open

### 2. Comments Panel
- **Width**: Takes remaining 40% of space
- **Expansion**: Slides in from the right
- **Scrolling**: Independent ScrollArea component
- **Border**: Left border separates from main content

### 3. Modal Behavior
- **Default Width**: `max-w-5xl` (1280px)
- **Expanded Width**: `max-w-[95vw]` (95% of viewport width)
- **Transition**: Smooth 300ms animation
- **Height**: Always `max-h-[90vh]` (90% of viewport height)

## Implementation Details

```tsx
// Modal width changes based on comments visibility
<DialogContent
  className={`${showComments ? "max-w-[95vw]" : "max-w-5xl"} transition-all duration-300`}
>
  <div className="flex">
    {/* Main content - fixed 60% when comments shown */}
    <ScrollArea
      style={{ maxWidth: showComments ? "60%" : "100%" }}
    >
      {/* Market details */}
    </ScrollArea>

    {/* Comments panel - expands into remaining 40% */}
    {showComments && (
      <div className="flex-1 border-l">
        {/* Comments */}
      </div>
    )}
  </div>
</DialogContent>
```

## User Interaction Flow

1. **User clicks market** → Modal opens at default width
2. **User clicks "SHOW COMMENTS" button** →
   - Modal expands to 95vw
   - Main content stays at 60% (more absolute space than before)
   - Comments panel appears on the right (40%)
   - API fetches comments
3. **User clicks "HIDE COMMENTS" button** →
   - Comments panel disappears
   - Modal shrinks back to 5xl
   - Main content returns to 100%

## Responsive Behavior

### Desktop (>1280px)
- Default: 1280px modal with full-width content
- With Comments: ~90% viewport width, 60/40 split

### Tablet (768px - 1280px)
- Default: Full available width
- With Comments: 95% viewport, 60/40 split

### Mobile (<768px)
- Comments feature may need adjustment for small screens
- Consider stacking comments below main content
- Or use a slide-over panel

## Advantages of This Approach

✅ **No Content Compression**: Main content doesn't get squished
✅ **More Screen Real Estate**: Modal expands to use available space
✅ **Clear Separation**: Visual border between content and comments
✅ **Independent Scrolling**: Each panel scrolls separately
✅ **Smooth Transition**: Animated expansion feels natural
✅ **Maintains Readability**: Text and images stay at comfortable sizes

## API Integration

Comments are fetched from:
```
GET /api/gamma/comments?parent_entity_type=Event&parent_entity_id={id}
```

Includes:
- Comment body
- User profile (name, avatar, badges)
- Reaction counts
- Position sizes
- Timestamps