package com.bookfair.Stall_Reservation.repository;

import com.bookfair.Stall_Reservation.entity.Reservation;
import com.bookfair.Stall_Reservation.entity.ReservationGenre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;

public interface ReservationGenreRepository extends JpaRepository<ReservationGenre, Long> {
    List<ReservationGenre> findByReservation(Reservation reservation);

    @Query("SELECT rg.genre.name as name, COUNT(rg) as count FROM ReservationGenre rg GROUP BY rg.genre.name")
    List<Map<String, Object>> countGenres();
}
