-- Ajouter le solde initial aux comptes bancaires
ALTER TABLE bank_accounts
ADD COLUMN initial_balance DECIMAL(15,2) DEFAULT 0.00;

DROP view account_balances;

-- Mettre à jour la vue account_balances
CREATE OR REPLACE VIEW account_balances AS
SELECT 
    ba.id,
    ba.name,
    ba.bank,
    ba.iban,
    ba.initial_balance,
    COALESCE(ba.initial_balance + SUM(t.credit - t.debit), ba.initial_balance) as current_balance,
    COALESCE(SUM(t.credit), 0) as total_credit,
    COALESCE(SUM(t.debit), 0) as total_debit
FROM bank_accounts ba
LEFT JOIN transactions t ON ba.id = t.bank_account_id
GROUP BY ba.id, ba.name, ba.bank, ba.iban, ba.initial_balance;