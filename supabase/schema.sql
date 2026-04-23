-- Family Finance Dashboard — Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Members table
create table if not exists members (
  id uuid default gen_random_uuid() primary key,
  family_id text not null default 'family',
  name text not null,
  avatar_color text default '#4f46e5',
  created_at timestamptz default now()
);

-- Bank accounts
create table if not exists bank_accounts (
  id uuid default gen_random_uuid() primary key,
  family_id text not null default 'family',
  member_id uuid references members(id) on delete set null,
  bank_name text not null check (bank_name in ('KTB','SCB','GSB','TTB')),
  account_name text not null,
  account_number text,
  account_type text default 'savings' check (account_type in ('savings','current','fixed')),
  balance numeric(15,2) default 0,
  currency text default 'THB',
  color text default '#4f46e5',
  created_at timestamptz default now()
);

-- Transactions
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  family_id text not null default 'family',
  account_id uuid references bank_accounts(id) on delete cascade,
  member_id uuid references members(id) on delete set null,
  type text not null check (type in ('income','expense','transfer')),
  amount numeric(15,2) not null,
  category text not null,
  description text default '',
  date date not null,
  created_at timestamptz default now()
);
create index if not exists transactions_date_idx on transactions(date desc);
create index if not exists transactions_type_idx on transactions(type);

-- Savings goals
create table if not exists savings_goals (
  id uuid default gen_random_uuid() primary key,
  family_id text not null default 'family',
  name text not null,
  name_th text,
  target_amount numeric(15,2) not null,
  current_amount numeric(15,2) default 0,
  deadline date,
  category text default 'other',
  color text default '#4f46e5',
  icon text default '💰',
  monthly_target numeric(15,2),
  created_at timestamptz default now()
);

-- Debts
create table if not exists debts (
  id uuid default gen_random_uuid() primary key,
  family_id text not null default 'family',
  member_id uuid references members(id) on delete set null,
  name text not null,
  lender text default '',
  total_amount numeric(15,2) not null,
  remaining_amount numeric(15,2) not null,
  interest_rate numeric(5,2) default 0,
  monthly_payment numeric(15,2),
  payment_date int check (payment_date between 1 and 31),
  type text default 'personal',
  created_at timestamptz default now()
);

-- Appointments
create table if not exists appointments (
  id uuid default gen_random_uuid() primary key,
  family_id text not null default 'family',
  member_id uuid references members(id) on delete set null,
  title text not null,
  description text default '',
  date date not null,
  time text,
  category text default 'personal',
  color text default '#4f46e5',
  reminder_days int default 1,
  created_at timestamptz default now()
);
create index if not exists appointments_date_idx on appointments(date);

-- Income sources
create table if not exists income_sources (
  id uuid default gen_random_uuid() primary key,
  family_id text not null default 'family',
  member_id uuid references members(id) on delete set null,
  name text not null,
  amount numeric(15,2) not null,
  frequency text default 'monthly',
  category text default 'salary',
  created_at timestamptz default now()
);

-- Row-level security (optional — enable when ready)
-- alter table members enable row level security;
-- alter table bank_accounts enable row level security;
-- alter table transactions enable row level security;
-- alter table savings_goals enable row level security;
-- alter table debts enable row level security;
-- alter table appointments enable row level security;
