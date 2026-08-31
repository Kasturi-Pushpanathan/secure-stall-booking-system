package com.bookfair.Stall_Reservation.repository;

import com.bookfair.Stall_Reservation.entity.Event;
import com.bookfair.Stall_Reservation.entity.Reservation;
import com.bookfair.Stall_Reservation.enums.ReservationStatus;
import com.bookfair.Stall_Reservation.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Optional<Reservation> findByBookingId(String bookingId);

    List<Reservation> findByVendorOrderByBookingDatetimeDesc(User vendor);

    List<Reservation> findByEventId(Long eventId);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.event.id = :eventId AND r.status NOT IN ('CANCELLED', 'REFUNDED', 'EVENT_REMOVED')")
    long countActiveByEventId(Long eventId);

    List<Reservation> findByStatusIn(List<ReservationStatus> statuses);

    List<Reservation> findAllByStatus(ReservationStatus status);

    List<Reservation> findAllByStatusOrderByUpdatedAtDesc(ReservationStatus status);

    List<Reservation> findByStatusAndUpdatedAtAfterOrderByUpdatedAtDesc(ReservationStatus status, LocalDateTime date);

    // Count by status only
    long countByStatus(ReservationStatus status);

    List<Reservation> findByStatusAndAdminAck(ReservationStatus status, boolean adminAck);

    // Count by status AND admin_ack flag
    long countByStatusAndAdminAck(ReservationStatus status, boolean adminAck);

    // Count by status and updated after date
    long countByStatusAndUpdatedAtAfter(ReservationStatus status, LocalDateTime dateTime);

    // Count by status and admin_ack and updated after date
    long countByStatusAndAdminAckAndUpdatedAtAfter(ReservationStatus status, boolean adminAck, LocalDateTime dateTime);

    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE r.vendor.id = :vendorId AND r.event.id = :eventId AND r.status IN :statuses")
    boolean existsByVendorIdAndEventIdAndStatusIn(Long vendorId, Long eventId, List<ReservationStatus> statuses);
}
