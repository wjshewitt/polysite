# Live Data Feature - Testing Checklist

## 🧪 Pre-Deployment Testing Checklist

### Core Functionality

- [ ] **Navigate to Live Data subtab via subtab bar**
  - Click "📊 LIVE DATA" in the subtab navigation
  - Verify view loads correctly
  - Check both panels are visible

- [ ] **Navigate via "LIVE TRADES" header link**
  - From "All Markets" view, click "LIVE TRADES" text
  - Verify navigation to Live Data subtab
  - Confirm URL updates to `?tab=main&subtab=livedata`

- [ ] **Direct URL navigation**
  - Enter `/dashboard?tab=main&subtab=livedata` in browser
  - Verify dashboard loads directly to Live Data view
  - Check both panels render correctly

### Visual & Interaction Tests

- [ ] **Header link styling**
  - Verify "LIVE TRADES" has NO underline
  - Verify text is NOT bold (same weight as before)
  - Hover over text and confirm color changes to neutral
  - Verify smooth transition effect
  - Confirm cursor shows pointer on hover

- [ ] **Layout on desktop (≥1024px)**
  - Two equal columns side-by-side
  - TradeFeed on left
  - OrderbookDepth on right
  - Both panels full height
  - No unwanted scrollbars

- [ ] **Layout on tablet (768-1023px)**
  - Single column stack
  - TradeFeed above OrderbookDepth
  - Minimum 500px height per panel
  - Vertical scroll between panels

- [ ] **Layout on mobile (<768px)**
  - Single column stack
  - Panels take full width
  - Text sizes responsive (11px base)
  - Touch targets large enough

### Panel Functionality

- [ ] **TradeFeed works in Live Data view**
  - Trades appear in real-time
  - Trade items are clickable
  - Pause on hover works
  - Trade count updates

- [ ] **OrderbookDepth works in Live Data view**
  - Orderbook loads correctly
  - Bid/ask levels display
  - Auto-refresh toggle works
  - Spread calculation correct

### Filter Tests

- [ ] **TradeFeed filters work**
  - Open filter panel
  - Set MIN VALUE filter
  - Enable HIGH CONVICTION filter
  - Verify filtering applies correctly
  - Clear filters works

- [ ] **OrderbookDepth filters work**
  - Open filter panel
  - Set MIN SIZE filter
  - Set MAX SPREAD filter
  - Verify filtering applies correctly
  - Clear filters works

### Navigation & History

- [ ] **Browser back button**
  - Navigate to Live Data
  - Click browser back button
  - Verify returns to previous view
  - URL updates correctly

- [ ] **Browser forward button**
  - After going back, click forward
  - Verify returns to Live Data view
  - State restores correctly

- [ ] **Tab switching**
  - Switch from Main to Orderbook tab
  - Return to Main tab
  - Verify subtab state preserved
  - Check Live Data still accessible

- [ ] **Subtab switching**
  - From Live Data, switch to Crypto subtab
  - Return to Live Data
  - Verify state maintained
  - Filters preserved if set

### URL & Bookmarking

- [ ] **URL parameters**
  - Navigate to Live Data
  - Check URL contains `?tab=main&subtab=livedata`
  - Copy URL
  - Paste in new tab
  - Verify loads directly to Live Data

- [ ] **Bookmark functionality**
  - Bookmark the Live Data view
  - Close browser
  - Open bookmark
  - Verify loads correctly

- [ ] **Share link**
  - Copy Live Data URL
  - Send to another device/browser
  - Open link
  - Confirm loads to correct view

### Edge Cases

- [ ] **No trades available**
  - Clear trade history (if possible)
  - Check "NO TRADES YET" message displays
  - Verify layout doesn't break

- [ ] **No orderbook data**
  - Deselect market (if possible)
  - Check "No market selected" message
  - Verify layout doesn't break

- [ ] **Rapid navigation**
  - Quickly switch between subtabs
  - Click header link multiple times
  - Verify no errors in console
  - Check state remains consistent

- [ ] **Long session**
  - Keep Live Data view open for 5+ minutes
  - Verify real-time updates continue
  - Check memory usage stable
  - No performance degradation

### Performance

- [ ] **Load time**
  - Navigate to Live Data
  - Measure time to interactive
  - Should be <1 second

- [ ] **Smooth scrolling**
  - Scroll in TradeFeed panel
  - Scroll in OrderbookDepth panel
  - Verify smooth 60fps scrolling
  - No lag or jank

- [ ] **Filter responsiveness**
  - Apply filters
  - Verify instant updates
  - No noticeable delay
  - UI remains responsive

### Browser Compatibility

- [ ] **Chrome/Edge (latest)**
  - All features work
  - No console errors
  - Layout correct

- [ ] **Firefox (latest)**
  - All features work
  - No console errors
  - Layout correct

- [ ] **Safari (latest)**
  - All features work
  - No console errors
  - Layout correct

- [ ] **Mobile Safari (iOS)**
  - Touch interactions work
  - Layout responsive
  - No scrolling issues

- [ ] **Chrome Android**
  - Touch interactions work
  - Layout responsive
  - No scrolling issues

### Accessibility

- [ ] **Keyboard navigation**
  - Tab to "LIVE TRADES" link
  - Press Enter to activate
  - Verify navigation works
  - Focus states visible

- [ ] **Screen reader**
  - Use screen reader on header link
  - Verify announces as link
  - Navigation intent clear

- [ ] **Focus management**
  - Tab through all interactive elements
  - Focus outline visible
  - Logical tab order

### Console & Errors

- [ ] **No JavaScript errors**
  - Open browser console
  - Navigate to Live Data
  - Verify zero errors
  - Check all warnings resolved

- [ ] **No React warnings**
  - Check console for React warnings
  - Verify no key warnings
  - No useEffect dependency warnings

- [ ] **Network requests**
  - Open Network tab
  - Navigate to Live Data
  - Verify no failed requests
  - Check WebSocket connection maintained

### Data Integrity

- [ ] **Trade data accurate**
  - Compare trades in Live Data vs All Markets
  - Verify data matches
  - Check timestamps correct

- [ ] **Orderbook data accurate**
  - Compare with standalone Orderbook tab
  - Verify bid/ask levels match
  - Check spread calculation same

- [ ] **Real-time updates**
  - Watch for new trades
  - Verify appear immediately
  - Check orderbook updates
  - Confirm WebSocket working

### Integration Tests

- [ ] **With filtering feature**
  - Apply filters in All Markets view
  - Navigate to Live Data
  - Verify filters reset (if expected)
  - Or verify filters persist (if expected)

- [ ] **With market selection**
  - Select market in All Markets
  - Navigate to Live Data
  - Check orderbook shows selected market
  - Verify trade feed works

- [ ] **With authentication**
  - Log out (if applicable)
  - Navigate to Live Data
  - Verify works in read-only mode
  - No errors for unauthenticated users

## 🚨 Critical Issues (Must Fix)

Mark any issues found:

- [ ] Breaking errors: _______________________
- [ ] Layout breaks: _______________________
- [ ] Navigation fails: _______________________
- [ ] Data not loading: _______________________
- [ ] Performance issues: _______________________

## ✅ Sign-Off

- [ ] All tests passed
- [ ] No critical issues
- [ ] Documentation reviewed
- [ ] Code reviewed
- [ ] Ready for production

**Tested by**: _______________________
**Date**: _______________________
**Browser/Device**: _______________________
**Notes**: _______________________