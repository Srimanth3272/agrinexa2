import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (user) {
        if (user.role === 'FARMER') navigate('/farmer/dashboard');
        else if (user.role === 'BUYER') navigate('/buyer/dashboard');
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f3f6' }}>
            {/* Header */}
            <header style={{
                backgroundColor: '#2874f0',
                boxShadow: '0 1px 2px 0 rgba(0,0,0,.1)',
                padding: '12px 0'
            }}>
                <div style={{
                    maxWidth: '1248px',
                    margin: '0 auto',
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <h1 style={{
                            color: '#fff',
                            fontSize: '24px',
                            fontWeight: '700',
                            fontStyle: 'italic'
                        }}>
                            AgroBid
                        </h1>
                        <p style={{ color: '#fff', fontSize: '11px', marginTop: '2px' }}>
                            Connecting Farmers & Buyers
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Link
                            to="/login"
                            style={{
                                backgroundColor: '#fff',
                                color: '#2874f0',
                                padding: '8px 24px',
                                borderRadius: '2px',
                                fontWeight: '600',
                                textDecoration: 'none',
                                fontSize: '14px'
                            }}
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            style={{
                                backgroundColor: '#fff',
                                color: '#2874f0',
                                padding: '8px 24px',
                                borderRadius: '2px',
                                fontWeight: '600',
                                textDecoration: 'none',
                                fontSize: '14px'
                            }}
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #2874f0 0%, #1557b0 100%)',
                padding: '60px 16px',
                textAlign: 'center',
                color: '#fff'
            }}>
                <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
                    India's Paddy Trading Platform
                </h2>
                <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.9 }}>
                    Smart Price Discovery | Controlled Bidding | Secure Escrow Payments
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link
                        to="/register"
                        style={{
                            backgroundColor: '#fff',
                            color: '#2874f0',
                            padding: '12px 32px',
                            borderRadius: '2px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            fontSize: '16px',
                            display: 'inline-block'
                        }}
                    >
                        Start Selling
                    </Link>
                    <Link
                        to="/register"
                        style={{
                            backgroundColor: 'transparent',
                            color: '#fff',
                            padding: '12px 32px',
                            borderRadius: '2px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            fontSize: '16px',
                            border: '2px solid #fff',
                            display: 'inline-block'
                        }}
                    >
                        Start Buying
                    </Link>
                    <Link
                        to="/price-analytics"
                        style={{
                            backgroundColor: '#fb641b',
                            color: '#fff',
                            padding: '12px 32px',
                            borderRadius: '2px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            fontSize: '16px',
                            display: 'inline-block',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    >
                        📊 View Price Analytics
                    </Link>
                </div>
            </div>

            {/* Features */}
            <div style={{ maxWidth: '1248px', margin: '32px auto', padding: '0 16px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px'
                }}>
                    {[
                        { emoji: '🌾', title: 'For Farmers', desc: 'List your paddy crops and get competitive bids from verified rice mills' },
                        { emoji: '🏭', title: 'For Buyers', desc: 'Browse quality paddy listings and place bids directly with farmers' },
                        { emoji: '💰', title: 'Secure Payments', desc: 'Escrow-based payment system with 20% token and full payment options' },
                        { emoji: '📊', title: 'Price Discovery', desc: 'Market-driven pricing with transparent bidding and real-time updates' },
                        { emoji: '🔒', title: 'Verified Users', desc: 'KYC verification for farmers and GST verification for buyers' },
                        { emoji: '🚚', title: 'Logistics Support', desc: 'Integrated shipment tracking from pickup to delivery' }
                    ].map((feature, i) => (
                        <div key={i} style={{
                            backgroundColor: '#fff',
                            padding: '24px',
                            borderRadius: '2px',
                            boxShadow: '0 1px 2px 0 rgba(0,0,0,.1)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{feature.emoji}</div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#212121' }}>
                                {feature.title}
                            </h3>
                            <p style={{ fontSize: '14px', color: '#878787', lineHeight: '1.6' }}>
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div style={{
                backgroundColor: '#fff',
                padding: '48px 16px',
                marginTop: '32px',
                boxShadow: '0 1px 2px 0 rgba(0,0,0,.1)'
            }}>
                <div style={{ maxWidth: '1248px', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '32px',
                        textAlign: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#2874f0' }}>500+</div>
                            <div style={{ color: '#878787', marginTop: '8px' }}>Active Farmers</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#2874f0' }}>200+</div>
                            <div style={{ color: '#878787', marginTop: '8px' }}>Rice Mills</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#2874f0' }}>₹50Cr+</div>
                            <div style={{ color: '#878787', marginTop: '8px' }}>Transactions</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#2874f0' }}>5000+</div>
                            <div style={{ color: '#878787', marginTop: '8px' }}>Successful Deals</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={{
                backgroundColor: '#172337',
                color: '#fff',
                padding: '24px 16px',
                marginTop: '48px',
                textAlign: 'center'
            }}>
                <p style={{ fontSize: '14px', opacity: 0.8 }}>
                    © 2026 AgroBid Exchange System. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
