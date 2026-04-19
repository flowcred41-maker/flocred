'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NavbarProps { onLoginClick?: () => void; }

export default function Navbar({ onLoginClick }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'nav-dark' : ''}`}>
      <div style={{maxWidth:'80rem',margin:'0 auto',padding:'0 16px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:isMobile?64:72}}>
          <Link href="/" style={{flexShrink:0}}>
            
            <span style={{fontFamily:'Fraunces,serif',fontSize:22,fontWeight:700,color:'#C9A84C'}}>FLOCRED</span>
          </Link>

          {/* Desktop nav */}
          {!isMobile && (
            <div style={{display:'flex',alignItems:'center',gap:4}}>
              {[['#eligibility','Check Eligibility'],['#cibil','CIBIL Score'],['#products','Products'],['#calculator','EMI Calculator']].map(([h,l])=>(
                <a key={l} href={h} style={{padding:'8px 12px',fontSize:13,fontWeight:500,color:'rgba(245,240,232,.6)',borderRadius:8,textDecoration:'none',transition:'all .2s'}}
                  onMouseEnter={e=>(e.target as HTMLElement).style.color='#F5F0E8'}
                  onMouseLeave={e=>(e.target as HTMLElement).style.color='rgba(245,240,232,.6)'}>{l}</a>
              ))}
              <Link href="/careers" style={{padding:'8px 12px',fontSize:13,fontWeight:500,color:'rgba(245,240,232,.6)',borderRadius:8,textDecoration:'none'}}>Careers</Link>
            </div>
          )}

          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {!isMobile && (
              <a href="tel:+919319369315" style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',fontSize:12,color:'rgba(245,240,232,.5)',textDecoration:'none'}}>
                +91-9319369315
              </a>
            )}
            {onLoginClick && <button onClick={onLoginClick} className="btn-ghost" style={{padding:'8px 16px',borderRadius:12,fontSize:12}}>Login</button>}
            {!isMobile && <a href="#eligibility" className="btn-gold" style={{padding:'10px 20px',borderRadius:12,fontSize:12}}>Check Eligibility</a>}
            {isMobile && (
              <button onClick={()=>setMobileOpen(!mobileOpen)} style={{padding:8,color:'rgba(245,240,232,.6)',background:'none',border:'none',cursor:'pointer'}}>
                <svg style={{width:20,height:20}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen?<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && isMobile && (
        <div className="glass" style={{borderTop:'1px solid rgba(255,255,255,.05)',borderRadius:0}}>
          <div style={{padding:'12px 16px',display:'flex',flexDirection:'column',gap:4}}>
            {[['#eligibility','Check Eligibility'],['#cibil','CIBIL Score'],['#products','Products'],['#calculator','EMI Calculator'],['#contact','Contact']].map(([h,l])=>(
              <a key={l} href={h} style={{padding:'10px 12px',fontSize:14,color:'rgba(245,240,232,.7)',borderRadius:8,textDecoration:'none',display:'block'}} onClick={()=>setMobileOpen(false)}>{l}</a>
            ))}
            <Link href="/careers" style={{padding:'10px 12px',fontSize:14,color:'rgba(245,240,232,.7)',borderRadius:8,textDecoration:'none',display:'block'}} onClick={()=>setMobileOpen(false)}>Careers</Link>
          </div>
        </div>
      )}

      {/* WhatsApp mobile */}
      {isMobile && (
        <a href="https://wa.me/919319369315?text=Hi+I+want+to+check+my+loan+eligibility" target="_blank" rel="noopener noreferrer"
          style={{position:'fixed',bottom:80,right:16,zIndex:50,display:'flex',alignItems:'center',gap:8,background:'#25D366',color:'#fff',fontSize:13,fontWeight:600,padding:'12px 16px',borderRadius:50,boxShadow:'0 4px 20px rgba(37,211,102,.4)',textDecoration:'none'}}>
          <svg viewBox="0 0 24 24" fill="currentColor" style={{width:20,height:20}}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </a>
      )}
    </nav>
  );
}
