'use client';
import { useState, useEffect, useCallback } from 'react';
import { sb } from '@/lib/supabase';

type Lead = { id: number; name: string; phone: string; email?: string; loan_type?: string; amount?: string; source?: string; status?: string; assigned_to?: string; notes?: string; created_at?: string; updated_at?: string; };
type Employee = { id: number; emp_id: string; name: string; phone?: string; email?: string; role?: string; is_active?: boolean; last_login?: string; password_hash?: string; };
type FileStatus = { id?: number; lead_id: number; stage?: string; assigned_to?: string; pd_status?: string; verification_status?: string; bank_submitted?: string; sanction_amount?: number; docs_pending?: string[]; remarks?: string; updated_at?: string; };
type NRI = { id: number; name: string; email?: string; phone?: string; country?: string; product?: string; status?: string; created_at?: string; };
type CIBILCheck = { id: number; pan_number?: string; score?: number; rating?: string; source?: string; checked_at?: string; };
type BankRate = { id: number; product?: string; bank_name?: string; min_rate?: number; max_rate?: number; min_cibil?: number; max_tenure?: number; processing_fee?: string; };

type Tab = 'dash' | 'leads' | 'files' | 'team' | 'nri' | 'careers' | 'cibil' | 'rates';

const SB_URL = 'https://lzxolgrleaxxtpdwkhwd.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eG9sZ3JsZWF4eHRwZHdraHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzc1MDQsImV4cCI6MjA4OTc1MzUwNH0.tmvgV2cAEKyo0hNjzoUu7vY-EkiaL0jstHTWBILVXdI';

function dt(d?: string) {
  if (!d) return '-';
  const x = new Date(d);
  return x.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' + x.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

const STATUS_COLORS: Record<string, string> = {
  new: 'rgba(34,197,94,.1)|#4ade80|rgba(34,197,94,.2)',
  contacted: 'rgba(201,168,76,.12)|#C9A84C|rgba(201,168,76,.2)',
  converted: 'rgba(34,197,94,.15)|#4ade80|rgba(34,197,94,.25)',
  rejected: 'rgba(239,68,68,.1)|#f87171|rgba(239,68,68,.2)',
  registered: 'rgba(139,92,246,.15)|#c084fc|rgba(139,92,246,.2)',
  disbursed: 'rgba(34,197,94,.15)|#4ade80|rgba(34,197,94,.25)',
  sanctioned: 'rgba(168,85,247,.1)|#c084fc|rgba(168,85,247,.2)',
  docs_pending: 'rgba(249,115,22,.1)|#fb923c|rgba(249,115,22,.2)',
  pd_scheduled: 'rgba(201,168,76,.12)|#C9A84C|rgba(201,168,76,.2)',
  pd_done: 'rgba(34,197,94,.15)|#4ade80|rgba(34,197,94,.25)',
  not_started: 'rgba(100,116,139,.1)|#94a3b8|rgba(100,116,139,.2)',
};

function StatusBadge({ s }: { s?: string }) {
  const key = s || 'new';
  const parts = (STATUS_COLORS[key] || STATUS_COLORS.new).split('|');
  return (
    <span style={{ background: parts[0], color: parts[1], border: `1px solid ${parts[2]}`, padding: '3px 9px', borderRadius: 6, fontSize: 10, fontWeight: 600, display: 'inline-block' }}>
      {key.replace(/_/g, ' ')}
    </span>
  );
}

export default function AdminClient() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<{ emp_id: string; name: string; role: string } | null>(null);
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginErr, setLoginErr] = useState(false);
  const [tab, setTab] = useState<Tab>('dash');
  const [toast, setToast] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [emps, setEmps] = useState<Employee[]>([]);
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [nri, setNri] = useState<NRI[]>([]);
  const [cibil, setCibil] = useState<CIBILCheck[]>([]);
  const [rates, setRates] = useState<BankRate[]>([]);
  const [leadFilter, setLeadFilter] = useState('all');
  const [leadSearch, setLeadSearch] = useState('');
  const [fileFilter, setFileFilter] = useState('all');
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [fileModal, setFileModal] = useState<{ leadId: number; existing?: FileStatus } | null>(null);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const logActivity = useCallback(async (action: string, type?: string | null, id?: number | null, details?: string) => {
    try { await sb.from('activity_log').insert({ emp_id: user?.emp_id || 'system', action, entity_type: type, entity_id: id, details }); } catch {}
  }, [user]);

  const loadData = useCallback(async () => {
    try {
      const [r1, r2, r3, r4, r5, r6] = await Promise.all([
        sb.from('leads').select('*').order('created_at', { ascending: false }),
        sb.from('nri_waitlist').select('*').order('created_at', { ascending: false }),
        sb.from('cibil_checks').select('*').order('checked_at', { ascending: false }),
        sb.from('bank_rates').select('*').order('product'),
        sb.from('employees').select('*').order('name'),
        sb.from('file_status').select('*').order('updated_at', { ascending: false }),
      ]);
      setLeads(r1.data || []);
      setNri(r2.data || []);
      setCibil(r3.data || []);
      setRates(r4.data || []);
      setEmps(r5.data || []);
      setFiles(r6.data || []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('fc_user');
    if (saved) { const u = JSON.parse(saved); setUser(u); setAuthed(true); }
  }, []);

  useEffect(() => { if (authed) loadData(); }, [authed, loadData]);

  async function doLogin() {
    setLoginErr(false);
    if ((loginId === 'admin' || loginId === 'ADMIN') && loginPw === 'flocred2026') {
      const u = { emp_id: 'ADMIN', name: 'Admin', role: 'admin' };
      sessionStorage.setItem('fc_user', JSON.stringify(u));
      setUser(u); setAuthed(true); return;
    }
    const { data } = await sb.from('employees').select('*').or(`emp_id.eq.${loginId},email.eq.${loginId}`).single();
    if (data && data.password_hash === loginPw) {
      sessionStorage.setItem('fc_user', JSON.stringify(data));
      setUser(data); setAuthed(true);
      await sb.from('employees').update({ last_login: new Date().toISOString() }).eq('id', data.id);
    } else { setLoginErr(true); }
  }

  function logout() { sessionStorage.removeItem('fc_user'); setAuthed(false); setUser(null); }

  async function setStatus(id: number, status: string) {
    await sb.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    await logActivity('status_change', 'lead', id, status);
    showToast('Status updated'); loadData();
  }

  async function assignLead(id: number, empId: string) {
    await sb.from('leads').update({ assigned_to: empId, updated_at: new Date().toISOString() }).eq('id', id);
    await logActivity('assign', 'lead', id, 'Assigned to ' + empId);
    showToast('Lead assigned to ' + empId); loadData();
  }

  async function toggleEmpStatus(id: number, active: boolean) {
    await sb.from('employees').update({ is_active: active }).eq('id', id);
    showToast(active ? 'Activated' : 'Deactivated'); loadData();
  }

  async function addLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget; const fd = new FormData(f);
    await sb.from('leads').insert({ name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email') || null, loan_type: fd.get('loan_type'), amount: fd.get('amount') || null, assigned_to: fd.get('assigned_to') || null, notes: fd.get('notes') || null, source: 'crm_manual', country: 'India', currency: 'INR', status: 'new' });
    await logActivity('add_lead', 'lead', null, fd.get('name') + ' - ' + fd.get('loan_type'));
    showToast('Lead added'); f.reset(); setShowAddLead(false); loadData();
  }

  async function addEmployee(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget; const fd = new FormData(f);
    const { error } = await sb.from('employees').insert({ emp_id: fd.get('emp_id'), name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email') || null, role: fd.get('role'), password_hash: fd.get('password'), is_active: true });
    if (error) { showToast('Error: ' + error.message); return; }
    showToast('Employee added'); f.reset(); setShowAddEmp(false); loadData();
  }

  async function updateFile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget; const fd = new FormData(f);
    if (!fileModal) return;
    const docs = ((fd.get('docs_pending') as string) || '').split(',').map(s => s.trim()).filter(Boolean);
    const data: Record<string, unknown> = { lead_id: fileModal.leadId, stage: fd.get('stage'), assigned_to: fd.get('assigned_to') || null, pd_status: fd.get('pd_status'), verification_status: fd.get('verification'), bank_submitted: fd.get('bank') || null, sanction_amount: fd.get('sanction_amount') ? parseFloat(fd.get('sanction_amount') as string) : null, docs_pending: docs, remarks: fd.get('remarks') || null, updated_at: new Date().toISOString() };
    if (fileModal.existing?.id) { await sb.from('file_status').update(data).eq('id', fileModal.existing.id); }
    else { await sb.from('file_status').insert(data); }
    const stage = data.stage as string;
    const leadStatus = stage === 'disbursed' ? 'converted' : stage === 'rejected' ? 'rejected' : stage === 'new' ? 'new' : 'contacted';
    await sb.from('leads').update({ status: leadStatus, assigned_to: data.assigned_to, updated_at: new Date().toISOString() }).eq('id', fileModal.leadId);
    await logActivity('file_update', 'file', fileModal.leadId, stage);
    showToast('File updated'); setFileModal(null); loadData();
  }

  function exportCSV() {
    let csv = 'ID,Name,Phone,Email,Loan Type,Amount,Status,Assigned To,Source,Date\n';
    leads.forEach(l => { csv += `${l.id},"${l.name}","${l.phone}","${l.email || ''}","${l.loan_type || ''}","${l.amount || ''}","${l.status}","${l.assigned_to || ''}","${l.source || ''}","${dt(l.created_at)}"\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `flocred_leads_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    showToast('CSV exported');
  }

  const webLeads = leads.filter(l => l.source !== 'careers_page');
  const careers = leads.filter(l => l.source === 'careers_page');
  const filteredLeads = webLeads.filter(l => {
    const matchFilter = leadFilter === 'all' || l.status === leadFilter;
    const matchSearch = !leadSearch || l.name.toLowerCase().includes(leadSearch.toLowerCase()) || l.phone.includes(leadSearch) || (l.email || '').toLowerCase().includes(leadSearch.toLowerCase());
    return matchFilter && matchSearch;
  });
  const filteredFiles = files.filter(f => fileFilter === 'all' || f.stage === fileFilter);
  const today = new Date().toISOString().split('T')[0];
  const todayLeads = leads.filter(l => l.created_at?.startsWith(today));
  const converted = webLeads.filter(l => l.status === 'converted');

  const empStats: Record<string, { total: number; conv: number; new: number }> = {};
  leads.forEach(l => { if (l.assigned_to) { if (!empStats[l.assigned_to]) empStats[l.assigned_to] = { total: 0, conv: 0, new: 0 }; empStats[l.assigned_to].total++; if (l.status === 'converted') empStats[l.assigned_to].conv++; if (l.status === 'new') empStats[l.assigned_to].new++; } });

  const inp = 'background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);color:#F5F0E8;border-radius:8px;padding:8px 12px;font-size:12px;font-family:Inter,system-ui;outline:none;width:100%;';
  const btnP = 'background:#C9A84C;color:#0D0D0D;font-weight:600;border:none;cursor:pointer;padding:8px 16px;border-radius:8px;font-size:12px;transition:all .15s;';
  const btnS = 'background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.06);color:rgba(245,240,232,.5);cursor:pointer;padding:8px 16px;border-radius:8px;font-size:12px;transition:all .15s;';

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'dash', label: 'Dashboard', icon: '▦' },
    { key: 'leads', label: 'Leads', icon: '◎' },
    { key: 'files', label: 'File Tracker', icon: '⊞' },
    { key: 'team', label: 'Team', icon: '⊕' },
    { key: 'nri', label: 'NRI Waitlist', icon: '✈' },
    { key: 'careers', label: 'Careers', icon: '⊗' },
    { key: 'cibil', label: 'CIBIL Checks', icon: '◈' },
    { key: 'rates', label: 'Bank Rates', icon: '⊛' },
  ];

  const TITLE: Record<Tab, [string, string]> = {
    dash: ['Dashboard', 'Overview of all activity'],
    leads: ['Leads', 'Manage & assign leads'],
    files: ['File Tracker', 'Track PD, verification & disbursement'],
    team: ['Team', 'Manage employees & performance'],
    nri: ['NRI Waitlist', 'International registrations'],
    careers: ['Career Applications', 'Job applicants'],
    cibil: ['CIBIL Checks', 'Score check history'],
    rates: ['Bank Rates', 'Interest rates database'],
  };

  const Modal = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) => !open ? null : (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#151515', border: '1px solid rgba(201,168,76,.15)', borderRadius: 20, padding: 28, maxWidth: 520, width: 'calc(100% - 32px)', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Fraunces,serif', fontSize: 16, fontWeight: 700, color: '#F5F0E8' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B6459', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );

  // ── LOGIN SCREEN ──
  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#151515', border: '1px solid rgba(201,168,76,.15)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 380 }}>
        <div style={{ fontFamily: 'Fraunces,serif', fontSize: 24, fontWeight: 700, color: '#C9A84C', marginBottom: 4 }}>FLOCRED</div>
        <div style={{ fontSize: 13, color: 'rgba(245,240,232,.4)', marginBottom: 24 }}>CRM — Sales & Lead Management</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder="Employee ID or Email" value={loginId} onChange={e => setLoginId(e.target.value)} style={{ ...inp as unknown as React.CSSProperties }} onKeyDown={e => e.key === 'Enter' && doLogin()} />
          <input type="password" placeholder="Password" value={loginPw} onChange={e => setLoginPw(e.target.value)} style={{ ...inp as unknown as React.CSSProperties }} onKeyDown={e => e.key === 'Enter' && doLogin()} />
          {loginErr && <div style={{ color: '#f87171', fontSize: 11 }}>Invalid credentials</div>}
          <button onClick={doLogin} style={{ ...btnP as unknown as React.CSSProperties, padding: '10px 0', width: '100%' }}>Login to CRM</button>
        </div>
        <div style={{ marginTop: 16, fontSize: 10, color: 'rgba(245,240,232,.2)', textAlign: 'center' }}>FLOCRED Private Limited · CIN: U67100DL2022PTC400764</div>
      </div>
    </div>
  );

  // ── CRM APP ──
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0D0D', fontFamily: 'Inter,system-ui', color: '#F5F0E8' }}>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#C9A84C', color: '#0D0D0D', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 200, boxShadow: '0 4px 20px rgba(201,168,76,.3)' }}>{toast}</div>}

      {/* Sidebar */}
      <div style={{ width: 220, background: '#151515', borderRight: '1px solid rgba(201,168,76,.12)', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ fontFamily: 'Fraunces,serif', fontSize: 18, fontWeight: 700, color: '#C9A84C' }}>FLOCRED</div>
          <div style={{ fontSize: 10, color: 'rgba(245,240,232,.3)', marginTop: 2 }}>CRM Dashboard</div>
        </div>
        <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', fontSize: 12, cursor: 'pointer', border: tab === t.key ? '1px solid rgba(201,168,76,.2)' : '1px solid transparent', background: tab === t.key ? 'rgba(201,168,76,.12)' : 'none', color: tab === t.key ? '#C9A84C' : 'rgba(245,240,232,.4)', width: '100%', textAlign: 'left', borderRadius: 8, margin: '1px 0', transition: 'all .12s', fontWeight: tab === t.key ? 600 : 400 }}>
              <span style={{ fontSize: 14, width: 18 }}>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ fontSize: 11, color: 'rgba(245,240,232,.5)', marginBottom: 6 }}>{user?.name} · {user?.role}</div>
          <button onClick={logout} style={{ fontSize: 11, color: 'rgba(245,240,232,.3)', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out →</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 220, flex: 1, padding: '20px 24px', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'Fraunces,serif', fontSize: 22, fontWeight: 700 }}>{TITLE[tab][0]}</div>
            <div style={{ fontSize: 12, color: 'rgba(245,240,232,.4)', marginTop: 2 }}>{TITLE[tab][1]}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={loadData} style={{ ...btnS as unknown as React.CSSProperties, fontSize: 11, padding: '6px 12px' }}>↻ Refresh</button>
            {tab === 'leads' && <button onClick={exportCSV} style={{ ...btnS as unknown as React.CSSProperties, fontSize: 11, padding: '6px 12px' }}>⬇ Export CSV</button>}
            {tab === 'leads' && <button onClick={() => setShowAddLead(true)} style={{ ...btnP as unknown as React.CSSProperties, fontSize: 11, padding: '6px 12px' }}>+ Add Lead</button>}
            {tab === 'team' && <button onClick={() => setShowAddEmp(true)} style={{ ...btnP as unknown as React.CSSProperties, fontSize: 11, padding: '6px 12px' }}>+ Add Employee</button>}
          </div>
        </div>

        {/* ── DASHBOARD ── */}
        {tab === 'dash' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total Leads', val: webLeads.length, sub: `today: ${todayLeads.length}`, c: '#F5F0E8' },
                { label: 'New / Unworked', val: webLeads.filter(l => l.status === 'new').length, sub: `assigned: ${webLeads.filter(l => l.assigned_to).length}`, c: '#C9A84C' },
                { label: 'Converted', val: converted.length, sub: `rate: ${webLeads.length ? Math.round(converted.length / webLeads.length * 100) : 0}%`, c: '#4ade80' },
                { label: 'In Pipeline', val: webLeads.filter(l => l.status === 'contacted').length, sub: 'contacted', c: '#60a5fa' },
                { label: 'NRI Waitlist', val: nri.length, sub: 'registrations', c: '#c084fc' },
                { label: 'Career Apps', val: careers.length, sub: 'applicants', c: '#f472b6' },
                { label: 'CIBIL Checks', val: cibil.length, sub: 'total checks', c: '#34d399' },
                { label: 'Team Size', val: emps.filter(e => e.is_active).length, sub: 'active SEs', c: '#fb923c' },
              ].map(s => (
                <div key={s.label} style={{ background: '#151515', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: '16px 14px' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Fraunces,serif', color: s.c }}>{s.val}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(245,240,232,.7)', marginTop: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(245,240,232,.3)', marginTop: 1 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Recent leads */}
            <div style={{ background: '#151515', borderRadius: 14, border: '1px solid rgba(255,255,255,.06)', padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: '#F5F0E8' }}>Recent Leads</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead><tr>{['Name', 'Phone', 'Type', 'Status', 'Assigned', 'Date'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: 'rgba(245,240,232,.3)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {webLeads.slice(0, 8).map(l => (
                      <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => setDetailLead(l)}>
                        <td style={{ padding: '7px 8px', fontWeight: 600, color: '#F5F0E8' }}>{l.name}</td>
                        <td style={{ padding: '7px 8px', fontFamily: 'monospace' }}><a href={`tel:${l.phone}`} style={{ color: '#60a5fa' }}>{l.phone}</a></td>
                        <td style={{ padding: '7px 8px', color: 'rgba(245,240,232,.5)' }}>{(l.loan_type || '-').replace(/_/g, ' ')}</td>
                        <td style={{ padding: '7px 8px' }}><StatusBadge s={l.status} /></td>
                        <td style={{ padding: '7px 8px', color: l.assigned_to ? 'rgba(245,240,232,.5)' : '#C9A84C', fontSize: 10 }}>{l.assigned_to || 'Unassigned'}</td>
                        <td style={{ padding: '7px 8px', color: 'rgba(245,240,232,.3)' }}>{dt(l.created_at)}</td>
                      </tr>
                    ))}
                    {webLeads.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'rgba(245,240,232,.2)' }}>No leads yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Team performance */}
            <div style={{ background: '#151515', borderRadius: 14, border: '1px solid rgba(255,255,255,.06)', padding: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: '#F5F0E8' }}>Team Performance</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead><tr>{['Employee', 'Leads', 'Converted', 'Pending'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: 'rgba(245,240,232,.3)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 10, textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {Object.entries(empStats).map(([k, s]) => (
                    <tr key={k}>
                      <td style={{ padding: '7px 8px', fontWeight: 600, color: '#F5F0E8' }}>{k}</td>
                      <td style={{ padding: '7px 8px' }}>{s.total}</td>
                      <td style={{ padding: '7px 8px', color: '#4ade80' }}>{s.conv}</td>
                      <td style={{ padding: '7px 8px', color: '#C9A84C' }}>{s.new}</td>
                    </tr>
                  ))}
                  {Object.keys(empStats).length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 16, color: 'rgba(245,240,232,.2)' }}>Assign leads to see performance</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── LEADS ── */}
        {tab === 'leads' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {['all', 'new', 'contacted', 'converted', 'rejected'].map(s => (
                <button key={s} onClick={() => setLeadFilter(s)} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: leadFilter === s ? '1px solid rgba(201,168,76,.3)' : '1px solid rgba(255,255,255,.06)', background: leadFilter === s ? 'rgba(201,168,76,.12)' : 'rgba(255,255,255,.03)', color: leadFilter === s ? '#C9A84C' : 'rgba(245,240,232,.4)', textTransform: 'capitalize' }}>{s}</button>
              ))}
              <input placeholder="Search name / phone / email..." value={leadSearch} onChange={e => setLeadSearch(e.target.value)} style={{ marginLeft: 'auto', width: 220, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', color: '#F5F0E8', borderRadius: 8, padding: '5px 12px', fontSize: 11, outline: 'none' }} />
            </div>
            <div style={{ background: '#151515', borderRadius: 14, border: '1px solid rgba(255,255,255,.06)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead><tr>{['#', 'Name', 'Phone', 'Loan', 'Amount', 'Source', 'Status', 'Assign', 'Date', 'Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: '9px 10px', color: 'rgba(245,240,232,.3)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 10, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {filteredLeads.map(l => (
                    <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                      <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.3)' }}>#{l.id}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: '#F5F0E8', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => setDetailLead(l)}>{l.name}</td>
                      <td style={{ padding: '8px 10px' }}><a href={`tel:${l.phone}`} style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{l.phone}</a></td>
                      <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.5)', whiteSpace: 'nowrap' }}>{(l.loan_type || '-').replace(/_/g, ' ')}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#C9A84C' }}>{l.amount ? `₹${Number(l.amount).toLocaleString('en-IN')}` : '-'}</td>
                      <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.3)', fontSize: 10 }}>{(l.source || 'web').replace(/_/g, ' ')}</td>
                      <td style={{ padding: '8px 10px' }}><StatusBadge s={l.status} /></td>
                      <td style={{ padding: '8px 10px' }}>
                        <select value={l.assigned_to || ''} onChange={e => assignLead(l.id, e.target.value)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', color: '#F5F0E8', borderRadius: 6, padding: '3px 6px', fontSize: 10, outline: 'none', minWidth: 90 }}>
                          <option value="">Assign</option>
                          {emps.map(emp => <option key={emp.emp_id} value={emp.emp_id}>{emp.name}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.3)', whiteSpace: 'nowrap' }}>{dt(l.created_at)}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <select value={l.status || 'new'} onChange={e => setStatus(l.id, e.target.value)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', color: '#F5F0E8', borderRadius: 6, padding: '3px 6px', fontSize: 10, outline: 'none' }}>
                            {['new', 'contacted', 'converted', 'rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button onClick={() => setFileModal({ leadId: l.id, existing: files.find(f => f.lead_id === l.id) })} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.06)', color: 'rgba(245,240,232,.5)', cursor: 'pointer', padding: '3px 8px', borderRadius: 6, fontSize: 10 }}>File</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', padding: 32, color: 'rgba(245,240,232,.2)' }}>No leads found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── FILES ── */}
        {tab === 'files' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {['all', 'new', 'docs_pending', 'pd_scheduled', 'pd_done', 'verification', 'bank_submitted', 'sanctioned', 'disbursed', 'rejected'].map(s => (
                <button key={s} onClick={() => setFileFilter(s)} style={{ padding: '5px 10px', borderRadius: 8, fontSize: 10, fontWeight: 600, cursor: 'pointer', border: fileFilter === s ? '1px solid rgba(201,168,76,.3)' : '1px solid rgba(255,255,255,.06)', background: fileFilter === s ? 'rgba(201,168,76,.12)' : 'rgba(255,255,255,.03)', color: fileFilter === s ? '#C9A84C' : 'rgba(245,240,232,.4)', textTransform: 'capitalize' }}>{s.replace(/_/g, ' ')}</button>
              ))}
            </div>
            <div style={{ background: '#151515', borderRadius: 14, border: '1px solid rgba(255,255,255,.06)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead><tr>{['Lead', 'Assigned', 'Stage', 'PD', 'Verification', 'Bank', 'Sanction', 'Docs Pending', 'Updated', 'Edit'].map(h => <th key={h} style={{ textAlign: 'left', padding: '9px 10px', color: 'rgba(245,240,232,.3)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 10, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {filteredFiles.map(f => {
                    const lead = leads.find(l => l.id === f.lead_id) || {} as Lead;
                    return (
                      <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                        <td style={{ padding: '8px 10px' }}><div style={{ fontWeight: 600, color: '#F5F0E8' }}>{lead.name || `#${f.lead_id}`}</div><div style={{ fontSize: 9, color: 'rgba(245,240,232,.3)' }}>{(lead.loan_type || '').replace(/_/g, ' ')}</div></td>
                        <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.5)' }}>{f.assigned_to || '-'}</td>
                        <td style={{ padding: '8px 10px' }}><StatusBadge s={f.stage} /></td>
                        <td style={{ padding: '8px 10px' }}><StatusBadge s={f.pd_status} /></td>
                        <td style={{ padding: '8px 10px' }}><StatusBadge s={f.verification_status} /></td>
                        <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.5)' }}>{f.bank_submitted || '-'}</td>
                        <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#C9A84C' }}>{f.sanction_amount ? `₹${f.sanction_amount.toLocaleString('en-IN')}` : '-'}</td>
                        <td style={{ padding: '8px 10px', fontSize: 10, color: 'rgba(245,240,232,.4)', maxWidth: 140 }}>{(f.docs_pending || []).join(', ') || '-'}</td>
                        <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.3)', whiteSpace: 'nowrap' }}>{dt(f.updated_at)}</td>
                        <td style={{ padding: '8px 10px' }}><button onClick={() => setFileModal({ leadId: f.lead_id, existing: f })} style={{ ...btnS as unknown as React.CSSProperties, fontSize: 10, padding: '4px 10px' }}>Edit</button></td>
                      </tr>
                    );
                  })}
                  {filteredFiles.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', padding: 32, color: 'rgba(245,240,232,.2)' }}>No files tracked yet. Click "File" on any lead.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TEAM ── */}
        {tab === 'team' && (
          <div style={{ background: '#151515', borderRadius: 14, border: '1px solid rgba(255,255,255,.06)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead><tr>{['ID', 'Name', 'Phone', 'Email', 'Role', 'Last Login', 'Leads', 'Status', 'Action'].map(h => <th key={h} style={{ textAlign: 'left', padding: '9px 10px', color: 'rgba(245,240,232,.3)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 10, textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
              <tbody>
                {emps.map(e => {
                  const lc = leads.filter(l => l.assigned_to === e.emp_id).length;
                  return (
                    <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#60a5fa' }}>{e.emp_id}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: '#F5F0E8' }}>{e.name}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{e.phone}</td>
                      <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.5)' }}>{e.email || '-'}</td>
                      <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.5)' }}>{e.role}</td>
                      <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.3)', whiteSpace: 'nowrap' }}>{dt(e.last_login)}</td>
                      <td style={{ padding: '8px 10px' }}>{lc}</td>
                      <td style={{ padding: '8px 10px' }}><StatusBadge s={e.is_active ? 'converted' : 'rejected'} /></td>
                      <td style={{ padding: '8px 10px' }}><button onClick={() => toggleEmpStatus(e.id, !e.is_active)} style={{ ...btnS as unknown as React.CSSProperties, fontSize: 10, padding: '4px 10px' }}>{e.is_active ? 'Deactivate' : 'Activate'}</button></td>
                    </tr>
                  );
                })}
                {emps.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'rgba(245,240,232,.2)' }}>No employees. Add one to get started.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ── NRI ── */}
        {tab === 'nri' && (
          <div style={{ background: '#151515', borderRadius: 14, border: '1px solid rgba(255,255,255,.06)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead><tr>{['Name', 'Email', 'Phone', 'Country', 'Product', 'Status', 'Date'].map(h => <th key={h} style={{ textAlign: 'left', padding: '9px 10px', color: 'rgba(245,240,232,.3)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 10, textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
              <tbody>
                {nri.map(n => (
                  <tr key={n.id} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: '#F5F0E8' }}>{n.name}</td>
                    <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.5)' }}>{n.email}</td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{n.phone}</td>
                    <td style={{ padding: '8px 10px', color: '#C9A84C' }}>{n.country}</td>
                    <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.5)' }}>{(n.product || '-').replace(/_/g, ' ')}</td>
                    <td style={{ padding: '8px 10px' }}><StatusBadge s={n.status} /></td>
                    <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.3)', whiteSpace: 'nowrap' }}>{dt(n.created_at)}</td>
                  </tr>
                ))}
                {nri.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'rgba(245,240,232,.2)' }}>No NRI registrations yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ── CAREERS ── */}
        {tab === 'careers' && (
          <div style={{ background: '#151515', borderRadius: 14, border: '1px solid rgba(255,255,255,.06)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead><tr>{['Name', 'Phone', 'Email', 'Experience', 'Notes', 'Status', 'Date', 'Action'].map(h => <th key={h} style={{ textAlign: 'left', padding: '9px 10px', color: 'rgba(245,240,232,.3)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 10, textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
              <tbody>
                {careers.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: '#F5F0E8' }}>{c.name}</td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}><a href={`tel:${c.phone}`} style={{ color: '#60a5fa' }}>{c.phone}</a></td>
                    <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.5)' }}>{c.email || '-'}</td>
                    <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.5)' }}>{c.amount || '-'}</td>
                    <td style={{ padding: '8px 10px', fontSize: 10, color: 'rgba(245,240,232,.4)', maxWidth: 150 }}>{(c.notes || '-').substring(0, 60)}</td>
                    <td style={{ padding: '8px 10px' }}><StatusBadge s={c.status} /></td>
                    <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.3)', whiteSpace: 'nowrap' }}>{dt(c.created_at)}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <select value={c.status || 'new'} onChange={e => setStatus(c.id, e.target.value)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', color: '#F5F0E8', borderRadius: 6, padding: '3px 6px', fontSize: 10, outline: 'none' }}>
                        {['new', 'contacted', 'converted', 'rejected'].map(s => <option key={s} value={s}>{s === 'converted' ? 'Hired' : s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {careers.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'rgba(245,240,232,.2)' }}>No career applications yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ── CIBIL ── */}
        {tab === 'cibil' && (
          <div style={{ background: '#151515', borderRadius: 14, border: '1px solid rgba(255,255,255,.06)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead><tr>{['PAN', 'Score', 'Rating', 'Source', 'Date'].map(h => <th key={h} style={{ textAlign: 'left', padding: '9px 10px', color: 'rgba(245,240,232,.3)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 10, textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
              <tbody>
                {cibil.map(c => {
                  const sc = c.score || 0;
                  const col = sc >= 750 ? '#4ade80' : sc >= 650 ? '#C9A84C' : '#f87171';
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: 'rgba(245,240,232,.7)' }}>{c.pan_number}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: col, fontFamily: 'monospace' }}>{c.score}</td>
                      <td style={{ padding: '8px 10px', color: col }}>{c.rating}</td>
                      <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.4)' }}>{c.source}</td>
                      <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.3)', whiteSpace: 'nowrap' }}>{dt(c.checked_at)}</td>
                    </tr>
                  );
                })}
                {cibil.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'rgba(245,240,232,.2)' }}>No CIBIL checks yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ── RATES ── */}
        {tab === 'rates' && (
          <div style={{ background: '#151515', borderRadius: 14, border: '1px solid rgba(255,255,255,.06)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead><tr>{['Product', 'Bank', 'Min Rate', 'Max Rate', 'Min CIBIL', 'Tenure', 'Fee'].map(h => <th key={h} style={{ textAlign: 'left', padding: '9px 10px', color: 'rgba(245,240,232,.3)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 10, textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
              <tbody>
                {rates.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: '#F5F0E8', textTransform: 'capitalize' }}>{(r.product || '').replace(/_/g, ' ')}</td>
                    <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.7)' }}>{r.bank_name}</td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#4ade80', fontWeight: 600 }}>{r.min_rate}%</td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: 'rgba(245,240,232,.5)' }}>{r.max_rate}%</td>
                    <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.5)' }}>{r.min_cibil || '-'}</td>
                    <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.5)' }}>{r.max_tenure ? `${r.max_tenure} mo` : '-'}</td>
                    <td style={{ padding: '8px 10px', color: 'rgba(245,240,232,.4)' }}>{r.processing_fee || '-'}</td>
                  </tr>
                ))}
                {rates.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'rgba(245,240,232,.2)' }}>No rates. Add bank rates in Supabase.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── ADD LEAD MODAL ── */}
      <Modal open={showAddLead} onClose={() => setShowAddLead(false)} title="Add New Lead">
        <form onSubmit={addLead} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input name="name" required placeholder="Full Name *" style={{ ...inp as unknown as React.CSSProperties }} />
            <input name="phone" required placeholder="Phone *" style={{ ...inp as unknown as React.CSSProperties }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input name="email" placeholder="Email" style={{ ...inp as unknown as React.CSSProperties }} />
            <select name="loan_type" required style={{ ...inp as unknown as React.CSSProperties }}>
              <option value="">Loan Type *</option>
              {['personal_loan', 'business_loan', 'home_loan', 'lap', 'car_loan', 'working_capital'].map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input name="amount" placeholder="Loan Amount" style={{ ...inp as unknown as React.CSSProperties }} />
            <select name="assigned_to" style={{ ...inp as unknown as React.CSSProperties }}>
              <option value="">Assign to SE</option>
              {emps.filter(e => e.is_active).map(e => <option key={e.emp_id} value={e.emp_id}>{e.name}</option>)}
            </select>
          </div>
          <textarea name="notes" rows={2} placeholder="Notes" style={{ ...inp as unknown as React.CSSProperties, resize: 'none' }} />
          <button type="submit" style={{ ...btnP as unknown as React.CSSProperties, padding: '10px 0' }}>Create Lead</button>
        </form>
      </Modal>

      {/* ── ADD EMPLOYEE MODAL ── */}
      <Modal open={showAddEmp} onClose={() => setShowAddEmp(false)} title="Add Employee">
        <form onSubmit={addEmployee} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input name="emp_id" required placeholder="Employee ID (eg SE002) *" style={{ ...inp as unknown as React.CSSProperties, fontFamily: 'monospace' }} />
            <input name="name" required placeholder="Full Name *" style={{ ...inp as unknown as React.CSSProperties }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input name="phone" required placeholder="Phone *" style={{ ...inp as unknown as React.CSSProperties }} />
            <input name="email" placeholder="Email" style={{ ...inp as unknown as React.CSSProperties }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <select name="role" style={{ ...inp as unknown as React.CSSProperties }}>
              <option value="sales_executive">Sales Executive</option>
              <option value="team_lead">Team Lead</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <input name="password" type="password" required placeholder="Password *" style={{ ...inp as unknown as React.CSSProperties }} />
          </div>
          <button type="submit" style={{ ...btnP as unknown as React.CSSProperties, padding: '10px 0' }}>Add Employee</button>
        </form>
      </Modal>

      {/* ── LEAD DETAIL MODAL ── */}
      <Modal open={!!detailLead} onClose={() => setDetailLead(null)} title={detailLead ? `${detailLead.name} — #${detailLead.id}` : ''}>
        {detailLead && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                ['Phone', <a href={`tel:${detailLead.phone}`} style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{detailLead.phone}</a>],
                ['Email', detailLead.email || '-'],
                ['Loan Type', (detailLead.loan_type || '-').replace(/_/g, ' ')],
                ['Amount', detailLead.amount ? `₹${Number(detailLead.amount).toLocaleString('en-IN')}` : '-'],
                ['Status', <StatusBadge s={detailLead.status} />],
                ['Assigned', detailLead.assigned_to || 'Unassigned'],
                ['Source', (detailLead.source || 'website').replace(/_/g, ' ')],
                ['Date', dt(detailLead.created_at)],
              ].map(([label, val], i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10, color: 'rgba(245,240,232,.3)', marginBottom: 3 }}>{label as string}</div>
                  <div style={{ fontSize: 12, color: '#F5F0E8' }}>{val as React.ReactNode}</div>
                </div>
              ))}
            </div>
            {detailLead.notes && (
              <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: 'rgba(245,240,232,.3)', marginBottom: 3 }}>Notes / Details</div>
                <div style={{ fontSize: 11, color: 'rgba(245,240,232,.6)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{detailLead.notes.replace(/\|/g, '\n')}</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <a href={`tel:${detailLead.phone}`} style={{ flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 8, background: '#C9A84C', color: '#0D0D0D', fontWeight: 600, fontSize: 12, textDecoration: 'none' }}>Call</a>
              <a href={`https://wa.me/91${detailLead.phone}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 8, background: 'rgba(37,211,102,.1)', color: '#25d366', border: '1px solid rgba(37,211,102,.2)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>WhatsApp</a>
              <button onClick={() => { setDetailLead(null); setFileModal({ leadId: detailLead.id, existing: files.find(f => f.lead_id === detailLead.id) }); }} style={{ flex: 1, padding: '9px 0', borderRadius: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.06)', color: 'rgba(245,240,232,.7)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Update File</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── FILE STATUS MODAL ── */}
      <Modal open={!!fileModal} onClose={() => setFileModal(null)} title="Update File Status">
        {fileModal && (
          <form onSubmit={updateFile} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 10, color: 'rgba(245,240,232,.4)', display: 'block', marginBottom: 4 }}>Stage</label>
                <select name="stage" defaultValue={fileModal.existing?.stage || 'new'} style={{ ...inp as unknown as React.CSSProperties }}>
                  {['new', 'docs_collected', 'docs_pending', 'pd_scheduled', 'pd_done', 'verification', 'bank_submitted', 'sanctioned', 'disbursed', 'rejected'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, color: 'rgba(245,240,232,.4)', display: 'block', marginBottom: 4 }}>Assigned To</label>
                <select name="assigned_to" defaultValue={fileModal.existing?.assigned_to || ''} style={{ ...inp as unknown as React.CSSProperties }}>
                  <option value="">Select</option>
                  {emps.filter(e => e.is_active).map(e => <option key={e.emp_id} value={e.emp_id}>{e.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 10, color: 'rgba(245,240,232,.4)', display: 'block', marginBottom: 4 }}>PD Status</label>
                <select name="pd_status" defaultValue={fileModal.existing?.pd_status || 'not_started'} style={{ ...inp as unknown as React.CSSProperties }}>
                  {['not_started', 'scheduled', 'done'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, color: 'rgba(245,240,232,.4)', display: 'block', marginBottom: 4 }}>Verification</label>
                <select name="verification" defaultValue={fileModal.existing?.verification_status || 'not_started'} style={{ ...inp as unknown as React.CSSProperties }}>
                  {['not_started', 'in_progress', 'done'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 10, color: 'rgba(245,240,232,.4)', display: 'block', marginBottom: 4 }}>Bank Submitted To</label>
                <input name="bank" defaultValue={fileModal.existing?.bank_submitted || ''} placeholder="Bank name" style={{ ...inp as unknown as React.CSSProperties }} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: 'rgba(245,240,232,.4)', display: 'block', marginBottom: 4 }}>Sanction Amount</label>
                <input name="sanction_amount" type="number" defaultValue={fileModal.existing?.sanction_amount || ''} placeholder="₹" style={{ ...inp as unknown as React.CSSProperties }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'rgba(245,240,232,.4)', display: 'block', marginBottom: 4 }}>Docs Pending (comma separated)</label>
              <input name="docs_pending" defaultValue={(fileModal.existing?.docs_pending || []).join(', ')} placeholder="PAN, Aadhaar, bank statement..." style={{ ...inp as unknown as React.CSSProperties }} />
            </div>
            <textarea name="remarks" defaultValue={fileModal.existing?.remarks || ''} rows={2} placeholder="Remarks / notes" style={{ ...inp as unknown as React.CSSProperties, resize: 'none' }} />
            <button type="submit" style={{ ...btnP as unknown as React.CSSProperties, padding: '10px 0' }}>Update File</button>
          </form>
        )}
      </Modal>
    </div>
  );
}
