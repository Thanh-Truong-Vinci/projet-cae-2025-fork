TRUNCATE TABLE clients;

INSERT INTO users(
    name, firstname, email, password, date_inscription
)
VALUES (
    'User', 'Example', 'user@example.com', 'userpassword', '2023-10-01'
);

INSERT INTO users_with_address(
    name, firstname, email, password, date_inscription, street, number, box, postal_code, city, country, phone_number
)
VALUES (
    'Example Street', '10', NULL, '12345', 'Example City', 'Example Country', '1234567890'
);

INSERT INTO clients(
    name, firstname, email, password, date_inscription, street, number, box, postal_code, city, country, phone_number, civility
)
VALUES (
   'Monsieur'
);
