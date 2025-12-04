UPDATE clients 
SET status = 'active', updated_at = now() 
WHERE status = 'pending';