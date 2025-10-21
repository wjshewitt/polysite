# Individual Market Chart Component

The `MarketPriceChart` component is a reusable, site-wide component for displaying price history, volume, and liquidity data for individual Polymarket markets.

## Features

- **Real-time price/probability tracking** with historical data
- **Volume visualization** with bar charts
- **Liquidity trends** with line overlays
- **Auto-updating** every 15 seconds
- **Responsive design** that works anywhere
- **Customizable** with props

## Usage Examples

### Basic Usage (Auto-selects top market)

```tsx
import { MarketPriceChart } from "@/components/dataviz/MarketPriceChart";

export default function MyPage() {
  return (
    <div className="panel p-6">
      <MarketPriceChart />
    </div>
  );
}
```

### Specific Market by Event Slug

```tsx
<MarketPriceChart eventSlug="presidential-election-winner-2024" />
```

### Custom Height

```tsx
<MarketPriceChart 
  height={500} 
  eventSlug="super-bowl-champion-2026-731"
/>
```

### Hide Volume or Liquidity

```tsx
<MarketPriceChart 
  showVolume={false}
  showLiquidity={true}
  height={400}
/>
```

### In a Modal

```tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MarketPriceChart } from "@/components/dataviz/MarketPriceChart";

export function MarketModal({ eventSlug, open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <MarketPriceChart 
          eventSlug={eventSlug}
          height={400}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### In a Dashboard Card

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="panel p-4">
    <h3 className="font-mono font-bold mb-4">Trump Victory Market</h3>
    <MarketPriceChart 
      eventSlug="trump-popular-vote-2024"
      height={300}
    />
  </div>
  
  <div className="panel p-4">
    <h3 className="font-mono font-bold mb-4">Bitcoin Price Market</h3>
    <MarketPriceChart 
      eventSlug="bitcoin-100k-eoy-2024"
      height={300}
    />
  </div>
</div>
```

### Side-by-Side Comparison

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {['market-slug-1', 'market-slug-2'].map((slug) => (
    <div key={slug} className="panel p-6">
      <MarketPriceChart 
        eventSlug={slug}
        height={350}
        showLiquidity={false}
      />
    </div>
  ))}
</div>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `eventSlug` | `string` | `undefined` | Event slug to fetch. If not provided, shows top market by volume |
| `height` | `number` | `400` | Total height of component in pixels |
| `showVolume` | `boolean` | `true` | Show volume bars on chart |
| `showLiquidity` | `boolean` | `true` | Show liquidity line on chart |

## Data Display

The component shows:

1. **Market title and ticker** in header
2. **Current probability** (large, prominent)
3. **Price change %** (green for positive, red for negative)
4. **Historical price chart** with area fill
5. **Volume bars** (if enabled) in green
6. **Liquidity line** (if enabled) in gold
7. **Summary stats** showing:
   - Current probability
   - Total volume
   - Total liquidity
   - Primary outcome name

## Styling

The component uses the site's theme:
- Monospace fonts throughout
- Dark background with colored accents
- Primary color: `#55AFFF` (blue) for price
- Success color: `#00FF9C` (green) for volume
- Warning color: `#FFD700` (gold) for liquidity
- Border-radius: 0 (sharp corners)

## Performance

- Fetches data on mount
- Auto-updates every 15 seconds
- Uses simulated historical data (30 data points)
- Caches API responses for 60 seconds
- Graceful error handling with loading states

## Where to Use

This component can be embedded:
- ✅ Market detail pages
- ✅ Modals and dialogs
- ✅ Dashboard cards
- ✅ List item expansions
- ✅ Comparison views
- ✅ Trading interfaces
- ✅ Analytics dashboards
- ✅ Mobile views (responsive)

## Live Example

Visit `/data-viz` to see the component in action as the first visualization in the dashboard.
