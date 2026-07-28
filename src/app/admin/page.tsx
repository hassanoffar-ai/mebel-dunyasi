'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/sifarisler');
  }, [router]);

  return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-sub)' }}>Sifarişlər bölməsinə yönləndirilir...</div>;
}
