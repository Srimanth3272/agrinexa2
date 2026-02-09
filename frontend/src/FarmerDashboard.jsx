import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

export default function FarmerDashboard() {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        loadListings();
    }, []);

    const loadListings = async () => {
        try {
            const response = await api.get('/listings/');
            setListings(response.data.results || response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading listings:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const activeListings = listings.filter(l => l.status === 'ACTIVE');
    const soldListings = listings.filter(l => l.status === 'SOLD');
    const totalBids = listings.reduce((sum, l) => sum + (l.bids_count || 0), 0);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f3f6' }}>
            {/* Header */}
            <header style={{ backgroundColor: '#2874f0', padding: '12px 0', boxShadow: '0 1px 2px rgba(0,0,0,.1)' }}>
                <div style={{ maxWidth: '1248px', margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', fontStyle: 'italic' }}>AgroBid</h1>
                        <p style={{ color: '#fff', fontSize: '11px', marginTop: '2px', opacity: 0.9 }}>Farmer Dashboard</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span style={{ color: '#fff', fontSize: '14px' }}>👤 {user?.first_name || user?.username}</span>
                        <button
                            onClick={handleLogout}
                            style={{
                                backgroundColor: '#fff',
                                color: '#2874f0',
                                padding: '6px 16px',
                                border: 'none',
                                borderRadius: '2px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            <div style={{ backgroundColor: '#2874f0', padding: '24px 0' }}>
                <div style={{ maxWidth: '1248px', margin: '0 auto', padding: '0 16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '2px', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#2874f0' }}>{activeListings.length}</div>
                            <div style={{ fontSize: '13px', color: '#878787', marginTop: '4px' }}>Active Listings</div>
                        </div>
                        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '2px', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#388e3c' }}>{totalBids}</div>
                            <div style={{ fontSize: '13px', color: '#878787', marginTop: '4px' }}>Total Bids</div>
                        </div>
                        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '2px', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#ff9800' }}>{soldListings.length}</div>
                            <div style={{ fontSize: '13px', color: '#878787', marginTop: '4px' }}>Sold</div>
                        </div>
                        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '2px', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#9c27b0' }}>{listings.length}</div>
                            <div style={{ fontSize: '13px', color: '#878787', marginTop: '4px' }}>Total Listings</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: '1248px', margin: '0 auto', padding: '24px 16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#212121' }}>
                    My Crop Listings
                </h2>

                {loading ? (
                    <div style={{ backgroundColor: '#fff', padding: '48px', textAlign: 'center', borderRadius: '2px' }}>
                        <p style={{ color: '#878787' }}>Loading...</p>
                    </div>
                ) : listings.length === 0 ? (
                    <div style={{ backgroundColor: '#fff', padding: '48px', textAlign: 'center', borderRadius: '2px', boxShadow: '0 1px 2px rgba(0,0,0,.1)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌾</div>
                        <p style={{ fontSize: '16px', color: '#212121', marginBottom: '8px' }}>No listings yet</p>
                        <p style={{ fontSize: '14px', color: '#878787' }}>Your crop listings will appear here</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {listings.map((listing) => (
                            <div key={listing.id} style={{
                                backgroundColor: '#fff',
                                borderRadius: '2px',
                                boxShadow: '0 1px 2px rgba(0,0,0,.1)',
                                padding: '20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212121' }}>
                                            {listing.crop_variety?.name || listing.crop_variety_name || 'N/A'}
                                        </h3>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            backgroundColor: listing.status === 'ACTIVE' ? '#e6f7e6' : listing.status === 'SOLD' ? '#e3f2fd' : '#f5f5f5',
                                            color: listing.status === 'ACTIVE' ? '#388e3c' : listing.status === 'SOLD' ? '#1976d2' : '#616161'
                                        }}>
                                            {listing.status}
                                        </span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '12px' }}>
                                        <div>
                                            <p style={{ fontSize: '12px', color: '#878787', marginBottom: '4px' }}>Quantity</p>
                                            <p style={{ fontSize: '16px', fontWeight: '600', color: '#212121' }}>
                                                {listing.quantity_quintals} quintals
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12px', color: '#878787', marginBottom: '4px' }}>Expected Price</p>
                                            <p style={{ fontSize: '16px', fontWeight: '600', color: '#212121' }}>
                                                ₹{listing.expected_price_per_quintal}/quintal
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12px', color: '#878787', marginBottom: '4px' }}>Location</p>
                                            <p style={{ fontSize: '14px', color: '#212121' }}>
                                                {listing.district}, {listing.state}
                                            </p>
                                        </div>
                                    </div>

                                    {listing.moisture_content && (
                                        <p style={{ fontSize: '13px', color: '#388e3c', marginTop: '8px' }}>
                                            ✓ Moisture: {listing.moisture_content}%
                                            {listing.foreign_matter && ` | Foreign Matter: ${listing.foreign_matter}%`}
                                        </p>
                                    )}
                                </div>

                                <div style={{ textAlign: 'right', marginLeft: '24px' }}>
                                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#2874f0', marginBottom: '4px' }}>
                                        {listing.bids_count || 0}
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#878787', marginBottom: '8px' }}>Bids Received</p>

                                    {listing.highest_bid && (
                                        <div style={{
                                            backgroundColor: '#fff4e6',
                                            padding: '8px 12px',
                                            borderRadius: '2px',
                                            marginTop: '8px'
                                        }}>
                                            <p style={{ fontSize: '11px', color: '#878787', marginBottom: '2px' }}>Highest Bid</p>
                                            <p style={{ fontSize: '16px', fontWeight: '700', color: '#f57c00' }}>
                                                ₹{listing.highest_bid}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
