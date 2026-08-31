package com.bookfair.Stall_Reservation.service;


import com.bookfair.Stall_Reservation.entity.User;
import com.bookfair.Stall_Reservation.enums.UserRole;

import java.util.Map;

public interface AuthService {

    Map<String, Object> login(String email, String password, UserRole role);

    void registerVendor(String name, String email, String phone, String password);

    void forgotPassword(String email, String mobileNumber, String newPassword);

    User getCurrentUser(Long userId);
}
