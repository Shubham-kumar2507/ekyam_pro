import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import api from '../api/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function CommunityMap() {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/communities').then(r => {
            const withCoords = r.data.filter(c => c.coordinates?.latitude && c.coordinates?.longitude);
            setCommunities(withCoords);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const center = communities.length > 0 ? [communities[0].coordinates.latitude, communities[0].coordinates.longitude] : [20.5937, 78.9629];

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
            <div style={{ background: 'linear-gradient(135deg, #065f46, #059669)', color: '#fff', padding: '2.5rem 1rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}><i className="fas fa-map-marked-alt" style={{ marginRight: '0.75rem' }}></i>Community Map</h1>
                <p style={{ opacity: 0.85 }}>Discover communities near you ({communities.length} on map)</p>
            </div>

            <div style={{ maxWidth: '1100px', margin: '1.5rem auto', padding: '0 1rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#059669' }}></i></div>
                ) : (
                    <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                        <MapContainer center={center} zoom={5} style={{ height: '500px', width: '100%' }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {communities.map(c => (
                                <Marker key={c._id} position={[c.coordinates.latitude, c.coordinates.longitude]}>
                                    <Popup>
                                        <div style={{ minWidth: '180px' }}>
                                            <h3 style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{c.name}</h3>
                                            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>{c.location} • {c.memberCount || 0} members</p>
                                            <Link to={`/communities/${c._id}`} style={{ color: '#4f46e5', fontSize: '0.85rem', fontWeight: '600' }}>View Details →</Link>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                )}

                {communities.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '2rem', background: '#fff', borderRadius: '12px', marginTop: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <p style={{ color: '#6b7280' }}>No communities with locations found. Communities need latitude/longitude to appear on the map.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
