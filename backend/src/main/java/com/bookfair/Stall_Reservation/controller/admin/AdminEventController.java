package com.bookfair.Stall_Reservation.controller.admin;

import com.bookfair.Stall_Reservation.service.EventService;
import com.bookfair.Stall_Reservation.service.StallService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/events")
public class AdminEventController {

    private final EventService eventService;
    private final StallService stallService;

    public AdminEventController(EventService eventService, StallService stallService) {
        this.eventService = eventService;
        this.stallService = stallService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(eventService.listAll(search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable Long id) {
        Map<String, Object> detail = eventService.getAdminDetail(id);
        if (detail == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(detail);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, Authentication auth) {
        Long adminId = (Long) auth.getPrincipal();
        try {
            Long eventId = eventService.createEvent(body, adminId);
            return ResponseEntity.ok(Map.of("id", eventId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/stalls/{stallId}/block")
    public ResponseEntity<?> toggleBlockStall(@PathVariable Long id, @PathVariable Long stallId,
                                              @RequestBody Map<String, Boolean> body) {
        var stall = stallService.getById(stallId);
        if (stall == null || !stall.getEvent().getId().equals(id))
            return ResponseEntity.notFound().build();
        boolean blocked = body.getOrDefault("blocked", true);
        stallService.toggleBlock(stallId, blocked);
        return ResponseEntity.ok(Map.of("blocked", blocked));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeEvent(@PathVariable Long id) {
        try {
            eventService.removeEvent(id);
            return ResponseEntity.ok(Map.of("message", "Event removed"));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
