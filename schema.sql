-- ========================================================
-- MEBEL DÜNYASI — SUPABASE SCHEMAS & RLS SECURITY POLICIES
-- ========================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  ad_soyad TEXT,
  telefon TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad TEXT NOT NULL,
  sekil_url TEXT,
  sira INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories RLS (Public Read, Admin Write)
CREATE POLICY "Public read categories" 
  ON public.categories FOR SELECT 
  USING (true);

CREATE POLICY "Admin write categories" 
  ON public.categories FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad TEXT NOT NULL,
  kateqoriya_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  qiymet NUMERIC(10, 2) NOT NULL,
  endirimli_qiymet NUMERIC(10, 2),
  stok INT DEFAULT 0,
  qisa_teswir TEXT,
  etrafli_teswir TEXT,
  xususiyyetler JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'deaktiv')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products RLS (Public Read Active, Admin Full)
CREATE POLICY "Public read active products" 
  ON public.products FOR SELECT 
  USING (status = 'aktiv' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admin write products" 
  ON public.products FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- 4. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  sekil_url TEXT NOT NULL,
  esas_sekil BOOLEAN DEFAULT FALSE,
  sira INT DEFAULT 0
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read product images" 
  ON public.product_images FOR SELECT 
  USING (true);

CREATE POLICY "Admin write product images" 
  ON public.product_images FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- 5. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Favorites RLS (User Own Only)
CREATE POLICY "User manage own favorites" 
  ON public.favorites FOR ALL 
  USING (auth.uid() = user_id);


-- 6. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  say INT DEFAULT 1,
  variant JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Cart Items RLS (User Own Only)
CREATE POLICY "User manage own cart" 
  ON public.cart_items FOR ALL 
  USING (auth.uid() = user_id);


-- 7. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  umumi_meblegh NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'yeni' CHECK (status IN ('yeni', 'hazirlanir', 'gonderildi', 'catdirildi', 'legv_edildi')),
  catdirilma_unvani TEXT NOT NULL,
  telefon TEXT NOT NULL,
  odenis_usulu TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders RLS (User Read Own, Admin All)
CREATE POLICY "User view own orders" 
  ON public.orders FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "User insert own orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admin update orders" 
  ON public.orders FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- 8. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  say INT DEFAULT 1,
  vahid_qiymet NUMERIC(10, 2) NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User view own order items" 
  ON public.order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "User insert order items" 
  ON public.order_items FOR INSERT 
  WITH CHECK (true);


-- 9. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  ulduz INT CHECK (ulduz >= 1 AND ulduz <= 5),
  metn TEXT NOT NULL,
  status TEXT DEFAULT 'gozlemede' CHECK (status IN ('gozlemede', 'tesdiqlendi', 'reddedildi')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews RLS: Public reads 'tesdiqlendi', User creates own, Admin full
CREATE POLICY "Public read confirmed reviews" 
  ON public.reviews FOR SELECT 
  USING (status = 'tesdiqlendi' OR auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "User insert own review" 
  ON public.reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admin update reviews status" 
  ON public.reviews FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- 10. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_soyad TEXT NOT NULL,
  email TEXT NOT NULL,
  telefon TEXT,
  movzu TEXT,
  mesaj TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Contact Messages RLS: Anyone can insert, Only admin can view/manage
CREATE POLICY "Anyone can submit contact message" 
  ON public.contact_messages FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admin view contact messages" 
  ON public.contact_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin manage contact messages" 
  ON public.contact_messages FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
