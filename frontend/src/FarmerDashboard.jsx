import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

export default function FarmerDashboard() {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [viewingBids, setViewingBids] = useState(null);
    const [bids, setBids] = useState([]);

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

    const fetchBids = async (listingId) => {
        setViewingBids(listingId);
        try {
            const response = await api.get(`/bids/?listing=${listingId}`);
            setBids(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching bids:', error);
            alert('Failed to load bids');
        }
    };

    const handleAcceptBid = async (bidId) => {
        if (!window.confirm('Are you sure you want to accept this bid? This will close the listing and reject other bids.')) {
            return;
        }
        try {
            await api.post(`/bids/${bidId}/accept/`);
            alert('Bid accepted successfully! Order created.');
            setViewingBids(null);
            loadListings(); // Reload listings to update status
        } catch (error) {
            console.error('Error accepting bid:', error);
            alert('Failed to accept bid');
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={() => navigate('/finance')}
                            style={{
                                backgroundColor: '#388e3c',
                                color: '#fff',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '2px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            💰 Finance
                        </button>
                        <button
                            onClick={() => navigate('/logistics')}
                            style={{
                                backgroundColor: '#009688',
                                color: '#fff',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '2px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            🚚 Logistics
                        </button>
                        <button
                            onClick={() => navigate('/farmer/create-listing')}
                            style={{
                                backgroundColor: '#ff9800',
                                color: '#fff',
                                padding: '8px 20px',
                                border: 'none',
                                borderRadius: '2px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            ➕ Create New Listing
                        </button>
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
                        <p style={{ fontSize: '14px', color: '#878787', marginBottom: '20px' }}>Create your first listing to start selling</p>
                        <button
                            onClick={() => navigate('/farmer/create-listing')}
                            style={{
                                backgroundColor: '#ff9800',
                                color: '#fff',
                                padding: '12px 32px',
                                border: 'none',
                                borderRadius: '2px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            ➕ Create New Listing
                        </button>
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
                                            marginTop: '8px',
                                            marginBottom: '8px'
                                        }}>
                                            <p style={{ fontSize: '11px', color: '#878787', marginBottom: '2px' }}>Highest Bid</p>
                                            <p style={{ fontSize: '16px', fontWeight: '700', color: '#f57c00' }}>
                                                ₹{listing.highest_bid}
                                            </p>
                                        </div>
                                    )}

                                    {listing.bids_count > 0 && listing.status === 'ACTIVE' && (
                                        <button
                                            onClick={() => fetchBids(listing.id)}
                                            style={{
                                                backgroundColor: '#2874f0',
                                                color: '#fff',
                                                padding: '8px 16px',
                                                border: 'none',
                                                borderRadius: '2px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                marginTop: '8px',
                                                width: '100%'
                                            }}
                                        >
                                            View Bids
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bids Modal */}
            {viewingBids && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '2px',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            padding: '16px 24px',
                            borderBottom: '1px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Received Bids</h3>
                            <button
                                onClick={() => setViewingBids(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#878787'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ padding: '24px', overflowY: 'auto' }}>
                            {bids.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#878787' }}>No bids found.</p>
                            ) : (
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {bids.map((bid) => (
                                        <div key={bid.id} style={{
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '4px',
                                            padding: '16px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '20px', fontWeight: '700', color: '#212121' }}>
                                                    ₹{bid.amount_per_quintal}
                                                    <span style={{ fontSize: '14px', fontWeight: '400', color: '#878787' }}>/quintal</span>
                                                </div>
                                                <p style={{ fontSize: '13px', color: '#878787', marginTop: '4px' }}>
                                                    Buyer: {bid.buyer?.username || 'Verified Buyer'}
                                                </p>
                                                <p style={{ fontSize: '13px', color: '#878787' }}>
                                                    Total: ₹{bid.total_amount?.toLocaleString()}
                                                </p>
                                            </div>

                                            {bid.status === 'PENDING' ? (
                                                <button
                                                    onClick={() => handleAcceptBid(bid.id)}
                                                    style={{
                                                        backgroundColor: '#fb641b',
                                                        color: '#fff',
                                                        padding: '10px 24px',
                                                        border: 'none',
                                                        borderRadius: '2px',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Accept
                                                </button>
                                            ) : (
                                                <span style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: bid.status === 'ACCEPTED' ? '#e6f7e6' : '#ffe6e6',
                                                    color: bid.status === 'ACCEPTED' ? '#388e3c' : '#d32f2f',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}>
                                                    {bid.status}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
