package com.bookfair.Stall_Reservation.dto.reservation;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class CreateBookingRequest {
    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotEmpty(message = "At least one stall must be selected")
    private List<Long> stallIds;

    @NotEmpty(message = "At least one genre must be selected")
    private List<Long> genreIds;

    private String stallDescription;

    @NotNull(message = "Payment method is required")
    private String paymentMethod;

    @NotEmpty(message = "Account number is required")
    private String accountNumber;

    @NotEmpty(message = "Bank name is required")
    private String bankName;

    @NotEmpty(message = "Address is required")
    private String address;

    // Getters and Setters
    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public List<Long> getStallIds() {
        return stallIds;
    }

    public void setStallIds(List<Long> stallIds) {
        this.stallIds = stallIds;
    }

    public List<Long> getGenreIds() {
        return genreIds;
    }

    public void setGenreIds(List<Long> genreIds) {
        this.genreIds = genreIds;
    }

    public String getStallDescription() {
        return stallDescription;
    }

    public void setStallDescription(String stallDescription) {
        this.stallDescription = stallDescription;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
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
}
