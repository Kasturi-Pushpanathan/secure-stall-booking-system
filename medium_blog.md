# Securing a Book Fair Stall Reservation System: A Practical OWASP Journey

## Enhancing a Functional Web Application with OIDC, OAuth 2.0, JWT and Spring Security

> **Secure Web Application Development | Security Enhancement Project**

## Introduction

A web application can provide every required feature and still be vulnerable.

A working login page does not automatically provide secure authentication. Hiding an administrative button does not provide authorization. Accepting a valid JWT does not mean a user should be able to access every resource. Even a small configuration mistake, such as exposing credentials or allowing an overly permissive CORS policy, can create a serious security weakness.

As part of my **Secure Web Application Development** assessment, I enhanced an existing **Book Fair Stall Reservation System** by identifying security risks, implementing appropriate mitigations, and testing the application's behaviour against unauthorized and manipulated requests.

The security enhancement focused on the **OWASP Top 10** and modern federated identity protocols. The application uses **React and Vite** for the frontend, **Spring Boot and Spring Security** for the backend, **MySQL** for persistence, **Auth0** as the external Identity Provider, **Spring WebSockets/STOMP** for real-time synchronization, and **FastAPI, Uvicorn and Scikit-Learn** for the recommendation service.

The most important objective was not simply to add authentication. It was to make security part of the application's architecture and lifecycle.

---

# 1. Understanding the Application

The Book Fair Stall Reservation System allows stall vendors to reserve stalls at an exhibition venue, while exhibition organizers manage the venue, stalls, and incoming reservations.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Spring Boot 3.3.2 |
| Backend Security | Spring Security |
| Database | MySQL 8.0+ |
| Authentication | Auth0 |
| Identity Protocol | OpenID Connect (OIDC) |
| Authorization Protocol | OAuth 2.0 |
| Authentication Flow | Authorization Code Flow with PKCE |
| Token | JWT Bearer Access Token |
| Real-Time Communication | Spring WebSockets / STOMP |
| Recommendation Service | FastAPI + Uvicorn + Scikit-Learn |

The application contains two primary roles:

### `STALL_VENDOR`

A vendor can create reservations and access operations related to their own profile and bookings.

### `EXHIBITION_ORGANIZER (ADMIN)`

An organizer manages the exhibition venue, stalls, vendor reservations, and administrative operations.

This separation made server-side authorization a fundamental security requirement.

---

# 2. The First Security Lesson: Authentication Is Not Authorization

One of the most important lessons from this project was understanding the difference between **authentication** and **authorization**.

### Authentication

Authentication answers:

> **Who is the user?**

In this application, Auth0 handles the authentication process.

### Authorization

Authorization answers:

> **What is this authenticated user allowed to do?**

Spring Security and application-level ownership checks enforce these decisions.

For example, imagine that Vendor A owns reservation `24`.

The vendor may legitimately request:

```text
GET /api/reservations/24
```

But changing the URL to:

```text
GET /api/reservations/25
```

must not expose another vendor's reservation.

This is why frontend restrictions cannot be treated as security controls.

An attacker can bypass the React interface and send HTTP requests directly to the backend.

> **If the client can send the request, the server must be able to enforce the security decision.**

---

# 3. Moving Authentication to Auth0

One of the most important security improvements was removing application-managed password authentication.

Instead, authentication was delegated to **Auth0** using:

- OpenID Connect (OIDC)
- OAuth 2.0
- Authorization Code Flow
- Proof Key for Code Exchange (PKCE)
- JWT Bearer Access Tokens

The high-level flow is:

```text
User
  |
  v
React Application
  |
  v
Auth0 Authorization Endpoint
  |
  v
User Authentication
  |
  v
Authorization Code
  |
  v
Token Exchange
(Auth Code + Code Verifier)
  |
  v
JWT Access Token
  |
  v
React Application
  |
  | Authorization: Bearer <access-token>
  v
Spring Boot API
  |
  v
JWT Validation
  |
  v
Authorized Request
```

The React application is a **public client** running in the user's browser. A traditional client secret cannot safely be kept in browser code, which makes PKCE particularly appropriate for this architecture.

---

# 4. Why PKCE Matters

**PKCE (Proof Key for Code Exchange)** adds protection to the OAuth 2.0 Authorization Code Flow.

The process can be understood in four stages.

## Step 1 — Generate the Code Verifier

The React application generates a cryptographically secure random value.

Conceptually:

```javascript
window.crypto.getRandomValues(...)
```

The verifier is kept by the client during the authentication process.

## Step 2 — Generate the Code Challenge

The verifier is hashed using SHA-256:

```text
code_challenge = BASE64URL(SHA256(code_verifier))
```

The resulting challenge is sent to Auth0.

## Step 3 — Send the Authorization Request

The authorization request includes:

```text
code_challenge
code_challenge_method=S256
```

## Step 4 — Verify the Code

After successful authentication, Auth0 returns an authorization code.

The client provides the original:

```text
code_verifier
```

Auth0 verifies that the verifier corresponds to the challenge before completing the token exchange.

The key idea is that an intercepted authorization code alone is not sufficient to complete the exchange.

---

# 5. JWT Validation in Spring Security

A token received from the frontend should never be trusted automatically.

The Spring Boot backend operates as an **OAuth 2.0 Resource Server**.

For protected API requests, Spring Security validates important properties of the JWT.

## 5.1 Cryptographic Signature

The JWT signature is verified using Auth0's public keys obtained through its JWKS endpoint.

## 5.2 Issuer (`iss`)

The issuer claim is checked to ensure that the token was issued by the trusted Auth0 tenant.

## 5.3 Audience (`aud`)

The audience claim is checked to ensure that the token was intended for the application's API.

## 5.4 Expiration (`exp`)

Expired tokens are rejected.

## 5.5 Authorization Claims

Relevant role information is converted into application authorities.

Conceptually:

```text
Auth0 JWT
   |
   v
Spring Security
   |
   +--> Signature
   +--> Issuer
   +--> Audience
   +--> Expiration
   +--> Authorities
   |
   v
Authenticated Principal
```

This allows authorization decisions to be made from validated authentication information rather than frontend-controlled data.

---

# 6. Just-In-Time User Provisioning

Moving authentication to Auth0 introduced an architectural challenge.

Auth0 manages the federated identity, but the reservation system still requires a local `User` record because reservations depend on database relationships and foreign keys.

I addressed this using **Just-In-Time (JIT) user provisioning**.

The process is:

```text
User authenticates with Auth0
          |
          v
Valid JWT received
          |
          v
Extract identity
          |
          v
Search local User table
          |
      +---+---+
      |       |
    Found   Missing
      |       |
      |       v
      |   Create User
      |       |
      +---+---+
          |
          v
Continue application request
```

A simplified implementation is:

```java
String email = jwt.getClaimAsString("email");

User user = userRepository.findByEmail(email).orElseGet(() -> {
    User newUser = new User();
    newUser.setEmail(email);
    newUser.setName(jwt.getClaimAsString("name"));
    newUser.setRole(
        adminEmails.contains(email)
            ? UserRole.ADMIN
            : UserRole.VENDOR
    );
    return userRepository.save(newUser);
});
```

This creates a bridge between the external identity system and the application's local business model.

---

# 7. OWASP A01: Broken Access Control and IDOR

**Broken Access Control** was one of the most important security risks addressed.

A common example is **Insecure Direct Object Reference (IDOR)**.

Suppose a vendor accesses:

```text
GET /api/reservations/24
```

Simply changing the identifier to:

```text
GET /api/reservations/25
```

must not allow the vendor to view or cancel another vendor's reservation.

The authorization logic follows:

```text
Authenticated User
        |
        v
Requested Reservation
        |
        v
Check Ownership
        |
        v
     +--+--+
     |     |
    Yes    No
     |     |
     v     v
  Allow   403
```

A simplified implementation is:

```java
@GetMapping("/{id}")
public ResponseEntity<?> getDetail(
        @PathVariable Long id,
        Authentication auth) {

    Long userId = currentUserId(auth);

    Reservation reservation =
        reservationService.getReservationById(id);

    boolean isAdmin = auth.getAuthorities()
        .stream()
        .anyMatch(a ->
            a.getAuthority().equals("ROLE_ADMIN"));

    if (!isAdmin &&
        !reservation.getVendor().getId().equals(userId)) {

        return ResponseEntity
            .status(403)
            .body(Map.of(
                "message",
                "Access denied: You do not own this reservation."
            ));
    }

    return ResponseEntity.ok(reservation);
}
```

This demonstrates the difference clearly:

- **Authentication** determines who the user is.
- **Authorization** determines what they can access.
- **Ownership checks** determine whether they can access a specific resource.

---

# 8. Preventing Client-Side Identity Manipulation

Another important security decision was avoiding trust in a vendor ID supplied by the frontend.

An attacker could manipulate a request such as:

```json
{
  "vendorId": 15,
  "stallId": 8
}
```

into:

```json
{
  "vendorId": 1,
  "stallId": 8
}
```

If the backend blindly trusted the value, the request could create a resource under another user's identity.

Instead, the backend derives the identity from the validated authentication context:

```java
Long userId = currentUserId(auth);
```

The security flow becomes:

```text
JWT
 |
 v
Validated Authentication
 |
 v
Authenticated User
 |
 v
Local User ID
 |
 v
Reservation Ownership
```

Therefore, security-sensitive identity is controlled by the server rather than by the request body.

---

# 9. OWASP A02: Cryptographic Failures

Data in transit must be protected.

The Spring Boot backend was configured to run over HTTPS using a self-signed PKCS12 keystore generated with Java `keytool`.

The Vite frontend was also configured for HTTPS development.

This protects communication between the frontend and backend from being transmitted as ordinary plaintext.

For production deployment, a certificate issued by a trusted Certificate Authority should be used instead of a local self-signed certificate.

---

# 10. OWASP A03: Injection

SQL injection was addressed by avoiding unsafe SQL concatenation.

The application uses:

- Spring Data JPA
- Hibernate
- Repository methods
- Parameterized JPQL queries

The unsafe pattern would be:

```text
"SELECT * FROM users WHERE name = '" + userInput + "'"
```

Instead, parameters are bound separately.

Conceptually:

```text
Untrusted Input
      |
      v
Bound Parameter
      |
      v
Prepared Statement
      |
      v
Database
```

This prevents user input from being interpreted as executable SQL syntax.

---

# 11. OWASP A04: Insecure Design

Security needs to be considered during design rather than only after implementation.

The application uses **Jakarta Bean Validation** annotations on request DTOs.

Examples include:

```java
@NotNull(message = "Reservation date is required")
@FutureOrPresent
@Min(1)
```

These constraints help ensure that:

- Required values are supplied.
- Reservation dates are not placed in the past.
- Invalid numerical values are rejected.
- Business rules are enforced at the server boundary.

Calendar and booking-cutoff checks are also performed server-side so that users cannot bypass restrictions simply by manipulating frontend controls.

---

# 12. OWASP A05: Security Misconfiguration

Poor error handling can expose internal implementation details.

For example, returning a complete framework stack trace to a client could reveal information about:

- Internal classes
- Database operations
- Library versions
- Application structure

To avoid this, a `GlobalExceptionHandler` was implemented.

```java
@ExceptionHandler(Exception.class)
public ResponseEntity<Map<String, String>>
handleGenericException(Exception e) {

    logger.error("Internal Server Error: ", e);

    return ResponseEntity
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of(
            "message",
            "An unexpected error occurred. Please contact the administrator."
        ));
}
```

The technical exception is logged on the server while the client receives a controlled response.

---

# 13. CORS Protection

Cross-Origin Resource Sharing was another security area that required attention.

An overly permissive CORS policy can unnecessarily expose browser-accessible APIs to untrusted origins.

The application therefore uses a restricted CORS configuration containing explicitly allowed origins, headers, and methods.

The security model is:

```text
Browser Request
      |
      v
Origin Validation
      |
   +--+--+
   |     |
Trusted  Untrusted
   |     |
   v     v
 Allow  Reject
```

During testing, an unauthorized origin such as:

```text
Origin: https://evil-example.com
```

was rejected.

---

# 14. Securing WebSocket Communication

The application uses **Spring WebSockets with STOMP** for real-time stall availability synchronization.

This introduced an important security consideration.

Protecting REST endpoints alone would not be enough if the WebSocket communication channel remained unsecured.

The STOMP connection therefore requires a Bearer access token.

The backend validates the JWT before associating the connection with an authenticated user.

Administrative subscriptions are additionally restricted according to authorization rules.

This led to another important lesson:

> **Every communication mechanism is part of the application's attack surface.**

---

# 15. XSS Protection

The React frontend was reviewed for unsafe HTML rendering.

The application avoids intentionally rendering untrusted content through:

```javascript
dangerouslySetInnerHTML
```

React's normal rendering behaviour escapes text values, helping reduce common Cross-Site Scripting risks.

A **Content Security Policy (CSP)** is also used as an additional browser-side security layer.

This follows a defense-in-depth approach: multiple controls work together instead of relying on one protection.

---

# 16. HTTPS and Security Headers

Additional browser and transport security controls were configured.

### HSTS

**HTTP Strict Transport Security** encourages browsers to communicate using HTTPS.

### Content Security Policy

CSP restricts which scripts and resources the browser is allowed to execute or load.

### X-Frame-Options

```text
X-Frame-Options: DENY
```

helps protect against clickjacking.

### X-Content-Type-Options

```text
X-Content-Type-Options: nosniff
```

helps prevent MIME-type sniffing.

Together, these controls provide additional protection at the transport and browser layers.

---

# 17. Secure File Uploads

File uploads represent another potential attack surface.

An attacker may attempt to upload:

- Unexpected file types
- Executable files
- Extremely large files
- Files with malicious filenames

The application therefore:

- Restricts accepted MIME types.
- Limits upload sizes.
- Generates unique filenames using UUIDs.
- Determines permitted extensions on the server.
- Avoids trusting the original client filename.

For example:

```text
Original:
company-logo.jpg

Server-generated:
550e8400-e29b-41d4-a716-446655440000.jpg
```

For a production environment, this could be strengthened further with file-content inspection and malware scanning.

---

# 18. Protecting Secrets

One of the simplest and most serious security mistakes is committing credentials to source control.

Sensitive configuration such as:

- Database credentials
- SMTP credentials
- Auth0 configuration
- SSL keystore passwords
- Other application secrets

should be supplied through environment variables or a dedicated secret-management mechanism.

The public repository should contain placeholders or example configuration only.

For example:

```text
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password

AUTH0_DOMAIN=your_auth0_domain
AUTH0_AUDIENCE=your_api_audience
```

Actual credentials must never be committed.

Sensitive files such as:

```text
.env
*.p12
*.jks
```

should be excluded from version control where appropriate.

> **Secrets belong in secure configuration, not in source code.**

---

# 19. Security Logging and Monitoring

Security controls are much more useful when security-related activity can be investigated.

The application uses **SLF4J/Logback** logging to establish an audit trail.

Examples of security-related events include:

```text
login_success
login_failure
access_denied
invalid_token
reservation_created
reservation_approved
reservation_rejected
reservation_cancelled
```

A simplified audit entry is:

```java
logger.info(
    "Audit Log: Vendor ID {} requested booking for event ID {}",
    userId,
    request.getEventId()
);
```

This provides useful information for monitoring and investigating suspicious activity.

---

# 20. Security Assessment: Before vs After

A useful way to understand the security enhancement is to compare the application's behaviour before and after remediation.

## Before

| Security Area | Weakness |
|---|---|
| Broken Access Control | Unauthorized users could attempt privileged operations |
| Credentials | Sensitive configuration could contain plaintext secrets |
| CORS | Configuration could be overly permissive |
| Identity | Client-controlled IDs created authorization risks |
| Input Validation | Business inputs required stronger server-side constraints |
| Error Handling | Internal errors required controlled responses |
| Security Logging | Security events required stronger audit visibility |

## After

| Security Area | Implemented Protection |
|---|---|
| Authentication | Auth0 + OIDC + OAuth 2.0 + PKCE |
| JWT | Signature, issuer, audience and expiration validation |
| Authorization | Spring Security role checks |
| IDOR | Resource ownership validation |
| Identity | Derived from validated authentication context |
| Input Validation | Jakarta Bean Validation |
| SQL Injection | JPA/Hibernate parameter binding |
| CORS | Restricted trusted origins |
| Error Handling | Global exception handling |
| WebSocket | JWT-based authentication |
| HTTPS | Encrypted communication |
| Secrets | Environment-based configuration |
| Monitoring | Audit logging |

---

# 21. Security Testing

Implementing security controls is only half the work.

They must be tested.

I tested multiple scenarios to verify that unauthorized or malformed requests were rejected.

| Test Case | Expected Result |
|---|---|
| Request without authentication token | `401 Unauthorized` |
| Invalid JWT | `401 Unauthorized` |
| Vendor accessing organizer endpoint | `403 Forbidden` |
| Vendor accessing another vendor's reservation | `403 Forbidden` |
| Unauthorized CORS origin | Request rejected |
| Invalid event/reservation data | Request rejected |
| Valid WebSocket JWT | Authenticated STOMP connection |

These tests provided practical evidence that the security mechanisms were enforced at runtime.

---

# 22. Challenges Faced

## 22.1 Mapping Federated Identity to the Local Database

Auth0 identifies users using a unique OIDC `sub` claim.

However, the application requires a local `User` record to maintain reservation relationships.

JIT provisioning provided a way to connect these two identity models.

```text
Auth0 Identity
      |
      v
OIDC Subject
      |
      v
Local User
      |
      v
Application Role
      |
      v
Reservations
```

## 22.2 Local HTTPS

Running HTTPS locally with a self-signed certificate caused browser trust warnings.

I had to configure the local environment so that HTTPS communication between:

```text
https://localhost:8080
https://localhost:5173
```

could work during development.

## 22.3 CORS and Authenticated Requests

Authenticated browser requests required careful CORS configuration.

Specific origins, headers, and methods had to be permitted without opening the API to arbitrary websites.

## 22.4 WebSocket Authentication

REST requests and WebSocket/STOMP connections have different communication lifecycles.

Therefore, WebSocket authentication required separate consideration rather than assuming REST security would automatically cover it.

## 22.5 Testing Security Behaviour

Another challenge was moving from simply reading code to actively attempting to break the application.

Testing manipulated resource IDs, unauthorized roles, invalid tokens, invalid data, and unauthorized origins provided much stronger evidence of the application's security posture.

---

# 23. Key Learning Outcomes

This project provided several important practical lessons.

### 1. Never Trust the Frontend

Frontend restrictions are useful for user experience, but attackers can bypass them.

### 2. Authentication Does Not Equal Authorization

A valid JWT identifies an authenticated user; it does not automatically grant access to every operation or resource.

### 3. RBAC Alone Is Not Enough

Roles provide broad permissions, but resource ownership checks are still required to prevent IDOR.

### 4. Identity Should Come from Trusted Authentication Data

Security-sensitive identity should be derived from validated authentication information instead of client-controlled request parameters.

### 5. Security Must Be Layered

Authentication, authorization, input validation, HTTPS, CORS, WebSocket security, secret management, error handling, and logging all contribute to the final security posture.

### 6. Federated Authentication Reduces Application Complexity

Using an external Identity Provider such as Auth0 allows the application to delegate core authentication responsibilities while concentrating on application-specific authorization.

### 7. Security Testing Is Essential

A security control should not be considered complete until its expected behaviour has been tested.

---

# 24. Overall Security Architecture

The final architecture can be summarized as:

```text
                         USER
                           |
                           v
                    React Frontend
                           |
                           v
                 Auth0 / OIDC / PKCE
                           |
                           v
                    JWT Access Token
                           |
                           v
                 Spring Security
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
        JWT Validation    RBAC      Ownership Checks
             |             |             |
             +-------------+-------------+
                           |
                           v
                  Business Logic Layer
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
          Validation      JPA         WebSocket
             |             |             |
             v             v             v
        Secure Input    MySQL       Authenticated
                                      STOMP
                           |
                           v
                    Audit Logging
```

The important idea is that no single security mechanism is expected to protect the entire application.

Security is layered.

---

# 25. Conclusion

Enhancing the Book Fair Stall Reservation System gave me an opportunity to move beyond theoretical security concepts and apply them to a real distributed web application.

The biggest change was not simply adding Auth0 or Spring Security.

It was changing the way I think about application development.

For every feature, I began asking:

- Who is allowed to perform this action?
- Does the user own this resource?
- Can the request be manipulated?
- Can the frontend be bypassed?
- Can sensitive information leak through errors?
- Can credentials be exposed?
- Can an untrusted origin access the API?
- Is the WebSocket channel protected?
- Can security events be investigated?
- What happens when an attacker deliberately changes the request?

By integrating **Auth0, OpenID Connect, OAuth 2.0 with PKCE, JWT validation, Spring Security, RBAC, object-level authorization, input validation, SQL injection protections, CORS restrictions, WebSocket authentication, HTTPS, security headers, secure file uploads, secret management, error handling, and audit logging**, the application gained multiple layers of protection.

The most valuable lesson I learned is:

> **Security is not a feature added at the end of development. It is a continuous engineering responsibility that must be considered throughout architecture, implementation, configuration, testing, and deployment.**

---

## Source Code

The complete implementation, security configuration, database script, environment configuration guidance, and deployment instructions are available in my public GitHub repository:
👉 **[Secure Stall Reservation System on GitHub](https://github.com/Kasturi-Pushpanathan/secure-stall-booking-system)**
