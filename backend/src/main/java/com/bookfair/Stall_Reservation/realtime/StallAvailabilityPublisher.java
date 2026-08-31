package com.bookfair.Stall_Reservation.realtime;

import com.bookfair.Stall_Reservation.repository.ReservationStallRepository;
import com.bookfair.Stall_Reservation.dto.event.StallBookingEvent;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class StallAvailabilityPublisher {

    private final ReservationStallRepository reservationStallRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public StallAvailabilityPublisher(ReservationStallRepository reservationStallRepository,
                                      SimpMessagingTemplate messagingTemplate) {
        this.reservationStallRepository = reservationStallRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void onStallBooking(StallBookingEvent event) {
        var bookedIds = reservationStallRepository.findBookedStallIdsByEventId(event.getEventId());
        messagingTemplate.convertAndSend("/topic/stalls/" + event.getEventId(), Map.of("bookedStallIds", bookedIds));

        // Notify admin of event
        messagingTemplate.convertAndSend("/topic/admin/updates",
                Map.of("type", "BOOKING_UPDATE", "eventId", event.getEventId()));
    }
}

