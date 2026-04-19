'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const fmt = (v: number) => v >= 10000000 ? `₹${(v/10000000).toFixed(2)}Cr` : v >= 100000 ? `₹${(v/100000).toFixed(2)}L` : `₹${Math.round(v).toLocaleString('en-IN')}`;

export default function EMIClient() {
  const [amount, setAmount] = useState(1000000);
  const [rate, setRate] = useState(10.5);
  const [tenure, setTenure] = useState(60);

  const { emi, totalInt, totalPay } = useMemo(() => {
    const r = rate / 12 / 100;
    const e = amount * r * Math.pow(1+r,tenure) / (Math.pow(1+r,tenure)-1);
    return { emi: Math.round(e), totalPay: Math.round(e*tenure), totalInt: Math.round(e*tenure - amount) };
  }, [amount, rate, tenure]);

  const intPct = Math.round((totalInt / totalPay) * 100);

  return (
    <>
      <Navbar/>
      <section className="min-h-[60vh] flex items-center pt-20 pb-10 relative overflow-hidden section-dark">
        <div className="blob blob-gold" style={{ width:'400px',height:'400px',top:'-80px',right:'-60px',opacity:.07 }}/>
        <div className="max-w-6xl mx-auto px-4 relative z-10 w-full">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold tracking-[.2em] uppercase" style={{ color:'#C9A84C' }}>Plan Your Loan</span>
            <h1 className="text-4xl sm:text-5xl font-bold mt-2 mb-3" style={{ color:'#F5F0E8' }}>Know your EMI before you commit.</h1>
            <p className="text-base" style={{ color:'rgba(245,240,232,.4)' }}>Drag the sliders. See what you&apos;re actually signing up for.</p>
          </div>
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto" style={{ borderColor:'rgba(201,168,76,.1)' }}>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {[
                  { label:'Loan Amount', val:`₹${amount.toLocaleString('en-IN')}`, min:50000, max:100000000, step:50000, value:amount, set:setAmount, lo:'₹50K', hi:'₹100Cr' },
                  { label:'Interest Rate (p.a.)', val:`${rate.toFixed(2)}%`, min:6, max:30, step:0.25, value:rate, set:setRate, lo:'6%', hi:'30%' },
                  { label:'Tenure', val:`${tenure} months${tenure>=12?` (${Math.floor(tenure/12)}yr)`:''}`, min:6, max:360, step:6, value:tenure, set:setTenure, lo:'6 mo', hi:'30 yrs' },
                ].map(s=>(
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-2">
                      <span style={{ color:'rgba(245,240,232,.4)' }}>{s.label}</span>
                      <span className="font-mono font-medium" style={{ color:'#F5F0E8' }}>{s.val}</span>
                    </div>
                    <input type="range" min={s.min} max={s.max} value={s.value} step={s.step} onChange={e=>s.set(parseFloat(e.target.value))} className="w-full" style={{ accentColor:'#C9A84C' }}/>
                    <div className="flex justify-between text-[10px] mt-1" style={{ color:'rgba(245,240,232,.2)' }}>
                      <span>{s.lo}</span><span>{s.hi}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-xs mb-1" style={{ color:'rgba(245,240,232,.3)' }}>Your Monthly EMI</div>
                <div className="text-4xl font-bold font-mono mb-4 stat-num" style={{ color:'#F5F0E8' }}>₹{emi.toLocaleString('en-IN')}</div>
                <div className="w-full h-2 rounded-full overflow-hidden mb-1" style={{ background:'rgba(255,255,255,.07)' }}>
                  <div className="h-full rounded-full" style={{ width:`${100-intPct}%`, background:'linear-gradient(90deg,#C9A84C,#DDB96A)' }}/>
                </div>
                <div className="flex justify-between w-full text-[10px] mb-5" style={{ color:'rgba(245,240,232,.3)' }}>
                  <span>Principal {100-intPct}%</span><span>Interest {intPct}%</span>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full mb-4">
                  <div className="glass-light rounded-xl p-3 text-center">
                    <div className="text-[10px]" style={{ color:'rgba(245,240,232,.3)' }}>Total Interest</div>
                    <div className="text-sm font-semibold font-mono" style={{ color:'#C9A84C' }}>{fmt(totalInt)}</div>
                  </div>
                  <div className="glass-light rounded-xl p-3 text-center">
                    <div className="text-[10px]" style={{ color:'rgba(245,240,232,.3)' }}>Total Payment</div>
                    <div className="text-sm font-semibold font-mono" style={{ color:'#F5F0E8' }}>{fmt(totalPay)}</div>
                  </div>
                </div>
                <Link href="/contact" className="btn-gold w-full py-3.5 rounded-xl text-sm justify-center">
                  Check If I Qualify
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </>
  );
}
