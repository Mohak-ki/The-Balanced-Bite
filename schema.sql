-- The Balanced Bite — MySQL schema
-- Run against the database named in DB_NAME (default: balanced_bite).
--   mysql -u <user> -p balanced_bite < schema.sql

CREATE TABLE IF NOT EXISTS users (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  email    VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  email    VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(255) NOT NULL,
  price INT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  total      DECIMAL(10,2) NOT NULL,
  items      TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  name    VARCHAR(100) NOT NULL,
  email   VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  city    VARCHAR(100),
  pincode VARCHAR(20),
  plan    VARCHAR(100) NOT NULL,
  price   INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an admin account with a bcrypt-hashed password. Generate the hash with:
--   node -e "import('bcryptjs').then(b => b.default.hash('your-password', 10).then(console.log))"
-- then:
-- INSERT INTO admins (email, password) VALUES ('admin@example.com', '<bcrypt-hash>');
