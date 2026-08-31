package com.bookfair.Stall_Reservation.repository;

import com.bookfair.Stall_Reservation.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GenreRepository extends JpaRepository<Genre, Long> {

    List<Genre> findAllByOrderByNameAsc();
}
