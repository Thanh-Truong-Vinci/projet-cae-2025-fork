TRUNCATE TABLE clients;

INSERT INTO clients(
    name, firstname, email, password, date_inscription, street, number, box, postal_code, city, country, phoneNumber
)
VALUES (
    'Admin', 'Admin', 'admin@gmail.com', '123', '2023-10-01',
    'Fake Street', '123', '', '00000', 'Fake City', 'Fake Country', '0000000000'
);
