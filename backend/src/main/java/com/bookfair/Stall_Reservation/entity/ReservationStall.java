package com.bookfair.Stall_Reservation.entity;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "reservation_stalls", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "reservation_id", "stall_id" })
})
public class ReservationStall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stall_id", nullable = false)
    private Stall stall;

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        ReservationStall that = (ReservationStall) o;
        return Objects.equals(reservation != null ? reservation.getId() : null,
                that.reservation != null ? that.reservation.getId() : null)
                && Objects.equals(stall != null ? stall.getId() : null, that.stall != null ? that.stall.getId() : null);
    }

    @Override
    public int hashCode() {
        return Objects.hash(reservation != null ? reservation.getId() : null, stall != null ? stall.getId() : null);
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

    public Stall getStall() {
        return stall;
    }

    public void setStall(Stall stall) {
        this.stall = stall;
    }
}
