import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

export default function CreateListingTest() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        crop_variety_name: '',
        quantity_quintals: '',
        expected_price_per_quintal: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        try {
            await api.post('/listings/', {
                ...formData,
                quantity_quintals: parseFloat(formData.quantity_quintals),
                expected_price_per_quintal: parseFloat(formData.expected_price_per_quintal),
                district: 'Test District',
                state: 'Test State'
            });
            navigate('/farmer/dashboard');
        } catch (err) {
            console.error('Error:', err);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f3f6', padding: '20px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', padding: '20px', borderRadius: '4px' }}>
                <h1>Create Listing - Simple Test</h1>
                <p>If you can see this, the route is working!</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Crop Variety:</label>
                        <input
                            type="text"
                            value={formData.crop_variety_name}
                            onChange={(e) => setFormData({ ...formData, crop_variety_name: e.target.value })}
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Quantity (quintals):</label>
                        <input
                            type="number"
                            value={formData.quantity_quintals}
                            onChange={(e) => setFormData({ ...formData, quantity_quintals: e.target.value })}
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Price per quintal:</label>
                        <input
                            type="number"
                            value={formData.expected_price_per_quintal}
                            onChange={(e) => setFormData({ ...formData, expected_price_per_quintal: e.target.value })}
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                    </div>

                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2874f0', color: '#fff', border: 'none', cursor: 'pointer' }}>
                        Submit
                    </button>
                    <button type="button" onClick={() => navigate('/farmer/dashboard')} style={{ padding: '10px 20px', marginLeft: '10px' }}>
                        Back
                    </button>
                </form>
            </div>
        </div>
    );
}
