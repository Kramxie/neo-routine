# NeoRoutine API Documentation

## Overview

NeoRoutine provides a RESTful API for managing habits, routines, and user progress. All API routes are located under `/api/`.

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via JWT token stored in an httpOnly cookie (`neo_token`).

### Headers
```
Content-Type: application/json
Cookie: neo_token=<jwt_token>
```

---

## Endpoints

### Health Check

#### `GET /api/health`
Check API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

---

## Authentication

### `POST /api/auth/register`
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email to verify your account.",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:**
- `400` - Validation error (invalid email, short password, etc.)
- `409` - Email already exists
- `429` - Rate limit exceeded (3 registrations per hour)

---

### `POST /api/auth/login`
Authenticate a user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

**Errors:**
- `400` - Invalid credentials
- `401` - Email not verified
- `429` - Rate limit exceeded (5 attempts per 15 min)

---

### `POST /api/auth/logout`
Log out the current user.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### `GET /api/auth/me`
Get current authenticated user.

**Response (200):**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": true,
    "subscription": {
      "tier": "premium",
      "status": "active"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### `POST /api/auth/verify-email`
Verify email with code.

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### `POST /api/auth/forgot-password`
Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If an account exists, a reset link has been sent"
}
```

---

### `POST /api/auth/reset-password`
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Routines

### `GET /api/routines`
Get all routines for the current user.

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `paused`, `archived`)

**Response (200):**
```json
{
  "routines": [
    {
      "_id": "routine_id",
      "title": "Morning Routine",
      "description": "Start the day right",
      "color": "#3b82f6",
      "icon": "sun",
      "tasks": [
        {
          "_id": "task_id",
          "title": "Wake up at 6 AM",
          "order": 0
        }
      ],
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/routines`
Create a new routine.

**Request Body:**
```json
{
  "title": "Morning Routine",
  "description": "Start the day right",
  "color": "#3b82f6",
  "icon": "sun",
  "tasks": [
    { "title": "Wake up at 6 AM" },
    { "title": "Drink water" },
    { "title": "Exercise for 30 min" }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "routine": { ... }
}
```

**Limits:**
- Free tier: 3 routines max
- Premium: 10 routines max
- Premium+: Unlimited

---

### `GET /api/routines/:id`
Get a specific routine.

**Response (200):**
```json
{
  "routine": { ... }
}
```

---

### `PUT /api/routines/:id`
Update a routine.

**Request Body:**
```json
{
  "title": "Updated Title",
  "tasks": [...]
}
```

**Response (200):**
```json
{
  "success": true,
  "routine": { ... }
}
```

---

### `DELETE /api/routines/:id`
Delete a routine.

**Response (200):**
```json
{
  "success": true,
  "message": "Routine deleted"
}
```

---

## Check-ins

### `GET /api/checkins/today`
Get today's check-in data.

**Response (200):**
```json
{
  "date": "2024-01-15",
  "checkedTasks": {
    "routine_id": ["task_id_1", "task_id_2"]
  }
}
```

---

### `POST /api/checkins`
Check in/out a task.

**Request Body:**
```json
{
  "routineId": "routine_id",
  "taskId": "task_id",
  "checked": true
}
```

**Response (200):**
```json
{
  "success": true,
  "badges": ["first_checkin"],
  "streakUpdate": {
    "current": 5,
    "longest": 10
  }
}
```

---

## Goals

### `GET /api/user/goals`
Get all user goals.

**Response (200):**
```json
{
  "goals": [
    {
      "_id": "goal_id",
      "title": "Complete 30 morning routines",
      "description": "Build a solid morning habit",
      "category": "health",
      "targetValue": 30,
      "currentValue": 12,
      "dueDate": "2024-03-01",
      "status": "active"
    }
  ]
}
```

---

### `POST /api/user/goals`
Create a new goal.

**Request Body:**
```json
{
  "title": "Complete 30 morning routines",
  "description": "Build a solid morning habit",
  "category": "health",
  "targetValue": 30,
  "dueDate": "2024-03-01"
}
```

---

## Insights

### `GET /api/insights/user`
Get user analytics.

**Query Parameters:**
- `range`: Number of days (7, 30, 90)

**Response (200):**
```json
{
  "completionRate": 85,
  "totalCheckins": 150,
  "streakData": {
    "current": 5,
    "longest": 15,
    "thisWeek": 5,
    "thisMonth": 22
  },
  "dailyCompletion": [
    { "date": "2024-01-15", "completed": 8, "total": 10 }
  ],
  "routineBreakdown": [
    { "routineId": "id", "title": "Morning", "completionRate": 90 }
  ]
}
```

---

## Badges

### `GET /api/badges`
Get user badges.

**Response (200):**
```json
{
  "badges": [
    {
      "id": "first_checkin",
      "name": "First Drop",
      "description": "Complete your first check-in",
      "icon": "💧",
      "earnedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "available": [
    {
      "id": "streak_7",
      "name": "Week Warrior",
      "description": "Maintain a 7-day streak",
      "icon": "🔥",
      "progress": 5,
      "target": 7
    }
  ]
}
```

---

## Subscriptions

### `GET /api/subscription`
Get current subscription status.

**Response (200):**
```json
{
  "subscription": {
    "tier": "premium",
    "status": "active",
    "currentPeriodEnd": "2024-02-15T00:00:00.000Z",
    "cancelAtPeriodEnd": false
  }
}
```

---

### `POST /api/checkout`
Create Stripe checkout session.

**Request Body:**
```json
{
  "priceId": "premium_monthly"
}
```

**Response (200):**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

---

### `POST /api/subscription/portal`
Get Stripe customer portal URL.

**Response (200):**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Login | 5 requests / 15 min |
| Register | 3 requests / hour |
| Password Reset | 3 requests / hour |
| API (general) | 60 requests / min |
| Check-ins | 30 requests / min |

---

## Webhooks

### `POST /api/webhooks/stripe`
Stripe webhook endpoint for subscription events.

**Events Handled:**
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

## SDK / Client Usage

```javascript
// Example: Fetch routines
const response = await fetch('/api/routines', {
  credentials: 'include', // Important: include cookies
});
const { routines } = await response.json();

// Example: Create check-in
const response = await fetch('/api/checkins', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    routineId: 'routine_id',
    taskId: 'task_id',
    checked: true,
  }),
});
```
