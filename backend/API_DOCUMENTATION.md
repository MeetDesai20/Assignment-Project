# Digital Heroes Golf Platform - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### 1. Signup
**POST** `/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "user"
    },
    "token": "jwt_token"
  }
}
```

### 2. Login
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "user"
    },
    "token": "jwt_token"
  }
}
```

### 3. Get Current User
**GET** `/auth/me`

Get authenticated user details.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user"
  }
}
```

---

## User Endpoints

### 4. Get User Profile
**GET** `/users/profile`

Get authenticated user's profile with subscription info.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "subscription": {
      "status": "active",
      "planType": "monthly",
      "renewalDate": "2026-05-20"
    }
  }
}
```

### 5. Update User Profile
**PUT** `/users/profile`

Update user profile information.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "fullName": "Jane Doe"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

### 6. Get All Users (Admin)
**GET** `/users?limit=50&offset=0`

Retrieve all users (admin only).

**Headers:** `Authorization: Bearer {admin_token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

---

## Score Endpoints

### 7. Add Golf Score
**POST** `/scores`

Add a new golf score. System keeps only last 5 scores.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "scoreValue": 35,
  "scoreDate": "2026-04-20",
  "course": "Tee Golf Club",
  "holes": 18,
  "stablefordPoints": 28
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Score added successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "score_value": 35,
    "score_date": "2026-04-20",
    "created_at": "2026-04-20T10:00:00Z"
  }
}
```

### 8. Get User's Scores
**GET** `/scores`

Get last 5 golf scores for authenticated user.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "score_value": 35, "score_date": "2026-04-20" },
    ...
  ]
}
```

### 9. Update Score
**PUT** `/scores/:scoreId`

Update an existing score.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "scoreValue": 38,
  "stablefordPoints": 31
}
```

### 10. Delete Score
**DELETE** `/scores/:scoreId`

Delete a score.

**Headers:** `Authorization: Bearer {token}`

---

## Charity Endpoints

### 11. Get All Charities
**GET** `/charities`

Get list of all active charities.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Save the Children",
      "description": "...",
      "logo_url": "https://...",
      "is_featured": true
    },
    ...
  ]
}
```

### 12. Get Featured Charities
**GET** `/charities/featured`

Get featured charities for homepage.

**Response (200):**
```json
{
  "success": true,
  "data": [...]
}
```

### 13. Get Charity by ID
**GET** `/charities/:charityId`

Get detailed info about a specific charity.

### 14. Create Charity (Admin)
**POST** `/charities`

Create a new charity listing.

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body:**
```json
{
  "name": "New Charity",
  "description": "Description...",
  "logoUrl": "https://...",
  "website": "https://...",
  "isFeatured": false
}
```

---

## Draw Endpoints

### 15. Get Current Draw
**GET** `/draws/current`

Get current month's draw information.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "draw_month": 4,
    "draw_year": 2026,
    "is_published": false,
    "status": "pending"
  }
}
```

### 16. Simulate Draw (Admin)
**POST** `/draws/:drawId/simulate`

Simulate the draw without publishing results.

**Headers:** `Authorization: Bearer {admin_token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "drawId": "uuid",
    "winningNumbers": [5, 12, 23, 34, 45],
    "simulatedAt": "2026-04-30T23:59:59Z"
  }
}
```

### 17. Publish Draw (Admin)
**POST** `/draws/:drawId/publish`

Publish official draw results.

**Headers:** `Authorization: Bearer {admin_token}`

### 18. Get Draw Results
**GET** `/draws/:drawId/results`

Get winners and results for a specific draw.

---

## Winner Endpoints

### 19. Get User's Winnings
**GET** `/winners/my-winnings`

Get all winnings for authenticated user.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "draw_id": "uuid",
      "match_type": "5",
      "prize_amount": 5000,
      "status": "pending",
      "created_at": "2026-04-20T00:00:00Z"
    },
    ...
  ]
}
```

### 20. Submit Proof (Winner Verification)
**POST** `/winners/:winnerId/proof`

Submit proof screenshot for verification.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "proofUrl": "https://storage.example.com/proof.jpg"
}
```

### 21. Get Pending Verifications (Admin)
**GET** `/winners/pending`

Get all pending winner verifications.

**Headers:** `Authorization: Bearer {admin_token}`

### 22. Verify Winner (Admin)
**PUT** `/winners/:winnerId/verify`

Approve or reject a winner verification.

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body:**
```json
{
  "isVerified": true
}
```

### 23. Mark as Paid (Admin)
**PUT** `/winners/:winnerId/paid`

Mark a verified winner as paid.

**Headers:** `Authorization: Bearer {admin_token}`

---

## Subscription Endpoints

### 24. Get Current Subscription
**GET** `/subscriptions/current`

Get user's active subscription.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "plan_type": "monthly",
    "status": "active",
    "renewal_date": "2026-05-20",
    "price_amount": 49.99
  }
}
```

### 25. Create Checkout Session
**POST** `/subscriptions/checkout`

Create Razorpay subscription checkout session.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "planType": "monthly"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_...",
    "shortUrl": "https://rzp.io/...",
    "keyId": "rzp_test_...",
    "amount": 4999,
    "currency": "INR"
  }
}
```

### 26. Verify Subscription Payment
**POST** `/subscriptions/verify`

Verify Razorpay checkout payment signature and activate the subscription.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "razorpayPaymentId": "pay_...",
  "razorpaySubscriptionId": "sub_...",
  "razorpaySignature": "generated_signature"
}
```

### 27. Cancel Subscription
**POST** `/subscriptions/cancel`

Cancel active subscription.

**Headers:** `Authorization: Bearer {token}`

---

## Error Responses

All errors follow this format:

**Response (400/401/403/404/500):**
```json
{
  "success": false,
  "message": "Error message here"
}
```

### Common Error Codes
- `400` - Bad Request / Validation Error
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting
Not currently implemented. Will be added in production.

## Webhook
Razorpay webhooks are handled at `POST /api/subscriptions/webhook`

---

## Environment Variables Required
```
SUPABASE_URL=
SUPABASE_KEY=
JWT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PLAN_ID_MONTHLY=
RAZORPAY_PLAN_ID_YEARLY=
FRONTEND_URL=http://localhost:3000
```
