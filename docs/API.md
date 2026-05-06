# SwiftTriage API Documentation

Complete REST API reference for SwiftTriage integration and automation.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Tickets API](#tickets-api)
4. [Customers API](#customers-api)
5. [Products API](#products-api)
6. [Activities API](#activities-api)
7. [Dashboard API](#dashboard-api)
8. [Widget Configuration API](#widget-configuration-api)
9. [Statistics API](#statistics-api)
10. [Activity Feed API](#activity-feed-api)
11. [Error Handling](#error-handling)
12. [Rate Limiting](#rate-limiting)

---

## Overview

### Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### API Versions

- **v1**: `/api/v1/*` - Current stable version
- **Legacy**: `/api/*` - Original endpoints (deprecated)

### Content Type

All requests and responses use JSON:

```
Content-Type: application/json
```

### Response Format

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message",
  "timestamp": "2026-05-05T14:00:00Z"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... },
  "timestamp": "2026-05-05T14:00:00Z"
}
```

---

## Authentication

### Session-Based Authentication

SwiftTriage uses NextAuth.js for authentication. All API requests require a valid session.

### Login

**Endpoint:** `POST /api/auth/signin`

**Request:**
```json
{
  "username": "it_admin",
  "password": "password"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "name": "it_admin",
    "role": "it_staff"
  },
  "session": {
    "expires": "2026-05-06T14:00:00Z"
  }
}
```

### Logout

**Endpoint:** `POST /api/auth/signout`

**Response:**
```json
{
  "message": "Signed out successfully"
}
```

### Check Session

**Endpoint:** `GET /api/auth/session`

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "name": "it_admin",
    "role": "it_staff"
  },
  "expires": "2026-05-06T14:00:00Z"
}
```

---

## Tickets API

### List Tickets

**Endpoint:** `GET /api/tickets`

**Query Parameters:**
- `status` (optional): Filter by status (Open, Closed, Resolved, etc.)
- `priority` (optional): Filter by priority (1-5)
- `category` (optional): Filter by category
- `limit` (optional): Number of results (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Example Request:**
```bash
GET /api/tickets?status=Open&limit=10
```

**Response:**
```json
{
  "tickets": [
    {
      "id": "uuid",
      "userInput": "My laptop won't start",
      "category": "Hardware",
      "urgencyScore": 4,
      "aiSummary": "Laptop power issue",
      "status": "Open",
      "customerId": "customer-uuid",
      "assignedTo": null,
      "priority": "High",
      "tags": ["laptop", "hardware"],
      "createdAt": "2026-05-05T10:00:00Z",
      "updatedAt": "2026-05-05T10:00:00Z",
      "resolvedAt": null
    }
  ],
  "total": 45,
  "limit": 10,
  "offset": 0,
  "hasMore": true
}
```

### Create Ticket

**Endpoint:** `POST /api/tickets`

**Request:**
```json
{
  "userInput": "My laptop won't start after the latest update",
  "contactEmail": "user@example.com",
  "customerId": "customer-uuid" // optional
}
```

**Response:**
```json
{
  "ticket": {
    "id": "uuid",
    "userInput": "My laptop won't start after the latest update",
    "category": "Hardware",
    "urgencyScore": 4,
    "aiSummary": "Laptop power issue following system update",
    "status": "Open",
    "createdAt": "2026-05-05T14:00:00Z"
  },
  "message": "Ticket created successfully"
}
```

### Get Ticket by ID

**Endpoint:** `GET /api/tickets/:id`

**Response:**
```json
{
  "ticket": {
    "id": "uuid",
    "userInput": "My laptop won't start",
    "category": "Hardware",
    "urgencyScore": 4,
    "aiSummary": "Laptop power issue",
    "status": "Open",
    "customerId": "customer-uuid",
    "customer": {
      "id": "customer-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "assignedTo": "it_admin",
    "priority": "High",
    "tags": ["laptop", "hardware"],
    "createdAt": "2026-05-05T10:00:00Z",
    "updatedAt": "2026-05-05T10:00:00Z",
    "resolvedAt": null
  }
}
```

### Update Ticket

**Endpoint:** `PUT /api/tickets/:id`

**Request:**
```json
{
  "status": "In Progress",
  "assignedTo": "it_admin",
  "priority": "High",
  "tags": ["laptop", "hardware", "urgent"]
}
```

**Response:**
```json
{
  "ticket": { ... },
  "message": "Ticket updated successfully"
}
```

### Delete Ticket

**Endpoint:** `DELETE /api/tickets/:id`

**Response:**
```json
{
  "message": "Ticket deleted successfully"
}
```

---

## Customers API

### List Customers

**Endpoint:** `GET /api/customers`

**Query Parameters:**
- `search` (optional): Search by name, email, or company
- `tier` (optional): Filter by tier (Free, Pro, Enterprise)
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset

**Example Request:**
```bash
GET /api/customers?tier=Enterprise&limit=10
```

**Response:**
```json
{
  "customers": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "company": "Acme Corporation",
      "tier": "Enterprise",
      "annualRevenue": 1000000,
      "territory": "North America",
      "cdiRating": 2.5,
      "logoUrl": null,
      "primaryContact": "John Doe",
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-05-05T14:00:00Z"
    }
  ],
  "total": 150,
  "limit": 10,
  "offset": 0
}
```

### Create Customer

**Endpoint:** `POST /api/customers`

**Request:**
```json
{
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "company": "Acme Corporation",
  "tier": "Enterprise",
  "annualRevenue": 1000000,
  "territory": "North America",
  "primaryContact": "John Doe"
}
```

**Response:**
```json
{
  "customer": { ... },
  "message": "Customer created successfully"
}
```

### Get Customer by ID

**Endpoint:** `GET /api/customers/:id`

**Response:**
```json
{
  "customer": {
    "id": "uuid",
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "company": "Acme Corporation",
    "tier": "Enterprise",
    "annualRevenue": 1000000,
    "territory": "North America",
    "cdiRating": 2.5,
    "logoUrl": null,
    "primaryContact": "John Doe",
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-05-05T14:00:00Z",
    "tickets": [ ... ],
    "activities": [ ... ],
    "products": [ ... ]
  }
}
```

### Update Customer

**Endpoint:** `PUT /api/customers/:id`

**Request:**
```json
{
  "tier": "Enterprise",
  "annualRevenue": 1500000,
  "cdiRating": 2.0
}
```

**Response:**
```json
{
  "customer": { ... },
  "message": "Customer updated successfully"
}
```

### Delete Customer

**Endpoint:** `DELETE /api/customers/:id`

**Response:**
```json
{
  "message": "Customer deleted successfully"
}
```

---

## Products API

### List Products

**Endpoint:** `GET /api/products`

**Query Parameters:**
- `category` (optional): Filter by category
- `limit` (optional): Number of results
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Enterprise Support Plan",
      "description": "24/7 premium support",
      "sku": "ESP-001",
      "category": "Support",
      "price": 999.99,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-05-05T14:00:00Z"
    }
  ],
  "total": 25,
  "limit": 20,
  "offset": 0
}
```

### Create Product

**Endpoint:** `POST /api/products`

**Request:**
```json
{
  "name": "Enterprise Support Plan",
  "description": "24/7 premium support",
  "sku": "ESP-001",
  "category": "Support",
  "price": 999.99
}
```

**Response:**
```json
{
  "product": { ... },
  "message": "Product created successfully"
}
```

---

## Activities API

### List Activities

**Endpoint:** `GET /api/activities`

**Query Parameters:**
- `customerId` (optional): Filter by customer
- `ticketId` (optional): Filter by ticket
- `type` (optional): Filter by type (Call, Email, Meeting, Note)
- `limit` (optional): Number of results
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "Call",
      "description": "Discussed laptop issue with customer",
      "customerId": "customer-uuid",
      "ticketId": "ticket-uuid",
      "userId": "it_admin",
      "createdAt": "2026-05-05T14:00:00Z"
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

### Create Activity

**Endpoint:** `POST /api/activities`

**Request:**
```json
{
  "type": "Call",
  "description": "Discussed laptop issue with customer",
  "customerId": "customer-uuid",
  "ticketId": "ticket-uuid"
}
```

**Response:**
```json
{
  "activity": { ... },
  "message": "Activity created successfully"
}
```

---

## Dashboard API

### Get Dashboard Statistics

**Endpoint:** `GET /api/dashboard`

**Response:**
```json
{
  "statistics": {
    "totalTickets": 450,
    "openTickets": 125,
    "closedTickets": 325,
    "averageResolutionTime": 24.5,
    "averageCdiRating": 2.8,
    "totalCustomers": 150,
    "activeCustomers": 120
  },
  "recentTickets": [ ... ],
  "ticketDistribution": {
    "open": 125,
    "closed": 325,
    "resolved": 280,
    "pending": 45
  }
}
```

---

## Widget Configuration API

### Get User Widgets

**Endpoint:** `GET /api/v1/dashboard/widgets`

**Response:**
```json
{
  "widgets": [
    {
      "id": "uuid",
      "userId": "user-id",
      "widgetType": "tickets_by_status",
      "title": "Tickets by Status",
      "gridPosition": 0,
      "gridColumn": 1,
      "gridRow": 1,
      "queryConfig": {
        "dateRange": "last_30_days",
        "limit": 10,
        "sortOrder": "desc"
      },
      "isVisible": true,
      "createdAt": "2026-05-05T10:00:00Z",
      "updatedAt": "2026-05-05T14:00:00Z"
    }
  ]
}
```

### Create Widget

**Endpoint:** `POST /api/v1/dashboard/widgets`

**Request:**
```json
{
  "widgetType": "tickets_by_priority",
  "title": "Tickets by Priority",
  "gridPosition": 1,
  "gridColumn": 1,
  "gridRow": 1,
  "queryConfig": {
    "dateRange": "last_7_days",
    "limit": 5
  }
}
```

**Response:**
```json
{
  "widget": { ... },
  "message": "Widget created successfully"
}
```

### Update Widget

**Endpoint:** `PUT /api/v1/dashboard/widgets/:id`

**Request:**
```json
{
  "title": "Updated Title",
  "gridPosition": 2,
  "queryConfig": {
    "dateRange": "last_90_days",
    "limit": 20
  }
}
```

**Response:**
```json
{
  "widget": { ... },
  "message": "Widget updated successfully"
}
```

### Delete Widget

**Endpoint:** `DELETE /api/v1/dashboard/widgets/:id`

**Response:**
```json
{
  "message": "Widget deleted successfully"
}
```

### Reorder Widgets

**Endpoint:** `PUT /api/v1/dashboard/widgets/reorder`

**Request:**
```json
{
  "widgets": [
    { "id": "uuid-1", "gridPosition": 0 },
    { "id": "uuid-2", "gridPosition": 1 },
    { "id": "uuid-3", "gridPosition": 2 }
  ]
}
```

**Response:**
```json
{
  "message": "Widgets reordered successfully"
}
```

---

## Statistics API

### Get Ticket Statistics

**Endpoint:** `GET /api/v1/tickets/stats`

**Query Parameters:**
- `group_by` (required): status | priority | category | tech_group | alert_level | request_type | alert_condition
- `sort` (optional): asc | desc (default: desc)
- `limit` (optional): Number of results (default: 20)
- `date_range` (optional): last_7_days | last_30_days | last_90_days | custom
- `start_date` (optional): ISO date string (for custom range)
- `end_date` (optional): ISO date string (for custom range)

**Example Request:**
```bash
GET /api/v1/tickets/stats?group_by=status&date_range=last_30_days
```

**Response:**
```json
{
  "data": [
    {
      "label": "Open",
      "value": "open",
      "count": 125,
      "color": "#007bff",
      "percentage": 27.8
    },
    {
      "label": "Closed",
      "value": "closed",
      "count": 325,
      "color": "#fd7e14",
      "percentage": 72.2
    }
  ],
  "total": 450,
  "groupBy": "status",
  "dateRange": "last_30_days",
  "timestamp": "2026-05-05T14:00:00Z"
}
```

---

## Activity Feed API

### Get Activity Feed

**Endpoint:** `GET /api/v1/activity-feed`

**Query Parameters:**
- `limit` (optional): Number of results (default: 5, max: 50)
- `offset` (optional): Pagination offset
- `ticket_id` (optional): Filter by ticket
- `user_id` (optional): Filter by user
- `action_types` (optional): Comma-separated list (status_change, comment, assignment)

**Example Request:**
```bash
GET /api/v1/activity-feed?limit=10&action_types=status_change,assignment
```

**Response:**
```json
{
  "activities": [
    {
      "id": "108",
      "ticketId": "ticket-uuid",
      "ticketNumber": "#35000953",
      "actionType": "status_change",
      "actionDetail": "Changed status from Open to In Progress",
      "commentSnippet": "Working on the issue now",
      "userId": "it_admin",
      "userName": "IT Admin",
      "userAvatar": "/avatars/admin.jpg",
      "timestamp": "2026-05-05T14:00:00Z",
      "relativeTime": "2 minutes ago",
      "isExpandable": true,
      "expandedContent": "Full comment text here..."
    }
  ],
  "total": 150,
  "hasMore": true,
  "nextOffset": 10
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (duplicate) |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Response Format

```json
{
  "error": "Validation error",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  },
  "timestamp": "2026-05-05T14:00:00Z"
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED`: User not authenticated
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `DUPLICATE_RESOURCE`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## Rate Limiting

### Limits

- **Authenticated Users**: 1000 requests per hour
- **Unauthenticated**: 100 requests per hour
- **Burst**: 20 requests per minute

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1620000000
```

### Rate Limit Exceeded Response

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 3600,
  "timestamp": "2026-05-05T14:00:00Z"
}
```

---

## Webhooks (Coming Soon)

Future support for webhooks to receive real-time notifications:

- Ticket created
- Ticket updated
- Ticket resolved
- Customer created
- SLA breach

---

## SDK and Libraries (Coming Soon)

Official SDKs planned for:

- JavaScript/TypeScript
- Python
- PHP
- Ruby

---

## Support

- **API Issues**: api-support@swifttriage.com
- **Documentation**: [docs/](.)
- **GitHub Issues**: Report bugs and request features

---

**API Version**: 1.0  
**Last Updated**: May 5, 2026  
**Base URL**: `https://your-domain.com/api`
