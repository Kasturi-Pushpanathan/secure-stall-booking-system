-- Database Schema for Book Fair Management System
-- Module: SENG 22212 & Information Security Assignment
CREATE DATABASE IF NOT EXISTS `stall_reservation` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `stall_reservation`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  `business_name` VARCHAR(255) DEFAULT NULL,
  `active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Events Table
CREATE TABLE IF NOT EXISTS `events` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `location` VARCHAR(255) NOT NULL,
  `event_date` DATETIME NOT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `active` BOOLEAN DEFAULT TRUE,
  `cancellation_days` INT DEFAULT 7,
  `created_by_admin_id` BIGINT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by_admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Stalls Table
CREATE TABLE IF NOT EXISTS `stalls` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `event_id` BIGINT NOT NULL,
  `stall_code` VARCHAR(50) NOT NULL,
  `size` VARCHAR(50) NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `blocked` BOOLEAN DEFAULT FALSE,
  `position_x` INT DEFAULT NULL,
  `position_y` INT DEFAULT NULL,
  UNIQUE KEY `unique_event_stall` (`event_id`, `stall_code`),
  FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Reservations Table (Enhanced for InfoSec/OIDC assignment)
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL UNIQUE,
  `event_id` BIGINT NOT NULL,
  `vendor_id` BIGINT NOT NULL,
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `advance_amount` DECIMAL(12, 2) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  `stall_description` VARCHAR(2000) DEFAULT NULL,
  `qr_code_value` VARCHAR(255) DEFAULT NULL,
  `booking_datetime` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cancellation_deadline` DATE DEFAULT NULL,
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `account_number` VARCHAR(255) DEFAULT NULL,
  `bank_name` VARCHAR(255) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `admin_ack` BOOLEAN DEFAULT FALSE,
  
  -- InfoSec/OIDC required fields
  `reservation_date` DATE DEFAULT NULL,
  `stall_type` VARCHAR(100) DEFAULT NULL,
  `preferred_stall_size` VARCHAR(100) DEFAULT NULL,
  `stalls_required` INT DEFAULT 1,
  `business_category` VARCHAR(100) DEFAULT NULL,
  `special_requirements` TEXT DEFAULT NULL,

  FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Reservation Stalls Join Table
CREATE TABLE IF NOT EXISTS `reservation_stalls` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `reservation_id` BIGINT NOT NULL,
  `stall_id` BIGINT NOT NULL,
  FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`stall_id`) REFERENCES `stalls` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Genres Table
CREATE TABLE IF NOT EXISTS `genres` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Reservation Genres Join Table
CREATE TABLE IF NOT EXISTS `reservation_genres` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `reservation_id` BIGINT NOT NULL,
  `genre_id` BIGINT NOT NULL,
  FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Payments Table
CREATE TABLE IF NOT EXISTS `payments` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `reservation_id` BIGINT NOT NULL UNIQUE,
  `amount` DECIMAL(12, 2) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  `paid_at` DATETIME DEFAULT NULL,
  `refunded_at` DATETIME DEFAULT NULL,
  FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Reservation Logs Table
CREATE TABLE IF NOT EXISTS `reservation_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `reservation_id` BIGINT NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `comment` VARCHAR(1000) DEFAULT NULL,
  `logged_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Site Content Table
CREATE TABLE IF NOT EXISTS `site_content` (
  `prop_key` VARCHAR(255) PRIMARY KEY,
  `prop_value` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
