# Secure Web Application Development: Enhancing a Book Fair Stall Reservation Platform

## Introduction
Security is one of the most important considerations when developing modern web applications. A system may provide all the required business functionality, but weak authentication, authorization, input validation, or configuration can expose sensitive information and allow unauthorized operations.

As part of my **Secure Web Application Development** assessment, I enhanced an existing Book Fair Stall Reservation System by identifying, mitigating, and addressing critical security risks. The enhancement is structured around the industry-recognized **OWASP Top 10 vulnerabilities** and standard federated identity protocols.

The application uses a decoupled architecture with **React** for the frontend, **Spring Boot** for the backend, **MySQL** for data persistence, and **Auth0** as the external Identity Provider. The main objective was not simply to add a login page, but to ensure that authentication and authorization were enforced securely throughout the application lifecycle.

---

## Existing Application Architecture
The application allows stall vendors to reserve stalls at an exhibition venue, while exhibition organizers manage the venue, stalls, and incoming reservations.

The main technology stack consists of:
- **Frontend**: React and Vite (HTTPS enabled)
- **Backend**: Spring Boot 3.3.2 and Spring Security (acting as an OAuth 2.0 Resource Server)
- **Database**: MySQL 8.0+
- **Authentication**: Auth0, OpenID Connect (OIDC), OAuth 2.0, Authorization Code Flow with PKCE, JWT Bearer Tokens
- **Real-Time Synchronisation**: Spring WebSockets (STOMP Broker)
- **ML Recommendation Service**: FastAPI, Uvicorn, Scikit-Learn

The system contains two main roles:
1. **STALL_VENDOR**: Can create reservations and access permitted operations related strictly to their own profile and bookings.
2. **EXHIBITION_ORGANIZER (ADMIN)**: Owns and manages the exhibition venue, stalls, and vendor reservations.

---

## Moving Authentication to Auth0 (OIDC & PKCE)
One of the most important security improvements was removing application-managed password storage. Storing hashed passwords locally still leaves systems vulnerable to credential stuffing, dictionary attacks, and implementation mistakes. 

Instead, I delegated authentication to **Auth0** using **OpenID Connect (OIDC)** and **OAuth 2.0 Authorization Code Flow with Proof Key for Code Exchange (PKCE)**.

### The OIDC PKCE Authentication Flow:
```text
User  --->  React App  --->  Auth0 Auth Endpoint
                              ↓
                            User Authentication (IdP)
                              ↓
React App  <---  Auth0 Callback  <---  Authorization Code
  ↓
Token Exchange (Auth Code + Code Verifier)
  ↓
React App (Stores JWT Access Token)
  ↓
Authorization: Bearer <access-token>  --->  Spring Boot API
```

### Why PKCE?
PKCE provides additional protection to the authorization-code flow by replacing static client secrets with dynamic cryptographically generated code verifiers. This is particularly appropriate because a Single Page Application (React) is a *public client* running in the user's browser, where storing static client secrets is impossible without exposure.

---

## JWT Validation & JIT User Provisioning in Spring Security
Receiving a JSON Web Token (JWT) from the frontend does not mean the backend should automatically trust it. The Spring Boot backend operates as an **OAuth 2.0 Resource Server**. For protected API requests, Spring Security validates:
1. **Cryptographic Signature**: Verified using Auth0's public JSON Web Key Set (JWKS) endpoint.
2. **Issuer (`iss`)**: Validates that the token was issued by the trusted Auth0 tenant.
3. **Audience (`aud`)**: Validates that the token was intended for our API.
4. **Expiration (`exp`)**: Blocks expired tokens.

### Just-In-Time (JIT) Provisioning
Because our reservation business logic relies on database integrity (foreign keys referencing the `users` table), I implemented JIT user provisioning. When the backend receives a valid access token, it checks if the vendor exists locally. If not, it provisions the user record on the fly:

```java
// Extract OIDC claim and provision user on demand
String email = jwt.getClaimAsString("email");
User user = userRepository.findByEmail(email).orElseGet(() -> {
    User newUser = new User();
    newUser.setEmail(email);
    newUser.setName(jwt.getClaimAsString("name"));
    newUser.setRole(adminEmails.contains(email) ? UserRole.ADMIN : UserRole.VENDOR);
    return userRepository.save(newUser);
});
```

---

## Preventing Broken Access Control and IDOR (OWASP A01:2021)
Broken Access Control is currently ranked #1 in the OWASP Top 10. A classic example is **Insecure Direct Object Reference (IDOR)**. For example, if a vendor accesses details via:
`GET /api/reservations/24`
Simply changing the URL path to `/api/reservations/25` must not allow them to view or cancel another vendor's reservation.

I implemented strict backend ownership checks inside the controller:
```java
@GetMapping("/{id}")
public ResponseEntity<?> getDetail(@PathVariable Long id, Authentication auth) {
    Long userId = currentUserId(auth);
    Reservation r = reservationService.getReservationById(id);
    
    // Check ownership or admin status
    boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    if (!isAdmin && !r.getVendor().getId().equals(userId)) {
        return ResponseEntity.status(403).body(Map.of("message", "Access denied: You do not own this reservation."));
    }
    return ResponseEntity.ok(r);
}
```

This highlighted the core difference:
- **Authentication** determines *who* the user is (Auth0).
- **Authorization** determines *what* they are allowed to do (Spring Security & Ownership Checks).

---

## Preventing Client-Side Identity Manipulation
Another important design decision was to avoid trusting a user/vendor ID supplied directly by the frontend when creating security-sensitive resources. Attackers can easily manipulate HTTP request bodies.

Instead, the backend obtains the user's identity directly from the validated Spring Security authentication context:
```java
Long userId = currentUserId(auth); // Decoded from JWT, not from client request payload
```
This ensures a vendor cannot create a reservation in the name of another vendor.

---

## Addressing Other OWASP Vulnerabilities

### Cryptographic Failures (A02:2021)
Data in transit must be protected. I configured the Spring Boot backend to run over HTTPS using a self-signed PKCS12 keystore (`keystore.p12`) generated via the Java `keytool`. Similarly, the Vite frontend is configured to run with `https: true` in `vite.config.js`. This guarantees that JWTs and billing credentials are never sent over unencrypted channels.

### Injection (A03:2021)
To mitigate SQL injection, the system completely avoids raw SQL concatenation. It utilizes **Spring Data JPA** repositories and JPQL named parameter bindings (e.g., `:eventId`). Hibernate compiles these into PreparedStatements, ensuring user input is treated strictly as parameters rather than executable SQL code.

### Insecure Design (A04:2021)
We implemented input constraints using **Jakarta Bean Validation** annotations on Request DTOs:
- `@NotNull(message = "Reservation date is required")`
- `@FutureOrPresent` to ensure bookings cannot be made in the past.
- `@Min(value = 1)` to prevent negative stall count requests.
- Calendar date checking is performed on the server side to enforce booking cutoff dates.

### Security Misconfiguration (A05:2021)
By default, application errors can leak framework stack traces, revealing database schemas or library versions. I implemented a `GlobalExceptionHandler` to catch generic exceptions, log them securely on the server, and return a clean, obfuscated message to the client:
```java
@ExceptionHandler(Exception.class)
public ResponseEntity<Map<String, String>> handleGenericException(Exception e) {
    logger.error("Internal Server Error: ", e); // Log stack trace securely
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("message", "An unexpected error occurred. Please contact the administrator."));
}
```

### Security Logging and Monitoring Failures (A09:2021)
Security events are logged locally using **SLF4J/Logback** to establish a clear audit trail. Every booking request, reservation approval, rejection, and cancellation is logged with the user ID and timestamp to enable tracking:
```javascript
logger.info("Audit Log: Vendor ID {} requested booking for event ID {}", userId, request.getEventId());
```

---

## Challenges Faced

1. **Mapping Federated Identity to Local DB**: Auth0 identifies users via a unique `sub` claim. However, our database requires relationships with a local `User` record to track bookings. Implementing JIT provisioning resolved this, linking federated login with a local auto-incremented primary key.
2. **Local HTTPS Trust**: Running local servers on HTTPS (`https://localhost:8080` and `https://localhost:5173`) causes browsers to display self-signed certificate warnings. I had to explicitly bypass the warning in the browser to allow frontend-backend communications.
3. **CORS on Authenticated Endpoints**: Spring Security blocks non-origin requests by default. I configured a restricted CORS configuration source mapping specific allowed origins, headers, and methods to prevent cross-origin leaks.

---

## Key Learning Outcomes

- **Never Trust the Frontend**: UI logic (like disabling a button) is only for user experience. Real security checks must be performed on the server.
- **Resource-Level Authorization**: Role-Based Access Control (RBAC) is insufficient on its own. Ownership checks must be implemented to prevent vendors from accessing other vendors' data (IDOR).
- **Federated Authentication Is Standard**: Utilizing cloud Identity Providers (like Auth0) significantly decreases development complexity and increases security posture.

---

## Conclusion
Enhancing the Stall Reservation System provided valuable hands-on experience in modern application security. Migrating to OpenID Connect, securing REST APIs using Spring Security, implementing transport layer security (HTTPS), and systematically addressing the OWASP Top 10 vulnerabilities turned a functional system into a secure, production-ready distributed platform.

---

## Source Code
The complete source code with security configurations and deployment instructions is available on my public GitHub repository:
[GitHub Repository Link](https://github.com/Kasturi-Pushpanathan/secure-stall-booking-system)
