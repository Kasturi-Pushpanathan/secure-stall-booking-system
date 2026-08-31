package com.bookfair.Stall_Reservation.repository;


import com.bookfair.Stall_Reservation.entity.Reservation;
import com.bookfair.Stall_Reservation.entity.ReservationStall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReservationStallRepository extends JpaRepository<ReservationStall, Long> {

    List<ReservationStall> findByReservation(Reservation reservation);

    @Query("SELECT rs.stall.id FROM ReservationStall rs WHERE rs.reservation.event.id = :eventId AND rs.reservation.status NOT IN ('CANCELLED', 'REFUNDED', 'EVENT_REMOVED')")
    List<Long> findBookedStallIdsByEventId(Long eventId);
}
