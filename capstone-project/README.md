# Full-Stack Template

A simple full-stack starter for class projects.

- **Back-end:** Spring Boot + MongoDB
- **Front-end:** Next.js

## Prerequisites

- Java 17+
- Maven
- Node.js 18+
- MongoDB running locally on port 27017

## Running the Back-End

```bash
cd back-end
mvn spring-boot:run
```

The server starts on **http://localhost:8080**.

### API Routes

| Method | Path        | Description                              |
|--------|-------------|------------------------------------------|
| POST   | `/register` | Create a new user                        |
| POST   | `/login`    | Login — sets an `auth` cookie on success |
| GET    | `/user`     | Get the logged-in user (requires cookie) |

**Request / Response shape:**

```json
{ "userName": "alice", "password": "secret" }
```

```json
{ "status": true, "data": { "userName": "alice" }, "error": null }
```

## Running the Front-End

```bash
cd front-end
npm install
npm run dev
```

The app starts on **http://localhost:3000**.

Requests to `/api/*` are proxied to the back-end at `http://localhost:8080/*`.

## Project Structure

```
back-end/
  src/main/java/edu/sfsu/app/
    AppApplication.java          # Spring Boot entry point
    controller/AuthController.java  # All three routes
    model/User.java              # User document
    model/AuthToken.java         # Session token document
    repository/UserRepository.java
    repository/AuthTokenRepository.java
  src/main/resources/
    application.properties       # Port + MongoDB URI

front-end/
  src/app/
    page.js          # Root: redirects to /login or /dashboard
    login/page.js    # Login + register form
    dashboard/page.js  # Protected page — shows logged-in user
```

## How Authentication Works

1. **Register** — hashes the password with SHA-256 and saves the user to MongoDB.
2. **Login** — verifies the password hash, creates an `AuthToken` in MongoDB, and sends an `auth` cookie to the browser.
3. **GET /user** — reads the `auth` cookie, looks up the token, and returns the user's info.
4. **Logout** — the front-end clears the cookie and redirects to `/login`.
