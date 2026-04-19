'use client';
import dynamic from 'next/dynamic';
const AdminClient = dynamic(() => import('./AdminClient'), { ssr: false, loading: () => (
  <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ color: '#C9A84C', fontFamily: 'Fraunces,serif', fontSize: 18 }}>Loading CRM...</div>
  </div>
) });
export default function AdminPage() { return <AdminClient />; }
