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
    unit TEXT DEFAULT 'per_kg' NOT NULL CHECK (unit IN ('per_kg', 'per_piece')),
    category TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial standard Nepal scrap rates
INSERT INTO public.waste_types (name, rate_per_kg, unit, category, active)
VALUES
    ('Copy / Notebooks', 15.00, 'per_kg', 'Paper & Cardboard', true),
    ('A4 / White Paper', 12.00, 'per_kg', 'Paper & Cardboard', true),
    ('Books & Magazines', 11.00, 'per_kg', 'Paper & Cardboard', true),
    ('Cardboard', 10.00, 'per_kg', 'Paper & Cardboard', true),
    ('Carton', 10.00, 'per_kg', 'Paper & Cardboard', true),
    ('Confidential Documents', 7.00, 'per_kg', 'Paper & Cardboard', true),
    ('Magazines', 7.00, 'per_kg', 'Paper & Cardboard', true),
    ('Shredded Paper', 5.00, 'per_kg', 'Paper & Cardboard', true),
    ('Invitation Cards', 4.00, 'per_kg', 'Paper & Cardboard', true),
    ('Egg Crates', 1.00, 'per_piece', 'Paper & Cardboard', true),
    ('Copper', 1300.00, 'per_kg', 'Metals', true),
    ('Brass', 1000.00, 'per_kg', 'Metals', true),
    ('Aluminium', 200.00, 'per_kg', 'Metals', true),
    ('Steel / Iron', 42.00, 'per_kg', 'Metals', true),
    ('Tin & Cans', 18.00, 'per_kg', 'Metals', true),
    ('PET Bottles', 20.00, 'per_kg', 'Plastic', true),
    ('Hard Plastic', 15.00, 'per_kg', 'Plastic', true),
    ('Mixed Plastic', 10.00, 'per_kg', 'Plastic', true),
    ('Computer / CPU', 400.00, 'per_piece', 'E-Waste', true),
    ('Laptop', 400.00, 'per_kg', 'E-Waste', true),
    ('Mobile Phone', 100.00, 'per_piece', 'E-Waste', true),
    ('Television', 100.00, 'per_piece', 'E-Waste', true),
    ('Cables & Chargers', 150.00, 'per_kg', 'E-Waste', true),
    ('Printer / Small Electronics', 80.00, 'per_piece', 'E-Waste', true),
    ('Glass Bottles / Jars', 3.00, 'per_kg', 'Glass & Bottles', true),
    ('Beer Bottle', 1.00, 'per_piece', 'Glass & Bottles', true),
    ('Stainless Steel Utensils', 90.00, 'per_kg', 'Household Metal', true),
    ('Aluminium Utensils', 150.00, 'per_kg', 'Household Metal', true),
    ('Old Clothes / Textile', 8.00, 'per_kg', 'Textile', true),
    ('Mattress', 150.00, 'per_piece', 'Household Items', true),
    ('Wooden Furniture Scrap', 5.00, 'per_kg', 'Household Items', true),
    ('Tyres / Rubber', 10.00, 'per_kg', 'Rubber', true),
    ('Car Battery (Lead-Acid)', 180.00, 'per_kg', 'Batteries', true),
    ('Inverter Battery', 170.00, 'per_kg', 'Batteries', true),
    ('Washing Machine', 600.00, 'per_piece', 'Appliances', true),
    ('Refrigerator', 700.00, 'per_piece', 'Appliances', true),
    ('Air Conditioner', 1200.00, 'per_piece', 'Appliances', true),
    ('Iron Rod / Rebar Scrap', 48.00, 'per_kg', 'Metals', true),
    ('Wire Scrap (Copper-coated)', 250.00, 'per_kg', 'Metals', true),
    ('Gas Cylinder (Empty)', 300.00, 'per_piece', 'Household Items', true)
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
