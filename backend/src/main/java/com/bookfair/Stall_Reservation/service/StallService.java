package com.bookfair.Stall_Reservation.service;

import com.bookfair.Stall_Reservation.entity.Stall;
import java.util.List;

public interface StallService {
    List<Stall> getStallsByEventId(Long eventId);

    Stall getById(Long id);

    void toggleBlock(Long stallId, boolean blocked);

    void saveAll(List<Stall> stalls);
}
