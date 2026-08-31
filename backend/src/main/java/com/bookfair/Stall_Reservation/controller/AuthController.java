package com.bookfair.Stall_Reservation.controller;

import com.bookfair.Stall_Reservation.dto.auth.ForgotPasswordRequest;
import com.bookfair.Stall_Reservation.dto.auth.LoginRequest;
import com.bookfair.Stall_Reservation.dto.auth.RegisterRequest;
import com.bookfair.Stall_Reservation.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        Map<String, Object> result = authService.login(req.getEmail(), req.getPassword(), req.getRole());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Passwords do not match"));
        }
        authService.registerVendor(req.getFullName(), req.getEmail(), req.getPhoneNumber(), req.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Registration successful. Please login."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Passwords do not match"));
        }
        authService.forgotPassword(req.getEmail(), req.getMobileNumber(), req.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }
}
