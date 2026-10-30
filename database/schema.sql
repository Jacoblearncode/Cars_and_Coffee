-- ============================================================================
-- Cars & Coffee — Community Car Meets & Social Spotting Platform (COS30043)
-- Database Schema (Compatible with Swinburne FeeNIX MariaDB 5.5 & MySQL 5.7/8.0)
-- ============================================================================
-- Notes for Swinburne FeeNIX MariaDB 5.5 (feenix-mariadb.swin.edu.au):
-- 1. Indexed VARCHAR columns use VARCHAR(191) to stay under the 767-byte InnoDB key limit.
-- 2. Uses DATETIME instead of multiple TIMESTAMP DEFAULT CURRENT_TIMESTAMP columns
--    to prevent MariaDB 5.5 Error 1293.
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS login_attempts;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS meet_rsvps;
DROP TABLE IF EXISTS meets;
DROP TABLE IF EXISTS users;

-- 1. Users Table (Supports Member & Admin roles + "My Garage" NHTSA/Local Car Specs)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('member', 'admin') NOT NULL DEFAULT 'member',
    car_make VARCHAR(80) DEFAULT NULL,
    car_model VARCHAR(120) DEFAULT NULL,
    car_year INT DEFAULT NULL,
    region VARCHAR(60) NOT NULL DEFAULT 'Australia',
    avatar VARCHAR(255) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 2. Meets Table (Cars & Coffee Gatherings)
-- Note: parking_note and host_contact are masked for unauthenticated Guests.
CREATE TABLE meets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(191) NOT NULL,
    description TEXT NOT NULL,
    vibe VARCHAR(60) NOT NULL DEFAULT 'Morning Coffee',
    region VARCHAR(60) NOT NULL DEFAULT 'Australia',
    cafe_name VARCHAR(191) NOT NULL,
    address VARCHAR(255) NOT NULL,
    parking_note VARCHAR(255) NOT NULL,
    host_contact VARCHAR(191) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    meet_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    capacity INT NOT NULL DEFAULT 60,
    image VARCHAR(255) DEFAULT NULL,
    source_url VARCHAR(255) DEFAULT NULL,
    host_id INT NOT NULL,
    status ENUM('upcoming', 'completed', 'cancelled') NOT NULL DEFAULT 'upcoming',
    created_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT NULL, -- bumped on every edit; version for offline conflict detection
    CONSTRAINT fk_meets_host FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 3. Meet RSVPs & Car Roll-Call Table
CREATE TABLE meet_rsvps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meet_id INT NOT NULL,
    user_id INT NOT NULL,
    attend_type ENUM('bringing_car', 'spectating') NOT NULL DEFAULT 'bringing_car',
    car_brought VARCHAR(150) DEFAULT NULL,
    created_at DATETIME NOT NULL,
    UNIQUE KEY uq_rsvp_meet_user (meet_id, user_id),
    CONSTRAINT fk_rsvps_meet FOREIGN KEY (meet_id) REFERENCES meets(id) ON DELETE CASCADE,
    CONSTRAINT fk_rsvps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 4. Social Community Posts Table (Car Spotting, Coffee Recaps & Build Updates)
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    meet_id INT DEFAULT NULL,
    title VARCHAR(191) NOT NULL,
    body TEXT NOT NULL,
    car_tag VARCHAR(120) DEFAULT NULL,
    location_tag VARCHAR(120) DEFAULT NULL,
    image VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_posts_meet FOREIGN KEY (meet_id) REFERENCES meets(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 5. Unified Likes Table (Meets & Community Posts)
CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_type ENUM('meet', 'post') NOT NULL DEFAULT 'meet',
    target_id INT NOT NULL,
    created_at DATETIME NOT NULL,
    UNIQUE KEY uq_like_user_target (user_id, target_type, target_id),
    CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 6. Unified Comments & Meet Ratings Table
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_type ENUM('meet', 'post') NOT NULL DEFAULT 'meet',
    target_id INT NOT NULL,
    body TEXT NOT NULL,
    rating TINYINT DEFAULT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- 7. Login Attempts Table (Brute-force protection)
CREATE TABLE login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL,
    ip VARCHAR(45) NOT NULL,
    attempted_at DATETIME NOT NULL,
    KEY idx_login_lookup (email, ip, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

SET FOREIGN_KEY_CHECKS = 1;
