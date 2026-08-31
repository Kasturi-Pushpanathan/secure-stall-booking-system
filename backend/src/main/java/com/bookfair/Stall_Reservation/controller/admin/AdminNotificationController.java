package com.bookfair.Stall_Reservation.controller.admin;

import com.bookfair.Stall_Reservation.entity.Reservation;
import com.bookfair.Stall_Reservation.enums.ReservationStatus;
import com.bookfair.Stall_Reservation.repository.ReservationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminNotificationController {

    private final ReservationRepository reservationRepository;

    public AdminNotificationController(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Map<String, Object>>> getNotifications() {
        List<Map<String, Object>> notifications = new ArrayList<>();

        List<Reservation> pending = reservationRepository
                .findAllByStatusOrderByUpdatedAtDesc(ReservationStatus.PENDING);
        for (Reservation r : pending) {
            if (r.isAdminAck())
                continue;

            Map<String, Object> n = new HashMap<>();
            n.put("id", r.getId());
            n.put("type", "PENDING_RESERVATION");
            n.put("message",
                    "Pending reservation from " + (r.getVendor() != null ? r.getVendor().getName() : "Unknown"));
            n.put("link",
                    "/admin/users/" + (r.getVendor() != null ? r.getVendor().getId() : "") + "?highlight=" + r.getId());
            n.put("time", r.getUpdatedAt() != null ? r.getUpdatedAt().toString() : r.getBookingDatetime().toString());
            n.put("isNew", true);
            notifications.add(n);
        }

        LocalDateTime last24h = LocalDateTime.now().minusHours(24);
        List<Reservation> cancelled = reservationRepository
                .findByStatusAndUpdatedAtAfterOrderByUpdatedAtDesc(ReservationStatus.CANCELLED, last24h);
        for (Reservation r : cancelled) {
            if (r.isAdminAck())
                continue;

            Map<String, Object> n = new HashMap<>();
            n.put("id", r.getId());
            n.put("type", "CANCELLED_RESERVATION");
            n.put("message", "Reservation " + r.getBookingId() + " was cancelled.");
            n.put("link",
                    "/admin/users/" + (r.getVendor() != null ? r.getVendor().getId() : "") + "?highlight=" + r.getId());
            n.put("time", r.getUpdatedAt().toString());
            n.put("isNew", true);
            notifications.add(n);
        }

        notifications.sort((a, b) -> {
            String t1 = (String) a.get("time");
            String t2 = (String) b.get("time");
            return t2.compareTo(t1);
        });

        return ResponseEntity.ok(notifications);
    }

    @org.springframework.web.bind.annotation.PostMapping("/notifications/mark-read/{reservationId}")
    public ResponseEntity<?> markAsRead(@org.springframework.web.bind.annotation.PathVariable Long reservationId) {
        Reservation r = reservationRepository.findById(reservationId).orElse(null);
        if (r != null) {
            r.setAdminAck(true);
            reservationRepository.save(r);
        }
        return ResponseEntity.ok().build();
    }
}
