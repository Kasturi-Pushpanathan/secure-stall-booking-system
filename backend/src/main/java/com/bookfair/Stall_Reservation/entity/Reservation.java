package com.bookfair.Stall_Reservation.entity;


import com.bookfair.Stall_Reservation.enums.PaymentMethod;
import com.bookfair.Stall_Reservation.enums.ReservationStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String bookingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private User vendor;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal advanceAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.PENDING;

    @Column(length = 2000)
    private String stallDescription;

    private String qrCodeValue;

    private LocalDateTime bookingDatetime;
    private LocalDateTime updatedAt;

    private LocalDate cancellationDeadline;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private String accountNumber;
    private String bankName;
    private String address;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReservationStall> stalls = new ArrayList<>();

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReservationGenre> genres = new ArrayList<>();

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReservationLog> logs = new ArrayList<>();

    private boolean adminAck = false;

    @PrePersist
    public void prePersist() {
        if (bookingDatetime == null)
            bookingDatetime = LocalDateTime.now();
        if (updatedAt == null)
            updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public User getVendor() {
        return vendor;
    }

    public void setVendor(User vendor) {
        this.vendor = vendor;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getAdvanceAmount() {
        return advanceAmount;
    }

    public void setAdvanceAmount(BigDecimal advanceAmount) {
        this.advanceAmount = advanceAmount;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public String getStallDescription() {
        return stallDescription;
    }

    public void setStallDescription(String stallDescription) {
        this.stallDescription = stallDescription;
    }

    public String getQrCodeValue() {
        return qrCodeValue;
    }

    public void setQrCodeValue(String qrCodeValue) {
        this.qrCodeValue = qrCodeValue;
    }

    public LocalDateTime getBookingDatetime() {
        return bookingDatetime;
    }

    public void setBookingDatetime(LocalDateTime bookingDatetime) {
        this.bookingDatetime = bookingDatetime;
    }

    public LocalDate getCancellationDeadline() {
        return cancellationDeadline;
    }

    public void setCancellationDeadline(LocalDate cancellationDeadline) {
        this.cancellationDeadline = cancellationDeadline;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public List<ReservationStall> getStalls() {
        return stalls;
    }

    public void setStalls(List<ReservationStall> stalls) {
        this.stalls = stalls;
    }

    public List<ReservationGenre> getGenres() {
        return genres;
    }

    public void setGenres(List<ReservationGenre> genres) {
        this.genres = genres;
    }

    public List<ReservationLog> getLogs() {
        return logs;
    }

    public void setLogs(List<ReservationLog> logs) {
        this.logs = logs;
    }

    public boolean isAdminAck() {
        return adminAck;
    }

    public void setAdminAck(boolean adminAck) {
        this.adminAck = adminAck;
    }
}
