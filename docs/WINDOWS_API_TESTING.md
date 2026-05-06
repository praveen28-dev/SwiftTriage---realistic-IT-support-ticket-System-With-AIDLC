# Windows API Testing Guide for SwiftTriage

This guide provides Windows-compatible commands for testing SwiftTriage APIs using curl and PowerShell.

---

## Prerequisites

1. **Development server running**:
   ```powershell
   npm run dev
   ```

2. **Verify server is running**:
   - Open browser: http://localhost:3000
   - Should see SwiftTriage home page

---

## Option 1: Using PowerShell (Recommended)

PowerShell has built-in `Invoke-WebRequest` (alias: `curl`) that works better on Windows.

### 1. Test Ticket Statistics API

**Basic Request:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/tickets/stats?group_by=status" -Method GET
```

**With Parameters:**
```powershell
# Group by status
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/tickets/stats?group_by=status&date_range=last_7_days" -Method GET

# Group by priority
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/tickets/stats?group_by=priority" -Method GET

# Group by category
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/tickets/stats?group_by=category" -Method GET
```

**View Response Content:**
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/tickets/stats?group_by=status" -Method GET
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 2. Test Activity Feed API

**Basic Request:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/activity-feed?limit=5" -Method GET
```

**With Pagination:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/activity-feed?limit=5&offset=5" -Method GET
```

**View Response:**
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/activity-feed?limit=5" -Method GET
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 3. Test Widget Configuration API (Requires Authentication)

**First, login to get session cookie:**

1. Open browser and login at http://localhost:3000/login
2. Open DevTools (F12) → Application tab → Cookies
3. Copy the value of `next-auth.session-token`

**Get User Widgets:**
```powershell
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$cookie = New-Object System.Net.Cookie
$cookie.Name = "next-auth.session-token"
$cookie.Value = "YOUR_SESSION_TOKEN_HERE"
$cookie.Domain = "localhost"
$session.Cookies.Add("http://localhost:3000", $cookie)

Invoke-WebRequest -Uri "http://localhost:3000/api/v1/dashboard/widgets" -Method GET -WebSession $session
```

**Create Widget:**
```powershell
$body = @{
    widgetType = "tickets_by_status"
    title = "Tickets by Status"
    gridPosition = 0
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/v1/dashboard/widgets" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -WebSession $session
```

**Update Widget:**
```powershell
$widgetId = "YOUR_WIDGET_ID"
$body = @{
    gridPosition = 1
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/v1/dashboard/widgets/$widgetId" `
    -Method PUT `
    -ContentType "application/json" `
    -Body $body `
    -WebSession $session
```

**Delete Widget:**
```powershell
$widgetId = "YOUR_WIDGET_ID"
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/dashboard/widgets/$widgetId" `
    -Method DELETE `
    -WebSession $session
```

---

## Option 2: Using curl on Windows

If you have curl installed (Windows 10+ includes it), use these commands:

### Important: Windows curl Syntax Rules

1. **Use double quotes** for URLs (not single quotes)
2. **Escape inner quotes** with backslash
3. **No line continuation** with backslash (use ^ instead)
4. **Or write on single line**

### 1. Test Ticket Statistics API

**Single Line (Easiest):**
```cmd
curl "http://localhost:3000/api/v1/tickets/stats?group_by=status"
```

**With Parameters:**
```cmd
curl "http://localhost:3000/api/v1/tickets/stats?group_by=status&date_range=last_7_days"
```

**Pretty Print JSON (using jq if installed):**
```cmd
curl "http://localhost:3000/api/v1/tickets/stats?group_by=status" | jq
```

### 2. Test Activity Feed API

```cmd
curl "http://localhost:3000/api/v1/activity-feed?limit=5"
```

### 3. Test Widget Configuration API

**Get Widgets (with authentication):**
```cmd
curl "http://localhost:3000/api/v1/dashboard/widgets" -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**Create Widget:**
```cmd
curl "http://localhost:3000/api/v1/dashboard/widgets" ^
  -X POST ^
  -H "Content-Type: application/json" ^
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" ^
  -d "{\"widgetType\":\"tickets_by_status\",\"title\":\"Tickets by Status\",\"gridPosition\":0}"
```

**Update Widget:**
```cmd
curl "http://localhost:3000/api/v1/dashboard/widgets/WIDGET_ID" ^
  -X PUT ^
  -H "Content-Type: application/json" ^
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" ^
  -d "{\"gridPosition\":1}"
```

**Delete Widget:**
```cmd
curl "http://localhost:3000/api/v1/dashboard/widgets/WIDGET_ID" ^
  -X DELETE ^
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

---

## Option 3: Using Browser DevTools (Easiest!)

This is the simplest way to test APIs on Windows:

### 1. Open Browser DevTools
- Press F12 in Chrome/Edge/Firefox
- Go to "Console" tab

### 2. Test APIs with JavaScript

**Test Ticket Statistics:**
```javascript
fetch('http://localhost:3000/api/v1/tickets/stats?group_by=status')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

**Test Activity Feed:**
```javascript
fetch('http://localhost:3000/api/v1/activity-feed?limit=5')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

**Test Widget Configuration (automatically includes cookies):**
```javascript
// Get widgets
fetch('http://localhost:3000/api/v1/dashboard/widgets', {
  credentials: 'include'
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Create widget
fetch('http://localhost:3000/api/v1/dashboard/widgets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({
    widgetType: 'tickets_by_status',
    title: 'Tickets by Status',
    gridPosition: 0
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

---

## Option 4: Using Postman (GUI Tool)

### Install Postman
1. Download from https://www.postman.com/downloads/
2. Install and open

### Test APIs

**1. Create New Request:**
- Click "New" → "HTTP Request"

**2. Test Ticket Statistics:**
- Method: GET
- URL: `http://localhost:3000/api/v1/tickets/stats?group_by=status`
- Click "Send"

**3. Test with Authentication:**
- First, login in browser
- Copy session cookie from DevTools
- In Postman:
  - Go to "Cookies" tab
  - Add cookie: `next-auth.session-token` = `YOUR_TOKEN`
  - Or use Headers tab: `Cookie: next-auth.session-token=YOUR_TOKEN`

---

## Quick Test Script (PowerShell)

Save this as `test-apis.ps1`:

```powershell
# SwiftTriage API Test Script
Write-Host "Testing SwiftTriage APIs..." -ForegroundColor Green

# Test 1: Ticket Statistics
Write-Host "`n1. Testing Ticket Statistics API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/tickets/stats?group_by=status" -Method GET
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ Data received: $($data.total) total tickets" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Activity Feed
Write-Host "`n2. Testing Activity Feed API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/activity-feed?limit=5" -Method GET
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ Data received: $($data.activities.Count) activities" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Health Check
Write-Host "`n3. Testing Health Check API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ System status: $($data.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI Testing Complete!" -ForegroundColor Green
```

**Run the script:**
```powershell
.\test-apis.ps1
```

---

## Troubleshooting

### Issue: "Unauthorized" Error

**Cause:** API requires authentication but no session cookie provided

**Solution:**
1. Login in browser first: http://localhost:3000/login
2. Get session token from DevTools → Application → Cookies
3. Include cookie in request (see examples above)

### Issue: "curl: (3) URL rejected: Bad hostname"

**Cause:** Windows cmd.exe doesn't handle line continuation with backslash

**Solution:**
- Use `^` for line continuation in cmd.exe
- Or write command on single line
- Or use PowerShell instead

### Issue: "404 Not Found"

**Cause:** API endpoint doesn't exist or dev server not running

**Solution:**
1. Verify dev server is running: `npm run dev`
2. Check URL is correct
3. Verify endpoint exists in code

### Issue: Empty Response or No Data

**Cause:** Database is empty (no tickets/activities yet)

**Solution:**
1. Create test data by submitting tickets via UI
2. Or insert test data directly into database

---

## Expected Responses

### Ticket Statistics API
```json
{
  "data": [
    {
      "label": "Open",
      "value": "open",
      "count": 10,
      "color": "#007bff",
      "percentage": 50.0
    }
  ],
  "total": 20,
  "groupBy": "status",
  "timestamp": "2026-05-05T15:00:00Z"
}
```

### Activity Feed API
```json
{
  "activities": [
    {
      "id": "1",
      "ticketId": "uuid",
      "ticketNumber": "#12345",
      "actionType": "status_change",
      "actionDetail": "Changed status to Open",
      "userName": "IT Admin",
      "relativeTime": "2 minutes ago"
    }
  ],
  "total": 50,
  "hasMore": true,
  "nextOffset": 5
}
```

### Widget Configuration API
```json
{
  "widgets": [
    {
      "id": "uuid",
      "userId": "user-id",
      "widgetType": "tickets_by_status",
      "title": "Tickets by Status",
      "gridPosition": 0,
      "isVisible": true
    }
  ]
}
```

---

## Recommended Testing Approach

**For Windows Users:**

1. **Start with Browser DevTools** (easiest, no setup)
   - Open http://localhost:3000
   - Press F12
   - Use Console tab with fetch() examples above

2. **Use PowerShell** for automated testing
   - More powerful than cmd.exe
   - Better JSON handling
   - Use the test script provided

3. **Use Postman** for comprehensive testing
   - GUI interface
   - Save requests for reuse
   - Better for complex scenarios

4. **Avoid cmd.exe curl** unless necessary
   - Syntax is tricky on Windows
   - PowerShell is better alternative

---

## Next Steps

After testing APIs:

1. **Test in Browser UI**
   - Login at http://localhost:3000/login
   - Go to dashboard
   - Verify widgets load data from APIs

2. **Test Widget Interactions**
   - Drag-and-drop widgets
   - Click widget menu
   - Edit widget settings
   - Verify changes persist

3. **Run Full Test Suite**
   - Follow `aidlc-docs/widget-system-testing-guide.md`
   - Test all user flows
   - Verify all features work

---

**Document Version**: 1.0  
**Last Updated**: May 5, 2026  
**Platform**: Windows 10/11
