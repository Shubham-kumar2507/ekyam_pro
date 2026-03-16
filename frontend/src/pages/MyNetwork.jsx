import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import UserCard from '../components/UserCard';

const BASE = 'http://localhost:5000';

export default function MyNetwork() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('followers');
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [requests, setRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [followersRes, followingRes, requestsRes] = await Promise.all([
                api.get(`/connections/followers/${user._id}`),
                api.get(`/connections/following/${user._id}`),
                api.get('/connections/requests')
            ]);
            setFollowers(followersRes.data);
            setFollowing(followingRes.data);
            setRequests(requestsRes.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleSearch = async (q) => {
        setSearchQuery(q);
        if (!q.trim()) { setSearchResults([]); return; }
        setSearchLoading(true);
        try {
            const { data } = await api.get(`/connections/search?q=${encodeURIComponent(q)}`);
            setSearchResults(data);
        } catch (err) { console.error(err); }
        setSearchLoading(false);
    };

    const handleRespond = async (connectionId, action) => {
        try {
            await api.put(`/connections/respond/${connectionId}`, { action });
            setRequests(prev => prev.filter(r => r._id !== connectionId));
            if (action === 'accept') fetchData();
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
    };

    const tabBtn = (active) => ({
        padding: '0.55rem 1.2rem', border: 'none', borderRadius: '10px',
        background: active ? '#fff' : 'transparent',
        color: active ? '#4f46e5' : '#9ca3af',
        fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer',
        boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.2s', position: 'relative'
    });

    const avatarSmall = {
        width: '44px', height: '44px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: '700', fontSize: '1.1rem',
        overflow: 'hidden', flexShrink: 0
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
            {/* Hero */}
            <div style={{
                background: 'linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)',
                color: '#fff', padding: '3rem 1rem', textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>🤝 My Network</h1>
                <p style={{ opacity: 0.85, maxWidth: '600px', margin: '0 auto' }}>
                    Manage your connections, discover people, and grow your professional network.
                </p>
            </div>

            <div style={{ maxWidth: '750px', margin: '0 auto', padding: '1.5rem 1rem' }}>
                {/* Search */}
                <div style={{
                    background: '#fff', borderRadius: '14px', padding: '1rem 1.25rem',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1.25rem'
                }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="🔍 Search people by name or username..."
                            style={{
                                width: '100%', padding: '0.7rem 1rem', border: '2px solid #e5e7eb',
                                borderRadius: '12px', fontSize: '0.92rem', background: '#f9fafb',
                                outline: 'none', transition: 'border-color 0.2s'
                            }}
                        />
                    </div>

                    {/* Search Results */}
                    {searchQuery && (
                        <div style={{ marginTop: '0.75rem' }}>
                            {searchLoading ? (
                                <div style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af', fontSize: '0.85rem' }}>Searching...</div>
                            ) : searchResults.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af', fontSize: '0.85rem' }}>No users found</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {searchResults.map(u => (
                                        <UserCard key={u._id} userInfo={u} initialStatus="none" />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex', gap: '0.25rem', marginBottom: '1.25rem',
                    background: '#e5e7eb', borderRadius: '12px', padding: '4px'
                }}>
                    <button onClick={() => setActiveTab('followers')} style={tabBtn(activeTab === 'followers')}>
                        👥 Followers ({followers.length})
                    </button>
                    <button onClick={() => setActiveTab('following')} style={tabBtn(activeTab === 'following')}>
                        ➡️ Following ({following.length})
                    </button>
                    <button onClick={() => setActiveTab('requests')} style={tabBtn(activeTab === 'requests')}>
                        📩 Requests
                        {requests.length > 0 && (
                            <span style={{
                                position: 'absolute', top: '-5px', right: '-5px',
                                background: '#ef4444', color: '#fff', borderRadius: '50%',
                                width: '18px', height: '18px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem', fontWeight: '700'
                            }}>{requests.length}</span>
                        )}
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                        Loading...
                    </div>
                ) : (
                    <>
                        {/* Followers Tab */}
                        {activeTab === 'followers' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {followers.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center', padding: '3rem', background: '#fff',
                                        borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                                    }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>👥</div>
                                        <h3 style={{ color: '#1f2937', fontWeight: '700', marginBottom: '0.5rem' }}>No followers yet</h3>
                                        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Share your projects and engage to grow your network!</p>
                                    </div>
                                ) : followers.map(u => (
                                    <UserCard key={u._id} userInfo={u} initialStatus="none" />
                                ))}
                            </div>
                        )}

                        {/* Following Tab */}
                        {activeTab === 'following' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {following.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center', padding: '3rem', background: '#fff',
                                        borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                                    }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔍</div>
                                        <h3 style={{ color: '#1f2937', fontWeight: '700', marginBottom: '0.5rem' }}>Not following anyone</h3>
                                        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Discover and follow users to see their updates!</p>
                                    </div>
                                ) : following.map(u => (
                                    <UserCard key={u._id} userInfo={u} initialStatus="following" />
                                ))}
                            </div>
                        )}

                        {/* Requests Tab */}
                        {activeTab === 'requests' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {requests.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center', padding: '3rem', background: '#fff',
                                        borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                                    }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</div>
                                        <h3 style={{ color: '#1f2937', fontWeight: '700', marginBottom: '0.5rem' }}>No pending requests</h3>
                                        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>All caught up!</p>
                                    </div>
                                ) : requests.map(req => (
                                    <div key={req._id} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.85rem',
                                        background: '#fff', padding: '1rem 1.25rem', borderRadius: '14px',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
                                    }}>
                                        <Link to={`/users/${req.follower._id}`} style={{ textDecoration: 'none' }}>
                                            <div style={avatarSmall}>
                                                {req.follower.profileImage
                                                    ? <img src={`${BASE}${req.follower.profileImage}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : req.follower.fullName?.[0] || '?'}
                                            </div>
                                        </Link>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Link to={`/users/${req.follower._id}`} style={{ textDecoration: 'none' }}>
                                                <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '0.95rem' }}>{req.follower.fullName}</div>
                                                <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>@{req.follower.username}</div>
                                            </Link>
                                            {req.follower.bio && (
                                                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.follower.bio}</div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                                            <button
                                                onClick={() => handleRespond(req._id, 'accept')}
                                                style={{
                                                    padding: '0.45rem 1rem', border: 'none', borderRadius: '8px',
                                                    background: '#4f46e5', color: '#fff', fontWeight: '600',
                                                    fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                            >Accept</button>
                                            <button
                                                onClick={() => handleRespond(req._id, 'reject')}
                                                style={{
                                                    padding: '0.45rem 1rem', border: 'none', borderRadius: '8px',
                                                    background: '#f3f4f6', color: '#6b7280', fontWeight: '600',
                                                    fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                            >Decline</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
