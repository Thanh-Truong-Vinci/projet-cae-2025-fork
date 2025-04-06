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
VALUES ('Admin', 'Admin', 'admin@example.com', '$2a$10$Gx8Kku6mS5PdMgiSne0neumKPPZWr28huUKo/joIs.79deMbi4M4i',
        '2001-01-01');

-- Récupérer l'ID généré et insérer dans la table manager
INSERT INTO manager (id_user, manager)
SELECT id_user, NULL
FROM users
WHERE email = 'admin@example.com';

-- Créer un producteur de test
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Dupont', 'Jean', 'producteur@example.com', '$2a$10$8Cv0QyLMQ.dDlswhLhd8peiW6.KWnQLl0VmL5lw41/trJgprkg2vm',
        '2024-01-15');

-- Récupérer l'ID et créer l'adresse du producteur
INSERT INTO user_with_address (id_user, street, number, box, postal_code, city, country, phone_number)
SELECT id_user,
       'Rue des Agriculteurs',
       '42',
       '',
       '1000',
       'Bruxelles',
       'Belgique',
       '+32456789012'
FROM users
WHERE email = 'producteur@example.com';

-- Créer l'entrée producteur avec sa compagnie
INSERT INTO producer (id_user, company)
SELECT id_user, 'Ferme Bio du Bon Vivant'
FROM users
WHERE email = 'producteur@example.com';

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
VALUES ('tomate_bio', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469'),
       ('pomme_rouge', 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a'),
       ('pain_artisanal', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73'),
       ('fromage', 'https://images.unsplash.com/photo-1452195100486-9cc805987862'),
       ('carottes', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37'),
       ('biere', 'https://images.unsplash.com/photo-1608270586620-248524c67de9'),
       ('poulet', 'https://images.unsplash.com/photo-1587593810167-a84920ea0781'),
       ('yaourt', 'https://images.unsplash.com/photo-1563636619-e9143da7973b'),
       ('pomme_jonagold', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb'),
       ('choufleur_cheddar', 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3');

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
SELECT pt.id_product_type, 'Pommes Royal Gala', 'Pommes sucrées et croquantes, idéales comme collation.', p.id_photo
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
SELECT pt.id_product_type, 'Fromage fermier', 'Fromage à pâte dure affiné pendant 6 mois.', p.id_photo
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
INSERT INTO batches (manager_id, producer_id, product_id, photo_url, availability_date, unit_price, sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.url,
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

INSERT INTO batches (manager_id, producer_id, product_id, photo_url, availability_date, unit_price, sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.url,
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

INSERT INTO batches (manager_id, producer_id, product_id, photo_url, availability_date, unit_price, sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.url,
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

INSERT INTO batches (manager_id, producer_id, product_id, photo_url, availability_date, unit_price, sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.url,
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

INSERT INTO batches (manager_id, producer_id, product_id, photo_url, availability_date, unit_price, sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.url,
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

INSERT INTO batches (manager_id, producer_id, product_id, photo_url, availability_date, unit_price, sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.url,
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

INSERT INTO batches (manager_id, producer_id, product_id, photo_url, availability_date, unit_price, sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.url,
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

INSERT INTO batches (manager_id, producer_id, product_id, photo_url, availability_date, unit_price, sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.url,
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

-- Add approved batches
INSERT INTO batches (manager_id, producer_id, product_id, photo_url, availability_date, unit_price, sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.url,
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

INSERT INTO batches (manager_id, producer_id, product_id, photo_url, availability_date, unit_price, sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.url,
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

INSERT INTO batches (manager_id, producer_id, product_id, photo_url, availability_date, unit_price, sale_unit,
                     available_quantity, status, deposit_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.url,
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
VALUES ('Volunteer', 'User', 'volunteer@example.com', '$2a$10$Gx8Kku6mS5PdMgiSne0neumKPPZWr28huUKo/joIs.79deMbi4M4i',
        '2001-01-01');

INSERT INTO manager (id_user, manager)
SELECT id_user, NULL
FROM users
WHERE email = 'volunteer@example.com';
