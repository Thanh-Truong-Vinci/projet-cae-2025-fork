TRUNCATE TABLE clients;

INSERT INTO clients(
    name,
    firstname,
    email,
    password,
    street,
    number,
    postal_code,
    city,
    country,
    date_inscription
)
VALUES (
    'Admin',
    'Admin',
    'admin@outlook.com',
    '$2y$10$EW75BdcbCfKEA3NbE7in4OiYYacfP3OY4Q2JsVzjxd3jNxxgAEZNu',
    'Admin Street',
    '1',
    '1000',
    'Admin City',
    'Admin Country',
    CURRENT_DATE
);
