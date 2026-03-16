import { Link } from 'react-router-dom';

const sections = [
    {
        icon: 'fas fa-rocket', title: 'Getting Started',
        items: [
            { title: 'Create your account', desc: 'Register as an Individual or Community Admin to get started.', link: '/register' },
            { title: 'Complete your profile', desc: 'Add your bio, location, and profile image to help others connect with you.', link: '/profile' },
            { title: 'Join a community', desc: 'Browse and join communities that align with your interests.', link: '/communities' },
        ]
    },
    {
        icon: 'fas fa-users', title: 'Communities',
        items: [
            { title: 'Browse communities', desc: 'Search for communities by name or location.', link: '/communities' },
            { title: 'Create a community', desc: 'Start your own community and invite members to join.', link: '/create-community' },
            { title: 'View the map', desc: 'Find communities near you using the interactive map.', link: '/map' },
        ]
    },
    {
        icon: 'fas fa-project-diagram', title: 'Projects',
        items: [
            { title: 'Browse projects', desc: 'Discover active projects and join those that interest you.', link: '/projects' },
            { title: 'Create a project', desc: 'Start a new collaborative project with your community.', link: '/create-project' },
            { title: 'Track progress', desc: 'Monitor project status and team members from the dashboard.', link: '/dashboard' },
        ]
    },
    {
        icon: 'fas fa-folder-open', title: 'Resources',
        items: [
            { title: 'Find resources', desc: 'Search and filter shared knowledge from the community.', link: '/resources' },
            { title: 'Share a resource', desc: 'Upload documents, links, videos, or images to share with others.', link: '/create-resource' },
        ]
    },
];

export default function Help() {
    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', paddingTop: '3rem', paddingBottom: '3rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: '#e0e7ff', borderRadius: '50%', marginBottom: '1rem' }}>
                        <i className="fas fa-life-ring" style={{ fontSize: '28px', color: '#4f46e5' }}></i>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>Help Center</h1>
                    <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Everything you need to get the most out of EKYAM</p>
                </div>

                {sections.map((section) => (
                    <div key={section.title} style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: '#e0e7ff', borderRadius: '8px' }}>
                                <i className={section.icon} style={{ color: '#4f46e5' }}></i>
                            </div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1f2937' }}>{section.title}</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                            {section.items.map((item) => (
                                <Link key={item.title} to={item.link}
                                    style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s' }}>
                                    <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.35rem', fontSize: '1rem' }}>{item.title}</h3>
                                    <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5' }}>{item.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                    <Link to="/faq" style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textDecoration: 'none' }}>
                        <i className="fas fa-question-circle" style={{ fontSize: '2rem', color: '#4f46e5', marginBottom: '0.75rem', display: 'block' }}></i>
                        <h3 style={{ fontWeight: '600', color: '#1f2937' }}>FAQ</h3>
                        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Browse frequently asked questions</p>
                    </Link>
                    <Link to="/contact" style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textDecoration: 'none' }}>
                        <i className="fas fa-envelope" style={{ fontSize: '2rem', color: '#4f46e5', marginBottom: '0.75rem', display: 'block' }}></i>
                        <h3 style={{ fontWeight: '600', color: '#1f2937' }}>Contact Us</h3>
                        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Reach out to our support team</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
