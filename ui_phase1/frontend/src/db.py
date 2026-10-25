import mysql.connector

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "database": "mentor_mente",
}


def get_connection():
    return mysql.connector.connect(**DB_CONFIG)


def init_db():
    """Create the application database and its tables if they do not exist."""
    server_config = {key: value for key, value in DB_CONFIG.items() if key != "database"}
    conn = mysql.connector.connect(**server_config)
    cursor = conn.cursor()
    try:
        cursor.execute(
            f"CREATE DATABASE IF NOT EXISTS `{DB_CONFIG['database']}` "
            "DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        )
    finally:
        cursor.close()
        conn.close()

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(120) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('mentor', 'mentee', 'admin') NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS mentor_profiles (
                user_id INT PRIMARY KEY,
                expertise VARCHAR(255) NOT NULL,
                bio TEXT,
                availability TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS mentee_profiles (
                user_id INT PRIMARY KEY,
                goals TEXT,
                interests VARCHAR(255),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS mentor_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                mentor_id INT NOT NULL,
                mentee_id INT NOT NULL,
                message TEXT,
                status ENUM('pending', 'accepted', 'declined', 'completed')
                    NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (mentee_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_mentor_mentee (mentor_id, mentee_id)
            ) ENGINE=InnoDB
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                request_id INT NOT NULL,
                scheduled_at DATETIME NOT NULL,
                duration_minutes INT NOT NULL DEFAULT 60,
                notes TEXT,
                status ENUM('scheduled', 'completed', 'cancelled')
                    NOT NULL DEFAULT 'scheduled',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (request_id) REFERENCES mentor_requests(id) ON DELETE CASCADE
            ) ENGINE=InnoDB
            """
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()


