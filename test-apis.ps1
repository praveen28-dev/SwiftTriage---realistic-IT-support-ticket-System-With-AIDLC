# SwiftTriage API Test Script for Windows
# Run this script: .\test-apis.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SwiftTriage API Testing Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if dev server is running
Write-Host "Checking if dev server is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Dev server is running!" -ForegroundColor Green
} catch {
    Write-Host "✗ Dev server is NOT running!" -ForegroundColor Red
    Write-Host "  Please run: npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Running API Tests..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Ticket Statistics API - Status
Write-Host "1. Testing Ticket Statistics API (by status)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/tickets/stats?group_by=status" -Method GET -ErrorAction Stop
    Write-Host "   ✓ Status Code: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   ✓ Total Tickets: $($data.total)" -ForegroundColor Green
    Write-Host "   ✓ Grouped By: $($data.groupBy)" -ForegroundColor Green
    if ($data.data.Count -gt 0) {
        Write-Host "   ✓ Sample Data: $($data.data[0].label) = $($data.data[0].count)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Ticket Statistics API - Priority
Write-Host "2. Testing Ticket Statistics API (by priority)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/tickets/stats?group_by=priority" -Method GET -ErrorAction Stop
    Write-Host "   ✓ Status Code: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   ✓ Total Tickets: $($data.total)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Ticket Statistics API - Category
Write-Host "3. Testing Ticket Statistics API (by category)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/tickets/stats?group_by=category" -Method GET -ErrorAction Stop
    Write-Host "   ✓ Status Code: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   ✓ Total Tickets: $($data.total)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Activity Feed API
Write-Host "4. Testing Activity Feed API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/activity-feed?limit=5" -Method GET -ErrorAction Stop
    Write-Host "   ✓ Status Code: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   ✓ Activities Count: $($data.activities.Count)" -ForegroundColor Green
    Write-Host "   ✓ Total Activities: $($data.total)" -ForegroundColor Green
    Write-Host "   ✓ Has More: $($data.hasMore)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Dashboard API
Write-Host "5. Testing Dashboard API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/dashboard" -Method GET -ErrorAction Stop
    Write-Host "   ✓ Status Code: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    if ($data.statistics) {
        Write-Host "   ✓ Total Tickets: $($data.statistics.totalTickets)" -ForegroundColor Green
        Write-Host "   ✓ Open Tickets: $($data.statistics.openTickets)" -ForegroundColor Green
        Write-Host "   ✓ Closed Tickets: $($data.statistics.closedTickets)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Customers API
Write-Host "6. Testing Customers API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/customers" -Method GET -ErrorAction Stop
    Write-Host "   ✓ Status Code: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   ✓ Customers Count: $($data.customers.Count)" -ForegroundColor Green
    Write-Host "   ✓ Total Customers: $($data.total)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: Products API
Write-Host "7. Testing Products API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method GET -ErrorAction Stop
    Write-Host "   ✓ Status Code: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   ✓ Products Count: $($data.products.Count)" -ForegroundColor Green
    Write-Host "   ✓ Total Products: $($data.total)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 8: Activities API
Write-Host "8. Testing Activities API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/activities" -Method GET -ErrorAction Stop
    Write-Host "   ✓ Status Code: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   ✓ Activities Count: $($data.activities.Count)" -ForegroundColor Green
    Write-Host "   ✓ Total Activities: $($data.total)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  API Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If tests show 0 data, create test tickets via UI" -ForegroundColor White
Write-Host "2. Login at http://localhost:3000/login" -ForegroundColor White
Write-Host "3. Submit test tickets at http://localhost:3000/submit" -ForegroundColor White
Write-Host "4. View dashboard at http://localhost:3000/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "For authenticated API tests (widgets), see:" -ForegroundColor Yellow
Write-Host "docs/WINDOWS_API_TESTING.md" -ForegroundColor White
Write-Host ""
