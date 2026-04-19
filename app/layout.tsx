import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://flocred.com'),
  title: {
    default: 'FLOCRED — Check Loan Eligibility from 50+ Banks | Personal, Home & Business Loans India',
    template: '%s | FLOCRED',
  },
  description: 'Check your real loan eligibility in 2 minutes — no documents, no CIBIL score hit. Compare personal loan, home loan, business loan rates from 50+ banks. DPIIT recognised. Delhi & Mumbai.',
  keywords: ['loan eligibility check India','CIBIL score check free','personal loan eligibility','home loan eligibility calculator','business loan approval','FLOCRED','loan aggregator India'],
  openGraph: { type:'website', siteName:'FLOCRED', title:'FLOCRED — Know Your Loan Limit Before You Apply', description:'Stop getting rejected. Check your real loan eligibility from 50+ banks in 2 minutes.', url:'https://flocred.com', locale:'en_IN' },
  twitter: { card:'summary_large_image', site:'@flocred' },
  robots: { index:true, follow:true, googleBot:{ index:true, follow:true, 'max-image-preview':'large' } },
  alternates: { canonical:'https://flocred.com' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="theme-color" content="#0D0D0D"/>
        <meta name="geo.region" content="IN-DL"/>
        <meta name="geo.placename" content="Delhi, India"/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context':'https://schema.org','@type':'Organization',
          name:'FLOCRED Private Limited',url:'https://flocred.com',
          logo:'https://flocred.com/logo-new.png',foundingDate:'2022',
          address:{'@type':'PostalAddress',addressLocality:'Delhi',addressRegion:'DL',addressCountry:'IN'},
          contactPoint:[
            {'@type':'ContactPoint',telephone:'+91-9319369315',contactType:'customer service',areaServed:'IN',availableLanguage:['English','Hindi']},
            {'@type':'ContactPoint',email:'support@flocred.com',contactType:'customer support'},
          ],
        }) }}/>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
