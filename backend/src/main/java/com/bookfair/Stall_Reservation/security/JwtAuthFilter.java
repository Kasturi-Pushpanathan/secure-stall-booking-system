package com.bookfair.Stall_Reservation.security;

import com.bookfair.Stall_Reservation.config.JwtUtil;
import com.bookfair.Stall_Reservation.entity.User;
import com.bookfair.Stall_Reservation.enums.UserRole;
import com.bookfair.Stall_Reservation.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final ObjectProvider<JwtDecoder> jwtDecoderProvider;

    @Value("${app.security.type:local}")
    private String securityType;

    @Value("${app.security.admin-emails:admin@bookfair.com}")
    private List<String> adminEmails;

    public JwtAuthFilter(JwtUtil jwtUtil, UserRepository userRepository, ObjectProvider<JwtDecoder> jwtDecoderProvider) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.jwtDecoderProvider = jwtDecoderProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = extractToken(request);
            if (StringUtils.hasText(token)) {
                if ("oidc".equalsIgnoreCase(securityType)) {
                    JwtDecoder jwtDecoder = jwtDecoderProvider.getIfAvailable();
                    if (jwtDecoder != null) {
                        org.springframework.security.oauth2.jwt.Jwt jwt = jwtDecoder.decode(token);
                        String email = jwt.getClaimAsString("email");
                        if (email == null) {
                            email = jwt.getSubject(); // fallback to subject
                        }
                        String name = jwt.getClaimAsString("name");
                        if (name == null) {
                            name = email;
                        }

                        // JIT User Provisioning
                        User user = userRepository.findByEmail(email).orElse(null);
                        if (user == null) {
                            user = new User();
                            user.setEmail(email);
                            user.setName(name);
                            user.setPhone("+94 000000000"); // default value
                            user.setPasswordHash(""); // No local password
                            if (adminEmails.contains(email)) {
                                user.setRole(UserRole.ADMIN);
                            } else {
                                user.setRole(UserRole.VENDOR);
                            }
                            user = userRepository.save(user);
                        }

                        var auth = new UsernamePasswordAuthenticationToken(
                                user.getId(),
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                } else {
                    // Local JWT Token validation
                    if (jwtUtil.validateToken(token)) {
                        String role = jwtUtil.getRoleFromToken(token).name();
                        Object userIdObj = jwtUtil.getUserIdFromToken(token);
                        Long userId = null;
                        if (userIdObj instanceof Number) {
                            userId = ((Number) userIdObj).longValue();
                        } else if (userIdObj instanceof String) {
                            try {
                                userId = Long.parseLong((String) userIdObj);
                            } catch (Exception e) {
                            }
                        }

                        if (userId != null) {
                            var auth = new UsernamePasswordAuthenticationToken(
                                    userId,
                                    null,
                                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));
                            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(auth);
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Log authentication errors but continue filter execution
            System.err.println("OIDC/JWT Authentication failed: " + e.getMessage());
        }
        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}

