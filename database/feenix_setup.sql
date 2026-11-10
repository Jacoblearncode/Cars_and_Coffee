-- ============================================================================
-- Swinburne FeeNIX MariaDB 5.5 One-Click Import Script (s105986053_db)
-- Combines schema.sql + seed.sql (Select s105986053_db in phpMyAdmin -> Import)
-- ============================================================================

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
    checked_in_at DATETIME DEFAULT NULL, -- set when the attendee scans the host's QR code at the meet
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


-- ============================================================================
-- Cars & Coffee — Seed Data (Australia & Malaysia Car Meets & Social Feed)
-- Default password for all seeded accounts: Password123!
-- Compatible with Swinburne FeeNIX MariaDB 5.5 & MySQL 5.7/8.0
-- 26 Visually-Verified Unique Meet Photos & 8 Subject-Matched Spotting Snaps
-- ============================================================================

INSERT INTO users (id, name, email, password_hash, role, car_make, car_model, car_year, region, avatar, bio, created_at) VALUES
(1, 'Jacob Pillai', 'admin@carsandcoffee.com', '$2y$10$QOTY23BrhjuMX4UPG48/Q.NZlLPq69kZFSAvzAbQBalhxonnsLcSu', 'admin', 'Honda', 'Civic Type R (FL5)', 2024, 'Australia', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80', 'Community Founder & flat-white enthusiast splitting time between Melbourne and Kuching.', '2026-09-01 08:00:00'),
(2, 'Syed Adam', 'syed@carsandcoffee.com', '$2y$10$QOTY23BrhjuMX4UPG48/Q.NZlLPq69kZFSAvzAbQBalhxonnsLcSu', 'member', 'Porsche', '911 Carrera S (991.2)', 2019, 'Australia', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=160&auto=format&fit=crop&q=80', 'Sunday morning espresso runner & air/water-cooled Porsche collector in Melbourne.', '2026-09-03 09:15:00'),
(3, 'Naveed Khan', 'naveed@carsandcoffee.com', '$2y$10$QOTY23BrhjuMX4UPG48/Q.NZlLPq69kZFSAvzAbQBalhxonnsLcSu', 'member', 'Nissan', 'Skyline GT-R (R34)', 2000, 'Malaysia', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80', 'Hosting weekend Kopi & JDM mornings across Kuching Waterfront and Glenmarie KL.', '2026-09-05 10:30:00'),
(4, 'Gibson Tan', 'member@carsandcoffee.com', '$2y$10$QOTY23BrhjuMX4UPG48/Q.NZlLPq69kZFSAvzAbQBalhxonnsLcSu', 'member', 'Toyota', 'GR86', 2023, 'Australia', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80', 'Daily-driven Hakone Green GR86 on Volk TE37s. Always down for a coastal coffee run.', '2026-09-07 14:20:00'),
(5, 'Chloe Vance', 'chloe@carsandcoffee.com', '$2y$10$QOTY23BrhjuMX4UPG48/Q.NZlLPq69kZFSAvzAbQBalhxonnsLcSu', 'member', 'Mazda', 'MX-5 Miata (NA8C)', 1995, 'Australia', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80', '35mm film car spotter & classic roadster fan.', '2026-09-10 16:45:00'),
(6, 'Amirul Hakim', 'amirul@carsandcoffee.com', '$2y$10$QOTY23BrhjuMX4UPG48/Q.NZlLPq69kZFSAvzAbQBalhxonnsLcSu', 'member', 'Proton', 'Satria Neo R3 Lotus Racing', 2010, 'Malaysia', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=160&auto=format&fit=crop&q=80', 'Keeping Malaysian hot-hatch & 4G63 heritage alive at KL & Sarawak coffee meets.', '2026-09-12 19:00:00');

INSERT INTO meets (id, title, description, vibe, region, cafe_name, address, parking_note, host_contact, latitude, longitude, meet_datetime, end_datetime, capacity, image, source_url, host_id, status, created_at) VALUES
-- 1 to 8: Core Synchronized Meets (Each with 100% subject-matched automotive photography)
(1, 'St Kilda Pier Sunrise Espresso & Classics', 'Bring your classic air-cooled 911, restomod, or weekend cruiser down by the bay for fresh single-origin espresso and croissants before Melbourne traffic wakes up. Relaxed family-friendly vibe—no revving or loud stereos near the boardwalk.', 'Euro & Classics', 'Australia', 'Little Blue Roasters, St Kilda Pier', 'Pier Rd, St Kilda VIC 3182', 'Enter via Jacka Blvd Lower Foreshore Carpark, North Row Bays 1–45 reserved for low-clearance cars.', 'Syed Adam — @melb_espresso_runs | +61 412 889 102', -37.864000, 144.966700, '2026-11-08 07:30:00', '2026-11-08 10:30:00', 60, 'https://images.unsplash.com/photo-1741963244619-10997539b2e7?w=900&auto=format&fit=crop&q=80', 'https://carsandcoffee.org.au/melbourne-bay-run-2026', 2, 'upcoming', '2026-10-15 09:00:00'),
(2, 'Port Melbourne Roastery JDM & Pour-Over', 'Monthly Sunday morning gathering inside Port Melbourne warehouse district. Specialty V60 pour-overs, matcha lattes, and 85 bays of Japanese GT-R, rotary, and modern GR/Type-R builds.', 'JDM & Brews', 'Australia', 'Industry Beans Warehouse, Port Melbourne', '345 Plummer St, Port Melbourne VIC 3207', 'Use Rear Loading Courtyard off Salmon St — concrete ramp is lip-spoiler friendly.', 'Gibson Tan — @gr86_gibson | +61 421 774 019', -37.828500, 144.929000, '2026-11-15 08:00:00', '2026-11-15 11:30:00', 85, 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=900&auto=format&fit=crop&q=80', 'https://instagram.com/p/portmelb-jdm-coffee-2026', 4, 'upcoming', '2026-10-18 11:00:00'),
(3, 'Kuching Waterfront Kopi O & Borneo Builds', 'Saturday evening chill meet along the Sarawak River breeze. Local artisanal Gula Apong lattes, iced Kopi O, and a laid-back showcase of Sarawak cleanest Evolution IX, JDM turbo, and hot-hatch builds.', 'Sunset Chill', 'Malaysia', 'Black Bean Coffee & Tea Co., Kuching', '87 Ewe Hai St, 93000 Kuching, Sarawak', 'Meet at Padungan South Open Plaza Zone B (5-min walk or group park along Carpenter St East Deck).', 'Naveed Khan — @borneo_kopi_meets | +60 16-882 4105', 1.557400, 110.346800, '2026-11-14 17:00:00', '2026-11-14 20:30:00', 70, 'https://images.unsplash.com/photo-1660209336030-ea4d2d0e0412?w=900&auto=format&fit=crop&q=80', 'https://peatix.com/event/kuching-kopi-cars-2026', 3, 'upcoming', '2026-10-19 14:00:00'),
(4, 'Glenmarie Artisan Roast & Morning Throttle', 'Klang Valley signature Sunday morning Cars & Coffee! Freshly pulled flat whites, sourdough toasties, and wide shaded stone plaza parking headlined by 992 GT3 Touring and JDM builds.', 'Morning Coffee', 'Malaysia', 'Suburbia Coffee Roasters, Glenmarie', '12 Jalan Presiden F U1/F, Glenmarie, 40150 Shah Alam, Selangor', 'Park along Lot U1 North Perimeter (Bays A1–A60). Marshals in orange vests will guide low cars.', 'Amirul Hakim — @kv_morning_roast | +60 17-291 6604', 3.088200, 101.585100, '2026-11-22 07:30:00', '2026-11-22 11:00:00', 100, 'https://images.unsplash.com/photo-1786811870319-16bef2f27310?w=900&auto=format&fit=crop&q=80', 'https://facebook.com/events/glenmarie-coffee-2026', 6, 'upcoming', '2026-10-20 10:00:00'),
(5, 'Yarra Valley Cold Brew & Healesville Hills Run', 'Meet for cold brew and bacon & egg rolls in Warrandyte with our Type-R and hot-hatch crew before an optional scenic morning cruise up through Christmas Hills to Healesville.', 'Morning Coffee', 'Australia', 'Cocoa Moon Cafe, Warrandyte', '168 Yarra St, Warrandyte VIC 3113', 'Assemble at Riverbank Lower Gravel-Free Lot behind Yarra St Bakery at 7:15 AM sharp.', 'Jacob Pillai — @jacob_fl5 | +61 409 331 440', -37.744200, 145.213600, '2026-11-22 07:15:00', '2026-11-22 11:00:00', 45, 'https://images.unsplash.com/photo-1572471372724-a7c1c9450c21?w=900&auto=format&fit=crop&q=80', NULL, 1, 'upcoming', '2026-10-21 15:00:00'),
(6, 'Docklands Rooftop Golden Hour & Decaf', 'Twilight rooftop photography session and decaf lattes overlooking Bolte Bridge. Open to track-prepped M4 coupes, clean street builds, roadsters, and daily drivers.', 'Night Meet', 'Australia', 'District Brewer & Rooftop Deck, Docklands', 'Level 3 East Carpark, 440 Docklands Dr, Docklands VIC 3008', 'Take East Spiral Ramp to Level 3 Open Air Deck — ticket validation code COFFEE26 at exit.', 'Chloe Vance — @chloe_35mm | +61 433 118 902', -37.813600, 144.938500, '2026-11-28 18:00:00', '2026-11-28 21:00:00', 75, 'https://images.unsplash.com/photo-1744519322632-9bdf5e977e87?w=900&auto=format&fit=crop&q=80', NULL, 5, 'upcoming', '2026-10-22 12:00:00'),
(7, 'Sepang Paddock Kopi & Track-Prepped Street Cars', 'Casual morning coffee hangout outside the Sepang Welcome Centre before the public track day starts. Great spot to inspect FD3S rotary setups, wheel fitment, and grab nasi lemak & iced latte.', 'JDM & Brews', 'Malaysia', 'Paddock Brew House, Sepang', 'Jalan Pekeliling, 64000 KLIA, Selangor', 'Public Welcome Centre Visitor Lot C (free parking until 12:00 PM).', 'Naveed Khan — @borneo_kopi_meets | +60 16-882 4105', 2.760800, 101.738300, '2026-12-05 08:00:00', '2026-12-05 11:30:00', 80, 'https://images.unsplash.com/photo-1774121618515-881ac7896bda?w=900&auto=format&fit=crop&q=80', NULL, 3, 'upcoming', '2026-10-24 09:30:00'),
(8, 'Lygon Street Autumn Espresso & Italian Classics', 'Completed Sunday morning celebration of Maranello supercars, Italian coachbuilding, and Lygon Street espresso culture. Thank you to all 52 owners who attended!', 'Euro & Classics', 'Australia', 'Brunetti Classico, Carlton', '380 Lygon St, Carlton VIC 3053', 'Faraday St Kerbside & Elgin St Carpark Level 1.', 'Syed Adam — @melb_espresso_runs | +61 412 889 102', -37.798400, 144.967200, '2026-10-18 07:30:00', '2026-10-18 10:30:00', 55, 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&auto=format&fit=crop&q=80', NULL, 2, 'completed', '2026-10-01 10:00:00'),
-- 9 to 18: Melbourne Metro & Regional Meets (with verified unique car photography)
(9, 'South Melbourne Batch Brew & Bavarian M-Coupes', 'Inline-six engines & pour-overs in the iconic South Melbourne laneways. ST. ALi is roasting a specialty washed Ethiopian single origin for our gathering.', 'Euro & Classics', 'Australia', 'ST. ALi Coffee Roasters', '12-18 Yarra Pl, South Melbourne VIC 3205', 'Yarra Place wide kerbside bays and Coventry St rear lot. Avoid blocking roller doors.', 'Syed Adam — @melb_espresso_runs | +61 412 889 102', -37.831400, 144.960200, '2026-12-06 07:00:00', '2026-12-06 10:30:00', 50, 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&auto=format&fit=crop&q=80', NULL, 2, 'upcoming', '2026-10-25 11:00:00'),
(10, 'Cremorne Silos Industrial Pour-Over & Shelby V8s', 'Industrial warehouse backdrop in Cremorne. Fresh pastries from Veneziano, cold drip on tap, and dedicated angled bays for Shelby GT350s and classic coupes.', 'Euro & Classics', 'Australia', 'Veneziano Coffee Richmond', '16 River St, Richmond VIC 3121', 'Riverfront warehouse apron — flat concrete entry with zero scrape risk.', 'Jacob Pillai — @jacob_fl5 | +61 409 331 440', -37.826100, 145.012400, '2026-12-13 07:30:00', '2026-12-13 11:00:00', 65, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&auto=format&fit=crop&q=80', NULL, 1, 'upcoming', '2026-10-26 14:00:00'),
(11, 'Collingwood Laneway Nitro Cold Brew & Hot Hatches', 'Celebrating Golf GTI, Golf R, GR Yaris, and Civic Type-R builds. Nitro cold brew and sourdough crumpets in the heart of Collingwood.', 'Morning Coffee', 'Australia', 'Proud Mary Roasters', '172 Oxford St, Collingwood VIC 3066', 'Peel St and Cambridge St early Sunday bays. Parallel parking only.', 'Gibson Tan — @gr86_gibson | +61 421 774 019', -37.801200, 144.984500, '2026-12-20 08:00:00', '2026-12-20 11:30:00', 45, 'https://images.unsplash.com/photo-1605475300127-0a31e8273bc2?w=900&auto=format&fit=crop&q=80', NULL, 4, 'upcoming', '2026-10-27 09:30:00'),
(12, 'Brighton Foreshore Golden Hour Miata & Roadster Run', 'Watch the sunset over Port Phillip Bay with NA MX-5 roadsters, seaside flat whites, and chilled tunes.', 'Sunset Chill', 'Australia', 'Green Point Beach Kiosk', '2 Esplanade, Brighton VIC 3186', 'Green Point Foreshore Carpark — North Ocean View Row. Ticket machine requires tap.', 'Chloe Vance — @chloe_35mm | +61 433 118 902', -37.924500, 144.986800, '2026-12-26 17:30:00', '2026-12-26 20:30:00', 80, 'https://images.unsplash.com/photo-1747197413754-dc600f71f3d6?w=900&auto=format&fit=crop&q=80', NULL, 5, 'upcoming', '2026-10-28 16:00:00'),
(13, 'Williamstown Historic Maritime Espresso & GT3 RS', 'Historic seaport scenery, maritime breezes, and Spanish iced lattes by the bay with Weissach Porsche GT3 RS and Euro builds.', 'Morning Coffee', 'Australia', 'Sebastian Beach Grill & Espresso', '26 Esplanade, Williamstown VIC 3016', 'Esplanade angled beach bays — zero speed humps from Ferguson St.', 'Gibson Tan — @gr86_gibson | +61 421 774 019', -37.867500, 144.892600, '2027-01-03 07:30:00', '2027-01-03 10:30:00', 70, 'https://images.unsplash.com/photo-1776163803072-3c24c1b8a295?w=900&auto=format&fit=crop&q=80', NULL, 4, 'upcoming', '2026-10-29 11:20:00'),
(14, 'Mount Dandenong Summit Dawn Touge & GR Yaris Rallye', 'Early morning touge through mountain fern gullies with AWD rally hatches arriving at the lookout for sunrise batch brew over Melbourne.', 'Morning Coffee', 'Australia', 'SkyHigh Mount Dandenong Kiosk', '26 Observatory Rd, Mount Dandenong VIC 3767', 'Upper Summit Lookout Asphalt Lot A. Gates open at 6:00 AM sharp.', 'Jacob Pillai — @jacob_fl5 | +61 409 331 440', -37.827100, 145.352600, '2027-01-10 06:30:00', '2027-01-10 09:30:00', 60, 'https://images.unsplash.com/photo-1611580568660-28050c1d5b5c?w=900&auto=format&fit=crop&q=80', NULL, 1, 'upcoming', '2026-10-30 08:00:00'),
(15, 'Arthurs Seat Switchback Morning GT3 Espresso Run', 'Mornington Peninsula twisties followed by specialty flat whites overlooking Port Phillip Bay from the summit.', 'Euro & Classics', 'Australia', 'Eagle Summit Roastery', '795 Arthurs Seat Rd, Arthurs Seat VIC 3936', 'Summit Switchback Lookout Bays 1–60. Sealed bitumen without steep inclines.', 'Syed Adam — @melb_espresso_runs | +61 412 889 102', -38.354100, 144.952200, '2027-01-17 07:30:00', '2027-01-17 10:30:00', 50, 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=900&auto=format&fit=crop&q=80', NULL, 2, 'upcoming', '2026-10-30 14:15:00'),
(16, 'Lorne Beachside Coastal Coffee & Sakhir M4 Cruisers', 'Epic cruise down the Great Ocean Road finishing at Lorne for gourmet burgers and iced coffees right opposite the surf beach.', 'Sunset Chill', 'Australia', 'Bottle of Milk & Espresso Bar', '52 Mountjoy Pde, Lorne VIC 3232', 'Lorne Foreshore Promenade Lot after Great Ocean Rd run. Sealed surface throughout.', 'Chloe Vance — @chloe_35mm | +61 433 118 902', -38.541200, 143.974800, '2027-01-24 16:00:00', '2027-01-24 19:30:00', 65, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900&auto=format&fit=crop&q=80', NULL, 5, 'upcoming', '2026-10-31 09:00:00'),
(17, 'Albert Park Grand Prix Circuit Lakeside R8 V10 Run', 'Completed lap of the Albert Park lakeside promenade celebrating Melbourne motorsport heritage. Fresh almond croissants & filter brews.', 'Euro & Classics', 'Australia', 'Pipis Kiosk Lakeshore', '129A Beaconsfield Pde, Albert Park VIC 3206', 'Aughtie Drive lakeside Grand Prix circuit bays. Parking officers verified.', 'Syed Adam — @melb_espresso_runs | +61 412 889 102', -37.845200, 144.968100, '2026-10-25 07:30:00', '2026-10-25 10:30:00', 70, 'https://images.unsplash.com/photo-1783803116539-03b5750c0708?w=900&auto=format&fit=crop&q=80', NULL, 2, 'completed', '2026-10-12 11:00:00'),
(18, 'Calder Park Thunderdome Blobeye STI & Decaf Hangout', 'Cancelled due to planned surface resurfacing and sound barrier repairs. Rescheduled date will be announced in community announcements.', 'Night Meet', 'Australia', 'Calder Park Welcome Hub', 'Calder Fwy, Calder Park VIC 3037', 'Main Gate 2 Pit Area asphalt lot.', 'Jacob Pillai — @jacob_fl5 | +61 409 331 440', -37.669800, 144.755400, '2026-11-20 19:00:00', '2026-11-20 22:00:00', 120, 'https://images.unsplash.com/photo-1773384654744-e35345aab559?w=900&auto=format&fit=crop&q=80', NULL, 1, 'cancelled', '2026-10-28 17:30:00'),
-- 19 to 26: Malaysia Regional Meets (Sarawak, KL, Penang)
(19, 'Saradise Specialty Brews & Borneo Neon Civic Night', 'Evening specialty coffee hangout in Saradise Kuching featuring Sarawak JDM turbo hatches, FK7/FK8 builds, and pour-over tasting.', 'Night Meet', 'Malaysia', 'Earthlings Coffee Workshop, Saradise', 'Block B1, Saradise, 93350 Kuching, Sarawak', 'Central Saradise Square diagonal bays reserved from 5:30 PM.', 'Naveed Khan — @borneo_kopi_meets | +60 16-882 4105', 1.503400, 110.354800, '2026-11-21 17:30:00', '2026-11-21 21:00:00', 65, 'https://images.unsplash.com/photo-1605816988069-b11383b50717?w=900&auto=format&fit=crop&q=80', 'https://peatix.com/event/saradise-kuching-cars-coffee-nov2026', 3, 'upcoming', '2026-10-22 10:00:00'),
(20, 'Bangsar APW Sunday Cortado & Affalterbach AMG', 'Early Sunday morning gathering in Bangsar for AMG C63 coupes, Euro classics, and artisanal cortados.', 'Euro & Classics', 'Malaysia', 'Pulp by Papa Palheta, Bangsar', '29-01 Jalan Riong, Bangsar, 59100 Kuala Lumpur', 'Enter APW Bangsar main courtyard — marshals at gate from 7:15 AM.', 'Amirul Hakim — @kv_morning_roast | +60 17-291 6604', 3.123900, 101.671200, '2026-12-06 07:30:00', '2026-12-06 10:30:00', 50, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=80', 'https://facebook.com/events/bangsar-cortado-classics-dec2026', 6, 'upcoming', '2026-10-23 09:00:00'),
(21, 'George Town Penang Formula Red NSX & Single-Origin', 'Heritage George Town morning cruise passing colonial shophouses with NA1 NSX and 90s icons before assembling for single-origin filter roasts.', 'JDM & Brews', 'Malaysia', 'Norm Micro Roastery, George Town', '13 Gat Lebuh Gereja, 10300 George Town, Pulau Pinang', 'Church Street Pier public carpark (1-min walk to roastery courtyard).', 'Syed Adam — @melb_espresso_runs | +61 412 889 102', 5.414500, 100.339200, '2026-12-12 07:30:00', '2026-12-12 10:30:00', 55, 'https://images.unsplash.com/photo-1619925840813-da56acb9e26e?w=900&auto=format&fit=crop&q=80', NULL, 2, 'upcoming', '2026-10-24 16:30:00'),
(22, 'Subang Jaya SS15 Artisan Cold Brew & Golf R Deck', 'Completed Saturday night gathering of Golf R, Satria Neo R3, and Civic Type-R hatches on the multi-storey deck. Great turnout!', 'Morning Coffee', 'Malaysia', 'After Black Coffee, SS15', '23 Jalan SS15/4, 47500 Subang Jaya, Selangor', 'Multi-storey SS15 public automated parking deck opposite cafe.', 'Amirul Hakim — @kv_morning_roast | +60 17-291 6604', 3.076500, 101.590200, '2026-10-10 19:30:00', '2026-10-10 22:30:00', 80, 'https://images.unsplash.com/photo-1572811298797-9eecadf6cb24?w=900&auto=format&fit=crop&q=80', NULL, 6, 'completed', '2026-10-02 18:00:00'),
(23, 'Genting Highlands Early Touge & Evo VI Mist Run', 'Cancelled due to seasonal Genting monsoon heavy fog advisory and road slip risk. Monitor community feed for rescheduled date.', 'Morning Coffee', 'Malaysia', 'Gohtong Jaya Highland Roast', 'Jalan Batang Kali, 44300 Genting Highlands, Pahang', 'Gohtong Jaya roundabout public parking plaza.', 'Naveed Khan — @borneo_kopi_meets | +60 16-882 4105', 3.423900, 101.794200, '2026-11-28 06:30:00', '2026-11-28 09:30:00', 50, 'https://images.unsplash.com/photo-1760405503561-08152ac42cce?w=900&auto=format&fit=crop&q=80', NULL, 3, 'cancelled', '2026-10-25 15:00:00'),
(24, 'Bukit Bintang Laneway Cold Brew & AMG GT R Pro', 'Early morning city centre gathering before traffic picks up. Artisanal pastries, cold brew on ice, and wide alleyway bays for Euro track coupes.', 'Euro & Classics', 'Malaysia', 'Feeka Coffee Roasters', '19 Jalan Mesui, Bukit Bintang, 50200 Kuala Lumpur', 'Changkat public surface lot 60m from cafe entrance. Marshals stationed from 7:00 AM.', 'Amirul Hakim — @kv_morning_roast | +60 17-291 6604', 3.148800, 101.707200, '2027-01-09 07:00:00', '2027-01-09 10:00:00', 60, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=900&auto=format&fit=crop&q=80', NULL, 6, 'upcoming', '2026-10-29 14:00:00'),
(25, 'Geelong Waterfront 13B Single-Turbo RX-7 & Matcha', 'Gathering along the Geelong waterfront lawn for single-origin matcha, long blacks, and clean 90s FD3S RX-7 rotary classics.', 'JDM & Brews', 'Australia', 'Sailors Rest Espresso Deck', '3 Moorabool St, Geelong VIC 3220', 'Eastern Beach Road Pier Carpark — broad bitumen ramp.', 'Gibson Tan — @gr86_gibson | +61 421 774 019', -38.144900, 144.361200, '2027-01-16 08:00:00', '2027-01-16 11:30:00', 75, 'https://images.unsplash.com/photo-1780653313486-589171c0cdc5?w=900&auto=format&fit=crop&q=80', NULL, 4, 'upcoming', '2026-10-30 11:00:00'),
(26, 'Sorrento Sunrise Flat White & Estoril M-Sport Warmup', 'Mornington coastal warmup gathering at Buckley’s Chance before an optional Peninsula backroad cruise. Fresh bakery treats & flat whites.', 'Morning Coffee', 'Australia', 'Buckley’s Chance Roasters', '174 Ocean Beach Rd, Sorrento VIC 3943', 'Morce Ave rear public carpark — free until 10:00 AM.', 'Syed Adam — @melb_espresso_runs | +61 412 889 102', -38.340100, 144.741800, '2027-01-23 07:30:00', '2027-01-23 10:30:00', 50, 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&auto=format&fit=crop&q=80', NULL, 2, 'upcoming', '2026-10-31 16:00:00');

INSERT INTO meet_rsvps (id, meet_id, user_id, attend_type, car_brought, created_at) VALUES
(1, 1, 1, 'bringing_car', '2024 Honda Civic Type R (FL5)', '2026-10-20 10:15:00'),
(2, 1, 4, 'bringing_car', '2023 Toyota GR86', '2026-10-20 11:20:00'),
(3, 1, 5, 'bringing_car', '1995 Mazda MX-5 Miata (NA8C)', '2026-10-21 09:00:00'),
(4, 2, 1, 'bringing_car', '2024 Honda Civic Type R (FL5)', '2026-10-21 14:10:00'),
(5, 2, 2, 'spectating', 'Grabbing Coffee / Camera Only', '2026-10-22 08:30:00'),
(6, 2, 5, 'bringing_car', '1995 Mazda MX-5 Miata (NA8C)', '2026-10-22 10:45:00'),
(7, 3, 3, 'bringing_car', '2000 Nissan Skyline GT-R (R34)', '2026-10-22 16:00:00'),
(8, 3, 6, 'bringing_car', '2005 Mitsubishi Lancer Evolution IX MR', '2026-10-23 12:00:00'),
(9, 4, 3, 'bringing_car', '2020 Nissan GT-R Recaro Edition (R35)', '2026-10-23 15:00:00'),
(10, 4, 6, 'bringing_car', '2010 Proton Satria Neo R3 Lotus Racing', '2026-10-24 09:00:00'),
(11, 8, 2, 'bringing_car', '1973 Porsche 911 Carrera RS 2.7', '2026-10-10 09:00:00'),
(12, 8, 4, 'bringing_car', '2022 Toyota GR Supra RZ (A90)', '2026-10-11 10:00:00'),
(13, 9, 2, 'bringing_car', '2019 Porsche 911 Carrera S (991.2)', '2026-10-26 10:00:00'),
(14, 10, 1, 'bringing_car', '2024 Honda Civic Type R (FL5)', '2026-10-27 11:30:00'),
(15, 11, 4, 'bringing_car', '2023 Toyota GR86', '2026-10-28 09:15:00'),
(16, 12, 5, 'bringing_car', '1995 Mazda MX-5 Miata (NA8C)', '2026-10-29 14:00:00'),
(17, 13, 4, 'bringing_car', '2023 Toyota GR86', '2026-10-30 08:45:00'),
(18, 14, 1, 'bringing_car', '2023 Toyota GR Yaris Rallye', '2026-10-31 09:00:00'),
(19, 17, 2, 'bringing_car', '2021 Audi R8 V10 Performance', '2026-10-20 08:00:00'),
(20, 17, 5, 'bringing_car', '1995 Mazda MX-5 Miata (NA8C)', '2026-10-20 09:30:00'),
(21, 19, 3, 'bringing_car', '2020 Honda Civic RS Hatchback (FK7)', '2026-10-23 11:00:00'),
(22, 20, 6, 'bringing_car', '2018 Mercedes-AMG C63 S Coupe', '2026-10-24 14:00:00'),
(23, 21, 2, 'bringing_car', '1992 Honda NSX Coupe (NA1)', '2026-10-25 15:30:00'),
(24, 22, 6, 'bringing_car', '2019 Volkswagen Golf R (Mk7.5)', '2026-10-05 19:00:00'),
(25, 22, 3, 'bringing_car', '2000 Nissan Skyline GT-R (R34)', '2026-10-06 18:30:00'),
(26, 25, 4, 'bringing_car', '1998 Mazda RX-7 Type RS (FD3S)', '2026-10-31 12:00:00');

INSERT INTO posts (id, user_id, meet_id, title, body, car_tag, location_tag, image, created_at) VALUES
(1, 5, 1, 'Reflections on the air-cooled 1973 Porsche 911 Carrera RS 2.7', 'Shot a roll of Kodak Portra 400 at Sunday classic espresso meet. Nothing beats seeing a Grand Prix White Carrera RS 2.7 on Fuchs wheels parked by the coffee machine at 7:30 AM!', 'Porsche 911 Carrera RS 2.7', 'St Kilda Pier, Melbourne', 'https://images.unsplash.com/photo-1741963244619-10997539b2e7?w=900&auto=format&fit=crop&q=80', '2026-10-19 11:30:00'),
(2, 6, 3, 'Graphite Grey Evo IX MR & GReddy intercooler ready for Kuching Waterfront Kopi night', 'Dialed in the alignment and checked the front-mount GReddy intercooler piping on the CT9A Evolution IX MR by the harbour lighthouse. Who else is heading to Ewe Hai Street for Gula Apong lattes?', 'Mitsubishi Lancer Evolution IX MR', 'Kuching, Sarawak', 'https://images.unsplash.com/photo-1660209336030-ea4d2d0e0412?w=900&auto=format&fit=crop&q=80', '2026-10-23 18:15:00'),
(3, 4, 2, 'Port Melbourne pour-over scouting in the White A90 GR Supra — ramp clearance verified!', 'Dropped by Industry Beans this morning to test the rear courtyard entry apron with the lowered White Metallic GR Supra on 3-piece deep-dish wheels. Zero scraping even with front canards!', 'Toyota GR Supra RZ (A90)', 'Port Melbourne, VIC', 'https://images.unsplash.com/photo-1749449387749-cb689efd21fe?w=900&auto=format&fit=crop&q=80', '2026-10-25 09:40:00'),
(4, 3, 4, 'Pearl White R35 GT-R highway warmup + Iced Oat Latte = Perfect Sunday', 'Quick morning warmup down the open highway with the VR38 twin-turbo R35 GT-R before setting up the November Glenmarie roster. Drop your car make in the Roll-Call if you need wide bay parking!', 'Nissan GT-R Premium (R35)', 'Glenmarie, Selangor', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=900&auto=format&fit=crop&q=80', '2026-10-26 08:20:00'),
(5, 1, 5, 'Championship White Civic Type R morning shakedown before Warrandyte run', 'Tested the new brake pads through the Yarra Boulevard sweepers in the FK8 Type R before heading down for batch brew. Car feels pinned and sharp.', 'Honda Civic Type R (FK8)', 'Warrandyte, VIC', 'https://images.unsplash.com/photo-1572471372724-a7c1c9450c21?w=900&auto=format&fit=crop&q=80', '2026-10-27 10:00:00'),
(6, 2, 15, 'Alpine flat-six warmup in the Chalk White 991.2 GT3', 'Oil temp right where it needs to be on center-lock wheels. Looking forward to seeing the Porsche and Euro turnouts this weekend.', 'Porsche 911 GT3 (991.2)', 'Arthurs Seat, VIC', 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=900&auto=format&fit=crop&q=80', '2026-10-28 07:45:00'),
(7, 5, 12, 'Montego Blue NA8C Miata roadster in the morning shade', 'Spring coastal breeze and 35mm film shots of the tan-top NA Miata. Cannot beat a lightweight roadster for smiles per hour.', 'Mazda MX-5 Miata (NA8C)', 'Brighton Beach, VIC', 'https://images.unsplash.com/photo-1747197413754-dc600f71f3d6?w=900&auto=format&fit=crop&q=80', '2026-10-29 18:20:00'),
(8, 6, 20, 'Selenite Grey Magno AMG C63 S Edition 1 outside APW Bangsar', 'Spotted this immaculate matte grey C63 S Coupe with the yellow racing stripe outside Pulp this morning. Espresso was on point as always.', 'Mercedes-AMG C63 S Coupe', 'Bangsar, KL', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=80', '2026-10-30 09:10:00');

INSERT INTO likes (id, user_id, target_type, target_id, created_at) VALUES
(1, 1, 'meet', 1, '2026-10-20 10:16:00'),
(2, 4, 'meet', 1, '2026-10-20 11:21:00'),
(3, 5, 'meet', 1, '2026-10-21 09:05:00'),
(4, 1, 'meet', 2, '2026-10-21 14:12:00'),
(5, 2, 'meet', 2, '2026-10-22 08:32:00'),
(6, 3, 'meet', 3, '2026-10-22 16:05:00'),
(7, 6, 'meet', 3, '2026-10-23 12:05:00'),
(8, 3, 'meet', 4, '2026-10-23 15:02:00'),
(9, 1, 'post', 1, '2026-10-19 12:00:00'),
(10, 2, 'post', 1, '2026-10-19 13:10:00'),
(11, 4, 'post', 1, '2026-10-19 14:00:00'),
(12, 3, 'post', 2, '2026-10-23 19:00:00'),
(13, 1, 'post', 3, '2026-10-25 10:00:00'),
(14, 4, 'post', 5, '2026-10-27 10:30:00'),
(15, 2, 'post', 5, '2026-10-27 11:00:00'),
(16, 5, 'post', 6, '2026-10-28 08:30:00'),
(17, 1, 'post', 7, '2026-10-29 19:00:00'),
(18, 4, 'post', 7, '2026-10-29 19:15:00'),
(19, 3, 'post', 8, '2026-10-30 09:45:00'),
(20, 1, 'meet', 8, '2026-10-18 11:00:00'),
(21, 4, 'meet', 8, '2026-10-18 11:30:00'),
(22, 5, 'meet', 8, '2026-10-18 12:00:00'),
(23, 2, 'meet', 17, '2026-10-25 09:00:00'),
(24, 1, 'meet', 17, '2026-10-25 09:30:00'),
(25, 6, 'meet', 22, '2026-10-10 20:00:00'),
(26, 3, 'meet', 22, '2026-10-10 20:30:00');

INSERT INTO comments (id, user_id, target_type, target_id, body, rating, created_at) VALUES
(1, 4, 'meet', 1, 'Bringing the GR86 and my camera! Are dogs on leashes welcome near the outdoor espresso cart?', NULL, '2026-10-21 10:30:00'),
(2, 2, 'meet', 1, 'Yes! Outdoor boardwalk seating is 100% dog-friendly.', NULL, '2026-10-21 11:05:00'),
(3, 6, 'meet', 3, 'Cannot wait! Bringing the Evo IX MR and a Satria Neo R3 from Petra Jaya.', NULL, '2026-10-24 14:20:00'),
(4, 4, 'meet', 8, 'Best espresso and cleanest classic Ferrari & Porsche turnout all year. Easy parking too!', 5, '2026-10-18 12:15:00'),
(5, 5, 'meet', 8, 'Loved the chill morning atmosphere and zero anti-social behavior.', 5, '2026-10-18 14:00:00'),
(6, 1, 'meet', 8, 'Brunetti coffee service was fast even with 50+ members ordering. Fantastic event!', 5, '2026-10-18 14:30:00'),
(7, 2, 'meet', 17, 'Lakeside Grand Prix cruise was so scenic in the morning light. 10/10 venue!', 5, '2026-10-25 11:00:00'),
(8, 5, 'meet', 17, 'Great coffee and easy lakeside parking. Really well organized.', 5, '2026-10-25 11:45:00'),
(9, 3, 'meet', 22, 'Subang night meet was packed! SS15 multi-storey parking made it super easy for low cars.', 4, '2026-10-10 23:00:00'),
(10, 6, 'meet', 22, 'Hot-hatch turnout was amazing. Looking forward to the next one.', 5, '2026-10-10 23:15:00'),
(11, 2, 'post', 1, 'Those Portra tones on the classic Carrera RS 2.7 are incredible Chloe!', NULL, '2026-10-19 15:20:00'),
(12, 1, 'post', 3, 'Legend for checking the ramp clearance Gibson—my front splitter thanks you.', NULL, '2026-10-25 11:00:00'),
(13, 4, 'post', 5, 'Those Yarra Boulevard morning runs are the best in Melbourne. Clean Type-R!', NULL, '2026-10-27 11:15:00'),
(14, 1, 'post', 6, 'See you Sunday at Arthurs Seat Syed! Bringing the Type-R.', NULL, '2026-10-28 08:50:00'),
(15, 4, 'post', 7, 'Brighton beach boxes make the best photo backdrop for roadsters.', NULL, '2026-10-29 19:30:00');
