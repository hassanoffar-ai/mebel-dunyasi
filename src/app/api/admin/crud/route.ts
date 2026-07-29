import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

function cleanCategoryPayload(data: any) {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map((item) => {
      const copy = { ...item };
      delete copy.description;
      delete copy.qisa_teswir;
      return copy;
    });
  }
  const copy = { ...data };
  delete copy.description;
  delete copy.qisa_teswir;
  return copy;
}

export async function POST(req: Request) {
  try {
    const { table, data } = await req.json();

    if (!table || !data) {
      return NextResponse.json({ error: 'Cədvəl və verilənlər tələb olunur' }, { status: 400 });
    }

    const payload = table === 'categories' ? cleanCategoryPayload(data) : data;
    const inputData = Array.isArray(payload) ? payload : [payload];

    let { data: result, error } = await supabaseAdmin
      .from(table)
      .insert(inputData)
      .select();

    // Fallback for categories schema variations
    if (error && table === 'categories' && inputData.length > 0) {
      const item = inputData[0];
      const img = item.sekil_url || item.image_url || '';
      const name = item.ad || item.name || '';
      const sira = item.sira || item.order || 1;

      const attempts = [
        { ad: name, sekil_url: img, sira },
        { ad: name, image_url: img, sira },
        { ad: name, sekil_url: img },
        { ad: name, image_url: img },
        { name: name, image_url: img },
      ];

      for (const attemptPayload of attempts) {
        const { data: fbData, error: fbErr } = await supabaseAdmin
          .from('categories')
          .insert([attemptPayload])
          .select();

        if (!fbErr && fbData) {
          result = fbData;
          error = null;
          break;
        }
      }
    }

    if (error) {
      console.error(`Admin CRUD Insert Error in ${table}:`, error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Admin CRUD Exception:', err);
    return NextResponse.json({ error: err.message || 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { table, id, data } = await req.json();

    if (!table || !id || !data) {
      return NextResponse.json({ error: 'Cədvəl, ID və yenilənəcək verilənlər tələb olunur' }, { status: 400 });
    }

    const payload = table === 'categories' ? cleanCategoryPayload(data) : data;

    let { data: result, error } = await supabaseAdmin
      .from(table)
      .update(payload)
      .eq('id', id)
      .select();

    // Fallback for categories schema variations
    if (error && table === 'categories') {
      const img = payload.sekil_url || payload.image_url || '';
      const name = payload.ad || payload.name || '';
      const sira = payload.sira || payload.order || 1;

      const attempts = [
        { ad: name, sekil_url: img, sira },
        { ad: name, image_url: img, sira },
        { ad: name, sekil_url: img },
        { ad: name, image_url: img },
        { name: name, image_url: img },
      ];

      for (const attemptPayload of attempts) {
        const { data: fbData, error: fbErr } = await supabaseAdmin
          .from('categories')
          .update(attemptPayload)
          .eq('id', id)
          .select();

        if (!fbErr && fbData) {
          result = fbData;
          error = null;
          break;
        }
      }
    }

    if (error) {
      console.error(`Admin CRUD Update Error in ${table}:`, error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Admin CRUD Exception:', err);
    return NextResponse.json({ error: err.message || 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get('table');
    const id = searchParams.get('id');
    const column = searchParams.get('column') || (table === 'product_images' ? 'product_id' : 'id');

    if (!table || !id) {
      return NextResponse.json({ error: 'Cədvəl adı və ID tələb olunur' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq(column, id);

    if (error) {
      console.error(`Admin CRUD Delete Error in ${table}:`, error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin CRUD Delete Exception:', err);
    return NextResponse.json({ error: err.message || 'Xəta baş verdi' }, { status: 500 });
  }
}
