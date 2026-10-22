# Personal Notes App

A secure, full-stack personal note-taking web application built as part of Mini-Project 1 (Cubrics). Every user can securely create, edit, delete, search, tag, and pin notes with strict user-specific data isolation.

---

## 🔗 Live Links

- **Frontend Application:** [https://personal-notes-app.vercel.app](https://personal-notes-app.vercel.app) *(Replace with your deployed frontend URL)*
- **Backend API:** [https://personal-notes-api.onrender.com](https://personal-notes-api.onrender.com) *(Replace with your deployed backend URL)*

---

## 🚀 Features

- **User Authentication & Isolation:** Secure signup and login powered by JSON Web Tokens (JWT) and salted bcrypt password hashing. Strict data isolation guarantees that users can only ever view, search, modify, or delete their own notes.
- **Create Notes:** Quick note creation with title, body content, tags, and pin preference.
- **Edit Notes:** In-place editing via responsive modal pre-populated with existing note data.
- **Delete Notes:** Confirmation safeguard before deletion to prevent accidental loss.
- **Pin Notes:** One-click pin/unpin toggle. Pinned notes automatically appear prioritized at the top of the list.
- **Live Search with Debounce:** Real-time search across note titles and contents with a 400ms debounce to prevent API spamming.
- **Tag Filtering:** Categorize notes with custom tags (up to 10 unique tags per note) and filter notes instantly by clicking tag chips.
- **Form Validation & Feedback:** Comprehensive client- and server-side validation with inline error messaging and character limit counters.
- **Loading & Empty States:** Polished spinners, loading indicators, and informative empty state screens for new accounts and unmatched searches.
- **Responsive Design:** Mobile-first layout optimized for smartphones, tablets, and desktop displays.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite build tool)
- **React Router v6** (Client-side routing with `ProtectedRoute`)
- **Axios** (HTTP client with JWT request/response interceptors)
- **Vanilla CSS3** (Custom responsive design with modern design system and Inter typography)

### Backend
- **Node.js & Express** (RESTful API architecture)
- **MongoDB & Mongoose** (Schema modeling, indexing, and validation)
- **JSON Web Tokens (jsonwebtoken)** (Stateless authentication)
- **bcryptjs** (Cryptographic password hashing)
- **CORS & Dotenv** (Cross-origin configuration and environment variable management)

---

## 📸 Screenshots & UI Preview

```
+-----------------------------------------------------------------------------------+
|  📝 Personal Notes                   Search notes... [🔍]    Hello, Alice [Logout]|
+-----------------------------------------------------------------------------------+
|  [Filter by tag: All | #work | #meeting | #personal]      [📌 Pinned Only] [+ New]|
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  📌 Pinned Notes                                                                  |
|  +------------------------------+  +------------------------------+               |
|  | Sprint Planning        [📌]  |  | Server Architecture     [📌] |               |
|  | Discuss API contract and     |  | Express + MongoDB setup with |               |
|  | deadlines with the team.     |  | owner-scoped query security. |               |
|  | #work #meeting               |  | #cubrics #backend            |               |
|  | Updated: Oct 22  [✏️] [🗑️]   |  | Updated: Oct 22  [✏️] [🗑️]   |               |
|  +------------------------------+  +------------------------------+               |
|                                                                                   |
|  Other Notes                                                                      |
|  +------------------------------+                                                 |
|  | Grocery List           [📍]  |                                                 |
|  | Milk, eggs, coffee beans.    |                                                 |
|  | #personal                    |                                                 |
|  | Updated: Oct 22  [✏️] [🗑️]   |                                                 |
|  +------------------------------+                                                 |
+-----------------------------------------------------------------------------------+
```

---

## 📁 Folder Structure

```
notes-app/
├── server/
│   ├── config/
│   │   └── db.js                  # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js       # Register, login, getMe controllers
│   │   └── noteController.js       # Notes CRUD and filter controllers
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification & req.user attachment
│   │   └── errorHandler.js         # Centralized error response handler
│   ├── models/
│   │   ├── Note.js                 # Note schema with indexes & sanitizers
│   │   └── User.js                 # User schema with password hashing
│   ├── routes/
│   │   ├── authRoutes.js           # Auth endpoints (/api/auth)
│   │   └── noteRoutes.js           # Protected note endpoints (/api/notes)
│   ├── tests/
│   │   └── api.test.js             # Automated test suite covering Section 7.1
│   ├── .env                        # Server secrets (git ignored)
│   ├── .env.example                # Example environment variables
│   ├── package.json
│   └── server.js                   # Express application entrypoint
├── client/
│   ├── public/
│   │   └── _redirects              # Netlify SPA redirect rule
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # Axios client with JWT interceptor
│   │   ├── components/
│   │   │   ├── Loader.jsx          # Reusable spinner loader
│   │   │   ├── NoteCard.jsx        # Note presentation card with actions
│   │   │   ├── NoteForm.jsx        # Note creation and editing modal
│   │   │   ├── ProtectedRoute.jsx  # Auth guard route wrapper
│   │   │   ├── SearchBar.jsx       # Debounced search bar input
│   │   │   └── TagFilter.jsx       # Interactive tag chip filter list
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Authentication context provider
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main dashboard with notes grid
│   │   │   ├── Login.jsx           # User login page
│   │   │   └── Register.jsx        # User registration page
│   │   ├── App.jsx                 # Routing configuration
│   │   ├── main.jsx                # React root mount
│   │   └── style.css               # Responsive design stylesheet
│   ├── .env                        # Client environment configuration
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vercel.json                 # Vercel SPA rewrite rule
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/personal-notes-app.git
cd personal-notes-app
```

### 2. Configure Backend Environment
Navigate to `server/`:
```bash
cd server
npm install
cp .env.example .env
```
Edit `server/.env` with your values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/notes-app
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Configure Frontend Environment
Navigate to `client/`:
```bash
cd ../client
npm install
cp .env.example .env
```
Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Running the Project Locally

**Run Backend Server:**
```bash
cd server
npm run dev
# Server will run on http://localhost:5000
```

**Run Frontend Client:**
```bash
cd client
npm run dev
# Client will run on http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend (`server/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Port for the Express server to listen on | `5000` |
| `MONGO_URI` | MongoDB connection URI (Atlas or Local) | `mongodb://localhost:27017/notes-app` |
| `JWT_SECRET` | Secret key used for signing JWT tokens | `supersecretjwtkey_notesapp_2026` |
| `JWT_EXPIRES_IN` | Lifespan of generated JWT token | `7d` |
| `CLIENT_URL` | Allowed origin for CORS | `http://localhost:5173` |

### Frontend (`client/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base endpoint URL for the backend API | `http://localhost:5000/api` |

---

## 📖 REST API Documentation

All notes endpoints are protected and require the `Authorization` header:
```
Authorization: Bearer <token>
```

### Authentication Endpoints

#### `POST /api/auth/register`
Create a new user account.
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "665f1b7e9b1e8a0012a4d3e0",
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```

#### `POST /api/auth/login`
Authenticate existing user.
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "665f1b7e9b1e8a0012a4d3e0",
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```

#### `GET /api/auth/me`
Retrieve currently logged-in user profile.
- **Response (200 OK):**
  ```json
  {
    "_id": "665f1b7e9b1e8a0012a4d3e0",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "createdAt": "2026-10-22T08:00:00.000Z",
    "updatedAt": "2026-10-22T08:00:00.000Z"
  }
  ```

---

### Notes Endpoints

#### `GET /api/notes`
Retrieve notes belonging to the authenticated user.
- **Query Parameters (Optional & Combinable):**
  - `?search=term` (Case-insensitive match against title or content)
  - `?tag=work` (Filter notes containing the specified tag)
  - `?pinned=true` (Filter to retrieve only pinned notes)
- **Response (200 OK):**
  ```json
  [
    {
      "_id": "665f1c2a9b1e8a0012a4d3f1",
      "user": "665f1b7e9b1e8a0012a4d3e0",
      "title": "Sprint planning",
      "content": "Discuss API contract and deadlines.",
      "tags": ["work", "meeting"],
      "pinned": true,
      "createdAt": "2026-10-22T09:15:00.000Z",
      "updatedAt": "2026-10-22T09:15:00.000Z"
    }
  ]
  ```

#### `POST /api/notes`
Create a new note for the authenticated user.
- **Request Body:**
  ```json
  {
    "title": "Sprint planning",
    "content": "Discuss API contract and deadlines.",
    "tags": ["work", "meeting"],
    "pinned": true
  }
  ```
- **Response (201 Created):** Returns created note JSON object.

#### `PUT /api/notes/:id`
Update an existing note owned by the authenticated user.
- **Request Body:** Any subset of `{ "title", "content", "tags", "pinned" }`
- **Response (200 OK):** Returns updated note JSON object.

#### `DELETE /api/notes/:id`
Delete a note owned by the authenticated user.
- **Response (200 OK):**
  ```json
  {
    "message": "Note deleted successfully",
    "id": "665f1c2a9b1e8a0012a4d3f1"
  }
  ```

---

### Standard Error Format
All errors return consistent JSON:
```json
{
  "message": "Human readable explanation"
}
```

| HTTP Code | Reason |
| :--- | :--- |
| **400** | Validation failure (missing title, invalid email, title > 100 chars, invalid ID format) |
| **401** | Missing, invalid, or expired JWT token; bad credentials |
| **404** | Note not found or note belongs to a different user |
| **409** | Email already registered |
| **500** | Unexpected internal server error |

---

## 🔒 Security Architecture

1. **Owner-Scoped Queries:** All note operations enforce user isolation at the database query level:
   ```javascript
   Note.find({ user: req.user._id })
   Note.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, ...)
   Note.findOneAndDelete({ _id: req.params.id, user: req.user._id })
   ```
2. **Immutable User Ownership:** The `user` field cannot be altered or injected via request bodies. It is strictly injected from verified JWT credentials via `req.user._id`.
3. **Password Security:** Passwords are hashed with cryptographic salt using `bcryptjs` before storage. The `password` field has `select: false` on the Mongoose schema so it is never accidentally included in queries.
4. **JWT Expiration & Client Auto-Logout:** Tokens expire after the designated period. The Axios client response interceptor automatically purges expired credentials and redirects to `/login` upon receiving a 401 response.
5. **Input Sanitization & Whitelisting:** Tags are trimmed, lowercased, and deduplicated automatically. Only explicitly whitelisted fields (`title`, `content`, `tags`, `pinned`) can be updated.

---

## 🧪 Testing

The backend includes an automated test suite verifying all 18 test cases specified in the project checklist:

```bash
cd server
npm test
```

### Test Results Summary
- `[PASS]` Register with valid data (201 + token)
- `[PASS]` Register with duplicate email (409)
- `[PASS]` Register with invalid email or short password (400)
- `[PASS]` Login with correct credentials (200 + token)
- `[PASS]` Login with wrong password (401)
- `[PASS]` GET /api/notes without token (401)
- `[PASS]` GET /api/notes with valid token (200 + user-specific notes only)
- `[PASS]` POST /api/notes with valid body (201 + note object)
- `[PASS]` POST /api/notes without title (400)
- `[PASS]` PUT /api/notes/:id on own note (200 + updated note)
- `[PASS]` PUT /api/notes/:id on another user's note (404)
- `[PASS]` DELETE /api/notes/:id on own note (200)
- `[PASS]` DELETE /api/notes/:id on another user's note (404)
- `[PASS]` Request with invalid note ID format (400 or 404, no crash)
- `[PASS]` Search filter (`?search=`) returns matching notes only
- `[PASS]` Tag filter (`?tag=`) returns matching tagged notes only
- `[PASS]` Pinned notes appear first in list order
- `[PASS]` Request body attempting to inject different user ID is ignored

---

## 🌐 Deployment Instructions

### Backend (Render or Railway)
1. Push this repository to GitHub.
2. In Render / Railway, create a new **Web Service** connected to your repository with root directory set to `server`.
3. Set the build command: `npm install` and start command: `npm start`.
4. Configure environment variables in the dashboard:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret.
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: URL of your deployed frontend (e.g. `https://your-app.vercel.app`).
5. Ensure your MongoDB Atlas Network Access allows connections from `0.0.0.0/0`.

### Frontend (Vercel or Netlify)
1. In Vercel / Netlify, import the repository with root directory set to `client`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`, Output Directory: `dist`.
4. Set Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL with `/api` (e.g. `https://your-api.onrender.com/api`).
5. The included `vercel.json` and `_redirects` ensure client-side routes will never 404 on page reload.

---

## 🔮 Future Improvements

*(Out of scope for Mini-Project 1, recommended for future releases)*
- Rich-text markdown / WYSIWYG note editing
- Multi-user note collaboration and sharing via links
- File and image attachments with AWS S3 / Cloudinary
- Note reminders and push notifications
- Offline synchronization via IndexedDB / Service Workers

---

## 👤 Author
Developed for **Mini-Project 1: Personal Notes App (Cubrics)**.
