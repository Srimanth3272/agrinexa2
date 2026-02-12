import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

export default function Logistics() {
    const navigate = useNavigate();
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isFarmer = user.role === 'FARMER';

    useEffect(() => {
        loadShipments();
    }, []);

    const loadShipments = async () => {
        try {
            const response = await api.get('/logistics/shipments/');
            setShipments(response.data.results || response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error loading shipments:', err);
            setError('Failed to load logistics data');
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (shipmentId, newStatus) => {
        try {
            await api.post(`/logistics/shipments/${shipmentId}/update_status/`, { status: newStatus });
            loadShipments(); // Reload
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED': return '#388e3c'; // Green
            case 'IN_TRANSIT': return '#1976d2'; // Blue
            case 'SCHEDULED': return '#ff9800'; // Orange
            case 'FAILED': return '#d32f2f'; // Red
            default: return '#757575'; // Grey
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f1f3f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: '18px', color: '#666' }}>Loading shipments...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f1f3f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: '18px', color: '#d32f2f' }}>{error}</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f3f6' }}>
            {/* Header */}
            <header style={{ backgroundColor: '#2874f0', padding: '12px 0', boxShadow: '0 1px 2px rgba(0,0,0,.1)' }}>
                <div style={{ maxWidth: '1248px', margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', fontStyle: 'italic', margin: 0 }}>AgroBid</h1>
                        <p style={{ color: '#fff', fontSize: '11px', marginTop: '2px', opacity: 0.9 }}>Logistics & Delivery</p>
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
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#212121' }}>
                    🚚 My Shipments
                </h2>

                {shipments.length === 0 ? (
                    <div style={{ backgroundColor: '#fff', padding: '48px', textAlign: 'center', borderRadius: '2px', boxShadow: '0 1px 2px rgba(0,0,0,.1)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                        <p style={{ fontSize: '16px', color: '#212121', marginBottom: '8px' }}>No shipments found</p>
                        <p style={{ fontSize: '14px', color: '#878787' }}>
                            track your crop deliveries here
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {shipments.map((shipment) => (
                            <div key={shipment.id} style={{
                                backgroundColor: '#fff',
                                borderRadius: '2px',
                                boxShadow: '0 1px 2px rgba(0,0,0,.1)',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            }}>
                                {/* Top Row: Crop Name & Status */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212121', marginBottom: '4px' }}>
                                            {shipment.order?.listing?.crop_variety?.name || 'Crop Shipment'}
                                        </h3>
                                        <p style={{ fontSize: '13px', color: '#878787' }}>
                                            {shipment.order?.listing?.quantity_quintals} Quintals • Order #{shipment.order?.id}
                                        </p>
                                    </div>
                                    <span style={{
                                        padding: '6px 12px',
                                        borderRadius: '16px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        backgroundColor: getStatusColor(shipment.status),
                                        color: '#fff',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {shipment.status}
                                    </span>
                                </div>

                                {/* Divider */}
                                <div style={{ height: '1px', backgroundColor: '#e0e0e0' }} />

                                {/* Details Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>

                                    {/* Dates */}
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#878787', marginBottom: '4px' }}>Pickup Date</p>
                                        <p style={{ fontSize: '14px', color: '#212121', fontWeight: '500' }}>
                                            {shipment.pickup_date}
                                        </p>
                                    </div>

                                    <div>
                                        <p style={{ fontSize: '12px', color: '#878787', marginBottom: '4px' }}>Delivery Date</p>
                                        <p style={{ fontSize: '14px', color: '#212121', fontWeight: '500' }}>
                                            {shipment.delivery_date || 'Not yet delivered'}
                                        </p>
                                    </div>

                                    {/* Driver Info */}
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#878787', marginBottom: '4px' }}>Driver Details</p>
                                        <p style={{ fontSize: '14px', color: '#212121' }}>
                                            {shipment.driver_name || 'N/A'}
                                        </p>
                                        {shipment.vehicle_number && (
                                            <p style={{ fontSize: '12px', color: '#666' }}>Active Vehicle: {shipment.vehicle_number}</p>
                                        )}
                                        {shipment.driver_phone && (
                                            <p style={{ fontSize: '12px', color: '#666' }}>📞 {shipment.driver_phone}</p>
                                        )}
                                    </div>

                                </div>

                                {/* Actions (Farmer Only) */}
                                {isFarmer && shipment.status !== 'DELIVERED' && shipment.status !== 'FAILED' && (
                                    <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                                        <p style={{ fontSize: '12px', color: '#878787', marginBottom: '8px' }}>Update Status:</p>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {shipment.status === 'SCHEDULED' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(shipment.id, 'IN_TRANSIT')}
                                                    style={{
                                                        backgroundColor: '#1976d2',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    Start Transit
                                                </button>
                                            )}
                                            {shipment.status === 'IN_TRANSIT' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(shipment.id, 'DELIVERED')}
                                                    style={{
                                                        backgroundColor: '#388e3c',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    Mark Delivered
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
