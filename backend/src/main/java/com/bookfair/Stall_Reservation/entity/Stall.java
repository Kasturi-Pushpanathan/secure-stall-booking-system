package com.bookfair.Stall_Reservation.entity;
import com.bookfair.Stall_Reservation.enums.StallSize;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "stalls", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "event_id", "stall_code" })
})
public class Stall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "stall_code", nullable = false)
    private String stallCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StallSize size;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    private boolean blocked = false;

    private Integer positionX;
    private Integer positionY;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getStallCode() {
        return stallCode;
    }

    public void setStallCode(String stallCode) {
        this.stallCode = stallCode;
    }

    public StallSize getSize() {
        return size;
    }

    public void setSize(StallSize size) {
        this.size = size;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public boolean isBlocked() {
        return blocked;
    }

    public void setBlocked(boolean blocked) {
        this.blocked = blocked;
    }

    public Integer getPositionX() {
        return positionX;
    }

    public void setPositionX(Integer positionX) {
        this.positionX = positionX;
    }

    public Integer getPositionY() {
        return positionY;
    }

    public void setPositionY(Integer positionY) {
        this.positionY = positionY;
    }
}
