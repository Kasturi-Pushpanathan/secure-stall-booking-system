package com.bookfair.Stall_Reservation.service;

import com.bookfair.Stall_Reservation.entity.Reservation;
import com.bookfair.Stall_Reservation.dto.reservation.CreateBookingRequest;

import java.util.List;


//Service interface for reservation business logic
public interface ReservationService {


//  Create a pending reservation for a vendor
    Reservation createPendingReservation(CreateBookingRequest request, Long vendorId);

    void approveReservation(Long reservationId);

    void rejectReservation(Long reservationId);

    void refundReservation(Long reservationId);

    void rejectAndRefund(Long reservationId);

//  Get all reservations for a specific vendor
    List<Reservation> getReservationsForVendor(Long vendorId);

//  Cancel a reservation
    void cancelReservation(Long reservationId, Long vendorId);

//   Get reservation by booking ID
    Reservation getByBookingId(String bookingId);

    boolean hasActiveReservation(Long vendorId, Long eventId);
}
