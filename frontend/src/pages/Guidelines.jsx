export default function Guidelines() {
    const guidelines = [
        {
            icon: 'fas fa-handshake',
            title: 'Respect and Inclusivity',
            points: [
                'Treat all members with respect and dignity, regardless of background.',
                'Use inclusive language and avoid discriminatory remarks.',
                'Welcome diverse perspectives and encourage open dialogue.',
                'Do not harass, bully, or intimidate other members.',
            ]
        },
        {
            icon: 'fas fa-shield-alt',
            title: 'Privacy and Safety',
            points: [
                'Do not share personal information of other members without their consent.',
                'Protect your own login credentials and do not share your account.',
                'Report any suspicious activity or security concerns to the admin team.',
                'Use strong, unique passwords for your account.',
            ]
        },
        {
            icon: 'fas fa-file-alt',
            title: 'Content Guidelines',
            points: [
                'Only share resources and content that you have the right to distribute.',
                'Provide accurate descriptions for all resources and projects.',
                'Do not post spam, advertisements, or irrelevant content.',
                'Ensure shared documents are free from malware or harmful content.',
            ]
        },
        {
            icon: 'fas fa-users-cog',
            title: 'Community Management',
            points: [
                'Community admins must moderate their communities fairly and consistently.',
                'Set clear community-specific rules and communicate them to members.',
                'Respond to member concerns and feedback in a timely manner.',
                'Encourage active participation and recognize member contributions.',
            ]
        },
        {
            icon: 'fas fa-tasks',
            title: 'Project Collaboration',
            points: [
                'Communicate clearly with your project team about progress and blockers.',
                'Meet deadlines and commitments you make to the team.',
                'Give credit to all contributors for their work.',
                'Be open to feedback and constructive criticism on your contributions.',
            ]
        },
        {
            icon: 'fas fa-balance-scale',
            title: 'Enforcement',
            points: [
                'Violations may result in warnings, temporary suspension, or permanent ban.',
                'Decisions by system administrators are final in dispute cases.',
                'Appeals can be submitted through the Contact Us page.',
                'Repeated violations will result in escalating consequences.',
            ]
        },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', paddingTop: '3rem', paddingBottom: '3rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: '#e0e7ff', borderRadius: '50%', marginBottom: '1rem' }}>
                        <i className="fas fa-book" style={{ fontSize: '28px', color: '#4f46e5' }}></i>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>Community Guidelines</h1>
                    <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Our guidelines help create a safe and productive environment for everyone.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {guidelines.map((section) => (
                        <div key={section.title} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem 2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: '#e0e7ff', borderRadius: '8px' }}>
                                    <i className={section.icon} style={{ color: '#4f46e5' }}></i>
                                </div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' }}>{section.title}</h2>
                            </div>
                            <ul style={{ margin: 0, padding: '0 0 0 1.5rem', color: '#4b5563', lineHeight: '2' }}>
                                {section.points.map((point, i) => (
                                    <li key={i} style={{ fontSize: '0.95rem' }}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '2.5rem', background: '#4f46e5', borderRadius: '12px', padding: '2rem', color: '#fff' }}>
                    <h3 style={{ fontWeight: '700', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Questions about our guidelines?</h3>
                    <p style={{ marginBottom: '1rem', opacity: 0.9 }}>Contact our team for clarification or to report an issue.</p>
                    <a href="/contact" style={{ display: 'inline-block', background: '#fff', color: '#4f46e5', padding: '0.7rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                        Contact Us
                    </a>
                </div>
            </div>
        </div>
    );
}
