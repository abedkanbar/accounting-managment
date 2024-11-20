-- Correction de la fonction get_transaction_stats
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
) LANGUAGE plpgsql
AS $$
DECLARE
    query_str TEXT;
    group_columns TEXT[];
    select_columns TEXT[];
BEGIN
    -- Préparer les colonnes pour le groupement
    SELECT ARRAY_AGG(
        CASE 
            WHEN col = 'year' THEN 'EXTRACT(YEAR FROM t.date)'
            WHEN col = 'month' THEN 'TO_CHAR(t.date, ''YYYY-MM'')'
            WHEN col = 'member' THEN 'm.name'
            WHEN col = 'type' THEN 'tt.name'
            WHEN col = 'payment_method' THEN 'pm.name'
            ELSE col
        END
    ) INTO group_columns
    FROM unnest(group_by) AS col;

    -- Préparer les colonnes pour le SELECT
    SELECT ARRAY_AGG(
        CASE 
            WHEN col = 'year' THEN format('''%s'', EXTRACT(YEAR FROM t.date)', col)
            WHEN col = 'month' THEN format('''%s'', TO_CHAR(t.date, ''YYYY-MM'')', col)
            WHEN col = 'member' THEN format('''%s'', m.name', col)
            WHEN col = 'type' THEN format('''%s'', tt.name', col)
            WHEN col = 'payment_method' THEN format('''%s'', pm.name', col)
            ELSE format('''%s'', %s', col, col)
        END
    ) INTO select_columns
    FROM unnest(group_by) AS col;

    -- Construire la requête
    query_str := format(
        'SELECT 
            jsonb_build_object(%s) AS group_values,
            COUNT(*) AS count,
            COALESCE(SUM(t.debit), 0) AS total_debit,
            COALESCE(SUM(t.credit), 0) AS total_credit,
            COALESCE(SUM(t.credit - t.debit), 0) AS balance
        FROM transactions t
        JOIN members m ON t.member_id = m.id
        JOIN transaction_types tt ON t.type_id = tt.id
        JOIN payment_methods pm ON t.payment_method_id = pm.id
        WHERE ($1 IS NULL OR t.date >= $1)
        AND ($2 IS NULL OR t.date <= $2)
        GROUP BY %s
        ORDER BY %s',
        array_to_string(select_columns, ', '),
        array_to_string(group_columns, ', '),
        array_to_string(group_columns, ', ')
    );

    RETURN QUERY EXECUTE query_str USING start_date, end_date;
END;
$$;