package com.bookfair.Stall_Reservation.service.impl;

import com.bookfair.Stall_Reservation.entity.*;
import com.bookfair.Stall_Reservation.enums.ReservationStatus;
import com.bookfair.Stall_Reservation.enums.UserRole;
import com.bookfair.Stall_Reservation.repository.*;
import com.bookfair.Stall_Reservation.service.AdminService;
import com.bookfair.Stall_Reservation.service.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final EventRepository eventRepository;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final ReservationGenreRepository reservationGenreRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AdminServiceImpl(EventRepository eventRepository,
                            ReservationRepository reservationRepository,
                            PaymentRepository paymentRepository,
                            UserRepository userRepository,
                            ReservationGenreRepository reservationGenreRepository,
                            PasswordEncoder passwordEncoder,
                            EmailService emailService) {
        this.eventRepository = eventRepository;
        this.reservationRepository = reservationRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.reservationGenreRepository = reservationGenreRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Override
    public Map<String, Object> getDashboardStats() {
        long totalEvents = eventRepository.count();

        // Get received payments from payments table
        BigDecimal totalReceived = paymentRepository.totalReceived() != null ? paymentRepository.totalReceived()
                : BigDecimal.ZERO;

        // Get pending payments from payments table
        BigDecimal totalPendingFromPayments = paymentRepository.totalPending() != null ? paymentRepository.totalPending()
                : BigDecimal.ZERO;

        // ALSO get pending payments from reservations that are approved but unpaid
        // These are reservations with status='PENDING' AND admin_ack=1
        List<Reservation> pendingPaymentReservations = reservationRepository.findByStatusAndAdminAck(
                ReservationStatus.PENDING, true);

        BigDecimal totalPendingFromReservations = pendingPaymentReservations.stream()
                .map(Reservation::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Combine both sources or use the reservation-based one
        BigDecimal totalPending = totalPendingFromReservations; // Use this if payments table doesn't have entries

        long totalReservations = reservationRepository.count();
        long totalVendors = userRepository.findByRoleAndActiveTrue(UserRole.VENDOR).size();

        // Pending RESERVATIONS (waiting for admin approval) - admin_ack = 0
        long pendingReservations = reservationRepository.countByStatusAndAdminAck(ReservationStatus.PENDING, false);

        // RECENT CANCELLATIONS
        LocalDateTime yesterday = LocalDateTime.now().minusHours(24);
        long recentCancellations = reservationRepository.countByStatusAndUpdatedAtAfter(
                ReservationStatus.CANCELLED, yesterday);

        var upcoming = eventRepository.findUpcomingEvents(LocalDateTime.now());
        Map<String, Object> nextEvent = upcoming.isEmpty() ? Map.of()
                : Map.<String, Object>of(
                "id", upcoming.get(0).getId(),
                "name", upcoming.get(0).getName(),
                "eventDate", upcoming.get(0).getEventDate().toString(),
                "location", upcoming.get(0).getLocation());

        var genres = reservationGenreRepository.countGenres();
        long totalGenreCount = genres.stream().mapToLong(g -> (long) g.get("count")).sum();
        List<Map<String, Object>> genreStats = genres.stream().map(g -> {
            long count = (long) g.get("count");
            double percent = totalGenreCount > 0 ? (count * 100.0 / totalGenreCount) : 0;
            return Map.<String, Object>of("name", g.get("name"), "count", count, "percent", percent);
        }).collect(Collectors.toList());

        return Map.of(
                "totalEvents", totalEvents,
                "totalPendingAmount", totalPendingFromReservations,  // Use this instead
                "totalReceivedAmount", totalReceived,
                "totalReservations", totalReservations,
                "totalVendors", totalVendors,
                "nextUpcomingEvent", nextEvent,
                "genreDistribution", genreStats,
                "pendingReservations", pendingReservations,
                "recentCancellations", recentCancellations);
    }

    @Override
    public List<Map<String, Object>> listVendors() {
        List<User> vendors = userRepository.findByRole(UserRole.VENDOR);
        return vendors.stream()
                .map(v -> Map.<String, Object>of(
                        "id", v.getId(),
                        "name", v.getName(),
                        "email", v.getEmail(),
                        "phone", v.getPhone() != null ? v.getPhone() : ""))
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getVendorDetail(Long id) {
        User vendor = userRepository.findById(id).orElse(null);
        if (vendor == null || vendor.getRole() != UserRole.VENDOR)
            return null;
        List<Reservation> reservations = reservationRepository.findByVendorOrderByBookingDatetimeDesc(vendor);
        List<Map<String, Object>> bookings = reservations.stream()
                // .filter(r -> r.getStatus() != ReservationStatus.CANCELLED && r.getStatus() !=
                // ReservationStatus.EVENT_REMOVED) // User wants to see ALL
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId());
                    map.put("bookingId", r.getBookingId());
                    map.put("eventName", r.getEvent().getName());
                    map.put("status", r.getStatus().name());
                    map.put("paymentMethod", r.getPaymentMethod() != null ? r.getPaymentMethod().name() : "");
                    map.put("accountNumber", r.getAccountNumber() != null ? r.getAccountNumber() : "");
                    map.put("bankName", r.getBankName() != null ? r.getBankName() : "");
                    map.put("address", r.getAddress() != null ? r.getAddress() : "");
                    map.put("totalAmount", r.getTotalAmount());
                    map.put("stallCodes", r.getStalls().stream().map(rs -> rs.getStall().getStallCode())
                            .collect(Collectors.joining(", ")));
                    map.put("genres", r.getGenres().stream().map(rg -> rg.getGenre().getName())
                            .collect(Collectors.joining(", ")));
                    map.put("qrCodeValue", r.getQrCodeValue() != null ? r.getQrCodeValue() : "");

                    // Include logs
                    List<Map<String, Object>> logList = r.getLogs() != null ? r.getLogs().stream()
                            .map(l -> Map.<String, Object>of(
                                    "action", l.getAction(),
                                    "details", l.getDetails(),
                                    "timestamp", l.getTimestamp().toString()))
                            .collect(Collectors.toList()) : List.of();

                    map.put("logs", logList);

                    return map;
                })
                .collect(Collectors.toList());
        return Map.of(
                "id", vendor.getId(),
                "name", vendor.getName(),
                "email", vendor.getEmail(),
                "phone", vendor.getPhone() != null ? vendor.getPhone() : "",
                "businessName", vendor.getBusinessName() != null ? vendor.getBusinessName() : "",
                "reservations", bookings);
    }

    @Override
    @Transactional
    public void deactivateVendor(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        if (user.getRole() != UserRole.VENDOR)
            throw new IllegalArgumentException("User is not a vendor");
        user.setActive(false);
        userRepository.save(user);
        emailService.sendAccountDeactivatedNotice(user.getEmail(), user.getName());
    }

    @Override
    @Transactional
    public void cancelReservation(Long id) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
        r.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(r);
    }

    @Override
    public Map<String, Object> getProfile(Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        return Map.of(
                "name", admin.getName(),
                "email", admin.getEmail(),
                "phone", admin.getPhone() != null ? admin.getPhone() : "");
    }

    @Override
    @Transactional
    public void updateProfile(Long adminId, Map<String, Object> updates) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        if (updates.containsKey("name"))
            admin.setName((String) updates.get("name"));
        if (updates.containsKey("phone"))
            admin.setPhone((String) updates.get("phone"));
        userRepository.save(admin);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public List<Map<String, Object>> listAdmins() {
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        return admins.stream()
                .map(a -> Map.<String, Object>of(
                        "id", a.getId(),
                        "name", a.getName(),
                        "email", a.getEmail(),
                        "phone", a.getPhone() != null ? a.getPhone() : ""))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Long addAdmin(Map<String, String> body) {
        if (userRepository.existsByEmail(body.get("email"))) {
            throw new IllegalArgumentException("Email already exists");
        }
        User admin = new User();
        admin.setName(body.get("name"));
        admin.setEmail(body.get("email"));
        admin.setPhone(body.getOrDefault("phone", ""));
        admin.setPasswordHash(passwordEncoder.encode(body.get("password")));
        admin.setRole(UserRole.ADMIN);
        userRepository.save(admin);
        return admin.getId();
    }

    @Override
    @Transactional
    public void removeAdmin(Long id) {
        User admin = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        if (admin.getRole() != UserRole.ADMIN)
            throw new IllegalArgumentException("User is not an admin");
        userRepository.delete(admin);
    }

}
