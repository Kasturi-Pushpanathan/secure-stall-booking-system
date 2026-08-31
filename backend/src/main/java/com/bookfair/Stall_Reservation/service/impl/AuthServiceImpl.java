package com.bookfair.Stall_Reservation.service.impl;
import com.bookfair.Stall_Reservation.exception.AuthException;
import com.bookfair.Stall_Reservation.config.JwtUtil;
import com.bookfair.Stall_Reservation.entity.User;
import com.bookfair.Stall_Reservation.enums.UserRole;
import com.bookfair.Stall_Reservation.repository.UserRepository;
import com.bookfair.Stall_Reservation.service.AuthService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Map<String, Object> login(String email, String password, UserRole role) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("Invalid email or password"));
        if (user.getRole() != role) {
            throw new AuthException("Invalid role for this account");
        }
        if (!user.isActive()) {
            throw new AuthException("Account is deactivated");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new AuthException("Invalid email or password");
        }
        String token = jwtUtil.generateToken(user);
        return Map.of(
                "token", token,
                "userId", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().name());
    }

    @Override
    @Transactional
    public void registerVendor(String name, String email, String phone, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new AuthException("Email already registered");
        }
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(UserRole.VENDOR);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void forgotPassword(String email, String mobileNumber, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("No account found with this email"));
        if (!user.getPhone().trim().equals(mobileNumber.trim())) {
            throw new AuthException("Mobile number does not match our records");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public User getCurrentUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found"));
    }
}
