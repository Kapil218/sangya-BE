# Backend API (Video Platform)

Express + MongoDB backend for users, videos, comments, likes/dislikes, playlists, subscriptions, watch history, and live stream metadata.

## Tech Stack

- Node.js (ES modules)
- Express
- MongoDB + Mongoose
- JWT auth (access + refresh tokens)
- Cloudinary (image/video upload)
- Socket.IO

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas or local MongoDB server
- Cloudinary account (for media upload)

## 1) Install

```bash
npm install
```

## 2) Environment Setup

Create a `.env` file in project root (or copy values from `.env.example`).

Required keys:

```env
# Server
PORT=8000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>

# JWT
ACCESS_TOKEN=replace-with-a-long-random-secret
REFRESH_TOKEN=replace-with-a-different-long-random-secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Cookies
MAKE_COOKIE_SECURE=false

# Cloudinary
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

Notes:

- If your token expires, protected APIs return 401 and you must login again or call refresh token endpoint.
- Use `MAKE_COOKIE_SECURE=true` in HTTPS production environments.

## 3) Run the Server

### Backend only

```bash
npm run dev
```

### RTMP server only (nginx binary inside repo)

```bash
npm run dev:rtmp
```

### Run backend + RTMP together

```bash
npm run dev:all
```

Backend default URL:

- `http://localhost:8000`

## 4) API Base Path

- `http://localhost:8000/api/v1`

## 5) Authentication Behavior

- Login endpoint sets `accessToken` and `refreshToken` cookies.
- Protected routes require valid cookie token or `Authorization: Bearer <token>`.
- If token is expired, call refresh endpoint or login again.

## 6) Main Route Groups

### Users

- `POST /users/register`
- `POST /users/login`
- `POST /users/logout` (auth)
- `POST /users/refresh-token`
- `GET /users/getUser` (auth)
- `GET /users/current-user` (auth)
- `POST /users/change-password` (auth)
- `PATCH /users/update-account` (auth)
- `PATCH /users/avatar` (auth, file)
- `PATCH /users/cover-image` (auth, file)
- `GET /users/c/:username` (auth)
- `GET /users/history` (auth)

### Videos

- `GET /videos` (public list)
- `POST /videos` (auth, upload `videoFile` + `thumbnail`)
- `GET /videos/:videoId`
- `DELETE /videos/:videoId`
- `PATCH /videos/:videoId` (thumbnail upload)
- `PATCH /videos/toggle/publish/:videoId`
- `PATCH /videos/addView/:videoId`
- `GET /videos/suggestions`
- `GET /videos/myVideos` (auth)
- `GET /videos/subsVideos` (auth)

### Comments (auth middleware applied to all)

- `GET /comments/:videoId`
- `POST /comments/:videoId`
- `PATCH /comments/c/:commentId`
- `DELETE /comments/c/:commentId`

### Likes / Dislikes (auth)

- `POST /likes/toggle/v/:videoId`
- `POST /likes/toggle/c/:commentId`
- `GET /likes/videos`
- `GET /likes/isLiked/v/:videoId`
- `POST /dislikes/toggle/v/:videoId`
- `GET /dislikes/videos`
- `GET /dislikes/isDisliked/v/:videoId`

### Subscriptions (auth)

- `POST /subscriptions/:channelId`
- `GET /subscriptions/c/:subscriberId`
- `GET /subscriptions/s/:channelId`

### Playlists (auth)

- `POST /playlists`
- `GET /playlists/user/:userId`
- `POST /playlists/:playlistId/videos`
- `DELETE /playlists/:playlistId/videos/:videoId`
- `DELETE /playlists/:playlistId`

### Watch History (auth)

- `POST /watchHistory/add`
- `GET /watchHistory`
- `DELETE /watchHistory/clear`

### Stream

- `GET /stream/all`
- `GET /stream`
- `POST /stream`
- `DELETE /stream`

## 7) File Upload Notes

- Upload middleware stores temporary files under `uploads/temp`.
- Video publish expects multipart keys:
	- `videoFile`
	- `thumbnail`
- User avatar update expects `avatar`.
- User cover image update expects `coverImage`.

## 8) Common Troubleshooting

### MongoDB connection string error

Use a valid URI starting with:

- `mongodb://`
- `mongodb+srv://`

### `jwt expired`

- Login again, or call `POST /api/v1/users/refresh-token` if refresh token is still valid.

### Upload ENOENT file not found

- Ensure request is multipart/form-data.
- Ensure correct file keys are sent.
- Ensure Cloudinary env values are valid.

## 9) Quick Test Flow

1. Start server: `npm run dev`
2. Register: `POST /api/v1/users/register`
3. Login: `POST /api/v1/users/login`
4. Create video: `POST /api/v1/videos` with files
5. Get public videos: `GET /api/v1/videos`



