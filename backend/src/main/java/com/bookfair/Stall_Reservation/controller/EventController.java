package com.bookfair.Stall_Reservation.controller;

import com.bookfair.Stall_Reservation.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listUpcoming() {
        List<Map<String, Object>> result = eventService.listUpcoming();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        Map<String, Object> result = eventService.getById(id);
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/stall-availability")
    public ResponseEntity<List<Map<String, Object>>> stallAvailability(@PathVariable Long id) {
        List<Map<String, Object>> result = eventService.getStallAvailability(id);
        return ResponseEntity.ok(result);
    }
}
