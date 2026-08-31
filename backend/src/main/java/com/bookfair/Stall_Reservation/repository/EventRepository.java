package com.bookfair.Stall_Reservation.repository;

import com.bookfair.Stall_Reservation.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByActiveTrueOrderByEventDateAsc();

    @Query("SELECT e FROM Event e WHERE e.active = true AND e.eventDate >= :now ORDER BY e.eventDate ASC")
    List<Event> findUpcomingEvents(LocalDateTime now);

    List<Event> findAllByOrderByEventDateDesc();
}
