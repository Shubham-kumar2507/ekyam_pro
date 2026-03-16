import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function CreateCommunity() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', description: '', location: '', category: '', latitude: '', longitude: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const payload = { ...form, coordinates: { latitude: form.latitude ? Number(form.latitude) : null, longitude: form.longitude ? Number(form.longitude) : null, address: form.location } };
            const { data } = await api.post('/communities', payload);
            navigate(`/communities/${data._id}`);
        } catch (err) { setError(err.response?.data?.message || 'Error creating community'); }
        setLoading(false);
    };

    const inputStyle = { width: '100%', padding: '0.7rem 1rem', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '0.95rem', background: '#f9fafb', outline: 'none' };
    const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' };

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '3rem 1rem' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)', padding: '2rem', textAlign: 'center', color: '#fff' }}>
                        <i className="fas fa-users" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block' }}></i>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Create Community</h1>
                        <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>Build a new community space</p>
                    </div>
                    <div style={{ padding: '2rem' }}>
                        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem' }}><i className="fas fa-exclamation-circle" style={{ marginRight: '0.5rem' }}></i>{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}><label style={labelStyle}>Community Name *</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} required /></div>
                            <div style={{ marginBottom: '1rem' }}><label style={labelStyle}>Description *</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} style={{ ...inputStyle, resize: 'vertical' }} required /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div><label style={labelStyle}>Location *</label><input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={inputStyle} required /></div>
                                <div><label style={labelStyle}>Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}><option value="">Select</option><option value="education">Education</option><option value="environment">Environment</option><option value="health">Health</option><option value="technology">Technology</option><option value="social">Social</option><option value="other">Other</option></select></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div><label style={labelStyle}>Latitude</label><input type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} style={inputStyle} placeholder="e.g. 28.6139" /></div>
                                <div><label style={labelStyle}>Longitude</label><input type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} style={inputStyle} placeholder="e.g. 77.2090" /></div>
                            </div>
                            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', background: loading ? '#9ca3af' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
                                {loading ? 'Creating...' : 'Create Community'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
