package com.bookfair.Stall_Reservation.entity;
import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "reservation_genres", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "reservation_id", "genre_id" })
})
public class ReservationGenre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "genre_id", nullable = false)
    private Genre genre;

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        ReservationGenre that = (ReservationGenre) o;
        return Objects.equals(reservation != null ? reservation.getId() : null,
                that.reservation != null ? that.reservation.getId() : null)
                && Objects.equals(genre != null ? genre.getId() : null, that.genre != null ? that.genre.getId() : null);
    }

    @Override
    public int hashCode() {
        return Objects.hash(reservation != null ? reservation.getId() : null, genre != null ? genre.getId() : null);
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

    public Genre getGenre() {
        return genre;
    }

    public void setGenre(Genre genre) {
        this.genre = genre;
    }
}
