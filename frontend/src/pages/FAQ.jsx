import { useState } from 'react';

const faqData = [
    { q: 'What is EKYAM?', a: 'EKYAM is a community collaboration platform that brings diverse groups together through shared resources, projects, and meaningful connections. The name "Ekyam" signifies unity and togetherness.' },
    { q: 'How do I create an account?', a: 'Click "Join Us" in the navigation bar and fill in the registration form. You can register as an Individual Member or a Community Administrator depending on your goals.' },
    { q: 'What is the difference between Individual and Community Admin accounts?', a: 'Individual accounts can join communities and projects. Community Admin accounts can create and manage communities, approve members, and manage community resources.' },
    { q: 'How do I create a community?', a: 'Log in with a Community Admin account, then go to the Communities page and click "Create Community." Fill in the details like name, description, location, and category.' },
    { q: 'Can I join multiple communities?', a: 'Yes! You can join as many communities as you like. Browse the Communities page to discover and join communities that interest you.' },
    { q: 'How do I share resources?', a: 'Navigate to the Resources page and click "Add Resource." You can share documents, links, videos, images, and other files with the community.' },
    { q: 'Is EKYAM free to use?', a: 'Yes, EKYAM is completely free. Our mission is to foster collaboration and unity among communities without financial barriers.' },
    { q: 'How does the Community Map work?', a: 'The Community Map shows the geographic location of registered communities. Communities with location data appear as pins on the interactive map, which helps you find groups near you.' },
    { q: 'How do I leave a community or project?', a: 'Go to the community or project details page and click the "Leave" button. You can rejoin anytime.' },
    { q: 'How can I report a problem?', a: 'Use the Contact Us page to reach out to our support team. Describe the issue and we will respond as quickly as possible.' },
];

export default function FAQ() {
    const [open, setOpen] = useState(null);

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', paddingTop: '3rem', paddingBottom: '3rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: '#e0e7ff', borderRadius: '50%', marginBottom: '1rem' }}>
                        <i className="fas fa-question-circle" style={{ fontSize: '28px', color: '#4f46e5' }}></i>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>Frequently Asked Questions</h1>
                    <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Find answers to common questions about EKYAM</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {faqData.map((faq, i) => (
                        <div key={i} style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                style={{
                                    width: '100%', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: '600', color: '#1f2937'
                                }}>
                                <span>{faq.q}</span>
                                <i className={`fas fa-chevron-${open === i ? 'up' : 'down'}`} style={{ color: '#4f46e5', flexShrink: 0, marginLeft: '1rem' }}></i>
                            </button>
                            {open === i && (
                                <div style={{ padding: '0 1.5rem 1.25rem 1.5rem', color: '#4b5563', lineHeight: '1.7', borderTop: '1px solid #f3f4f6' }}>
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '2.5rem', background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>Still have questions?</h3>
                    <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Can't find the answer you're looking for? Reach out to our team.</p>
                    <a href="/contact" style={{ display: 'inline-block', background: '#4f46e5', color: '#fff', padding: '0.7rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}
