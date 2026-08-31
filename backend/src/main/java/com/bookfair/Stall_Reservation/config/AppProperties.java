package com.bookfair.Stall_Reservation.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Booking booking = new Booking();
    private Cancellation cancellation = new Cancellation();

    public static class Booking {
        private int maxStallsPerBooking = 3;
        private int advancePercent = 10;
        private int daysBeforeEventNoBooking = 3;

        public int getMaxStallsPerBooking() { return maxStallsPerBooking; }
        public void setMaxStallsPerBooking(int maxStallsPerBooking) { this.maxStallsPerBooking = maxStallsPerBooking; }
        public int getAdvancePercent() { return advancePercent; }
        public void setAdvancePercent(int advancePercent) { this.advancePercent = advancePercent; }
        public int getDaysBeforeEventNoBooking() { return daysBeforeEventNoBooking; }
        public void setDaysBeforeEventNoBooking(int daysBeforeEventNoBooking) { this.daysBeforeEventNoBooking = daysBeforeEventNoBooking; }
    }

    public static class Cancellation {
        private int allowedDaysBefore = 7;

        public int getAllowedDaysBefore() { return allowedDaysBefore; }
        public void setAllowedDaysBefore(int allowedDaysBefore) { this.allowedDaysBefore = allowedDaysBefore; }
    }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
    public Cancellation getCancellation() { return cancellation; }
    public void setCancellation(Cancellation cancellation) { this.cancellation = cancellation; }
}

