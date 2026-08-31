package com.bookfair.Stall_Reservation.controller;

import com.bookfair.Stall_Reservation.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    private Long currentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null)
            return null;
        return (Long) auth.getPrincipal();
    }

    @GetMapping
    public ResponseEntity<?> get(Authentication auth) {
        Long userId = currentUserId(auth);
        if (userId == null)
            return ResponseEntity.status(401).build();
        Map<String, Object> profile = userService.getProfile(userId);
        if (profile == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<?> update(@RequestBody Map<String, String> body, Authentication auth) {
        Long userId = currentUserId(auth);
        if (userId == null)
            return ResponseEntity.status(401).build();
        try {
            userService.updateProfile(userId, body);
            return ResponseEntity.ok(Map.of("message", "Profile updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
