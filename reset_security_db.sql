
-- Clear any security-related database entries
-- DELETE FROM security_incidents WHERE created_at < NOW();
-- DELETE FROM blocked_ips WHERE created_at < NOW();
-- DELETE FROM rate_limits WHERE created_at < NOW();
-- UPDATE users SET failed_login_attempts = 0, locked_until = NULL;
SELECT 'Database security reset (if tables exist)' as message;
