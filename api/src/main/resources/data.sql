-- Nettoyer les tables
TRUNCATE TABLE users CASCADE;

-- Insérer un utilisateur dans la table users
INSERT INTO users (name, firstname, email, password, date_inscription)
VALUES ('Admin', 'Admin', 'admin@example.com', 'adminpw', '2001-01-01');

-- Récupérer l'ID généré et insérer dans la table manager
INSERT INTO manager (id_user, manager_id)
SELECT id_user, NULL FROM users WHERE email = 'admin@example.com';