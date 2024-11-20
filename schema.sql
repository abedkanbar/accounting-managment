-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create reference tables
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

-- Create main tables
CREATE TABLE members (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    status_id BIGINT REFERENCES member_statuses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE bank_accounts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bank VARCHAR(255) NOT NULL,
    iban VARCHAR(34) NOT NULL UNIQUE,
    initial_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    type_id BIGINT REFERENCES transaction_types(id),
    amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    operation_type VARCHAR(10) NOT NULL CHECK (operation_type IN ('DEBIT', 'CREDIT')),
    payment_method_id BIGINT REFERENCES payment_methods(id),
    member_id BIGINT REFERENCES members(id) ON DELETE RESTRICT,
    bank_account_id BIGINT REFERENCES bank_accounts(id) ON DELETE RESTRICT,
    description TEXT,
    check_reference VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_member_id ON transactions(member_id);
CREATE INDEX idx_transactions_bank_account_id ON transactions(bank_account_id);
CREATE INDEX idx_transactions_type_id ON transactions(type_id);
CREATE INDEX idx_transactions_payment_method_id ON transactions(payment_method_id);

-- Create view for account balances
CREATE OR REPLACE VIEW account_balances AS
SELECT 
    ba.id,
    ba.name,
    ba.bank,
    ba.iban,
    ba.initial_balance,
    COALESCE(ba.initial_balance + SUM(
        CASE 
            WHEN t.operation_type = 'CREDIT' THEN t.amount
            WHEN t.operation_type = 'DEBIT' THEN -t.amount
            ELSE 0
        END
    ), ba.initial_balance) as current_balance,
    COALESCE(SUM(CASE WHEN t.operation_type = 'CREDIT' THEN t.amount ELSE 0 END), 0) as total_credit,
    COALESCE(SUM(CASE WHEN t.operation_type = 'DEBIT' THEN t.amount ELSE 0 END), 0) as total_debit
FROM bank_accounts ba
LEFT JOIN transactions t ON ba.id = t.bank_account_id
GROUP BY ba.id, ba.name, ba.bank, ba.iban, ba.initial_balance;

-- Create function for transaction statistics
CREATE OR REPLACE FUNCTION get_transaction_stats(
    group_by TEXT[],
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    group_values JSONB,
    count BIGINT,
    total_debit DECIMAL(15,2),
    total_credit DECIMAL(15,2),
    balance DECIMAL(15,2)
) AS $$
DECLARE
    query_str TEXT;
    group_columns TEXT;
    json_columns TEXT;
BEGIN
    -- Construire les colonnes de groupement
    SELECT string_agg(
        CASE 
            WHEN col = 'year' THEN 'EXTRACT(YEAR FROM t.date)'
            WHEN col = 'month' THEN 'TO_CHAR(t.date, ''YYYY-MM'')'
            WHEN col = 'member' THEN 'm.name'
            WHEN col = 'type' THEN 'tt.name'
            WHEN col = 'payment_method' THEN 'pm.name'
            ELSE col
        END,
        ', '
    ) INTO group_columns
    FROM unnest(group_by) AS col;

    -- Construire les colonnes JSON
    SELECT string_agg(
        format(
            '''%s'', %s',
            col,
            CASE 
                WHEN col = 'year' THEN 'EXTRACT(YEAR FROM t.date)'
                WHEN col = 'month' THEN 'TO_CHAR(t.date, ''YYYY-MM'')'
                WHEN col = 'member' THEN 'm.name'
                WHEN col = 'type' THEN 'tt.name'
                WHEN col = 'payment_method' THEN 'pm.name'
                ELSE col
            END
        ),
        ', '
    ) INTO json_columns
    FROM unnest(group_by) AS col;

    -- Construire et exécuter la requête
    query_str := format(
        'SELECT 
            jsonb_build_object(%s) AS group_values,
            COUNT(*) AS count,
            SUM(CASE WHEN t.operation_type = ''DEBIT'' THEN t.amount ELSE 0 END) AS total_debit,
            SUM(CASE WHEN t.operation_type = ''CREDIT'' THEN t.amount ELSE 0 END) AS total_credit,
            SUM(CASE 
                WHEN t.operation_type = ''CREDIT'' THEN t.amount 
                WHEN t.operation_type = ''DEBIT'' THEN -t.amount 
                ELSE 0 
            END) AS balance
        FROM transactions t
        JOIN members m ON t.member_id = m.id
        JOIN transaction_types tt ON t.type_id = tt.id
        JOIN payment_methods pm ON t.payment_method_id = pm.id
        WHERE ($1 IS NULL OR t.date >= $1)
        AND ($2 IS NULL OR t.date <= $2)
        GROUP BY %s
        ORDER BY %s',
        json_columns,
        group_columns,
        group_columns
    );

    RETURN QUERY EXECUTE query_str USING start_date, end_date;
END;
$$ LANGUAGE plpgsql;

-- Insert initial data
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