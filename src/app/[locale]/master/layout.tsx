'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // 检查是否已登录
    const token = sessionStorage.getItem('admin-token');
    if (!token) {
      router.push('/master');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}