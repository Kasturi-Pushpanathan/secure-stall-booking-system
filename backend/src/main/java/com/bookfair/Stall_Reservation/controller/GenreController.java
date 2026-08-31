package com.bookfair.Stall_Reservation.controller;

import com.bookfair.Stall_Reservation.service.GenreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
public class GenreController {

    private final GenreService genreService;

    public GenreController(GenreService genreService) {
        this.genreService = genreService;
    }

    @GetMapping("/genres")
    public ResponseEntity<List<Map<String, Object>>> list() {
        return ResponseEntity.ok(
                genreService.getAllGenresOrderedByName().stream()
                        .map(g -> Map.<String, Object>of("id", g.getId(), "name", g.getName()))
                        .collect(Collectors.toList()));
    }
}
