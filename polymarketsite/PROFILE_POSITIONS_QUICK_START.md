# Profile Positions Feature - Quick Start Guide

## What is this feature?

When viewing comments on markets with multiple outcomes (e.g., "Who will win the election?" with 5+ candidates), you can now click on any commenter's profile to see all their positions across the different submarkets.

## How to use it

### Step 1: Open a Market with Comments

1. Navigate to the dashboard
2. Click on any market card to open the market detail modal
3. Click the "View Comments" button

### Step 2: Click on a Profile

Look for profiles with the **underlined names** or **hover indicators** - these have positions you can view:

- **Profile Picture**: Shows a small badge with position count on hover
- **Username**: Underlined with dotted line that becomes solid on hover
- **Tooltip**: Hover to see "View X positions"

### Step 3: Explore Their Positions

The Profile Positions Modal will open, showing:

#### Header Section
- Profile image and display name
- Total number of positions
- MOD/CREATOR badges (if applicable)
- Bio (if available)

#### Search & Sort
- **Search Bar**: Type to filter by outcome name or market title
  - Real-time filtering as you type
  - Click "Clear" to reset search
- **Sort Dropdown**: Choose from 6 sorting options
  - Probability (High to Low) - *Default*
  - Probability (Low to High)
  - Position Size (Large to Small)
  - Position Size (Small to Large)
  - Name (A to Z)
  - Name (Z to A)

#### Position Cards
Each card displays:
- **Outcome Name**: What the position is betting on
- **Probability**: Current likelihood with color coding
  - 🟢 Green (≥70%): High probability
  - 🔴 Red (≤30%): Low probability
  - 🟡 Yellow (30-70%): Medium probability
- **Market Title**: Which market this position belongs to
- **Position Size**: Number of shares held
- **Current Price**: Price per share
- **Position Value**: Total value (shares × price)
- **Visual Indicator**: Progress bar showing probability

## Use Cases

### 1. Analyze Top Commenters
"This person seems confident in their opinion. What positions do they actually hold?"
- Click their profile to see if they've put money where their mouth is

### 2. Find Contrarian Plays
"Who's betting against the crowd?"
- Sort by Probability (Low to High) to see their underdog picks

### 3. Track Big Players
"This trader has lots of positions. Where are they placing their largest bets?"
- Sort by Position Size (Large to Small)

### 4. Research Similar Markets
"I'm interested in crypto markets. What positions does this crypto trader have?"
- Search for "crypto" or "bitcoin" to filter relevant positions

### 5. Compare Risk Profiles
"Are they betting on safe bets or risky outcomes?"
- Look at the probability distribution of their positions

## Pro Tips

### Efficient Navigation
- The modal stays open while you switch between profiles
- Click anywhere outside the modal to close it
- Search persists while browsing - clear it manually

### Smart Sorting
- **Default (Probability High→Low)**: Best for seeing their highest confidence plays
- **Position Size (Large→Small)**: Best for seeing where they've invested most
- **Probability (Low→High)**: Best for finding underdog or contrarian positions

### Understanding Values
- **Position Size**: Number of shares (1 share = potential $1 payout if outcome wins)
- **Price**: Current market price (70¢ means 70% implied probability)
- **Value**: Current liquidation value (what they'd get if selling now)

### Color Interpretation
- **Green positions**: Market-favored outcomes (≥70% likely)
- **Red positions**: Underdog outcomes (≤30% likely)
- **Yellow positions**: Contested outcomes (30-70% likely)

## Examples

### Example 1: Election Market
Market: "Who will win the 2024 election?"
- Click on an active commenter
- See they have positions on:
  - Candidate A: 70% probability, 1000 shares
  - Candidate B: 20% probability, 500 shares
  - Candidate C: 10% probability, 100 shares
- Conclusion: They're heavily betting on Candidate A but hedging with B

### Example 2: Sports Tournament
Market: "Who will win the tournament?"
- Commenter has 8 positions across different teams
- Sort by Position Size to see: 5000 shares on Team X (favorites)
- Sort by Probability (Low) to see: 200 shares on Team Z (dark horse)
- Conclusion: Strong conviction on favorites, small gamble on underdog

### Example 3: Multiple Choice Market
Market: "What will be the inflation rate?"
- Search "5-6%" to find specific range positions
- See several positions in adjacent ranges
- Conclusion: They're spreading bets across a range of outcomes

## Troubleshooting

### "I clicked a profile but nothing happened"
- That profile doesn't have any positions in this market
- Only profiles with positions are clickable (look for underlined names)

### "The search isn't finding anything"
- Check your spelling
- Try searching for partial words ("bit" instead of "bitcoin")
- Clear the search and try different terms

### "Position values seem wrong"
- Values are calculated as: shares × current_price
- Prices change in real-time based on market activity
- This is the liquidation value, not profit/loss

### "Some positions are missing outcomes"
- This can happen if the market data is still loading
- The position will show but without detailed outcome info
- Try closing and reopening the modal

## Technical Notes

### Performance
- Position data is cached for faster loading
- Search and sorting happen instantly (client-side)
- Modal loads only when opened (no performance impact when closed)

### Data Sources
- Position data from Gamma API comments endpoint
- Market data from normalized market cache
- Real-time probability updates from WebSocket

### Privacy
- Only positions in the current market/event are shown
- Data is public (same as visible on Polymarket)
- No wallet addresses exposed (shows display names)

## Keyboard Shortcuts

- **Escape**: Close the modal
- **Click outside**: Close the modal
- **Tab**: Navigate through sort options
- **Type in search**: Automatically focuses search bar

## What's Next?

Future enhancements planned:
- Compare multiple profiles side-by-side
- Export position data as CSV
- Historical position tracking
- Portfolio analytics and metrics
- Profit/loss calculations

## Need Help?

- Check the full documentation: `PROFILE_POSITIONS_FEATURE.md`
- Report issues on GitHub
- Suggest improvements via feedback

---

**Happy Trading! 📊**