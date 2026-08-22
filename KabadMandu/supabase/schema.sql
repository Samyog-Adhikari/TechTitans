-- ==============================================================================
-- KABADMANDU DATABASE SCHEMA & ROW LEVEL SECURITY POLICIES
-- Single Source of Truth for Supabase Backend (AGENT.md Section 5)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('household', 'collector', 'admin')),
    name TEXT NOT NULL,
    phone TEXT,
    area TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to handle auth.users new signup profile creation automatically if metadata exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role, name, phone, area)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'household'),
        COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'area'
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        area = EXCLUDED.area;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. WASTE TYPES TABLE (Scrap items & dynamic rates)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.waste_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    rate_per_kg NUMERIC NOT NULL CHECK (rate_per_kg >= 0),
    active BOOLEAN DEFAULT true NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial standard Nepal scrap rates
INSERT INTO public.waste_types (name, rate_per_kg, active)
VALUES
    ('Iron & Metal', 35.00, true),
    ('Paper & Cardboard', 18.00, true),
    ('Plastics (PET & HDPE)', 22.00, true),
    ('E-Waste / Electronics', 65.00, true),
    ('Glass Bottles', 8.00, true),
    ('Aluminium & Cans', 120.00, true),
    ('Copper & Brass', 450.00, true)
ON CONFLICT (name) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. PICKUPS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pickups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    collector_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    waste_type_id UUID NOT NULL REFERENCES public.waste_types(id) ON DELETE RESTRICT,
    estimated_qty NUMERIC CHECK (estimated_qty > 0),
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'completed', 'cancelled')),
    scheduled_time TIMESTAMPTZ,
    address TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. LEDGER ENTRIES TABLE (Verified collection and income records)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collector_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pickup_id UUID REFERENCES public.pickups(id) ON DELETE SET NULL,
    waste_type_id UUID NOT NULL REFERENCES public.waste_types(id) ON DELETE RESTRICT,
    actual_weight_kg NUMERIC NOT NULL CHECK (actual_weight_kg > 0),
    amount_paid NUMERIC NOT NULL CHECK (amount_paid >= 0),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. INCOME STATEMENTS TABLE (Fixed, verifiable snapshots)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.income_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collector_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_earnings NUMERIC NOT NULL CHECK (total_earnings >= 0),
    total_pickups INTEGER NOT NULL CHECK (total_pickups >= 0),
    weeks_active INTEGER NOT NULL CHECK (weeks_active >= 0),
    avg_weekly_earnings NUMERIC NOT NULL CHECK (avg_weekly_earnings >= 0),
    trust_tier TEXT NOT NULL CHECK (trust_tier IN ('Building', 'Good', 'Excellent')),
    verification_code TEXT UNIQUE NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. COMPLAINTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('household', 'collector')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution_note TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Users can view their own profile
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Admin can read profiles (basic overviews)
CREATE POLICY "Admins can view profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

-- Users can update own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Profile creation (allowed on registration)
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- WASTE TYPES POLICIES (Public read, Admin write)
-- ------------------------------------------------------------------------------
-- Anyone (even unauthenticated) can view waste types
CREATE POLICY "Anyone can view waste types"
    ON public.waste_types FOR SELECT
    USING (true);

-- Only admin can insert/update waste types
CREATE POLICY "Admin can insert waste types"
    ON public.waste_types FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update waste types"
    ON public.waste_types FOR UPDATE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- PICKUPS POLICIES
-- ------------------------------------------------------------------------------
-- Households can view their own pickups
CREATE POLICY "Households view own pickups"
    ON public.pickups FOR SELECT
    USING (auth.uid() = household_id);

-- Collectors can view requested (open) pickups OR pickups assigned to them
CREATE POLICY "Collectors view open or assigned pickups"
    ON public.pickups FOR SELECT
    USING (
        status = 'requested' 
        OR collector_id = auth.uid()
        OR public.is_admin()
    );

-- Households can insert new pickups
CREATE POLICY "Households can request pickups"
    ON public.pickups FOR INSERT
    WITH CHECK (auth.uid() = household_id);

-- Households can update/cancel their own open pickups
CREATE POLICY "Households can update own pickups"
    ON public.pickups FOR UPDATE
    USING (auth.uid() = household_id);

-- Collectors can accept/update pickups assigned to them or open requested
CREATE POLICY "Collectors can update pickups"
    ON public.pickups FOR UPDATE
    USING (
        (status = 'requested' AND collector_id IS NULL)
        OR collector_id = auth.uid()
        OR public.is_admin()
    );

-- ------------------------------------------------------------------------------
-- LEDGER ENTRIES POLICIES (Collector only - Admin restricted by default)
-- ------------------------------------------------------------------------------
-- Collectors can view their own ledger entries
CREATE POLICY "Collectors view own ledger entries"
    ON public.ledger_entries FOR SELECT
    USING (collector_id = auth.uid());

-- Collectors can insert their own ledger entries upon completing a job
CREATE POLICY "Collectors can create ledger entries"
    ON public.ledger_entries FOR INSERT
    WITH CHECK (collector_id = auth.uid());

-- ------------------------------------------------------------------------------
-- INCOME STATEMENTS POLICIES
-- ------------------------------------------------------------------------------
-- Collectors can view and insert their own income statements
CREATE POLICY "Collectors view own income statements"
    ON public.income_statements FOR SELECT
    USING (collector_id = auth.uid());

CREATE POLICY "Collectors insert own income statements"
    ON public.income_statements FOR INSERT
    WITH CHECK (collector_id = auth.uid());

-- Public verification lookup by verification_code (read-only)
CREATE POLICY "Public verification of income statements"
    ON public.income_statements FOR SELECT
    USING (true);

-- ------------------------------------------------------------------------------
-- COMPLAINTS POLICIES
-- ------------------------------------------------------------------------------
-- Users can view their own submitted complaints
CREATE POLICY "Users view own complaints"
    ON public.complaints FOR SELECT
    USING (submitted_by = auth.uid() OR public.is_admin());

-- Users can submit complaints
CREATE POLICY "Users can submit complaints"
    ON public.complaints FOR INSERT
    WITH CHECK (submitted_by = auth.uid());

-- Admins can update complaint status and add resolution notes
CREATE POLICY "Admins can resolve complaints"
    ON public.complaints FOR UPDATE
    USING (public.is_admin());
