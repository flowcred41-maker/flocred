'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { saveLead } from '@/lib/supabase';

export default function ContactClient() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true);
    const fd = new FormData(e.currentTarget);
    await saveLead({
      name: fd.get('name') as string,
      phone: fd.get('phone') as string,
      email: fd.get('email') as string || null,
      loan_type: fd.get('loan_type') as string,
      amount: fd.get('amount') as string || null,
      source: 'website_contact',
      notes: fd.get('message') as string || null,
    });
    setSent(true); setLoading(false);
    showToast('Application submitted! Our team will contact you within 30 minutes.');
  }

  const teamOnline = (() => {
    try { const n = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })); return n.getDay() >= 1 && n.getDay() <= 6 && n.getHours() >= 9 && n.getHours() < 19; } catch { return false; }
  })();

  return (
    <>
      <Navbar/>
      {toast && <div style={{ position:'fixed', bottom:24, right:24, background:'#C9A84C', color:'#0D0D0D', padding:'12px 20px', borderRadius:10, fontSize:13, fontWeight:600, zIndex:300 }}>{toast}</div>}

      <section className="min-h-[60vh] flex items-center pt-20 pb-12 relative overflow-hidden section-dark">
        <div className="blob blob-gold" style={{ width:'400px',height:'400px',top:'-80px',right:'-60px',opacity:.07 }}/>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <span className="text-xs font-semibold tracking-[.2em] uppercase" style={{ color:'#C9A84C' }}>Talk to us</span>
              <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-4 leading-tight" style={{ color:'#F5F0E8' }}>
                Tell us what you need. We&apos;ll call back in 30 minutes.
                {teamOnline && <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:11, fontWeight:500, color:'rgba(245,240,232,.4)', marginLeft:8, verticalAlign:'middle' }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', display:'inline-block' }}/>Team online now
                </span>}
              </h1>
              <p className="text-sm mb-6 leading-relaxed" style={{ color:'rgba(245,240,232,.4)' }}>No automated calls. No script. A real person who has seen thousands of loan cases and can tell you exactly what your options are.</p>
              <div className="space-y-4 text-sm">
                {[
                  { href:'tel:+919319369315', label:'+91-9319369315', path:'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                  { href:'mailto:support@flocred.com', label:'support@flocred.com', path:'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                  { href:'https://wa.me/919319369315', label:'WhatsApp — usually replies in minutes', path:'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3" style={{ color:'rgba(245,240,232,.5)' }}>
                    <svg className="w-4 h-4" style={{ color:'#C9A84C' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.path}/></svg>
                    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ color:'rgba(245,240,232,.7)' }}>{item.label}</a>
                  </div>
                ))}
              </div>
              {/* Fraud warning */}
              <div className="rounded-2xl p-4 mt-8" style={{ background:'rgba(220,38,38,.05)', border:'1px solid rgba(220,38,38,.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  <span className="text-xs font-bold text-red-400">Beware of Fraudsters</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color:'rgba(245,240,232,.4)' }}>FLOCRED never asks for upfront payments, OTPs, or bank passwords. Report fraud to support@flocred.com.</p>
              </div>
            </div>

            {sent ? (
              <div className="glass rounded-3xl p-8 flex flex-col items-center justify-center text-center" style={{ borderColor:'rgba(201,168,76,.2)' }}>
                <div style={{ width:64, height:64, background:'rgba(201,168,76,.1)', borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                  <svg className="w-8 h-8" style={{ color:'#C9A84C' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div className="text-xl font-bold mb-2" style={{ fontFamily:'Fraunces,serif', color:'#F5F0E8' }}>Application Submitted!</div>
                <div className="text-sm" style={{ color:'rgba(245,240,232,.4)' }}>Our team will call you within 30 minutes.</div>
                <div className="text-xs mt-4 font-mono" style={{ color:'#C9A84C' }}>Ref: FLOC-{Date.now().toString(36).toUpperCase().slice(-6)}</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 sm:p-8 space-y-3" style={{ borderColor:'rgba(201,168,76,.15)' }}>
                <div className="text-lg font-bold mb-1" style={{ fontFamily:'Fraunces,serif', color:'#F5F0E8' }}>Check Eligibility</div>
                <div className="text-xs mb-4" style={{ color:'rgba(245,240,232,.35)' }}>Free · No documents · No CIBIL score impact</div>
                <input name="name" required placeholder="Full Name" className="input-dark"/>
                <input name="phone" required placeholder="Mobile Number" className="input-dark" maxLength={10}/>
                <input name="email" type="email" placeholder="Email (optional)" className="input-dark"/>
                <select name="loan_type" required className="input-dark" style={{ appearance:'none' }}>
                  <option value="">What do you need?</option>
                  {[['personal_loan','Personal Loan'],['business_loan','Business Loan'],['home_loan','Home Loan'],['lap','Loan Against Property'],['car_loan','Car Loan'],['working_capital','Working Capital'],['cibil_check','CIBIL Score Check'],['cibil_boost','CIBIL Boost Program'],['other','Other']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
                <input name="amount" placeholder="Loan Amount Required (₹)" className="input-dark"/>
                <textarea name="message" rows={2} placeholder="Any specific requirement?" className="input-dark" style={{ resize:'none' }}/>
                <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 rounded-xl text-sm font-semibold justify-center">
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
      <Footer/>
    </>
  );
}
