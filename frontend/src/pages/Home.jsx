import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { getMediaUrl } from '../utils/media';

/* ─── Scroll Reveal Hook ─── */
function useScrollReveal() {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('visible');
                    el.querySelectorAll('.scroll-reveal').forEach(c => c.classList.add('visible'));
                    observer.unobserve(el);
                }
            },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return ref;
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ end, duration = 1800, label, icon, color }) {
    const [count, setCount] = useState(0);
    const [visible, setVisible] = useState(false);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    setVisible(true);
                    const start = performance.now();
                    const animate = (now) => {
                        const progress = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.round(eased * end));
                        if (progress < 1) requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [end, duration]);

    return (
        <div ref={ref} className="card-hover"
            style={{
                background: '#fff', borderRadius: '16px', padding: '1.75rem 1.25rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center',
                border: '1px solid rgba(0,0,0,0.04)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease'
            }}>
            <div style={{
                width: '52px', height: '52px', background: `${color}14`,
                borderRadius: '14px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 0.85rem'
            }}>
                <i className={icon} style={{ color, fontSize: '1.3rem' }}></i>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#1f2937', lineHeight: 1 }}>
                {count}+
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.88rem', fontWeight: '500', marginTop: '0.35rem' }}>
                {label}
            </div>
        </div>
    );
}

/* ─── Section Header ─── */
function SectionHeader({ badge, title, subtitle }) {
    const ref = useScrollReveal();
    return (
        <div ref={ref} className="scroll-reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            {badge && (
                <span style={{
                    display: 'inline-block', background: '#eef2ff', color: '#4338ca',
                    padding: '0.35rem 1rem', borderRadius: '50px', fontSize: '0.82rem',
                    fontWeight: '600', marginBottom: '0.85rem', letterSpacing: '0.3px'
                }}>
                    {badge}
                </span>
            )}
            <h2 style={{ fontSize: '2.15rem', fontWeight: '800', color: '#1f2937', marginBottom: '0.6rem', lineHeight: 1.25 }}>
                {title}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
                {subtitle}
            </p>
        </div>
    );
}

/* ─── Step Card (extracted from .map() to fix hook violation) ─── */
function StepCard({ step, index }) {
    const ref = useScrollReveal();
    return (
        <div ref={ref} className="scroll-reveal timeline-step card-hover"
            style={{
                background: '#fff', borderRadius: '16px', padding: '2rem 1.5rem',
                boxShadow: '0 4px 14px rgba(0,0,0,0.05)', textAlign: 'center',
                border: '1px solid rgba(0,0,0,0.04)', position: 'relative'
            }}>
            <div style={{
                position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff',
                width: '30px', height: '30px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: '700',
                boxShadow: '0 2px 8px rgba(79,70,229,0.4)'
            }}>{index + 1}</div>
            <div style={{
                width: '64px', height: '64px', background: '#eef2ff',
                borderRadius: '16px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0.5rem auto 1.25rem'
            }}>
                <i className={step.icon} style={{ color: '#4f46e5', fontSize: '1.5rem' }}></i>
            </div>
            <h3 style={{ fontWeight: '700', color: '#1f2937', marginBottom: '0.6rem', fontSize: '1.1rem' }}>
                {step.title}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.65 }}>
                {step.desc}
            </p>
        </div>
    );
}

/* ─── Testimonial Card (extracted from .map() to fix hook violation) ─── */
function TestimonialCard({ testimonial }) {
    const ref = useScrollReveal();
    return (
        <div ref={ref} className="scroll-reveal card-hover"
            style={{
                background: '#fff', borderRadius: '16px', padding: '2rem 1.75rem',
                boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.04)', position: 'relative'
            }}>
            <i className="fas fa-quote-left" style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                color: '#e0e7ff', fontSize: '1.5rem'
            }}></i>
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem' }}>
                {[...Array(5)].map((_, j) => (
                    <i key={j} className="fas fa-star" style={{ color: '#fbbf24', fontSize: '0.8rem' }}></i>
                ))}
            </div>
            <p style={{ color: '#374151', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '1.25rem', fontStyle: 'italic' }}>
                "{testimonial.quote}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: '700', fontSize: '0.9rem'
                }}>
                    {testimonial.name.charAt(0)}
                </div>
                <div>
                    <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '0.9rem' }}>{testimonial.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{testimonial.role}</div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════ */
export default function Home() {
    const [stats, setStats] = useState({ communities: 0, projects: 0, resources: 0, users: 0 });
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        api.get('/stats').then(r => setStats(r.data)).catch(() => { });
        api.get('/projects/featured').then(r => setProjects(Array.isArray(r.data) ? r.data : [])).catch(() => { });
    }, []);

    const featuresRef = useScrollReveal();
    const ctaRef = useScrollReveal();

    const features = [
        { icon: 'fas fa-share-nodes', title: 'Resource Sharing', desc: 'Share documents, tools, and knowledge across communities seamlessly.', color: '#4f46e5' },
        { icon: 'fas fa-code-branch', title: 'Project Collaboration', desc: 'Launch cross-community projects and track progress in real time.', color: '#7c3aed' },
        { icon: 'fas fa-comments', title: 'Community Chat', desc: 'Stay connected with real-time messaging within your communities.', color: '#0891b2' },
        { icon: 'fas fa-calendar-check', title: 'Event Calendar', desc: 'Organize and discover meetups, workshops, and community events.', color: '#059669' },
        { icon: 'fas fa-network-wired', title: 'Network Building', desc: 'Grow your professional network by connecting with like-minded people.', color: '#d97706' },
        { icon: 'fas fa-lock-open', title: 'Open & Free', desc: 'Fully open-source platform — no hidden costs, no restrictions.', color: '#dc2626' },
    ];

    const steps = [
        { icon: 'fas fa-user-plus', title: 'Create Account', desc: 'Sign up in seconds as an individual or community admin.' },
        { icon: 'fas fa-search', title: 'Discover & Join', desc: 'Find communities that align with your goals and interests.' },
        { icon: 'fas fa-rocket', title: 'Collaborate & Grow', desc: 'Launch projects, share resources, and make a real impact together.' },
    ];

    const testimonials = [
        { quote: 'EKYAM transformed the way our student clubs collaborate. We went from isolated groups to a unified campus community.', name: 'Priya Sharma', role: 'Student Union Lead' },
        { quote: 'The resource sharing feature alone saved us hundreds of hours. It\'s like having a shared brain for our entire network.', name: 'Arjun Mehta', role: 'NGO Coordinator' },
        { quote: 'We discovered partner communities we never knew existed. The map feature is a game-changer for grassroots organizations.', name: 'Riya Patel', role: 'Community Organizer' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>

            {/* ━━━ HERO ━━━ */}
            <section style={{
                background: 'linear-gradient(135deg, #0f0b2e 0%, #1e1b4b 25%, #312e81 50%, #4338ca 75%, #4f46e5 100%)',
                backgroundSize: '400% 400%',
                animation: 'heroGradientShift 12s ease infinite',
                color: '#fff', padding: '6rem 1rem 7rem', textAlign: 'center',
                position: 'relative', overflow: 'hidden'
            }}>
                {[
                    { w: 320, t: -80, r: -60, bg: 'rgba(129,140,248,0.12)', anim: 'floatOrb 8s ease-in-out infinite' },
                    { w: 220, b: -50, l: -40, bg: 'rgba(99,102,241,0.1)', anim: 'floatOrbSlow 10s ease-in-out infinite' },
                    { w: 150, t: '40%', l: '10%', bg: 'rgba(167,139,250,0.08)', anim: 'floatOrb 12s ease-in-out infinite 2s' },
                    { w: 100, t: '20%', r: '15%', bg: 'rgba(129,140,248,0.1)', anim: 'floatOrbSlow 9s ease-in-out infinite 1s' },
                    { w: 60, b: '30%', r: '25%', bg: 'rgba(199,210,254,0.12)', anim: 'floatOrb 7s ease-in-out infinite 3s' },
                ].map((o, i) => (
                    <div key={i} style={{
                        position: 'absolute', width: o.w, height: o.w, borderRadius: '50%',
                        background: o.bg, animation: o.anim, pointerEvents: 'none',
                        ...(o.t !== undefined ? { top: o.t } : {}),
                        ...(o.b !== undefined ? { bottom: o.b } : {}),
                        ...(o.l !== undefined ? { left: o.l } : {}),
                        ...(o.r !== undefined ? { right: o.r } : {}),
                    }} />
                ))}

                <div style={{ maxWidth: '820px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                    <div className="hero-text-reveal" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                        background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
                        padding: '0.5rem 1.25rem', borderRadius: '50px', fontSize: '0.82rem',
                        marginBottom: '1.75rem', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <span style={{ width: 6, height: 6, background: '#34d399', borderRadius: '50%', display: 'inline-block' }} />
                        Open Source &nbsp;•&nbsp; 100% Free &nbsp;•&nbsp; Community Driven
                    </div>

                    <h1 className="hero-text-reveal-delay-1" style={{
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800',
                        lineHeight: 1.12, marginBottom: '1.35rem', letterSpacing: '-0.5px'
                    }}>
                        Unite. Collaborate.<br />
                        Make a Lasting <span style={{
                            background: 'linear-gradient(135deg, #a5b4fc, #c4b5fd, #818cf8)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>Impact</span>.
                    </h1>

                    <p className="hero-text-reveal-delay-2" style={{
                        fontSize: '1.15rem', opacity: 0.85, maxWidth: '600px',
                        margin: '0 auto 2.5rem', lineHeight: 1.75
                    }}>
                        EKYAM brings diverse communities together through shared resources, collaborative projects,
                        and meaningful connections — empowering change-makers worldwide.
                    </p>

                    <div className="hero-text-reveal-delay-3" style={{
                        display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'
                    }}>
                        <Link to="/register" className="btn-glow" style={{
                            background: '#fff', color: '#4338ca', padding: '0.9rem 2.25rem',
                            borderRadius: '12px', textDecoration: 'none', fontWeight: '700',
                            fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                            transition: 'transform 0.2s ease'
                        }}>
                            Get Started <i className="fas fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
                        </Link>
                        <Link to="/communities" style={{
                            background: 'rgba(255,255,255,0.1)', color: '#fff',
                            padding: '0.9rem 2.25rem', borderRadius: '12px', textDecoration: 'none',
                            fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            transition: 'background 0.2s ease, border-color 0.2s ease'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                        >
                            Explore Communities
                        </Link>
                    </div>
                </div>
            </section>

            {/* ━━━ STATS ━━━ */}
            <section style={{ maxWidth: '1100px', margin: '-3.5rem auto 0', padding: '0 1rem', position: 'relative', zIndex: 10 }}>
                <div className="home-stats-grid stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                    <AnimatedCounter end={stats.communities || 12} label="Communities" icon="fas fa-users" color="#4f46e5" />
                    <AnimatedCounter end={stats.projects || 35} label="Projects" icon="fas fa-project-diagram" color="#7c3aed" />
                    <AnimatedCounter end={stats.resources || 80} label="Resources" icon="fas fa-folder-open" color="#0891b2" />
                    <AnimatedCounter end={stats.users || 150} label="Members" icon="fas fa-user-friends" color="#059669" />
                </div>
            </section>

            {/* ━━━ HOW IT WORKS ━━━ */}
            <section style={{ maxWidth: '1100px', margin: '5rem auto', padding: '0 1rem' }}>
                <SectionHeader
                    badge="Getting Started"
                    title="How EKYAM Works"
                    subtitle="Three simple steps to join the movement and start making a difference."
                />
                <div className="home-steps-grid stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    {steps.map((step, i) => (
                        <StepCard key={step.title} step={step} index={i} />
                    ))}
                </div>
            </section>

            {/* ━━━ KEY FEATURES ━━━ */}
            <section style={{ background: '#fff', padding: '5rem 1rem' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <SectionHeader
                        badge="Platform Capabilities"
                        title="Everything You Need to Thrive"
                        subtitle="A comprehensive suite of tools designed to empower your community."
                    />
                    <div ref={featuresRef} className="home-features-grid stagger-children scroll-reveal"
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        {features.map(f => (
                            <div key={f.title} className="scroll-reveal card-hover"
                                style={{
                                    background: '#f9fafb', borderRadius: '16px', padding: '1.75rem 1.5rem',
                                    border: '1px solid #e5e7eb', textAlign: 'left',
                                    transition: 'border-color 0.3s ease, background 0.3s ease'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}40`; e.currentTarget.style.background = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb'; }}
                            >
                                <div style={{
                                    width: '48px', height: '48px', background: `${f.color}12`,
                                    borderRadius: '12px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', marginBottom: '1rem'
                                }}>
                                    <i className={f.icon} style={{ color: f.color, fontSize: '1.25rem' }}></i>
                                </div>
                                <h3 style={{ fontWeight: '700', color: '#1f2937', marginBottom: '0.45rem', fontSize: '1.05rem' }}>
                                    {f.title}
                                </h3>
                                <p style={{ color: '#6b7280', fontSize: '0.88rem', lineHeight: 1.65 }}>
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━ SOCIAL PROOF ━━━ */}
            <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '5rem 1rem' }}>
                <SectionHeader
                    badge="Community Voices"
                    title="Trusted by Communities Everywhere"
                    subtitle="Hear from the people who are already making an impact with EKYAM."
                />
                <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    {testimonials.map((t, i) => (
                        <TestimonialCard key={i} testimonial={t} />
                    ))}
                </div>
            </section>

            {/* ━━━ FEATURED PROJECTS ━━━ */}
            {projects.length > 0 && (
                <section style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', padding: '5rem 1rem' }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                background: 'rgba(251,191,36,0.12)', color: '#fbbf24',
                                padding: '0.35rem 1rem', borderRadius: '50px', fontSize: '0.82rem',
                                fontWeight: '600', marginBottom: '0.85rem', border: '1px solid rgba(251,191,36,0.2)'
                            }}>
                                <i className="fas fa-star" style={{ fontSize: '0.7rem' }}></i> Featured Projects
                            </span>
                            <h2 style={{ fontSize: '2.15rem', fontWeight: '800', color: '#f1f5f9', marginBottom: '0.6rem', lineHeight: 1.25 }}>
                                Projects Making an Impact
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
                                Handpicked projects that showcase the best of collaborative innovation.
                            </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                            {projects.map(p => {
                                const statusMap = {
                                    active: { bg: '#065f46', text: '#6ee7b7' },
                                    planning: { bg: '#78350f', text: '#fde68a' },
                                    completed: { bg: '#312e81', text: '#c7d2fe' },
                                    in_progress: { bg: '#1e3a5f', text: '#93c5fd' },
                                    on_hold: { bg: '#374151', text: '#d1d5db' },
                                };
                                const sc = statusMap[p.status] || statusMap.active;
                                return (
                                    <Link key={p._id} to={`/projects/${p._id}`}
                                        style={{
                                            textDecoration: 'none', background: '#1e293b',
                                            borderRadius: '16px', overflow: 'hidden',
                                            border: '1px solid rgba(148,163,184,0.1)',
                                            display: 'block', transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        <div style={{
                                            height: '180px',
                                            background: 'linear-gradient(135deg, #312e81, #4338ca)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            overflow: 'hidden', position: 'relative'
                                        }}>
                                            {p.image ? (
                                                <img src={getMediaUrl(p.image)} alt={p.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <i className="fas fa-project-diagram" style={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.15)' }}></i>
                                            )}
                                            <div style={{
                                                position: 'absolute', top: '0.75rem', left: '0.75rem',
                                                background: 'rgba(251,191,36,0.9)', color: '#78350f',
                                                width: '28px', height: '28px', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.7rem', boxShadow: '0 2px 8px rgba(251,191,36,0.4)'
                                            }}>
                                                <i className="fas fa-star"></i>
                                            </div>
                                            <div style={{
                                                position: 'absolute', top: '0.75rem', right: '0.75rem',
                                                background: sc.bg, color: sc.text,
                                                padding: '0.2rem 0.65rem', borderRadius: '6px',
                                                fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {(p.status || 'active').replace('_', ' ')}
                                            </div>
                                        </div>
                                        <div style={{ padding: '1.35rem' }}>
                                            <h3 style={{ fontWeight: '700', color: '#f1f5f9', marginBottom: '0.45rem', fontSize: '1.08rem' }}>
                                                {p.name}
                                            </h3>
                                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }}>
                                                {p.description}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                                                    <span><i className="fas fa-users" style={{ marginRight: '0.3rem' }}></i>{p.members?.length || p.memberCount || 0}</span>
                                                    <span><i className="fas fa-calendar" style={{ marginRight: '0.3rem' }}></i>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span>
                                                </div>
                                                <span style={{ color: '#818cf8', fontWeight: '600', fontSize: '0.8rem' }}>
                                                    View <i className="fas fa-arrow-right" style={{ fontSize: '0.65rem', marginLeft: '0.2rem' }}></i>
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                            <Link to="/projects" style={{
                                background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '0.75rem 2rem',
                                borderRadius: '12px', textDecoration: 'none', fontWeight: '600',
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                border: '1px solid rgba(99,102,241,0.25)',
                                transition: 'background 0.2s ease, border-color 0.2s ease'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.25)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; }}
                            >
                                View All Projects <i className="fas fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ━━━ CTA ━━━ */}
            <section style={{ maxWidth: '1100px', margin: '3rem auto 4rem', padding: '0 1rem' }}>
                <div ref={ctaRef} className="scroll-reveal" style={{
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #6366f1 100%)',
                    backgroundSize: '300% 300%', animation: 'heroGradientShift 10s ease infinite',
                    borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center',
                    color: '#fff', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', animation: 'floatOrbSlow 8s ease-in-out infinite' }} />
                    <div style={{ position: 'absolute', bottom: -40, left: -40, width: 140, height: 140, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', animation: 'floatOrb 10s ease-in-out infinite 2s' }} />

                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: '800', marginBottom: '0.85rem' }}>
                            Ready to Make a Difference?
                        </h2>
                        <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2.25rem', maxWidth: '520px', margin: '0 auto 2.25rem', lineHeight: 1.7 }}>
                            Join thousands of community members working together for a better, more connected future.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/register" className="btn-glow" style={{
                                background: '#fff', color: '#4338ca', padding: '0.85rem 2.25rem',
                                borderRadius: '12px', textDecoration: 'none', fontWeight: '700',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                                transition: 'transform 0.2s ease'
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Join EKYAM Today
                            </Link>
                            <Link to="/map" style={{
                                background: 'rgba(255,255,255,0.12)', color: '#fff',
                                padding: '0.85rem 2.25rem', borderRadius: '12px', textDecoration: 'none',
                                fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                transition: 'background 0.2s ease'
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                            >
                                <i className="fas fa-map-marked-alt" style={{ marginRight: '0.5rem' }}></i>
                                Explore Map
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
