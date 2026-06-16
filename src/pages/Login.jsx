import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, Lock, Mail, AlertCircle, Activity } from 'lucide-react';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) navigate('/dashboard');
    else setError(result.error || 'Invalid credentials.');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0c4a6e 0%, #0891b2 50%, #06b6d4 100%)' }}
      className="flex items-center justify-center p-4">

      {/* Glass card */}
      <div style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '420px',
        overflow: 'hidden',
      }}>

        {/* Top banner */}
        <div style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)', padding: '32px 40px 28px' }}>
          <div className="flex items-center gap-3 mb-2">
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '10px' }}>
              <Eye size={26} color="white" />
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Albacete</p>
              <p style={{ color: 'white', fontSize: '18px', fontWeight: 800, lineHeight: 1 }}>Eye Clinic</p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginTop: '8px' }}>Clinic Management System</p>
        </div>

        {/* Form */}
        <div style={{ padding: '32px 40px 36px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>Welcome back</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '28px' }}>Sign in to your account to continue</p>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '12px', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '20px', color: '#dc2626', fontSize: '13px'
            }}>
              <AlertCircle size={16} />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@albaceteclinic.com"
                  style={{
                    width: '100%', paddingLeft: '40px', paddingRight: '14px',
                    paddingTop: '11px', paddingBottom: '11px',
                    border: '1.5px solid #e2e8f0', borderRadius: '12px',
                    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => e.target.style.borderColor = '#0891b2'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="password" required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', paddingLeft: '40px', paddingRight: '14px',
                    paddingTop: '11px', paddingBottom: '11px',
                    border: '1.5px solid #e2e8f0', borderRadius: '12px',
                    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => e.target.style.borderColor = '#0891b2'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0891b2, #0e7490)',
                color: 'white', border: 'none', borderRadius: '12px',
                fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(8,145,178,0.4)',
                transition: 'all 0.2s', fontFamily: 'inherit', marginTop: '4px',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '28px', lineHeight: 1.6 }}>
            Authorized personnel only. Access is monitored.<br />
            &copy; 2026 Albacete Eye Center &amp; Medical Clinics
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
