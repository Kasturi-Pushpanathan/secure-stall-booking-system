# Secure Book Fair Stall Reservation System

## 1. Project Overview
This project is a security-enhanced **Book Fair Stall Reservation System** developed as part of the Secure Web Application Development assessment. 

The application utilizes a decoupled, distributed microservice architecture consisting of a **React frontend**, a **Spring Boot REST API**, a **MySQL database**, and a **Python-based FastAPI recommendation service**. 

To meet modern security requirements, user authentication has been migrated from a weak custom database password model to **Auth0 (a cloud-based Identity Provider)** utilizing **OpenID Connect (OIDC)** and **OAuth 2.0 Authorization Code Flow with PKCE**. The Spring Boot backend operates as an OAuth 2.0 Resource Server that validates JWT access tokens cryptographically. 

The application addresses critical OWASP Top 10 vulnerabilities by implementing:
- Server-side Role-Based Access Control (RBAC) and strict ownership filters.
- Secure transport layer (HTTPS/TLS) for both frontend and backend.
- SQL injection prevention via Spring Data JPA parameterized queries.
- Input validation using Jakarta Bean Validation.
- Sanitized exception handling to prevent server stack trace leakage.
- Security-auditing logs for all critical transactions.

---

## 2. System Architecture
```text
      +----------------------------+
      |       React SPA            |
      |   (https://localhost:5173) |
      +----------------------------+
         ^                      ^
         |                      | OIDC / OAuth 2.0 + PKCE
         | HTTPS                v
         |            +-------------------------+
         |            |         Auth0           |
         |            |   Identity Provider     |
         |            +-------------------------+
         v
      +----------------------------+
      |      Spring Boot API       |
      |   (https://localhost:8080) |
      +----------------------------+
         |                      |
         | JDBC / JPA           | HTTP (Internal REST)
         v                      v
      +------------------+    +----------------------------+
      |  MySQL Database  |    |     FastAPI ML Service     |
      | (localhost:3306) |    |   (http://127.0.0.1:8003)  |
      +------------------+    +----------------------------+
```

### Technology Stack
* **Frontend**: React (v19), Vite, Tailwind CSS, Native OIDC/PKCE Service
* **Backend**: Java 17+, Spring Boot 3.3.2, Spring Security, Spring Data JPA, Hibernate, Jakarta Validation, Spring WebSocket (STOMP)
* **Database**: MySQL 8.0+
* **Authentication**: Auth0, OpenID Connect (OIDC), OAuth 2.0, Authorization Code Flow with PKCE, JWT Bearer Tokens
* **ML Service**: FastAPI, Uvicorn, Scikit-Learn, Joblib, Pandas

---

## 3. User Roles
The application enforces strict boundaries between two primary security roles:

### STALL_VENDOR
Stall vendors are the clients of the book fair. They can:
- Authenticate securely via the Auth0 OIDC flow.
- Retrieve and view their own profile details.
- Create stall reservation requests selecting an exhibition event, preferred stall type, size, category, and entering comments.
- View and track only their own stall reservation requests.
- Cancel their own pending reservations before the cancellation deadline.

*Access Control Rule*: A stall vendor is completely restricted from reading, modifying, or deleting other vendors' reservations. If a vendor attempts to manipulate a reservation ID in the request parameters, the server rejects it.

### EXHIBITION_ORGANIZER (ADMIN)
Exhibition organizers manage the physical book fair venue. They can:
- Log in and view the administrative dashboard.
- Create and schedule book fair events and layout grids.
- Block or unblock specific stalls dynamically on the floor map.
- View all stall reservation requests submitted by all vendors.
- Approve, reject, or refund reservation requests.
- Deactivate vendors or cancel any active bookings.

*Access Control Rule*: Administrative endpoints are strictly secured on the server. Any attempt by a regular vendor to access organizer paths returns a HTTP `403 Forbidden` response.

---

## 4. Authentication and Authorization

### OIDC Authorization Code Flow with PKCE
The authentication lifecycle is delegated entirely to a cloud-based Identity Provider (Auth0):
1. **Initiation**: The React frontend creates a random `code_verifier` and computes its cryptographic hash (`code_challenge`).
2. **Redirect**: The browser redirects to Auth0's `/authorize` endpoint passing the code challenge, client ID, requested scopes (`openid profile email`), and redirect URI.
3. **Login**: The user authenticates on Auth0's secure hosted login page.
4. **Callback**: Auth0 redirects back to the React app's `/callback` route with an authorization `code`.
5. **Token Exchange**: The frontend sends a POST request to Auth0's `/oauth/token` containing the authorization code and the initial `code_verifier`. 
6. **Token Injection**: The frontend stores the returned JWT `access_token` and inserts it in the `Authorization: Bearer <access-token>` header for all API calls.

### Backend JWT Validation & JIT Provisioning
The Spring Boot backend acts as a stateless **OAuth 2.0 Resource Server**:
- On every request, `JwtAuthFilter` extracts the Bearer token.
- If `app.security.type` is set to `oidc`, Spring Security's `JwtDecoder` verifies the signature against Auth0's JSON Web Key Set (JWKS), ensuring the issuer, audience, and expiration constraints are valid.
- The filter extracts the authenticated user's `email` claim from the validated token.
- **Just-In-Time (JIT) Provisioning**: If a user record matching the OIDC email does not exist in the local database, the filter automatically inserts a new record in the `users` table, dynamically mapping them to `ROLE_VENDOR` (or `ROLE_ADMIN` if configured in the admin email list).
- The principal is set using the provisioned user's local database ID, maintaining database foreign key integrity while utilizing federated identity.

---

## 5. Security Controls and OWASP Mitigations

### 1. Broken Access Control (A01:2021)
- Restricts all administrative API endpoints `/api/admin/**` and administrative actions under `/api/reservations/*/approve` to `ROLE_ADMIN`.
- Performs server-side ownership checks in `ReservationController` ensuring that stall vendors can only fetch, view details of, or cancel reservations belonging to their user ID.

### 2. Cryptographic Failures (A02:2021)
- The entire system operates exclusively over HTTPS/TLS, preventing interception of authorization headers or sensitive payloads.
- Sensitive credentials (keystore passwords, DB passwords, OIDC client secrets) are completely decoupled from code and loaded through environment variables.

### 3. Injection (A03:2021)
- Database persistence is handled via JPA (Hibernate) using parameterized repository interfaces. There is no raw SQL string concatenation, protecting against SQL injection.
- Request payloads are strictly bound to strongly-typed DTOs.

### 4. Insecure Design (A04:2021)
- Business rules are validated on the server side: double-booking of stalls is prevented by checking reservation records; stall bookings are disallowed after event cutoff dates.
- All requests undergo comprehensive boundary checks.

### 5. Security Misconfiguration (A05:2021)
- Exposed stack traces are hidden from users. `GlobalExceptionHandler` intercepts exceptions and returns sanitized JSON error responses.
- Secure headers like HSTS, Content Security Policy (CSP), Frame Options (Clickjacking protection), and X-Content-Type-Options are enforced.
- CORS configurations are restricted to registered origins (wildcards are blocked on authenticated paths).

### 6. Vulnerable and Outdated Components (A06:2021)
- Dependencies are regularly scanned and updated in `pom.xml` and `package.json`.

### 7. Identification and Authentication Failures (A07:2021)
- Weak local password hashes are replaced by cloud-based authentication (Auth0/OIDC).
- Access tokens are cryptographically verified on every API request. Deactivated user accounts are denied access instantly on token evaluation.

### 8. Software and Data Integrity Failures (A08:2021)
- Version controls are strictly enforced, and build operations are performed via verified Maven wrapper configurations (`mvnw.cmd`).

### 9. Security Logging and Monitoring Failures (A09:2021)
- Critical actions (booking requests, approvals, rejections, refunds, cancellations, and auth errors) trigger structured SLF4J audit logs on the server for tracking.

### 10. SSRF (A10:2021)
- Outbound network requests to the ML service are restricted to internal localhost endpoints and mapped to static properties. No user-controlled parameters can modify outbound destinations.

---

## 6. Prerequisites
Ensure you have the following installed on your machine:
- **Java Development Kit (JDK)**: Version 17 or higher
- **Node.js**: Version 18 or higher (along with `npm`)
- **MySQL Server**: Version 8.0 or higher
- **Python**: Version 3.10 or higher
- **Git**
- An active **Auth0 account** (for OIDC mode)

---

## 7. Database Setup
1. Open your MySQL command terminal or client (e.g., MySQL Workbench).
2. Execute the database creation script located in the project workspace:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
3. This creates the database `stall_reservation` and all the required tables with the new columns.

---

## 8. Environment Configuration

### Backend Configuration
Decouple credentials from your repository by setting the following environment variables on your system:

| Variable | Description | Example Value |
|---|---|---|
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `your_secure_password` |
| `OIDC_ISSUER` | Authority URL of your IdP | `https://your-auth0-domain.us.auth0.com/` |
| `OIDC_AUDIENCE` | API Audience registered in IdP | `https://bookfair-api` |
| `MAIL_USERNAME` | SMTP email username | `example@gmail.com` |
| `MAIL_PASSWORD` | SMTP app-specific password | `xxxx xxxx xxxx xxxx` |
| `SSL_KEYSTORE_PASSWORD` | Keystore password | `password` |

### Frontend Configuration
Create a `.env` file in the `frontend` folder:
```env
VITE_OIDC_AUTHORITY=https://your-auth0-domain.us.auth0.com
VITE_OIDC_CLIENT_ID=your_client_id
VITE_OIDC_REDIRECT_URI=https://localhost:5173/callback
VITE_OIDC_AUDIENCE=https://bookfair-api
```
*Note*: Make sure these callback URIs are also allowed in your Auth0 application settings.

---

## 9. SSL/TLS Configuration (HTTPS)
Both frontend and backend are configured to run over HTTPS.

### Backend Keystore Generation
Generate a self-signed PKCS12 keystore file inside `backend/src/main/resources/`:
```bash
keytool -genkeypair -alias bookfair -keyalg RSA -keysize 2048 -storetype PKCS12 -keystore backend/src/main/resources/keystore.p12 -validity 3650 -dname "CN=localhost, OU=InfoSec, O=BookFair, C=LK" -storepass password
```
This keystore is used by Spring Boot to encrypt local REST and WebSocket transmissions.

### Frontend HTTPS
Vite is configured with `https: true` in `vite.config.js`. When you start the dev server, Vite automatically provisions a local self-signed certificate. You may need to click "Proceed anyway" in your browser when accessing the app for the first time.

---

## 10. Running the Application

### Step 1: Start the ML Service
```bash
cd ml_service
uv venv
.venv\Scripts\activate
uv pip install -r requirements.txt
python model_server.py
```
The service runs locally at `http://127.0.0.1:8003`.

### Step 2: Run the Spring Boot Backend
Open a new terminal, export your environment variables, and run:
```bash
cd backend
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_password"
$env:SSL_KEYSTORE_PASSWORD="password"
.\mvnw.cmd spring-boot:run
```
The API is available at `https://localhost:8080`.

### Step 3: Run the React Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to `https://localhost:5173`.

---

## 11. Running Tests
Run backend tests to verify database configurations and security constraints:
```bash
cd backend
.\mvnw.cmd clean test
```
The tests isolate the Auth0 provider context by utilizing mocked JWT decoders.

---

## 12. Security Testing Performed
Manual penetration tests were performed to verify the following security controls:
- **No Bearer Token**: Requesting `/api/reservations/my` returns `401 Unauthorized`.
- **Administrative Bypass**: Sending a POST request to `/api/reservations/1/approve` with a Vendor token returns `403 Forbidden`.
- **IDOR / Access Control Bypass**: Requesting details for reservation `2` using a token belonging to the owner of reservation `1` returns `403 Forbidden`.
- **CORS Origin Check**: Sending an API request with the header `Origin: https://evil-example.com` returns `403 Forbidden` (`Invalid CORS request`).
- **Input Validation**: Submitting a booking request with a reservation date in the past returns `400 Bad Request`.

---

## 13. Repository Link
The complete public repository containing code and configurations is hosted at:
[https://github.com/Kasturi-Pushpanathan/secure-stall-booking-system](https://github.com/Kasturi-Pushpanathan/secure-stall-booking-system)
