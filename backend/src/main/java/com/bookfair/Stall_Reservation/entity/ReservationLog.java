package com.bookfair.Stall_Reservation.entity;


import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservation_logs")
public class ReservationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    private String action; // e.g., "CREATED", "APPROVED", "CANCELLED"

    @Column(length = 1000)
    private String details;

    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        if (timestamp == null)
            timestamp = LocalDateTime.now();
    }

    public ReservationLog() {
    }

    public ReservationLog(Reservation reservation, String action, String details) {
        this.reservation = reservation;
        this.action = action;
        this.details = details;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Reservation getReservation() {
        return reservation;
    }

    public void setReservation(Reservation reservation) {
        this.reservation = reservation;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
