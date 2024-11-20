-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Enable read access for all users" ON members;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON members;
DROP POLICY IF EXISTS "Enable read access for all users" ON bank_accounts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON bank_accounts;
DROP POLICY IF EXISTS "Enable read access for all users" ON transactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON transactions;

-- Créer de nouvelles politiques plus permissives pour l'application
CREATE POLICY "Enable access for all users" ON members
    FOR ALL USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable access for all users" ON bank_accounts
    FOR ALL USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable access for all users" ON transactions
    FOR ALL USING (true)
    WITH CHECK (true);