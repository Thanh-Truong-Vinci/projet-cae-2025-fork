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
VALUES ('Admin', 'Admin', 'admin@exemple.com',
        '$2a$12$dKvNdlr.afTwNjdFjGrxu.sJ9e/2j7x0Ay9f0RQc3hYI8D76NJnay',
        '2001-01-01');

-- Récupérer l'ID généré et insérer dans la table manager
INSERT INTO manager (id_user, manager)
SELECT id_user, NULL
FROM users
WHERE email = 'admin@exemple.com';

-- Créer un producteur de test
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Dupont', 'Jean', 'producteur@exemple.com',
        '$2a$12$nazHsdY5POBk0PbF/yiJJuwdRx9CN7Y3nk6mOV10OzESTbvZkW6iW',
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
WHERE email = 'producteur@exemple.com';

-- Créer l'entrée producteur avec sa compagnie
INSERT INTO producer (id_user, company)
SELECT id_user, 'Ferme Bio du Bon Vivant'
FROM users
WHERE email = 'producteur@exemple.com';

-- Créer un second producteur de test
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Martin', 'Sophie', 'sophie.martin@exemple.com',
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
WHERE email = 'sophie.martin@exemple.com';

-- Créer l'entrée producteur avec sa compagnie
INSERT INTO producer (id_user, company)
SELECT id_user, 'Vignoble Martin'
FROM users
WHERE email = 'sophie.martin@exemple.com';

-- Créer un second producteur de test
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Dubois', 'Marie', 'marie.dubois@exemple.com',
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
WHERE email = 'marie.dubois@exemple.com';

-- Créer l'entrée producteur avec sa compagnie
INSERT INTO producer (id_user, company)
SELECT id_user, 'Les Vergers de Marie'
FROM users
WHERE email = 'marie.dubois@exemple.com';

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
VALUES ('tomate bio',
        'https://projet-cae-2025-fork.onrender.com/api/photos/tomate.jpg'),
       ('pomme rouge',
        'https://projet-cae-2025-fork.onrender.com/api/photos/pomme_rouge.jpg'),
       ('pomme royal gala',
        'https://projet-cae-2025-fork.onrender.com/api/photos/pomme_royal_gala.jpg'),
       ('pain artisanal',
        'https://projet-cae-2025-fork.onrender.com/api/photos/pain-artisanal.jpg'),
       ('fromage',
        'https://projet-cae-2025-fork.onrender.com/api/photos/fromage.jpg'),
       ('biere',
        'https://projet-cae-2025-fork.onrender.com/api/photos/biere.jpg'),
       ('poulet',
        'https://projet-cae-2025-fork.onrender.com/api/photos/poulet.jpg'),
       ('yaourt',
        'https://projet-cae-2025-fork.onrender.com/api/photos/yaourt.jpg'),
       ('pomme jonagold',
        'https://projet-cae-2025-fork.onrender.com/api/photos/pomme_verte.jpg'),
       ('choufleur cheddar',
        'https://projet-cae-2025-fork.onrender.com/api/photos/choufleur.jpg'),
       ('pommes golden',
        'https://projet-cae-2025-fork.onrender.com/api/photos/pomme_golden.jpg'),
       ('tomate voyage',
        'https://projet-cae-2025-fork.onrender.com/api/photos/tomate_voyage.jpg');

-- Insérer des produits
INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'tomate bio',
       'Tomates cultivées sans pesticides, parfaites pour vos salades estivales.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'tomate bio';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'pomme royal gala',
       'Pommes sucrées et croquantes, idéales comme collation.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Fruits'
  AND p.product_name = 'pomme royal gala';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'pain au levain',
       'Pain artisanal à l''ancienne préparé avec du levain naturel.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Boulangerie'
  AND p.product_name = 'pain artisanal';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'fromage fermier',
       'Fromage à pâte dure affiné pendant 6 mois.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Produits laitiers'
  AND p.product_name = 'fromage';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'biere artisanale',
       'Bière blonde artisanale brassée localement avec des ingrédients de qualité.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Boissons'
  AND p.product_name = 'biere';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'poulet fermier',
       'Poulet élevé en plein air, nourri aux grains et sans antibiotiques.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Viande'
  AND p.product_name = 'poulet';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'yaourt nature',
       'Yaourt onctueux préparé avec du lait frais de vaches locales.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Produits laitiers'
  AND p.product_name = 'yaourt';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'pomme jonagold',
       'Pommes Jonagold juteuses et légèrement acidulées, parfaites pour la cuisine ou en collation.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Fruits'
  AND p.product_name = 'pomme jonagold';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'chou-fleur cheddar',
       'Variété de chou-fleur au goût légèrement fromager, idéal rôti ou en gratin.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'choufleur cheddar';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'pomme golden',
       'Pommes sucrées et juteuses à la peau jaune dorée, idéales pour les desserts et la cuisson.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Fruits'
  AND p.product_name = 'pommes golden';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'tomate voyage',
       'Tomate ancienne plissée rouge-orangé. Goût fruité équilibré entre sucré et acidulé. Parfaite en salade.',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'tomate voyage';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'laitue blonde de paris',
       'Excellente laitue de printemps, d''été et d''automne verte clair, pommée, ondulée et croquante',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'laitue blonde';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'carotte cosmic purple',
       'Carottes à la saveur sucrée, de couleur pourpre violet dont la chair est orangée',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'carottes cosmic';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'courgette blanche d''egypte',
       'Courgette ventrue à peau vert très pâle',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'courgette blanche';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'cerise napoleon',
       'Cerise de couleur jaune marbrée de rouge, ferme et croquante',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Fruits'
  AND p.product_name = 'cerise napoleon';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'miel de pissenlit bio',
       'Texture onctueuse cristallisée, arômes rappellant la richesse florale des prairies printanières',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Autres'
  AND p.product_name = 'miel pissenlit';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'haricot mistik',
       'Haricots extra-fins d''un beau pourpre foncé',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'haricots mistik';

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
WHERE p.name = 'tomate bio';

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
WHERE p.name = 'pomme royal gala';

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
       'pièce',
       30,
       'PENDING',
       '2025-03-25',
       '2025-03-24' -- 1 jour avant (pain frais)
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'pain au levain';

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
       'pièce',
       25,
       'PENDING',
       '2025-03-18',
       '2025-01-18' -- 2 mois avant (fromage affiné)
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'fromage fermier';

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
       'bouteille',
       45,
       'PENDING',
       '2025-03-21',
       '2025-02-21' -- 1 mois avant (temps de fermentation)
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'biere artisanale';

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
WHERE p.name = 'poulet fermier';

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
WHERE p.name = 'yaourt nature';

-- Créer un lot pour ce nouveau producteur
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user
        FROM producer
        WHERE id_user = (SELECT id_user FROM users WHERE email = 'sophie.martin@exemple.com')),
       p.id_product,
       ph.id_photo,
       '2025-05-20',
       5.95,
       'bouteille',
       30,
       'PENDING',
       '2025-03-25',
       '2025-02-15' -- Production antérieure (vin qui a besoin d'être vieilli)
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'biere artisanale';

-- Créer un lot pour ce nouveau producteur
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit,
                     available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user
        FROM producer
        WHERE id_user = (SELECT id_user FROM users WHERE email = 'marie.dubois@exemple.com')),
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
WHERE p.name = 'pomme royal gala';

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
WHERE p.name = 'pomme jonagold';

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
WHERE p.name = 'chou-fleur cheddar';

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
       'pièce',
       30,
       'APPROVED',
       '2025-03-18',
       '2025-01-18' -- 2 mois avant (fromage affiné)
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'fromage fermier';

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
WHERE p.name = 'tomate bio';

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
WHERE p.name = 'yaourt nature';

-- Lot 1: Pommes Golden épuisées en 2024 (Jean Dupont)
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit, available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM users WHERE email = 'producteur@exemple.com'),
       p.id_product,
       ph.id_photo,
       '2024-09-15',
       2.85,
       'kg',
       0, -- épuisé
       'RECEIVED',
       '2024-09-01',
       '2024-08-25'
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'pomme golden';

-- Lot 2: Pommes Golden épuisées en 2025 (Sophie Martin)
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit, available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM users WHERE email = 'sophie.martin@exemple.com'),
       p.id_product,
       ph.id_photo,
       '2025-04-01',
       3.15,
       'kg',
       0, -- épuisé
       'RECEIVED',
       '2025-03-20',
       '2025-03-15'
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'pomme golden';

-- Lot 3: Pommes Golden en attente (Marie Dubois)
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit, available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM users WHERE email = 'marie.dubois@exemple.com'),
       p.id_product,
       ph.id_photo,
       '2025-06-15',
       3.25,
       'kg',
       65,
       'PENDING',
       '2025-05-02',
       '2025-04-25'
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'pomme golden';

-- Lot 4: Pommes Golden disponibles actuellement (Jean Dupont)
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit, available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM manager LIMIT 1),
       (SELECT id_user FROM users WHERE email = 'producteur@exemple.com'),
       p.id_product,
       ph.id_photo,
       '2025-05-05',
       2.95,
       'kg',
       42,
       'RECEIVED',
       '2025-04-15',
       '2025-04-10'
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'pomme golden';

SELECT id_user, NULL
FROM users
WHERE email = 'admin@exemple.com';

-- Ajouter l'utilisateur benevole
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('benevole', 'User', 'benevole@exemple.com',
        '$2a$10$Gx8Kku6mS5PdMgiSne0neumKPPZWr28huUKo/joIs.79deMbi4M4i',
        '2001-01-01');

INSERT INTO manager (id_user, manager)
SELECT id_user, NULL
FROM users
WHERE email = 'benevole@exemple.com';

-- 1. Créer un utilisateur de base
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Dupont', 'Michel', 'client@exemple.com',
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
WHERE email = 'client@exemple.com';

-- 3. Créer l'entrée client 
INSERT INTO client (id_user)
SELECT id_user
FROM users
WHERE email = 'client@exemple.com';

INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Dupont', 'Michel', 'clientlibre@exemple.com',
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
WHERE email = 'clientlibre@exemple.com';

-- 3. Créer l'entrée client 
INSERT INTO client (id_user)
SELECT id_user
FROM users
WHERE email = 'clientlibre@exemple.com';

-- Creare un utente cliente di base
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Rossi', 'Mario', 'mario.rossi@exemple.com',
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
WHERE email = 'mario.rossi@exemple.com';

-- Creare l'entrata cliente
INSERT INTO client (id_user)
SELECT id_user
FROM users
WHERE email = 'mario.rossi@exemple.com';

-- DEMO

-- Créer le gestionnaire Dubois Manu
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Dubois', 'Manu', 'manu.dubois@exemple.com',
        '$2a$10$8Cv0QyLMQ.dDlswhLhd8peiW6.KWnQLl0VmL5lw41/trJgprkg2vm',
        '2025-02-01');

-- Ajouter l'entrée de gestionnaire pour Dubois Manu
INSERT INTO manager (id_user, manager)
SELECT id_user, NULL
FROM users
WHERE email = 'manu.dubois@exemple.com';

-- Créer les producteurs corrects: Roger Maerckx
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Maerckx', 'Roger', 'roger.maerckx@exemple.com',
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
WHERE email = 'roger.maerckx@exemple.com';

INSERT INTO producer (id_user, company)
SELECT id_user, 'Ferme Maerckx'
FROM users
WHERE email = 'roger.maerckx@exemple.com';

-- Créer la cliente Suzanne Droity
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Droity', 'Suzanne', 'suzanne.droity@exemple.com',
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
WHERE email = 'suzanne.droity@exemple.com';

INSERT INTO client (id_user, civility)
SELECT id_user, 'Mme'
FROM users
WHERE email = 'suzanne.droity@exemple.com';

-- Ajouter les nouvelles photos pour les produits supplémentaires
INSERT INTO photos (product_name, url)
VALUES ('miel pissenlit', 'https://projet-cae-2025-fork.onrender.com/api/photos/miel.png'),
       ('laitue blonde', 'https://projet-cae-2025-fork.onrender.com/api/photos/choufleur.jpg'),
       ('carottes cosmic', 'https://projet-cae-2025-fork.onrender.com/api/photos/carotte.jpg'),
       ('courgette blanche',
        'https://projet-cae-2025-fork.onrender.com/api/photos/courgette.jpg'),
       ('cerise napoleon', 'https://projet-cae-2025-fork.onrender.com/api/photos/cerise.jpg'),
       ('haricots mistik', 'https://projet-cae-2025-fork.onrender.com/api/photos/haricot.jpg');

-- Insérer les nouveaux produits avec leurs types et photos
INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'laitue blonde de paris',
       'Excellente laitue de printemps, d''été et d''automne verte clair, pommée, ondulée et croquante',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'laitue blonde';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'carotte cosmic purple',
       'Carottes à la saveur sucrée, de couleur pourpre violet dont la chair est orangée',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'carottes cosmic';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'courgette blanche d''egypte',
       'Courgette ventrue à peau vert très pâle',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'courgette blanche';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'cerise napoleon',
       'Cerise de couleur jaune marbrée de rouge, ferme et croquante',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Fruits'
  AND p.product_name = 'cerise napoleon';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'miel de pissenlit bio',
       'Texture onctueuse cristallisée, arômes rappellant la richesse florale des prairies printanières',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Autres'
  AND p.product_name = 'miel pissenlit';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type,
       'haricot mistik',
       'Haricots extra-fins d''un beau pourpre foncé',
       p.id_photo
FROM product_types pt,
     photos p
WHERE pt.title = 'Légumes'
  AND p.product_name = 'haricots mistik';

-- Créer des lots pour les produits de Roger Maerckx
-- Laitue Blonde de Paris - En vente
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit, available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM users WHERE email = 'manu.dubois@exemple.com'),
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com'),
       p.id_product,
       ph.id_photo,
       '2025-05-01',
       0.78,
       'pièce',
       67,
       'RECEIVED',
       '2025-04-15',
       '2025-04-10'
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'laitue blonde de paris';

-- Courgette Blanche d'Egypte - En vente
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit, available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM users WHERE email = 'manu.dubois@exemple.com'),
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com'),
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
WHERE p.name = 'courgette blanche d''egypte';

-- Haricots Mistik - Vente terminée
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit, available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM users WHERE email = 'manu.dubois@exemple.com'),
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com'),
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
WHERE p.name = 'haricot mistik';

-- Carottes Cosmic Purple - Vente terminée
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit, available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM users WHERE email = 'manu.dubois@exemple.com'),
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com'),
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
WHERE p.name = 'carotte cosmic purple';

-- Miel de Pissenlit Bio 250gr - En vente
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit, available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM users WHERE email = 'manu.dubois@exemple.com'),
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com'),
       p.id_product,
       ph.id_photo,
       '2025-05-10',
       11.9,
       'pièce',
       8,
       'RECEIVED',
       '2025-04-25',
       '2025-04-15'
FROM products p
         JOIN photos ph
              ON p.photo_id = ph.id_photo
WHERE p.name = 'miel de pissenlit bio';

-- Cerise Napoléon - Refusé
INSERT INTO batches (manager_id, producer_id, product_id, photo_id, availability_date, unit_price,
                     sale_unit, available_quantity, status, deposit_date, production_date)
SELECT (SELECT id_user FROM users WHERE email = 'manu.dubois@exemple.com'),
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com'),
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
WHERE p.name = 'cerise napoleon';

-- Supprimer d'abord les réservations PENDING existantes et leurs lignes
DELETE
FROM reservation_lines
WHERE reservation_id IN (SELECT id_reservation
                         FROM reservation
                         WHERE client = (SELECT id_user FROM users WHERE email = 'suzanne.droity@exemple.com')
                           AND status = 'PENDING');

DELETE
FROM reservation
WHERE client = (SELECT id_user FROM users WHERE email = 'suzanne.droity@exemple.com')
  AND status = 'PENDING';

-- Réinitialiser les quantités des lots
UPDATE batches
SET available_quantity = available_quantity + 3
WHERE id = (SELECT id
            FROM batches
            WHERE product_id = (SELECT id_product FROM products WHERE name = 'laitue blonde de paris')
              AND status = 'RECEIVED'
            LIMIT 1);

UPDATE batches
SET available_quantity = available_quantity + 2
WHERE id = (SELECT id
            FROM batches
            WHERE product_id = (SELECT id_product FROM products WHERE name = 'miel de pissenlit bio')
              AND status = 'RECEIVED'
            LIMIT 1);

UPDATE batches
SET available_quantity = available_quantity + 4
WHERE id = (SELECT id
            FROM batches
            WHERE product_id = (SELECT id_product FROM products WHERE name = 'courgette blanche d''egypte')
              AND status = 'RECEIVED'
            LIMIT 1);

-- Créer la première réservation avec laitues et miel
INSERT INTO reservation (client, status, reservation_date, sale_date, price)
SELECT (SELECT id_user FROM users WHERE email = 'suzanne.droity@exemple.com'),
       'PENDING',
       '2025-05-13',
       NULL,
       (3 * 0.78) + (2 * 11.9);

-- Ajouter les lignes de réservation pour les laitues
INSERT INTO reservation_lines (reservation_id, batch_id, quantity)
SELECT (SELECT id_reservation
        FROM reservation
        WHERE client = (SELECT id_user FROM users WHERE email = 'suzanne.droity@exemple.com')
          AND status = 'PENDING'
        ORDER BY id_reservation DESC
        LIMIT 1),
       (SELECT id
        FROM batches
        WHERE product_id = (SELECT id_product FROM products WHERE name = 'laitue blonde de paris')
          AND status = 'RECEIVED'
        LIMIT 1),
       3;

-- Ajouter les lignes de réservation pour le miel dans la même réservation
INSERT INTO reservation_lines (reservation_id, batch_id, quantity)
SELECT (SELECT id_reservation
        FROM reservation
        WHERE client = (SELECT id_user FROM users WHERE email = 'suzanne.droity@exemple.com')
          AND status = 'PENDING'
        ORDER BY id_reservation DESC
        LIMIT 1),
       (SELECT id
        FROM batches
        WHERE product_id = (SELECT id_product FROM products WHERE name = 'miel de pissenlit bio')
          AND status = 'RECEIVED'
        LIMIT 1),
       2;

-- Créer la deuxième réservation avec les courgettes
INSERT INTO reservation (client, status, reservation_date, sale_date, price)
SELECT (SELECT id_user FROM users WHERE email = 'suzanne.droity@exemple.com'),
       'PENDING',
       '2025-05-13',
       NULL,
       4 * 3.75;

-- Ajouter les lignes de réservation pour les courgettes
INSERT INTO reservation_lines (reservation_id, batch_id, quantity)
SELECT (SELECT id_reservation
        FROM reservation
        WHERE client = (SELECT id_user FROM users WHERE email = 'suzanne.droity@exemple.com')
          AND status = 'PENDING'
        ORDER BY id_reservation DESC
        LIMIT 1),
       (SELECT id
        FROM batches
        WHERE product_id = (SELECT id_product FROM products WHERE name = 'courgette blanche d''egypte')
          AND status = 'RECEIVED'
        LIMIT 1),
       4;

-- Mettre à jour les quantités disponibles des lots
UPDATE batches
SET available_quantity = available_quantity - 3
WHERE id = (SELECT id
            FROM batches
            WHERE product_id = (SELECT id_product FROM products WHERE name = 'laitue blonde de paris')
              AND status = 'RECEIVED'
            LIMIT 1);

UPDATE batches
SET available_quantity = available_quantity - 2
WHERE id = (SELECT id
            FROM batches
            WHERE product_id = (SELECT id_product FROM products WHERE name = 'miel de pissenlit bio')
              AND status = 'RECEIVED'
            LIMIT 1);

UPDATE batches
SET available_quantity = available_quantity - 4
WHERE id = (SELECT id
            FROM batches
            WHERE product_id = (SELECT id_product FROM products WHERE name = 'courgette blanche d''egypte')
              AND status = 'RECEIVED'
            LIMIT 1);

-- Création des notifications pour les lots de Roger Maerckx
-- Notification pour Laitue Blonde de Paris
INSERT INTO notifications (message, read, date, producer_id, batch_id)
SELECT '',
       true,
       '2025-04-15',
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com'),
       b.id
FROM batches b
         JOIN products p ON b.product_id = p.id_product
WHERE p.name = 'laitue blonde de paris'
  AND b.producer_id = (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com')
LIMIT 1;

-- Notification pour Courgette Blanche d'Egypte
INSERT INTO notifications (message, read, date, producer_id, batch_id)
SELECT '',
       true,
       '2025-04-20',
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com'),
       b.id
FROM batches b
         JOIN products p ON b.product_id = p.id_product
WHERE p.name = 'courgette blanche d''egypte'
  AND b.producer_id = (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com')
LIMIT 1;

-- Notification pour Haricot Mistik
INSERT INTO notifications (message, read, date, producer_id, batch_id)
SELECT '',
       true,
       '2025-04-10',
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com'),
       b.id
FROM batches b
         JOIN products p ON b.product_id = p.id_product
WHERE p.name = 'haricot mistik'
  AND b.producer_id = (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com')
LIMIT 1;

-- Notification pour Carotte Cosmic Purple
INSERT INTO notifications (message, read, date, producer_id, batch_id)
SELECT '',
       true,
       '2025-04-12',
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com'),
       b.id
FROM batches b
         JOIN products p ON b.product_id = p.id_product
WHERE p.name = 'carotte cosmic purple'
  AND b.producer_id = (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com')
LIMIT 1;

-- Notification pour Miel de Pissenlit Bio
INSERT INTO notifications (message, read, date, producer_id, batch_id)
SELECT '',
       true,
       '2025-04-25',
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com'),
       b.id
FROM batches b
         JOIN products p ON b.product_id = p.id_product
WHERE p.name = 'miel de pissenlit bio'
  AND b.producer_id = (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com')
LIMIT 1;

-- Notification pour Cerise Napoleon
INSERT INTO notifications (message, read, date, reason_of_reject, producer_id, batch_id)
SELECT 'Non conformité de votre lot concernant la politique d exportaion de  Terroir&Cie.',
       true,
       '2025-04-28',
       'La qualité des cerises ne correspond pas à nos standards. Prix trop élevé par rapport au marché.',
       (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com'),
       b.id
FROM batches b
         JOIN products p ON b.product_id = p.id_product
WHERE p.name = 'cerise napoleon'
  AND b.producer_id = (SELECT id_user FROM users WHERE email = 'roger.maerckx@exemple.com')
LIMIT 1;