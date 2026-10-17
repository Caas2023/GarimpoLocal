-- Migration: adicionar password_hash e updated_at à tabela users
-- Compatível com Neon Postgres / serverless.

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "password_hash" varchar(255),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
