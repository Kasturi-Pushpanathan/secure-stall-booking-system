package com.bookfair.Stall_Reservation.service.impl;

import com.bookfair.Stall_Reservation.entity.Genre;
import com.bookfair.Stall_Reservation.repository.GenreRepository;
import com.bookfair.Stall_Reservation.service.GenreService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GenreServiceImpl implements GenreService {

    private final GenreRepository genreRepository;

    public GenreServiceImpl(GenreRepository genreRepository) {
        this.genreRepository = genreRepository;
    }

    @Override
    public List<Genre> getAllGenresOrderedByName() {
        return genreRepository.findAllByOrderByNameAsc();
    }
}
