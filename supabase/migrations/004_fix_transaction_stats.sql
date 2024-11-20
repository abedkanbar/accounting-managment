-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS get_transaction_stats;

-- Créer la nouvelle fonction corrigée
CREATE OR REPLACE FUNCTION get_transaction_stats(
    group_by TEXT[],
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
            SUM(t.amount) AS total
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