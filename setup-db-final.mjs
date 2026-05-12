import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:Abdelrahman0208@[2a05:d018:1b65:3000:b76a:5d97:355c:eb1]:5432/postgres";

async function setupDatabase() {
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // SQL to create tables and set RLS
    const sql = `
      -- 1. Create Products Table
      CREATE TABLE IF NOT EXISTS public.products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        category TEXT,
        price NUMERIC NOT NULL,
        description TEXT,
        image_url TEXT,
        variants JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      -- 2. Create Orders Table
      CREATE TABLE IF NOT EXISTS public.orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone_number TEXT NOT NULL,
        class TEXT NOT NULL,
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        payment_method TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT now()
      );

      -- 3. Enable RLS
      ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

      -- 4. Create Policies for ANON role
      -- Products: Everyone can read, and for this project, anon can manage (simplified for dev)
      DROP POLICY IF EXISTS "Public Read Products" ON public.products;
      CREATE POLICY "Public Read Products" ON public.products FOR SELECT TO anon USING (true);
      
      DROP POLICY IF EXISTS "Anon Manage Products" ON public.products;
      CREATE POLICY "Anon Manage Products" ON public.products FOR ALL TO anon USING (true) WITH CHECK (true);

      -- Orders: Everyone can insert, but only admins (or anon for now) can read
      DROP POLICY IF EXISTS "Anon Insert Orders" ON public.orders;
      CREATE POLICY "Anon Insert Orders" ON public.orders FOR INSERT TO anon WITH CHECK (true);

      DROP POLICY IF EXISTS "Anon Read Orders" ON public.orders;
      CREATE POLICY "Anon Read Orders" ON public.orders FOR SELECT TO anon USING (true);

      -- 5. Grant Permissions
      GRANT ALL ON public.products TO anon;
      GRANT ALL ON public.orders TO anon;
      GRANT ALL ON public.products TO postgres;
      GRANT ALL ON public.orders TO postgres;
    `;

    console.log('Executing migration...');
    await client.query(sql);
    console.log('Migration completed successfully!');

  } catch (err) {
    console.error('Database setup FAILED:');
    console.error(err.message);
    if (err.code) console.error('Error Code:', err.code);
  } finally {
    await client.end();
  }
}

setupDatabase();
