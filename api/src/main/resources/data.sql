TRUNCATE TABLE batches CASCADE;
TRUNCATE TABLE client CASCADE;
TRUNCATE TABLE manager CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE photos CASCADE;
TRUNCATE TABLE producer CASCADE;
TRUNCATE TABLE product_types CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE reservation CASCADE;
TRUNCATE TABLE reservation_lines CASCADE;
TRUNCATE TABLE user_with_address CASCADE;
TRUNCATE TABLE users CASCADE;

-- Insérer un administrateur
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Admin', 'Admin', 'admin@example.com',
        '$2a$10$Gx8Kku6mS5PdMgiSne0neumKPPZWr28huUKo/joIs.79deMbi4M4i',
        '2001-01-01');

-- Récupérer l'ID généré et insérer dans la table manager
INSERT INTO manager (id_user, manager)
SELECT id_user, NULL
FROM users
WHERE email = 'admin@example.com';

-- Créer un producteur de test
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Dupont', 'Jean', 'producer@example.com',
        '$2a$10$8Cv0QyLMQ.dDlswhLhd8peiW6.KWnQLl0VmL5lw41/trJgprkg2vm',
        '2024-01-15');

-- Récupérer l'ID et créer l'adresse du producteur
INSERT INTO user_with_address (id_user, street, number, box, postal_code, city, country,
                               phone_number)
SELECT id_user,
       'Rue des Agriculteurs',
       '42',
       '',
       '1000',
       'Bruxelles',
       'Belgique',
       '+32456789012'
FROM users
WHERE email = 'producer@example.com';

-- Créer l'entrée producteur avec sa compagnie
INSERT INTO producer (id_user, company)
SELECT id_user, 'Ferme Bio du Bon Vivant'
FROM users
WHERE email = 'producer@example.com';

-- Insérer les types de produits
INSERT INTO product_types (title)
VALUES ('Légumes'),
       ('Fruits'),
       ('Boulangerie'),
       ('Viande'),
       ('Produits laitiers'),
       ('Boissons'),
       ('Autres');

-- Insérer quelques photos
INSERT INTO photos (product_name, url)
VALUES ('tomate_bio',
        'https://imagestoragecae09.blob.core.windows.net/dev/640b2ba0-885c-4aa0-bff5-5f995f99e745'),
       ('pomme_rouge',
        'https://imagestoragecae09.blob.core.windows.net/dev/97912d63-b931-4a0f-acaa-f1632cd742ad'),
       ('pain_artisanal',
        'https://imagestoragecae09.blob.core.windows.net/dev/f2a0ec00-fc7e-45c5-9794-7320fc70c797'),
       ('fromage',
        'https://imagestoragecae09.blob.core.windows.net/dev/ff87dda5-99f9-4c96-a731-2c71dd884e2d'),
       ('carottes',
        'https://imagestoragecae09.blob.core.windows.net/dev/e9b1914d-343c-4b5f-b146-c8016f6e83ff'),
       ('biere',
        'https://imagestoragecae09.blob.core.windows.net/dev/f212f310-a62f-4ea6-be3a-e1ef2edf3321'),
       ('poulet',
        'https://imagestoragecae09.blob.core.windows.net/dev/601c557a-8862-410f-9d66-19c49f903e30'),
       ('yaourt',
        'https://imagestoragecae09.blob.core.windows.net/dev/52205241-37f2-4631-a7e7-f967a65fbee8'),
       ('pomme_jonagold',
        'https://imagestoragecae09.blob.core.windows.net/dev/758fcf0e-a66c-45e0-95ed-8f0aa6ecfd80'),
       ('choufleur_cheddar',
        'https://imagestoragecae09.blob.core.windows.net/dev/007d32fb-7c1d-45ca-a917-48ce9f0db3ae');

-- Insérer des produits
INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'Tomates Bio',
       'Tomates cultivées sans pesticides, parfaites pour vos salades estivales.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'tomate_bio';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'Pommes Royal Gala',
       'Pommes sucrées et croquantes, idéales comme collation.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Fruits'
  AND p.product_name = 'pomme_rouge';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'Pain au levain',
       'Pain artisanal à l''ancienne préparé avec du levain naturel.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Boulangerie'
  AND p.product_name = 'pain_artisanal';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'Fromage fermier',
       'Fromage à pâte dure affiné pendant 6 mois.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Produits laitiers'
  AND p.product_name = 'fromage';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'Carottes Bio',
       'Carottes fraîches cultivées en agriculture biologique, riches en bêta-carotène.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'carottes';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'Bière artisanale',
       'Bière blonde artisanale brassée localement avec des ingrédients de qualité.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Boissons'
  AND p.product_name = 'biere';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'Poulet fermier',
       'Poulet élevé en plein air, nourri aux grains et sans antibiotiques.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Viande'
  AND p.product_name = 'poulet';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'Yaourt nature',
       'Yaourt onctueux préparé avec du lait frais de vaches locales.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Produits laitiers'
  AND p.product_name = 'yaourt';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'Pomme Jonagold',
       'Pommes Jonagold juteuses et légèrement acidulées, parfaites pour la cuisine ou en collation.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Fruits'
  AND p.product_name = 'pomme_jonagold';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'Chou-fleur cheddar',
       'Variété de chou-fleur au goût légèrement fromager, idéal rôti ou en gratin.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'choufleur_cheddar';

-- Créer des lots pour chaque produit
-- Fix all pending batches inserts
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-15',
       3.50,
       'kg',
       50,
       'PENDING',
       '2025-03-20'
FROM products p
    JOIN photos ph
ON p.photo_id = ph.id_photo
WHERE p.name = 'Tomates Bio';

INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-10',
       2.75,
       'kg',
       75,
       'PENDING',
       '2025-03-15'
FROM products p
    JOIN photos ph
ON p.photo_id = ph.id_photo
WHERE p.name = 'Pommes Royal Gala';

INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-03-30',
       4.20,
       'piece',
       30,
       'PENDING',
       '2025-03-25'
FROM products p
    JOIN photos ph
ON p.photo_id = ph.id_photo
WHERE p.name = 'Pain au levain';

INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-05',
       7.50,
       'piece',
       25,
       'PENDING',
       '2025-03-18'
FROM products p
    JOIN photos ph
ON p.photo_id = ph.id_photo
WHERE p.name = 'Fromage fermier';

INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-20',
       2.80,
       'kg',
       60,
       'PENDING',
       '2025-03-22'
FROM products p
    JOIN photos ph
ON p.photo_id = ph.id_photo
WHERE p.name = 'Carottes Bio';

INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-18',
       4.50,
       'bottle',
       45,
       'PENDING',
       '2025-03-21'
FROM products p
    JOIN photos ph
ON p.photo_id = ph.id_photo
WHERE p.name = 'Bière artisanale';

INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-12',
       12.90,
       'kg',
       20,
       'PENDING',
       '2025-03-19'
FROM products p
    JOIN photos ph
ON p.photo_id = ph.id_photo
WHERE p.name = 'Poulet fermier';

INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-08',
       3.25,
       'pot',
       40,
       'PENDING',
       '2025-03-16'
FROM products p
    JOIN photos ph
ON p.photo_id = ph.id_photo
WHERE p.name = 'Yaourt nature';

-- Fix all approved batches inserts
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-22',
       3.80,
       'kg',
       45,
       'APPROVED',
       '2025-03-10'
FROM products p
    JOIN photos ph
ON p.photo_id = ph.id_photo
WHERE p.name = 'Pomme Jonagold';

INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-25',
       4.90,
       'kg',
       35,
       'APPROVED',
       '2025-03-12'
FROM products p
    JOIN photos ph
ON p.photo_id = ph.id_photo
WHERE p.name = 'Chou-fleur cheddar';

INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-17',
       5.75,
       'piece',
       30,
       'APPROVED',
       '2025-03-18'
FROM products p
    JOIN photos ph
ON p.photo_id = ph.id_photo
WHERE p.name = 'Fromage fermier';

SELECT id_user, NULL
FROM users
WHERE email = 'admin@example.com';

-- Ajouter l'utilisateur Volunteer
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Volunteer', 'User', 'volunteer@example.com',
        '$2a$10$Gx8Kku6mS5PdMgiSne0neumKPPZWr28huUKo/joIs.79deMbi4M4i',
        '2001-01-01');

INSERT INTO manager (id_user, manager)
SELECT id_user, NULL
FROM users
WHERE email = 'volunteer@example.com';
