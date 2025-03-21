TRUNCATE TABLE clients;

INSERT INTO clients(
    name, firstname, email, password, date_inscription, street, number, box, postal_code, city, country, phone_number, civility
)
VALUES (
    'Admin', 'Admin', 'admin@gmail.com', '123', '2023-10-01',
    'Admin Street', '123', '', '00000', 'Admin City', 'Admin Country', '0000000000', 'Monsieur'
);
