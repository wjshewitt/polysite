# Profile Positions Feature

## Overview

This feature allows users to click on commenter profiles in market detail modals to view all their positions across multiple submarkets (non-binary outcomes). The feature includes search, sorting, and filtering capabilities to help analyze trader positions.

## Components

### ProfilePositionsModal

Located at: `components/ProfilePositionsModal.tsx`

A modal dialog that displays a user's positions across all submarkets in an event.

#### Features

1. **Position Enrichment**
   - Automatically matches profile positions with market outcomes
   - Displays outcome name, probability, market title, and position size
   - Calculates position value based on current market prices

2. **Search Functionality**
   - Real-time search across outcome names and market titles
   - Case-insensitive filtering
   - Shows count of filtered results

3. **Sorting Options**
   - **Probability (High to Low)** - Default, shows most likely outcomes first
   - **Probability (Low to High)** - Shows least likely outcomes first
   - **Position Size (Large to Small)** - Orders by largest positions
   - **Position Size (Small to Large)** - Orders by smallest positions
   - **Name (A to Z)** - Alphabetical by outcome name
   - **Name (Z to A)** - Reverse alphabetical

4. **Visual Indicators**
   - Color-coded probabilities:
     - Green (≥70%): High probability outcomes
     - Red (≤30%): Low probability outcomes
     - Yellow (30-70%): Medium probability outcomes
   - Progress bars showing probability distribution
   - Position value calculations

5. **User Information**
   - Profile image or avatar
   - Display name (name, pseudonym, or wallet address)
   - MOD/CREATOR badges
   - Bio (if available)
   - Total position count

## Integration

### MarketDetailModal Updates

The `MarketDetailModal` component has been updated to support profile clicks:

1. **Clickable Profiles**
   - Profile images and names are now clickable (when positions exist)
   - Hover effects indicate interactivity
   - Disabled state for profiles without positions

2. **State Management**
   - `selectedProfile`: Stores the currently selected profile
   - `profileModalOpen`: Controls modal visibility
   - Positions data passed from normalized markets

3. **User Experience**
   - Seamless modal-over-modal experience
   - Profile modal maintains context of parent market modal
   - Clean state management on modal close

## Usage

### For Users

1. **Opening Profile Positions**
   - Navigate to any market with comments
   - Click on a commenter's profile picture or name
   - Profile positions modal will open (if they have positions)

2. **Searching Positions**
   - Type in the search bar to filter by outcome or market name
   - Results update in real-time
   - Clear search to see all positions

3. **Sorting Positions**
   - Use the sort dropdown to change ordering
   - Default is "Probability (High to Low)"
   - Useful for finding best/worst positions or largest stakes

4. **Understanding Display**
   - Each position card shows:
     - Outcome name and current probability
     - Related market title
     - Position size in shares
     - Current price per share
     - Total position value
     - Visual probability indicator

### For Developers

#### Props Interface

```typescript
interface ProfilePositionsModalProps {
  profile: CommentProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  markets: NormalizedMarket[];
}
```

#### Example Usage

```tsx
import { ProfilePositionsModal } from "@/components/ProfilePositionsModal";

function MyComponent() {
  const [selectedProfile, setSelectedProfile] = useState<CommentProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const markets = useNormalizedMarkets(); // Your markets data

  return (
    <ProfilePositionsModal
      profile={selectedProfile}
      open={modalOpen}
      onOpenChange={setModalOpen}
      markets={markets}
    />
  );
}
```

## Data Flow

1. **Position Enrichment**
   ```
   Profile.positions (tokenId, positionSize)
   → Match with Market.outcomes (by tokenId)
   → Create EnrichedPosition (all data combined)
   ```

2. **Filtering**
   ```
   EnrichedPositions
   → Filter by search query
   → Sort by selected option
   → Display to user
   ```

3. **Value Calculation**
   ```
   positionSize × outcome.price = position value
   ```

## Types

### EnrichedPosition

```typescript
interface EnrichedPosition {
  tokenId: string;
  positionSize: string;
  positionSizeNum: number;
  outcomeName: string;
  probability: number;
  marketTitle: string;
  marketId: string;
  outcome?: Outcome;
}
```

### SortOption

```typescript
type SortOption =
  | "probability-desc"
  | "probability-asc"
  | "size-desc"
  | "size-asc"
  | "name-asc"
  | "name-desc";
```

## Styling

- Uses existing UI components (`Dialog`, `ScrollArea`)
- Consistent with app's mono/terminal aesthetic
- Responsive design with proper overflow handling
- Color-coded probabilities match buy/sell/neutral theme

## Performance Considerations

1. **Memoization**
   - `enrichedPositions`: Computed only when profile or markets change
   - `filteredPositions`: Recomputed only when search changes
   - `sortedPositions`: Recomputed only when sort or filter changes

2. **Efficient Lookups**
   - Position-to-outcome matching uses `find()` for O(n) complexity
   - Could be optimized with Map for large datasets

3. **Lazy Loading**
   - Modal content only rendered when open
   - No performance impact when closed

## Future Enhancements

1. **Advanced Filters**
   - Filter by probability range
   - Filter by position size threshold
   - Filter by market type

2. **Analytics**
   - Total portfolio value
   - Expected value calculations
   - Win/loss projections

3. **Comparison**
   - Compare multiple users' positions
   - Show consensus vs contrarian plays

4. **Export**
   - Download positions as CSV/JSON
   - Share position snapshots

5. **Historical Data**
   - Show position entry points
   - Track P&L over time
   - Display position changes

## Testing

To test the feature:

1. Navigate to a market with multiple submarkets
2. Open the market detail modal
3. Click "View Comments"
4. Click on a profile that has positions
5. Verify:
   - All positions are displayed
   - Search filters correctly
   - Sorting works for all options
   - Position values calculate correctly
   - Modal closes properly

## Dependencies

- `@/services/gamma`: For `CommentProfile` type
- `@/types/markets`: For `NormalizedMarket` and `Outcome` types
- `@/components/ui/dialog`: Dialog component
- `@/components/ui/scroll-area`: Scrollable container
- `lucide-react`: Icons (Search, ArrowUpDown, User)