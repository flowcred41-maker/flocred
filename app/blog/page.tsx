import type { Metadata } from 'next';
import HomeClient from '@/app/HomeClient';
export const metadata: Metadata = { title: 'FLOCRED' };
export default function Page() { return <HomeClient />; }
