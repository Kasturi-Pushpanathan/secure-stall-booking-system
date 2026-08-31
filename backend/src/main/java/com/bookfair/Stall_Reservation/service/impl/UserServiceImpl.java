package com.bookfair.Stall_Reservation.service.impl;

import com.bookfair.Stall_Reservation.entity.User;
import com.bookfair.Stall_Reservation.repository.UserRepository;
import com.bookfair.Stall_Reservation.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Map<String, Object> getProfile(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null)
            return null;
        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "businessName", user.getBusinessName() != null ? user.getBusinessName() : "");
    }

    @Override
    @Transactional
    public void updateProfile(Long userId, Map<String, String> updates) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (updates.containsKey("name"))
            user.setName(updates.get("name"));
        if (updates.containsKey("email"))
            user.setEmail(updates.get("email"));
        if (updates.containsKey("phone"))
            user.setPhone(updates.get("phone"));
        if (updates.containsKey("businessName"))
            user.setBusinessName(updates.get("businessName"));
        userRepository.save(user);
    }
}
