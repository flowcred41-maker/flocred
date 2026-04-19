import type { Metadata } from 'next';
import Link from 'next/link';

interface FAQ { q: string; a: string; }
interface RateRow { score: string; rate: string; chance: string; color: string; action: string; }
interface EligGroup { label: string; items: string[]; }

export interface LoanPageProps {
  title: string;
  subtitle: string;
  rate: string;
  maxAmount: string;
  tenure: string;
  loanType: string;
  bullets: string[];
  faqs: FAQ[];
  eligibility?: EligGroup[];
  rateTable?: RateRow[];
  schema?: object;
  canonicalPath: string;
}

export function LoanPageFAQ({ faqs, loanType }: { faqs: FAQ[]; loanType: string }) {
  return (
    <section style={{ background: '#F5F0E8', padding: '64px 24px', position: 'relative', overflow: 'hidden' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }) }}/>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: '#C9A84C' }}>Questions?</span>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 700, color: '#0D0D0D', marginTop: 8 }}>{loanType} — Common Questions</h2>
        </div>
        <FAQList faqs={faqs}/>
      </div>
    </section>
  );
}

export function FAQList({ faqs }: { faqs: FAQ[] }) {
  // Server-side static — accordion handled via CSS details/summary
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {faqs.map((f, i) => (
        <details key={i} style={{ background: '#fff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 12, overflow: 'hidden' }}>
          <summary style={{ padding: '16px 20px', fontSize: 14, fontWeight: 500, color: '#0D0D0D', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {f.q}
            <span style={{ color: '#C9A84C', flexShrink: 0, marginLeft: 12 }}>+</span>
          </summary>
          <div style={{ padding: '0 20px 16px', fontSize: 13, lineHeight: 1.75, color: '#6B6459', borderTop: '1px solid rgba(0,0,0,.05)' }}>
            <p style={{ paddingTop: 12 }}>{f.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

export default function LoanPage({ title, subtitle, rate, maxAmount, tenure, loanType, bullets, faqs, eligibility, rateTable, schema, canonicalPath }: LoanPageProps) {
  return (
    <>
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>}

      {/* Hero */}
      <section className="min-h-[85vh] flex items-center pt-20 pb-12 relative overflow-hidden section-dark">
        <div className="blob blob-gold" style={{ width: '500px', height: '500px', top: '-100px', right: '-80px', opacity: .07 }}/>
        <div className="gold-ring" style={{ width: '200px', height: '200px', bottom: '60px', left: '40px' }}/>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-6 glass-light" style={{ color: 'rgba(245,240,232,.5)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C9A84C' }}/>
                50+ Bank Partners · Free Eligibility Check · No Score Impact
              </div>
              <h1 className="fade-up-d1 text-4xl sm:text-5xl font-bold leading-tight mb-5" style={{ color: '#F5F0E8' }}>{title}</h1>
              <p className="fade-up-d2 text-base sm:text-lg mb-8 leading-relaxed max-w-md" style={{ color: 'rgba(245,240,232,.5)' }}>{subtitle}</p>
              <ul className="space-y-2.5 mb-8">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(245,240,232,.7)' }}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" style={{ color: '#C9A84C' }} viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href="/contact" className="btn-gold px-7 py-3.5 rounded-2xl text-sm">
                  Check My Eligibility
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </Link>
                <a href="https://wa.me/919319369315" target="_blank" rel="noopener noreferrer" className="btn-ghost px-6 py-3.5 rounded-2xl text-sm">WhatsApp Us</a>
              </div>
            </div>
            <div className="fade-up-d2 grid grid-cols-3 gap-4">
              {[{ label: 'Starting Rate', value: rate }, { label: 'Max Amount', value: maxAmount }, { label: 'Max Tenure', value: tenure }].map(({ label, value }) => (
                <div key={label} className="glass rounded-2xl p-5 text-center">
                  <div className="text-2xl font-bold stat-num" style={{ color: '#C9A84C' }}>{value}</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(245,240,232,.35)' }}>{label}</div>
                </div>
              ))}
              <div className="col-span-3 glass rounded-2xl p-5">
                <div className="text-xs mb-1" style={{ color: 'rgba(245,240,232,.35)' }}>The FLOCRED Difference</div>
                <div className="text-sm font-semibold" style={{ color: '#F5F0E8' }}>Check your {loanType} eligibility across 50+ banks in 60 seconds — before you apply, so you never get rejected.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-5 border-y" style={{ background: '#0D0D0D', borderColor: 'rgba(201,168,76,.1)' }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px]" style={{ color: 'rgba(245,240,232,.3)' }}>
          {['RBI Compliant', '50+ Bank Partners', '256-bit SSL Encrypted', 'DPIIT Recognised', 'No Credit Score Impact'].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" style={{ color: '#C9A84C' }} viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Eligibility */}
      {eligibility && (
        <section className="py-16 px-4 section-light">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-semibold tracking-[.2em] uppercase" style={{ color: '#C9A84C' }}>Eligibility</span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2" style={{ color: '#0D0D0D' }}>{loanType} Eligibility Criteria</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {eligibility.map(group => (
                <div key={group.label} className="glass-warm p-6 rounded-2xl">
                  <h3 className="font-bold text-lg mb-4" style={{ color: '#0D0D0D' }}>{group.label}</h3>
                  <ul className="space-y-3">
                    {group.items.map(item => (
                      <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#6B6459' }}>
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" style={{ color: '#C9A84C' }} viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Rate table */}
      {rateTable && (
        <section className="py-16 px-4 section-warm">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-xs font-semibold tracking-[.2em] uppercase" style={{ color: '#C9A84C' }}>Live Rates</span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2" style={{ color: '#0D0D0D' }}>{loanType} Rates by CIBIL Score</h2>
              <p className="text-sm mt-2" style={{ color: '#6B6459' }}>Indicative ranges. Your exact rate depends on your score, income, and employer.</p>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,.07)' }}>
              <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                <thead style={{ background: '#0D0D0D', color: '#F5F0E8' }}>
                  <tr>{['CIBIL Score', 'Interest Rate', 'Approval Chance', 'Recommended Action'].map(h => <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '.05em' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rateTable.map(row => (
                    <tr key={row.score} style={{ borderBottom: '1px solid rgba(0,0,0,.05)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0D0D0D' }}>{row.score}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#C9A84C', fontWeight: 600 }}>{row.rate}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: row.color }}>{row.chance}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B6459' }}>{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#6B6459' }}>
              Score below 700? <Link href="/cibil-score#boost" style={{ color: '#C9A84C', fontWeight: 600 }}>Use CIBIL Boost first — save lakhs in interest →</Link>
            </p>
          </div>
        </section>
      )}

      {/* FAQ */}
      <LoanPageFAQ faqs={faqs} loanType={loanType}/>

      {/* CTA */}
      <section className="py-16 px-4 section-dark" style={{ position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(201,168,76,.08),transparent 70%)', top: '-100px', left: '50%', transform: 'translateX(-50%)', borderRadius: '50%', pointerEvents: 'none' }}/>
        <div className="max-w-2xl mx-auto relative z-10">
          <span className="text-xs font-semibold tracking-[.2em] uppercase" style={{ color: '#C9A84C' }}>Start Today</span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2 mb-3" style={{ color: '#F5F0E8' }}>Check your {loanType.toLowerCase()} eligibility in 60 seconds</h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(245,240,232,.4)' }}>Free · No documents · No CIBIL score impact</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-gold px-8 py-3.5 rounded-2xl text-sm">
              Check My {loanType} Eligibility
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
            <a href="https://wa.me/919319369315?text=Hi+I+want+to+check+my+loan+eligibility" target="_blank" rel="noopener noreferrer" className="btn-ghost px-8 py-3.5 rounded-2xl text-sm">WhatsApp Us</a>
          </div>
        </div>
      </section>
    </>
  );
}
