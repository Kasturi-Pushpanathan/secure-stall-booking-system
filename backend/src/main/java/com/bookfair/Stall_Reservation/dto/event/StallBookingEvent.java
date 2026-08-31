package com.bookfair.Stall_Reservation.dto.event;

import org.springframework.context.ApplicationEvent;

public class StallBookingEvent extends ApplicationEvent {
    private final Long eventId;

    public StallBookingEvent(Object source, Long eventId) {
        super(source);
        this.eventId = eventId;
    }

    public Long getEventId() {
        return eventId;
    }
}
