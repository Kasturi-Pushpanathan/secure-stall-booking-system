package com.bookfair.Stall_Reservation.service;

import com.bookfair.Stall_Reservation.entity.Genre;

import java.util.List;

public interface GenreService {

    List<Genre> getAllGenresOrderedByName();
}
