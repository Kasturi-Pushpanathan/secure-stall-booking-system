package com.bookfair.Stall_Reservation.service.impl;

import com.bookfair.Stall_Reservation.config.AppProperties;
import com.bookfair.Stall_Reservation.entity.*;
import com.bookfair.Stall_Reservation.enums.*;
import com.bookfair.Stall_Reservation.service.EmailService;
import com.bookfair.Stall_Reservation.service.QrCodeService;
import com.bookfair.Stall_Reservation.repository.*;
import com.bookfair.Stall_Reservation.dto.reservation.CreateBookingRequest;
import com.bookfair.Stall_Reservation.dto.event.StallBookingEvent;
import com.bookfair.Stall_Reservation.service.ReservationService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReservationServiceImpl implements ReservationService {

    private final EventRepository eventRepository;
    private final StallRepository stallRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationStallRepository reservationStallRepository;
    private final ReservationGenreRepository reservationGenreRepository;
    private final GenreRepository genreRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final QrCodeService qrCodeService;
    private final EmailService emailService;
    private final AppProperties appProperties;
    private final ApplicationEventPublisher eventPublisher;

    public ReservationServiceImpl(EventRepository eventRepository, StallRepository stallRepository,
                                  ReservationRepository reservationRepository,
                                  ReservationStallRepository reservationStallRepository,
                                  ReservationGenreRepository reservationGenreRepository,
                                  GenreRepository genreRepository, UserRepository userRepository,
                                  PaymentRepository paymentRepository, QrCodeService qrCodeService,
                                  EmailService emailService, AppProperties appProperties,
                                  ApplicationEventPublisher eventPublisher) {
        this.eventRepository = eventRepository;
        this.stallRepository = stallRepository;
        this.reservationRepository = reservationRepository;
        this.reservationStallRepository = reservationStallRepository;
        this.reservationGenreRepository = reservationGenreRepository;
        this.genreRepository = genreRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.qrCodeService = qrCodeService;
        this.emailService = emailService;
        this.appProperties = appProperties;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public Reservation createPendingReservation(CreateBookingRequest request, Long vendorId) {
        int maxStalls = appProperties.getBooking().getMaxStallsPerBooking();
        if (request.getStallIds().size() > maxStalls) {
            throw new IllegalArgumentException("Maximum " + maxStalls + " stalls per booking.");
        }

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));

        int daysNoBooking = appProperties.getBooking().getDaysBeforeEventNoBooking();
        LocalDate eventDate = event.getEventDate().toLocalDate();
        LocalDate cutoff = eventDate.minusDays(daysNoBooking);
        if (LocalDate.now().isAfter(cutoff) || !LocalDate.now().isBefore(eventDate)) {
            throw new IllegalStateException("Booking is not allowed within " + daysNoBooking + " days of the event.");
        }

        // Check if vendor already has an active reservation for this event
        boolean exists = reservationRepository.existsByVendorIdAndEventIdAndStatusIn(
                vendorId, event.getId(), List.of(ReservationStatus.PENDING, ReservationStatus.SUCCESS));
        if (exists) {
            throw new IllegalStateException("You already have an active reservation for this event.");
        }

        List<Stall> stalls = stallRepository.findAllById(request.getStallIds());
        if (stalls.size() != request.getStallIds().size()) {
            throw new IllegalArgumentException("Some stalls not found.");
        }
        for (Stall s : stalls) {
            if (s.isBlocked())
                throw new IllegalStateException("Stall " + s.getStallCode() + " is blocked.");
            if (!s.getEvent().getId().equals(event.getId())) {
                throw new IllegalArgumentException("All stalls must belong to this event.");
            }
        }

        List<Long> alreadyBooked = reservationStallRepository.findBookedStallIdsByEventId(event.getId());
        for (Stall s : stalls) {
            if (alreadyBooked.contains(s.getId())) {
                throw new IllegalStateException("Stall " + s.getStallCode() + " is already booked.");
            }
        }

        BigDecimal total = stalls.stream().map(Stall::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
        int advancePct = appProperties.getBooking().getAdvancePercent();
        BigDecimal advance = total
                .multiply(BigDecimal.valueOf(advancePct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));

        String bookingId = "BF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Reservation reservation = new Reservation();
        reservation.setBookingId(bookingId);
        reservation.setEvent(event);
        reservation.setVendor(vendor);
        reservation.setTotalAmount(total);
        reservation.setAdvanceAmount(advance);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setStallDescription(request.getStallDescription());
        reservation.setQrCodeValue(bookingId);
        int cancelDays = appProperties.getCancellation().getAllowedDaysBefore();
        reservation.setCancellationDeadline(eventDate.minusDays(cancelDays));

        reservation.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod())); // Enum validation handled by

        // valueOf or earlier
        reservation.setAccountNumber(request.getAccountNumber());
        reservation.setBankName(request.getBankName());
        reservation.setAddress(request.getAddress());

        reservationRepository.save(reservation);

        for (Stall stall : stalls) {
            ReservationStall rs = new ReservationStall();
            rs.setReservation(reservation);
            rs.setStall(stall);
            reservation.getStalls().add(rs);
            reservationStallRepository.save(rs);
        }

        if (request.getGenreIds() != null && !request.getGenreIds().isEmpty()) {
            List<Genre> genres = genreRepository.findAllById(request.getGenreIds());
            for (Genre g : genres) {
                ReservationGenre rg = new ReservationGenre();
                rg.setReservation(reservation);
                rg.setGenre(g);
                reservation.getGenres().add(rg);
                reservationGenreRepository.save(rg);
            }
        }

        Payment payment = new Payment();
        payment.setReservation(reservation);
        payment.setAmount(advance);
        payment.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);

        // Notify vendor immediately of pending reservation
        byte[] qrPng = qrCodeService.generatePng(reservation.getBookingId(), 256);

        emailService.sendBookingConfirmation(reservation, qrPng);

        eventPublisher.publishEvent(new StallBookingEvent(this, request.getEventId()));

        return reservation;
    }

    @Override
    @Transactional
    public void approveReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
        Payment payment = paymentRepository.findByReservation(reservation)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        if (reservation.getStatus() == ReservationStatus.SUCCESS) {
            return; // Already approved
        }

        reservation.setStatus(ReservationStatus.SUCCESS);
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        reservationRepository.save(reservation);

        // Re-send confirmation or just status update? Prompt says "Send confirmation email"
        // We can regenerate QR or just send the email.
        byte[] qrPng = qrCodeService.generatePng(reservation.getBookingId(), 256);

        reservation.getVendor().getEmail();
        reservation.getEvent().getName();

        emailService.sendPaymentConfirmation(reservation, qrPng);

        eventPublisher.publishEvent(
                new StallBookingEvent(this, reservation.getEvent() != null ? reservation.getEvent().getId() : 0L));
    }

    @Override
    @Transactional
    public void refundReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        if (reservation.getStatus() == ReservationStatus.REFUNDED) {
            return;
        }

        reservation.setStatus(ReservationStatus.REFUNDED);
        reservationRepository.save(reservation);

        Payment payment = paymentRepository.findByReservation(reservation).orElse(null);
        if (payment != null) {
            payment.setStatus(PaymentStatus.REFUNDED);
            payment.setRefundedAt(LocalDateTime.now());
            paymentRepository.save(payment);
        }

        reservation.getVendor().getEmail();
        reservation.getEvent().getName();

        reservation.getLogs().add(new ReservationLog(reservation, "REFUNDED", "Reservation refunded by Admin."));
        reservationRepository.save(reservation);

        emailService.sendRefundNotice(reservation);
        eventPublisher.publishEvent(new StallBookingEvent(this, reservation.getEvent().getId()));
    }

    @Override
    @Transactional
    public void rejectReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            return;
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        reservation.getVendor().getEmail();
        reservation.getEvent().getName();

        emailService.sendCancellationNotice(reservation);
        eventPublisher.publishEvent(new StallBookingEvent(this, reservation.getEvent().getId()));
    }

    @Override
    @Transactional
    public void rejectAndRefund(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        // Allow transitioning from PENDING or APPROVED/SUCCESS to REFUNDED
        if (reservation.getStatus() == ReservationStatus.REFUNDED) {
            return;
        }

        reservation.setStatus(ReservationStatus.REFUNDED);
        reservationRepository.save(reservation);

        Payment payment = paymentRepository.findByReservation(reservation).orElse(null);
        if (payment != null) {
            payment.setStatus(PaymentStatus.REFUNDED);
            payment.setRefundedAt(LocalDateTime.now());
            paymentRepository.save(payment);
        }

        reservation.getVendor().getEmail();
        reservation.getEvent().getName();

        emailService.sendRefundNotice(reservation);
        eventPublisher.publishEvent(new StallBookingEvent(this, reservation.getEvent().getId()));
    }

    @Override
    public List<Reservation> getReservationsForVendor(Long vendorId) {
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        return reservationRepository.findByVendorOrderByBookingDatetimeDesc(vendor);
    }

    @Override
    @Transactional
    public void cancelReservation(Long reservationId, Long vendorId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
        if (!reservation.getVendor().getId().equals(vendorId)) {
            throw new IllegalArgumentException("Not your reservation");
        }
        if (LocalDate.now().isAfter(reservation.getCancellationDeadline())) {
            throw new IllegalStateException("Cancellation deadline has passed.");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        // If payment was completed, auto-refund
        Payment payment = paymentRepository.findByReservation(reservation).orElse(null);
        if (payment != null && payment.getStatus() == PaymentStatus.COMPLETED) {
            payment.setStatus(PaymentStatus.REFUNDED);
            payment.setRefundedAt(LocalDateTime.now());
            paymentRepository.save(payment);
        }

        // LOG
        reservation.setAdminAck(false); // Reset ack so admin sees it
        reservation.getLogs().add(new ReservationLog(reservation, "CANCELLED", "Reservation cancelled by Vendor."));
        reservationRepository.save(reservation);

        emailService.sendVendorCancellationSuccess(reservation);
        eventPublisher.publishEvent(new StallBookingEvent(this, reservation.getEvent().getId()));
    }

    @Override
    public Reservation getByBookingId(String bookingId) {
        return reservationRepository.findByBookingId(bookingId).orElse(null);
    }

    @Override
    public boolean hasActiveReservation(Long vendorId, Long eventId) {
        return reservationRepository.existsByVendorIdAndEventIdAndStatusIn(
                vendorId, eventId, List.of(ReservationStatus.PENDING, ReservationStatus.SUCCESS));
    }
}