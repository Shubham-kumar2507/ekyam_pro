import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';
import PostCard from '../components/PostCard';

const BASE = 'http://localhost:5000';

export default function ProjectDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const fileRef = useRef(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [filesUploading, setFilesUploading] = useState(false);

    useEffect(() => {
        api.get(`/projects/${id}`).then(r => setProject(r.data)).catch(() => navigate('/projects')).finally(() => setLoading(false));
        api.get(`/posts/project/${id}`).then(r => setPosts(r.data || [])).catch(() => { });
    }, [id]);

    const handleJoin = async () => {
        try { await api.post(`/projects/${id}/join`); setProject(prev => ({ ...prev, members: [...(prev.members || []), user._id] })); } catch (err) { alert(err.response?.data?.message || 'Error'); }
    };
    const handleDelete = async () => {
        if (window.confirm('Delete this project?')) {
            try { await api.delete(`/projects/${id}`); navigate('/projects'); } catch (err) { alert(err.response?.data?.message || 'Error'); }
        }
    };

    const handleImageUpdate = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const { data } = await api.put(`/projects/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setProject(prev => ({ ...prev, image: data.image }));
        } catch (err) { alert(err.response?.data?.message || 'Error uploading image'); }
        setUploading(false);
    };

    const handleDeletePost = (postId) => { setPosts(prev => prev.filter(p => p._id !== postId)); };

    const handleFilesUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setFilesUploading(true);
        try {
            const formData = new FormData();
            files.forEach(f => formData.append('files', f));
            const { data } = await api.post(`/projects/${id}/files`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setProject(prev => ({ ...prev, files: data.files }));
        } catch (err) { alert(err.response?.data?.message || 'Error uploading files'); }
        setFilesUploading(false);
    };

    const handleDeleteFile = async (idx) => {
        if (!window.confirm('Delete this file?')) return;
        try {
            const { data } = await api.delete(`/projects/${id}/files/${idx}`);
            setProject(prev => ({ ...prev, files: data.files }));
        } catch (err) { alert(err.response?.data?.message || 'Error deleting file'); }
    };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: theme.accent }}></i></div>;
    if (!project) return null;

    const isCreator = user && project.createdBy && (project.createdBy === user._id || project.createdBy._id === user._id);
    const statusColors = { active: { bg: '#d1fae5', text: '#065f46' }, planning: { bg: '#fef3c7', text: '#92400e' }, completed: { bg: '#e0e7ff', text: '#3730a3' }, in_progress: { bg: '#dbeafe', text: '#1e40af' }, on_hold: { bg: '#fef3c7', text: '#92400e' } };
    const sc = statusColors[project.status] || statusColors.active;
    const card = { background: theme.bgCard, borderRadius: '16px', padding: '1.5rem', boxShadow: theme.shadow, border: `1px solid ${theme.border}` };
    const projectImageUrl = project.image ? `${BASE}${project.image}` : null;

    return (
        <div style={{ minHeight: '100vh', background: theme.bg }}>
            {/* Hero */}
            <div style={{
                background: projectImageUrl
                    ? `linear-gradient(to bottom, rgba(49,46,129,0.75), rgba(67,56,202,0.85)), url(${projectImageUrl}) center/cover no-repeat`
                    : theme.heroBg,
                color: '#fff', padding: '3.5rem 1rem', textAlign: 'center', position: 'relative'
            }}>
                {projectImageUrl && (
                    <div style={{ marginBottom: '1rem' }}>
                        <img src={projectImageUrl} alt={project.name}
                            style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '16px', border: '3px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                        />
                    </div>
                )}
                <span style={{ background: sc.bg, color: sc.text, padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1rem', display: 'inline-block' }}>{project.status || 'active'}</span>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>{project.name}</h1>
                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', opacity: 0.85, flexWrap: 'wrap' }}>
                    <span><i className="fas fa-user-friends" style={{ marginRight: '0.4rem' }}></i>{project.members?.length || 0} members</span>
                    <span><i className="fas fa-calendar" style={{ marginRight: '0.4rem' }}></i>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                {isCreator && (
                    <div style={{ marginTop: '1rem' }}>
                        <button onClick={() => fileRef.current?.click()} disabled={uploading}
                            style={{ padding: '0.5rem 1.2rem', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: '600', fontSize: '0.85rem', cursor: uploading ? 'wait' : 'pointer', backdropFilter: 'blur(4px)' }}>
                            {uploading ? '⏳ Uploading...' : (projectImageUrl ? '📷 Update Image' : '📷 Add Project Image')}
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpdate} style={{ display: 'none' }} />
                    </div>
                )}
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={card}>
                            <h2 style={{ fontWeight: '700', color: theme.text, marginBottom: '0.75rem' }}><i className="fas fa-info-circle" style={{ color: theme.accent, marginRight: '0.5rem' }}></i>Description</h2>
                            <p style={{ color: theme.textSecondary, lineHeight: '1.7' }}>{project.description}</p>
                        </div>

                        {/* Project Files */}
                        <div style={card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontWeight: '700', color: theme.text }}>
                                    <i className="fas fa-folder-open" style={{ color: theme.accent, marginRight: '0.5rem' }}></i>Project Files
                                </h2>
                                {user && (
                                    <label style={{ background: theme.accent, color: '#fff', padding: '0.4rem 0.9rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.82rem', cursor: filesUploading ? 'wait' : 'pointer', opacity: filesUploading ? 0.7 : 1 }}>
                                        {filesUploading ? '⏳ Uploading...' : '+ Upload Files'}
                                        <input type="file" multiple onChange={handleFilesUpload} style={{ display: 'none' }} disabled={filesUploading} />
                                    </label>
                                )}
                            </div>
                            {(!project.files || project.files.length === 0) ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: theme.textFaint }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📂</div>
                                    <p>No files uploaded yet. Upload code, docs, or any project files!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {project.files.map((f, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', background: theme.bgCardHover, borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                                            <i className="fas fa-file" style={{ color: theme.accent, fontSize: '1.1rem', flexShrink: 0 }}></i>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: '600', fontSize: '0.88rem', color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.fileName}</div>
                                                <div style={{ fontSize: '0.72rem', color: theme.textFaint }}>{f.fileSize ? `${(f.fileSize / 1024).toFixed(1)} KB` : ''}</div>
                                            </div>
                                            <a href={`${BASE}${f.filePath}`} download={f.fileName} style={{ color: theme.accentText, fontSize: '0.8rem', fontWeight: '600', textDecoration: 'none', flexShrink: 0 }}>⬇ Download</a>
                                            {isCreator && (
                                                <button onClick={() => handleDeleteFile(idx)} style={{ background: 'none', border: 'none', color: theme.error, cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0 }}>🗑</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {project.startDate && (
                            <div style={card}>
                                <h2 style={{ fontWeight: '700', color: theme.text, marginBottom: '0.75rem' }}><i className="fas fa-calendar-alt" style={{ color: theme.accent, marginRight: '0.5rem' }}></i>Timeline</h2>
                                <div style={{ display: 'flex', gap: '2rem', color: theme.textSecondary }}>
                                    <div><strong>Start:</strong> {new Date(project.startDate).toLocaleDateString()}</div>
                                    {project.endDate && <div><strong>End:</strong> {new Date(project.endDate).toLocaleDateString()}</div>}
                                </div>
                            </div>
                        )}

                        {/* Posts */}
                        <div style={card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontWeight: '700', color: theme.text }}>
                                    <i className="fas fa-bullhorn" style={{ color: theme.accent, marginRight: '0.5rem' }}></i>Project Updates
                                </h2>
                                {user && (
                                    <Link to={`/feed?project=${id}`} style={{ background: theme.accent, color: '#fff', padding: '0.4rem 0.9rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.82rem' }}>
                                        + Post Update
                                    </Link>
                                )}
                            </div>
                            {posts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: theme.textFaint }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
                                    <p>No updates yet. Share progress about this project!</p>
                                </div>
                            ) : (
                                posts.map(post => <PostCard key={post._id} post={post} onDelete={handleDeletePost} />)
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {user && (
                            <div style={card}>
                                <h3 style={{ fontWeight: '700', color: theme.text, marginBottom: '1rem' }}>Actions</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button onClick={handleJoin} style={{ padding: '0.7rem', background: theme.accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                        <i className="fas fa-plus" style={{ marginRight: '0.4rem' }}></i>Join Project
                                    </button>
                                    <Link to={`/feed?project=${id}`} style={{ display: 'block', padding: '0.7rem', background: theme.accentLight, color: theme.accentText, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', textDecoration: 'none', textAlign: 'center' }}>
                                        <i className="fas fa-pen" style={{ marginRight: '0.4rem' }}></i>Post Update
                                    </Link>
                                    {isCreator && (
                                        <button onClick={handleDelete} style={{ padding: '0.7rem', background: theme.errorBg, color: theme.error, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                            <i className="fas fa-trash" style={{ marginRight: '0.4rem' }}></i>Delete Project
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        <div style={card}>
                            <h3 style={{ fontWeight: '700', color: theme.text, marginBottom: '0.75rem' }}>Details</h3>
                            <div style={{ color: theme.textMuted, fontSize: '0.9rem', lineHeight: '2' }}>
                                <div><i className="fas fa-signal" style={{ width: '20px', color: theme.textFaint }}></i> Status: {project.status || 'active'}</div>
                                <div><i className="fas fa-user-friends" style={{ width: '20px', color: theme.textFaint }}></i> {project.members?.length || 0} members</div>
                                <div><i className="fas fa-clock" style={{ width: '20px', color: theme.textFaint }}></i> Created {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
