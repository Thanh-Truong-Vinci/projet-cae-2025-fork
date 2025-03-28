TRUNCATE TABLE users CASCADE;

INSERT INTO users(name, firstname, email, password, date_inscription)
VALUES ('Admin', 'Admin', 'admin@example.com', 'adminpw', '2001-01-01');