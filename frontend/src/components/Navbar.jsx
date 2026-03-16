import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, mode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropOpen, setDropOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/'); };

    const navStyle = { background: theme.navBg, color: '#fff', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 12px rgba(0,0,0,0.15)', transition: 'background-color 0.3s ease' };
    const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
    const linkStyle = { color: theme.navText, textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem', padding: '0.25rem 0' };
    const linkHoverStyle = { color: theme.navHover };
    const logoStyle = { color: '#fff', textDecoration: 'none', fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '1px' };

    const navLinks = [
        { to: user ? '/dashboard' : '/', label: 'Home' },
        { to: '/projects', label: 'Projects' },
        { to: '/resources', label: 'Resources' },
        { to: '/communities', label: 'Communities' },
        ...(user ? [{ to: '/feed', label: 'Feed' }, { to: '/network', label: 'Network' }] : []),
        { to: '/map', label: 'Map' },
        { to: '/contact', label: 'Contact' },
    ];

    const themeToggleBtn = (
        <button onClick={toggleTheme}
            title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', padding: '0.4rem 0.55rem', borderRadius: '8px', cursor: 'pointer',
                fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >
            <i className={mode === 'light' ? 'fas fa-moon' : 'fas fa-sun'} style={{ fontSize: '0.9rem' }}></i>
        </button>
    );

    return (
        <nav style={navStyle}>
            <div style={containerStyle}>
                <Link to={user ? '/dashboard' : '/'} style={logoStyle}>
                    <i className="fas fa-people-group"></i> EKYAM
                </Link>

                {/* Desktop Nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}
                    className="desktop-nav">
                    {navLinks.map(l => (
                        <Link key={l.to + l.label} to={l.to} style={linkStyle}
                            onMouseEnter={e => e.target.style.color = linkHoverStyle.color}
                            onMouseLeave={e => e.target.style.color = linkStyle.color}>
                            {l.label}
                        </Link>
                    ))}
                </div>

                {/* Auth + Theme Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {themeToggleBtn}
                    {user ? (
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setDropOpen(!dropOpen)}
                                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fas fa-user-circle"></i>
                                {user.username}
                                <i className={`fas fa-chevron-${dropOpen ? 'up' : 'down'}`} style={{ fontSize: '0.65rem' }}></i>
                            </button>
                            {dropOpen && (
                                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', background: theme.navDropBg, borderRadius: '10px', boxShadow: theme.shadowLg, width: '200px', overflow: 'hidden', zIndex: 100, border: `1px solid ${theme.border}` }}>
                                    {[{ to: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
                                    { to: '/profile', icon: 'fas fa-user', label: 'Profile' },
                                    { to: '/settings', icon: 'fas fa-cog', label: 'Settings' }].map(item => (
                                        <Link key={item.to} to={item.to} onClick={() => setDropOpen(false)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: theme.navDropText, textDecoration: 'none', fontSize: '0.9rem', borderBottom: `1px solid ${theme.navDropBorder}` }}
                                            onMouseEnter={e => e.currentTarget.style.background = theme.navDropHover}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <i className={item.icon} style={{ color: theme.accent, width: '18px', textAlign: 'center' }}></i>
                                            {item.label}
                                        </Link>
                                    ))}
                                    <button onClick={handleLogout}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: theme.error, background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}
                                        onMouseEnter={e => e.currentTarget.style.background = theme.errorBg}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <i className="fas fa-sign-out-alt" style={{ width: '18px', textAlign: 'center' }}></i>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" style={{ ...linkStyle, fontWeight: '600' }}
                                onMouseEnter={e => e.target.style.color = '#fff'}
                                onMouseLeave={e => e.target.style.color = linkStyle.color}>
                                Login
                            </Link>
                            <Link to="/register"
                                style={{ background: '#fff', color: '#4338ca', padding: '0.5rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' }}
                                onMouseEnter={e => e.target.style.background = '#e0e7ff'}
                                onMouseLeave={e => e.target.style.background = '#fff'}>
                                Join Us
                            </Link>
                        </>
                    )}

                    {/* Mobile burger */}
                    <button onClick={() => setMenuOpen(!menuOpen)}
                        className="mobile-burger"
                        style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer', display: 'none' }}>
                        <i className={`fas fa-${menuOpen ? 'times' : 'bars'}`}></i>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div style={{ background: theme.navMobileBg, padding: '1rem' }} className="mobile-menu">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {navLinks.map(l => (
                            <Link key={l.to + l.label} to={l.to} onClick={() => setMenuOpen(false)}
                                style={{ color: theme.navText, textDecoration: 'none', padding: '0.6rem 0.75rem', borderRadius: '6px', fontWeight: '500' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                {l.label}
                            </Link>
                        ))}
                        {user ? (
                            <>
                                <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ color: theme.navText, textDecoration: 'none', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>Dashboard</Link>
                                <Link to="/profile" onClick={() => setMenuOpen(false)} style={{ color: theme.navText, textDecoration: 'none', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>Profile</Link>
                                <Link to="/settings" onClick={() => setMenuOpen(false)} style={{ color: theme.navText, textDecoration: 'none', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>Settings</Link>
                                <button onClick={handleLogout} style={{ color: '#fca5a5', background: 'transparent', border: 'none', textAlign: 'left', padding: '0.6rem 0.75rem', cursor: 'pointer', fontSize: '0.95rem' }}>Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ color: theme.navText, textDecoration: 'none', padding: '0.6rem 0.75rem' }}>Login</Link>
                                <Link to="/register" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.15)', borderRadius: '6px', fontWeight: '600', textAlign: 'center' }}>Join Us</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
