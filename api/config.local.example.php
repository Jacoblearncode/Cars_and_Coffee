<?php
/**
 * Cars & Coffee — Local / Mercury Secret Config Template
 * Copy this file to `api/config.local.php` and fill in your Swinburne FeeNIX MariaDB
 * credentials (or local XAMPP/WAMP MySQL credentials).
 */

return array(
    'DB_HOST'    => 'feenix-mariadb.swin.edu.au',
    'DB_NAME'    => 's105986053_db',
    'DB_USER'    => 's105986053',
    'DB_PASS'    => 'YOUR_MERCURY_DB_PASSWORD',
    'JWT_SECRET' => 'replace-with-a-random-32-byte-secret-key-for-mercury'
);
