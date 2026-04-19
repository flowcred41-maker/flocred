import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'FLOCRED — Check Loan Eligibility from 50+ Banks | Know Before You Apply',
  description: 'Stop getting rejected. Check your exact loan eligibility from 50+ banks in 60 seconds. Free CIBIL score, instant personal loan, home loan & business loan eligibility. No documents, no credit score impact.',
  alternates: { canonical: 'https://flocred.com' },
};

export default function Page() { return <HomeClient />; }
