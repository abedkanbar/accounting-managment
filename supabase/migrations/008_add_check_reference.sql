-- Ajouter le champ référence de chèque à la table transactions
ALTER TABLE transactions
ADD COLUMN check_reference VARCHAR(50);