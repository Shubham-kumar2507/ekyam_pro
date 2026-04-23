import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function GlobalLoader() {
    const [isLoading, setIsLoading] = useState(false);
    let theme;
    try { theme = useTheme().theme; } catch { theme = { bg: '#f3f4f6', accent: '#4f46e5', textFaint: '#9ca3af', textSecondary: '#4b5563', bgCard: '#ffffff', border: '#e5e7eb' }; }

    useEffect(() => {
        let activeRequests = 0;
        
        const handleStart = () => {
            activeRequests++;
            setIsLoading(true);
        };
        
        const handleEnd = () => {
            activeRequests--;
            if (activeRequests <= 0) {
                activeRequests = 0;
                setIsLoading(false);
            }
        };

        window.addEventListener('api-load-start', handleStart);
        window.addEventListener('api-load-end', handleEnd);

        return () => {
            window.removeEventListener('api-load-start', handleStart);
            window.removeEventListener('api-load-end', handleEnd);
        };
    }, []);

    if (!isLoading) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
            zIndex: 99999, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: theme.bgCard || '#ffffff', padding: '2rem 3.5rem', borderRadius: '24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                animation: 'fadeUpLoader 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                border: theme.border ? `1px solid ${theme.border}` : 'none'
            }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '18px',
                    background: `linear-gradient(135deg, #4338ca, #6366f1)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '1.75rem',
                    animation: 'spinnerPulse 1.5s ease-in-out infinite, floatLoader 3s ease-in-out infinite',
                    boxShadow: '0 8px 30px rgba(99,102,241,0.3)'
                }}>
                    <i className="fas fa-satellite-dish"></i>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <p style={{
                        color: theme.textSecondary || '#4b5563', fontSize: '1rem',
                        fontWeight: '700', letterSpacing: '0.5px'
                    }}>
                        Processing Request
                    </p>
                    <p style={{
                        color: theme.textFaint || '#9ca3af', fontSize: '0.75rem',
                        fontWeight: '500', animation: 'pulsateText 2s infinite'
                    }}>
                        Please wait...
                    </p>
                </div>
                
                {/* Micro spinning indicator */}
                <div style={{
                    width: '40px', height: '4px', background: `${theme.accent || '#4f46e5'}20`,
                    borderRadius: '2px', overflow: 'hidden', position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute', top: 0, left: 0, height: '100%',
                        width: '40%', background: theme.accent || '#4f46e5', borderRadius: '2px',
                        animation: 'loadingBar 1s ease-in-out infinite'
                    }} />
                </div>
            </div>
            
            <style>{`
                @keyframes spinnerPulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(0.92); opacity: 0.8; }
                }
                @keyframes fadeUpLoader {
                    from { transform: translateY(20px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes floatLoader {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes pulsateText {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                @keyframes loadingBar {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(150%); }
                    100% { transform: translateX(250%); }
                }
            `}</style>
        </div>
    );
}
