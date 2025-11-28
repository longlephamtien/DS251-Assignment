-- ============================================
-- Indexes
-- Database: bkinema
-- Generated: 2025-11-28T11:02:24.093Z
-- ============================================
-- Note: PRIMARY KEY and UNIQUE constraints are included in table structure
-- This file contains all non-primary indexes for reference
-- ============================================

-- Table: User
-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (id)

-- Index: uk_user_email (BTREE, UNIQUE)
DROP INDEX IF EXISTS uk_user_email ON User;
CREATE UNIQUE INDEX uk_user_email ON User (email);


-- Table: actor
-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (movie_id,actor)


-- Table: auditorium
-- Index: fk_auditorium_theater (BTREE)
DROP INDEX IF EXISTS fk_auditorium_theater ON auditorium;
CREATE INDEX fk_auditorium_theater ON auditorium (theater_id);

-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (number,theater_id)


-- Table: booking
-- Index: fk_booking_staff (BTREE)
DROP INDEX IF EXISTS fk_booking_staff ON booking;
CREATE INDEX fk_booking_staff ON booking (staff_id);

-- Index: idx_booking_customer (BTREE)
DROP INDEX IF EXISTS idx_booking_customer ON booking;
CREATE INDEX idx_booking_customer ON booking (customer_id);

-- Index: idx_booking_status_created (BTREE)
DROP INDEX IF EXISTS idx_booking_status_created ON booking;
CREATE INDEX idx_booking_status_created ON booking (status,created_time_at);

-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (id)


-- Table: contains_item
-- Index: fk_contains_item_fwb (BTREE)
DROP INDEX IF EXISTS fk_contains_item_fwb ON contains_item;
CREATE INDEX fk_contains_item_fwb ON contains_item (fwb_id,fwb_booking_id);

-- Index: idx_contains_fwb_booking_menu (BTREE)
DROP INDEX IF EXISTS idx_contains_fwb_booking_menu ON contains_item;
CREATE INDEX idx_contains_fwb_booking_menu ON contains_item (fwb_booking_id,fwb_menu_id);

-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (fwb_menu_id,fwb_id,fwb_booking_id)


-- Table: coupon
-- Index: fk_coupon_booking (BTREE)
DROP INDEX IF EXISTS fk_coupon_booking ON coupon;
CREATE INDEX fk_coupon_booking ON coupon (booking_id);

-- Index: fk_coupon_customer (BTREE)
DROP INDEX IF EXISTS fk_coupon_customer ON coupon;
CREATE INDEX fk_coupon_customer ON coupon (customer_id);

-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (id)


-- Table: customer
-- Index: fk_customer_membership (BTREE)
DROP INDEX IF EXISTS fk_customer_membership ON customer;
CREATE INDEX fk_customer_membership ON customer (membership_name);

-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (user_id)


-- Table: director
-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (movie_id,director)


-- Table: dubbing
-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (movie_id,dubbing)


-- Table: fwb
-- Index: idx_fwb_booking (BTREE)
DROP INDEX IF EXISTS idx_fwb_booking ON fwb;
CREATE INDEX idx_fwb_booking ON fwb (booking_id);

-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (id,booking_id)


-- Table: fwb_menu
-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (id)


-- Table: genre
-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (movie_id,genre)


-- Table: give
-- Index: fk_give_receiver (BTREE)
DROP INDEX IF EXISTS fk_give_receiver ON give;
CREATE INDEX fk_give_receiver ON give (receiver_id);

-- Index: fk_give_sender (BTREE)
DROP INDEX IF EXISTS fk_give_sender ON give;
CREATE INDEX fk_give_sender ON give (sender_id);

-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (coupon_id)


-- Table: membership
-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (tier_name)


-- Table: movie
-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (id)

-- Index: uk_movie_url_slug (BTREE, UNIQUE)
DROP INDEX IF EXISTS uk_movie_url_slug ON movie;
CREATE UNIQUE INDEX uk_movie_url_slug ON movie (url_slug);


-- Table: payment
-- Index: idx_payment_booking (BTREE)
DROP INDEX IF EXISTS idx_payment_booking ON payment;
CREATE INDEX idx_payment_booking ON payment (booking_id);

-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (id)

-- Index: uk_payment_booking (BTREE, UNIQUE)
DROP INDEX IF EXISTS uk_payment_booking ON payment;
CREATE UNIQUE INDEX uk_payment_booking ON payment (booking_id);

-- Index: uk_payment_transaction (BTREE, UNIQUE)
DROP INDEX IF EXISTS uk_payment_transaction ON payment;
CREATE UNIQUE INDEX uk_payment_transaction ON payment (transaction_id);


-- Table: refund
-- Index: fk_refund_coupon (BTREE)
DROP INDEX IF EXISTS fk_refund_coupon ON refund;
CREATE INDEX fk_refund_coupon ON refund (coupon_id);

-- Index: idx_refund_booking_status (BTREE)
DROP INDEX IF EXISTS idx_refund_booking_status ON refund;
CREATE INDEX idx_refund_booking_status ON refund (booking_id,status);

-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (id,booking_id)


-- Table: seat
-- Index: fk_seat_auditorium (BTREE)
DROP INDEX IF EXISTS fk_seat_auditorium ON seat;
CREATE INDEX fk_seat_auditorium ON seat (au_number,au_theater_id);

-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (id,au_number,au_theater_id)


-- Table: send_gift
-- Index: fk_sendgift_receiver (BTREE)
DROP INDEX IF EXISTS fk_sendgift_receiver ON send_gift;
CREATE INDEX fk_sendgift_receiver ON send_gift (receiver_id);

-- Index: fk_sendgift_sender (BTREE)
DROP INDEX IF EXISTS fk_sendgift_sender ON send_gift;
CREATE INDEX fk_sendgift_sender ON send_gift (sender_id);

-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (booking_id)


-- Table: showtime
-- Index: fk_showtime_auditorium (BTREE)
DROP INDEX IF EXISTS fk_showtime_auditorium ON showtime;
CREATE INDEX fk_showtime_auditorium ON showtime (au_number,au_theater_id);

-- Index: fk_showtime_movie (BTREE)
DROP INDEX IF EXISTS fk_showtime_movie ON showtime;
CREATE INDEX fk_showtime_movie ON showtime (movie_id);

-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (id)


-- Table: showtime_seat
-- Index: fk_showtimeseat_seat (BTREE)
DROP INDEX IF EXISTS fk_showtimeseat_seat ON showtime_seat;
CREATE INDEX fk_showtimeseat_seat ON showtime_seat (seat_id,seat_au_number,seat_au_theater_id);

-- Index: idx_ss_booking_status (BTREE)
DROP INDEX IF EXISTS idx_ss_booking_status ON showtime_seat;
CREATE INDEX idx_ss_booking_status ON showtime_seat (booking_id,status);

-- Index: idx_ss_stid_seatid_status (BTREE)
DROP INDEX IF EXISTS idx_ss_stid_seatid_status ON showtime_seat;
CREATE INDEX idx_ss_stid_seatid_status ON showtime_seat (st_id,seat_id,status);

-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (ticketid)


-- Table: staff
-- Index: fk_staff_theater (BTREE)
DROP INDEX IF EXISTS fk_staff_theater ON staff;
CREATE INDEX fk_staff_theater ON staff (theater_id);

-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (user_id)


-- Table: subtitle
-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (movie_id,subtitle)


-- Table: theater
-- Index: PRIMARY (BTREE, UNIQUE)
-- PRIMARY KEY (id)


