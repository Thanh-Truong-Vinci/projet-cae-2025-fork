TRUNCATE TABLE clients;

INSERT INTO clients(
    name, firstname, civility, email, password, date_inscription, street, number, box, postal_code, city, country, phoneNumber, civility
)
VALUES (
    'Admin', 'Admin', 'Monsieur','admin@gmail.com', '123', '2023-10-01',
    'Admin Street', '123', '', '00000', 'Admin City', 'Admin Country', '0000000000', 'Admin'
);
