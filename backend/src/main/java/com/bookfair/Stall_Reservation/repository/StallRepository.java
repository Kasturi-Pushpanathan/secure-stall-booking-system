package com.bookfair.Stall_Reservation.repository;

import com.bookfair.Stall_Reservation.entity.Event;
import com.bookfair.Stall_Reservation.entity.Stall;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StallRepository extends JpaRepository<Stall, Long> {

    List<Stall> findByEventIdOrderByStallCode(Long eventId);

    Optional<Stall> findByEventIdAndStallCode(Long eventId, String stallCode);

    List<Stall> findByEventAndBlockedFalse(Event event);
}
