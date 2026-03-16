import { useTheme } from '../context/ThemeContext';

export default function LoadingSpinner() {
    let theme;
    try { theme = useTheme().theme; } catch { theme = { bg: '#f3f4f6', accent: '#4f46e5' }; }

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '60vh', background: theme.bg
        }}>
            <div style={{
                width: '40px', height: '40px',
                border: `3px solid ${theme.accent}22`,
                borderTop: `3px solid ${theme.accent}`,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
