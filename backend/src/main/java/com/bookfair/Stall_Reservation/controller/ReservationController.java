package com.bookfair.Stall_Reservation.controller;

import com.bookfair.Stall_Reservation.entity.Reservation;
import com.bookfair.Stall_Reservation.dto.reservation.CreateBookingRequest;
import com.bookfair.Stall_Reservation.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    private Long currentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null)
            return null;
        return (Long) auth.getPrincipal();
    }

    @PostMapping("/book")
    public ResponseEntity<?> createBooking(@Valid @RequestBody CreateBookingRequest request, Authentication auth) {
        Long userId = currentUserId(auth);
        if (userId == null)
            return ResponseEntity.status(401).build();
        try {
            Reservation r = reservationService.createPendingReservation(request, userId);
            return ResponseEntity.ok(Map.of(
                    "reservationId", r.getId(),
                    "bookingId", r.getBookingId(),
                    "advanceAmount", r.getAdvanceAmount(),
                    "totalAmount", r.getTotalAmount()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveReservation(@PathVariable Long id, Authentication auth) {
        // Logic to check if user is admin (or rely on Security Config, but explicit
        // check is good)
        // For now, assuming standard auth. In a real app, use
        // @PreAuthorize("hasRole('ADMIN')")
        try {
            reservationService.approveReservation(id);
            return ResponseEntity.ok(Map.of("message", "Reservation approved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectReservation(@PathVariable Long id, Authentication auth) {
        try {
            reservationService.rejectReservation(id);
            return ResponseEntity.ok(Map.of("message", "Reservation rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<?> refundReservation(@PathVariable Long id, Authentication auth) {
        try {
            reservationService.refundReservation(id);
            return ResponseEntity.ok(Map.of("message", "Reservation refunded"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject-refund")
    public ResponseEntity<?> rejectAndRefund(@PathVariable Long id, Authentication auth) {
        try {
            reservationService.rejectAndRefund(id);
            return ResponseEntity.ok(Map.of("message", "Reservation rejected and refund initiated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> myReservations(Authentication auth) {
        Long userId = currentUserId(auth);
        if (userId == null)
            return ResponseEntity.status(401).build();
        List<Reservation> list = reservationService.getReservationsForVendor(userId);
        List<Map<String, Object>> result = list.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", r.getId());
            m.put("bookingId", r.getBookingId());
            m.put("eventId", r.getEvent().getId());
            m.put("eventName", r.getEvent().getName());
            m.put("eventDate", r.getEvent().getEventDate().toString());
            m.put("totalAmount", r.getTotalAmount());
            m.put("advanceAmount", r.getAdvanceAmount());
            m.put("status", r.getStatus().name());
            m.put("cancellationDeadline",
                    r.getCancellationDeadline() != null ? r.getCancellationDeadline().toString() : "");
            m.put("stallCodes",
                    r.getStalls().stream().map(rs -> rs.getStall().getStallCode()).collect(Collectors.joining(", ")));
            m.put("genres",
                    r.getGenres().stream().map(rg -> rg.getGenre().getName()).collect(Collectors.joining(", ")));
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long id, Authentication auth) {
        Long userId = currentUserId(auth);
        if (userId == null)
            return ResponseEntity.status(401).build();
        try {
            reservationService.cancelReservation(id, userId);
            return ResponseEntity.ok(Map.of("message", "Reservation cancelled"));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDetail(@PathVariable Long id, Authentication auth) {
        Long userId = currentUserId(auth);
        if (userId == null)
            return ResponseEntity.status(401).build();
        var list = reservationService.getReservationsForVendor(userId);
        Reservation r = list.stream().filter(res -> res.getId().equals(id)).findFirst().orElse(null);
        if (r == null)
            return ResponseEntity.notFound().build();
        Map<String, Object> m = new HashMap<>();
        m.put("id", r.getId());
        m.put("bookingId", r.getBookingId());
        m.put("eventName", r.getEvent().getName());
        m.put("eventDate", r.getEvent().getEventDate().toString());
        m.put("location", r.getEvent().getLocation());
        m.put("status", r.getStatus().name());
        m.put("cancellationDeadline",
                r.getCancellationDeadline() != null ? r.getCancellationDeadline().toString() : "");
        m.put("stallDescription", r.getStallDescription() != null ? r.getStallDescription() : "");
        m.put("stallCodes",
                r.getStalls().stream().map(rs -> rs.getStall().getStallCode()).collect(Collectors.joining(", ")));
        m.put("genres", r.getGenres().stream().map(rg -> rg.getGenre().getName()).collect(Collectors.joining(", ")));
        m.put("totalAmount", r.getTotalAmount());
        m.put("advanceAmount", r.getAdvanceAmount());
        m.put("qrCodeValue", r.getQrCodeValue() != null ? r.getQrCodeValue() : "");
        return ResponseEntity.ok(m);
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkReservation(@RequestParam Long eventId, Authentication auth) {
        Long userId = currentUserId(auth);
        if (userId == null)
            return ResponseEntity.status(401).build();
        boolean exists = reservationService.hasActiveReservation(userId, eventId);
        return ResponseEntity.ok(Map.of("exists", exists));
    }
}
