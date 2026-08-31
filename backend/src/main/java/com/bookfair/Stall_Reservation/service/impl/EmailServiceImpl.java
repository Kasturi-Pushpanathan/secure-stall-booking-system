package com.bookfair.Stall_Reservation.service.impl;

import com.bookfair.Stall_Reservation.entity.Reservation;
import com.bookfair.Stall_Reservation.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    private static final String SUPPORT_EMAIL = "support@bookfairmanagement.com";
    private static final String WEBSITE_URL = "https://bookfairmanagement.com";
    private static final String PHONE_NUMBER = "+91 98765 43210";
    private static final String SYSTEM_NAME = "Book Fair Management System";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    //SHARED TEMPLATE UTILITIES

    private String wrapInLayout(String headline, String headlineColor, String bodyContent) {
        return "<!DOCTYPE html>"
                + "<html lang='en'><head><meta charset='UTF-8'/>"
                + "<meta name='viewport' content='width=device-width, initial-scale=1.0'/>"
                + "<title>" + SYSTEM_NAME + "</title></head>"
                + "<body style='margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;'>"
                + "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background-color:#f4f6f9;padding:30px 0;'>"
                + "<tr><td align='center'>"
                // Header Banner
                + "<table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%;'>"
                + "<tr><td style='background:linear-gradient(135deg," + headlineColor
                + ",#1a237e);padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;'>"
                + "<h1 style='margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;'>"
                + SYSTEM_NAME + "</h1>"
                + "</td></tr></table>"
                // Main Card
                + "<table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%;background-color:#ffffff;border-radius:0 0 12px 12px;box-shadow:0 4px 20px rgba(0,0,0,0.08);'>"
                + "<tr><td style='padding:32px 36px;'>"
                + "<h2 style='margin:0 0 24px;color:#1a237e;font-size:20px;font-weight:700;border-bottom:3px solid "
                + headlineColor + ";padding-bottom:12px;'>" + headline + "</h2>"
                + bodyContent
                + "<hr style='border:none;border-top:1px solid #e0e0e0;margin:28px 0 20px;'/>"
                + "<p style='margin:0 0 6px;font-size:13px;color:#757575;'>Need help? Contact our support team:</p>"
                + "<p style='margin:0;font-size:13px;color:#1a237e;'>"
                + "&#9993; <a href='mailto:" + SUPPORT_EMAIL + "' style='color:#1a237e;text-decoration:none;'>"
                + SUPPORT_EMAIL + "</a>"
                + " &nbsp;|&nbsp; &#9742; " + PHONE_NUMBER + "</p>"
                + "</td></tr></table>"
                // Footer
                + "<table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%;'>"
                + "<tr><td style='padding:20px 36px;text-align:center;'>"
                + "<p style='margin:0 0 4px;font-size:12px;color:#9e9e9e;'>&copy; " + java.time.Year.now().getValue()
                + " " + SYSTEM_NAME + ". All rights reserved.</p>"
                + "<p style='margin:0;font-size:12px;'><a href='" + WEBSITE_URL
                + "' style='color:#1a237e;text-decoration:none;'>" + WEBSITE_URL + "</a></p>"
                + "</td></tr></table>"
                + "</td></tr></table></body></html>";
    }

    private String badge(String text, String bgColor) {
        return "<span style='display:inline-block;padding:4px 14px;border-radius:20px;background-color:"
                + bgColor
                + ";color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;'>"
                + text + "</span>";
    }

    private String detailRow(String label, String value) {
        return "<tr>"
                + "<td style='padding:8px 12px;font-size:14px;color:#616161;font-weight:600;border-bottom:1px solid #f5f5f5;width:40%;'>"
                + label + "</td>"
                + "<td style='padding:8px 12px;font-size:14px;color:#212121;border-bottom:1px solid #f5f5f5;'>"
                + safe(value) + "</td>"
                + "</tr>";
    }

    private String detailTable(String... rows) {
        StringBuilder sb = new StringBuilder();
        sb.append(
                "<table width='100%' cellpadding='0' cellspacing='0' style='border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;margin:16px 0;'>");
        for (String row : rows) {
            sb.append(row);
        }
        sb.append("</table>");
        return sb.toString();
    }

    private String getStallCodes(Reservation r) {
        try {
            return r.getStalls().stream()
                    .map(rs -> rs.getStall().getStallCode())
                    .collect(Collectors.joining(", "));
        } catch (Exception e) {
            return "-";
        }
    }

    private String getGenres(Reservation r) {
        try {
            return r.getGenres().stream()
                    .map(rg -> rg.getGenre().getName())
                    .collect(Collectors.joining(", "));
        } catch (Exception e) {
            return "-";
        }
    }

    private String safe(Object val) {
        return val != null ? val.toString() : "-";
    }

    private String qrSection(boolean confirmed) {
        String note = confirmed
                ? "<p style='margin:12px 0 0;font-size:13px;color:#2e7d32;font-weight:600;'>&#10004; Present this QR code at the venue entry</p>"
                : "<p style='margin:12px 0 0;font-size:12px;color:#ef6c00;font-weight:600;'>&#9888; Valid only after payment confirmation</p>";
        String bg = confirmed ? "#e8f5e9" : "#f9fbe7";
        String border = confirmed ? "#66bb6a" : "#c5e1a5";
        return "<div style='text-align:center;margin:24px 0;padding:24px;background-color:" + bg
                + ";border-radius:8px;border:2px dashed " + border + ";'>"
                + "<p style='margin:0 0 12px;font-size:15px;font-weight:700;color:#33691e;'>Your Booking QR Code</p>"
                + "<img src='cid:qrCodeImage' alt='QR Code' style='width:200px;height:200px;border:4px solid #ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);'/>"
                + note + "</div>";
    }


    private void sendPlainTextFallback(String to, String subject, String text) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, false);
            mailSender.send(msg);
        } catch (Exception ignored) {
            // Silently fail
        }
    }

    // EMAIL 1: BOOKING CREATED (PENDING)

    @Override
    @Async
    public void sendBookingConfirmation(Reservation reservation, byte[] qrPng) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(reservation.getVendor().getEmail());
            helper.setSubject("Booking Received - Awaiting Payment Confirmation - " + reservation.getBookingId());

            String body = "<p style='margin:0 0 16px;font-size:15px;color:#424242;line-height:1.6;'>"
                    + "Dear <strong>" + safe(reservation.getVendor().getName()) + "</strong>,</p>"
                    + "<p style='margin:0 0 20px;font-size:14px;color:#616161;line-height:1.6;'>"
                    + "Thank you for your booking! We have received your reservation request and payment details. "
                    + "Our admin team will verify your payment shortly.</p>"
                    + "<h3 style='margin:0 0 8px;font-size:16px;color:#1a237e;'>Booking Details</h3>"
                    + detailTable(
                    detailRow("Booking ID", "<strong>" + safe(reservation.getBookingId()) + "</strong>"),
                    detailRow("Event", safe(reservation.getEvent().getName())),
                    detailRow("Event Date", safe(reservation.getEvent().getEventDate())),
                    detailRow("Location", safe(reservation.getEvent().getLocation())),
                    detailRow("Stall(s)", getStallCodes(reservation)),
                    detailRow("Genre(s)", getGenres(reservation)),
                    detailRow("Total Amount", "Rs. " + safe(reservation.getTotalAmount())),
                    detailRow("Advance Amount", "Rs. " + safe(reservation.getAdvanceAmount())),
                    detailRow("Payment Method", safe(reservation.getPaymentMethod())),
                    detailRow("Payment Status", badge("PENDING", "#ff9800")))
                    + (qrPng != null ? qrSection(false) : "")
                    + "<div style='padding:16px;background-color:#fff3e0;border-left:4px solid #ff9800;border-radius:0 8px 8px 0;margin:16px 0;'>"
                    + "<p style='margin:0;font-size:14px;color:#e65100;font-weight:600;'>What happens next?</p>"
                    + "<ul style='margin:8px 0 0;padding-left:20px;font-size:13px;color:#616161;line-height:1.8;'>"
                    + "<li>Our admin team will review and verify your payment</li>"
                    + "<li>You will receive a <strong>Payment Confirmation</strong> email once approved</li>"
                    + "<li>Your QR code will be activated after confirmation</li>"
                    + "</ul></div>";

            helper.setText(wrapInLayout("Your Booking Has Been Received", "#ff9800", body), true);
            if (qrPng != null) {
                helper.addInline("qrCodeImage", new ByteArrayResource(qrPng), "image/png");
            }
            mailSender.send(msg);
        } catch (Exception e) {
            sendPlainTextFallback(
                    reservation.getVendor().getEmail(),
                    "Booking Received - " + reservation.getBookingId(),
                    "Dear " + safe(reservation.getVendor().getName()) + ",\n\n"
                            + "Your booking " + reservation.getBookingId() + " for "
                            + safe(reservation.getEvent().getName())
                            + " has been received.\nTotal: Rs. " + safe(reservation.getTotalAmount())
                            + "\nStatus: PENDING\n\nOur admin team will verify your payment shortly.\n\n"
                            + "Thank you,\n" + SYSTEM_NAME);
        }
    }

// EMAIL 2: PAYMENT CONFIRMED (Admin Approved) + QR

    @Override
    @Async
    public void sendPaymentConfirmation(Reservation reservation, byte[] qrPng) {

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(reservation.getVendor().getEmail());
            helper.setSubject("Payment Confirmed - Booking " + reservation.getBookingId());

            String body = "<p style='margin:0 0 16px;font-size:15px;color:#424242;line-height:1.6;'>"
                    + "Dear <strong>" + safe(reservation.getVendor().getName()) + "</strong>,</p>"
                    + "<p style='margin:0 0 20px;font-size:14px;color:#616161;line-height:1.6;'>"
                    + "Great news! Your payment has been successfully verified and confirmed by our admin team. "
                    + "Your reservation is now active.</p>"
                    + "<div style='text-align:center;margin:20px 0;'>"
                    + "<div style='display:inline-block;padding:12px 28px;background-color:#e8f5e9;border-radius:50px;border:2px solid #4caf50;'>"
                    + "<span style='font-size:18px;color:#2e7d32;font-weight:700;'>&#10004; Payment Confirmed</span>"
                    + "</div></div>"
                    + "<h3 style='margin:0 0 8px;font-size:16px;color:#1a237e;'>Booking Details</h3>"
                    + detailTable(
                    detailRow("Booking ID", "<strong>" + safe(reservation.getBookingId()) + "</strong>"),
                    detailRow("Event", safe(reservation.getEvent().getName())),
                    detailRow("Event Date", safe(reservation.getEvent().getEventDate())),
                    detailRow("Location", safe(reservation.getEvent().getLocation())),
                    detailRow("Stall(s)", getStallCodes(reservation)),
                    detailRow("Amount Paid", "Rs. " + safe(reservation.getAdvanceAmount())),
                    detailRow("Payment Method", safe(reservation.getPaymentMethod())),
                    detailRow("Payment Status", badge("CONFIRMED", "#28a745")))
                    + (qrPng != null ? qrSection(true) : "")
                    + "<div style='padding:16px;background-color:#e3f2fd;border-left:4px solid #1976d2;border-radius:0 8px 8px 0;margin:16px 0;'>"
                    + "<p style='margin:0;font-size:14px;color:#0d47a1;font-weight:600;'>Important Instructions</p>"
                    + "<ul style='margin:8px 0 0;padding-left:20px;font-size:13px;color:#616161;line-height:1.8;'>"
                    + "<li>Please arrive at the venue <strong>30 minutes before</strong> the event starts</li>"
                    + "<li>Your QR code is valid for <strong>one-time entry</strong> only</li>"
                    + "<li>Do <strong>not share</strong> your QR code with anyone</li>"
                    + "<li>Carry a valid photo ID for verification</li>"
                    + "</ul></div>";

            helper.setText(wrapInLayout("Your Payment Has Been Successfully Confirmed", "#28a745", body), true);
            if (qrPng != null) {
                helper.addInline("qrCodeImage", new ByteArrayResource(qrPng), "image/png");
            }
            mailSender.send(msg);
        } catch (Exception e) {
            sendPlainTextFallback(
                    reservation.getVendor().getEmail(),
                    "Payment Confirmed - " + reservation.getBookingId(),
                    "Dear " + safe(reservation.getVendor().getName()) + ",\n\n"
                            + "Your payment for booking " + reservation.getBookingId() + " has been confirmed.\n"
                            + "Event: " + safe(reservation.getEvent().getName()) + "\n"
                            + "Amount: Rs. " + safe(reservation.getAdvanceAmount()) + "\n\n"
                            + "Please present your QR code at the venue.\n\n"
                            + "Thank you,\n" + SYSTEM_NAME);
        }
    }

    //EMAIL 3: RESERVATION CANCELLATION

    @Override
    @Async
    public void sendCancellationNotice(Reservation reservation) {

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(reservation.getVendor().getEmail());
            helper.setSubject("Reservation Cancelled - Booking " + reservation.getBookingId());

            String body = "<p style='margin:0 0 16px;font-size:15px;color:#424242;line-height:1.6;'>"
                    + "Dear <strong>" + safe(reservation.getVendor().getName()) + "</strong>,</p>"
                    + "<p style='margin:0 0 20px;font-size:14px;color:#616161;line-height:1.6;'>"
                    + "We would like to inform you that your reservation has been cancelled. "
                    + "Please find the details below.</p>"
                    + "<h3 style='margin:0 0 8px;font-size:16px;color:#1a237e;'>Cancelled Booking Details</h3>"
                    + detailTable(
                    detailRow("Booking ID", "<strong>" + safe(reservation.getBookingId()) + "</strong>"),
                    detailRow("Event", safe(reservation.getEvent().getName())),
                    detailRow("Event Date", safe(reservation.getEvent().getEventDate())),
                    detailRow("Stall(s)", getStallCodes(reservation)),
                    detailRow("Total Amount", "Rs. " + safe(reservation.getTotalAmount())),
                    detailRow("Cancellation Date", LocalDateTime.now().format(DATE_FMT)),
                    detailRow("Status", badge("CANCELLED", "#dc3545")))
                    + "<h3 style='margin:20px 0 8px;font-size:16px;color:#1a237e;'>Refund Information</h3>"
                    + detailTable(
                    detailRow("Refund Amount", "Rs. " + safe(reservation.getAdvanceAmount())),
                    detailRow("Refund Status", badge("PENDING", "#ff9800")),
                    detailRow("Refund Method", "Original payment method"))
                    + "<div style='padding:16px;background-color:#fce4ec;border-left:4px solid #dc3545;border-radius:0 8px 8px 0;margin:16px 0;'>"
                    + "<p style='margin:0;font-size:14px;color:#b71c1c;font-weight:600;'>Important Information</p>"
                    + "<ul style='margin:8px 0 0;padding-left:20px;font-size:13px;color:#616161;line-height:1.8;'>"
                    + "<li>Refund will be processed within <strong>3-7 business days</strong></li>"
                    + "<li>The refund will be credited to your original payment method</li>"
                    + "<li>Your stall(s) have been released and are available for other vendors</li>"
                    + "<li>If you have any questions, please contact our support team</li>"
                    + "</ul></div>";

            helper.setText(wrapInLayout("Your Reservation Has Been Cancelled", "#dc3545", body), true);
            mailSender.send(msg);
        } catch (Exception e) {
            sendPlainTextFallback(
                    reservation.getVendor().getEmail(),
                    "Reservation Cancelled - " + reservation.getBookingId(),
                    "Dear " + safe(reservation.getVendor().getName()) + ",\n\n"
                            + "Your reservation " + reservation.getBookingId() + " for "
                            + safe(reservation.getEvent().getName())
                            + " has been cancelled.\nRefund will be processed within 3-7 business days.\n\n"
                            + "Thank you,\n" + SYSTEM_NAME);
        }
    }

    //EMAIL 4: REFUND SUCCESS

    @Override
    @Async
    public void sendRefundNotice(Reservation reservation) {

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(reservation.getVendor().getEmail());
            helper.setSubject("Refund Successfully Processed - Booking " + reservation.getBookingId());

            String body = "<p style='margin:0 0 16px;font-size:15px;color:#424242;line-height:1.6;'>"
                    + "Dear <strong>" + safe(reservation.getVendor().getName()) + "</strong>,</p>"
                    + "<p style='margin:0 0 20px;font-size:14px;color:#616161;line-height:1.6;'>"
                    + "We are pleased to inform you that your refund has been successfully processed. "
                    + "Please find the details below.</p>"
                    + "<div style='text-align:center;margin:20px 0;'>"
                    + "<div style='display:inline-block;padding:12px 28px;background-color:#e8f5e9;border-radius:50px;border:2px solid #4caf50;'>"
                    + "<span style='font-size:18px;color:#2e7d32;font-weight:700;'>&#10004; Refund Completed</span>"
                    + "</div></div>"
                    + "<h3 style='margin:0 0 8px;font-size:16px;color:#1a237e;'>Refund Details</h3>"
                    + detailTable(
                    detailRow("Booking ID", "<strong>" + safe(reservation.getBookingId()) + "</strong>"),
                    detailRow("Event", safe(reservation.getEvent().getName())),
                    detailRow("Refund Amount", "Rs. " + safe(reservation.getAdvanceAmount())),
                    detailRow("Payment Method", safe(reservation.getPaymentMethod())),
                    detailRow("Refund Date", LocalDateTime.now().format(DATE_FMT)),
                    detailRow("Refund Status", badge("COMPLETED", "#28a745")))
                    + "<div style='padding:16px;background-color:#e8f5e9;border-left:4px solid #28a745;border-radius:0 8px 8px 0;margin:16px 0;'>"
                    + "<p style='margin:0;font-size:14px;color:#1b5e20;font-weight:600;'>Important Information</p>"
                    + "<ul style='margin:8px 0 0;padding-left:20px;font-size:13px;color:#616161;line-height:1.8;'>"
                    + "<li>The refund amount may take <strong>3-7 business days</strong> to reflect in your account</li>"
                    + "<li>Processing time depends on your bank or payment provider</li>"
                    + "<li>If you do not receive the refund after 7 business days, please contact support</li>"
                    + "</ul></div>";

            helper.setText(wrapInLayout("Your Refund Has Been Successfully Processed", "#28a745", body), true);
            mailSender.send(msg);
        } catch (Exception e) {
            sendPlainTextFallback(
                    reservation.getVendor().getEmail(),
                    "Refund Processed - " + reservation.getBookingId(),
                    "Dear " + safe(reservation.getVendor().getName()) + ",\n\n"
                            + "Your refund for reservation " + reservation.getBookingId()
                            + " has been processed.\nAmount: Rs. " + safe(reservation.getAdvanceAmount())
                            + "\nIt may take 3-7 business days to reflect in your account.\n\n"
                            + "Thank you,\n" + SYSTEM_NAME);
        }
    }

    // EMAIL 5: EVENT REMOVED / CANCELLED

    @Override
    @Async
    public void sendEventRemovedNotice(String vendorEmail, String eventName, String bookingId) {

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(vendorEmail);
            helper.setSubject("Event Cancelled - " + eventName + " - Booking " + bookingId);

            String body = "<p style='margin:0 0 16px;font-size:15px;color:#424242;line-height:1.6;'>"
                    + "Dear Vendor,</p>"
                    + "<p style='margin:0 0 20px;font-size:14px;color:#616161;line-height:1.6;'>"
                    + "We regret to inform you that the event <strong>" + eventName
                    + "</strong> has been cancelled by the organizer. Your associated booking has been automatically cancelled.</p>"
                    + "<h3 style='margin:0 0 8px;font-size:16px;color:#1a237e;'>Details</h3>"
                    + detailTable(
                    detailRow("Booking ID", "<strong>" + bookingId + "</strong>"),
                    detailRow("Event", eventName),
                    detailRow("Cancellation Date", LocalDateTime.now().format(DATE_FMT)),
                    detailRow("Status", badge("EVENT REMOVED", "#dc3545")))
                    + "<div style='padding:16px;background-color:#fff3e0;border-left:4px solid #ff9800;border-radius:0 8px 8px 0;margin:16px 0;'>"
                    + "<p style='margin:0;font-size:14px;color:#e65100;font-weight:600;'>Refund Notice</p>"
                    + "<p style='margin:8px 0 0;font-size:13px;color:#616161;line-height:1.6;'>"
                    + "A full refund will be processed automatically. Please allow <strong>3-7 business days</strong> for the amount to reflect in your account.</p>"
                    + "</div>";

            helper.setText(wrapInLayout("Event Cancelled - Booking Automatically Cancelled", "#dc3545", body), true);
            mailSender.send(msg);
        } catch (Exception e) {
            sendPlainTextFallback(vendorEmail,
                    "Event Cancelled - " + eventName,
                    "Dear Vendor,\n\nThe event " + eventName + " has been removed.\nYour booking " + bookingId
                            + " is cancelled and a full refund will be issued.\n\nThank you,\n" + SYSTEM_NAME);
        }
    }

    // EMAIL 6: ACCOUNT DEACTIVATED

    @Override
    @Async
    public void sendAccountDeactivatedNotice(String email, String name) {

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(email);
            helper.setSubject("Account Deactivated - " + SYSTEM_NAME);

            String body = "<p style='margin:0 0 16px;font-size:15px;color:#424242;line-height:1.6;'>"
                    + "Dear <strong>" + (name != null ? name : "User") + "</strong>,</p>"
                    + "<p style='margin:0 0 20px;font-size:14px;color:#616161;line-height:1.6;'>"
                    + "We would like to inform you that your vendor account has been deactivated by the administrator.</p>"
                    + "<div style='text-align:center;margin:20px 0;'>"
                    + "<div style='display:inline-block;padding:12px 28px;background-color:#fce4ec;border-radius:50px;border:2px solid #e57373;'>"
                    + "<span style='font-size:16px;color:#c62828;font-weight:700;'>&#128274; Account Deactivated</span>"
                    + "</div></div>"
                    + "<div style='padding:16px;background-color:#fff3e0;border-left:4px solid #ff9800;border-radius:0 8px 8px 0;margin:16px 0;'>"
                    + "<p style='margin:0;font-size:14px;color:#e65100;font-weight:600;'>What does this mean?</p>"
                    + "<ul style='margin:8px 0 0;padding-left:20px;font-size:13px;color:#616161;line-height:1.8;'>"
                    + "<li>You will no longer be able to log in to your account</li>"
                    + "<li>Any active reservations may be cancelled</li>"
                    + "<li>If you believe this is an error, please contact our support team immediately</li>"
                    + "</ul></div>";

            helper.setText(wrapInLayout("Account Deactivation Notice", "#dc3545", body), true);
            mailSender.send(msg);
        } catch (Exception e) {
            sendPlainTextFallback(email,
                    "Account Deactivated - " + SYSTEM_NAME,
                    "Dear " + (name != null ? name : "User") + ",\n\n"
                            + "Your vendor account has been deactivated by the administrator.\n"
                            + "If you believe this is an error, please contact support at " + SUPPORT_EMAIL + ".\n\n"
                            + "Thank you,\n" + SYSTEM_NAME);
        }
    }

    // EMAIL 7: CANCELLATION DEADLINE REMINDER

    @Override
    @Async
    public void sendCancellationDeadlineReminder(Reservation reservation) {

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(reservation.getVendor().getEmail());
            helper.setSubject("Reminder: Cancellation Deadline Approaching - " + reservation.getBookingId());

            String body = "<p style='margin:0 0 16px;font-size:15px;color:#424242;line-height:1.6;'>"
                    + "Dear <strong>" + safe(reservation.getVendor().getName()) + "</strong>,</p>"
                    + "<p style='margin:0 0 20px;font-size:14px;color:#616161;line-height:1.6;'>"
                    + "This is a friendly reminder that the cancellation deadline for your reservation is approaching. "
                    + "After this date, cancellation will no longer be possible.</p>"
                    + "<h3 style='margin:0 0 8px;font-size:16px;color:#1a237e;'>Booking Details</h3>"
                    + detailTable(
                    detailRow("Booking ID", "<strong>" + safe(reservation.getBookingId()) + "</strong>"),
                    detailRow("Event", safe(reservation.getEvent().getName())),
                    detailRow("Event Date", safe(reservation.getEvent().getEventDate())),
                    detailRow("Cancellation Deadline",
                            "<strong style='color:#dc3545;'>" + safe(reservation.getCancellationDeadline())
                                    + "</strong>"))
                    + "<div style='padding:16px;background-color:#fff8e1;border-left:4px solid #ffc107;border-radius:0 8px 8px 0;margin:16px 0;'>"
                    + "<p style='margin:0;font-size:14px;color:#f57f17;font-weight:600;'>Important</p>"
                    + "<p style='margin:8px 0 0;font-size:13px;color:#616161;line-height:1.6;'>"
                    + "If you wish to cancel your reservation, please do so before <strong>"
                    + safe(reservation.getCancellationDeadline())
                    + "</strong>. No cancellations or refunds will be allowed after this date.</p>"
                    + "</div>";

            helper.setText(wrapInLayout("Cancellation Deadline Reminder", "#ffc107", body), true);
            mailSender.send(msg);
        } catch (Exception e) {
            sendPlainTextFallback(
                    reservation.getVendor().getEmail(),
                    "Cancellation Deadline Reminder - " + reservation.getBookingId(),
                    "Dear " + safe(reservation.getVendor().getName()) + ",\n\n"
                            + "Reminder: The cancellation deadline for booking " + reservation.getBookingId()
                            + " is " + safe(reservation.getCancellationDeadline()) + ".\n"
                            + "After this date, cancellation will not be possible.\n\n"
                            + "Thank you,\n" + SYSTEM_NAME);
        }
    }

    // EMAIL 8: EVENT REMINDER (2 DAYS BEFORE)

    @Override
    @Async
    public void sendEventReminder(Reservation reservation) {

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(reservation.getVendor().getEmail());
            helper.setSubject("Upcoming Event Reminder - " + reservation.getEvent().getName());

            String body = "<p style='margin:0 0 16px;font-size:15px;color:#424242;line-height:1.6;'>"
                    + "Dear <strong>" + safe(reservation.getVendor().getName()) + "</strong>,</p>"
                    + "<p style='margin:0 0 20px;font-size:14px;color:#616161;line-height:1.6;'>"
                    + "We are excited to remind you that the event <strong>" + safe(reservation.getEvent().getName())
                    + "</strong> is coming up in 2 days!</p>"
                    + "<h3 style='margin:0 0 8px;font-size:16px;color:#1a237e;'>Event Details</h3>"
                    + detailTable(
                    detailRow("Event Name", safe(reservation.getEvent().getName())),
                    detailRow("Date & Time", safe(reservation.getEvent().getEventDate())),
                    detailRow("Location", safe(reservation.getEvent().getLocation())),
                    detailRow("Your Booking ID", "<strong>" + safe(reservation.getBookingId()) + "</strong>"),
                    detailRow("Stall(s)", getStallCodes(reservation)))
                    + "<div style='padding:16px;background-color:#e3f2fd;border-left:4px solid #1976d2;border-radius:0 8px 8px 0;margin:16px 0;'>"
                    + "<p style='margin:0;font-size:14px;color:#0d47a1;font-weight:600;'>Preparation Tips</p>"
                    + "<ul style='margin:8px 0 0;padding-left:20px;font-size:13px;color:#616161;line-height:1.8;'>"
                    + "<li>Ensure you have your QR code ready for entry</li>"
                    + "<li>Arrive at least 30 minutes before the start time</li>"
                    + "<li>Bring any necessary equipment or materials for your stall</li>"
                    + "</ul></div>";

            helper.setText(wrapInLayout("Event Reminder: " + reservation.getEvent().getName(), "#1976d2", body), true);
            mailSender.send(msg);
        } catch (Exception e) {
            sendPlainTextFallback(
                    reservation.getVendor().getEmail(),
                    "Event Reminder - " + reservation.getEvent().getName(),
                    "Dear " + safe(reservation.getVendor().getName()) + ",\n\n"
                            + "Reminder: The event " + safe(reservation.getEvent().getName()) + " is in 2 days.\n"
                            + "Date: " + safe(reservation.getEvent().getEventDate()) + "\n"
                            + "Location: " + safe(reservation.getEvent().getLocation()) + "\n\n"
                            + "See you there!\n" + SYSTEM_NAME);
        }
    }

    // EMAIL 9: VENDOR CANCELLATION SUCCESS

    @Override
    @Async
    public void sendVendorCancellationSuccess(Reservation reservation) {

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(reservation.getVendor().getEmail());
            helper.setSubject("Cancellation Confirmed - Booking " + reservation.getBookingId());

            String body = "<p style='margin:0 0 16px;font-size:15px;color:#424242;line-height:1.6;'>"
                    + "Dear <strong>" + safe(reservation.getVendor().getName()) + "</strong>,</p>"
                    + "<p style='margin:0 0 20px;font-size:14px;color:#616161;line-height:1.6;'>"
                    + "You have successfully cancelled your reservation. Below are the details of the cancellation.</p>"
                    + "<h3 style='margin:0 0 8px;font-size:16px;color:#1a237e;'>Cancellation Details</h3>"
                    + detailTable(
                    detailRow("Booking ID", "<strong>" + safe(reservation.getBookingId()) + "</strong>"),
                    detailRow("Event", safe(reservation.getEvent().getName())),
                    detailRow("Cancellation Date", LocalDateTime.now().format(DATE_FMT)),
                    detailRow("Status", badge("CANCELLED", "#757575")))
                    + "<p style='margin:16px 0;font-size:14px;color:#616161;'>If you made an advance payment, a refund request has been automatically initiated and will be processed by our admin team shortly.</p>";

            helper.setText(wrapInLayout("Cancellation Confirmed", "#616161", body), true);
            mailSender.send(msg);
        } catch (Exception e) {
            sendPlainTextFallback(
                    reservation.getVendor().getEmail(),
                    "Cancellation Confirmed - " + reservation.getBookingId(),
                    "Dear " + safe(reservation.getVendor().getName()) + ",\n\n"
                            + "You have successfully cancelled booking " + reservation.getBookingId() + ".\n"
                            + "Any applicable refund will be processed shortly.\n\n"
                            + "Thank you,\n" + SYSTEM_NAME);
        }
    }


}
