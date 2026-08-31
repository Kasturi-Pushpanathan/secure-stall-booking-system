package com.bookfair.Stall_Reservation.service;

import java.util.List;
import java.util.Map;


public interface EventService {

    List<Map<String, Object>> listUpcoming();

    Map<String, Object> getById(Long id);

    List<Map<String, Object>> getStallAvailability(Long eventId);

    // Admin methods
    List<Map<String, Object>> listAll(String search);

    Map<String, Object> getAdminDetail(Long id);

    Long createEvent(Map<String, Object> body, Long adminId);

    void removeEvent(Long id);
}
