# Developer Job Tracker

A full-stack portfolio project for tracking software-engineering job applications, interview progress, recruiter contacts, follow-ups, and offers.

## Current Milestone: OpenAPI Documentation & Continuous Integration

The project now includes interactive OpenAPI/Swagger documentation and an automated GitHub Actions CI pipeline. The pipeline verifies backend tests, frontend lint/build health, and Docker Compose configuration on pushes and pull requests while preserving the existing JWT-secured multi-user architecture.

### API documentation & CI

- OpenAPI 3 documentation generated from the Spring Boot API
- Interactive Swagger UI with JWT bearer authorization support
- Raw OpenAPI JSON at `/v3/api-docs`
- Public Swagger documentation endpoints while business APIs remain protected
- GitHub Actions backend verification with Java 21 and Maven
- GitHub Actions frontend lint + production build with Node.js 24
- Docker Compose configuration validation in CI
- Read-only workflow permissions

### Authentication & security

- Account registration and login
- BCrypt password hashing
- Signed HS256 JWT access tokens
- Stateless Spring Security configuration
- Protected application, statistics, and reminder endpoints
- Per-user data ownership at the persistence/query layer
- Account restoration through `/api/auth/me`
- Automatic frontend sign-out when an authenticated session expires
- Duplicate-email and invalid-credential handling
- JWT secret supplied through environment configuration

### Frontend features

- Dedicated sign-in/create-account experience
- Authenticated account header and sign-out
- Dashboard statistics for total applications and key pipeline stages
- Needs Attention dashboard for overdue and due-today follow-ups
- One-click follow-up actions: tomorrow, +7 days, mark done, or open application
- Drag-and-drop Kanban pipeline with grouped workflow stages
- Persistent Board/Table view switcher
- Search by company or role
- Filter by application status
- Add and edit applications through a validated modal form
- Inline application-status updates
- Job-posting links
- Salary-range tracking
- Applied and follow-up dates
- Recruiter/contact tracking
- Overdue follow-up indicators
- Responsive desktop/mobile layout
- API error handling and optimistic status updates

### Backend features

- Create, read, update, and delete job applications
- User-scoped persistence and ownership checks
- Application status workflow
- Company/role search
- Status filtering
- Follow-up dates and recruiter/contact information
- Due/overdue follow-up API that excludes closed applications
- Lightweight follow-up rescheduling endpoint
- Salary range tracking and validation
- Dashboard statistics by status
- Structured validation, authentication, duplicate-account, and 404 errors
- PostgreSQL persistence
- Spring Boot Actuator health endpoint
- OpenAPI 3 / Swagger UI documentation
- Unit tests for auth behavior and per-user application isolation

## Stack

### Frontend
- React 19
- TypeScript
- Vite
- Responsive CSS
- Nginx production container

### Backend
- Java 21
- Spring Boot 4.1
- Spring MVC
- Spring Security
- OAuth2 Resource Server JWT support
- Spring Data JPA / Hibernate
- PostgreSQL
- Jakarta Bean Validation
- JUnit 5 / Mockito

### DevOps
- GitHub Actions CI
- Docker
- Docker Compose
- Nginx reverse proxy
- Environment-based secrets/configuration

## Architecture

```text
Browser
   |
   v
React + TypeScript UI
   |
   |  Bearer JWT
   v
Nginx / API proxy
   |
   v
Spring Security
   |
   v
Spring Boot REST API
   |
   v
Service Layer
   |
   v
User-scoped Spring Data JPA queries
   |
   v
PostgreSQL
```

## Authentication Flow

```text
Register / Login
      |
      v
BCrypt credential verification
      |
      v
Signed JWT returned to client
      |
      v
Authorization: Bearer <token>
      |
      v
Spring Security validates JWT
      |
      v
API queries only the authenticated user's rows
```

## API Endpoints

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create account and receive JWT |
| POST | `/api/auth/login` | Public | Authenticate and receive JWT |
| GET | `/api/auth/me` | Authenticated | Restore current account profile |
| GET | `/api/applications` | Authenticated | List current user's applications |
| GET | `/api/applications?status=INTERVIEW` | Authenticated | Filter by status |
| GET | `/api/applications?search=engineer` | Authenticated | Search company or role |
| GET | `/api/applications/{id}` | Authenticated | Get owned application |
| POST | `/api/applications` | Authenticated | Create application for current user |
| PUT | `/api/applications/{id}` | Authenticated | Replace owned application details |
| PATCH | `/api/applications/{id}/status` | Authenticated | Update only status |
| PATCH | `/api/applications/{id}/follow-up` | Authenticated | Reschedule or clear follow-up |
| DELETE | `/api/applications/{id}` | Authenticated | Delete owned application |
| GET | `/api/applications/stats` | Authenticated | Current user's dashboard counts |
| GET | `/api/applications/attention` | Authenticated | Current user's due follow-ups |
| GET | `/v3/api-docs` | Public | OpenAPI JSON specification |
| GET | `/swagger-ui.html` | Public | Interactive Swagger API documentation |
| GET | `/actuator/health` | Public | Health check |

## Status Workflow

`WISHLIST → APPLIED → PHONE_SCREEN → INTERVIEW → TECHNICAL_INTERVIEW → OFFER`

Applications can also end as `REJECTED` or `WITHDRAWN`.

## Run the Full Stack with Docker

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- Health check: `http://localhost:8080/actuator/health`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

Create an account from the frontend before using protected application endpoints.

> The Docker Compose JWT secret is intentionally a local-development value. Replace `JWT_SECRET` with a strong random secret before any public deployment.

## Run Frontend for Local Development

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` requests to the backend running at `http://localhost:8080`.

## Run Backend for Local Development

Start PostgreSQL, configure the environment values shown in `.env.example`, then run the Spring Boot application from the `backend` directory using Maven or your IDE.

If you previously ran a pre-authentication milestone and stored local data, using a fresh development database/volume is the simplest upgrade path because applications now require an owning user account.

## Continuous Integration

The repository includes `.github/workflows/ci.yml`. On pushes to `main` and on pull requests it runs three independent checks:

1. **Backend tests** — Java 21 + Maven `verify`
2. **Frontend quality** — npm dependency install, ESLint, and production Vite build
3. **Container configuration** — `docker compose config --quiet`

The workflow intentionally uses read-only repository permissions.

## Planned Next Milestones

- Database migrations with Flyway
- Integration tests with Testcontainers
- Cloud deployment

## Author

**Nicholas Cornes**  
Software Engineer · B.S. Software Engineering
