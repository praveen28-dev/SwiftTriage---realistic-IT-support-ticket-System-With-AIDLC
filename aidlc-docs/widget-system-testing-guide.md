# Widget System Testing Guide

## Overview
This guide provides instructions for testing the complete widget system with drag-and-drop functionality, widget configuration, and data visualization.

---

## Prerequisites

### 1. Database Setup
```bash
# Generate migration for widgetConfigs table
npm run db:generate

# Apply migration to database
npm run db:push
```

### 2. Environment Variables
Ensure `.env.local` contains:
```env
DATABASE_URL=your_neon_database_url
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key
```

### 3. Start Development Server
```bash
npm run dev
```

---

## Testing Scenarios

### Scenario 1: Demo Page (No Authentication Required)

**URL**: `http://localhost:3000/dashboard-demo`

**What to Test:**
1. **Drag-and-Drop**
   - Click and hold the grip icon (⋮⋮) on any widget
   - Drag the widget to a new position
   - Release to drop
   - Verify widgets reorder correctly

2. **Widget Menu**
   - Click the three dots (⋯) on any widget
   - Test "Refresh Data" option
   - Test "Export Data" option (downloads CSV)
   - Test "Remove Widget" option (confirms and removes)

3. **Chart Interactions**
   - Click on pie chart legend items
   - Click on bar chart bars
   - Click on activity feed entries
   - Verify console logs show navigation attempts

4. **Responsive Layout**
   - Resize browser window
   - Verify grid adapts: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)

---

### Scenario 2: Authenticated Dashboard

**URL**: `http://localhost:3000/dashboard`

**Prerequisites:**
- Login as IT staff user
- Role: `it_staff` in NextAuth session

**What to Test:**

#### A. Initial Load
1. First-time user should see 6 default widgets automatically created
2. Verify all widgets display with mock/real data
3. Check loading states appear briefly

#### B. Widget Configuration Modal
1. Click "Configure Dashboard" or "Add Widget" button
2. Modal should display all 6 widget types
3. Already-added widgets should show "✓ Already added"
4. Click "Add Widget" on an available widget
5. Verify widget appears on dashboard
6. Close modal

#### C. Drag-and-Drop Persistence
1. Drag widgets to reorder them
2. Refresh the page
3. Verify widget order is preserved (saved to database)

#### D. Widget Removal
1. Click widget menu (⋯)
2. Select "Remove Widget"
3. Confirm removal
4. Verify widget disappears
5. Refresh page
6. Verify widget stays removed

#### E. Data Refresh
1. Click widget menu (⋯)
2. Select "Refresh Data"
3. Verify loading indicator appears briefly
4. Verify data updates (if available)

#### F. CSV Export
1. Click widget menu (⋯)
2. Select "Export Data"
3. Verify CSV file downloads
4. Open CSV and verify data format

---

## API Testing

### 1. Ticket Statistics API

**Endpoint**: `GET /api/v1/tickets/stats`

**Test Cases:**

```bash
# Test status grouping
curl http://localhost:3000/api/v1/tickets/stats?group_by=status

# Test tech group grouping
curl http://localhost:3000/api/v1/tickets/stats?group_by=tech_group

# Test alert level grouping
curl http://localhost:3000/api/v1/tickets/stats?group_by=alert_level

# Test with date range
curl http://localhost:3000/api/v1/tickets/stats?group_by=status&date_range=last_7_days

# Test with sorting
curl http://localhost:3000/api/v1/tickets/stats?group_by=request_type&sort=desc&limit=5
```

**Expected Response:**
```json
{
  "data": [
    {
      "label": "Open",
      "value": "open",
      "count": 33,
      "color": "#007bff",
      "percentage": 61.1
    }
  ],
  "total": 54,
  "group_by": "status",
  "timestamp": "2026-05-05T14:00:00Z"
}
```

### 2. Activity Feed API

**Endpoint**: `GET /api/v1/activity-feed`

**Test Cases:**

```bash
# Test basic feed
curl http://localhost:3000/api/v1/activity-feed?limit=5

# Test with pagination
curl http://localhost:3000/api/v1/activity-feed?limit=5&offset=5

# Test with ticket filter
curl http://localhost:3000/api/v1/activity-feed?ticket_id=YOUR_TICKET_ID

# Test with action type filter
curl http://localhost:3000/api/v1/activity-feed?action_types=Call,Email
```

**Expected Response:**
```json
{
  "activities": [
    {
      "id": "108",
      "ticket_id": "456abc",
      "ticket_number": "#35000953",
      "action_type": "status_change",
      "action_detail": "De-escalated to Joe Admin",
      "comment_snippet": "Schedule change...",
      "user_name": "Joe Admin",
      "relative_time": "6 days ago",
      "is_expandable": true
    }
  ],
  "total": 150,
  "has_more": true,
  "next_offset": 5
}
```

### 3. Widget Configuration API

**Endpoint**: `GET /api/v1/dashboard/widgets`

**Test Cases:**

```bash
# Get user's widgets (requires authentication)
curl -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  http://localhost:3000/api/v1/dashboard/widgets

# Create widget (POST)
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"widgetType":"tickets_by_status","title":"Tickets by Status","gridPosition":0}' \
  http://localhost:3000/api/v1/dashboard/widgets

# Update widget (PUT)
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"gridPosition":1}' \
  http://localhost:3000/api/v1/dashboard/widgets/WIDGET_ID

# Delete widget (DELETE)
curl -X DELETE \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  http://localhost:3000/api/v1/dashboard/widgets/WIDGET_ID

# Reorder widgets (PUT)
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"widgets":[{"id":"ID1","gridPosition":0},{"id":"ID2","gridPosition":1}]}' \
  http://localhost:3000/api/v1/dashboard/widgets/reorder
```

---

## Performance Testing

### 1. Widget Load Time
- Open browser DevTools → Network tab
- Navigate to dashboard
- Measure time to load all widgets
- **Target**: < 2 seconds for initial load

### 2. Drag-and-Drop Responsiveness
- Drag a widget
- Measure time from drop to position update
- **Target**: < 500ms

### 3. Data Refresh
- Click "Refresh Data" on a widget
- Measure time to fetch and display new data
- **Target**: < 1 second

### 4. Auto-Refresh Polling
- Open dashboard
- Monitor network requests
- Verify polling intervals:
  - Ticket stats: 30 seconds
  - Activity feed: 10 seconds

---

## Browser Compatibility

Test in the following browsers:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

---

## Known Issues & Limitations

### Current Limitations:
1. **Widget Edit**: Edit functionality not yet implemented (only add/remove)
2. **Custom Filters**: Widget-specific filters not yet configurable
3. **Widget Resize**: Widgets use fixed grid columns (no custom sizing yet)
4. **Real-time Updates**: WebSocket not implemented (using polling)

### Planned Enhancements:
1. Widget edit modal for customizing titles and filters
2. Custom date range picker for statistics
3. Widget resize handles for custom column spans
4. WebSocket integration for true real-time updates
5. Widget templates/presets for different roles
6. Export dashboard configuration

---

## Troubleshooting

### Issue: Widgets not loading
**Solution**: Check browser console for errors. Verify API endpoints are accessible.

### Issue: Drag-and-drop not working
**Solution**: Ensure @dnd-kit dependencies are installed. Check for JavaScript errors.

### Issue: Widget positions not persisting
**Solution**: Verify database migration was applied. Check widgetConfigs table exists.

### Issue: "Unauthorized" errors
**Solution**: Ensure user is logged in with IT staff role. Check NextAuth session.

### Issue: No data in widgets
**Solution**: Create some test tickets first. Verify database has data.

---

## Success Criteria

✅ All 6 widget types display correctly  
✅ Drag-and-drop reordering works smoothly  
✅ Widget positions persist after page refresh  
✅ Widget menu options work (refresh, export, remove)  
✅ Configuration modal allows adding widgets  
✅ Already-added widgets are disabled in modal  
✅ CSV export generates valid files  
✅ Chart interactions trigger navigation  
✅ Responsive layout adapts to screen size  
✅ Loading states display appropriately  
✅ Error handling works gracefully  
✅ Auto-refresh polling works correctly  

---

## Next Steps After Testing

1. **Fix any bugs** discovered during testing
2. **Implement widget edit** functionality
3. **Add custom filters** per widget
4. **Create widget templates** for different user roles
5. **Add more widget types** (customers, products, reports)
6. **Implement WebSocket** for real-time updates
7. **Add widget resize** functionality
8. **Create dashboard export/import** feature

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-05  
**Status**: Ready for Testing
