import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { getMediaUrl } from '../utils/media';
import { useTheme } from '../context/ThemeContext';

/* ═══════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

  :root {
    --font-display: 'Cabinet Grotesk', sans-serif;
    --font-body: 'Instrument Sans', sans-serif;
    --ease-spring: cubic-bezier(.22,1,.36,1);
  }

  /* ── Light theme ── */
  [data-theme="light"] {
    --bg: #f5f4f0;
    --bg-surface: #ffffff;
    --bg-subtle: #eeecea;
    --bg-card: #ffffff;
    --border: rgba(0,0,0,0.08);
    --border-hover: rgba(0,0,0,0.14);
    --text-primary: #18181b;
    --text-secondary: #52525b;
    --text-muted: #a1a1aa;
    --accent: #4f46e5;
    --accent-soft: rgba(79,70,229,0.08);
    --accent-border: rgba(79,70,229,0.2);
    --accent-text: #4338ca;
    --purple: #7c3aed;
    --cyan: #0891b2;
    --green: #059669;
    --amber: #d97706;
    --rose: #e11d48;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06);
    --particle-color: rgba(79,70,229,0.25);
    --particle-line: rgba(79,70,229,0.08);
  }

  /* ── Dark theme ── */
  [data-theme="dark"] {
    --bg: #09090d;
    --bg-surface: #111118;
    --bg-subtle: #16161e;
    --bg-card: rgba(255,255,255,0.03);
    --border: rgba(255,255,255,0.07);
    --border-hover: rgba(255,255,255,0.14);
    --text-primary: #f4f4f5;
    --text-secondary: #a1a1aa;
    --text-muted: #52525b;
    --accent: #6366f1;
    --accent-soft: rgba(99,102,241,0.1);
    --accent-border: rgba(99,102,241,0.25);
    --accent-text: #a5b4fc;
    --purple: #a78bfa;
    --cyan: #22d3ee;
    --green: #34d399;
    --amber: #fbbf24;
    --rose: #fb7185;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.4);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.5);
    --particle-color: rgba(99,102,241,0.5);
    --particle-line: rgba(99,102,241,0.12);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ek-home {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text-primary);
    overflow-x: hidden;
    transition: background 0.35s ease, color 0.35s ease;
    min-height: 100vh;
  }
  .ek-home h1, .ek-home h2, .ek-home h3, .ek-home h4 {
    font-family: var(--font-display);
  }

  /* ── Scroll reveal ── */
  .sr { opacity: 0; transform: translateY(28px); transition: opacity 0.75s var(--ease-spring), transform 0.75s var(--ease-spring); }
  .sr.in { opacity: 1; transform: none; }
  .sr.d1 { transition-delay: 0.07s; }
  .sr.d2 { transition-delay: 0.14s; }
  .sr.d3 { transition-delay: 0.21s; }
  .sr.d4 { transition-delay: 0.28s; }

  /* ── Gradient text ── */
  .grad {
    background: linear-gradient(135deg, var(--accent) 0%, var(--purple) 60%, var(--cyan) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  /* ── Live badge ── */
  .live-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: 100px; padding: 0.3rem 0.85rem 0.3rem 0.45rem;
    font-size: 0.75rem; font-weight: 600; color: var(--text-secondary);
    box-shadow: var(--shadow-sm);
    transition: background 0.35s, border-color 0.35s;
  }
  .live-pip {
    display: inline-flex; align-items: center; gap: 0.3rem;
    background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.25);
    border-radius: 100px; padding: 0.15rem 0.55rem;
    color: #059669; font-size: 0.67rem; font-weight: 700;
    letter-spacing: 0.5px;
  }
  [data-theme="dark"] .live-pip { color: #34d399; background: rgba(52,211,153,0.12); }
  .live-dot { width: 5px; height: 5px; border-radius: 50%; background: #059669; animation: dot-pulse 2s ease-in-out infinite; }
  [data-theme="dark"] .live-dot { background: #34d399; }
  @keyframes dot-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.6} }

  /* ── Section label ── */
  .section-label {
    display: inline-flex; align-items: center; gap: 0.5rem;
    font-size: 0.68rem; font-weight: 700; letter-spacing: 2.5px;
    text-transform: uppercase; color: var(--text-muted);
    margin-bottom: 0.75rem;
  }
  .section-label::before, .section-label::after {
    content: ''; width: 14px; height: 1px; background: var(--border-hover); display: inline-block;
  }

  /* ── Buttons ── */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: var(--text-primary); color: var(--bg);
    padding: 0.8rem 1.75rem; border-radius: 12px;
    font-family: var(--font-display); font-weight: 800; font-size: 0.92rem;
    border: none; cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); opacity: 0.9; }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: var(--bg-surface); color: var(--text-secondary);
    padding: 0.8rem 1.75rem; border-radius: 12px;
    font-family: var(--font-display); font-weight: 600; font-size: 0.92rem;
    border: 1px solid var(--border); cursor: pointer; text-decoration: none;
    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
  }
  .btn-ghost:hover { background: var(--bg-subtle); border-color: var(--border-hover); color: var(--text-primary); transform: translateY(-2px); }

  /* ── Stat card ── */
  .stat-card {
    text-align: center; padding: 2rem 1.5rem;
    position: relative;
  }
  .stat-card + .stat-card { border-left: 1px solid var(--border); }

  /* ── Feature row ── */
  .feat-row {
    display: flex; gap: 1rem; align-items: flex-start;
    padding: 1rem; border-radius: 12px;
    border: 1px solid transparent;
    transition: border-color 0.25s, background 0.25s, transform 0.25s;
    cursor: default;
  }
  .feat-row:hover { border-color: var(--border-hover); background: var(--bg-subtle); transform: translateX(4px); }

  /* ── Step ── */
  .step-item { display: flex; gap: 1.25rem; align-items: flex-start; }

  /* ── Card ── */
  .card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 1.5rem;
    box-shadow: var(--shadow-sm);
    transition: border-color 0.25s, box-shadow 0.25s, transform 0.3s var(--ease-spring);
  }
  .card:hover { border-color: var(--border-hover); box-shadow: var(--shadow-md); transform: translateY(-4px); }

  /* ── Testi card ── */
  .testi-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 1.5rem;
    box-shadow: var(--shadow-sm);
    transition: border-color 0.25s, box-shadow 0.25s, transform 0.3s;
    cursor: default;
  }
  .testi-card:hover { border-color: var(--border-hover); box-shadow: var(--shadow-md); transform: translateY(-4px); }

  /* ── Project card ── */
  .project-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden; text-decoration: none;
    display: block; box-shadow: var(--shadow-sm);
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.35s var(--ease-spring);
  }
  .project-card:hover { border-color: var(--accent-border); box-shadow: var(--shadow-lg); transform: translateY(-6px); }

  /* ── CTA section ── */
  .cta-box {
    border-radius: 20px; padding: 5rem 2rem;
    text-align: center; position: relative; overflow: hidden;
    background: var(--bg-surface); border: 1px solid var(--border);
    box-shadow: var(--shadow-md);
  }

  /* ── Marquee ── */
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .marquee-track { display: flex; animation: marquee 30s linear infinite; width: max-content; }
  .marquee-track:hover { animation-play-state: paused; }

  /* ── Float ── */
  @keyframes float-slow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

  /* ── Grid layout helpers ── */
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
  .g3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
  .g4 { display: grid; grid-template-columns: repeat(4, 1fr); }

  /* ── Glow divider ── */
  .glow-div {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-border), var(--border), transparent);
  }

  /* ── Hero ring ── */
  .hero-ring {
    position: absolute; border-radius: 50%;
    border: 1px solid var(--border); pointer-events: none;
    animation: float-slow 10s ease-in-out infinite;
    transition: border-color 0.35s;
  }

  @media (max-width: 900px) {
    .g2 { grid-template-columns: 1fr !important; gap: 3rem !important; }
    .g3 { grid-template-columns: 1fr !important; }
    .g4 { grid-template-columns: 1fr 1fr !important; }
    .stat-card + .stat-card { border-left: none; border-top: 1px solid var(--border); }
    .hero-btns { flex-direction: column; align-items: center; }
    .hero-btns a, .hero-btns button { width: 240px; justify-content: center; }
  }
  @media (max-width: 600px) {
    .g4 { grid-template-columns: 1fr 1fr !important; }
  }
`;

function StyleInjector() {
    useEffect(() => {
        const id = 'ek-home-css';
        if (!document.getElementById(id)) {
            const el = document.createElement('style');
            el.id = id; el.textContent = GLOBAL_CSS;
            document.head.appendChild(el);
        }
    }, []);
    return null;
}

/* ═══════════════════════════════════════════
   PARTICLE CANVAS
   ═══════════════════════════════════════════ */
function ParticleCanvas({ dark }) {
    const canvasRef = useRef(null);
    const frameRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let W = canvas.width = canvas.offsetWidth;
        let H = canvas.height = canvas.offsetHeight;

        const onResize = () => {
            W = canvas.width = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
        };
        window.addEventListener('resize', onResize);

        const COUNT = 100;
        const FOV = 500;

        const pts = Array.from({ length: COUNT }, () => ({
            x: (Math.random() - 0.5) * 900,
            y: (Math.random() - 0.5) * 600,
            z: Math.random() * 600,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            vz: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.4 + 0.4,
        }));

        const project = (x, y, z) => {
            const sc = FOV / (FOV + z);
            return [x * sc + W / 2, y * sc + H / 2, sc];
        };

        const draw = () => {
            ctx.clearRect(0, 0, W, H);

            pts.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.z -= p.vz;
                if (p.z < -FOV) p.z = 600;
                if (p.z > 600) p.z = -FOV;
                if (Math.abs(p.x) > 550) p.vx *= -1;
                if (Math.abs(p.y) > 400) p.vy *= -1;
            });

            // Lines
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const a = pts[i], b = pts[j];
                    const d = Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2);
                    if (d < 160) {
                        const [ax, ay] = project(a.x, a.y, a.z);
                        const [bx, by] = project(b.x, b.y, b.z);
                        const alpha = (1 - d / 160) * (dark ? 0.12 : 0.07);
                        ctx.beginPath();
                        ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
                        ctx.strokeStyle = dark ? `rgba(99,102,241,${alpha})` : `rgba(79,70,229,${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            // Dots
            pts.forEach(p => {
                const [sx, sy, sc] = project(p.x, p.y, p.z);
                if (sx < 0 || sx > W || sy < 0 || sy > H) return;
                const alpha = Math.min(1, sc) * (dark ? 0.7 : 0.5);
                ctx.beginPath();
                ctx.arc(sx, sy, p.r * sc, 0, Math.PI * 2);
                ctx.fillStyle = dark
                    ? `rgba(139,92,246,${alpha})`
                    : `rgba(79,70,229,${alpha})`;
                ctx.fill();
            });

            frameRef.current = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(frameRef.current);
            window.removeEventListener('resize', onResize);
        };
    }, [dark]);

    return (
        <canvas ref={canvasRef} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none',
        }} />
    );
}

/* ─── Scroll Reveal Hook ─── */
function useReveal(threshold = 0.1) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                el.classList.add('in');
                el.querySelectorAll('.sr').forEach(c => c.classList.add('in'));
                io.unobserve(el);
            }
        }, { threshold });
        io.observe(el);
        return () => io.disconnect();
    }, [threshold]);
    return ref;
}

/* ─── Animated Counter ─── */
function AnimCounter({ end, label, color, delay = 0 }) {
    const [n, setN] = useState(0);
    const [vis, setVis] = useState(false);
    const started = useRef(false);
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current; if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !started.current) {
                started.current = true;
                setTimeout(() => {
                    setVis(true);
                    const t0 = performance.now();
                    const dur = 1800;
                    const tick = (now) => {
                        const p = Math.min((now - t0) / dur, 1);
                        setN(Math.round((1 - Math.pow(1 - p, 3)) * end));
                        if (p < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }, delay);
                io.unobserve(el);
            }
        }, { threshold: 0.3 });
        io.observe(el);
        return () => io.disconnect();
    }, [end, delay]);

    return (
        <div ref={ref} className="stat-card" style={{
            opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(20px)',
            transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        }}>
            <div style={{
                fontSize: '2.6rem', fontWeight: '900', fontFamily: 'Cabinet Grotesk, sans-serif',
                color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-1.5px',
            }}>
                {n}<span style={{ color, fontSize: '2rem' }}>+</span>
            </div>
            <div style={{
                color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700',
                marginTop: '0.4rem', letterSpacing: '1.5px', textTransform: 'uppercase',
            }}>
                {label}
            </div>
            <div style={{
                height: 2, background: 'var(--border)', borderRadius: 2,
                marginTop: '1rem', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', inset: 0, background: color,
                    width: `${Math.min((n / end) * 100, 100)}%`,
                    transition: 'width 0.1s ease', borderRadius: 2,
                }} />
            </div>
        </div>
    );
}

/* ─── Feature Row ─── */
function FeatRow({ icon, title, desc, color }) {
    return (
        <div className="feat-row">
            <div style={{
                width: 40, height: 40, flexShrink: 0, borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${color}12`, border: `1px solid ${color}22`,
                color, fontSize: '0.95rem',
            }}>
                <i className={icon} />
            </div>
            <div>
                <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '0.2rem' }}>
                    {title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', lineHeight: 1.7 }}>{desc}</p>
            </div>
        </div>
    );
}

/* ─── Step Item ─── */
function StepItem({ step, index, color }) {
    return (
        <div className="step-item sr" style={{ '--i': index }}>
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: `${color}10`, border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '900', fontFamily: 'Cabinet Grotesk, sans-serif',
                    fontSize: '1rem', color,
                }}>
                    {index + 1}
                </div>
                {index < 2 && (
                    <div style={{
                        width: 1, height: 52,
                        background: `linear-gradient(180deg, ${color}25, transparent)`,
                        marginTop: 4,
                    }} />
                )}
            </div>
            <div style={{ paddingTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <i className={step.icon} style={{ color, fontSize: '0.82rem' }} />
                    <h3 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.97rem' }}>
                        {step.title}
                    </h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.75 }}>
                    {step.desc}
                </p>
            </div>
        </div>
    );
}

/* ─── Testimonial Card ─── */
function TestiCard({ t }) {
    return (
        <div className="testi-card">
            <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.85rem' }}>
                {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star" style={{ color: 'var(--amber)', fontSize: '0.68rem' }} />
                ))}
            </div>
            <p style={{
                color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.8,
                marginBottom: '1.25rem', fontStyle: 'italic',
            }}>
                "{t.quote}"
            </p>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                borderTop: '1px solid var(--border)', paddingTop: '1rem',
            }}>
                <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: '800', fontSize: '0.8rem',
                    fontFamily: 'Cabinet Grotesk, sans-serif',
                }}>
                    {t.name[0]}
                </div>
                <div>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{t.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t.role}</div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════ */
export default function Home() {
    const { mode } = useTheme();
    const dark = mode === 'dark';
    
    const [stats, setStats] = useState({ communities: 0, projects: 0, resources: 0, users: 0 });
    const [projects, setProjects] = useState([]);
    const [wordsIn, setWordsIn] = useState(false);

    useEffect(() => {
        api.get('/stats').then(r => setStats(r.data)).catch(() => { });
        api.get('/projects/featured').then(r => setProjects(Array.isArray(r.data) ? r.data : [])).catch(() => { });
        const t = setTimeout(() => setWordsIn(true), 180);
        return () => clearTimeout(t);
    }, []);

    const statsRef = useReveal();
    const featRef = useReveal();
    const stepsRef = useReveal();
    const testiRef = useReveal();
    const projRef = useReveal();
    const ctaRef = useReveal();

    const features = [
        { icon: 'fas fa-share-nodes', title: 'Resource Sharing', desc: 'Share documents, tools, and knowledge across communities.', color: 'var(--accent)' },
        { icon: 'fas fa-code-branch', title: 'Project Collaboration', desc: 'Launch cross-community projects and track progress together.', color: 'var(--purple)' },
        { icon: 'fas fa-comments', title: 'Community Chat', desc: 'Real-time messaging that keeps your community connected.', color: 'var(--cyan)' },
        { icon: 'fas fa-calendar-check', title: 'Event Calendar', desc: 'Organize and discover meetups, workshops, and events.', color: 'var(--green)' },
        { icon: 'fas fa-network-wired', title: 'Network Building', desc: 'Connect with like-minded people and grow your network.', color: 'var(--amber)' },
        { icon: 'fas fa-lock-open', title: 'Open & Free', desc: 'Fully open-source — no hidden costs, no restrictions.', color: 'var(--rose)' },
    ];

    const steps = [
        { icon: 'fas fa-user-plus', title: 'Create Account', desc: 'Sign up in seconds as an individual or community admin.' },
        { icon: 'fas fa-search', title: 'Discover & Join', desc: 'Find communities that align with your goals and interests.' },
        { icon: 'fas fa-rocket', title: 'Collaborate & Grow', desc: 'Launch projects, share resources, and make a real impact.' },
    ];

    const testimonials = [
        { quote: 'EKYAM transformed how our student clubs work. We went from isolated groups to a unified campus community.', name: 'Priya Sharma', role: 'Student Union Lead' },
        { quote: 'The resource sharing feature saved us hundreds of hours — like a shared brain for our entire network.', name: 'Arjun Mehta', role: 'NGO Coordinator' },
        { quote: 'We discovered partner communities we never knew existed. The map feature is a game-changer.', name: 'Riya Patel', role: 'Community Organizer' },
    ];

    const marqueeItems = ['Communities', 'Projects', 'Resources', 'Collaboration', 'Connections', 'Impact', 'Open Source', 'Free Forever'];
    const words = ['Unite.', 'Collaborate.', 'Make', 'a', 'Lasting', 'Impact.'];
    const stepColors = ['var(--accent)', 'var(--purple)', 'var(--cyan)'];

    return (
        <div className="ek-home">
            <StyleInjector />

            {/* ━━━ HERO ━━━ */}
            <section style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                padding: '8rem 2rem 6rem', textAlign: 'center',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Particle canvas */}
                <ParticleCanvas dark={dark} />

                {/* Subtle grid */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                    backgroundSize: '64px 64px', opacity: 0.6,
                    maskImage: 'radial-gradient(ellipse 75% 65% at 50% 25%, black, transparent)',
                    WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 25%, black, transparent)',
                }} />

                {/* Floating rings */}
                <div className="hero-ring" style={{ width: 480, height: 480, top: '50%', left: '50%', transform: 'translate(-50%, -54%)', animationDuration: '9s' }} />
                <div className="hero-ring" style={{ width: 300, height: 300, top: '50%', left: '50%', transform: 'translate(-50%, -54%)', animationDuration: '12s', animationDelay: '1.5s' }} />

                {/* Radial glow */}
                <div style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 700, height: 350,
                    background: 'radial-gradient(ellipse, var(--accent-soft) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 2, maxWidth: 760, margin: '0 auto' }}>
                    <div className="live-badge" style={{
                        marginBottom: '2rem',
                        opacity: wordsIn ? 1 : 0,
                        transition: 'opacity 0.6s ease',
                    }}>
                        <span className="live-pip">
                            <span className="live-dot" />
                            LIVE
                        </span>
                        Open-source community platform
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.6rem, 5.5vw, 4.5rem)',
                        fontWeight: '900', lineHeight: 1.08, letterSpacing: '-2px',
                        color: 'var(--text-primary)', marginBottom: '1.5rem',
                    }}>
                        {words.map((word, i) => (
                            <span key={i} style={{
                                display: 'inline-block', marginRight: '0.22em',
                                opacity: wordsIn ? 1 : 0,
                                transform: wordsIn ? 'none' : 'translateY(16px)',
                                transition: `opacity 0.6s var(--ease-spring) ${0.07 * i + 0.25}s, transform 0.6s var(--ease-spring) ${0.07 * i + 0.25}s`,
                                ...(word === 'Impact.' ? {
                                    background: 'linear-gradient(135deg, var(--accent), var(--purple), var(--cyan))',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                } : {}),
                            }}>
                                {word}
                            </span>
                        ))}
                    </h1>

                    <p style={{
                        fontSize: '1.05rem', color: 'var(--text-secondary)',
                        maxWidth: 520, margin: '0 auto 2.75rem', lineHeight: 1.85,
                        opacity: wordsIn ? 1 : 0,
                        transition: 'opacity 0.7s ease 0.75s',
                    }}>
                        EKYAM brings diverse communities together through shared resources,
                        collaborative projects, and meaningful connections.
                    </p>

                    <div className="hero-btns" style={{
                        display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap',
                        opacity: wordsIn ? 1 : 0,
                        transition: 'opacity 0.7s ease 0.95s',
                    }}>
                        <Link to="/register" className="btn-primary">
                            Get Started Free
                            <i className="fas fa-arrow-right" style={{ fontSize: '0.78rem' }} />
                        </Link>
                        <Link to="/communities" className="btn-ghost">
                            <i className="fas fa-compass" style={{ fontSize: '0.78rem' }} />
                            Explore Communities
                        </Link>
                    </div>
                </div>

                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
                    background: 'linear-gradient(transparent, var(--bg))',
                    pointerEvents: 'none',
                }} />
            </section>

            {/* ━━━ MARQUEE ━━━ */}
            <div style={{
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                overflow: 'hidden', padding: '0.8rem 0',
                background: 'var(--bg-surface)',
            }}>
                <div className="marquee-track">
                    {[...marqueeItems, ...marqueeItems].map((item, i) => (
                        <div key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '1.5rem',
                            padding: '0 2rem', whiteSpace: 'nowrap',
                            color: 'var(--text-muted)', fontSize: '0.7rem',
                            fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase',
                        }}>
                            {item}
                            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--accent-border)', flexShrink: 0 }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ━━━ STATS ━━━ */}
            <section style={{ padding: '5rem 2rem' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div ref={statsRef} className="sr" style={{
                        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 16, boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
                    }} >
                        {/* vertical dividers done via stat-card + stat-card border-left */}
                        <AnimCounter end={stats.communities || 12} label="Communities" color="var(--accent)" delay={0} />
                        <AnimCounter end={stats.projects || 35} label="Projects" color="var(--purple)" delay={100} />
                        <AnimCounter end={stats.resources || 80} label="Resources" color="var(--cyan)" delay={200} />
                        <AnimCounter end={stats.users || 150} label="Members" color="var(--green)" delay={300} />
                    </div>
                </div>
            </section>

            {/* ━━━ FEATURES + STEPS (side by side) ━━━ */}
            <section style={{
                padding: '4rem 2rem 7rem',
                borderTop: '1px solid var(--border)',
            }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }} className="g2">

                    {/* Features */}
                    <div ref={featRef} className="sr">
                        <div className="section-label">Platform</div>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', fontWeight: '900',
                            color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.6rem',
                        }}>
                            Everything you need,
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500', marginBottom: '2rem' }}>
                            nothing you don't.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {features.map((f, i) => <FeatRow key={f.title} {...f} />)}
                        </div>
                    </div>

                    {/* Steps */}
                    <div>
                        <div ref={stepsRef} className="sr">
                            <div className="section-label">Process</div>
                            <h2 style={{
                                fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', fontWeight: '900',
                                color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.6rem',
                            }}>
                                Up and running
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500', marginBottom: '2rem' }}>
                                in three steps.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {steps.map((step, i) => (
                                    <StepItem key={step.title} step={step} index={i} color={stepColors[i]} />
                                ))}
                            </div>

                            {/* Privacy card */}
                            <div style={{
                                marginTop: '2rem', padding: '1.25rem 1.5rem',
                                background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                                borderRadius: 14,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem' }}>
                                    <i className="fas fa-shield-alt" style={{ color: 'var(--accent-text)', fontSize: '0.9rem' }} />
                                    <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                                        Privacy first
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.7 }}>
                                    Your data stays yours. Open-source codebase, no tracking, no ads.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ━━━ TESTIMONIALS ━━━ */}
            <section style={{ padding: '6rem 2rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div ref={testiRef} className="sr">
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                            flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem',
                        }}>
                            <div>
                                <div className="section-label">Testimonials</div>
                                <h2 style={{
                                    fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', fontWeight: '900',
                                    color: 'var(--text-primary)',
                                }}>
                                    What people are saying.
                                </h2>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                {[...Array(5)].map((_, i) => (
                                    <i key={i} className="fas fa-star" style={{ color: 'var(--amber)', fontSize: '0.72rem' }} />
                                ))}
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.4rem' }}>
                                    5.0 average
                                </span>
                            </div>
                        </div>
                        <div className="g3">
                            {testimonials.map((t, i) => <TestiCard key={i} t={t} />)}
                        </div>
                    </div>
                </div>
            </section>

            {/* ━━━ FEATURED PROJECTS ━━━ */}
            <section style={{
                padding: '6rem 2rem',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-subtle)',
            }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div ref={projRef} className="sr">
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                            flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem',
                        }}>
                            <div>
                                <div className="section-label">Featured</div>
                                <h2 style={{
                                    fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', fontWeight: '900',
                                    color: 'var(--text-primary)',
                                }}>
                                    Projects in motion.
                                </h2>
                            </div>
                            <Link to="/projects" style={{
                                color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600',
                                display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none',
                                transition: 'color 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                View all <i className="fas fa-arrow-right" style={{ fontSize: '0.68rem' }} />
                            </Link>
                        </div>

                        {projects.length === 0 ? (
                            <div style={{
                                background: 'var(--bg-surface)', border: '1px solid var(--border)', 
                                borderRadius: 16, padding: '4rem 2rem', textAlign: 'center',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                <div style={{ 
                                    width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-soft)',
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '1.5rem', color: 'var(--accent)', fontSize: '1.75rem'
                                }}>
                                    <i className="fas fa-seedling"></i>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                    Great things are growing
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto' }}>
                                    Check back soon to see featured community initiatives, or head over to the projects board to start your own.
                                </p>
                            </div>
                        ) : (
                            <div className="g3">
                                {projects.map(p => {
                                    const statusMap = {
                                        active: 'var(--green)', planning: 'var(--amber)',
                                        completed: 'var(--accent)', in_progress: 'var(--cyan)', on_hold: 'var(--text-muted)',
                                    };
                                    const sc = statusMap[p.status] || 'var(--green)';
                                    return (
                                        <Link key={p._id} to={`/projects/${p._id}`} className="project-card">
                                            <div style={{
                                                height: 170, position: 'relative', overflow: 'hidden',
                                                background: dark
                                                    ? 'linear-gradient(135deg, #181530, #20193f)'
                                                    : 'linear-gradient(135deg, #e8e6f8, #d4d0f0)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {p.image ? (
                                                    <img src={getMediaUrl(p.image)} alt={p.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <i className="fas fa-project-diagram" style={{
                                                        color: dark ? 'rgba(255,255,255,0.07)' : 'rgba(79,70,229,0.15)',
                                                        fontSize: '2rem',
                                                    }} />
                                                )}
                                                {/* Status pill */}
                                                <div style={{
                                                    position: 'absolute', bottom: '0.75rem', left: '0.75rem',
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                                    background: dark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.85)',
                                                    backdropFilter: 'blur(8px)',
                                                    borderRadius: 100, padding: '0.18rem 0.6rem',
                                                    fontSize: '0.66rem', fontWeight: '700',
                                                    color: sc, textTransform: 'uppercase', letterSpacing: '0.5px',
                                                }}>
                                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc, flexShrink: 0 }} />
                                                    {(p.status || 'active').replace('_', ' ')}
                                                </div>
                                            </div>
                                            <div style={{ padding: '1.25rem' }}>
                                                <h3 style={{
                                                    fontWeight: '800', color: 'var(--text-primary)',
                                                    fontSize: '0.97rem', marginBottom: '0.35rem',
                                                }}>
                                                    {p.name}
                                                </h3>
                                                <p style={{
                                                    color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.65,
                                                    display: '-webkit-box', WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                }}>
                                                    {p.description}
                                                </p>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', marginTop: '1rem',
                                                    paddingTop: '0.9rem', borderTop: '1px solid var(--border)',
                                                    fontSize: '0.75rem', color: 'var(--text-muted)',
                                                }}>
                                                    <span>
                                                        <i className="fas fa-users" style={{ marginRight: '0.3rem', color: 'var(--accent)' }} />
                                                        {p.members?.length || p.memberCount || 0} members
                                                    </span>
                                                    <span style={{
                                                        marginLeft: 'auto', color: 'var(--accent-text)',
                                                        fontWeight: '700', fontSize: '0.78rem',
                                                    }}>
                                                        View →
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ━━━ CTA ━━━ */}
            <section style={{ padding: '4rem 2rem 7rem' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div ref={ctaRef} className="sr cta-box">
                        {/* Top accent line */}
                        <div style={{
                            position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                            width: '50%', height: 1,
                            background: 'linear-gradient(90deg, transparent, var(--accent), var(--purple), transparent)',
                            pointerEvents: 'none',
                        }} />
                        {/* Radial glow */}
                        <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            background: 'radial-gradient(ellipse 55% 45% at 50% 0%, var(--accent-soft), transparent)',
                        }} />
                        {/* Grid overlay */}
                        <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                            backgroundSize: '56px 56px', opacity: 0.5,
                            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)',
                            WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)',
                        }} />

                        <div style={{ position: 'relative' }}>
                            <div className="section-label">Join Us</div>
                            <h2 style={{
                                fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '900',
                                color: 'var(--text-primary)', lineHeight: 1.15,
                                marginBottom: '0.85rem', marginTop: '0.4rem',
                            }}>
                                Ready to make a{' '}
                                <span className="grad">difference?</span>
                            </h2>
                            <p style={{
                                fontSize: '1rem', color: 'var(--text-secondary)',
                                maxWidth: 440, margin: '0 auto 2.5rem', lineHeight: 1.8,
                            }}>
                                Join thousands of community members working together for a more connected future.
                            </p>
                            <div className="hero-btns" style={{
                                display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap',
                            }}>
                                <Link to="/register" className="btn-primary">
                                    <i className="fas fa-rocket" style={{ fontSize: '0.82rem' }} />
                                    Join EKYAM Today
                                </Link>
                                <Link to="/map" className="btn-ghost">
                                    <i className="fas fa-map-marked-alt" style={{ fontSize: '0.82rem' }} />
                                    Explore Map
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
