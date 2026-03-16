import { useState } from 'react';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        setForm({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', paddingTop: '3rem', paddingBottom: '3rem' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: '#e0e7ff', borderRadius: '50%', marginBottom: '1rem' }}>
                        <i className="fas fa-envelope" style={{ fontSize: '28px', color: '#4f46e5' }}></i>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>Contact Us</h1>
                    <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Have a question or suggestion? We'd love to hear from you.</p>
                </div>

                {sent && (
                    <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46', padding: '1rem 1.5rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <i className="fas fa-check-circle"></i>
                        <span>Thank you! Your message has been sent successfully. We'll get back to you soon.</span>
                    </div>
                )}

                <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', padding: '2rem' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Your Name *</label>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                                    style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Email *</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                                    style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }} />
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Subject *</label>
                            <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required
                                style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }} />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Message *</label>
                            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5} required
                                style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', resize: 'vertical' }} />
                        </div>
                        <button type="submit"
                            style={{ width: '100%', padding: '0.8rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' }}>
                            Send Message
                        </button>
                    </form>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                    {[['fas fa-map-marker-alt', 'Address', '123 Community Lane, Unity City'],
                    ['fas fa-phone', 'Phone', '+91 9876 543 210'],
                    ['fas fa-envelope', 'Email', 'support@ekyam.org']].map(([icon, title, val]) => (
                        <div key={title} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: '#e0e7ff', borderRadius: '50%', marginBottom: '0.75rem' }}>
                                <i className={icon} style={{ color: '#4f46e5' }}></i>
                            </div>
                            <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>{title}</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{val}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
