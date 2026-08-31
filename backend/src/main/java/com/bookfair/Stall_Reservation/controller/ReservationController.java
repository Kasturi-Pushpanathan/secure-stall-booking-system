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
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ReservationController.class);

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
            logger.info("Audit Log: Vendor ID {} requested booking for event ID {}", userId, request.getEventId());
            Reservation r = reservationService.createPendingReservation(request, userId);
            logger.info("Audit Log: Vendor ID {} successfully reserved stalls for event ID {}, bookingId: {}", userId, request.getEventId(), r.getBookingId());
            return ResponseEntity.ok(Map.of(
                    "reservationId", r.getId(),
                    "bookingId", r.getBookingId(),
                    "advanceAmount", r.getAdvanceAmount(),
                    "totalAmount", r.getTotalAmount()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.warn("Audit Log: Vendor ID {} booking request failed: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveReservation(@PathVariable Long id, Authentication auth) {
        try {
            logger.info("Audit Log: Admin/Organizer approved reservation ID {}", id);
            reservationService.approveReservation(id);
            return ResponseEntity.ok(Map.of("message", "Reservation approved"));
        } catch (Exception e) {
            logger.error("Audit Log: Failed to approve reservation ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectReservation(@PathVariable Long id, Authentication auth) {
        try {
            logger.info("Audit Log: Admin/Organizer rejected reservation ID {}", id);
            reservationService.rejectReservation(id);
            return ResponseEntity.ok(Map.of("message", "Reservation rejected"));
        } catch (Exception e) {
            logger.error("Audit Log: Failed to reject reservation ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<?> refundReservation(@PathVariable Long id, Authentication auth) {
        try {
            logger.info("Audit Log: Admin/Organizer refunded reservation ID {}", id);
            reservationService.refundReservation(id);
            return ResponseEntity.ok(Map.of("message", "Reservation refunded"));
        } catch (Exception e) {
            logger.error("Audit Log: Failed to refund reservation ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject-refund")
    public ResponseEntity<?> rejectAndRefund(@PathVariable Long id, Authentication auth) {
        try {
            logger.info("Audit Log: Admin/Organizer rejected & refunded reservation ID {}", id);
            reservationService.rejectAndRefund(id);
            return ResponseEntity.ok(Map.of("message", "Reservation rejected and refund initiated"));
        } catch (Exception e) {
            logger.error("Audit Log: Failed to reject & refund reservation ID {}: {}", id, e.getMessage());
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
            m.put("reservationDate", r.getReservationDate() != null ? r.getReservationDate().toString() : "");
            m.put("stallType", r.getStallType() != null ? r.getStallType() : "");
            m.put("preferredStallSize", r.getPreferredStallSize() != null ? r.getPreferredStallSize() : "");
            m.put("stallsRequired", r.getStallsRequired() != null ? r.getStallsRequired() : 0);
            m.put("businessCategory", r.getBusinessCategory() != null ? r.getBusinessCategory() : "");
            m.put("specialRequirements", r.getSpecialRequirements() != null ? r.getSpecialRequirements() : "");
            m.put("vendorUsername", r.getVendor().getEmail());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long id, Authentication auth) {
        Long userId = currentUserId(auth);
        if (userId == null)
            return ResponseEntity.status(401).build();
        
        Reservation r = reservationService.getReservationById(id);
        if (r == null)
            return ResponseEntity.notFound().build();

        // Broken Access Control check: only the owner or an admin can cancel a reservation
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !r.getVendor().getId().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied: You do not own this reservation."));
        }

        try {
            logger.info("Audit Log: User ID {} requested cancellation of reservation ID {}", userId, id);
            reservationService.cancelReservation(id, r.getVendor().getId());
            logger.info("Audit Log: Reservation ID {} cancelled successfully", id);
            return ResponseEntity.ok(Map.of("message", "Reservation cancelled"));
        } catch (IllegalStateException | IllegalArgumentException e) {
            logger.warn("Audit Log: Cancellation failed for reservation ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDetail(@PathVariable Long id, Authentication auth) {
        Long userId = currentUserId(auth);
        if (userId == null)
            return ResponseEntity.status(401).build();
        
        Reservation r = reservationService.getReservationById(id);
        if (r == null)
            return ResponseEntity.notFound().build();

        // Broken Access Control check: Stall Vendor can only view their own reservations.
        // Exhibition Organizer (ROLE_ADMIN) can view all.
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !r.getVendor().getId().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied: You do not own this reservation."));
        }

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
        m.put("reservationDate", r.getReservationDate() != null ? r.getReservationDate().toString() : "");
        m.put("stallType", r.getStallType() != null ? r.getStallType() : "");
        m.put("preferredStallSize", r.getPreferredStallSize() != null ? r.getPreferredStallSize() : "");
        m.put("stallsRequired", r.getStallsRequired() != null ? r.getStallsRequired() : 0);
        m.put("businessCategory", r.getBusinessCategory() != null ? r.getBusinessCategory() : "");
        m.put("specialRequirements", r.getSpecialRequirements() != null ? r.getSpecialRequirements() : "");
        m.put("vendorUsername", r.getVendor().getEmail());
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
