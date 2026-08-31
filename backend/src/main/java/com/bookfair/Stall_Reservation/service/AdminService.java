package com.bookfair.Stall_Reservation.service;

import java.util.List;
import java.util.Map;

public interface AdminService {

    Map<String, Object> getDashboardStats();

    List<Map<String, Object>> listVendors();

    Map<String, Object> getVendorDetail(Long id);

    void deactivateVendor(Long id);

    void cancelReservation(Long id);

    Map<String, Object> getProfile(Long adminId);

    void updateProfile(Long adminId, Map<String, Object> updates);

    void changePassword(Long userId, String newPassword);

    List<Map<String, Object>> listAdmins();

    Long addAdmin(Map<String, String> body);

    void removeAdmin(Long id);

}
