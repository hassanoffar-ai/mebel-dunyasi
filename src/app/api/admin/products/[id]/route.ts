import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Removes a product and its related records.  Doing this on the server keeps
 * the admin panel independent from the database's individual FK definitions.
 */
export async function DELETE(_: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: 'Məhsul ID-si düzgün deyil.' }, { status: 400 });
  }

  try {
    // These tables can reference a product in databases created from older
    // schema versions, where cascade rules may not yet exist.
    for (const table of ['product_images', 'favorites', 'cart_items', 'reviews']) {
      const { error } = await supabaseAdmin.from(table).delete().eq('product_id', id);
      if (error) throw error;
    }

    // Preserve order history while removing its link to the deleted product.
    const { error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .update({ product_id: null })
      .eq('product_id', id);
    if (orderItemsError) throw orderItemsError;

    const { error: productError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);
    if (productError) throw productError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin product delete error:', error);
    return NextResponse.json(
      { error: error?.message || 'Məhsul silinə bilmədi.' },
      { status: 400 },
    );
  }
}
