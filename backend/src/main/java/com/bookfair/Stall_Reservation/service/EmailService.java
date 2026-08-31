package com.bookfair.Stall_Reservation.service;

import com.bookfair.Stall_Reservation.entity.Reservation;

public interface EmailService {

    void sendBookingConfirmation(Reservation reservation, byte[] qrPng);

    void sendCancellationNotice(Reservation reservation);

    void sendRefundNotice(Reservation reservation);

    void sendEventRemovedNotice(String vendorEmail, String eventName, String bookingId);

    void sendPaymentConfirmation(Reservation reservation, byte[] qrPng);

    void sendCancellationDeadlineReminder(Reservation reservation);

    void sendEventReminder(Reservation reservation);

    void sendVendorCancellationSuccess(Reservation reservation);

    void sendAccountDeactivatedNotice(String email, String name);
}