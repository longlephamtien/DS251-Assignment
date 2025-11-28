-- =======================================
-- PHASE 0: Tạo database và chọn schema
-- =======================================
CREATE DATABASE IF NOT EXISTS bkinema
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bkinema;

-- =======================================
-- PHASE 1: CREATE TABLE (KHÔNG CÓ FOREIGN KEY)
-- =======================================

CREATE TABLE `User` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `fname` VARCHAR(255) NOT NULL,
  `minit` VARCHAR(50),
  `lname` VARCHAR(255) NOT NULL,
  `birthday` DATE,
  `gender` ENUM('Male','Female','Other') NOT NULL DEFAULT 'Other',
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `district` VARCHAR(255),
  `city` VARCHAR(255),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `membership` (
  `tier_name` VARCHAR(255) NOT NULL,
  `min_point` INT NOT NULL,
  `discount` DECIMAL(5,2) NOT NULL,
  PRIMARY KEY (`tier_name`),
  UNIQUE KEY `uk_membership_min_point` (`min_point`),
  UNIQUE KEY `uk_membership_discount` (`discount`),
  CHECK (`discount` >= 0 AND `discount` <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `customer` (
  `user_id` BIGINT NOT NULL,
  `accumulated_points` INT NOT NULL DEFAULT 0,
  `membership_name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`user_id`),
  CHECK (`accumulated_points` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `staff` (
  `user_id` BIGINT NOT NULL,
  `shift` VARCHAR(255) NOT NULL,
  `role` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `theater` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `street` VARCHAR(255) NOT NULL,
  `district` VARCHAR(255) NOT NULL,
  `city` VARCHAR(255) NOT NULL,
  `image` VARCHAR(255),
  `description` TEXT,
  `staff_id` BIGINT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `auditorium` (
  `number` INT NOT NULL,
  `theater_id` BIGINT NOT NULL,
  `type` VARCHAR(255) NOT NULL DEFAULT 'Normal',
  `capacity` INT NOT NULL,
  `image` VARCHAR(255),
  `description` TEXT,
  PRIMARY KEY (`number`, `theater_id`),
  CHECK (`capacity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `movie` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `duration` INT NOT NULL,
  `language` VARCHAR(255),
  `release_date` DATE,
  `age_rating` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  CHECK (`duration` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `actor` (
  `movie_id` BIGINT NOT NULL,
  `actor` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255),
  `age` INT,
  PRIMARY KEY (`movie_id`, `actor`),
  CHECK (`age` IS NULL OR `age` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `director` (
  `movie_id` BIGINT NOT NULL,
  `director` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`movie_id`, `director`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `dubbing` (
  `movie_id` BIGINT NOT NULL,
  `dubbing` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`movie_id`, `dubbing`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `genre` (
  `movie_id` BIGINT NOT NULL,
  `genre` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`movie_id`, `genre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `subtitle` (
  `movie_id` BIGINT NOT NULL,
  `subtitle` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`movie_id`, `subtitle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `fwb_menu` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `image` VARCHAR(255),
  `price` DECIMAL(10,2) NOT NULL,
  `category` VARCHAR(255) NOT NULL,
  `capacity` VARCHAR(255),
  PRIMARY KEY (`id`),
  CHECK (`price` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `booking` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `created_time_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(255) NOT NULL,
  `booking_method` VARCHAR(255) NOT NULL,
  `is_gift` TINYINT(1) NOT NULL DEFAULT 0,
  `live_direction` VARCHAR(255),
  `customer_id` BIGINT,
  `staff_id` BIGINT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `fwb` (
  `id` BIGINT NOT NULL,
  `booking_id` BIGINT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`, `booking_id`),
  CHECK (`quantity` > 0),
  CHECK (`price` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `seat` (
  `id` BIGINT NOT NULL,
  `au_number` INT NOT NULL,
  `au_theater_id` BIGINT NOT NULL,
  `row_char` VARCHAR(10) NOT NULL,
  `column_number` INT NOT NULL,
  `type` VARCHAR(255) NOT NULL DEFAULT 'Standard',
  `price` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`, `au_number`, `au_theater_id`),
  CHECK (`price` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `showtime` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `movie_id` BIGINT NOT NULL,
  `au_number` INT NOT NULL,
  `au_theater_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `showtime_seat` (
  `ticketid` BIGINT NOT NULL AUTO_INCREMENT,
  `st_id` BIGINT NOT NULL,
  `seat_id` BIGINT NOT NULL,
  `seat_au_number` INT NOT NULL,
  `seat_au_theater_id` BIGINT NOT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'Valid',
  `price` DECIMAL(10,2) NOT NULL,
  `booking_id` BIGINT,
  PRIMARY KEY (`ticketid`),
  CHECK (`price` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `coupon` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `gift` TINYINT(1) NOT NULL DEFAULT 0,
  `balance` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `coupon_type` ENUM('Amount', 'Percent', 'GiftCard') NOT NULL,
  `date_expired` DATE,
  `booking_id` BIGINT,
  `customer_id` BIGINT,
  PRIMARY KEY (`id`),
  CHECK (`balance` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `give` (
  `coupon_id` BIGINT NOT NULL,
  `sender_id` BIGINT NOT NULL,
  `receiver_id` BIGINT NOT NULL,
  PRIMARY KEY (`coupon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `send_gift` (
  `booking_id` BIGINT NOT NULL,
  `sender_id` BIGINT NOT NULL,
  `receiver_id` BIGINT NOT NULL,
  PRIMARY KEY (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `payment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `payment_method` VARCHAR(255) NOT NULL,
  `status` VARCHAR(255) NOT NULL,
  `created_time_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `transaction_id` VARCHAR(255) NOT NULL,
  `expired_time_at` DATETIME,
  `duration` INT,
  `booking_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payment_transaction` (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `refund` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `booking_id` BIGINT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `reason` VARCHAR(255),
  `status` VARCHAR(255) NOT NULL DEFAULT 'Requested',
  `created_time_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_time_at` DATETIME,
  `coupon_id` BIGINT,
  PRIMARY KEY (`id`, `booking_id`),
  CHECK (`amount` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `contains_item` (
  `fwb_menu_id` BIGINT NOT NULL,
  `fwb_id` BIGINT NOT NULL,
  `fwb_booking_id` BIGINT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`fwb_menu_id`, `fwb_id`, `fwb_booking_id`),
  CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =======================================
-- PHASE 2: ALTER TABLE ADD FOREIGN KEYS
-- =======================================

-- customer
ALTER TABLE `customer`
  ADD CONSTRAINT `fk_customer_user`
    FOREIGN KEY (`user_id`) REFERENCES `User`(`id`),
  ADD CONSTRAINT `fk_customer_membership`
    FOREIGN KEY (`membership_name`) REFERENCES `membership`(`tier_name`);

-- staff
ALTER TABLE `staff`
  ADD CONSTRAINT `fk_staff_user`
    FOREIGN KEY (`user_id`) REFERENCES `User`(`id`);

-- theater
ALTER TABLE `theater`
  ADD CONSTRAINT `fk_theater_staff`
    FOREIGN KEY (`staff_id`) REFERENCES `staff`(`user_id`);

-- auditorium
ALTER TABLE `auditorium`
  ADD CONSTRAINT `fk_auditorium_theater`
    FOREIGN KEY (`theater_id`) REFERENCES `theater`(`id`);

-- movie-related
ALTER TABLE `actor`
  ADD CONSTRAINT `fk_actor_movie`
    FOREIGN KEY (`movie_id`) REFERENCES `movie`(`id`);

ALTER TABLE `director`
  ADD CONSTRAINT `fk_director_movie`
    FOREIGN KEY (`movie_id`) REFERENCES `movie`(`id`);

ALTER TABLE `dubbing`
  ADD CONSTRAINT `fk_dubbing_movie`
    FOREIGN KEY (`movie_id`) REFERENCES `movie`(`id`);

ALTER TABLE `genre`
  ADD CONSTRAINT `fk_genre_movie`
    FOREIGN KEY (`movie_id`) REFERENCES `movie`(`id`);

ALTER TABLE `subtitle`
  ADD CONSTRAINT `fk_subtitle_movie`
    FOREIGN KEY (`movie_id`) REFERENCES `movie`(`id`);

-- booking
ALTER TABLE `booking`
  ADD CONSTRAINT `fk_booking_customer`
    FOREIGN KEY (`customer_id`) REFERENCES `customer`(`user_id`),
  ADD CONSTRAINT `fk_booking_staff`
    FOREIGN KEY (`staff_id`) REFERENCES `staff`(`user_id`);

-- fwb
ALTER TABLE `fwb`
  ADD CONSTRAINT `fk_fwb_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`);

-- seat
ALTER TABLE `seat`
  ADD CONSTRAINT `fk_seat_auditorium`
    FOREIGN KEY (`au_number`, `au_theater_id`)
    REFERENCES `auditorium`(`number`, `theater_id`);

-- showtime
ALTER TABLE `showtime`
  ADD CONSTRAINT `fk_showtime_movie`
    FOREIGN KEY (`movie_id`) REFERENCES `movie`(`id`),
  ADD CONSTRAINT `fk_showtime_auditorium`
    FOREIGN KEY (`au_number`, `au_theater_id`)
    REFERENCES `auditorium`(`number`, `theater_id`);

-- showtime_seat
ALTER TABLE `showtime_seat`
  ADD CONSTRAINT `fk_showtimeseat_showtime`
    FOREIGN KEY (`st_id`) REFERENCES `showtime`(`id`),
  ADD CONSTRAINT `fk_showtimeseat_seat`
    FOREIGN KEY (`seat_id`, `seat_au_number`, `seat_au_theater_id`)
    REFERENCES `seat`(`id`, `au_number`, `au_theater_id`),
  ADD CONSTRAINT `fk_showtimeseat_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`);

-- coupon
ALTER TABLE `coupon`
  ADD CONSTRAINT `fk_coupon_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`),
  ADD CONSTRAINT `fk_coupon_customer`
    FOREIGN KEY (`customer_id`) REFERENCES `customer`(`user_id`);

-- give
ALTER TABLE `give`
  ADD CONSTRAINT `fk_give_coupon`
    FOREIGN KEY (`coupon_id`) REFERENCES `coupon`(`id`),
  ADD CONSTRAINT `fk_give_sender`
    FOREIGN KEY (`sender_id`) REFERENCES `User`(`id`),
  ADD CONSTRAINT `fk_give_receiver`
    FOREIGN KEY (`receiver_id`) REFERENCES `User`(`id`);

-- send_gift
ALTER TABLE `send_gift`
  ADD CONSTRAINT `fk_sendgift_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`),
  ADD CONSTRAINT `fk_sendgift_sender`
    FOREIGN KEY (`sender_id`) REFERENCES `User`(`id`),
  ADD CONSTRAINT `fk_sendgift_receiver`
    FOREIGN KEY (`receiver_id`) REFERENCES `User`(`id`);

-- payment
ALTER TABLE `payment`
  ADD CONSTRAINT `fk_payment_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`);

-- refund
ALTER TABLE `refund`
  ADD CONSTRAINT `fk_refund_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `booking`(`id`),
  ADD CONSTRAINT `fk_refund_coupon`
    FOREIGN KEY (`coupon_id`) REFERENCES `coupon`(`id`);

-- contains_item
ALTER TABLE `contains_item`
  ADD CONSTRAINT `fk_contains_item_fwbmenu`
    FOREIGN KEY (`fwb_menu_id`) REFERENCES `fwb_menu`(`id`),
  ADD CONSTRAINT `fk_contains_item_fwb`
    FOREIGN KEY (`fwb_id`, `fwb_booking_id`)
    REFERENCES `fwb`(`id`, `booking_id`);
