-- Créer les tables de référence
CREATE TABLE member_statuses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE transaction_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE payment_methods (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Modifier les tables existantes pour utiliser les références
ALTER TABLE members 
    ADD COLUMN status_id BIGINT REFERENCES member_statuses(id),
    DROP COLUMN status CASCADE ;

ALTER TABLE transactions 
    ADD COLUMN type_id BIGINT REFERENCES transaction_types(id),
    ADD COLUMN payment_method_id BIGINT REFERENCES payment_methods(id),
    DROP COLUMN type CASCADE ,
    DROP COLUMN payment_method CASCADE ;

-- Insérer les données de référence
INSERT INTO member_statuses (name, description) VALUES
    ('Actif', 'Membre à jour de ses cotisations'),
    ('Inactif', 'Membre n''ayant pas renouvelé son adhésion'),
    ('En attente', 'Inscription en cours de validation'),
    ('Suspendu', 'Adhésion temporairement suspendue');

INSERT INTO transaction_types (name, description) VALUES
    ('Cotisation', 'Paiement de la cotisation annuelle'),
    ('Don', 'Don à l''association'),
    ('Cours', 'Paiement pour des cours'),
    ('Salaire', 'Versement de salaire'),
    ('Remboursement', 'Remboursement de frais'),
    ('Autre', 'Autre type de transaction');

INSERT INTO payment_methods (name, description) VALUES
    ('Espèces', 'Paiement en espèces'),
    ('Chèque', 'Paiement par chèque'),
    ('Virement', 'Virement bancaire'),
    ('Carte', 'Paiement par carte bancaire'),
    ('Prélèvement', 'Prélèvement automatique');

-- Créer une fonction pour le groupement dynamique des transactions
CREATE OR REPLACE FUNCTION get_transaction_stats(
    group_by TEXT[], -- tableau des champs de groupement
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    group_values JSONB,
    count BIGINT,
    total DECIMAL(15,2)
) AS $$
DECLARE
    query_str TEXT;
    select_parts TEXT[];
    group_parts TEXT[];
BEGIN
    -- Initialiser les parties de la requête
    SELECT 
        ARRAY_AGG(
            CASE 
                WHEN col = 'year' THEN 'EXTRACT(YEAR FROM t.date) AS year'
                WHEN col = 'month' THEN 'TO_CHAR(t.date, ''YYYY-MM'') AS month'
                WHEN col = 'member' THEN 'm.name AS member_name'
                WHEN col = 'type' THEN 'tt.name AS type_name'
                WHEN col = 'payment_method' THEN 'pm.name AS payment_method_name'
                ELSE col
            END
        ),
        ARRAY_AGG(
            CASE 
                WHEN col = 'year' THEN 'EXTRACT(YEAR FROM t.date)'
                WHEN col = 'month' THEN 'TO_CHAR(t.date, ''YYYY-MM'')'
                WHEN col = 'member' THEN 'm.name'
                WHEN col = 'type' THEN 'tt.name'
                WHEN col = 'payment_method' THEN 'pm.name'
                ELSE col
            END
        )
    INTO select_parts, group_parts
    FROM unnest(group_by) AS col;

    -- Construire la requête
    query_str := format(
        'SELECT 
            jsonb_build_object(%s) AS group_values,
            COUNT(*) AS count,
            SUM(t.amount) AS total
        FROM transactions t
        JOIN members m ON t.member_id = m.id
        JOIN transaction_types tt ON t.type_id = tt.id
        JOIN payment_methods pm ON t.payment_method_id = pm.id
        WHERE ($1 IS NULL OR t.date >= $1)
        AND ($2 IS NULL OR t.date <= $2)
        GROUP BY %s
        ORDER BY %s',
        (SELECT string_agg(format('''%s'', %s', key, value), ', ')
         FROM unnest(group_by) WITH ORDINALITY AS t(key, ordinality)
         JOIN unnest(select_parts) WITH ORDINALITY AS s(value, ord) ON t.ordinality = s.ord),
        array_to_string(group_parts, ', '),
        array_to_string(group_parts, ', ')
    );

    -- Exécuter la requête
    RETURN QUERY EXECUTE query_str USING start_date, end_date;
END;
$$ LANGUAGE plpgsql;