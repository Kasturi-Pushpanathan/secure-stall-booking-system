package com.bookfair.Stall_Reservation.service;
import java.util.Map;

public interface UserService {
    Map<String, Object> getProfile(Long userId);

    void updateProfile(Long userId, Map<String, String> updates);
}

