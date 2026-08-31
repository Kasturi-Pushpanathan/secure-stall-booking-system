package com.bookfair.Stall_Reservation.service;

public interface QrCodeService {
    byte[] generatePng(String text, int size);
}

