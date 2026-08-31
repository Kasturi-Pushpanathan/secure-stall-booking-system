package com.bookfair.Stall_Reservation.enums;


public enum ReservationStatus {
    PENDING, // during cancellation period
    SUCCESS, // after cancellation window ends
    CANCELLED,
    REFUNDED,
    EVENT_REMOVED
}
