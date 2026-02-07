-- Row-Level Security policies for multi-tenant isolation
-- Apply after Prisma migrations have created the tables
-- Run via: psql $DATABASE_URL -f prisma/migrations/rls/enable_rls.sql

-- Tables that require tenant isolation
-- (These will be created by future stories as models are added)

-- For now, only tenants and user_tenants exist and don't need RLS
-- (they are multi-tenant by nature)

-- Template for future tables:
-- ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY tenant_isolation ON table_name
--   USING (tenant_id = current_setting('app.current_tenant_id', true));
-- CREATE POLICY tenant_isolation_insert ON table_name
--   FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

-- This file will be updated as new tables are created in future stories
