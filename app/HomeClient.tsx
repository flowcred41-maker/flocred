'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { saveLead, saveNRI } from '@/lib/supabase';

const C = {
  bg: '#FFFFFF',
  bg2: '#F8F7F4',
  bg3: '#F0EDE8',
  dark: '#1A1A2E',
  gold: '#B8860B',
  goldLight: '#DAA520',
  goldBg: '#FFF8E7',
  text: '#1A1A2E',
  textMid: '#4A4A6A',
  textLight: '#8A8AAA',
  border: '#E8E4DC',
  white: '#FFFFFF',
  green: '#16A34A',
  red: '#DC2626',
};

const S = {
  section: (bg = C.bg, color = C.text) => ({
    background: bg, color, padding: '80px 0',
  }),
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
  label: { fontSize: 11, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase' as const, color: C.gold, marginBottom: 10 },
  h2: { fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: C.dark, lineHeight: 1.15, marginBottom: 16, fontFamily: 'Fraunces,Georgia,serif' },
  h3: { fontSize: 22, fontWeight: 700, color: C.dark, marginBottom: 10, fontFamily: 'Fraunces,Georgia,serif' },
  body: { fontSize: 16, color: C.textMid, lineHeight: 1.7 },
  small: { fontSize: 13, color: C.textLight, lineHeight: 1.6 },
  card: { background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,.06)' },
  cardGold: { background: C.goldBg, border: `1px solid rgba(184,134,11,.2)`, borderRadius: 16, padding: '28px 24px' },
  btnGold: { background: C.gold, color: C.white, border: 'none', borderRadius: 10, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontFamily: 'Inter,system-ui', transition: 'all .15s' },
  btnOutline: { background: 'transparent', color: C.dark, border: `2px solid ${C.border}`, borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontFamily: 'Inter,system-ui' },
  input: { background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', fontSize: 14, color: C.dark, outline: 'none', width: '100%', fontFamily: 'Inter,system-ui', boxSizing: 'border-box' as const },
  inputDark: { background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.2)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: C.white, outline: 'none', width: '100%', fontFamily: 'Inter,system-ui', boxSizing: 'border-box' as const },
  grid2: (gap = 40) => ({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap, alignItems: 'start' }),
  grid3: (gap = 24) => ({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap }),
  grid4: (gap = 20) => ({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap }),
  flex: (gap = 12, align = 'center') => ({ display: 'flex', alignItems: align, gap }),
  tag: (color = C.gold) => ({ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' as const, padding: '4px 10px', borderRadius: 6, background: color === C.gold ? C.goldBg : 'rgba(22,163,74,.1)', color, border: `1px solid ${color === C.gold ? 'rgba(184,134,11,.2)' : 'rgba(22,163,74,.2)'}` }),
};

export default function HomeClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('ok');
  const [loading, setLoading] = useState(false);
  const [calcAmount, setCalcAmount] = useState(1000000);
  const [calcRate, setCalcRate] = useState(10.5);
  const [calcTenure, setCalcTenure] = useState(60);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [nriDone, setNriDone] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [liveRates, setLiveRates] = useState({ pl: '10.49', hl: '8.40', bl: '10.75', cl: '8.65' });
  const [billing, setBilling] = useState<'monthly'|'quarterly'|'yearly'>('monthly');

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    import('@/lib/supabase').then(({ getLiveRates }) => {
      getLiveRates().then((data: {product:string;min_rate:number}[]) => {
        if (!data.length) return;
        const r: Record<string,number> = {};
        data.forEach(row => { if (!r[row.product] || row.min_rate < r[row.product]) r[row.product] = row.min_rate; });
        setLiveRates({ pl: r.personal_loan?.toFixed(2) || '10.49', hl: r.home_loan?.toFixed(2) || '8.40', bl: r.business_loan?.toFixed(2) || '10.75', cl: r.car_loan?.toFixed(2) || '8.65' });
      });
    });
  }, []);

  const showToast = (msg: string, type = 'ok') => { setToast(msg); setToastType(type); setTimeout(() => setToast(''), 4000); };

  const r = calcRate / 100 / 12, n = calcTenure;
  const emi = Math.round(calcAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
  const totalPay = emi * n;
  const totalInt = totalPay - calcAmount;
  const fmt = (v: number) => v >= 10000000 ? `₹${(v / 10000000).toFixed(2)}Cr` : v >= 100000 ? `₹${(v / 100000).toFixed(2)}L` : `₹${Math.round(v).toLocaleString('en-IN')}`;

  async function handleQuick(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true);
    const fd = new FormData(e.currentTarget);
    await saveLead({ name: fd.get('name') as string, phone: fd.get('phone') as string, loan_type: fd.get('loan_type') as string, amount: fd.get('income') as string, source: 'website_hero', notes: `Employment: ${fd.get('employment')} | Income: ₹${fd.get('income')}` });
    showToast('✓ Submitted! We will call you within 30 minutes.');
    (e.target as HTMLFormElement).reset(); setLoading(false);
  }

  async function handleContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await saveLead({ name: fd.get('name') as string, phone: fd.get('phone') as string, email: fd.get('email') as string, loan_type: fd.get('loan_type') as string, amount: fd.get('amount') as string, source: 'website_contact', notes: fd.get('message') as string });
    showToast('✓ Application submitted! Our team will contact you within 30 minutes.');
    (e.target as HTMLFormElement).reset();
  }

  async function handleNRI(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await saveNRI({ name: fd.get('name') as string, email: fd.get('email') as string, phone: fd.get('phone') as string, country: fd.get('country') as string, product: fd.get('product') as string });
    setNriDone(true); showToast('✓ Added to NRI waitlist!');
  }

  const PRICES = { basic: { monthly: 299, quarterly: 749, yearly: 2499 }, pro: { monthly: 1299, quarterly: 3249, yearly: 10999 }, enterprise: { monthly: 4999, quarterly: 12499, yearly: 42999 } };

  const PRODUCTS = [
    { name: 'Personal Loan', rate: liveRates.pl, max: 'Up to ₹50L', href: '/personal-loan', icon: '👤' },
    { name: 'Business Loan', rate: liveRates.bl, max: 'Up to ₹5Cr', href: '/business-loan', icon: '💼' },
    { name: 'Home Loan', rate: liveRates.hl, max: 'Up to ₹10Cr', href: '/home-loan', icon: '🏠' },
    { name: 'Loan Against Property', rate: '9.25', max: 'Up to 70% LTV', href: '/loan-against-property', icon: '🏢' },
    { name: 'Car Loan', rate: liveRates.cl, max: 'Up to 90% on-road', href: '/car-loan', icon: '🚗' },
    { name: 'Working Capital', rate: '10.50', max: 'OD/CC facility', href: '/working-capital', icon: '⚡' },
    { name: 'Overdraft', rate: '10.00', max: 'OD facility', href: '/working-capital', icon: '💳' },
    { name: 'Micro Loan', rate: '20.00', max: 'Small ticket', href: '/personal-loan', icon: '💰' },
  ];

  const STEPS = [
    { n: '01', title: 'Tell us the basics', body: 'Name, income, what you need. No bank statements, no salary slips, no Aadhaar scan. Just 60 seconds.', stats: [['60s', 'Total time'], ['0', 'Documents needed']] },
    { n: '02', title: 'We run the numbers', body: 'Your CIBIL score, what banks allow on your income, your existing EMI load — we calculate the exact amount a bank will approve.', stats: [['50+', 'Banks checked'], ['Live', 'CIBIL data']] },
    { n: '03', title: 'You apply only where you qualify', body: 'We show you your approved list — ranked by rate, tenure, and approval speed. One application. No fishing.', stats: [['98%', 'Accuracy rate'], ['2 min', 'Total time']] },
  ];

  const FAQS = [
    ['Does checking eligibility affect my CIBIL score?', 'No. We use a soft inquiry which is invisible to banks and does not affect your score. Only a hard inquiry (when you actually apply) shows up.'],
    ['How is FLOCRED different from BankBazaar or PaisaBazaar?', 'They show you rates. We tell you which loans you will actually get approved for, and at what amount — before you apply. No rejection risk.'],
    ['How quickly can I get a loan?', 'For personal loans: 2-24 hours after document submission. Home loans typically take 7-15 days. Business loans 3-7 days depending on the bank.'],
    ['Is my data safe?', 'Yes. We use 256-bit SSL encryption, are RBI compliant, and never sell your data to third parties. You can delete your data anytime.'],
    ['What if my CIBIL score is low?', 'We have lenders who approve scores as low as 600. We also have a CIBIL Boost program that lifts scores 50-200 points in 3-6 months.'],
  ];

  const nav: { label: string; href: string }[] = [
    { label: 'Check Eligibility', href: '#eligibility' },
    { label: 'CIBIL Score', href: '#cibil' },
    { label: 'Products', href: '#products' },
    { label: 'EMI Calculator', href: '#calculator' },
    { label: 'Careers', href: '/careers' },
  ];

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, background: toastType === 'ok' ? C.dark : C.red, color: C.white, padding: '14px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,.2)', maxWidth: 360 }}>
          {toast}
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,.97)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ ...S.container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <a href="/" style={{ fontFamily: 'Fraunces,Georgia,serif', fontSize: 22, fontWeight: 800, color: C.gold, textDecoration: 'none', letterSpacing: '-.02em' }}>FLOCRED</a>
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {nav.map(n => (
                <a key={n.label} href={n.href} style={{ padding: '7px 12px', fontSize: 13, fontWeight: 500, color: C.textMid, borderRadius: 8, textDecoration: 'none' }}>{n.label}</a>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isMobile && <a href="tel:+919319369315" style={{ fontSize: 13, color: C.textLight, textDecoration: 'none' }}>+91-9319369315</a>}
            <a href="#eligibility" style={{ ...S.btnGold, padding: '9px 18px', fontSize: 13 }}>Check Eligibility</a>
            {isMobile && (
              <button onClick={() => setMobileNav(!mobileNav)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                <div style={{ width: 20, height: 2, background: C.dark, marginBottom: 5 }}/>
                <div style={{ width: 20, height: 2, background: C.dark, marginBottom: 5 }}/>
                <div style={{ width: 20, height: 2, background: C.dark }}/>
              </button>
            )}
          </div>
        </div>
        {mobileNav && isMobile && (
          <div style={{ background: C.white, borderTop: `1px solid ${C.border}`, padding: '12px 24px' }}>
            {nav.map(n => <a key={n.label} href={n.href} style={{ display: 'block', padding: '10px 0', fontSize: 14, color: C.textMid, textDecoration: 'none', borderBottom: `1px solid ${C.border}` }} onClick={() => setMobileNav(false)}>{n.label}</a>)}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="eligibility" style={{ background: C.dark, paddingTop: 64, paddingBottom: 0, minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ ...S.container, padding: '60px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 56, alignItems: 'center' }}>
            {/* Left */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(184,134,11,.15)', border: '1px solid rgba(184,134,11,.3)', borderRadius: 20, padding: '5px 14px', marginBottom: 24 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.goldLight, display: 'inline-block' }}/>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.goldLight }}>DPIIT Recognised · 50+ Banks · Startup India</span>
              </div>
              <h1 style={{ fontSize: 'clamp(36px,5vw,58px)', fontWeight: 900, color: C.white, lineHeight: 1.05, marginBottom: 20, fontFamily: 'Fraunces,Georgia,serif' }}>
                Stop Getting<br/>
                <span style={{ color: C.goldLight }}>Rejected.</span><br/>
                Know First.
              </h1>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,.65)', lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
                Most people apply and then find out they don't qualify. We flip that. Enter your details, get your real number, then apply only where you'll be approved — <strong style={{ color: C.white }}>in under 2 minutes</strong>.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
                <a href="#eligibility" style={{ ...S.btnGold, padding: '14px 28px', fontSize: 15 }}>
                  See How Much I Qualify For →
                </a>
                <a href="#cibil" style={{ background: 'rgba(255,255,255,.1)', color: C.white, border: '1.5px solid rgba(255,255,255,.2)', borderRadius: 10, padding: '13px 22px', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                  Check CIBIL Score
                </a>
              </div>
              <div style={{ display: 'flex', gap: 36 }}>
                {[['50+', 'Banks Checked'], ['2 min', "That's all it takes"], ['Free', 'Zero cost to start']].map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: C.white, fontFamily: 'Fraunces,Georgia,serif' }}>{v}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form card */}
            <div>
              <div style={{ background: C.white, borderRadius: 20, padding: isMobile ? 24 : 36, boxShadow: '0 24px 80px rgba(0,0,0,.4)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.dark, fontFamily: 'Fraunces,Georgia,serif', marginBottom: 4 }}>What's your real loan limit?</div>
                  <div style={{ fontSize: 13, color: C.textLight }}>60 seconds · No documents · No CIBIL hit</div>
                </div>
                <form onSubmit={handleQuick} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input name="name" required placeholder="Full Name" style={S.input}/>
                  <input name="phone" required placeholder="Mobile Number" style={S.input} maxLength={10} pattern="[0-9]{10}"/>
                  <select name="employment" required style={{ ...S.input, appearance: 'none' as unknown as undefined }}>
                    <option value="">Employment Type</option>
                    {['Salaried (Private)', 'Salaried (Govt/PSU)', 'Self Employed Business', 'Self Employed Professional', 'Freelancer', 'Student', 'Retired'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <input name="income" required placeholder="Monthly Income (₹)" style={S.input} type="number"/>
                  <select name="loan_type" required style={{ ...S.input, appearance: 'none' as unknown as undefined }}>
                    <option value="">Loan Type Needed</option>
                    {['personal_loan', 'business_loan', 'home_loan', 'car_loan', 'lap', 'working_capital'].map(v => <option key={v} value={v}>{v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                  </select>
                  <input name="pan" placeholder="PAN Number (optional, for faster check)" style={S.input} maxLength={10}/>
                  <button type="submit" disabled={loading} style={{ ...S.btnGold, width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, borderRadius: 10, opacity: loading ? .7 : 1 }}>
                    {loading ? 'Checking...' : 'Show Me My Loan Limit →'}
                  </button>
                  <div style={{ fontSize: 11, textAlign: 'center', color: C.textLight, marginTop: 4 }}>
                    🔒 We don't sell your data. Period.
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section style={{ background: C.bg2, borderBottom: `1px solid ${C.border}`, padding: '20px 0' }}>
        <div style={{ ...S.container, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 20 : 48, flexWrap: 'wrap' }}>
          {[['✓', 'RBI Compliant Platform'], ['✓', '50+ Bank Partners'], ['✓', '256-bit SSL Encrypted'], ['✓', 'CIN: U67100DL2022PTC400764'], ['✓', 'Startup India Registered']].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, color: C.green, fontWeight: 700 }}>{icon}</span>
              <span style={{ fontSize: 13, color: C.textMid, fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE PROCESS ── */}
      <section style={S.section(C.bg2)}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={S.label}>THE PROCESS</div>
            <h2 style={S.h2}>No branch visits. No guesswork.</h2>
            <p style={{ ...S.body, maxWidth: 520, margin: '0 auto' }}>Most loan rejections happen because people apply blind. We fix that.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {STEPS.map((step, i) => (
              <div key={step.n} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : i % 2 === 0 ? '1fr 1fr' : '1fr 1fr', gap: 0, background: C.white, borderRadius: i === 0 ? '16px 16px 0 0' : i === STEPS.length - 1 ? '0 0 16px 16px' : 0, border: `1px solid ${C.border}`, borderBottom: i < STEPS.length - 1 ? 'none' : `1px solid ${C.border}` }}>
                <div style={{ padding: isMobile ? '32px 24px' : '48px 48px', order: isMobile ? 1 : (i % 2 === 0 ? 1 : 2) }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.15em', color: C.gold, marginBottom: 8 }}>STEP {step.n}</div>
                  <h3 style={{ ...S.h3, fontSize: 24, marginBottom: 12 }}>{step.title}</h3>
                  <p style={{ ...S.body, marginBottom: 24 }}>{step.body}</p>
                  <div style={{ display: 'flex', gap: 32 }}>
                    {step.stats.map(([v, l]) => (
                      <div key={l}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: C.dark, fontFamily: 'Fraunces,Georgia,serif' }}>{v}</div>
                        <div style={{ fontSize: 12, color: C.textLight }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: C.goldBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, order: isMobile ? 2 : (i % 2 === 0 ? 2 : 1), borderLeft: isMobile ? 'none' : (i % 2 === 0 ? `1px solid rgba(184,134,11,.1)` : 'none'), borderRight: isMobile ? 'none' : (i % 2 !== 0 ? `1px solid rgba(184,134,11,.1)` : 'none'), minHeight: 200 }}>
                  <span style={{ fontSize: 80, fontWeight: 900, color: 'rgba(184,134,11,.12)', fontFamily: 'Fraunces,Georgia,serif' }}>{step.n}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CIBIL PLANS ── */}
      <section id="cibil" style={S.section(C.dark)}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ ...S.label, color: C.goldLight }}>YOUR CREDIT SCORE</div>
            <h2 style={{ ...S.h2, color: C.white }}>A low CIBIL score costs you <span style={{ color: C.goldLight }}>lakhs in higher interest.</span></h2>
            <p style={{ ...S.body, color: 'rgba(255,255,255,.5)', maxWidth: 520, margin: '0 auto 32px' }}>Get your official report, find out exactly where you stand, and if your score needs work — we'll fix that too.</p>
            <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,.07)', borderRadius: 10, padding: 4, gap: 4 }}>
              {(['monthly', 'quarterly', 'yearly'] as const).map(b => (
                <button key={b} onClick={() => setBilling(b)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: billing === b ? C.gold : 'transparent', color: billing === b ? C.white : 'rgba(255,255,255,.5)', position: 'relative' }}>
                  {b.charAt(0).toUpperCase() + b.slice(1)}
                  {b === 'yearly' && <span style={{ position: 'absolute', top: -8, right: -4, background: C.green, color: C.white, fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4 }}>30%</span>}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 20 }}>
            {([
              { key: 'basic', name: 'Basic', desc: 'Checking your own score', color: false },
              { key: 'pro', name: 'Pro', desc: 'Serious borrowers & loan agents', color: true },
              { key: 'enterprise', name: 'Enterprise', desc: 'Companies & high-volume agents', color: false },
            ] as const).map(plan => (
              <div key={plan.key} style={{ background: plan.color ? C.gold : 'rgba(255,255,255,.05)', border: `1px solid ${plan.color ? C.gold : 'rgba(255,255,255,.1)'}`, borderRadius: 16, padding: 28, position: 'relative' }}>
                {plan.color && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: C.green, color: C.white, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>Most Popular</div>}
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: plan.color ? C.white : C.goldLight, marginBottom: 6 }}>{plan.name.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: plan.color ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.4)', marginBottom: 16 }}>{plan.desc}</div>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: C.white, fontFamily: 'Fraunces,Georgia,serif' }}>₹{PRICES[plan.key][billing].toLocaleString('en-IN')}</span>
                  <span style={{ fontSize: 13, color: plan.color ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.4)', marginLeft: 6 }}>/{billing === 'monthly' ? 'mo' : billing === 'quarterly' ? 'qtr' : 'yr'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {(plan.key === 'basic'
                    ? ['3 eligibility checks/month', 'CIBIL Score + PDF Report', 'PAN Verification', 'EMI Calculator', 'Loan eligibility across all types']
                    : plan.key === 'pro'
                    ? ['8 eligibility checks/month', 'All 4 Credit Bureaus', 'PDF Credit Expert Report', 'CIBIL Boost included', 'Multi-lender matching', 'WhatsApp notifications']
                    : ['50 eligibility checks/month', 'All 4 Credit Bureaus', 'Full KYC Suite', 'Team dashboard (5 users)', 'White-label reports', 'Dedicated account manager', 'API Access']
                  ).map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: plan.color ? C.white : 'rgba(255,255,255,.75)' }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <a href="#eligibility" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 10, background: plan.color ? C.white : 'rgba(255,255,255,.1)', color: plan.color ? C.gold : C.white, fontWeight: 700, fontSize: 14, textDecoration: 'none', border: plan.color ? 'none' : '1px solid rgba(255,255,255,.15)' }}>
                  Get {plan.name} Plan
                </a>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: '20px 32px' }}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,.5)' }}>Score below 700? Don't apply anywhere yet. Our CIBIL Boost program lifts it 50-200 points in 3-6 months before you apply. Free with Pro and Enterprise.</span>
            {' '}<a href="/cibil-score" style={{ color: C.goldLight, fontWeight: 600, textDecoration: 'none' }}>Learn More →</a>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" style={S.section(C.bg)}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={S.label}>WHAT DO YOU NEED?</div>
            <h2 style={S.h2}>Every loan type. Rates from 50+ banks.</h2>
            <p style={{ ...S.body, maxWidth: 520, margin: '0 auto' }}>We show you which bank gives you the best rate for your profile — not just the lowest advertised rate.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: 16 }}>
            {PRODUCTS.map(p => (
              <a key={p.name} href={p.href} style={{ ...S.card, textDecoration: 'none', display: 'block', transition: 'all .2s' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{p.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 4, fontFamily: 'Fraunces,Georgia,serif' }}>{p.name}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.gold, fontFamily: 'Fraunces,Georgia,serif' }}>{p.rate}%</div>
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>p.a. | {p.max}</div>
                <div style={{ marginTop: 14, fontSize: 13, color: C.gold, fontWeight: 600 }}>Apply Now →</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXCLUSIVE PRODUCTS ── */}
      <section style={S.section(C.dark)}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ ...S.label, color: C.goldLight }}>YOU WON'T FIND THESE ANYWHERE ELSE</div>
            <h2 style={{ ...S.h2, color: C.white }}>We built three things <span style={{ color: C.goldLight }}>the industry refused to.</span></h2>
            <p style={{ ...S.body, color: 'rgba(255,255,255,.5)', maxWidth: 480, margin: '0 auto' }}>Not features. Actual products that protect borrowers — which is why no one else offers them.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 3, borderRadius: 20, overflow: 'hidden', border: `1px solid rgba(184,134,11,.15)` }}>
            {/* Featured */}
            <div style={{ background: 'rgba(184,134,11,.08)', padding: 40, gridRow: isMobile ? 'auto' : '1 / 3', borderRight: isMobile ? 'none' : `1px solid rgba(184,134,11,.12)` }}>
              <div style={{ ...S.tag(), marginBottom: 20 }}>✦ EXCLUSIVE TO FLOCRED</div>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📅</div>
              <h3 style={{ ...S.h3, color: C.white, fontSize: 28 }}>Holiday In EMI</h3>
              <p style={{ ...S.body, color: 'rgba(255,255,255,.55)', marginBottom: 24 }}>Your loan disburses on a Tuesday. You shouldn't have to pay EMI by next month. With EMI Holiday, your first payment starts 3-6 months later — giving you time to actually use the money.</p>
              <div style={{ display: 'flex', gap: 24, marginBottom: 28 }}>
                {[['3-6', 'Months free'], ['All', 'Loan types']].map(([v, l]) => (
                  <div key={l} style={{ background: 'rgba(184,134,11,.12)', borderRadius: 10, padding: '12px 20px' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: C.goldLight, fontFamily: 'Fraunces,Georgia,serif' }}>{v}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{l}</div>
                  </div>
                ))}
              </div>
              <a href="#eligibility" style={{ ...S.btnGold }}>Apply Now →</a>
            </div>
            {/* Top right */}
            <div style={{ background: 'rgba(255,255,255,.03)', padding: 32, borderBottom: `1px solid rgba(184,134,11,.12)` }}>
              <div style={{ ...S.tag(), marginBottom: 16 }}>FIRST IN INDIA</div>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🛡️</div>
              <h3 style={{ ...S.h3, color: C.white }}>EquityShield</h3>
              <p style={{ ...S.body, color: 'rgba(255,255,255,.5)', marginBottom: 16 }}>Banks sell distressed properties at auction for a fraction of their value. We step in before that happens and sell at full market rate.</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Market Rate Sale', 'NPA Protection'].map(t => <span key={t} style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '3px 8px' }}>{t}</span>)}
              </div>
              <a href="/loan-against-property" style={{ display: 'block', marginTop: 16, fontSize: 13, color: C.goldLight, fontWeight: 600, textDecoration: 'none' }}>Learn More →</a>
            </div>
            {/* Bottom right */}
            <div style={{ background: 'rgba(255,255,255,.02)', padding: 32 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: C.green, background: 'rgba(22,163,74,.1)', border: '1px solid rgba(22,163,74,.2)', borderRadius: 6, padding: '3px 8px', marginBottom: 16 }}>● COMING SOON</div>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✈️</div>
              <h3 style={{ ...S.h3, color: C.white }}>NRI Loans</h3>
              <p style={{ ...S.body, color: 'rgba(255,255,255,.5)', marginBottom: 16 }}>Buy property or invest in India without flying back. We handle the entire process — from abroad, end to end.</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['UAE', 'UK', 'USA', 'Canada'].map(t => <span key={t} style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '3px 8px' }}>{t}</span>)}
              </div>
              <a href="#nri" style={{ display: 'block', marginTop: 16, fontSize: 13, color: C.goldLight, fontWeight: 600, textDecoration: 'none' }}>Join Waitlist →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE RATES ── */}
      <section style={{ background: C.bg3, borderTop: `1px solid ${C.border}`, padding: '32px 0' }}>
        <div style={{ ...S.container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: C.textLight }}>LIVE RATES</div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[['Personal Loan', liveRates.pl], ['Home Loan', liveRates.hl], ['Business Loan', liveRates.bl], ['Car Loan', liveRates.cl]].map(([name, rate]) => (
              <div key={name} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.gold, fontFamily: 'Fraunces,Georgia,serif' }}>{rate}%</div>
                <div style={{ fontSize: 11, color: C.textLight }}>{name} from</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.textLight }}>Auto-updated daily</div>
        </div>
      </section>

      {/* ── NRI SECTION ── */}
      <section id="nri" style={S.section(C.bg)}>
        <div style={S.container}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 56, alignItems: 'center' }}>
            <div>
              <div style={{ ...S.label, color: C.gold }}>COMING SOON</div>
              <h2 style={S.h2}>NRI Loans — <span style={{ color: C.gold }}>without the paperwork chase</span></h2>
              <p style={{ ...S.body, marginBottom: 24 }}>You've been sending money home for years. Buying property or investing in India shouldn't require you to fly back. We're building the platform that handles everything from wherever you are.</p>
              {[['NRI Home Loans', 'Buy property in India from anywhere. No flying back required. From 8.5% p.a.'], ['NRI Loan Against Property', 'Your Indian property is sitting on equity. Put it to work. Up to 70% LTV.'], ['NRI Investment Financing', 'Commercial property and FD-backed loans — managed remotely, start to finish.']].map(([title, desc]) => (
                <div key={title} style={{ ...S.card, marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: C.dark, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 13, color: C.textMid }}>{desc}</div>
                </div>
              ))}
              <div style={{ marginTop: 16, fontSize: 13, color: C.textLight }}>Available for: UAE · UK · USA · Canada · Singapore</div>
            </div>
            <div>
              {nriDone ? (
                <div style={{ ...S.cardGold, textAlign: 'center', padding: 48 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.dark, fontFamily: 'Fraunces,Georgia,serif' }}>You're on the list!</div>
                  <div style={{ fontSize: 14, color: C.textMid, marginTop: 8 }}>We'll reach out personally when NRI Loans launch in your region.</div>
                </div>
              ) : (
                <div style={S.card}>
                  <div style={{ fontWeight: 700, color: C.dark, fontSize: 18, fontFamily: 'Fraunces,Georgia,serif', marginBottom: 4 }}>Get notified when NRI Loans launch</div>
                  <div style={{ fontSize: 13, color: C.textLight, marginBottom: 20 }}>We'll reach out personally — not with a mass email blast.</div>
                  <form onSubmit={handleNRI} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input name="name" required placeholder="Full Name *" style={S.input}/>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <input name="email" type="email" required placeholder="Email *" style={S.input}/>
                      <input name="phone" type="tel" required placeholder="Phone *" style={S.input}/>
                    </div>
                    <select name="country" required style={{ ...S.input, appearance: 'none' as unknown as undefined }}>
                      <option value="">Country of Residence *</option>
                      {['UAE', 'United Kingdom', 'United States', 'Canada', 'Singapore', 'Australia', 'Saudi Arabia', 'Qatar', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select name="product" style={{ ...S.input, appearance: 'none' as unknown as undefined }}>
                      <option value="">Interested In</option>
                      {['NRI Home Loan', 'NRI LAP', 'NRI Investment Loan', 'Not sure yet'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button type="submit" style={{ ...S.btnGold, width: '100%', justifyContent: 'center', padding: 14 }}>Join NRI Waitlist →</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── EMI CALCULATOR ── */}
      <section id="calculator" style={S.section(C.dark)}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ ...S.label, color: C.goldLight }}>PLAN YOUR LOAN</div>
            <h2 style={{ ...S.h2, color: C.white }}>Know your EMI before you commit.</h2>
            <p style={{ ...S.body, color: 'rgba(255,255,255,.5)' }}>Drag the sliders. See what you're actually signing up for.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: isMobile ? 24 : 40, maxWidth: 700, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 32, alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {[
                  { label: 'Loan Amount', value: fmt(calcAmount), min: 50000, max: 10000000, step: 50000, val: calcAmount, set: setCalcAmount },
                  { label: 'Interest Rate (p.a.)', value: `${calcRate}%`, min: 6, max: 30, step: 0.25, val: calcRate, set: setCalcRate },
                  { label: 'Tenure', value: `${calcTenure} months (${Math.round(calcTenure / 12 * 10) / 10} yrs)`, min: 6, max: 360, step: 6, val: calcTenure, set: setCalcTenure },
                ].map(sl => (
                  <div key={sl.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>{sl.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{sl.value}</span>
                    </div>
                    <input type="range" min={sl.min} max={sl.max} step={sl.step} value={sl.val} onChange={e => sl.set(Number(e.target.value))} style={{ width: '100%', accentColor: C.gold }}/>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{sl.label === 'Loan Amount' ? '₹50K' : sl.label === 'Interest Rate (p.a.)' ? '6%' : '6 ms'}</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{sl.label === 'Loan Amount' ? '₹1 Cr' : sl.label === 'Interest Rate (p.a.)' ? '30%' : '30 yrs'}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 8 }}>Your Monthly EMI</div>
                <div style={{ fontSize: 48, fontWeight: 900, color: C.white, fontFamily: 'Fraunces,Georgia,serif', marginBottom: 24 }}>₹{emi.toLocaleString('en-IN')}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  {[['Total Interest', fmt(totalInt), C.red], ['Total Payment', fmt(totalPay), C.green]].map(([l, v, c]) => (
                    <div key={l} style={{ background: 'rgba(255,255,255,.05)', borderRadius: 10, padding: '14px 10px' }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: c as string, fontFamily: 'Fraunces,Georgia,serif' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <a href="#eligibility" style={{ ...S.btnGold, width: '100%', justifyContent: 'center', padding: 14 }}>Check If You Qualify →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: C.bg2, borderBottom: `1px solid ${C.border}`, padding: '48px 0' }}>
        <div style={S.container}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 24 }}>
            {[['₹47 Cr+', 'Loans disbursed'], ['2,400+', 'Customers helped'], ['4.8 ★', 'Average rating'], ['38 hrs', 'Avg. disbursal time']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: C.dark, fontFamily: 'Fraunces,Georgia,serif' }}>{v}</div>
                <div style={{ fontSize: 13, color: C.textLight, marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={S.section(C.bg)}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={S.label}>REAL CUSTOMERS</div>
            <h2 style={S.h2}>They came in not knowing what they'd get.<br/>Here's what happened.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 20 }}>
            {[
              { q: `"I'd been rejected twice before finding FLOCRED. They told me my score was 664 and exactly which NBFC would approve me at that level. Got ₹8 lakh sanctioned in 2 days."`, name: 'Rahul K.', meta: 'Personal Loan · Delhi · ₹8 Lakh' },
              { q: `"Home loan at 8.55% when three other brokers quoted me 9.1%+. The EMI holiday meant I didn't pay anything for the first 4 months while we were renovating. Game changer."`, name: 'Priya S.', meta: 'Home Loan · Gurgaon · ₹65 Lakh' },
              { q: `"Running a textile business in Noida, needed ₹40L working capital urgently. FLOCRED calculated my Drawing Power in minutes and matched me to a bank that approved in 6 days."`, name: 'Arun M.', meta: 'Working Capital · Noida · ₹40 Lakh' },
            ].map(t => (
              <div key={t.name} style={S.card}>
                <div style={{ color: C.gold, fontSize: 18, marginBottom: 12 }}>★★★★★</div>
                <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.7, marginBottom: 16 }}>{t.q}</p>
                <div style={{ fontWeight: 700, color: C.dark, fontSize: 14 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: C.textLight }}>{t.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BANKS ── */}
      <section style={{ background: C.dark, padding: '40px 0' }}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.15em', color: 'rgba(255,255,255,.3)' }}>BANKS AND NBFCs WE WORK WITH</div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Bajaj Finance', 'LIC HFL', 'Lendingkart', 'Faircent', 'Kotak Bank', 'Yes Bank'].map(b => (
              <span key={b} style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.35)', padding: '6px 14px', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8 }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={S.section(C.bg2)}>
        <div style={{ ...S.container, maxWidth: 720 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={S.label}>QUESTIONS?</div>
            <h2 style={S.h2}>Things people ask us</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FAQS.map(([q, a], i) => (
              <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: i === 0 ? '12px 12px 0 0' : i === FAQS.length - 1 ? '0 0 12px 12px' : 0, borderBottom: i < FAQS.length - 1 ? 'none' : `1px solid ${C.border}`, overflow: 'hidden' }}>
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{ width: '100%', textAlign: 'left', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: C.dark }}>
                  {q}
                  <span style={{ fontSize: 20, color: C.gold, flexShrink: 0, marginLeft: 16, transform: faqOpen === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s', display: 'inline-block' }}>+</span>
                </button>
                {faqOpen === i && (
                  <div style={{ padding: '0 24px 20px', fontSize: 14, color: C.textMid, lineHeight: 1.7, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>{a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={S.section(C.bg)}>
        <div style={S.container}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 56, alignItems: 'start' }}>
            <div>
              <div style={S.label}>GET IN TOUCH</div>
              <h2 style={S.h2}>Talk to a real person. Not a chatbot.</h2>
              <p style={{ ...S.body, marginBottom: 32 }}>Every client gets a dedicated relationship manager who picks up the phone. We negotiate your loan end-to-end — from application to disbursal.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[{ icon: '📞', label: 'Call Us', val: '+91-9319369315', href: 'tel:+919319369315' }, { icon: '✉️', label: 'Email', val: 'support@flocred.com', href: 'mailto:support@flocred.com' }, { icon: '📍', label: 'Location', val: 'Delhi & Mumbai, India', href: '' }].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, background: C.goldBg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: 12, color: C.textLight, marginBottom: 2 }}>{item.label}</div>
                      {item.href ? <a href={item.href} style={{ fontSize: 15, fontWeight: 600, color: C.dark, textDecoration: 'none' }}>{item.val}</a> : <div style={{ fontSize: 15, fontWeight: 600, color: C.dark }}>{item.val}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={S.card}>
              <h3 style={{ ...S.h3, marginBottom: 20 }}>Apply for a Loan</h3>
              <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input name="name" required placeholder="Full Name *" style={S.input}/>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <input name="phone" required placeholder="Phone *" style={S.input}/>
                  <input name="email" type="email" placeholder="Email" style={S.input}/>
                </div>
                <select name="loan_type" required style={{ ...S.input, appearance: 'none' as unknown as undefined }}>
                  <option value="">Loan Type *</option>
                  {['personal_loan', 'business_loan', 'home_loan', 'car_loan', 'lap', 'working_capital'].map(v => <option key={v} value={v}>{v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                </select>
                <input name="amount" placeholder="Loan Amount (₹)" style={S.input} type="number"/>
                <textarea name="message" rows={3} placeholder="Brief description of your requirement" style={{ ...S.input, resize: 'none' }}/>
                <button type="submit" style={{ ...S.btnGold, width: '100%', justifyContent: 'center', padding: 14 }}>Submit Application →</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.dark, color: 'rgba(255,255,255,.5)', padding: '48px 0 24px' }}>
        <div style={S.container}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr 1fr 1fr', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ fontFamily: 'Fraunces,Georgia,serif', fontSize: 22, fontWeight: 800, color: C.goldLight, marginBottom: 12 }}>FLOCRED</div>
              <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>India's first loan eligibility platform. We tell you where you'll get approved — before you apply.</p>
              <div style={{ fontSize: 12 }}>CIN: U67100DL2022PTC400764</div>
            </div>
            {[
              { title: 'Loans', links: [['Personal Loan', '/personal-loan'], ['Business Loan', '/business-loan'], ['Home Loan', '/home-loan'], ['Car Loan', '/car-loan'], ['LAP', '/loan-against-property'], ['Working Capital', '/working-capital']] },
              { title: 'Company', links: [['About', '/about'], ['Careers', '/careers'], ['Blog', '/blog'], ['Contact', '/contact']] },
              { title: 'Legal', links: [['Privacy Policy', '/privacy'], ['Terms of Use', '/terms'], ['Disclaimer', '/disclaimer']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,255,255,.3)', marginBottom: 16 }}>{col.title.toUpperCase()}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(([label, href]) => (
                    <Link key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 12 }}>© 2024 FLOCRED Private Limited. All rights reserved.</div>
            <div style={{ fontSize: 12 }}>DPIIT Recognised · RBI Compliant · Startup India Registered</div>
          </div>
        </div>
      </footer>
    </>
  );
}
