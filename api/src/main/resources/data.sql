-- Nettoyer les tables
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE photos CASCADE;
TRUNCATE TABLE product_types CASCADE;
TRUNCATE TABLE products CASCADE;

-- Insérer un administrateur
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Admin', 'Admin', 'admin@example.com', 'adminpw', '2001-01-01');

-- Récupérer l'ID généré et insérer dans la table manager
INSERT INTO manager (id_user, manager)
SELECT id_user, NULL FROM users WHERE email = 'admin@example.com';

-- Créer un producteur de test
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Dupont', 'Jean', 'producteur@example.com', 'password123', '2024-01-15');

-- Récupérer l'ID et créer l'adresse du producteur
INSERT INTO user_with_address (id_user, street, number, box, postal_code, city, country, phone_number)
SELECT id_user, 'Rue des Agriculteurs', '42', '', '1000', 'Bruxelles', 'Belgique', '+32456789012'
FROM users WHERE email = 'producteur@example.com';

-- Créer l'entrée producteur avec sa compagnie
INSERT INTO producer (id_user, company)
SELECT id_user, 'Ferme Bio du Bon Vivant'
FROM users WHERE email = 'producteur@example.com';

-- Insérer les types de produits
INSERT INTO product_types (title) VALUES 
('Légumes'),
('Fruits'),
('Boulangerie'),
('Viande'),
('Produits laitiers'),
('Boissons'),
('Autres');

-- Insérer quelques photos
INSERT INTO photos (name, url) VALUES
('tomate_bio', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469'),
('pomme_rouge', 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a'),
('pain_artisanal', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73'),
('fromage', 'https://images.unsplash.com/photo-1452195100486-9cc805987862');

-- Insérer des produits
INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type, 'Tomates Bio', 'Tomates cultivées sans pesticides, parfaites pour vos salades estivales.', p.id_photo
FROM product_types pt, photos p
WHERE pt.title = 'Légumes' AND p.name = 'tomate_bio';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type, 'Pommes Royal Gala', 'Pommes sucrées et croquantes, idéales comme collation.', p.id_photo
FROM product_types pt, photos p
WHERE pt.title = 'Fruits' AND p.name = 'pomme_rouge';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type, 'Pain au levain', 'Pain artisanal à l''ancienne préparé avec du levain naturel.', p.id_photo
FROM product_types pt, photos p
WHERE pt.title = 'Boulangerie' AND p.name = 'pain_artisanal';

INSERT INTO products (id_product_type, name, description, photo_id)
SELECT pt.id_product_type, 'Fromage fermier', 'Fromage à pâte dure affiné pendant 6 mois.', p.id_photo
FROM product_types pt, photos p
WHERE pt.title = 'Produits laitiers' AND p.name = 'fromage';

-- Créer des lots pour chaque produit
INSERT INTO batchs (gestionnaire, producteur, produit, photo, date_disponibilite, prix_unitaire, unite_vente, quantite_disponible, statut, date_depot)
SELECT 
    (SELECT id_user FROM manager LIMIT 1),
    (SELECT id_user FROM producer LIMIT 1),
    p.id_product,
    ph.url,
    '2025-04-15',
    3.50,
    'kg',
    50,
    'approuvé',
    '2025-03-20'
FROM products p
JOIN photos ph ON p.photo_id = ph.id_photo
WHERE p.name = 'Tomates Bio';

INSERT INTO batchs (gestionnaire, producteur, produit, photo, date_disponibilite, prix_unitaire, unite_vente, quantite_disponible, statut, date_depot)
SELECT 
    (SELECT id_user FROM manager LIMIT 1),
    (SELECT id_user FROM producer LIMIT 1),
    p.id_product,
    ph.url,
    '2025-04-10',
    2.75,
    'kg',
    75,
    'approuvé',
    '2025-03-15'
FROM products p
JOIN photos ph ON p.photo_id = ph.id_photo
WHERE p.name = 'Pommes Royal Gala';

INSERT INTO batchs (gestionnaire, producteur, produit, photo, date_disponibilite, prix_unitaire, unite_vente, quantite_disponible, statut, date_depot)
SELECT 
    (SELECT id_user FROM manager LIMIT 1),
    (SELECT id_user FROM producer LIMIT 1),
    p.id_product,
    ph.url,
    '2025-03-30',
    4.20,
    'pièce',
    30,
    'approuvé',
    '2025-03-25'
FROM products p
JOIN photos ph ON p.photo_id = ph.id_photo
WHERE p.name = 'Pain au levain';

INSERT INTO batchs (gestionnaire, producteur, produit, photo, date_disponibilite, prix_unitaire, unite_vente, quantite_disponible, statut, date_depot)
SELECT 
    (SELECT id_user FROM manager LIMIT 1),
    (SELECT id_user FROM producer LIMIT 1),
    p.id_product,
    ph.url,
    '2025-04-05',
    7.50,
    'pièce',
    25,
    'approuvé',
    '2025-03-18'
FROM products p
JOIN photos ph ON p.photo_id = ph.id_photo
WHERE p.name = 'Fromage fermier';
