-- Initialize TMS Database
-- This script runs when PostgreSQL container starts for the first time

-- Create the TMS user if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'tms_user') THEN

      CREATE ROLE tms_user LOGIN PASSWORD 'tms_password';
   END IF;
END
$do$;

-- Create the TMS database if it doesn't exist
SELECT 'CREATE DATABASE tms_db OWNER tms_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tms_db')\gexec

-- Grant all privileges to tms_user on tms_db
GRANT ALL PRIVILEGES ON DATABASE tms_db TO tms_user;

-- Switch to tms_db and grant schema privileges
\c tms_db tms_user;

-- Grant privileges on public schema
GRANT ALL ON SCHEMA public TO tms_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tms_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tms_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO tms_user; 