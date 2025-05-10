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

-- Ajouter la colonne production_date à la table batches
ALTER TABLE batches
    ADD COLUMN IF NOT EXISTS production_date DATE;

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

-- Créer un second producteur de test
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Martin', 'Sophie', 'sophie.martin@example.com',
        '$2a$10$8Cv0QyLMQ.dDlswhLhd8peiW6.KWnQLl0VmL5lw41/trJgprkg2vm',
        '2024-02-10');

-- Récupérer l'ID et créer l'adresse du second producteur
INSERT INTO user_with_address (id_user, street, number, box, postal_code, city, country,
                               phone_number)
SELECT id_user,
       'Chemin des Vignes',
       '15',
       '',
       '5000',
       'Namur',
       'Belgique',
       '+32478901234'
FROM users
WHERE email = 'sophie.martin@example.com';

-- Créer l'entrée producteur avec sa compagnie
INSERT INTO producer (id_user, company)
SELECT id_user, 'Vignoble Martin'
FROM users
WHERE email = 'sophie.martin@example.com';

-- Créer un second producteur de test
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Dubois', 'Marie', 'marie.dubois@example.com',
        '$2a$10$8Cv0QyLMQ.dDlswhLhd8peiW6.KWnQLl0VmL5lw41/trJgprkg2vm',
        '2024-02-20');

-- Récupérer l'ID et créer l'adresse du second producteur
INSERT INTO user_with_address (id_user, street, number, box, postal_code, city, country,
                               phone_number)
SELECT id_user,
       'Route du Verger',
       '23',
       '',
       '4000',
       'Liège',
       'Belgique',
       '+32489123456'
FROM users
WHERE email = 'marie.dubois@example.com';

-- Créer l'entrée producteur avec sa compagnie
INSERT INTO producer (id_user, company)
SELECT id_user, 'Les Vergers de Marie'
FROM users
WHERE email = 'marie.dubois@example.com';

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
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-15',
       3.50,
       'kg',
       50,
       'PENDING',
       '2025-03-20',
       '2025-03-10' -- Date de production (antérieure à la date de dépôt)
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Tomates Bio';

-- Pour le lot des Pommes Royal Gala
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-10',
       2.75,
       'kg',
       75,
       'PENDING',
       '2025-03-15',
       '2025-03-05' -- 10 jours avant le dépôt
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Pommes Royal Gala';

-- Pour le lot de Pain au levain
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-03-30',
       4.20,
       'piece',
       30,
       'PENDING',
       '2025-03-25',
       '2025-03-24' -- 1 jour avant (pain frais)
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Pain au levain';

-- Pour le lot de Fromage fermier
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-05',
       7.50,
       'piece',
       25,
       'PENDING',
       '2025-03-18',
       '2025-01-18' -- 2 mois avant (fromage affiné)
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Fromage fermier';

-- Pour le lot de Carottes Bio
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-20',
       2.80,
       'kg',
       60,
       'PENDING',
       '2025-03-22',
       '2025-03-15' -- 7 jours avant la récolte
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Carottes Bio';

-- Pour le lot de Bière artisanale
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-18',
       4.50,
       'bottle',
       45,
       'PENDING',
       '2025-03-21',
       '2025-02-21' -- 1 mois avant (temps de fermentation)
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Bière artisanale';

-- Pour le lot de Poulet fermier
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-12',
       12.90,
       'kg',
       20,
       'PENDING',
       '2025-03-19',
       '2025-03-18' -- 1 jour avant (fraîcheur)
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Poulet fermier';

-- Pour le lot de Yaourt nature
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-08',
       3.25,
       'pot',
       40,
       'PENDING',
       '2025-03-16',
       '2025-03-14' -- 2 jours avant
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Yaourt nature';

-- Créer un lot pour ce nouveau producteur
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user
        FROM producer
        WHERE id_user = (SELECT id_user FROM users WHERE email = 'sophie.martin@example.com')),
       p.id_product,
       ph.id_photo,
       '2025-05-20',
       5.95,
       'bottle',
       30,
       'PENDING',
       '2025-03-25',
       '2025-02-15' -- Production antérieure (vin qui a besoin d'être vieilli)
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Bière artisanale';

-- Créer un lot pour ce nouveau producteur
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user
        FROM producer
        WHERE id_user = (SELECT id_user FROM users WHERE email = 'marie.dubois@example.com')),
       p.id_product,
       ph.id_photo,
       '2025-05-10',
       3.95,
       'kg',
       40,
       'PENDING',
       '2025-03-28',
       '2025-03-20' -- Production récente pour fruits frais
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Pommes Royal Gala';

-- Fix all approved batches inserts
-- Pour le lot de Pomme Jonagold (APPROVED)
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-22',
       3.80,
       'kg',
       45,
       'APPROVED',
       '2025-03-10',
       '2025-03-01' -- 9 jours avant
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Pomme Jonagold';

-- Pour le lot de Chou-fleur cheddar (APPROVED)
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-25',
       4.90,
       'kg',
       35,
       'APPROVED',
       '2025-03-12',
       '2025-03-05' -- 7 jours avant
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Chou-fleur cheddar';

-- Pour le lot de Fromage fermier (APPROVED)
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-17',
       5.75,
       'piece',
       30,
       'APPROVED',
       '2025-03-18',
       '2025-01-18' -- 2 mois avant (fromage affiné)
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Fromage fermier';

-- Création de lots à l'état RECEIVED
-- Pour le lot de Tomates Bio (RECEIVED)
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-05',
       3.25,
       'kg',
       40,
       'RECEIVED',
       '2025-03-10',
       '2025-03-05' -- 5 jours avant le dépôt
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Tomates Bio';

-- Pour le lot de Carottes Bio (RECEIVED)
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-10',
       2.50,
       'kg',
       35,
       'RECEIVED',
       '2025-03-15',
       '2025-03-08' -- 7 jours avant le dépôt
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Carottes Bio';

-- Pour un deuxième lot de Carottes Bio (RECEIVED) - fusionnable avec le lot existant
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-20', -- Date différente, mais même produit/prix/unité/photo
       2.50,         -- MÊME unitPrice que le lot existant (2.50)
       'kg',         -- MÊME saleUnit que le lot existant ('kg')
       25,           -- Quantité différente qui s'additionnera (35 + 25 = 60 total)
       'RECEIVED',   -- MÊME statut que le lot existant (RECEIVED)
       '2025-03-25', -- Date de dépôt différente, pas importante pour la fusion
       '2025-03-20'  -- Date de production différente
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Carottes Bio';

-- Pour un lot de Carottes Bio (RECEIVED) - presque fusionnable mais avec prix différent
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-25', -- Date différente (pas importante pour la fusion)
       2.49,         -- Prix LÉGÈREMENT DIFFÉRENT (2.49 vs 2.50) - empêche la fusion
       'kg',         -- MÊME unité de vente que les autres lots
       20,           -- Quantité disponible
       'RECEIVED',   -- MÊME statut (nécessaire pour apparaître dans la vue)
       '2025-03-28', -- Date de dépôt
       '2025-03-22'  -- Date de production
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Carottes Bio';

-- Pour le lot de Yaourt nature (RECEIVED)
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-03',
       3.00,
       'pot',
       50,
       'RECEIVED',
       '2025-03-20',
       '2025-03-18' -- 2 jours avant le dépôt
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Yaourt nature';

-- 1. Lot avec une unité de vente différente (tout le reste identique)
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       ph.id_photo,
       '2025-04-30',
       2.50,    -- MÊME prix que les lots de carottes existants
       'piece', -- UNITÉ DIFFÉRENTE (piece vs kg) - empêche la fusion
       15,
       'RECEIVED',
       '2025-04-01',
       '2025-03-25'
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Carottes Bio';

-- 2. Lot avec une photo différente (tout le reste identique)
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer LIMIT 1),
       p.id_product,
       (SELECT id_photo FROM photos WHERE product_name = 'tomate_bio'), -- PHOTO DIFFÉRENTE - empêche la fusion
       '2025-05-01',
       2.50,                                                            -- MÊME prix
       'kg',                                                            -- MÊME unité
       18,
       'RECEIVED',
       '2025-04-02',
       '2025-03-28'
FROM products p
WHERE p.name = 'Carottes Bio';

-- 3. Lot avec un producteur différent (paramètre hors clé de fusion - sera fusionné quand même)
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM producer WHERE company = 'Les Vergers de Marie'), -- PRODUCTEUR DIFFÉRENT - SERA FUSIONNÉ quand même
       p.id_product,
       ph.id_photo,
       '2025-05-05',
       2.50,                                                                  -- MÊME prix
       'kg',                                                                  -- MÊME unité
       22,
       'RECEIVED',
       '2025-04-03',
       '2025-03-30'
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Carottes Bio';

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

-- 1. Créer un utilisateur de base
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Dupont', 'Michel', 'client@example.com',
        '$2a$10$8Cv0QyLMQ.dDlswhLhd8peiW6.KWnQLl0VmL5lw41/trJgprkg2vm',
        CURRENT_DATE);

-- 2. Ajouter l'adresse (obligatoire pour un UserWithAddress)
INSERT INTO user_with_address (id_user, street, number, box, postal_code, city, country,
                               phone_number)
SELECT id_user,
       'Avenue des Clients',
       '25',
       'A',
       '1050',
       'Bruxelles',
       'Belgique',
       '+32412345678'
FROM users
WHERE email = 'client@example.com';

-- 3. Créer l'entrée client 
INSERT INTO client (id_user)
SELECT id_user
FROM users
WHERE email = 'client@example.com';

-- Creare un utente cliente di base
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Rossi', 'Mario', 'mario.rossi@example.com',
        '$2a$10$8Cv0QyLMQ.dDlswhLhd8peiW6.KWnQLl0VmL5lw41/trJgprkg2vm',
        CURRENT_DATE);

-- Aggiungere l'indirizzo per l'utente
INSERT INTO user_with_address (id_user, street, number, box, postal_code, city, country,
                               phone_number)
SELECT id_user,
       'Via Roma',
       '10',
       '',
       '00100',
       'Roma',
       'Italia',
       '+390612345678'
FROM users
WHERE email = 'mario.rossi@example.com';

-- Creare l'entrata cliente
INSERT INTO client (id_user)
SELECT id_user
FROM users
WHERE email = 'mario.rossi@example.com';

-- DEMO

-- Créer le gestionnaire Dubois Manu
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Dubois', 'Manu', 'manu.dubois@example.com',
        '$2a$10$8Cv0QyLMQ.dDlswhLhd8peiW6.KWnQLl0VmL5lw41/trJgprkg2vm',
        '2025-02-01');

-- Ajouter l'entrée de gestionnaire pour Dubois Manu
INSERT INTO manager (id_user, manager)
SELECT id_user, NULL
FROM users
WHERE email = 'manu.dubois@example.com';

-- Créer les producteurs corrects: Roger Maerckx
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Maerckx', 'Roger', 'roger.maerckx@example.com',
        '$2a$10$8Cv0QyLMQ.dDlswhLhd8peiW6.KWnQLl0VmL5lw41/trJgprkg2vm',
        '2025-02-15');

INSERT INTO user_with_address (id_user, street, number, box, postal_code, city, country, phone_number)
SELECT id_user,
       'Rue des Producteurs',
       '10',
       '',
       '5000',
       'Namur',
       'Belgique',
       '+32478456123'
FROM users
WHERE email = 'roger.maerckx@example.com';

INSERT INTO producer (id_user, company)
SELECT id_user, 'Ferme Maerckx'
FROM users
WHERE email = 'roger.maerckx@example.com';

-- Créer les producteurs corrects: Amandine Tasset
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Tasset', 'Amandine', 'amandine.tasset@example.com',
        '$2a$10$8Cv0QyLMQ.dDlswhLhd8peiW6.KWnQLl0VmL5lw41/trJgprkg2vm',
        '2025-02-20');

INSERT INTO user_with_address (id_user, street, number, box, postal_code, city, country, phone_number)
SELECT id_user,
       'Chemin des Cultures',
       '25',
       '',
       '4000',
       'Liège',
       'Belgique',
       '+32496789012'
FROM users
WHERE email = 'amandine.tasset@example.com';

INSERT INTO producer (id_user, company)
SELECT id_user, 'Productions Tasset'
FROM users
WHERE email = 'amandine.tasset@example.com';

-- Créer la cliente Suzanne Droity
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Droity', 'Suzanne', 'suzanne.droity@example.com',
        '$2a$10$8Cv0QyLMQ.dDlswhLhd8peiW6.KWnQLl0VmL5lw41/trJgprkg2vm',
        '2025-03-01');

INSERT INTO user_with_address (id_user, street, number, box, postal_code, city, country, phone_number)
SELECT id_user,
       'Avenue des Clients',
       '42',
       'B',
       '1050',
       'Bruxelles',
       'Belgique',
       '+32498765432'
FROM users
WHERE email = 'suzanne.droity@example.com';

INSERT INTO client (id_user, civility)
SELECT id_user, 'Mme'
FROM users
WHERE email = 'suzanne.droity@example.com';

-- Ajouter les nouvelles photos pour les produits supplémentaires
INSERT INTO photos (product_name, url)
VALUES 
('miel_pissenlit', 'https://imagestoragecae09.blob.core.windows.net/dev/d5fcf24a-7744-4f45-9e0d-0a9d964e4041'),
('laitue_blonde', 'https://imagestoragecae09.blob.core.windows.net/dev/bad5f397-2f27-4c58-8b90-28de7be2ca5e'),
('carottes_cosmic', 'https://imagestoragecae09.blob.core.windows.net/dev/f962063f-acf3-4e86-a38d-a728f983f02f'),
('courgette_blanche', 'https://imagestoragecae09.blob.core.windows.net/dev/d24d89a5-a77f-485f-9e4c-949115d63399'),
('cerise_napoleon', 'https://imagestoragecae09.blob.core.windows.net/dev/2468799f-ba1b-4ae9-aad6-5e35d7dac415'),
('haricots_mistik', 'https://imagestoragecae09.blob.core.windows.net/dev/abe1c8dd-1a7e-4d70-9522-3c750c398b20');

-- Insérer les nouveaux produits avec leurs types et photos
INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'Laitue Blonde de Paris',
       'Excellente laitue de printemps, d''été et d''automne verte clair, pommée, ondulée et croquante',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'laitue_blonde';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'Carottes Cosmic Purple',
       'Carottes à la saveur sucrée, de couleur pourpre violet dont la chair est orangée',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'carottes_cosmic';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'Courgette Blanche d''Egypte',
       'Courgette ventrue à peau vert très pâle',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'courgette_blanche';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'Cerise Napoléon',
       'Cerise de couleur jaune marbrée de rouge, ferme et croquante',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Fruits'
  AND p.product_name = 'cerise_napoleon';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'Miel de Pissenlit Bio 250gr',
       'Texture onctueuse cristallisée, arômes rappellant la richesse florale des prairies printanières',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Autres'
  AND p.product_name = 'miel_pissenlit';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'Haricots Mistik',
       'Haricots extra-fins d''un beau pourpre foncé',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'haricots_mistik';

-- Créer des lots pour les produits de Roger Maerckx
-- Laitue Blonde de Paris - En vente
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit, available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM users WHERE email = 'manu.dubois@example.com'),
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@example.com'),
       p.id_product,
       ph.id_photo,
       '2025-05-01',
       0.78,
       'piece',
       67,
       'RECEIVED',
       '2025-04-15',
       '2025-04-10'
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Laitue Blonde de Paris';

-- Courgette Blanche d'Egypte - En vente
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit, available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM users WHERE email = 'manu.dubois@example.com'),
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@example.com'),
       p.id_product,
       ph.id_photo,
       '2025-05-05',
       3.75,
       'kg',
       300,
       'RECEIVED',
       '2025-04-20',
       '2025-04-15'
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Courgette Blanche d''Egypte';

-- Haricots Mistik - Vente terminée
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit, available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM users WHERE email = 'manu.dubois@example.com'),
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@example.com'),
       p.id_product,
       ph.id_photo,
       '2025-04-15',
       2.99,
       'kg',
       220,
       'RECEIVED',
       '2025-04-10',
       '2025-04-05'
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Haricots Mistik';

-- Carottes Cosmic Purple - Vente terminée
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit, available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM users WHERE email = 'manu.dubois@example.com'),
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@example.com'),
       p.id_product,
       ph.id_photo,
       '2025-04-20',
       3.22,
       'kg',
       185,
       'RECEIVED',
       '2025-04-12',
       '2025-04-08'
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Carottes Cosmic Purple';

-- Miel de Pissenlit Bio 250gr - En vente
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit, available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM users WHERE email = 'manu.dubois@example.com'),
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@example.com'),
       p.id_product,
       ph.id_photo,
       '2025-05-10',
       11.9,
       'piece',
       8,
       'RECEIVED',
       '2025-04-25',
       '2025-04-15'
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Miel de Pissenlit Bio 250gr';

-- Cerise Napoléon - Refusé
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit, available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM users WHERE email = 'manu.dubois@example.com'),
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@example.com'),
       p.id_product,
       ph.id_photo,
       '2025-06-01',
       32,
       'kg',
       105,
       'REJECTED',
       '2025-04-28',
       '2025-04-25'
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'Cerise Napoléon';

-- Réservation 1 - À récupérer (jour de la démo)
INSERT INTO reservation (client, status, reservation_date, sale_date, price)
SELECT (SELECT id_user FROM users WHERE email = 'suzanne.droity@example.com'),
       'PENDING',
       CURRENT_DATE,
       NULL,
       3 * 0.78;

-- Réservation 2 - À récupérer (jour de la démo)
INSERT INTO reservation (client, status, reservation_date, sale_date, price)
SELECT (SELECT id_user FROM users WHERE email = 'suzanne.droity@example.com'),
       'PENDING',
       CURRENT_DATE,
       NULL,
       2 * 11.9;

-- Réservation 3 - À récupérer (jour de la démo)
INSERT INTO reservation (client, status, reservation_date, sale_date, price)
SELECT (SELECT id_user FROM users WHERE email = 'suzanne.droity@example.com'),
       'PENDING',
       CURRENT_DATE,
       NULL,
       4 * 3.75;

-- Réservation 4 - Récupérée (06-05-25)
INSERT INTO reservation (client, status, reservation_date, sale_date, price)
SELECT (SELECT id_user FROM users WHERE email = 'suzanne.droity@example.com'),
       'CONFIRMED',
       '2025-05-05',
       '2025-05-06',
       15.50;

-- Réservation 5 - Abandonnée (29-04-25)
INSERT INTO reservation (client, status, reservation_date, sale_date, price)
SELECT (SELECT id_user FROM users WHERE email = 'suzanne.droity@example.com'),
       'CANCELLED',
       '2025-04-25',
       '2025-04-29',
       8.25;

-- Réservation 6 - Annulée (28-04-25)
INSERT INTO reservation (client, status, reservation_date, sale_date, price)
SELECT (SELECT id_user FROM users WHERE email = 'suzanne.droity@example.com'),
       'CANCELLED',
       '2025-04-25',
       '2025-04-28',
       12.75;

-- Ajout des lignes de réservation pour la réservation 1 (laitue)
INSERT INTO reservation_lines (reservation_id, batch_id, quantity)
SELECT 
  (SELECT id_reservation FROM reservation WHERE client = (SELECT id_user FROM users WHERE email = 'suzanne.droity@example.com') AND status = 'PENDING' ORDER BY id_reservation LIMIT 1),
  (SELECT id FROM batches WHERE product_id = (SELECT id_product FROM products WHERE name = 'Laitue Blonde de Paris') AND status = 'RECEIVED' LIMIT 1),
  3;

-- Mettre à jour la quantité du lot de laitue
UPDATE batches 
SET available_quantity = available_quantity - 3 
WHERE id = (SELECT id FROM batches WHERE product_id = (SELECT id_product FROM products WHERE name = 'Laitue Blonde de Paris') AND status = 'RECEIVED' LIMIT 1);

-- Ajout des lignes de réservation pour la réservation 2 (miel)
INSERT INTO reservation_lines (reservation_id, batch_id, quantity)
SELECT 
  (SELECT id_reservation FROM reservation WHERE client = (SELECT id_user FROM users WHERE email = 'suzanne.droity@example.com') AND status = 'PENDING' ORDER BY id_reservation OFFSET 1 LIMIT 1),
  (SELECT id FROM batches WHERE product_id = (SELECT id_product FROM products WHERE name = 'Miel de Pissenlit Bio 250gr') AND status = 'RECEIVED' LIMIT 1),
  2;

-- Mettre à jour la quantité du lot de miel
UPDATE batches 
SET available_quantity = available_quantity - 2 
WHERE id = (SELECT id FROM batches WHERE product_id = (SELECT id_product FROM products WHERE name = 'Miel de Pissenlit Bio 250gr') AND status = 'RECEIVED' LIMIT 1);

-- Ajout des lignes de réservation pour la réservation 3 (courgette)
INSERT INTO reservation_lines (reservation_id, batch_id, quantity)
SELECT 
  (SELECT id_reservation FROM reservation WHERE client = (SELECT id_user FROM users WHERE email = 'suzanne.droity@example.com') AND status = 'PENDING' ORDER BY id_reservation OFFSET 2 LIMIT 1),
  (SELECT id FROM batches WHERE product_id = (SELECT id_product FROM products WHERE name = 'Courgette Blanche d''Egypte') AND status = 'RECEIVED' LIMIT 1),
  4;

-- Mettre à jour la quantité du lot de courgettes
UPDATE batches 
SET available_quantity = available_quantity - 4 
WHERE id = (SELECT id FROM batches WHERE product_id = (SELECT id_product FROM products WHERE name = 'Courgette Blanche d''Egypte') AND status = 'RECEIVED' LIMIT 1);