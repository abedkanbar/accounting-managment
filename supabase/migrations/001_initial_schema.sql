-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Members table
CREATE TABLE members (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Bank Accounts table
CREATE TABLE bank_accounts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bank VARCHAR(255) NOT NULL,
    iban VARCHAR(34) NOT NULL UNIQUE,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Transactions table
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    description TEXT,
    member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    bank_account_id BIGINT NOT NULL REFERENCES bank_accounts(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_member_id ON transactions(member_id);
CREATE INDEX idx_transactions_bank_account_id ON transactions(bank_account_id);

-- Create views for statistics
CREATE VIEW transaction_stats_by_year AS
SELECT 
    EXTRACT(YEAR FROM date) as year,
    COUNT(*) as count,
    SUM(amount) as total
FROM transactions
GROUP BY EXTRACT(YEAR FROM date)
ORDER BY year DESC;

CREATE VIEW transaction_stats_by_month AS
SELECT 
    TO_CHAR(date, 'YYYY-MM') as month,
    COUNT(*) as count,
    SUM(amount) as total
FROM transactions
GROUP BY TO_CHAR(date, 'YYYY-MM')
ORDER BY month DESC;

CREATE VIEW transaction_stats_by_member AS
SELECT 
    m.name,
    COUNT(*) as count,
    SUM(t.amount) as total
FROM transactions t
JOIN members m ON t.member_id = m.id
GROUP BY m.id, m.name
ORDER BY total DESC;

CREATE VIEW transaction_stats_by_type AS
SELECT 
    type,
    COUNT(*) as count,
    SUM(amount) as total
FROM transactions
GROUP BY type
ORDER BY total DESC;

-- Insert initial data
INSERT INTO bank_accounts (name, bank, iban, balance) VALUES
('Compte principal', 'BNP Paribas', 'FR76 3000 1234 1234 1234 1234 123', 15420.50);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON members
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON bank_accounts
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON transactions
    FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY "Enable insert for authenticated users only" ON members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON bank_accounts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');