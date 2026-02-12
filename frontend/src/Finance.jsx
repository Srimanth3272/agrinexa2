import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

export default function Finance() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/finance/dashboard/');
            setDashboardData(response.data);
        } catch (err) {
            console.error('Finance dashboard error:', err);
            setError('Failed to load finance data');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionTypeLabel = (type) => {
        const labels = {
            'TOKEN': 'Token Payment',
            'FULL': 'Full Payment',
            'RELEASE': 'Released',
            'REFUND': 'Refund'
        };
        return labels[type] || type;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SUCCESS': return '#388e3c';
            case 'PENDING': return '#ff9800';
            case 'FAILED': return '#d32f2f';
            default: return '#666';
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: ' #f1f3f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
                    <p style={{ fontSize: '16px', color: '#666' }}>Loading finance data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f1f3f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                    <p style={{ fontSize: '16px', color: '#d32f2f' }}>{error}</p>
                </div>
            </div>
        );
    }

    const isFarmer = dashboardData?.role === 'FARMER';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f3f6' }}>
            {/* Header */}
            <header style={{ backgroundColor: '#2874f0', padding: '12px 0', boxShadow: '0 1px 2px rgba(0,0,0,.1)' }}>
                <div style={{ maxWidth: '1248px', margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', fontStyle: 'italic', margin: 0 }}>AgroBid</h1>
                        <p style={{ color: '#fff', fontSize: '11px', marginTop: '2px', opacity: 0.9 }}>Finance Dashboard</p>
                    </div>
                    <button
                        onClick={() => navigate(isFarmer ? '/farmer/dashboard' : '/buyer/dashboard')}
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
                        ← Back to Dashboard
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ maxWidth: '1248px', margin: '0 auto', padding: '24px 16px' }}>
                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px'
                }}>
                    {isFarmer ? (
                        <>
                            {/* Farmer Stats */}
                            <div style={{
                                backgroundColor: '#fff',
                                padding: '24px',
                                borderRadius: '4px',
                                boxShadow: '0 2px 4px rgba(0,0,0,.08)',
                                border: '1px solid #e0e0e0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '32px', marginRight: '12px' }}>💵</div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#878787', margin: 0 }}>Total Earnings</p>
                                        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#388e3c', margin: '4px 0 0 0' }}>
                                            ₹{dashboardData.total_earnings.toLocaleString('en-IN')}
                                        </h2>
                                    </div>
                                </div>
                                <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>Received from sales</p>
                            </div>

                            <div style={{
                                backgroundColor: '#fff',
                                padding: '24px',
                                borderRadius: '4px',
                                boxShadow: '0 2px 4px rgba(0,0,0,.08)',
                                border: '1px solid #e0e0e0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '32px', marginRight: '12px' }}>⏳</div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#878787', margin: 0 }}>Pending Releases</p>
                                        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#ff9800', margin: '4px 0 0 0' }}>
                                            ₹{dashboardData.pending_releases.toLocaleString('en-IN')}
                                        </h2>
                                    </div>
                                </div>
                                <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>In escrow</p>
                            </div>

                            <div style={{
                                backgroundColor: '#fff',
                                padding: '24px',
                                borderRadius: '4px',
                                boxShadow: '0 2px 4px rgba(0,0,0,.08)',
                                border: '1px solid #e0e0e0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '32px', marginRight: '12px' }}>📊</div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#878787', margin: 0 }}>Total Transactions</p>
                                        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#2874f0', margin: '4px 0 0 0' }}>
                                            {dashboardData.total_transactions}
                                        </h2>
                                    </div>
                                </div>
                                <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>Completed</p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Buyer Stats */}
                            <div style={{
                                backgroundColor: '#fff',
                                padding: '24px',
                                borderRadius: '4px',
                                boxShadow: '0 2px 4px rgba(0,0,0,.08)',
                                border: '1px solid #e0e0e0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '32px', marginRight: '12px' }}>💸</div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#878787', margin: 0 }}>Total Paid</p>
                                        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#d32f2f', margin: '4px 0 0 0' }}>
                                            ₹{dashboardData.total_paid.toLocaleString('en-IN')}
                                        </h2>
                                    </div>
                                </div>
                                <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>All payments made</p>
                            </div>

                            <div style={{
                                backgroundColor: '#fff',
                                padding: '24px',
                                borderRadius: '4px',
                                boxShadow: '0 2px 4px rgba(0,0,0,.08)',
                                border: '1px solid #e0e0e0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '32px', marginRight: '12px' }}>🎯</div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#878787', margin: 0 }}>Token Payments</p>
                                        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#ff9800', margin: '4px 0 0 0' }}>
                                            ₹{dashboardData.token_payments.toLocaleString('en-IN')}
                                        </h2>
                                    </div>
                                </div>
                                <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>20% deposits</p>
                            </div>

                            <div style={{
                                backgroundColor: '#fff',
                                padding: '24px',
                                borderRadius: '4px',
                                boxShadow: '0 2px 4px rgba(0,0,0,.08)',
                                border: '1px solid #e0e0e0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '32px', marginRight: '12px' }}>✅</div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#878787', margin: 0 }}>Full Payments</p>
                                        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#388e3c', margin: '4px 0 0 0' }}>
                                            ₹{dashboardData.full_payments.toLocaleString('en-IN')}
                                        </h2>
                                    </div>
                                </div>
                                <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>Complete orders</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Recent Transactions */}
                <div style={{
                    backgroundColor: '#fff',
                    padding: '24px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,.08)',
                    border: '1px solid #e0e0e0'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212121', marginBottom: '20px' }}>
                        📜 Recent Transactions
                    </h3>

                    {dashboardData.recent_transactions && dashboardData.recent_transactions.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666' }}>Transaction ID</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666' }}>Type</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666' }}>Amount</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666' }}>Status</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666' }}>Date</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666' }}>Gateway</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData.recent_transactions.map((transaction, idx) => (
                                        <tr key={transaction.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                            <td style={{ padding: '12px', fontSize: '13px', color: '#212121', fontFamily: 'monospace' }}>
                                                {transaction.gateway_transaction_id || `TXN${transaction.id}`}
                                            </td>
                                            <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>
                                                {getTransactionTypeLabel(transaction.transaction_type)}
                                            </td>
                                            <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#212121' }}>
                                                ₹{parseFloat(transaction.amount).toLocaleString('en-IN')}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    color: '#fff',
                                                    backgroundColor: getStatusColor(transaction.status)
                                                }}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                                                {formatDate(transaction.created_at)}
                                            </td>
                                            <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                                                {transaction.payment_gateway}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                            <p style={{ fontSize: '16px', color: '#878787' }}>No transactions yet</p>
                            <p style={{ fontSize: '13px', color: '#aaa' }}>
                                {isFarmer ? 'Start selling to see your earnings here' : 'Make a purchase to see your payments here'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
