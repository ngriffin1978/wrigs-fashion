# API Documentation

Complete API reference for Wrigs Fashion backend endpoints.

## Authentication Endpoints

### POST `/api/auth/register`
Create user account with Better Auth.
- **Body:** `{ email, password, name }`
- **Returns:** userId, session cookie
- **Side effects:** Migrates anonymous catalogs to user account

### POST `/api/auth/login`
Authenticate user.
- **Body:** `{ email, password }`
- **Returns:** Session cookie

### POST `/api/auth/logout`
Destroy session and clear cookies.
- **Returns:** Success message

## Upload & Processing

### POST `/api/upload`
Upload and process image with Sharp.js.
- **Body:** FormData with image file
- **Returns:** `{ originalUrl, cleanedUrl }`
- **Limits:** 10MB max, JPG/PNG/HEIC formats

### POST `/api/generate-pdf`
Generate paper doll PDF.
- **Body:** `{ templateId, designUrl, placement, paperSize }`
- **Returns:** PDF download URL

## Design Management (Auth Required)

### POST `/api/designs`
Save design to portfolio.
- **Body:** `{ title, originalImageUrl, cleanedImageUrl, coloredOverlayUrl }`
- **Returns:** Design object with ID

### DELETE `/api/designs/[id]`
Delete design from portfolio.
- **Returns:** Success message

## Catalog Endpoints

### GET `/api/catalogs`
List catalogs for session/user.
- **Returns:** Array of catalog objects

### POST `/api/catalogs`
Create new catalog.
- **Body:** `{ title, backgroundColor, backgroundPattern }`
- **Returns:** Catalog object with ID

### GET `/api/catalogs/[id]`
Get catalog by ID.
- **Returns:** Catalog object with items

### PATCH `/api/catalogs/[id]`
Update catalog (title, background).
- **Body:** `{ title?, backgroundColor?, backgroundPattern? }`
- **Returns:** Updated catalog object

### DELETE `/api/catalogs/[id]`
Delete catalog.
- **Returns:** Success message

### POST `/api/catalogs/[id]/items`
Add item to catalog.
- **Body:** `{ imageUrl, positionX, positionY, width, height, rotation, zIndex }`
- **Returns:** Catalog item object

### PATCH `/api/catalogs/[id]/items/[itemId]`
Update item position/size/rotation.
- **Body:** `{ positionX?, positionY?, width?, height?, rotation?, zIndex? }`
- **Returns:** Updated item object

### DELETE `/api/catalogs/[id]/items/[itemId]`
Remove item from catalog.
- **Returns:** Success message

### POST `/api/catalogs/[id]/share`
Generate shareable link.
- **Returns:** `{ shareUrl, shareSlug }`

## Circle Management (Auth Required)

### GET `/api/circles`
List all circles user is part of (owned or member).
- **Returns:** Array of circle objects with member counts

### POST `/api/circles`
Create new circle with auto-generated invite code.
- **Body:** `{ name }`
- **Returns:** Circle object with inviteCode

### GET `/api/circles/[id]`
Get circle details with members and shared items.
- **Returns:** Circle object with members array and sharedItems array

### PATCH `/api/circles/[id]`
Update circle name (owner only).
- **Body:** `{ name }`
- **Returns:** Updated circle object

### DELETE `/api/circles/[id]`
Delete circle (owner only, cascades to members).
- **Returns:** Success message

### GET `/api/circles/[id]/members`
List members with user details.
- **Returns:** Array of member objects with user data

### DELETE `/api/circles/[id]/members`
Remove member (owner can remove anyone).
- **Body:** `{ userId }`
- **Returns:** Success message

### POST `/api/circles/[id]/leave`
Leave circle (members only, owner cannot leave).
- **Returns:** Success message

### GET `/api/circles/[id]/items`
Get shared items with hydrated design/doll data.
- **Returns:** Array of shared items with full design/doll objects

### DELETE `/api/circles/[id]/items`
Remove shared item (sharer or owner).
- **Body:** `{ sharedItemId }`
- **Returns:** Success message

### POST `/api/circles/[id]/share`
Share single item to one circle.
- **Body:** `{ itemType: 'design'|'doll', itemId }`
- **Returns:** Shared item object

### POST `/api/circles/join`
Join circle via invite code (case-insensitive).
- **Body:** `{ inviteCode }`
- **Returns:** Circle object

## Sharing Endpoints (Auth Required)

### POST `/api/share`
Batch share to multiple circles at once.
- **Body:** `{ itemType: 'design'|'doll', itemId, circleIds: string[] }`
- **Returns:** Array of created shared item objects

### GET `/api/shared-items/[id]`
Get single shared item with full details.
- **Returns:** Shared item with design/doll data, reactions, compliments

### POST `/api/shared-items/[id]/react`
Toggle emoji reaction on shared item.
- **Body:** `{ reactionType: string }` (emoji)
- **Returns:** `{ added: boolean }` (true if added, false if removed)

### GET `/api/shared-items/[id]/reactions`
Get all reactions/compliments with user data.
- **Returns:** `{ reactions: [], compliments: [] }` with user details

### POST `/api/shared-items/[id]/compliment`
Add preset compliment to shared item.
- **Body:** `{ complimentType: string }`
- **Returns:** Compliment object

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Authentication

All endpoints requiring authentication check for `locals.user` from Better Auth session. Unauthenticated requests to protected endpoints return 401 Unauthorized with redirect to `/auth/login`.

## Rate Limiting

Not yet implemented (planned for Phase 6).

## CORS

Not configured (same-origin only).
