import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, Lock, Mail, AlertCircle, ArrowRight, Shield, Clock, Users } from 'lucide-react';

const s = {
  // Layout
  page:   { display:'flex', minHeight:'100vh', fontFamily:"'Noto Sans',system-ui,sans-serif" },
  left:   { flex:1, background:'linear-gradient(160deg,#0c4a6e 0%,#0891b2 60%,#22d3ee 100%)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'48px', position:'relative', overflow:'hidden' },
  right:  { width:'480px', flexShrink:0, background:'#fff', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 56px' },
  // Left panel
  logoRow:{ display:'flex', alignItems:'center', gap:'12px' },
  logoBox:{ background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', borderRadius:'14px', padding:'11px', display:'flex', border:'1px solid rgba(255,255,255,0.2)' },
  logoTxt:{ color:'white', fontWeight:800, fontSize:'20px', letterSpacing:'-0.02em' },
  logoSub:{ color:'rgba(255,255,255,0.6)', fontSize:'11px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' },
  headline:{ color:'white', fontSize:'36px', fontWeight:800, lineHeight:1.2, letterSpacing:'-0.02em', margin:'0 0 16px' },
  sub:    { color:'rgba(255,255,255,0.75)', fontSize:'16px', lineHeight:1.6, margin:0 },
  featureList:{ display:'flex', flexDirection:'column', gap:'14px', marginTop:'40px' },
  featureItem:{ display:'flex', alignItems:'center', gap:'12px', color:'rgba(255,255,255,0.85)', fontSize:'14px', fontWeight:500 },
  featureIcon:{ background:'rgba(255,255,255,0.15)', borderRadius:'8px', padding:'7px', display:'flex', flexShrink:0 },
  // Decorative circles
  circle1:{ position:'absolute', top:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' },
  circle2:{ position:'absolute', bottom:'-60px', left:'-60px', width:'240px', height:'240px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' },
  // Right panel
  tag:    { display:'inline-flex', alignItems:'center', gap:'6px', background:'#f0f9ff', color:'#0891b2', fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', padding:'5px 10px', borderRadius:'999px', marginBottom:'28px' },
  h1:     { fontSize:'28px', fontWeight:800, color:'#0f172a', letterSpacing:'-0.02em', margin:'0 0 6px' },
  desc:   { fontSize:'14px', color:'#64748b', margin:'0 0 36px' },
  label:  { display:'block', fontSize:'12px', fontWeight:700, color:'#374151', marginBottom:'6px', letterSpacing:'0.02em' },
  inputWrap:{ position:'relative', marginBottom:'20px' },
  inputIcon:{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af', pointerEvents:'none', display:'flex' },
  input:  { width:'100%', paddingLeft:'42px', paddingRight:'14px', paddingTop:'12px', paddingBottom:'12px', border:'1.5px solid #e2e8f0', borderRadius:'12px', fontSize:'14px', outline:'none', boxSizing:'border-box', fontFamily:'inherit', color:'#0f172a', transition:'border-color 0.15s, box-shadow 0.15s', background:'#fafafa' },
  btn:    { width:'100%', padding:'14px', background:'linear-gradient(135deg,#0891b2,#0c4a6e)', color:'white', border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:'0 4px 20px rgba(8,145,178,0.35)', transition:'opacity 0.15s, transform 0.15s', fontFamily:'inherit', marginTop:'8px' },
  btnDis: { width:'100%', padding:'14px', background:'#cbd5e1', color:'white', border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:700, cursor:'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontFamily:'inherit', marginTop:'8px' },
  err:    { background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', padding:'10px 14px', display:'flex', alignItems:'center', gap:'8px', color:'#dc2626', fontSize:'13px', marginBottom:'20px' },
  footer: { fontSize:'11px', color:'#94a3b8', textAlign:'center', marginTop:'32px', lineHeight:1.7 },
};

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    const r = await login(email, password);
    if (r.success) navigate('/dashboard');
    else setError(r.error || 'Invalid credentials. Please try again.');
    setLoading(false);
  };

  const focusInput  = e => { e.target.style.borderColor='#0891b2'; e.target.style.boxShadow='0 0 0 3px rgba(8,145,178,0.12)'; e.target.style.background='#fff'; };
  const blurInput   = e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; e.target.style.background='#fafafa'; };

  return (
    <div style={s.page}>
      {/* ── Left panel ── */}
      <div style={s.left}>
        <div style={s.circle1}/><div style={s.circle2}/>
        <div style={s.logoRow}>
          <div style={s.logoBox}><Eye size={24} color="white"/></div>
          <div><div style={s.logoTxt}>Albacete</div><div style={s.logoSub}>Eye Clinic</div></div>
        </div>
        <div>
          <h2 style={s.headline}>Smart clinic<br/>management,<br/>simplified.</h2>
          <p style={s.sub}>Everything your team needs — patients, appointments, inventory — in one place.</p>
          <div style={s.featureList}>
            {[
              [Users,  'Patient records & visit history'],
              [Clock,  'Appointment scheduling & queue'],
              [Shield, 'Role-based access for every staff member'],
            ].map(([Icon, txt]) => (
              <div key={txt} style={s.featureItem}>
                <div style={s.featureIcon}><Icon size={16} color="white"/></div>
                {txt}
              </div>
            ))}
          </div>
        </div>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px', margin:0 }}>
          &copy; 2026 Albacete Eye Center &amp; Medical Clinics
        </p>
      </div>

      {/* ── Right panel ── */}
      <div style={s.right}>
        <div>
          <div style={s.tag}><Shield size={11}/>Secure Access</div>
          <h1 style={s.h1}>Welcome back</h1>
          <p style={s.desc}>Sign in to your account to continue</p>

          {error && <div style={s.err}><AlertCircle size={15}/>{error}</div>}

          <form onSubmit={submit}>
            <label style={s.label}>Email Address</label>
            <div style={s.inputWrap}>
              <div style={s.inputIcon}><Mail size={16}/></div>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="you@albaceteclinic.com" style={s.input}
                onFocus={focusInput} onBlur={blurInput}/>
            </div>

            <label style={s.label}>Password</label>
            <div style={s.inputWrap}>
              <div style={s.inputIcon}><Lock size={16}/></div>
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••" style={s.input}
                onFocus={focusInput} onBlur={blurInput}/>
            </div>

            <button type="submit" disabled={loading} style={loading ? s.btnDis : s.btn}
              onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.opacity='0.9'; e.currentTarget.style.transform='translateY(-1px)'; }}}
              onMouseLeave={e=>{ e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'; }}>
              {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={16}/></>}
            </button>
          </form>

          <p style={s.footer}>Authorized personnel only. Access is monitored.</p>
        </div>
      </div>
    </div>
  );
}
