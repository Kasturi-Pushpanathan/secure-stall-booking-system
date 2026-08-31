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

    @NotNull(message = "Reservation date is required")
    private java.time.LocalDate reservationDate;

    @NotEmpty(message = "Stall type is required")
    private String stallType;

    @NotEmpty(message = "Preferred stall size is required")
    private String preferredStallSize;

    @NotNull(message = "Number of stalls is required")
    @jakarta.validation.constraints.Min(value = 1, message = "Number of stalls must be at least 1")
    private Integer stallsRequired;

    @NotEmpty(message = "Business category is required")
    private String businessCategory;

    private String specialRequirements;

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

    public java.time.LocalDate getReservationDate() {
        return reservationDate;
    }

    public void setReservationDate(java.time.LocalDate reservationDate) {
        this.reservationDate = reservationDate;
    }

    public String getStallType() {
        return stallType;
    }

    public void setStallType(String stallType) {
        this.stallType = stallType;
    }

    public String getPreferredStallSize() {
        return preferredStallSize;
    }

    public void setPreferredStallSize(String preferredStallSize) {
        this.preferredStallSize = preferredStallSize;
    }

    public Integer getStallsRequired() {
        return stallsRequired;
    }

    public void setStallsRequired(Integer stallsRequired) {
        this.stallsRequired = stallsRequired;
    }

    public String getBusinessCategory() {
        return businessCategory;
    }

    public void setBusinessCategory(String businessCategory) {
        this.businessCategory = businessCategory;
    }

    public String getSpecialRequirements() {
        return specialRequirements;
    }

    public void setSpecialRequirements(String specialRequirements) {
        this.specialRequirements = specialRequirements;
    }
}
