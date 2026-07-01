# Taskflow — Secure Task Management API

A REST API with JWT authentication, role-based access control, and full task CRUD, built as a Backend Developer Intern assignment. Includes a React frontend to demo the APIs live.

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| Frontend | React + Vite |
| API Docs | Postman collections |

## Features

- User registration & login with hashed passwords (bcrypt)
- JWT-based authentication on all protected routes
- Role-based access control (`user` vs `admin`)
- Task CRUD scoped to the logged-in user, with ownership checks
- Admin-only endpoint to view/manage all users' tasks
- Pagination and status filtering on task lists
- Rate limiting on auth routes (brute-force protection)
- Security headers via Helmet, CORS configured
- Consistent JSON response shape and centralized 404 handling
- API versioning (`/api/v1`)

## Project Structure
```text
project-name/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── postman/
│   │   ├── Auth.postman_collection.json
│   │   └── Tasks.postman_collection.json
│   ├── server.js
│   └── .env (not committed)
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── api.js
    │   └── index.css
    └── vite.config.js
```

## Setup

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
PORT=5000
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=30d

Run:

```bash
npm run dev
```

Server runs at `http://localhost:5000`. Health check: `GET /api/v1/health`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. Make sure the backend is running first.

## API Documentation

Import the collections from `backend/postman/` into Postman:
- `Auth.postman_collection.json` — register, login, get current user
- `Tasks.postman_collection.json` — create, read, update, delete, admin view
### Route summary

| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| GET | `/auth/me` | Authenticated |
| POST | `/tasks` | Authenticated |
| GET | `/tasks` | Authenticated (own tasks) |
| GET | `/tasks/:id` | Owner or admin |
| PUT | `/tasks/:id` | Owner or admin |
| DELETE | `/tasks/:id` | Owner or admin |
| GET | `/tasks/all` | Admin only |

### Postman

Import `backend/postman/Auth.postman_collection.json` and `Tasks.postman_collection.json`. Run **Login** first — the token is saved automatically into an environment variable and reused by every other request.

## Security Practices

- Passwords hashed with bcrypt, never stored in plain text
- JWTs signed with a secret stored in environment variables, never committed to code
- Rate limiting on login/register to slow brute-force attempts
- Helmet sets secure HTTP headers; CORS restricts cross-origin access
- Ownership checks on every task route — users can't read/edit/delete tasks they don't own; only admins can override

## Scalability Notes

This is a small monolith by design, but the structure anticipates growth:

- **Caching**: Frequently-read, rarely-changed data (e.g. a user's task list) is a good candidate for Redis caching with short TTLs, reducing database load as traffic grows.
- **Database indexing**: `email` is already unique-indexed on the User model; a compound index on `{ user, status }` in the Task model would keep filtered queries fast as the collection grows.
- **Horizontal scaling**: JWTs are stateless (no server-side session storage), so the API can run as multiple instances behind a load balancer with no session-affinity requirement.
- **Microservices path**: Auth and Tasks are already separated into their own controllers/routes — a natural seam to split into independent services later.
- **Rate limiting** is currently per-instance; at scale this would move to a shared Redis-backed store so limits apply consistently across multiple servers.

## Author

Built by [Tarun Barfa] as a Backend Developer Intern assignment.