-- 1. Table: promo_codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
    code TEXT PRIMARY KEY,
    owner_name TEXT NOT NULL,
    bank_details TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    crypto_price NUMERIC DEFAULT 30,
    forex_price NUMERIC DEFAULT 40,
    all_price NUMERIC DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table: users (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    promo_code_used TEXT REFERENCES public.promo_codes(code),
    status TEXT CHECK (status IN ('Registered', 'Pending', 'Active', 'Banned')) DEFAULT 'Registered',
    active_package TEXT,
    expiry_date TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table: activity_logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- e.g., 'Registered', 'Clicked Paid', 'Activated'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Users
-- Users can read their own data
CREATE POLICY "Users can read own record" ON public.users FOR SELECT USING (auth.uid() = id);
-- Users can update their own status to 'Pending'
CREATE POLICY "Users can update own status" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 6. Policies for Promo Codes
-- Anyone can read promo codes (needed for validation during registration)
CREATE POLICY "Public can read promo codes" ON public.promo_codes FOR SELECT USING (true);

-- 7. Policies for Activity Logs
-- Users can read their own logs
CREATE POLICY "Users can read own logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
-- Users can insert their own logs
CREATE POLICY "Users can insert own logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Admin Policies (Assuming an 'admin' role or specific admin emails)
-- For simplicity, let's say anyone with a specific email or metadata can be admin.
-- Or just create a separate 'admins' table or logic. For now, let's keep it simple.
-- Admin can do everything on all tables.
CREATE POLICY "Admins can do everything on users" ON public.users FOR ALL USING (auth.jwt() ->> 'email' = 'madhushanimsara849@gmail.com');
CREATE POLICY "Admins can do everything on promo_codes" ON public.promo_codes FOR ALL USING (auth.jwt() ->> 'email' = 'madhushanimsara849@gmail.com');
CREATE POLICY "Admins can do everything on activity_logs" ON public.activity_logs FOR ALL USING (auth.jwt() ->> 'email' = 'madhushanimsara849@gmail.com');
CREATE POLICY "Admins can read admin_config" ON public.admin_config FOR SELECT USING (auth.jwt() ->> 'email' = 'madhushanimsara849@gmail.com');

-- 9. Function to handle user creation on Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for handle_new_user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert Default Promo Code
INSERT INTO public.promo_codes (code, owner_name, bank_details, whatsapp_number, is_default)
VALUES ('KILLERS10', 'Main Admin', 'Bank: HNB\nAcc: 123456789\nName: Killers VIP Support', '+94700000000', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 10. Table: admin_config (For Master Key)
CREATE TABLE IF NOT EXISTS public.admin_config (
    key_name TEXT PRIMARY KEY,
    key_value TEXT NOT NULL
);

-- Insert Initial Master Key (ඔබට මෙය පසුව Supabase එකෙන් වෙනස් කළ හැක)
INSERT INTO public.admin_config (key_name, key_value) 
VALUES ('master_key', 'KVIP-7788-ADMIN')
ON CONFLICT (key_name) DO NOTHING;
