package com.bookfair.Stall_Reservation.controller.admin;

import com.bookfair.Stall_Reservation.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminService adminService;

    public AdminUserController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listVendors() {
        return ResponseEntity.ok(adminService.listVendors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getVendor(@PathVariable Long id) {
        Map<String, Object> detail = adminService.getVendorDetail(id);
        if (detail == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(detail);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeVendor(@PathVariable Long id) {
        try {
            adminService.deactivateVendor(id);
            return ResponseEntity.ok(Map.of("message", "Vendor deactivated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/reservations/{reservationId}")
    public ResponseEntity<?> removeReservation(@PathVariable Long userId, @PathVariable Long reservationId) {
        try {
            adminService.cancelReservation(reservationId);
            return ResponseEntity.ok(Map.of("message", "Reservation cancelled"));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
