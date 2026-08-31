package com.bookfair.Stall_Reservation.scheduler;

import com.bookfair.Stall_Reservation.entity.Reservation;
import com.bookfair.Stall_Reservation.enums.ReservationStatus;
import com.bookfair.Stall_Reservation.repository.ReservationRepository;
import com.bookfair.Stall_Reservation.service.EmailService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class ReservationScheduler {

    private final ReservationRepository reservationRepository;
    private final EmailService emailService;

    public ReservationScheduler(ReservationRepository reservationRepository, EmailService emailService) {
        this.reservationRepository = reservationRepository;
        this.emailService = emailService;
    }

    //Cancellation Deadline Reminder
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional(readOnly = true)
    public void sendCancellationDeadLineReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Reservation> reservations = reservationRepository.findAllByStatus(ReservationStatus.SUCCESS);

        for (Reservation r : reservations) {
            if (r.getCancellationDeadline() != null && r.getCancellationDeadline().isEqual(tomorrow)) {
                emailService.sendCancellationDeadlineReminder(r);
            }
        }
    }

    // Event Reminder
    @Scheduled(cron = "0 0 10 * * *")
    @Transactional(readOnly = true)
    public void sendEventReminders() {
        LocalDate targetDate = LocalDate.now().plusDays(2);

        List<Reservation> reservations = reservationRepository.findAllByStatus(ReservationStatus.SUCCESS);
        for (Reservation r : reservations) {
            LocalDate eventDate = r.getEvent().getEventDate().toLocalDate();
            if (eventDate.isEqual(targetDate)) {
                emailService.sendEventReminder(r);
            }
        }
    }
}
