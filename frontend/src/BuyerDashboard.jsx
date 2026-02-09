import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

export default function BuyerDashboard() {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [myBids, setMyBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedListing, setSelectedListing] = useState(null);
    const [bidAmount, setBidAmount] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [listingsRes, bidsRes] = await Promise.all([
                api.get('/listings/'),
                api.get('/bids/')
            ]);
            setListings(listingsRes.data.results || listingsRes.data);
            setMyBids(bidsRes.data.results || bidsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handlePlaceBid = async (listingId) => {
        if (!bidAmount) {
            alert('Please enter bid amount');
            return;
        }

        try {
            await api.post('/bids/', {
                listing_id: listingId,
                amount_per_quintal: parseFloat(bidAmount)
            });

            alert('Bid placed successfully!');
            setBidAmount('');
            setSelectedListing(null);
            loadData(); // Reload data
        } catch (error) {
            alert('Error: ' + (error.response?.data?.detail || error.response?.data?.error || 'Failed to place bid'));
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f3f6' }}>
            {/* Header */}
            <header style={{ backgroundColor: '#2874f0', padding: '12px 0', boxShadow: '0 1px 2px rgba(0,0,0,.1)' }}>
                <div style={{ maxWidth: '1248px', margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', fontStyle: 'italic' }}>AgroBid</h1>
                        <p style={{ color: '#fff', fontSize: '11px', marginTop: '2px', opacity: 0.9 }}>Buyer Dashboard</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span style={{ color: '#fff', fontSize: '14px' }}>👤 {user?.username}</span>
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

            {/* Main Content */}
            <div style={{ maxWidth: '1248px', margin: '0 auto', padding: '24px 16px' }}>
                {/* My Bids Section */}
                {myBids.length > 0 && (
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#212121' }}>
                            My Bids ({myBids.length})
                        </h2>

                        <div style={{ display: 'grid', gap: '12px' }}>
                            {myBids.map((bid) => (
                                <div key={bid.id} style={{
                                    backgroundColor: '#fff',
                                    padding: '16px',
                                    borderRadius: '2px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <p style={{ fontSize: '14px', color: '#212121', fontWeight: '600' }}>
                                            Listing #{bid.listing?.id || bid.listing_id}
                                        </p>
                                        <p style={{ fontSize: '13px', color: '#878787', marginTop: '4px' }}>
                                            Bid: ₹{bid.amount_per_quintal}/quintal | Total: ₹{bid.total_amount?.toLocaleString()}
                                        </p>
                                    </div>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '2px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        backgroundColor: bid.status === 'PENDING' ? '#fff4e6' : bid.status === 'ACCEPTED' ? '#e6f7e6' : '#ffe6e6',
                                        color: bid.status === 'PENDING' ? '#f57c00' : bid.status === 'ACCEPTED' ? '#388e3c' : '#d32f2f'
                                    }}>
                                        {bid.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Marketplace */}
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#212121' }}>
                    Marketplace - Available Paddy Listings
                </h2>

                {loading ? (
                    <div style={{ backgroundColor: '#fff', padding: '48px', textAlign: 'center', borderRadius: '2px' }}>
                        <p style={{ color: '#878787' }}>Loading...</p>
                    </div>
                ) : listings.length === 0 ? (
                    <div style={{ backgroundColor: '#fff', padding: '48px', textAlign: 'center', borderRadius: '2px' }}>
                        <p style={{ color: '#878787' }}>No active listings available</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {listings.map((listing) => (
                            <div key={listing.id} style={{
                                backgroundColor: '#fff',
                                borderRadius: '2px',
                                boxShadow: '0 1px 2px rgba(0,0,0,.1)',
                                overflow: 'hidden',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.15)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,.1)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}>
                                <div style={{ padding: '16px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#212121', marginBottom: '8px' }}>
                                        {listing.crop_variety?.name || listing.crop_variety_name || 'N/A'}
                                    </h3>

                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#212121', marginBottom: '8px' }}>
                                        ₹{listing.expected_price_per_quintal}
                                        <span style={{ fontSize: '14px', fontWeight: '400', color: '#878787' }}>/quintal</span>
                                    </div>

                                    <p style={{ fontSize: '13px', color: '#878787', marginBottom: '4px' }}>
                                        Quantity: {listing.quantity_quintals} quintals
                                    </p>
                                    <p style={{ fontSize: '13px', color: '#878787', marginBottom: '8px' }}>
                                        📍 {listing.district}, {listing.state}
                                    </p>

                                    {listing.moisture_content && (
                                        <p style={{ fontSize: '12px', color: '#388e3c', marginBottom: '12px' }}>
                                            ✓ Moisture: {listing.moisture_content}%
                                        </p>
                                    )}

                                    {selectedListing === listing.id ? (
                                        <div>
                                            <input
                                                type="number"
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                placeholder="Enter bid amount"
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: '2px',
                                                    marginBottom: '8px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handlePlaceBid(listing.id)}
                                                    style={{
                                                        flex: 1,
                                                        backgroundColor: '#fb641b',
                                                        color: '#fff',
                                                        padding: '10px',
                                                        border: 'none',
                                                        borderRadius: '2px',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Submit Bid
                                                </button>
                                                <button
                                                    onClick={() => setSelectedListing(null)}
                                                    style={{
                                                        flex: 1,
                                                        backgroundColor: '#fff',
                                                        color: '#878787',
                                                        padding: '10px',
                                                        border: '1px solid #e0e0e0',
                                                        borderRadius: '2px',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setSelectedListing(listing.id)}
                                            style={{
                                                width: '100%',
                                                backgroundColor: '#fb641b',
                                                color: '#fff',
                                                padding: '10px',
                                                border: 'none',
                                                borderRadius: '2px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Place Bid
                                        </button>
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
