import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        phone: '',
        role: 'FARMER',
        first_name: '',
        last_name: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password_confirm) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        const result = await register(formData);

        if (result.success) {
            if (result.user.role === 'FARMER') {
                navigate('/farmer/dashboard');
            } else {
                navigate('/buyer/dashboard');
            }
        } else {
            setError(JSON.stringify(result.error));
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f3f6' }}>
            {/* Header */}
            <header style={{ backgroundColor: '#2874f0', padding: '16px 0', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
                <div style={{ maxWidth: '1248px', margin: '0 auto', padding: '0 16px' }}>
                    <Link to="/" style={{ color: '#fff', fontSize: '24px', fontWeight: '700', textDecoration: 'none', fontStyle: 'italic' }}>
                        AgroBid
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 16px' }}>
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,.1)',
                    padding: '40px'
                }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#212121', marginBottom: '8px' }}>
                        Create Account
                    </h1>
                    <p style={{ fontSize: '14px', color: '#878787', marginBottom: '32px' }}>
                        Join AgroBid Exchange System
                    </p>

                    {error && (
                        <div style={{
                            backgroundColor: '#ff6161',
                            color: '#fff',
                            padding: '12px 16px',
                            borderRadius: '2px',
                            marginBottom: '16px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="First Name"
                                required
                                style={{
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '2px',
                                    outline: 'none'
                                }}
                            />
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="Last Name"
                                style={{
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '2px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Username"
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: '14px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '2px',
                                outline: 'none',
                                marginBottom: '16px'
                            }}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                required
                                style={{
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '2px',
                                    outline: 'none'
                                }}
                            />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Phone"
                                required
                                style={{
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '2px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: '14px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '2px',
                                outline: 'none',
                                marginBottom: '16px',
                                backgroundColor: '#fff'
                            }}
                        >
                            <option value="FARMER">Register as Farmer</option>
                            <option value="BUYER">Register as Buyer (Rice Mill)</option>
                        </select>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                required
                                minLength={8}
                                style={{
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '2px',
                                    outline: 'none'
                                }}
                            />
                            <input
                                type="password"
                                name="password_confirm"
                                value={formData.password_confirm}
                                onChange={handleChange}
                                placeholder="Confirm Password"
                                required
                                minLength={8}
                                style={{
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '2px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                backgroundColor: '#fb641b',
                                color: '#fff',
                                padding: '14px',
                                fontSize: '16px',
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '2px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,.2)',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <Link
                            to="/login"
                            style={{
                                color: '#2874f0',
                                fontSize: '14px',
                                fontWeight: '600',
                                textDecoration: 'none'
                            }}
                        >
                            Already have an account? Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
