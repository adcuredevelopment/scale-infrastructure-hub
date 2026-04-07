
-- Step 1: Delete duplicate active subscriptions that were created by sync
-- when a cancelled subscription already exists for the same customer + amount.
-- Keep the cancelled row, delete the duplicate active row.
DELETE FROM subscriptions
WHERE id IN (
  SELECT active_sub.id
  FROM subscriptions active_sub
  INNER JOIN subscriptions cancelled_sub 
    ON active_sub.customer_email = cancelled_sub.customer_email
    AND active_sub.amount = cancelled_sub.amount
    AND cancelled_sub.status = 'cancelled'
    AND active_sub.status = 'active'
    AND active_sub.id != cancelled_sub.id
    AND active_sub.created_at > cancelled_sub.created_at
);

-- Step 2: Add unique partial index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_revolut_sub_id_unique 
ON subscriptions (revolut_subscription_id) 
WHERE revolut_subscription_id IS NOT NULL;

-- Step 3: Recompute customer subscription_count and status
UPDATE customers c SET
  subscription_count = COALESCE((
    SELECT COUNT(*) FROM subscriptions s 
    WHERE s.customer_email = c.email AND s.status = 'active'
  ), 0),
  status = CASE 
    WHEN EXISTS (SELECT 1 FROM subscriptions s WHERE s.customer_email = c.email AND s.status = 'active')
    THEN 'active' ELSE 'cancelled' 
  END;
