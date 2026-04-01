import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
    const { login } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await login(form.username, form.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally { setLoading(false); }
    };

    const inputStyle = {
        width: '100%', padding: '0.75rem 1rem', border: `1px solid ${theme.border}`, borderRadius: '10px',
        fontSize: '0.95rem', background: theme.bgInput, color: theme.text, outline: 'none', transition: 'border-color 0.2s'
    };

    return (
        <div style={{ minHeight: '100vh', background: theme.heroBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>
                <div style={{ background: theme.bgCard, borderRadius: '20px', boxShadow: theme.shadowLg, overflow: 'hidden', border: `1px solid ${theme.border}` }}>
                    {/* Header */}
                    <div style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)', padding: '2.5rem 2rem', textAlign: 'center', color: '#fff' }}>
                        <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <i className="fas fa-user-lock" style={{ fontSize: '24px' }}></i>
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.35rem' }}>Welcome Back</h1>
                        <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>Login to access your communities & projects</p>
                    </div>

                    {/* Form */}
                    <div style={{ padding: '2rem' }}>
                        {error && (
                            <div style={{ background: theme.errorBg, border: `1px solid ${theme.errorBorder}`, color: theme.error, padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fas fa-exclamation-circle"></i> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: theme.textSecondary, marginBottom: '0.4rem' }}>
                                    <i className="fas fa-user" style={{ color: '#6366f1', marginRight: '0.4rem' }}></i>Username or Email
                                </label>
                                <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                                    placeholder="Enter your username or email" style={inputStyle} required
                                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                                    onBlur={e => e.target.style.borderColor = theme.border} />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: theme.textSecondary, marginBottom: '0.4rem' }}>
                                    <i className="fas fa-lock" style={{ color: '#6366f1', marginRight: '0.4rem' }}></i>Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                        placeholder="Enter your password" style={{ ...inputStyle, paddingRight: '2.75rem' }} required
                                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                                        onBlur={e => e.target.style.borderColor = theme.border} />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: theme.textFaint, fontSize: '0.95rem', padding: '0.25rem' }}>
                                        <i className={showPass ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                                    </button>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '1.25rem' }}>
                                <Link to="/forgot-password" style={{ color: theme.accentText, fontSize: '0.85rem', fontWeight: '500', textDecoration: 'none' }}
                                    onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                    onMouseLeave={e => e.target.style.textDecoration = 'none'}>
                                    Forgot Password?
                                </Link>
                            </div>

                            <button type="submit" disabled={loading}
                                style={{
                                    width: '100%', padding: '0.85rem', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #4338ca, #6366f1)',
                                    color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700',
                                    cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', letterSpacing: '0.3px'
                                }}
                                onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 4px 15px rgba(67,56,202,0.3)'; }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}>
                                {loading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>Logging in...</> : 'Login'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: theme.textMuted, fontSize: '0.9rem' }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: theme.accentText, fontWeight: '600', textDecoration: 'none' }}>Create one here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
