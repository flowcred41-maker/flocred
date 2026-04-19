import { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://flocred.com';
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/personal-loan`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/home-loan`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/business-loan`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/car-loan`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/loan-against-property`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/working-capital`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/cibil-score`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/emi-calculator`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/nri-loans`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/careers`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];
}
