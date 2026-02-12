import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import PriceAdvisor from './components/AIComponents/PriceAdvisor';
import AIProviderSelector from './components/AIComponents/AIProviderSelector';

export default function CreateListing() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        crop_variety_id: '',
        quantity_quintals: '',
        district: '',
        state: '',
        moisture_content: '',
        foreign_matter: '',
        expected_price_per_quintal: ''
    });
    const [cropVarieties, setCropVarieties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [aiProvider, setAiProvider] = useState('gemini');
    const [showAI, setShowAI] = useState(false);

    // Fetch crop varieties on component mount
    useEffect(() => {
        const fetchCropVarieties = async () => {
            try {
                const response = await api.get('/crop-varieties/');
                setCropVarieties(response.data);
            } catch (err) {
                console.error('Failed to fetch crop varieties:', err);
                // Fallback to hardcoded list if API fails
                setCropVarieties([
                    { id: 1, name: 'Basmati Rice' },
                    { id: 2, name: 'Sona Masoori Rice' },
                    { id: 3, name: 'IR 64 Rice' }
                ]);
            }
        };
        fetchCropVarieties();
    }, []);

    // Auto-show AI recommendations when user has enough data
    useEffect(() => {
        if (formData.crop_variety_id && formData.quantity_quintals && formData.state && formData.district) {
            setShowAI(true);
        } else {
            setShowAI(false);
        }
    }, [formData.crop_variety_id, formData.quantity_quintals, formData.state, formData.district]);

    const indianStates = [
        'Andhra Pradesh', 'Punjab', 'Haryana', 'Tamil Nadu', 'Karnataka',
        'Maharashtra', 'Uttar Pradesh', 'West Bengal', 'Telangana', 'Bihar'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Calculate expires_at (30 days from now)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            const payload = {
                crop_variety_id: parseInt(formData.crop_variety_id),
                quantity_quintals: parseFloat(formData.quantity_quintals),
                expected_price_per_quintal: parseFloat(formData.expected_price_per_quintal),
                district: formData.district,
                state: formData.state,
                location_description: `${formData.district}, ${formData.state}`,
                expires_at: expiresAt.toISOString(),
                moisture_content: formData.moisture_content ? parseFloat(formData.moisture_content) : null,
                foreign_matter: formData.foreign_matter ? parseFloat(formData.foreign_matter) : null
            };

            await api.post('/listings/', payload);
            navigate('/farmer/dashboard');
        } catch (err) {
            console.error('Create listing error:', err);
            setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f3f6' }}>
            {/* Header */}
            <header style={{ backgroundColor: '#2874f0', padding: '12px 0', boxShadow: '0 1px 2px rgba(0,0,0,.1)' }}>
                <div style={{ maxWidth: '1248px', margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', fontStyle: 'italic' }}>AgroBid</h1>
                        <p style={{ color: '#fff', fontSize: '11px', marginTop: '2px', opacity: 0.9 }}>Create New Listing</p>
                    </div>
                    <button
                        onClick={() => navigate('/farmer/dashboard')}
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
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
                <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '2px', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: '#212121' }}>
                        🌾 Create Crop Listing
                    </h2>
                    <p style={{ fontSize: '14px', color: '#878787', marginBottom: '24px' }}>
                        Fill in your crop details to create a new listing
                    </p>

                    {error && (
                        <div style={{ backgroundColor: '#ffebee', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #ef5350' }}>
                            <p style={{ color: '#d32f2f', fontSize: '14px' }}>⚠️ {error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Crop Details Section */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#212121', marginBottom: '16px' }}>
                                Crop Details
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#212121', marginBottom: '6px' }}>
                                        Crop Variety *
                                    </label>
                                    <select
                                        name="crop_variety_id"
                                        value={formData.crop_variety_id}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #c2c2c2',
                                            borderRadius: '2px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="">Select crop variety</option>
                                        {cropVarieties.map(crop => (
                                            <option key={crop.id} value={crop.id}>{crop.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#212121', marginBottom: '6px' }}>
                                        Quantity (Quintals) *
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity_quintals"
                                        value={formData.quantity_quintals}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                        step="0.01"
                                        placeholder="e.g., 50"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #c2c2c2',
                                            borderRadius: '2px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#212121', marginBottom: '16px' }}>
                                Location
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#212121', marginBottom: '6px' }}>
                                        State *
                                    </label>
                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #c2c2c2',
                                            borderRadius: '2px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="">Select state</option>
                                        {indianStates.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#212121', marginBottom: '6px' }}>
                                        District *
                                    </label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., Amritsar"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #c2c2c2',
                                            borderRadius: '2px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quality Parameters Section */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#212121', marginBottom: '16px' }}>
                                Quality Parameters (Optional)
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#212121', marginBottom: '6px' }}>
                                        Moisture Content (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="moisture_content"
                                        value={formData.moisture_content}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        placeholder="e.g., 13.5"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #c2c2c2',
                                            borderRadius: '2px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#212121', marginBottom: '6px' }}>
                                        Foreign Matter (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="foreign_matter"
                                        value={formData.foreign_matter}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        placeholder="e.g., 1.8"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #c2c2c2',
                                            borderRadius: '2px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* AI Price Recommendations Section */}
                        {showAI && (
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '16px'
                                }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#212121', margin: 0 }}>
                                        🤖 AI Price Recommendations
                                    </h3>
                                    <AIProviderSelector
                                        onProviderChange={setAiProvider}
                                        defaultProvider={aiProvider}
                                    />
                                </div>
                                <PriceAdvisor
                                    listingData={{
                                        crop_variety: cropVarieties.find(c => c.id === parseInt(formData.crop_variety_id))?.name || '',
                                        quantity_quintals: parseFloat(formData.quantity_quintals) || 0,
                                        district: formData.district,
                                        state: formData.state,
                                        moisture_content: formData.moisture_content ? parseFloat(formData.moisture_content) : null,
                                        foreign_matter: formData.foreign_matter ? parseFloat(formData.foreign_matter) : null,
                                        base_price: 2040 // Default MSP, can be fetched from crop variety
                                    }}
                                    provider={aiProvider}
                                    onPriceUpdate={(price) => {
                                        // Auto-fill the expected price with AI recommendation
                                        setFormData(prev => ({ ...prev, expected_price_per_quintal: price.toString() }));
                                    }}
                                />
                            </div>
                        )}

                        {/* Pricing Section */}
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#212121', marginBottom: '16px' }}>
                                Your Expected Price
                            </h3>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#212121', marginBottom: '6px' }}>
                                    Expected Price (₹/Quintal) *
                                </label>
                                <input
                                    type="number"
                                    name="expected_price_per_quintal"
                                    value={formData.expected_price_per_quintal}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    step="0.01"
                                    placeholder="e.g., 2100"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #c2c2c2',
                                        borderRadius: '2px',
                                        fontSize: '14px'
                                    }}
                                />
                                <p style={{ fontSize: '12px', color: '#878787', marginTop: '4px' }}>
                                    This is your asking price. You can accept bids at or above this price.
                                </p>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => navigate('/farmer/dashboard')}
                                style={{
                                    backgroundColor: '#fff',
                                    color: '#212121',
                                    padding: '12px 24px',
                                    border: '1px solid #c2c2c2',
                                    borderRadius: '2px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    backgroundColor: loading ? '#ccc' : '#ff9800',
                                    color: '#fff',
                                    padding: '12px 32px',
                                    border: 'none',
                                    borderRadius: '2px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? 'Creating...' : '✓ Create Listing'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
