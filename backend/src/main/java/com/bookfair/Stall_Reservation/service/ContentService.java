package com.bookfair.Stall_Reservation.service;

import java.util.List;
import java.util.Map;

public interface ContentService {

    String get(String key);

    Map<String, String> getAll(List<String> keys);

    void set(String key, String value);

    void delete(String key);
}
