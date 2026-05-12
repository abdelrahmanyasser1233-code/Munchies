import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Abdelrahman0208@db.wpxuydfourdzanmvnhvs.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL');

    // List existing tables
    const existing = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
    `);
    console.log('\n📋 Existing public tables:', existing.rows.map(r => r.tablename).join(', ') || '(none)');

    // Create products table
    console.log('\n🔧 Creating products table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.products (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        price NUMERIC(10, 2) NOT NULL DEFAULT 0,
        description TEXT,
        image_url TEXT,
        variants JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('   ✅ products table created');

    // Create orders table
    console.log('🔧 Creating orders table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        phone_number TEXT NOT NULL,
        class TEXT,
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        payment_method TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('   ✅ orders table created');

    // Enable RLS and add permissive policies
    console.log('\n🔒 Setting up RLS policies...');

    // Products RLS
    await client.query(`ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;`);
    
    // Drop existing policies to avoid conflicts
    const productPolicies = ['Allow public read products', 'Allow public insert products', 'Allow public update products', 'Allow public delete products'];
    for (const p of productPolicies) {
      await client.query(`DROP POLICY IF EXISTS "${p}" ON public.products;`);
    }
    
    await client.query(`CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);`);
    await client.query(`CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);`);
    await client.query(`CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);`);
    await client.query(`CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);`);
    console.log('   ✅ products RLS policies set');

    // Orders RLS
    await client.query(`ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;`);
    
    const orderPolicies = ['Allow public read orders', 'Allow public insert orders'];
    for (const p of orderPolicies) {
      await client.query(`DROP POLICY IF EXISTS "${p}" ON public.orders;`);
    }

    await client.query(`CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);`);
    await client.query(`CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);`);
    console.log('   ✅ orders RLS policies set');

    // Create storage bucket for product images
    console.log('\n📦 Setting up storage...');
    try {
      await client.query(`
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('products', 'products', true) 
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('   ✅ Storage bucket "products" created (public)');

      // Add a permissive storage policy
      await client.query(`DROP POLICY IF EXISTS "Allow public uploads to products" ON storage.objects;`);
      await client.query(`
        CREATE POLICY "Allow public uploads to products"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'products');
      `);
      await client.query(`DROP POLICY IF EXISTS "Allow public read products objects" ON storage.objects;`);
      await client.query(`
        CREATE POLICY "Allow public read products objects"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'products');
      `);
      console.log('   ✅ Storage policies set');
    } catch (e) {
      console.log('   ⚠️ Storage setup skipped:', e.message);
    }

    // Verify tables
    console.log('\n🔍 Verifying...');
    const tables = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('products', 'orders') ORDER BY tablename;
    `);
    console.log('   Tables found:', tables.rows.map(r => r.tablename).join(', '));

    // Check columns
    const prodCols = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'products' ORDER BY ordinal_position;
    `);
    console.log('\n   products columns:');
    prodCols.rows.forEach(c => console.log(`     - ${c.column_name}: ${c.data_type}`));

    const orderCols = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'orders' ORDER BY ordinal_position;
    `);
    console.log('\n   orders columns:');
    orderCols.rows.forEach(c => console.log(`     - ${c.column_name}: ${c.data_type}`));

    // Test insert and delete a product
    console.log('\n🧪 Testing CRUD...');
    const insertRes = await client.query(`
      INSERT INTO public.products (name, price, category, description)
      VALUES ('Test Item', 10, 'Test', 'Test description')
      RETURNING id, name;
    `);
    console.log('   ✅ Insert works:', insertRes.rows[0]);

    await client.query(`DELETE FROM public.products WHERE id = $1`, [insertRes.rows[0].id]);
    console.log('   ✅ Delete works');

    console.log('\n🎉 Database setup complete! All tables ready.');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
