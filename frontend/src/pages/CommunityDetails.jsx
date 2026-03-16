import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function CommunityDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [community, setCommunity] = useState(null);
    const [projects, setProjects] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cRes, pRes, rRes] = await Promise.allSettled([
                    api.get(`/communities/${id}`),
                    api.get(`/projects?communityId=${id}`),
                    api.get(`/resources?communityId=${id}`),
                ]);
                if (cRes.status === 'fulfilled') {
                    const c = cRes.value.data;
                    setCommunity(c);
                    if (user) {
                        setIsAdmin(c.adminId?._id === user._id || c.adminId === user._id);
                        setIsMember(c.members?.some(m => (m.userId?._id || m.userId)?.toString() === user._id?.toString()));
                    }
                } else { navigate('/communities'); return; }
                setProjects(pRes.status === 'fulfilled' ? pRes.value.data : []);
                setResources(rRes.status === 'fulfilled' ? rRes.value.data : []);
            } catch { navigate('/communities'); }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const handleJoin = async () => { try { await api.post(`/communities/${id}/join`); setIsMember(true); } catch { } };
    const handleLeave = async () => { if (!confirm('Leave this community?')) return; try { await api.post(`/communities/${id}/leave`); setIsMember(false); } catch { } };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#3c6e71' }}></i></div>;
    if (!community) return null;

    const statusColor = { completed: '#065f46', in_progress: '#1e40af', planning: '#92400e', active: '#065f46', on_hold: '#6b7280' };
    const statusBg = { completed: '#d1fae5', in_progress: '#dbeafe', planning: '#fef3c7', active: '#d1fae5', on_hold: '#f3f4f6' };
    const typeIcons = { document: 'fas fa-file-alt', link: 'fas fa-link', video: 'fas fa-video', image: 'fas fa-image', code: 'fas fa-code', other: 'fas fa-file' };

    return (
        <div style={{ background: '#f8f5f1', minHeight: '100vh', fontFamily: "'Libre Baskerville', Georgia, serif", color: '#2c3e50' }}>
            {/* Header */}
            <header style={{ background: '#fff', borderBottom: '1px solid #d4c9b0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div style={{ width: '96px', height: '96px', background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #d4c9b0', flexShrink: 0 }}>
                            {community.image ? <img src={community.image.startsWith('http') ? community.image : `http://localhost:5000${community.image}`} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                : <i className="fas fa-users" style={{ fontSize: '2.5rem', color: '#6366f1' }}></i>}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: '700', fontFamily: "'Playfair Display', Georgia, serif", marginBottom: '0.4rem' }}>{community.name}</h1>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                                {community.category && <span><i className="fas fa-tag" style={{ marginRight: '0.3rem' }}></i>{community.category}</span>}
                                <span><i className="fas fa-map-marker-alt" style={{ marginRight: '0.3rem' }}></i>{community.location || 'Global'}</span>
                                <span><i className="fas fa-users" style={{ marginRight: '0.3rem' }}></i>{community.memberCount || community.members?.length || 0} members</span>
                                <span><i className="fas fa-calendar-alt" style={{ marginRight: '0.3rem' }}></i>Est. {new Date(community.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                                <div style={{ width: '24px', height: '24px', background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fas fa-user" style={{ fontSize: '0.6rem', color: '#4f46e5' }}></i>
                                </div>
                                Admin: {community.adminId?.fullName || community.adminId?.username || 'Unknown'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {user && !isMember && !isAdmin && (
                                <button onClick={handleJoin} style={{ background: '#3c6e71', color: '#fff', padding: '0.6rem 1.5rem', border: 'none', borderRadius: '4px', fontWeight: '500', cursor: 'pointer' }}>
                                    <i className="fas fa-plus" style={{ marginRight: '0.4rem' }}></i>Join Community
                                </button>
                            )}
                            {user && (isMember || isAdmin) && (
                                <Link to={`/communities/${id}/chat`} style={{ background: '#4f46e5', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '4px', textDecoration: 'none', fontWeight: '500' }}>
                                    <i className="fas fa-comments" style={{ marginRight: '0.3rem' }}></i>Chat
                                </Link>
                            )}
                            {user && isMember && !isAdmin && (
                                <button onClick={handleLeave} style={{ background: '#e5e7eb', color: '#374151', padding: '0.6rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    <i className="fas fa-sign-out-alt" style={{ marginRight: '0.3rem' }}></i>Leave
                                </button>
                            )}
                            {user && isAdmin && (
                                <Link to={`/communities/${id}/dashboard`} style={{ background: '#3c6e71', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '4px', textDecoration: 'none', fontWeight: '500' }}>
                                    <i className="fas fa-tachometer-alt" style={{ marginRight: '0.3rem' }}></i>Dashboard
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Body */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    {/* Left Column */}
                    <div>
                        {/* About */}
                        <div style={{ background: '#fff', borderRadius: '4px', border: '1px solid #d4c9b0', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: "'Playfair Display', Georgia, serif", marginBottom: '1rem' }}>About</h2>
                            <p style={{ color: '#4b5563', lineHeight: '1.7' }}>{community.description}</p>
                        </div>

                        {/* Projects */}
                        <div style={{ background: '#fff', borderRadius: '4px', border: '1px solid #d4c9b0', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: "'Playfair Display', Georgia, serif" }}>Projects</h2>
                                <Link to="/projects" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: '0.9rem' }}>View all <i className="fas fa-arrow-right" style={{ marginLeft: '0.25rem' }}></i></Link>
                            </div>
                            {projects.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                                    <i className="fas fa-project-diagram" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', display: 'block' }}></i>
                                    <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>No projects yet</h3>
                                    <p>This community hasn't started any projects.</p>
                                    {user && (isMember || isAdmin) && <Link to="/create-project" style={{ color: '#4f46e5', marginTop: '0.5rem', display: 'inline-block' }}><i className="fas fa-plus" style={{ marginRight: '0.3rem' }}></i>Create a project</Link>}
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    {projects.slice(0, 4).map(p => (
                                        <div key={p._id} style={{ border: '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden', transition: 'box-shadow 0.3s' }}
                                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                                            <div style={{ height: '140px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                {p.image ? <img src={p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <i className="fas fa-project-diagram" style={{ fontSize: '2.5rem', color: '#c7d2fe' }}></i>}
                                                <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: statusBg[p.status] || '#f3f4f6', color: statusColor[p.status] || '#6b7280', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600' }}>
                                                    {(p.status || 'planning').replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div style={{ padding: '1rem' }}>
                                                <h3 style={{ fontWeight: '600', marginBottom: '0.4rem' }}>{p.name}</h3>
                                                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#9ca3af' }}>
                                                    <span><i className="fas fa-users" style={{ marginRight: '0.25rem' }}></i>{p.memberCount || p.members?.length || 0} members</span>
                                                    <Link to={`/projects/${p._id}`} style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: '500' }}>Details <i className="fas fa-chevron-right" style={{ marginLeft: '0.2rem', fontSize: '0.7rem' }}></i></Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Resources */}
                        <div style={{ background: '#fff', borderRadius: '4px', border: '1px solid #d4c9b0', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: "'Playfair Display', Georgia, serif" }}>Public Resources</h2>
                                <Link to="/resources" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: '0.9rem' }}>View all <i className="fas fa-arrow-right" style={{ marginLeft: '0.25rem' }}></i></Link>
                            </div>
                            {resources.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                                    <i className="fas fa-file-alt" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', display: 'block' }}></i>
                                    <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>No public resources yet</h3>
                                    {user && (isMember || isAdmin) && <Link to="/create-resource" style={{ color: '#4f46e5' }}><i className="fas fa-upload" style={{ marginRight: '0.3rem' }}></i>Share a resource</Link>}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {resources.slice(0, 5).map(r => (
                                        <div key={r._id} style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', transition: 'background 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                                            <div style={{ width: '44px', height: '44px', background: '#eef2ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <i className={typeIcons[r.type] || 'fas fa-file'} style={{ color: '#4f46e5' }}></i>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{r.title}</h3>
                                                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.4rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.description}</p>
                                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                                                    <span><i className="fas fa-user" style={{ marginRight: '0.2rem' }}></i>{r.uploadedBy?.fullName || 'Unknown'}</span>
                                                    <span><i className="fas fa-download" style={{ marginRight: '0.2rem' }}></i>{r.downloadCount || 0} downloads</span>
                                                </div>
                                            </div>
                                            <Link to={`/resources/${r._id}`} style={{ color: '#4f46e5', flexShrink: 0 }}><i className="fas fa-eye"></i></Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div>
                        {/* Members */}
                        <div style={{ background: '#fff', borderRadius: '4px', border: '1px solid #d4c9b0', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.15rem', fontWeight: '700', fontFamily: "'Playfair Display', Georgia, serif" }}>Members</h2>
                            </div>
                            {/* Admin card */}
                            <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem', background: '#eef2ff', borderRadius: '4px', marginBottom: '1rem', gap: '0.75rem' }}>
                                <div style={{ width: '40px', height: '40px', background: '#c7d2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <i className="fas fa-user" style={{ color: '#4f46e5' }}></i>
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{community.adminId?.fullName || community.adminId?.username || 'Admin'}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#4f46e5' }}>Administrator</div>
                                </div>
                            </div>
                            {/* Member list */}
                            {community.members && community.members.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {community.members.filter(m => (m.userId?._id || m.userId)?.toString() !== (community.adminId?._id || community.adminId)?.toString()).slice(0, 8).map((m, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '4px', gap: '0.75rem', transition: 'background 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <div style={{ width: '32px', height: '32px', background: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {m.userId?.profileImage ? <img src={m.userId.profileImage.startsWith('http') ? m.userId.profileImage : `http://localhost:5000${m.userId.profileImage}`} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                    : <i className="fas fa-user" style={{ fontSize: '0.7rem', color: '#6b7280' }}></i>}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '500', fontSize: '0.85rem' }}>{m.userId?.fullName || m.userId?.username || 'Member'}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{m.role || 'member'} • Joined {new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No other members yet.</p>
                            )}
                        </div>

                        {/* Quick Actions */}
                        {user && (isMember || isAdmin) && (
                            <div style={{ background: '#fff', borderRadius: '4px', border: '1px solid #d4c9b0', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <h2 style={{ fontSize: '1.15rem', fontWeight: '700', fontFamily: "'Playfair Display', Georgia, serif", marginBottom: '1rem' }}>Quick Actions</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {[
                                        { to: `/communities/${id}/chat`, icon: 'fas fa-comments', label: 'Community Chat' },
                                        ...(isAdmin ? [
                                            { to: `/communities/${id}/dashboard`, icon: 'fas fa-tachometer-alt', label: 'Admin Dashboard' },
                                            { to: `/communities/${id}/members`, icon: 'fas fa-users-cog', label: 'Manage Members' },
                                        ] : []),
                                        { to: '/create-project', icon: 'fas fa-plus-circle', label: 'Create Project' },
                                        { to: '/create-resource', icon: 'fas fa-upload', label: 'Share Resource' },
                                        { to: '/communities', icon: 'fas fa-search', label: 'Browse Communities' },
                                    ].map(a => (
                                        <Link key={a.to} to={a.to} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#eef2ff', borderRadius: '4px', textDecoration: 'none', color: '#374151', transition: 'background 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#e0e7ff'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#eef2ff'}>
                                            <i className={a.icon} style={{ color: '#4f46e5', width: '20px', textAlign: 'center' }}></i>
                                            <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{a.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
