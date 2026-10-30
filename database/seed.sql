-- ============================================================================
-- Cars & Coffee — Seed Data (Australia & Malaysia Car Meets & Social Feed)
-- Default password for all seeded accounts: Password123!
-- ============================================================================

INSERT INTO users (id, name, email, password_hash, role, car_make, car_model, car_year, region, avatar, bio, created_at) VALUES
(1, 'Jacob Pillai', 'admin@carsandcoffee.com', '$2y$10$QOTY23BrhjuMX4UPG48/Q.NZlLPq69kZFSAvzAbQBalhxonnsLcSu', 'admin', 'Honda', 'Civic Type R (FL5)', 2024, 'Australia', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80', 'Community Founder & flat-white enthusiast splitting time between Melbourne and Kuching.', '2026-09-01 08:00:00'),
(2, 'Syed Adam', 'syed@carsandcoffee.com', '$2y$10$QOTY23BrhjuMX4UPG48/Q.NZlLPq69kZFSAvzAbQBalhxonnsLcSu', 'member', 'Porsche', '911 Carrera S (991.2)', 2019, 'Australia', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=160&auto=format&fit=crop&q=80', 'Sunday morning espresso runner & air/water-cooled Porsche collector in Melbourne.', '2026-09-03 09:15:00'),
(3, 'Naveed Khan', 'naveed@carsandcoffee.com', '$2y$10$QOTY23BrhjuMX4UPG48/Q.NZlLPq69kZFSAvzAbQBalhxonnsLcSu', 'member', 'Nissan', 'Skyline GT-R (R34)', 2000, 'Malaysia', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80', 'Hosting weekend Kopi & JDM mornings across Kuching Waterfront and Glenmarie KL.', '2026-09-05 10:30:00'),
(4, 'Gibson Tan', 'member@carsandcoffee.com', '$2y$10$QOTY23BrhjuMX4UPG48/Q.NZlLPq69kZFSAvzAbQBalhxonnsLcSu', 'member', 'Toyota', 'GR86', 2023, 'Australia', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80', 'Daily-driven Hakone Green GR86 on Volk TE37s. Always down for a coastal coffee run.', '2026-09-07 14:20:00'),
(5, 'Chloe Vance', 'chloe@carsandcoffee.com', '$2y$10$QOTY23BrhjuMX4UPG48/Q.NZlLPq69kZFSAvzAbQBalhxonnsLcSu', 'member', 'Mazda', 'MX-5 Miata (NA8C)', 1995, 'Australia', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80', '35mm film car spotter & classic roadster fan.', '2026-09-10 16:45:00'),
(6, 'Amirul Hakim', 'amirul@carsandcoffee.com', '$2y$10$QOTY23BrhjuMX4UPG48/Q.NZlLPq69kZFSAvzAbQBalhxonnsLcSu', 'member', 'Proton', 'Satria Neo R3 Lotus Racing', 2010, 'Malaysia', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=160&auto=format&fit=crop&q=80', 'Keeping Malaysian hot-hatch heritage alive at KL & Sarawak coffee meets.', '2026-09-12 19:00:00');

INSERT INTO meets (id, title, description, vibe, region, cafe_name, address, parking_note, host_contact, latitude, longitude, meet_datetime, end_datetime, capacity, image, source_url, host_id, status, created_at) VALUES
(1, 'St Kilda Pier Sunrise Espresso & Classics', 'Bring your classic, restomod, or weekend cruiser down by the bay for fresh single-origin espresso and croissants before Melbourne traffic wakes up. Relaxed family-friendly vibe—no revving or loud stereos near the boardwalk.', 'Euro & Classics', 'Australia', 'Little Blue Roasters, St Kilda Pier', 'Pier Rd, St Kilda VIC 3182', 'Enter via Jacka Blvd Lower Foreshore Carpark, North Row Bays 1–45 reserved for low-clearance cars.', 'Syed Adam — @melb_espresso_runs | +61 412 889 102', -37.864000, 144.966700, '2026-11-01 07:30:00', '2026-11-01 10:30:00', 60, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=80', 'https://carsandcoffee.org.au/melbourne-bay-run-2026', 2, 'upcoming', '2026-10-15 09:00:00'),
(2, 'Port Melbourne Roastery JDM & Pour-Over', 'Monthly Sunday morning gathering inside Port Melbourne''s brick warehouse district. Specialty V60 pour-overs, matcha lattes, and 80+ bays of 90s/00s Japanese icons and modern GR/Type-R builds.', 'JDM & Brews', 'Australia', 'Industry Beans Warehouse, Port Melbourne', '345 Plummer St, Port Melbourne VIC 3207', 'Use Rear Loading Courtyard off Salmon St — concrete ramp is lip-spoiler friendly.', 'Gibson Tan — @gr86_gibson | +61 421 774 019', -37.828500, 144.929000, '2026-11-08 08:00:00', '2026-11-08 11:30:00', 85, 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=900&auto=format&fit=crop&q=80', 'https://instagram.com/p/portmelb-jdm-coffee-2026', 4, 'upcoming', '2026-10-18 11:00:00'),
(3, 'Kuching Waterfront Kopi O & Borneo Builds', 'Saturday evening chill meet along the Sarawak River breeze. Local artisanal Gula Apong lattes, iced Kopi O, and a laid-back showcase of Sarawak''s cleanest JDM, Proton R3, and stance builds.', 'Sunset Chill', 'Malaysia', 'Black Bean Coffee & Tea Co., Kuching', '87 Ewe Hai St, 93000 Kuching, Sarawak', 'Meet at Padungan South Open Plaza Zone B (5-min walk or group park along Carpenter St East Deck).', 'Naveed Khan — @borneo_kopi_meets | +60 16-882 4105', 1.557400, 110.346800, '2026-11-07 17:00:00', '2026-11-07 20:30:00', 70, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&auto=format&fit=crop&q=80', 'https://peatix.com/event/kuching-kopi-cars-2026', 3, 'upcoming', '2026-10-19 14:00:00'),
(4, 'Glenmarie Artisan Roast & Morning Throttle', 'Klang Valley''s signature Sunday morning Cars & Coffee! Freshly pulled flat whites, sourdough toasties, and wide shaded tree-lined parking for everything from Myvi turbo sleeper builds to GT3 Touring.', 'Morning Coffee', 'Malaysia', 'Suburbia Coffee Roasters, Glenmarie', '12 Jalan Presiden F U1/F, Glenmarie, 40150 Shah Alam, Selangor', 'Park along Lot U1 North Perimeter (Bays A1–A60). Marshals in orange vests will guide low cars.', 'Amirul Hakim — @kv_morning_roast | +60 17-291 6604', 3.088200, 101.585100, '2026-11-15 07:30:00', '2026-11-15 11:00:00', 100, 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&auto=format&fit=crop&q=80', 'https://facebook.com/events/glenmarie-coffee-2026', 6, 'upcoming', '2026-10-20 10:00:00'),
(5, 'Yarra Valley Cold Brew & Healesville Hills Run', 'Meet for cold brew and bacon & egg rolls in Warrandyte before an optional scenic morning cruise up through Christmas Hills to Healesville.', 'Morning Coffee', 'Australia', 'Cocoa Moon Cafe, Warrandyte', '168 Yarra St, Warrandyte VIC 3113', 'Assemble at Riverbank Lower Gravel-Free Lot behind Yarra St Bakery at 7:15 AM sharp.', 'Jacob Pillai — @jacob_fl5 | +61 409 331 440', -37.744200, 145.213600, '2026-11-22 07:15:00', '2026-11-22 11:00:00', 45, 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&auto=format&fit=crop&q=80', NULL, 1, 'upcoming', '2026-10-21 15:00:00'),
(6, 'Docklands Rooftop Golden Hour & Decaf', 'Twilight rooftop photography session and decaf lattes overlooking Bolte Bridge. Open to all clean street builds, roadsters, and daily drivers.', 'Night Meet', 'Australia', 'District Brewer & Rooftop Deck, Docklands', 'Level 3 East Carpark, 440 Docklands Dr, Docklands VIC 3008', 'Take East Spiral Ramp to Level 3 Open Air Deck — ticket validation code COFFEE26 at exit.', 'Chloe Vance — @chloe_35mm | +61 433 118 902', -37.813600, 144.938500, '2026-11-28 18:00:00', '2026-11-28 21:00:00', 75, 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=900&auto=format&fit=crop&q=80', NULL, 5, 'upcoming', '2026-10-22 12:00:00'),
(7, 'Sepang Paddock Kopi & Track-Prepped Street Cars', 'Casual morning coffee hangout outside the Sepang Welcome Centre before the public track day starts. Great spot to inspect brake setups, wheel fitment, and grab nasi lemak & iced latte.', 'JDM & Brews', 'Malaysia', 'Paddock Brew House, Sepang', 'Jalan Pekeliling, 64000 KLIA, Selangor', 'Public Welcome Centre Visitor Lot C (free parking until 12:00 PM).', 'Naveed Khan — @borneo_kopi_meets | +60 16-882 4105', 2.760800, 101.738300, '2026-12-05 08:00:00', '2026-12-05 11:30:00', 80, 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=900&auto=format&fit=crop&q=80', NULL, 3, 'upcoming', '2026-10-24 09:30:00'),
(8, 'Lygon Street Autumn Espresso & Italian Classics (Past Meet)', 'Completed Sunday morning celebration of Italian coachbuilding, air-cooled classics, and Lygon Street espresso culture. Thank you to all 52 owners who attended!', 'Euro & Classics', 'Australia', 'Brunetti Classico, Carlton', '380 Lygon St, Carlton VIC 3053', 'Faraday St Kerbside & Elgin St Carpark Level 1.', 'Syed Adam — @melb_espresso_runs | +61 412 889 102', -37.798400, 144.967200, '2026-10-18 07:30:00', '2026-10-18 10:30:00', 55, 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=900&auto=format&fit=crop&q=80', NULL, 2, 'completed', '2026-10-01 10:00:00');

INSERT INTO meet_rsvps (id, meet_id, user_id, attend_type, car_brought, created_at) VALUES
(1, 1, 1, 'bringing_car', '2024 Honda Civic Type R (FL5)', '2026-10-20 10:15:00'),
(2, 1, 4, 'bringing_car', '2023 Toyota GR86', '2026-10-20 11:20:00'),
(3, 1, 5, 'bringing_car', '1995 Mazda MX-5 Miata (NA8C)', '2026-10-21 09:00:00'),
(4, 2, 1, 'bringing_car', '2024 Honda Civic Type R (FL5)', '2026-10-21 14:10:00'),
(5, 2, 2, 'spectating', 'Grabbing Coffee / Camera Only', '2026-10-22 08:30:00'),
(6, 2, 5, 'bringing_car', '1995 Mazda MX-5 Miata (NA8C)', '2026-10-22 10:45:00'),
(7, 3, 3, 'bringing_car', '2000 Nissan Skyline GT-R (R34)', '2026-10-22 16:00:00'),
(8, 3, 6, 'bringing_car', '2010 Proton Satria Neo R3 Lotus Racing', '2026-10-23 12:00:00'),
(9, 4, 3, 'bringing_car', '2000 Nissan Skyline GT-R (R34)', '2026-10-23 15:00:00'),
(10, 4, 6, 'bringing_car', '2010 Proton Satria Neo R3 Lotus Racing', '2026-10-24 09:00:00'),
(11, 8, 2, 'bringing_car', '2019 Porsche 911 Carrera S (991.2)', '2026-10-10 09:00:00'),
(12, 8, 4, 'bringing_car', '2023 Toyota GR86', '2026-10-11 10:00:00');

INSERT INTO posts (id, user_id, meet_id, title, body, car_tag, location_tag, image, created_at) VALUES
(1, 5, 8, 'Golden light on the air-cooled 911 lineup at Lygon Street', 'Shot a roll of Kodak Portra 400 at last Sunday''s Carlton espresso meet. Nothing beats the sound of flat-sixes echoing past the coffee machines at 7:30 AM!', 'Porsche 911 Carrera', 'Carlton, Melbourne', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=80', '2026-10-19 11:30:00'),
(2, 6, 3, 'Fresh bronze CE28N fitment ready for Kuching Waterfront Kopi night', 'Finally dialed in the alignment and mounted fresh 205/45R16 Advan Neova AD09s on the Satria Neo R3. Who else is coming down to Ewe Hai Street next Saturday for Gula Apong lattes?', 'Proton Satria Neo R3', 'Kuching, Sarawak', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&auto=format&fit=crop&q=80', '2026-10-23 18:15:00'),
(3, 4, 2, 'Port Melbourne pour-over scouting — ramp clearance verified!', 'Dropped by Industry Beans this morning to test the rear courtyard entry ramp with my lowered GR86. Zero scraping even with a front lip! See everyone there on Nov 8.', 'Toyota GR86', 'Port Melbourne, VIC', 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=900&auto=format&fit=crop&q=80', '2026-10-25 09:40:00'),
(4, 3, 4, 'Bayside Blue R34 + Iced Oat Latte = Perfect Sunday', 'Quick morning warmup through Shah Alam before setting up the November Glenmarie roster. Drop your car make in the Roll-Call if you need wide bay parking!', 'Nissan Skyline GT-R (R34)', 'Glenmarie, Selangor', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&auto=format&fit=crop&q=80', '2026-10-26 08:20:00');

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
(13, 1, 'post', 3, '2026-10-25 10:00:00');

INSERT INTO comments (id, user_id, target_type, target_id, body, rating, created_at) VALUES
(1, 4, 'meet', 1, 'Bringing the GR86 and my camera! Are dogs on leashes welcome near the outdoor espresso cart?', NULL, '2026-10-21 10:30:00'),
(2, 2, 'meet', 1, 'Yes! Outdoor boardwalk seating is 100% dog-friendly.', NULL, '2026-10-21 11:05:00'),
(3, 6, 'meet', 3, 'Cannot wait! Bringing two Satria Neos and a civic FD2R from Petra Jaya.', NULL, '2026-10-24 14:20:00'),
(4, 4, 'meet', 8, 'Best espresso and cleanest classic Alfa & Porsche turnout all year. Easy parking too!', 5, '2026-10-18 12:15:00'),
(5, 5, 'meet', 8, 'Loved the chill morning atmosphere and zero anti-social behavior.', 5, '2026-10-18 14:00:00'),
(6, 2, 'post', 1, 'Those Portra tones on the Guards Red 911 are incredible Chloe!', NULL, '2026-10-19 15:20:00'),
(7, 1, 'post', 3, 'Legend for checking the ramp clearance Gibson—my FL5 front splitter thanks you.', NULL, '2026-10-25 11:00:00');
