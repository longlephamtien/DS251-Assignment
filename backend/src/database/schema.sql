-- ============================================
-- Database Schema (Table Structures)
-- Database: bkinema
-- Generated: 2025-11-28T12:33:23.414Z
-- ============================================
-- This file contains CREATE TABLE statements for all tables
-- ============================================

CREATE DATABASE IF NOT EXISTS bkinema;
USE bkinema;

-- Table: User
DROP TABLE IF EXISTS User;
CREATE TABLE "User" (
  "id" bigint NOT NULL AUTO_INCREMENT,
  "fname" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "minit" varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "lname" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "birthday" date DEFAULT NULL,
  "gender" enum('Male','Female','Other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Other',
  "email" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "password" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "district" varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "city" varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "created_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "uk_user_email" ("email")
);

-- Table: actor
DROP TABLE IF EXISTS actor;
CREATE TABLE "actor" (
  "movie_id" bigint NOT NULL,
  "actor" varchar(255) NOT NULL,
  "name" varchar(255) DEFAULT NULL,
  "age" int DEFAULT NULL,
  PRIMARY KEY ("movie_id","actor"),
  CONSTRAINT "fk_actor_movie" FOREIGN KEY ("movie_id") REFERENCES "movie" ("id"),
  CONSTRAINT "actor_chk_1" CHECK (((`age` is null) or (`age` >= 0)))
);

-- Table: auditorium
DROP TABLE IF EXISTS auditorium;
CREATE TABLE "auditorium" (
  "number" int NOT NULL,
  "theater_id" bigint NOT NULL,
  "type" enum('2D','ScreenX','IMAX','4DX') NOT NULL DEFAULT '2D',
  "capacity" int NOT NULL DEFAULT '0',
  "image" varchar(255) DEFAULT NULL,
  "description" text,
  PRIMARY KEY ("number","theater_id"),
  KEY "fk_auditorium_theater" ("theater_id"),
  CONSTRAINT "fk_auditorium_theater" FOREIGN KEY ("theater_id") REFERENCES "theater" ("id")
);

-- Table: booking
DROP TABLE IF EXISTS booking;
CREATE TABLE "booking" (
  "id" bigint NOT NULL AUTO_INCREMENT,
  "created_time_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" varchar(255) NOT NULL,
  "booking_method" varchar(255) NOT NULL,
  "is_gift" tinyint(1) NOT NULL DEFAULT '0',
  "live_direction" varchar(255) DEFAULT NULL,
  "customer_id" bigint DEFAULT NULL,
  "staff_id" bigint DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "fk_booking_staff" ("staff_id"),
  KEY "idx_booking_status_created" ("status","created_time_at"),
  KEY "idx_booking_customer" ("customer_id"),
  CONSTRAINT "fk_booking_customer" FOREIGN KEY ("customer_id") REFERENCES "customer" ("user_id"),
  CONSTRAINT "fk_booking_staff" FOREIGN KEY ("staff_id") REFERENCES "staff" ("user_id")
);

-- Table: contains_item
DROP TABLE IF EXISTS contains_item;
CREATE TABLE "contains_item" (
  "fwb_menu_id" bigint NOT NULL,
  "fwb_id" bigint NOT NULL,
  "fwb_booking_id" bigint NOT NULL,
  "quantity" int NOT NULL DEFAULT '1',
  PRIMARY KEY ("fwb_menu_id","fwb_id","fwb_booking_id"),
  KEY "fk_contains_item_fwb" ("fwb_id","fwb_booking_id"),
  KEY "idx_contains_fwb_booking_menu" ("fwb_booking_id","fwb_menu_id"),
  CONSTRAINT "fk_contains_item_fwb" FOREIGN KEY ("fwb_id", "fwb_booking_id") REFERENCES "fwb" ("id", "booking_id"),
  CONSTRAINT "fk_contains_item_fwbmenu" FOREIGN KEY ("fwb_menu_id") REFERENCES "fwb_menu" ("id"),
  CONSTRAINT "contains_item_chk_1" CHECK ((`quantity` > 0))
);

-- Table: coupon
DROP TABLE IF EXISTS coupon;
CREATE TABLE "coupon" (
  "id" bigint NOT NULL AUTO_INCREMENT,
  "name" varchar(255) NOT NULL,
  "gift" tinyint(1) NOT NULL DEFAULT '0',
  "balance" decimal(10,2) NOT NULL DEFAULT '0.00',
  "coupon_type" enum('Amount','Percent','GiftCard') NOT NULL,
  "date_expired" date DEFAULT NULL,
  "booking_id" bigint DEFAULT NULL,
  "customer_id" bigint DEFAULT NULL,
  "discount_amount" decimal(10,2) DEFAULT '0.00' COMMENT 'Actual discount applied to booking (for tracking total discounts)',
  PRIMARY KEY ("id"),
  KEY "fk_coupon_booking" ("booking_id"),
  KEY "fk_coupon_customer" ("customer_id"),
  CONSTRAINT "fk_coupon_booking" FOREIGN KEY ("booking_id") REFERENCES "booking" ("id"),
  CONSTRAINT "fk_coupon_customer" FOREIGN KEY ("customer_id") REFERENCES "customer" ("user_id"),
  CONSTRAINT "coupon_chk_1" CHECK ((`balance` >= 0))
);

-- Table: customer
DROP TABLE IF EXISTS customer;
CREATE TABLE "customer" (
  "user_id" bigint NOT NULL,
  "accumulated_points" int NOT NULL DEFAULT '0',
  "membership_name" varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("user_id"),
  KEY "fk_customer_membership" ("membership_name"),
  CONSTRAINT "fk_customer_membership" FOREIGN KEY ("membership_name") REFERENCES "membership" ("tier_name") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_customer_user" FOREIGN KEY ("user_id") REFERENCES "User" ("id"),
  CONSTRAINT "customer_chk_1" CHECK ((`accumulated_points` >= 0))
);

-- Table: director
DROP TABLE IF EXISTS director;
CREATE TABLE "director" (
  "movie_id" bigint NOT NULL,
  "director" varchar(255) NOT NULL,
  PRIMARY KEY ("movie_id","director"),
  CONSTRAINT "fk_director_movie" FOREIGN KEY ("movie_id") REFERENCES "movie" ("id")
);

-- Table: dubbing
DROP TABLE IF EXISTS dubbing;
CREATE TABLE "dubbing" (
  "movie_id" bigint NOT NULL,
  "dubbing" varchar(255) NOT NULL,
  PRIMARY KEY ("movie_id","dubbing"),
  CONSTRAINT "fk_dubbing_movie" FOREIGN KEY ("movie_id") REFERENCES "movie" ("id")
);

-- Table: fwb
DROP TABLE IF EXISTS fwb;
CREATE TABLE "fwb" (
  "id" bigint NOT NULL,
  "booking_id" bigint NOT NULL,
  "quantity" int NOT NULL DEFAULT '1',
  "price" decimal(10,2) NOT NULL,
  PRIMARY KEY ("id","booking_id"),
  KEY "idx_fwb_booking" ("booking_id"),
  CONSTRAINT "fk_fwb_booking" FOREIGN KEY ("booking_id") REFERENCES "booking" ("id"),
  CONSTRAINT "fwb_chk_1" CHECK ((`quantity` > 0)),
  CONSTRAINT "fwb_chk_2" CHECK ((`price` >= 0))
);

-- Table: fwb_menu
DROP TABLE IF EXISTS fwb_menu;
CREATE TABLE "fwb_menu" (
  "id" bigint NOT NULL AUTO_INCREMENT,
  "name" varchar(255) NOT NULL,
  "description" text,
  "image" varchar(255) DEFAULT NULL,
  "price" decimal(10,2) NOT NULL,
  "category" varchar(255) NOT NULL,
  "capacity" varchar(255) DEFAULT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fwb_menu_chk_1" CHECK ((`price` >= 0))
);

-- Table: genre
DROP TABLE IF EXISTS genre;
CREATE TABLE "genre" (
  "movie_id" bigint NOT NULL,
  "genre" varchar(255) NOT NULL,
  PRIMARY KEY ("movie_id","genre"),
  CONSTRAINT "fk_genre_movie" FOREIGN KEY ("movie_id") REFERENCES "movie" ("id")
);

-- Table: give
DROP TABLE IF EXISTS give;
CREATE TABLE "give" (
  "coupon_id" bigint NOT NULL,
  "sender_id" bigint NOT NULL,
  "receiver_id" bigint NOT NULL,
  PRIMARY KEY ("coupon_id"),
  KEY "fk_give_sender" ("sender_id"),
  KEY "fk_give_receiver" ("receiver_id"),
  CONSTRAINT "fk_give_coupon" FOREIGN KEY ("coupon_id") REFERENCES "coupon" ("id"),
  CONSTRAINT "fk_give_receiver" FOREIGN KEY ("receiver_id") REFERENCES "customer" ("user_id"),
  CONSTRAINT "fk_give_sender" FOREIGN KEY ("sender_id") REFERENCES "customer" ("user_id")
);

-- Table: membership
DROP TABLE IF EXISTS membership;
CREATE TABLE "membership" (
  "tier_name" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "uk_membership_min_point" int NOT NULL,
  "box_office_discount" decimal(5,2) NOT NULL,
  "concession_discount" decimal(5,2) NOT NULL,
  PRIMARY KEY ("tier_name"),
  CONSTRAINT "chk_membership_box" CHECK (((`box_office_discount` >= 0) and (`box_office_discount` <= 100))),
  CONSTRAINT "chk_membership_con" CHECK (((`concession_discount` >= 0) and (`concession_discount` <= 100)))
);

-- Table: movie
DROP TABLE IF EXISTS movie;
CREATE TABLE "movie" (
  "id" bigint NOT NULL AUTO_INCREMENT,
  "name" varchar(255) NOT NULL,
  "duration" int NOT NULL,
  "language" varchar(255) DEFAULT NULL,
  "release_date" date DEFAULT NULL,
  "end_date" date DEFAULT NULL,
  "age_rating" varchar(3) NOT NULL,
  "poster_file" varchar(255) DEFAULT NULL,
  "url_slug" varchar(255) DEFAULT NULL,
  "description" text,
  "trailer_url" varchar(255) DEFAULT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "uk_movie_url_slug" ("url_slug"),
  CONSTRAINT "movie_chk_1" CHECK ((`duration` > 0))
);

-- Table: payment
DROP TABLE IF EXISTS payment;
CREATE TABLE "payment" (
  "id" bigint NOT NULL AUTO_INCREMENT,
  "payment_method" varchar(255) NOT NULL,
  "status" varchar(255) NOT NULL,
  "created_time_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "transaction_id" varchar(255) NOT NULL,
  "expired_time_at" datetime DEFAULT NULL,
  "duration" int DEFAULT NULL,
  "booking_id" bigint NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "uk_payment_transaction" ("transaction_id"),
  UNIQUE KEY "uk_payment_booking" ("booking_id"),
  KEY "idx_payment_booking" ("booking_id"),
  CONSTRAINT "fk_payment_booking" FOREIGN KEY ("booking_id") REFERENCES "booking" ("id")
);

-- Table: refund
DROP TABLE IF EXISTS refund;
CREATE TABLE "refund" (
  "id" bigint NOT NULL AUTO_INCREMENT,
  "booking_id" bigint NOT NULL,
  "amount" decimal(10,2) NOT NULL,
  "reason" varchar(255) DEFAULT NULL,
  "status" varchar(255) NOT NULL DEFAULT 'Requested',
  "created_time_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processed_time_at" datetime DEFAULT NULL,
  "coupon_id" bigint DEFAULT NULL,
  PRIMARY KEY ("id","booking_id"),
  KEY "fk_refund_coupon" ("coupon_id"),
  KEY "idx_refund_booking_status" ("booking_id","status"),
  CONSTRAINT "fk_refund_booking" FOREIGN KEY ("booking_id") REFERENCES "booking" ("id"),
  CONSTRAINT "fk_refund_coupon" FOREIGN KEY ("coupon_id") REFERENCES "coupon" ("id"),
  CONSTRAINT "refund_chk_1" CHECK ((`amount` >= 0))
);

-- Table: seat
DROP TABLE IF EXISTS seat;
CREATE TABLE "seat" (
  "id" bigint NOT NULL,
  "au_number" int NOT NULL,
  "au_theater_id" bigint NOT NULL,
  "row_char" varchar(10) NOT NULL,
  "column_number" int NOT NULL,
  "type" varchar(255) NOT NULL DEFAULT 'Standard',
  "price" decimal(10,2) NOT NULL,
  PRIMARY KEY ("id","au_number","au_theater_id"),
  KEY "fk_seat_auditorium" ("au_number","au_theater_id"),
  CONSTRAINT "fk_seat_auditorium" FOREIGN KEY ("au_number", "au_theater_id") REFERENCES "auditorium" ("number", "theater_id"),
  CONSTRAINT "seat_chk_1" CHECK ((`price` >= 0))
);

-- Table: send_gift
DROP TABLE IF EXISTS send_gift;
CREATE TABLE "send_gift" (
  "booking_id" bigint NOT NULL,
  "sender_id" bigint NOT NULL,
  "receiver_id" bigint NOT NULL,
  PRIMARY KEY ("booking_id"),
  KEY "fk_sendgift_sender" ("sender_id"),
  KEY "fk_sendgift_receiver" ("receiver_id"),
  CONSTRAINT "fk_sendgift_booking" FOREIGN KEY ("booking_id") REFERENCES "booking" ("id"),
  CONSTRAINT "fk_sendgift_receiver" FOREIGN KEY ("receiver_id") REFERENCES "customer" ("user_id"),
  CONSTRAINT "fk_sendgift_sender" FOREIGN KEY ("sender_id") REFERENCES "customer" ("user_id")
);

-- Table: showtime
DROP TABLE IF EXISTS showtime;
CREATE TABLE "showtime" (
  "id" bigint NOT NULL AUTO_INCREMENT,
  "date" date NOT NULL,
  "start_time" time NOT NULL,
  "end_time" time NOT NULL,
  "movie_id" bigint NOT NULL,
  "au_number" int NOT NULL,
  "au_theater_id" bigint NOT NULL,
  PRIMARY KEY ("id"),
  KEY "fk_showtime_movie" ("movie_id"),
  KEY "fk_showtime_auditorium" ("au_number","au_theater_id"),
  CONSTRAINT "fk_showtime_auditorium" FOREIGN KEY ("au_number", "au_theater_id") REFERENCES "auditorium" ("number", "theater_id"),
  CONSTRAINT "fk_showtime_movie" FOREIGN KEY ("movie_id") REFERENCES "movie" ("id")
);

-- Table: showtime_seat
DROP TABLE IF EXISTS showtime_seat;
CREATE TABLE "showtime_seat" (
  "ticketid" bigint NOT NULL AUTO_INCREMENT,
  "st_id" bigint NOT NULL,
  "seat_id" bigint NOT NULL,
  "seat_au_number" int NOT NULL,
  "seat_au_theater_id" bigint NOT NULL,
  "status" varchar(255) NOT NULL DEFAULT 'Valid',
  "price" decimal(10,2) NOT NULL,
  "booking_id" bigint DEFAULT NULL,
  PRIMARY KEY ("ticketid"),
  KEY "fk_showtimeseat_seat" ("seat_id","seat_au_number","seat_au_theater_id"),
  KEY "idx_ss_stid_seatid_status" ("st_id","seat_id","status"),
  KEY "idx_ss_booking_status" ("booking_id","status"),
  CONSTRAINT "fk_showtimeseat_booking" FOREIGN KEY ("booking_id") REFERENCES "booking" ("id"),
  CONSTRAINT "fk_showtimeseat_seat" FOREIGN KEY ("seat_id", "seat_au_number", "seat_au_theater_id") REFERENCES "seat" ("id", "au_number", "au_theater_id"),
  CONSTRAINT "fk_showtimeseat_showtime" FOREIGN KEY ("st_id") REFERENCES "showtime" ("id"),
  CONSTRAINT "showtime_seat_chk_1" CHECK ((`price` >= 0))
);

-- Table: staff
DROP TABLE IF EXISTS staff;
CREATE TABLE "staff" (
  "user_id" bigint NOT NULL,
  "shift" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "role" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "theater_id" bigint DEFAULT NULL,
  PRIMARY KEY ("user_id"),
  KEY "fk_staff_theater" ("theater_id"),
  CONSTRAINT "fk_staff_theater" FOREIGN KEY ("theater_id") REFERENCES "theater" ("id"),
  CONSTRAINT "fk_staff_user" FOREIGN KEY ("user_id") REFERENCES "User" ("id")
);

-- Table: subtitle
DROP TABLE IF EXISTS subtitle;
CREATE TABLE "subtitle" (
  "movie_id" bigint NOT NULL,
  "subtitle" varchar(255) NOT NULL,
  PRIMARY KEY ("movie_id","subtitle"),
  CONSTRAINT "fk_subtitle_movie" FOREIGN KEY ("movie_id") REFERENCES "movie" ("id")
);

-- Table: theater
DROP TABLE IF EXISTS theater;
CREATE TABLE "theater" (
  "id" bigint NOT NULL AUTO_INCREMENT,
  "name" varchar(255) NOT NULL,
  "street" varchar(255) NOT NULL,
  "district" varchar(255) NOT NULL,
  "city" varchar(255) NOT NULL,
  "image" varchar(255) DEFAULT NULL,
  "description" text,
  PRIMARY KEY ("id")
);

